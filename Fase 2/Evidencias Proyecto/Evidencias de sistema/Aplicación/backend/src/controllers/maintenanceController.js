import maintenanceService from '../services/maintenanceService.js';

class MaintenanceController {
  
  async create(req, res) {
    try {
      const userId = req.user.id;
      const maintenanceData = req.body;

      const maintenance = await maintenanceService.createMaintenance(maintenanceData, userId);

      res.status(201).json({
        success: true,
        message: 'Mantenimiento creado exitosamente',
        data: maintenance
      });
    } catch (error) {
      console.error('Error al crear mantenimiento:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el mantenimiento'
      });
    }
  }

  async getByVehicle(req, res) {
    try {
      const userId = req.user.id;
      const { vehicleId } = req.params;

      const maintenances = await maintenanceService.getMaintenancesByVehicle(
        parseInt(vehicleId),
        userId
      );

      res.status(200).json({
        success: true,
        data: maintenances
      });
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los mantenimientos'
      });
    }
  }

  async getAll(req, res) {
    try {
      const userId = req.user.id;

      const maintenances = await maintenanceService.getAllMaintenances(userId);

      res.status(200).json({
        success: true,
        data: maintenances
      });
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener los mantenimientos'
      });
    }
  }

  async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const maintenance = await maintenanceService.getMaintenanceById(
        parseInt(id),
        userId
      );

      res.status(200).json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      console.error('Error al obtener mantenimiento:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener el mantenimiento'
      });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const maintenanceData = req.body;

      const maintenance = await maintenanceService.updateMaintenance(
        parseInt(id),
        maintenanceData,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Mantenimiento actualizado exitosamente',
        data: maintenance
      });
    } catch (error) {
      console.error('Error al actualizar mantenimiento:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el mantenimiento'
      });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await maintenanceService.deleteMaintenance(
        parseInt(id),
        userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el mantenimiento'
      });
    }
  }

  async getTypes(req, res) {
    try {
      const types = await maintenanceService.getMaintenanceTypes();

      res.status(200).json({
        success: true,
        data: types
      });
    } catch (error) {
      console.error('Error al obtener tipos de mantenimiento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener los tipos de mantenimiento'
      });
    }
  }

  async createType(req, res) {
    try {
      const typeData = req.body;

      const type = await maintenanceService.createMaintenanceType(typeData);

      res.status(201).json({
        success: true,
        message: 'Tipo de mantenimiento creado exitosamente',
        data: type
      });
    } catch (error) {
      console.error('Error al crear tipo de mantenimiento:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el tipo de mantenimiento'
      });
    }
  }

  async getStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await maintenanceService.getMaintenanceStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las estadísticas'
      });
    }
  }
}

export default new MaintenanceController();
