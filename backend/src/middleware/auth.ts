import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export async function authenticate(
  request: AuthRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}
