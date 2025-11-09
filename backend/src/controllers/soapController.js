import { SoapService } from '../services/soapService.js';

export class SoapController {
  /**
   * Crear un nuevo SOAP
   */
  static async createSoap(req, res) {
    try {
      const userId = req.user.id;
      const soapData = req.body;

      const soap = await SoapService.createSoap(userId, soapData);

      res.status(201).json({
        success: true,
        message: 'SOAP registrado exitosamente',
        data: soap
      });
    } catch (error) {
      console.error('Error al crear SOAP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear SOAP'
      });
    }
  }

  /**
   * Obtener todos los SOAPs de un vehículo
   */
  static async getSoapsByVehicle(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.vehicleId);

      const soaps = await SoapService.getSoapsByVehicle(userId, vehicleId);

      res.json({
        success: true,
        data: soaps,
        count: soaps.length
      });
    } catch (error) {
      console.error('Error al obtener SOAPs:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener SOAPs'
      });
    }
  }

  /**
   * Obtener SOAP activo de un vehículo
   */
  static async getActiveSoap(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.vehicleId);

      const soap = await SoapService.getActiveSoap(userId, vehicleId);

      if (!soap) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró SOAP activo para este vehículo'
        });
      }

      res.json({
        success: true,
        data: soap
      });
    } catch (error) {
      console.error('Error al obtener SOAP activo:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener SOAP activo'
      });
    }
  }

  /**
   * Obtener un SOAP por ID
   */
  static async getSoapById(req, res) {
    try {
      const userId = req.user.id;
      const soapId = parseInt(req.params.id);

      const soap = await SoapService.getSoapById(userId, soapId);

      res.json({
        success: true,
        data: soap
      });
    } catch (error) {
      console.error('Error al obtener SOAP:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener SOAP'
      });
    }
  }

  /**
   * Actualizar un SOAP
   */
  static async updateSoap(req, res) {
    try {
      const userId = req.user.id;
      const soapId = parseInt(req.params.id);
      const updateData = req.body;

      const soap = await SoapService.updateSoap(userId, soapId, updateData);

      res.json({
        success: true,
        message: 'SOAP actualizado exitosamente',
        data: soap
      });
    } catch (error) {
      console.error('Error al actualizar SOAP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar SOAP'
      });
    }
  }

  /**
   * Eliminar un SOAP
   */
  static async deleteSoap(req, res) {
    try {
      const userId = req.user.id;
      const soapId = parseInt(req.params.id);

      const result = await SoapService.deleteSoap(userId, soapId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar SOAP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar SOAP'
      });
    }
  }
}
