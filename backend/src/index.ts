import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.js';
import { garmentsRoutes } from './routes/garments.js';
import { outfitsRoutes } from './routes/outfits.js';
import { bodyImagesRoutes } from './routes/body-images.js';
import { tryOnsRoutes } from './routes/try-ons.js';
import { authenticate } from './middleware/auth.js';
import { initializeMinIO } from './utils/minio.js';
import prisma from './utils/prisma.js';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Register Swagger
await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Virtual Closet API',
      description: 'API for Virtual Closet application with AI try-on',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

// Decorate fastify with authenticate method
fastify.decorate('authenticate', authenticate);

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(garmentsRoutes, { prefix: '/api/garments' });
await fastify.register(outfitsRoutes, { prefix: '/api/outfits' });
await fastify.register(bodyImagesRoutes, { prefix: '/api/body-images' });
await fastify.register(tryOnsRoutes, { prefix: '/api/try-ons' });

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Initialize MinIO
async function initializeServices() {
  try {
    await initializeMinIO();
    console.log('MinIO initialized successfully');
  } catch (error) {
    console.error('Error initializing MinIO:', error);
  }
}

// Start server
const start = async () => {
  try {
    await initializeServices();
    
    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Swagger documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
