import { FastifyInstance } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import prisma from '../utils/prisma.js';
import { uploadFile, BUCKETS } from '../utils/minio.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const createGarmentSchema = z.object({
  name: z.string(),
  category: z.enum(['TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORY']),
  color: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
});

export async function garmentsRoutes(fastify: FastifyInstance) {
  // Create garment with image upload
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create a new garment',
      tags: ['garments'],
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            color: { type: 'string' },
            brand: { type: 'string' },
            imageUrl: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { userId } = request.user as any;
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'Image file is required' });
      }

      const fileBuffer = await data.toBuffer();
      const fileName = `${randomUUID()}-${data.filename}`;
      const imageUrl = await uploadFile(
        BUCKETS.GARMENTS,
        fileName,
        fileBuffer,
        data.mimetype
      );

      // Parse fields from multipart data
      const fields = data.fields as any;
      const garmentData = createGarmentSchema.parse({
        name: (fields.name as any)?.value,
        category: (fields.category as any)?.value,
        color: (fields.color as any)?.value,
        brand: (fields.brand as any)?.value,
        description: (fields.description as any)?.value,
      });

      const garment = await prisma.garment.create({
        data: {
          ...garmentData,
          userId,
          imageUrl,
        },
      });

      reply.status(201).send(garment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      console.error('Error creating garment:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all garments for user
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get all garments for authenticated user',
      tags: ['garments'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              category: { type: 'string' },
              color: { type: 'string' },
              brand: { type: 'string' },
              imageUrl: { type: 'string' },
              description: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;
    const { category } = request.query as any;

    const garments = await prisma.garment.findMany({
      where: {
        userId,
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send(garments);
  });

  // Get single garment
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get a single garment by ID',
      tags: ['garments'],
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
            category: { type: 'string' },
            color: { type: 'string' },
            brand: { type: 'string' },
            imageUrl: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;
    const { id } = request.params as any;

    const garment = await prisma.garment.findFirst({
      where: { id, userId },
    });

    if (!garment) {
      return reply.status(404).send({ error: 'Garment not found' });
    }

    reply.send(garment);
  });

  // Delete garment
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Delete a garment',
      tags: ['garments'],
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

    const garment = await prisma.garment.findFirst({
      where: { id, userId },
    });

    if (!garment) {
      return reply.status(404).send({ error: 'Garment not found' });
    }

    await prisma.garment.delete({ where: { id } });

    reply.send({ message: 'Garment deleted successfully' });
  });
}
