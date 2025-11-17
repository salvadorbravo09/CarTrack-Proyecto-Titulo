import prisma from '../database/connection.js';

class FuelService {
  
  async createFuelRefill(data, userId) {
    // Verificar que el vehículo pertenezca al usuario
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado o no pertenece al usuario');
    }

    // Obtener el registro más reciente de combustible para este vehículo
    const mostRecentFuel = await prisma.fuelRefill.findFirst({
      where: {
        vehicleId: data.vehicleId,
        deletedAt: null
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Crear la recarga de combustible
    const fuelRefill = await prisma.fuelRefill.create({
      data: {
        vehicleId: data.vehicleId,
        date: new Date(data.date),
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        totalCost: data.totalCost,
        station: data.station,
        currentKm: data.currentKm,
        notes: data.notes
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            licensePlate: true,
            currentKm: true
          }
        }
      }
    });

    // Actualizar el kilometraje del vehículo solo si:
    // 1. El nuevo kilometraje es mayor al actual Y
    // 2. La fecha del nuevo registro es mayor o igual a la fecha del registro más reciente (o no hay registros previos)
    const newDate = new Date(data.date);
    const shouldUpdateKm = data.currentKm > vehicle.currentKm && 
                           (!mostRecentFuel || newDate >= mostRecentFuel.date);

    if (shouldUpdateKm) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentKm: data.currentKm }
      });
    }

    return fuelRefill;
  }

  async getFuelRefillsByVehicle(vehicleId, userId) {
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

    const fuelRefills = await prisma.fuelRefill.findMany({
      where: {
        vehicleId: vehicleId,
        deletedAt: null
      },
      include: {
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

    return fuelRefills;
  }

  async getAllFuelRefills(userId) {
    const fuelRefills = await prisma.fuelRefill.findMany({
      where: {
        vehicle: {
          userId: userId
        },
        deletedAt: null
      },
      include: {
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

    return fuelRefills;
  }

  async getFuelRefillById(id, userId) {
    const fuelRefill = await prisma.fuelRefill.findFirst({
      where: {
        id: id,
        vehicle: {
          userId: userId
        },
        deletedAt: null
      },
      include: {
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

    if (!fuelRefill) {
      throw new Error('Recarga de combustible no encontrada');
    }

    return fuelRefill;
  }

  async updateFuelRefill(id, data, userId) {
    // Verificar que la recarga exista y pertenezca a un vehículo del usuario
    const existingFuelRefill = await prisma.fuelRefill.findFirst({
      where: {
        id: id,
        vehicle: {
          userId: userId
        },
        deletedAt: null
      }
    });

    if (!existingFuelRefill) {
      throw new Error('Recarga de combustible no encontrada');
    }

    const fuelRefill = await prisma.fuelRefill.update({
      where: { id: id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        totalCost: data.totalCost,
        station: data.station,
        currentKm: data.currentKm,
        notes: data.notes
      },
      include: {
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

    return fuelRefill;
  }

  async deleteFuelRefill(id, userId) {
    // Verificar que la recarga exista y pertenezca a un vehículo del usuario
    const existingFuelRefill = await prisma.fuelRefill.findFirst({
      where: {
        id: id,
        vehicle: {
          userId: userId
        },
        deletedAt: null
      }
    });

    if (!existingFuelRefill) {
      throw new Error('Recarga de combustible no encontrada');
    }

    await prisma.fuelRefill.update({
      where: { id: id },
      data: {
        deletedAt: new Date()
      }
    });

    return { message: 'Recarga de combustible eliminada correctamente' };
  }

  async getFuelStats(userId, vehicleId = null) {
    const whereClause = {
      vehicle: {
        userId: userId
      },
      deletedAt: null
    };

    if (vehicleId) {
      whereClause.vehicleId = vehicleId;
    }

    const stats = await prisma.fuelRefill.aggregate({
      where: whereClause,
      _count: {
        id: true
      },
      _sum: {
        liters: true,
        totalCost: true
      },
      _avg: {
        pricePerLiter: true
      }
    });

    return {
      totalRefills: stats._count.id || 0,
      totalLiters: stats._sum.liters || 0,
      totalCost: stats._sum.totalCost || 0,
      averagePricePerLiter: stats._avg.pricePerLiter || 0
    };
  }
}

export default new FuelService();
