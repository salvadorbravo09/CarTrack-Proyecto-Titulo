import { UserService } from '../services/userService.js';

export class UserController {
  /**
   * Obtener todos los usuarios (solo admin)
   */
  static async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers();

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener usuarios:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Activar/Desactivar usuario (solo admin)
   */
  static async toggleUserStatus(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      const result = await UserService.toggleUserStatus(userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al cambiar estado:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de usuarios (solo admin)
   */
  static async getUserStats(req, res) {
    try {
      const result = await UserService.getUserStats();

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener estadísticas:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
