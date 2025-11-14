import fuelService from '../services/fuelService.js';

class FuelController {
  
  async create(req, res) {
    try {
      const userId = req.user.id;
      const fuelData = req.body;

      const fuelRefill = await fuelService.createFuelRefill(fuelData, userId);

      res.status(201).json({
        success: true,
        message: 'Recarga de combustible registrada exitosamente',
        data: fuelRefill
      });
    } catch (error) {
      console.error('Error al registrar recarga de combustible:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar la recarga de combustible'
      });
    }
  }

  async getByVehicle(req, res) {
    try {
      const userId = req.user.id;
      const { vehicleId } = req.params;

      const fuelRefills = await fuelService.getFuelRefillsByVehicle(
        parseInt(vehicleId),
        userId
      );

      res.status(200).json({
        success: true,
        data: fuelRefills
      });
    } catch (error) {
      console.error('Error al obtener recargas de combustible:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener las recargas de combustible'
      });
    }
  }

  async getAll(req, res) {
    try {
      const userId = req.user.id;

      const fuelRefills = await fuelService.getAllFuelRefills(userId);

      res.status(200).json({
        success: true,
        data: fuelRefills
      });
    } catch (error) {
      console.error('Error al obtener recargas de combustible:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las recargas de combustible'
      });
    }
  }

  async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const fuelRefill = await fuelService.getFuelRefillById(
        parseInt(id),
        userId
      );

      res.status(200).json({
        success: true,
        data: fuelRefill
      });
    } catch (error) {
      console.error('Error al obtener recarga de combustible:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener la recarga de combustible'
      });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const fuelData = req.body;

      const fuelRefill = await fuelService.updateFuelRefill(
        parseInt(id),
        fuelData,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Recarga de combustible actualizada exitosamente',
        data: fuelRefill
      });
    } catch (error) {
      console.error('Error al actualizar recarga de combustible:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar la recarga de combustible'
      });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await fuelService.deleteFuelRefill(
        parseInt(id),
        userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar recarga de combustible:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar la recarga de combustible'
      });
    }
  }

  async getStats(req, res) {
    try {
      const userId = req.user.id;
      const { vehicleId } = req.query;

      const stats = await fuelService.getFuelStats(
        userId,
        vehicleId ? parseInt(vehicleId) : null
      );

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de combustible:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las estadísticas'
      });
    }
  }
}

export default new FuelController();
