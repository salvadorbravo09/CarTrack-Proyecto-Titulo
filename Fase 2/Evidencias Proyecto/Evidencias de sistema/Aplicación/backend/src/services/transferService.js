import { PrismaClient } from '../generated/prisma/index.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class TransferService {
  /**
   * Iniciar una transferencia de vehículo
   */
  static async initiateTransfer(vehicleId, originUserId, transferEmail, message) {
    try {
      // Verificar que el vehículo existe y pertenece al usuario
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId: originUserId,
          status: 'ACTIVE'
        }
      });

      if (!vehicle) {
        throw new Error('Vehículo no encontrado o no tienes permisos para transferirlo');
      }

      // Verificar que el usuario destino existe
      const destinationUser = await prisma.user.findUnique({
        where: { email: transferEmail }
      });

      if (!destinationUser) {
        throw new Error('Usuario destino no encontrado');
      }

      if (destinationUser.id === originUserId) {
        throw new Error('No puedes transferir un vehículo a ti mismo');
      }

      // Verificar si ya existe una transferencia pendiente para este vehículo
      const existingTransfer = await prisma.vehicleTransfer.findFirst({
        where: {
          vehicleId,
          status: 'pending'
        }
      });

      if (existingTransfer) {
        throw new Error('Ya existe una transferencia pendiente para este vehículo');
      }

      // Generar código único de transferencia
      const transferCode = crypto.randomBytes(16).toString('hex');

      // Crear la transferencia con expiración de 7 días
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const transfer = await prisma.vehicleTransfer.create({
        data: {
          vehicleId,
          originUserId,
          destinationUserId: destinationUser.id,
          transferEmail,
          transferCode,
          status: 'pending',
          message: message || null,
          expiresAt
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
          },
          originUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          destinationUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return transfer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Aceptar una transferencia
   */
  static async acceptTransfer(transferCode, userId) {
    try {
      // Buscar la transferencia
      const transfer = await prisma.vehicleTransfer.findUnique({
        where: { transferCode },
        include: {
          vehicle: true
        }
      });

      if (!transfer) {
        throw new Error('Transferencia no encontrada');
      }

      // Verificar que el usuario es el destinatario
      if (transfer.destinationUserId !== userId) {
        throw new Error('No tienes permisos para aceptar esta transferencia');
      }

      // Verificar estado y expiración
      if (transfer.status !== 'pending') {
        throw new Error('Esta transferencia ya ha sido procesada');
      }

      if (new Date() > transfer.expiresAt) {
        // Marcar como expirada
        await prisma.vehicleTransfer.update({
          where: { id: transfer.id },
          data: { status: 'expired' }
        });
        throw new Error('Esta transferencia ha expirado');
      }

      // Realizar la transferencia en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Actualizar el propietario del vehículo
        const updatedVehicle = await tx.vehicle.update({
          where: { id: transfer.vehicleId },
          data: { userId: transfer.destinationUserId }
        });

        // Marcar la transferencia como aceptada
        const updatedTransfer = await tx.vehicleTransfer.update({
          where: { id: transfer.id },
          data: { status: 'accepted' },
          include: {
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                year: true,
                licensePlate: true
              }
            },
            originUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            destinationUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });

        return updatedTransfer;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rechazar una transferencia
   */
  static async rejectTransfer(transferCode, userId) {
    try {
      // Buscar la transferencia
      const transfer = await prisma.vehicleTransfer.findUnique({
        where: { transferCode }
      });

      if (!transfer) {
        throw new Error('Transferencia no encontrada');
      }

      // Verificar que el usuario es el destinatario
      if (transfer.destinationUserId !== userId) {
        throw new Error('No tienes permisos para rechazar esta transferencia');
      }

      // Verificar estado
      if (transfer.status !== 'pending') {
        throw new Error('Esta transferencia ya ha sido procesada');
      }

      // Marcar como rechazada
      const updatedTransfer = await prisma.vehicleTransfer.update({
        where: { id: transfer.id },
        data: { status: 'rejected' },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          },
          originUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          destinationUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return updatedTransfer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar una transferencia (por el usuario origen)
   */
  static async cancelTransfer(transferId, userId) {
    try {
      // Buscar la transferencia
      const transfer = await prisma.vehicleTransfer.findUnique({
        where: { id: transferId }
      });

      if (!transfer) {
        throw new Error('Transferencia no encontrada');
      }

      // Verificar que el usuario es el origen
      if (transfer.originUserId !== userId) {
        throw new Error('No tienes permisos para cancelar esta transferencia');
      }

      // Verificar estado
      if (transfer.status !== 'pending') {
        throw new Error('Esta transferencia ya ha sido procesada');
      }

      // Marcar como cancelada
      const updatedTransfer = await prisma.vehicleTransfer.update({
        where: { id: transfer.id },
        data: { status: 'cancelled' },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          },
          originUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          destinationUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return updatedTransfer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener transferencias enviadas por un usuario
   */
  static async getSentTransfers(userId) {
    try {
      const transfers = await prisma.vehicleTransfer.findMany({
        where: { originUserId: userId },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
              color: true
            }
          },
          destinationUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return transfers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener transferencias recibidas por un usuario
   */
  static async getReceivedTransfers(userId) {
    try {
      const transfers = await prisma.vehicleTransfer.findMany({
        where: { destinationUserId: userId },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
              color: true
            }
          },
          originUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return transfers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener detalles de una transferencia por código
   */
  static async getTransferByCode(transferCode) {
    try {
      const transfer = await prisma.vehicleTransfer.findUnique({
        where: { transferCode },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
              color: true,
              currentKm: true,
              condition: true
            }
          },
          originUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          destinationUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!transfer) {
        throw new Error('Transferencia no encontrada');
      }

      return transfer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar y actualizar transferencias expiradas
   */
  static async checkExpiredTransfers() {
    try {
      const now = new Date();
      
      const expiredTransfers = await prisma.vehicleTransfer.updateMany({
        where: {
          status: 'pending',
          expiresAt: {
            lt: now
          }
        },
        data: {
          status: 'expired'
        }
      });

      return expiredTransfers;
    } catch (error) {
      throw error;
    }
  }
}
