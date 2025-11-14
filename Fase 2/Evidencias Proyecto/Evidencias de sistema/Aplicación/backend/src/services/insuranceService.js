import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export class InsuranceService {
  /**
   * Crear un nuevo seguro vehicular
   */
  static async createInsurance(userId, insuranceData) {
    try {
      const {
        vehicleId,
        compania,
        tipoCobertura,
        costo,
        deducible,
        fechaInicio,
        fechaFin
      } = insuranceData;

      // Convertir vehicleId a número
      const vehicleIdNum = parseInt(vehicleId);

      // Verificar que el vehículo existe y pertenece al usuario
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleIdNum,
          userId: userId
        }
      });

      if (!vehicle) {
        throw new Error('Vehículo no encontrado o no tienes permisos para agregar seguros');
      }

      // Validar fechas
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);

      if (endDate <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      // Crear el seguro
      const newInsurance = await prisma.vehicleInsurance.create({
        data: {
          vehicleId: vehicleIdNum,
          compania,
          tipoCobertura,
          costo: parseFloat(costo),
          deducible: parseFloat(deducible),
          fechaInicio: startDate,
          fechaFin: endDate
        },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Seguro vehicular registrado exitosamente',
        data: newInsurance
      };

    } catch (error) {
      throw new Error(error.message || 'Error al crear seguro vehicular');
    }
  }

  /**
   * Obtener todos los seguros de un vehículo
   */
  static async getInsurancesByVehicle(vehicleId, userId) {
    try {
      // Verificar que el vehículo pertenece al usuario
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId: userId
        }
      });

      if (!vehicle) {
        throw new Error('Vehículo no encontrado o no tienes permisos');
      }

      const insurances = await prisma.vehicleInsurance.findMany({
        where: { vehicleId },
        orderBy: { fechaInicio: 'desc' },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      });

      return {
        success: true,
        count: insurances.length,
        data: insurances
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener seguros');
    }
  }

  /**
   * Obtener un seguro específico por ID
   */
  static async getInsuranceById(insuranceId, userId) {
    try {
      const insurance = await prisma.vehicleInsurance.findFirst({
        where: { id: insuranceId },
        include: {
          vehicle: {
            select: {
              id: true,
              userId: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      });

      if (!insurance) {
        throw new Error('Seguro no encontrado');
      }

      // Verificar que el usuario es el dueño del vehículo
      if (insurance.vehicle.userId !== userId) {
        throw new Error('No tienes permisos para ver este seguro');
      }

      return {
        success: true,
        data: insurance
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener seguro');
    }
  }

  /**
   * Actualizar un seguro
   */
  static async updateInsurance(insuranceId, userId, updateData) {
    try {
      // Verificar que el seguro existe y pertenece al usuario
      const existingInsurance = await prisma.vehicleInsurance.findFirst({
        where: { id: insuranceId },
        include: {
          vehicle: {
            select: { userId: true }
          }
        }
      });

      if (!existingInsurance) {
        throw new Error('Seguro no encontrado');
      }

      if (existingInsurance.vehicle.userId !== userId) {
        throw new Error('No tienes permisos para actualizar este seguro');
      }

      // Preparar datos para actualizar
      const dataToUpdate = {};
      
      if (updateData.compania) dataToUpdate.compania = updateData.compania;
      if (updateData.tipoCobertura) dataToUpdate.tipoCobertura = updateData.tipoCobertura;
      if (updateData.costo !== undefined) dataToUpdate.costo = parseFloat(updateData.costo);
      if (updateData.deducible !== undefined) dataToUpdate.deducible = parseFloat(updateData.deducible);
      if (updateData.fechaInicio) dataToUpdate.fechaInicio = new Date(updateData.fechaInicio);
      if (updateData.fechaFin) dataToUpdate.fechaFin = new Date(updateData.fechaFin);

      // Validar fechas si se actualizan ambas
      if (dataToUpdate.fechaInicio && dataToUpdate.fechaFin) {
        if (dataToUpdate.fechaFin <= dataToUpdate.fechaInicio) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      // Actualizar el seguro
      const updatedInsurance = await prisma.vehicleInsurance.update({
        where: { id: insuranceId },
        data: dataToUpdate,
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Seguro actualizado exitosamente',
        data: updatedInsurance
      };

    } catch (error) {
      throw new Error(error.message || 'Error al actualizar seguro');
    }
  }

  /**
   * Eliminar un seguro
   */
  static async deleteInsurance(insuranceId, userId) {
    try {
      // Verificar que el seguro existe y pertenece al usuario
      const existingInsurance = await prisma.vehicleInsurance.findFirst({
        where: { id: insuranceId },
        include: {
          vehicle: {
            select: { userId: true }
          }
        }
      });

      if (!existingInsurance) {
        throw new Error('Seguro no encontrado');
      }

      if (existingInsurance.vehicle.userId !== userId) {
        throw new Error('No tienes permisos para eliminar este seguro');
      }

      // Eliminar el seguro
      await prisma.vehicleInsurance.delete({
        where: { id: insuranceId }
      });

      return {
        success: true,
        message: 'Seguro eliminado exitosamente'
      };

    } catch (error) {
      throw new Error(error.message || 'Error al eliminar seguro');
    }
  }

  /**
   * Obtener seguro activo de un vehículo
   */
  static async getActiveInsurance(vehicleId, userId) {
    try {
      // Verificar que el vehículo pertenece al usuario
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId: userId
        }
      });

      if (!vehicle) {
        throw new Error('Vehículo no encontrado o no tienes permisos');
      }

      const today = new Date();

      const activeInsurance = await prisma.vehicleInsurance.findFirst({
        where: {
          vehicleId,
          fechaInicio: { lte: today },
          fechaFin: { gte: today }
        },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      });

      return {
        success: true,
        data: activeInsurance
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener seguro activo');
    }
  }
}
