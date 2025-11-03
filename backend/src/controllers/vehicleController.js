import { VehicleService } from '../services/vehicleService.js';

export class VehicleController {
  // Crear un nuevo vehículo
  static async createVehicle(req, res) {
    try {
      const userId = req.user.id; // Obtenido del middleware de autenticación
      const vehicleData = req.body;

      // Validaciones básicas
      const requiredFields = ['brand', 'model', 'year', 'licensePlate', 'color', 'engine'];
      const missingFields = requiredFields.filter(field => !vehicleData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        });
      }

      // Validar año
      const currentYear = new Date().getFullYear();
      if (vehicleData.year < 1900 || vehicleData.year > currentYear + 1) {
        return res.status(400).json({
          success: false,
          message: `El año debe estar entre 1900 y ${currentYear + 1}`
        });
      }

      // Validar formato de patente (permitir diferentes formatos)
      const licensePlateRegex = /^[A-Z0-9-]+$/i;
      if (!licensePlateRegex.test(vehicleData.licensePlate)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de patente inválido'
        });
      }

      // Validar kilometraje
      if (vehicleData.currentKm && vehicleData.currentKm < 0) {
        return res.status(400).json({
          success: false,
          message: 'El kilometraje no puede ser negativo'
        });
      }

      // Validar condición del vehículo
      if (vehicleData.condition && !['NEW', 'USED', 'nuevo', 'usado'].includes(vehicleData.condition)) {
        return res.status(400).json({
          success: false,
          message: 'La condición debe ser "nuevo" o "usado"'
        });
      }

      const result = await VehicleService.createVehicle(userId, vehicleData);

      res.status(201).json(result);

    } catch (error) {
      console.error('Error al crear vehículo:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener todos los vehículos del usuario autenticado
  static async getUserVehicles(req, res) {
    try {
      const userId = req.user.id;

      const result = await VehicleService.getVehiclesByUserId(userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener vehículos:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener un vehículo específico por ID
  static async getVehicleById(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.id);

      if (isNaN(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo inválido'
        });
      }

      const result = await VehicleService.getVehicleById(vehicleId, userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener vehículo:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar un vehículo
  static async updateVehicle(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo inválido'
        });
      }

      // Validar año si se proporciona
      if (updateData.year) {
        const currentYear = new Date().getFullYear();
        if (updateData.year < 1900 || updateData.year > currentYear + 1) {
          return res.status(400).json({
            success: false,
            message: `El año debe estar entre 1900 y ${currentYear + 1}`
          });
        }
      }

      // Validar formato de patente si se proporciona
      if (updateData.licensePlate) {
        const licensePlateRegex = /^[A-Z0-9-]+$/i;
        if (!licensePlateRegex.test(updateData.licensePlate)) {
          return res.status(400).json({
            success: false,
            message: 'Formato de patente inválido'
          });
        }
      }

      // Validar kilometraje si se proporciona
      if (updateData.currentKm !== undefined && updateData.currentKm < 0) {
        return res.status(400).json({
          success: false,
          message: 'El kilometraje no puede ser negativo'
        });
      }

      const result = await VehicleService.updateVehicle(vehicleId, userId, updateData);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al actualizar vehículo:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Eliminar un vehículo (soft delete)
  static async deleteVehicle(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.id);

      if (isNaN(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo inválido'
        });
      }

      const result = await VehicleService.deleteVehicle(vehicleId, userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al eliminar vehículo:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar solo el kilometraje
  static async updateKilometers(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.id);
      const { currentKm } = req.body;

      if (isNaN(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo inválido'
        });
      }

      if (!currentKm || isNaN(currentKm) || currentKm < 0) {
        return res.status(400).json({
          success: false,
          message: 'Kilometraje inválido'
        });
      }

      const result = await VehicleService.updateKilometers(vehicleId, userId, currentKm);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al actualizar kilometraje:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener estadísticas de vehículos
  static async getVehicleStats(req, res) {
    try {
      const userId = req.user.id;

      const result = await VehicleService.getVehicleStats(userId);

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
