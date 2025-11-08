import { PrismaClient } from '../src/generated/prisma/index.js';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@cartrack.com' }
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Rol actualizado a ADMIN');
      } else {
        console.log('⚠️  Admin ya existe');
      }
      return;
    }

    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@cartrack.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'CarTrack',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin creado:', admin.email);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
