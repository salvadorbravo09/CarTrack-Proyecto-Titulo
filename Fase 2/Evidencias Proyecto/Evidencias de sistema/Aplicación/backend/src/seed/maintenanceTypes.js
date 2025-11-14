import prisma from '../database/connection.js';

const maintenanceTypes = [
  {
    name: 'Cambio de aceite',
    description: 'Cambio de aceite del motor y filtro'
  },
  {
    name: 'Revisión técnica',
    description: 'Revisión técnica obligatoria del vehículo'
  },
  {
    name: 'Cambio de neumáticos',
    description: 'Cambio o rotación de neumáticos'
  },
  {
    name: 'Frenos',
    description: 'Revisión y cambio de pastillas de freno'
  },
  {
    name: 'Batería',
    description: 'Cambio o mantenimiento de batería'
  },
  {
    name: 'Alineación y balanceo',
    description: 'Alineación y balanceo de ruedas'
  },
  {
    name: 'Cambio de filtros',
    description: 'Cambio de filtros (aire, combustible, polen)'
  },
  {
    name: 'Sistema de refrigeración',
    description: 'Mantenimiento del sistema de refrigeración'
  },
  {
    name: 'Transmisión',
    description: 'Mantenimiento de la transmisión'
  },
  {
    name: 'Suspensión',
    description: 'Revisión y mantenimiento de suspensión'
  },
  {
    name: 'Sistema eléctrico',
    description: 'Revisión del sistema eléctrico'
  },
  {
    name: 'Lavado y detallado',
    description: 'Lavado completo y detallado del vehículo'
  },
  {
    name: 'Reparación general',
    description: 'Reparación general del vehículo'
  }
];

async function seedMaintenanceTypes() {
  try {

    for (const type of maintenanceTypes) {
      const existing = await prisma.maintenanceType.findFirst({
        where: { name: type.name }
      });

      if (!existing) {
        await prisma.maintenanceType.create({
          data: type
        });
      } else {
        console.log(`Tipo ya existe: ${type.name}`);
      }
    }

  } catch (error) {
    console.error('Error al ejecutar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
seedMaintenanceTypes();
