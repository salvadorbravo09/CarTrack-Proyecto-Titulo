import prisma from '../database/connection.js';

export class SoapService {
  /**
   * Crear un nuevo SOAP
   */
  static async createSoap(userId, soapData) {
    const { vehicleId, compania, lugarCompra, numeroPoliza, fechaVigencia } = soapData;

    // Verificar que el vehículo existe y pertenece al usuario
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: parseInt(vehicleId),
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado o no tienes acceso a él');
    }

    // Crear el SOAP
    const soap = await prisma.soap.create({
      data: {
        vehicleId: parseInt(vehicleId),
        compania,
        lugarCompra,
        numeroPoliza,
        fechaVigencia: new Date(fechaVigencia)
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

    return soap;
  }

  /**
   * Obtener todos los SOAPs de un vehículo
   */
  static async getSoapsByVehicle(userId, vehicleId) {
    // Verificar que el vehículo pertenece al usuario
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado o no tienes acceso a él');
    }

    const soaps = await prisma.soap.findMany({
      where: { vehicleId },
      orderBy: { fechaVigencia: 'desc' },
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

    return soaps;
  }

  /**
   * Obtener SOAP activo de un vehículo
   */
  static async getActiveSoap(userId, vehicleId) {
    // Verificar que el vehículo pertenece al usuario
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: userId
      }
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado o no tienes acceso a él');
    }

    const now = new Date();
    
    const activeSoap = await prisma.soap.findFirst({
      where: {
        vehicleId,
        fechaVigencia: {
          gte: now
        }
      },
      orderBy: { fechaVigencia: 'desc' },
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

    return activeSoap;
  }

  /**
   * Obtener un SOAP por ID
   */
  static async getSoapById(userId, soapId) {
    const soap = await prisma.soap.findUnique({
      where: { id: soapId },
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

    if (!soap) {
      throw new Error('SOAP no encontrado');
    }

    // Verificar que el usuario tiene acceso
    if (soap.vehicle.userId !== userId) {
      throw new Error('No tienes acceso a este SOAP');
    }

    return soap;
  }

  /**
   * Actualizar un SOAP
   */
  static async updateSoap(userId, soapId, updateData) {
    // Verificar que el SOAP existe y el usuario tiene acceso
    const existingSoap = await this.getSoapById(userId, soapId);

    const { compania, lugarCompra, numeroPoliza, fechaVigencia } = updateData;

    const soap = await prisma.soap.update({
      where: { id: soapId },
      data: {
        ...(compania && { compania }),
        ...(lugarCompra && { lugarCompra }),
        ...(numeroPoliza && { numeroPoliza }),
        ...(fechaVigencia && { fechaVigencia: new Date(fechaVigencia) })
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

    return soap;
  }

  /**
   * Eliminar un SOAP
   */
  static async deleteSoap(userId, soapId) {
    // Verificar que el SOAP existe y el usuario tiene acceso
    await this.getSoapById(userId, soapId);

    await prisma.soap.delete({
      where: { id: soapId }
    });

    return { message: 'SOAP eliminado correctamente' };
  }
}
