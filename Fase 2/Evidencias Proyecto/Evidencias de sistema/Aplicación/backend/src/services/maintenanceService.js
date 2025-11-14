import prisma from '../database/connection.js';

class MaintenanceService {
  
  async createMaintenance(data, userId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado o no pertenece al usuario');
    }

    // Crear el mantenimiento
    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId: data.vehicleId,
        maintenanceTypeId: data.maintenanceTypeId,
        date: new Date(data.date),
        description: data.description,
        workshopName: data.workshopName,
        cost: data.cost,
        mileage: data.mileage,
        observations: data.observations,
        status: data.status || 'completado'
      },
      include: {
        maintenanceType: true,
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      }
    });

    return maintenance;
  }

  async getMaintenancesByVehicle(vehicleId, userId) {
    // Verificar que el vehículo pertenezca al usuario
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado o no pertenece al usuario');
    }

    const maintenances = await prisma.maintenance.findMany({
      where: {
        vehicleId: vehicleId,
        deletedAt: null
      },
      include: {
        maintenanceType: true,
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return maintenances;
  }

  async getAllMaintenances(userId) {
    const maintenances = await prisma.maintenance.findMany({
      where: {
        vehicle: {
          userId: userId
        },
        deletedAt: null
      },
      include: {
        maintenanceType: true,
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return maintenances;
  }

  async getMaintenanceById(id, userId) {
    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id: id,
        vehicle: {
          userId: userId
        },
        deletedAt: null
      },
      include: {
        maintenanceType: true,
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      }
    });

    if (!maintenance) {
      throw new Error('Mantenimiento no encontrado');
    }

    return maintenance;
  }

  async updateMaintenance(id, data, userId) {
    // Verificar que el mantenimiento exista y pertenezca a un vehículo del usuario
    const existingMaintenance = await prisma.maintenance.findFirst({
      where: {
        id: id,
        vehicle: {
          userId: userId
        },
        deletedAt: null
      }
    });

    if (!existingMaintenance) {
      throw new Error('Mantenimiento no encontrado');
    }

    const maintenance = await prisma.maintenance.update({
      where: { id: id },
      data: {
        maintenanceTypeId: data.maintenanceTypeId,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        workshopName: data.workshopName,
        cost: data.cost,
        mileage: data.mileage,
        observations: data.observations,
        status: data.status
      },
      include: {
        maintenanceType: true,
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      }
    });

    return maintenance;
  }

  async deleteMaintenance(id, userId) {
    // Verificar que el mantenimiento exista y pertenezca a un vehículo del usuario
    const existingMaintenance = await prisma.maintenance.findFirst({
      where: {
        id: id,
        vehicle: {
          userId: userId
        },
        deletedAt: null
      }
    });

    if (!existingMaintenance) {
      throw new Error('Mantenimiento no encontrado');
    }

    await prisma.maintenance.update({
      where: { id: id },
      data: {
        deletedAt: new Date()
      }
    });

    return { message: 'Mantenimiento eliminado correctamente' };
  }

  async getMaintenanceTypes() {
    const types = await prisma.maintenanceType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return types;
  }

  async createMaintenanceType(data) {
    const type = await prisma.maintenanceType.create({
      data: {
        name: data.name,
        description: data.description
      }
    });

    return type;
  }

  async getMaintenanceStats(userId) {
    const stats = await prisma.maintenance.groupBy({
      by: ['maintenanceTypeId'],
      where: {
        vehicle: {
          userId: userId
        },
        deletedAt: null
      },
      _count: {
        id: true
      },
      _sum: {
        cost: true
      }
    });

    // Obtener información de los tipos de mantenimiento
    const enrichedStats = await Promise.all(
      stats.map(async (stat) => {
        const type = await prisma.maintenanceType.findUnique({
          where: { id: stat.maintenanceTypeId }
        });
        return {
          type: type.name,
          count: stat._count.id,
          totalCost: stat._sum.cost || 0
        };
      })
    );

    return enrichedStats;
  }
}

export default new MaintenanceService();
