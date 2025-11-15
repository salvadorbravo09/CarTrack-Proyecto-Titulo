import { Router } from "express";
import { VehicleDocumentController } from "../controllers/vehicleDocumentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  uploadDocument,
  handleMulterError,
} from "../middlewares/uploadMiddleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post(
  "/",
  uploadDocument.single("file"),
  handleMulterError,
  VehicleDocumentController.createDocument
);

router.get(
  "/vehicle/:vehicleId",
  VehicleDocumentController.getDocumentsByVehicle
);

router.put(
  "/:id",
  uploadDocument.single("file"),
  handleMulterError,
  VehicleDocumentController.updateDocument
);

router.delete("/:id", VehicleDocumentController.deleteDocument);

export default router;
