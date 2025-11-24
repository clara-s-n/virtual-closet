import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma.js';
import { uploadFile, BUCKETS } from '../utils/minio.js';
import { randomUUID } from 'crypto';

export async function bodyImagesRoutes(fastify: FastifyInstance) {
  // Upload body image
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Upload a body image',
      tags: ['body-images'],
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            imageUrl: { type: 'string' },
            createdAt: { type: 'string' },
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
        BUCKETS.BODY_IMAGES,
        fileName,
        fileBuffer,
        data.mimetype
      );

      const bodyImage = await prisma.bodyImage.create({
        data: {
          userId,
          imageUrl,
        },
      });

      reply.status(201).send(bodyImage);
    } catch (error) {
      console.error('Error uploading body image:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all body images for user
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get all body images for authenticated user',
      tags: ['body-images'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              imageUrl: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { userId } = request.user as any;

    const bodyImages = await prisma.bodyImage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    reply.send(bodyImages);
  });

  // Delete body image
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Delete a body image',
      tags: ['body-images'],
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

    const bodyImage = await prisma.bodyImage.findFirst({
      where: { id, userId },
    });

    if (!bodyImage) {
      return reply.status(404).send({ error: 'Body image not found' });
    }

    await prisma.bodyImage.delete({ where: { id } });

    reply.send({ message: 'Body image deleted successfully' });
  });
}
