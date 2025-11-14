import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export class VehicleService {
  // Crear un nuevo vehículo
  static async createVehicle(userId, vehicleData) {
    try {
      const {
        brand,
        model,
        year,
        licensePlate,
        color,
        engine,
        currentKm = 0,
        condition = 'USED',
        purchaseDate,
        purchasePrice,
        notes
      } = vehicleData;

      // Validar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si la patente ya existe
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { licensePlate }
      });

      if (existingVehicle) {
        throw new Error('Ya existe un vehículo registrado con esta patente');
      }

      // Normalizar el valor de condition
      let normalizedCondition = 'USED'; // Por defecto
      if (condition) {
        const conditionLower = condition.toLowerCase();
        if (conditionLower === 'nuevo' || conditionLower === 'new') {
          normalizedCondition = 'NEW';
        } else if (conditionLower === 'usado' || conditionLower === 'used') {
          normalizedCondition = 'USED';
        }
      }

      // Crear el vehículo
      const newVehicle = await prisma.vehicle.create({
        data: {
          userId,
          brand,
          model,
          year: parseInt(year),
          licensePlate: licensePlate.toUpperCase(),
          color,
          engine,
          currentKm: parseInt(currentKm),
          condition: normalizedCondition,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          notes,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Vehículo registrado exitosamente',
        vehicle: newVehicle
      };

    } catch (error) {
      throw new Error(error.message || 'Error al crear vehículo');
    }
  }

  // Obtener todos los vehículos de un usuario
  static async getVehiclesByUserId(userId) {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { 
          userId,
          status: {
            not: 'SOLD'
          }
        },
        
        include: {
          seguros: true,  // Incluye la relación de seguros
          soaps: true     // Incluye la relación de soaps 
        },
     
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        count: vehicles.length,
        vehicles
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener vehículos');
    }
  }

  // Obtener un vehículo por ID
  static async getVehicleById(vehicleId, userId) {
    try {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId // Asegurar que el vehículo pertenece al usuario
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }

      return {
        success: true,
        vehicle
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener vehículo');
    }
  }

  // Actualizar un vehículo
  static async updateVehicle(vehicleId, userId, updateData) {
    try {
      // Verificar que el vehículo existe y pertenece al usuario
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId
        }
      });

      if (!existingVehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Si se está actualizando la patente, verificar que no exista otra con el mismo valor
      if (updateData.licensePlate && updateData.licensePlate !== existingVehicle.licensePlate) {
        const duplicatePlate = await prisma.vehicle.findFirst({
          where: {
            licensePlate: updateData.licensePlate.toUpperCase(),
            id: {
              not: vehicleId
            }
          }
        });

        if (duplicatePlate) {
          throw new Error('Ya existe otro vehículo con esta patente');
        }
      }

      // Preparar datos para actualizar
      const dataToUpdate = {};
      
      if (updateData.brand) dataToUpdate.brand = updateData.brand;
      if (updateData.model) dataToUpdate.model = updateData.model;
      if (updateData.year) dataToUpdate.year = parseInt(updateData.year);
      if (updateData.licensePlate) dataToUpdate.licensePlate = updateData.licensePlate.toUpperCase();
      if (updateData.color) dataToUpdate.color = updateData.color;
      if (updateData.engine) dataToUpdate.engine = updateData.engine;
      if (updateData.currentKm !== undefined) dataToUpdate.currentKm = parseInt(updateData.currentKm);
      
      // Normalizar condition
      if (updateData.condition) {
        const conditionLower = updateData.condition.toLowerCase();
        if (conditionLower === 'nuevo' || conditionLower === 'new') {
          dataToUpdate.condition = 'NEW';
        } else if (conditionLower === 'usado' || conditionLower === 'used') {
          dataToUpdate.condition = 'USED';
        }
      }
      
      if (updateData.purchaseDate !== undefined) {
        dataToUpdate.purchaseDate = updateData.purchaseDate ? new Date(updateData.purchaseDate) : null;
      }
      if (updateData.purchasePrice !== undefined) {
        dataToUpdate.purchasePrice = updateData.purchasePrice ? parseFloat(updateData.purchasePrice) : null;
      }
      
      // Normalizar status
      if (updateData.status) {
        const statusUpper = updateData.status.toUpperCase();
        if (['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD'].includes(statusUpper)) {
          dataToUpdate.status = statusUpper;
        }
      }
      
      if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

      // Actualizar el vehículo
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: dataToUpdate,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Vehículo actualizado exitosamente',
        vehicle: updatedVehicle
      };

    } catch (error) {
      throw new Error(error.message || 'Error al actualizar vehículo');
    }
  }

  // Eliminar un vehículo (soft delete - cambiar status a SOLD)
  static async deleteVehicle(vehicleId, userId) {
    try {
      // Verificar que el vehículo existe y pertenece al usuario
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId
        }
      });

      if (!existingVehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Cambiar el estado a SOLD (soft delete)
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: 'SOLD'
        }
      });

      return {
        success: true,
        message: 'Vehículo eliminado exitosamente'
      };

    } catch (error) {
      throw new Error(error.message || 'Error al eliminar vehículo');
    }
  }

  // Actualizar kilometraje de un vehículo
  static async updateKilometers(vehicleId, userId, currentKm) {
    try {
      // Verificar que el vehículo existe y pertenece al usuario
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId
        }
      });

      if (!existingVehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Validar que el nuevo kilometraje sea mayor al actual
      if (parseInt(currentKm) < existingVehicle.currentKm) {
        throw new Error('El nuevo kilometraje debe ser mayor o igual al actual');
      }

      // Actualizar el kilometraje
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          currentKm: parseInt(currentKm)
        }
      });

      return {
        success: true,
        message: 'Kilometraje actualizado exitosamente',
        vehicle: updatedVehicle
      };

    } catch (error) {
      throw new Error(error.message || 'Error al actualizar kilometraje');
    }
  }

  // Obtener estadísticas de vehículos del usuario
  static async getVehicleStats(userId) {
    try {
      const totalVehicles = await prisma.vehicle.count({
        where: {
          userId,
          status: {
            not: 'SOLD'
          }
        }
      });

      const totalInvestment = await prisma.vehicle.aggregate({
        where: {
          userId,
          status: {
            not: 'SOLD'
          }
        },
        _sum: {
          purchasePrice: true
        }
      });

      return {
        success: true,
        stats: {
          totalVehicles,
          totalInvestment: totalInvestment._sum.purchasePrice || 0
        }
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  }
}
