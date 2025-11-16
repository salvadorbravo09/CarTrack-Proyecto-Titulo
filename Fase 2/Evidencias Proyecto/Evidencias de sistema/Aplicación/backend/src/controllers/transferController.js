import { TransferService } from '../services/transferService.js';

export class TransferController {
  /**
   * Iniciar una nueva transferencia de vehículo
   * POST /api/transfers
   */
  static async initiateTransfer(req, res) {
    try {
      const userId = req.user.id;
      const { vehicleId, transferEmail, message } = req.body;

      // Validaciones
      if (!vehicleId || !transferEmail) {
        return res.status(400).json({
          success: false,
          message: 'El ID del vehículo y el email del destinatario son obligatorios'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(transferEmail)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del email no es válido'
        });
      }

      const transfer = await TransferService.initiateTransfer(
        parseInt(vehicleId),
        userId,
        transferEmail,
        message
      );

      res.status(201).json({
        success: true,
        message: 'Transferencia iniciada exitosamente',
        data: transfer
      });
    } catch (error) {
      console.error('Error al iniciar transferencia:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al iniciar la transferencia'
      });
    }
  }

  /**
   * Aceptar una transferencia
   * POST /api/transfers/:transferCode/accept
   */
  static async acceptTransfer(req, res) {
    try {
      const userId = req.user.id;
      const { transferCode } = req.params;

      if (!transferCode) {
        return res.status(400).json({
          success: false,
          message: 'El código de transferencia es obligatorio'
        });
      }

      const transfer = await TransferService.acceptTransfer(transferCode, userId);

      res.status(200).json({
        success: true,
        message: 'Transferencia aceptada exitosamente',
        data: transfer
      });
    } catch (error) {
      console.error('Error al aceptar transferencia:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al aceptar la transferencia'
      });
    }
  }

  /**
   * Rechazar una transferencia
   * POST /api/transfers/:transferCode/reject
   */
  static async rejectTransfer(req, res) {
    try {
      const userId = req.user.id;
      const { transferCode } = req.params;

      if (!transferCode) {
        return res.status(400).json({
          success: false,
          message: 'El código de transferencia es obligatorio'
        });
      }

      const transfer = await TransferService.rejectTransfer(transferCode, userId);

      res.status(200).json({
        success: true,
        message: 'Transferencia rechazada',
        data: transfer
      });
    } catch (error) {
      console.error('Error al rechazar transferencia:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al rechazar la transferencia'
      });
    }
  }

  /**
   * Cancelar una transferencia (por el usuario origen)
   * DELETE /api/transfers/:transferId
   */
  static async cancelTransfer(req, res) {
    try {
      const userId = req.user.id;
      const { transferId } = req.params;

      if (!transferId) {
        return res.status(400).json({
          success: false,
          message: 'El ID de transferencia es obligatorio'
        });
      }

      const transfer = await TransferService.cancelTransfer(parseInt(transferId), userId);

      res.status(200).json({
        success: true,
        message: 'Transferencia cancelada',
        data: transfer
      });
    } catch (error) {
      console.error('Error al cancelar transferencia:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cancelar la transferencia'
      });
    }
  }

  /**
   * Obtener transferencias enviadas
   * GET /api/transfers/sent
   */
  static async getSentTransfers(req, res) {
    try {
      const userId = req.user.id;
      const transfers = await TransferService.getSentTransfers(userId);

      res.status(200).json({
        success: true,
        data: transfers
      });
    } catch (error) {
      console.error('Error al obtener transferencias enviadas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las transferencias enviadas'
      });
    }
  }

  /**
   * Obtener transferencias recibidas
   * GET /api/transfers/received
   */
  static async getReceivedTransfers(req, res) {
    try {
      const userId = req.user.id;
      const transfers = await TransferService.getReceivedTransfers(userId);

      res.status(200).json({
        success: true,
        data: transfers
      });
    } catch (error) {
      console.error('Error al obtener transferencias recibidas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las transferencias recibidas'
      });
    }
  }

  /**
   * Obtener detalles de una transferencia por código
   * GET /api/transfers/:transferCode
   */
  static async getTransferByCode(req, res) {
    try {
      const { transferCode } = req.params;

      if (!transferCode) {
        return res.status(400).json({
          success: false,
          message: 'El código de transferencia es obligatorio'
        });
      }

      const transfer = await TransferService.getTransferByCode(transferCode);

      res.status(200).json({
        success: true,
        data: transfer
      });
    } catch (error) {
      console.error('Error al obtener transferencia:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Transferencia no encontrada'
      });
    }
  }

  /**
   * Verificar y actualizar transferencias expiradas (endpoint administrativo)
   * POST /api/transfers/check-expired
   */
  static async checkExpiredTransfers(req, res) {
    try {
      const result = await TransferService.checkExpiredTransfers();

      res.status(200).json({
        success: true,
        message: 'Transferencias expiradas actualizadas',
        data: result
      });
    } catch (error) {
      console.error('Error al verificar transferencias expiradas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al verificar transferencias expiradas'
      });
    }
  }
}
