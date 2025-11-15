import prisma from "../database/connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VehicleDocumentService {
  /**
   * Crear un nuevo documento de vehículo
   */
  static async createDocument(userId, documentData, file) {
    try {
      const {
        vehicleId,
        documentType,
        documentNumber,
        issueDate,
        expiryDate,
        description,
      } = documentData;

      // Verificar que el vehículo existe y pertenece al usuario
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: parseInt(vehicleId),
          userId: userId,
        },
      });

      if (!vehicle) {
        if (file) fs.unlinkSync(file.path);
        throw new Error("Vehículo no encontrado o no tienes permisos");
      }

      // Construir la URL del archivo si existe
      let fileUrl = null;
      if (file) {
        fileUrl = `/uploads/documents/${file.filename}`;
      }

      // Crear el documento
      const newDocument = await prisma.vehicleDocument.create({
        data: {
          vehicleId: parseInt(vehicleId),
          documentType,
          documentNumber: documentNumber || null,
          fileUrl,
          issueDate: issueDate ? new Date(issueDate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          description: description || null,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              licensePlate: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Documento registrado exitosamente",
        data: newDocument,
      };
    } catch (error) {
      throw new Error(error.message || "Error al crear documento");
    }
  }

  /**
   * Obtener todos los documentos de un vehículo
   */
  static async getDocumentsByVehicle(vehicleId, userId) {
    try {
      // Verificar que el vehículo pertenece al usuario
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          userId: userId,
        },
      });

      if (!vehicle) {
        throw new Error("Vehículo no encontrado o no tienes permisos");
      }

      const documents = await prisma.vehicleDocument.findMany({
        where: {
          vehicleId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              licensePlate: true,
            },
          },
        },
      });

      return {
        success: true,
        count: documents.length,
        data: documents,
      };
    } catch (error) {
      throw new Error(error.message || "Error al obtener documentos");
    }
  }

  /**
   * Actualizar un documento
   */
  static async updateDocument(documentId, userId, updateData, file) {
    try {
      // Verificar que el documento existe y pertenece al usuario
      const existingDocument = await prisma.vehicleDocument.findFirst({
        where: {
          id: documentId,
          deletedAt: null,
        },
        include: {
          vehicle: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!existingDocument) {
        if (file) fs.unlinkSync(file.path);
        throw new Error("Documento no encontrado");
      }

      if (existingDocument.vehicle.userId !== userId) {
        if (file) fs.unlinkSync(file.path);
        throw new Error("No tienes permisos para actualizar este documento");
      }

      // Preparar datos para actualizar
      const dataToUpdate = {};

      if (updateData.documentType)
        dataToUpdate.documentType = updateData.documentType;
      if (updateData.documentNumber !== undefined)
        dataToUpdate.documentNumber = updateData.documentNumber || null;
      if (updateData.description !== undefined)
        dataToUpdate.description = updateData.description || null;
      if (updateData.issueDate !== undefined) {
        dataToUpdate.issueDate = updateData.issueDate
          ? new Date(updateData.issueDate)
          : null;
      }
      if (updateData.expiryDate !== undefined) {
        dataToUpdate.expiryDate = updateData.expiryDate
          ? new Date(updateData.expiryDate)
          : null;
      }

      // Si hay un nuevo archivo, actualizar la URL y eliminar el anterior
      if (file) {
        dataToUpdate.fileUrl = `/uploads/documents/${file.filename}`;

        // Eliminar archivo anterior si existe
        if (existingDocument.fileUrl) {
          const oldFilePath = path.join(
            __dirname,
            "../../",
            existingDocument.fileUrl
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      // Actualizar el documento
      const updatedDocument = await prisma.vehicleDocument.update({
        where: { id: documentId },
        data: dataToUpdate,
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              licensePlate: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Documento actualizado exitosamente",
        data: updatedDocument,
      };
    } catch (error) {
      throw new Error(error.message || "Error al actualizar documento");
    }
  }

  /**
   * Eliminar un documento (soft delete)
   */
  static async deleteDocument(documentId, userId) {
    try {
      // Verificar que el documento existe y pertenece al usuario
      const existingDocument = await prisma.vehicleDocument.findFirst({
        where: {
          id: documentId,
          deletedAt: null,
        },
        include: {
          vehicle: {
            select: { userId: true },
          },
        },
      });

      if (!existingDocument) {
        throw new Error("Documento no encontrado");
      }

      if (existingDocument.vehicle.userId !== userId) {
        throw new Error("No tienes permisos para eliminar este documento");
      }

      // Soft delete
      await prisma.vehicleDocument.update({
        where: { id: documentId },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Documento eliminado exitosamente",
      };
    } catch (error) {
      throw new Error(error.message || "Error al eliminar documento");
    }
  }
}
