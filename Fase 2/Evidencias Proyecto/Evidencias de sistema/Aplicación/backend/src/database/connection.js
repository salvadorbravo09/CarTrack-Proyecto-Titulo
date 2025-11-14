import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Para debugging
});

// Manejar la desconexión
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
