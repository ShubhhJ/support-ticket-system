import { prisma } from '../config/prisma.js';

export async function listAgents() {
  return prisma.agent.findMany({ orderBy: { name: 'asc' } });
}
