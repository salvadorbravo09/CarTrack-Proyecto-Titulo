import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Obtener todos los usuarios (solo para admin)
   */
  static async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vehicles: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        count: users.length,
        users
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  }

  /**
   * Obtener un usuario por ID (solo para admin)
   */
  static async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          vehicles: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
              status: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        user
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuario');
    }
  }

  /**
   * Activar/Desactivar usuario (solo para admin)
   */
  static async toggleUserStatus(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });

      return {
        success: true,
        message: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`,
        user: updatedUser
      };

    } catch (error) {
      throw new Error(error.message || 'Error al cambiar estado del usuario');
    }
  }

  /**
   * Obtener estadísticas de usuarios (solo para admin)
   */
  static async getUserStats() {
    try {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { isActive: true } });
      const inactiveUsers = totalUsers - activeUsers;

      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true
        }
      });

      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      return {
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
          }, {}),
          recentUsers
        }
      };

    } catch (error) {
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  }
}
