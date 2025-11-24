import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const createTryOnSchema = z.object({
  bodyImageId: z.string(),
  outfitId: z.string().optional(),
  garmentIds: z.array(z.string()).optional(),
});

export async function tryOnsRoutes(fastify: FastifyInstance) {
  // Create try-on request
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create a new try-on request',
      tags: ['try-ons'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['bodyImageId'],
        properties: {
          bodyImageId: { type: 'string' },
          outfitId: { type: 'string' },
          garmentIds: { type: 'array', items: { type: 'string' } },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bodyImageId: { type: 'string' },
            outfitId: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;
      const { bodyImageId, outfitId, garmentIds } = createTryOnSchema.parse(request.body);

      // Verify body image belongs to user
      const bodyImage = await prisma.bodyImage.findFirst({
        where: { id: bodyImageId, userId },
      });

      if (!bodyImage) {
        return reply.status(404).send({ error: 'Body image not found' });
      }

      // If outfit ID provided, verify it belongs to user
      if (outfitId) {
        const outfit = await prisma.outfit.findFirst({
          where: { id: outfitId, userId },
        });

        if (!outfit) {
          return reply.status(404).send({ error: 'Outfit not found' });
        }
      }

      // Create try-on request
      const tryOn = await prisma.tryOn.create({
        data: {
          userId,
          bodyImageId,
          outfitId,
          status: 'PENDING',
          ...(garmentIds && {
            garments: {
              create: garmentIds.map(garmentId => ({
                garmentId,
              })),
            },
          }),
        },
        include: {
          garments: {
            include: {
              garment: true,
            },
          },
        },
      });

      // Call AI service asynchronously (in a real app, this would be a queue/webhook)
      processTryOn(tryOn.id).catch(err => console.error('Error processing try-on:', err));

      reply.status(201).send(tryOn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      console.error('Error creating try-on:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all try-ons for user
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get all try-ons for authenticated user',
      tags: ['try-ons'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              bodyImageId: { type: 'string' },
              outfitId: { type: 'string' },
              status: { type: 'string' },
              resultUrl: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;

    const tryOns = await prisma.tryOn.findMany({
      where: { userId },
      include: {
        bodyImage: true,
        outfit: true,
        garments: {
          include: {
            garment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send(tryOns);
  });

  // Get single try-on
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get a single try-on by ID',
      tags: ['try-ons'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bodyImageId: { type: 'string' },
            outfitId: { type: 'string' },
            status: { type: 'string' },
            resultUrl: { type: 'string' },
            bodyImage: { type: 'object' },
            outfit: { type: 'object' },
            garments: { type: 'array' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;
    const { id } = request.params as any;

    const tryOn = await prisma.tryOn.findFirst({
      where: { id, userId },
      include: {
        bodyImage: true,
        outfit: true,
        garments: {
          include: {
            garment: true,
          },
        },
      },
    });

    if (!tryOn) {
      return reply.status(404).send({ error: 'Try-on not found' });
    }

    reply.send(tryOn);
  });
}

// Placeholder function to process try-on with AI service
async function processTryOn(tryOnId: string) {
  try {
    // Update status to processing
    await prisma.tryOn.update({
      where: { id: tryOnId },
      data: { status: 'PROCESSING' },
    });

    // In a real implementation, this would call the AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:5000';
    
    // Simulate AI processing
    const response = await fetch(`${aiServiceUrl}/try-on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tryOnId }),
    });

    if (response.ok) {
      const result = await response.json();
      await prisma.tryOn.update({
        where: { id: tryOnId },
        data: {
          status: 'COMPLETED',
          resultUrl: result.resultUrl,
        },
      });
    } else {
      throw new Error('AI service returned error');
    }
  } catch (error) {
    console.error('Error processing try-on:', error);
    await prisma.tryOn.update({
      where: { id: tryOnId },
      data: { status: 'FAILED' },
    });
  }
}
