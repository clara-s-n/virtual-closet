import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const createOutfitSchema = z.object({
  name: z.string(),
  garmentIds: z.array(z.string()),
});

export async function outfitsRoutes(fastify: FastifyInstance) {
  // Create outfit
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create a new outfit',
      tags: ['outfits'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'garmentIds'],
        properties: {
          name: { type: 'string' },
          garmentIds: { type: 'array', items: { type: 'string' } },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            garments: { type: 'array' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;
      const { name, garmentIds } = createOutfitSchema.parse(request.body);

      // Verify all garments belong to user
      const garments = await prisma.garment.findMany({
        where: {
          id: { in: garmentIds },
          userId,
        },
      });

      if (garments.length !== garmentIds.length) {
        return reply.status(400).send({ error: 'Some garments not found or not owned by user' });
      }

      const outfit = await prisma.outfit.create({
        data: {
          name,
          userId,
          garments: {
            create: garmentIds.map(garmentId => ({
              garmentId,
            })),
          },
        },
        include: {
          garments: {
            include: {
              garment: true,
            },
          },
        },
      });

      reply.status(201).send(outfit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all outfits for user
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get all outfits for authenticated user',
      tags: ['outfits'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              garments: { type: 'array' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;

    const outfits = await prisma.outfit.findMany({
      where: { userId },
      include: {
        garments: {
          include: {
            garment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send(outfits);
  });

  // Get single outfit
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get a single outfit by ID',
      tags: ['outfits'],
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
            name: { type: 'string' },
            garments: { type: 'array' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;
    const { id } = request.params as any;

    const outfit = await prisma.outfit.findFirst({
      where: { id, userId },
      include: {
        garments: {
          include: {
            garment: true,
          },
        },
      },
    });

    if (!outfit) {
      return reply.status(404).send({ error: 'Outfit not found' });
    }

    reply.send(outfit);
  });

  // Delete outfit
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Delete an outfit',
      tags: ['outfits'],
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
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;
    const { id } = request.params as any;

    const outfit = await prisma.outfit.findFirst({
      where: { id, userId },
    });

    if (!outfit) {
      return reply.status(404).send({ error: 'Outfit not found' });
    }

    await prisma.outfit.delete({ where: { id } });

    reply.send({ message: 'Outfit deleted successfully' });
  });
}
