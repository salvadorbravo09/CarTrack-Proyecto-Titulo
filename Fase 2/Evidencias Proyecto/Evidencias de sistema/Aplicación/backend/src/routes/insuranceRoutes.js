import express from 'express';
import { InsuranceController } from '../controllers/insuranceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas de seguros requieren autenticación
router.use(authenticateToken);

// Rutas de seguros vehiculares
router.post('/', InsuranceController.createInsurance);                               // Crear seguro
router.get('/vehicle/:vehicleId', InsuranceController.getInsurancesByVehicle);       // Obtener todos los seguros de un vehículo
router.get('/vehicle/:vehicleId/active', InsuranceController.getActiveInsurance);    // Obtener seguro activo de un vehículo
router.get('/:id', InsuranceController.getInsuranceById);                            // Obtener un seguro específico
router.put('/:id', InsuranceController.updateInsurance);                             // Actualizar seguro
router.delete('/:id', InsuranceController.deleteInsurance);                          // Eliminar seguro

export default router;
