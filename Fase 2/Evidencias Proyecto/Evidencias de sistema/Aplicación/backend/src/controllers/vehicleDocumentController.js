import { VehicleDocumentService } from "../services/vehicleDocumentService.js";

export class VehicleDocumentController {
  static async createDocument(req, res) {
    try {
      const userId = req.user.id;
      const documentData = req.body;
      const file = req.file;

      const result = await VehicleDocumentService.createDocument(
        userId,
        documentData,
        file
      );

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getDocumentsByVehicle(req, res) {
    try {
      const userId = req.user.id;
      const vehicleId = parseInt(req.params.vehicleId);

      const result = await VehicleDocumentService.getDocumentsByVehicle(
        vehicleId,
        userId
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateDocument(req, res) {
    try {
      const userId = req.user.id;
      const documentId = parseInt(req.params.id);
      const updateData = req.body;
      const file = req.file;

      const result = await VehicleDocumentService.updateDocument(
        documentId,
        userId,
        updateData,
        file
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteDocument(req, res) {
    try {
      const userId = req.user.id;
      const documentId = parseInt(req.params.id);

      const result = await VehicleDocumentService.deleteDocument(
        documentId,
        userId
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
