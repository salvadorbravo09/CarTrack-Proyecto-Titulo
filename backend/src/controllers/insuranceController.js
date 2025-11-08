import { InsuranceService } from '../services/insuranceService.js';

export class InsuranceController {
  /**
   * Crear un nuevo seguro vehicular
   */
  static async createInsurance(req, res) {
    try {
      const userId = req.user.id;
      const insuranceData = req.body;

      // Validaciones básicas
      const requiredFields = ['vehicleId', 'compania', 'tipoCobertura', 'costo', 'deducible', 'fechaInicio', 'fechaFin'];
      const missingFields = requiredFields.filter(field => !insuranceData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        });
      }

      // Validar montos
      if (insuranceData.costo <= 0 || insuranceData.deducible <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El costo y deducible deben ser valores positivos'
        });
      }

      const result = await InsuranceService.createInsurance(userId, insuranceData);

      res.status(201).json(result);

    } catch (error) {
      console.error('Error al crear seguro:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener todos los seguros de un vehículo
   */
  static async getInsurancesByVehicle(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.vehicleId);

      if (isNaN(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo inválido'
        });
      }

      const result = await InsuranceService.getInsurancesByVehicle(vehicleId, userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener seguros:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener un seguro específico por ID
   */
  static async getInsuranceById(req, res) {
    try {
      const userId = req.user.id;
      const insuranceId = parseInt(req.params.id);

      if (isNaN(insuranceId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de seguro inválido'
        });
      }

      const result = await InsuranceService.getInsuranceById(insuranceId, userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener seguro:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar un seguro
   */
  static async updateInsurance(req, res) {
    try {
      const userId = req.user.id;
      const insuranceId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(insuranceId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de seguro inválido'
        });
      }

      // Validar montos si se proporcionan
      if (updateData.costo !== undefined && updateData.costo <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El costo debe ser un valor positivo'
        });
      }

      if (updateData.deducible !== undefined && updateData.deducible <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El deducible debe ser un valor positivo'
        });
      }

      const result = await InsuranceService.updateInsurance(insuranceId, userId, updateData);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al actualizar seguro:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un seguro
   */
  static async deleteInsurance(req, res) {
    try {
      const userId = req.user.id;
      const insuranceId = parseInt(req.params.id);

      if (isNaN(insuranceId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de seguro inválido'
        });
      }

      const result = await InsuranceService.deleteInsurance(insuranceId, userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al eliminar seguro:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener seguro activo de un vehículo
   */
  static async getActiveInsurance(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.vehicleId);

      if (isNaN(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo inválido'
        });
      }

      const result = await InsuranceService.getActiveInsurance(vehicleId, userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener seguro activo:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}
