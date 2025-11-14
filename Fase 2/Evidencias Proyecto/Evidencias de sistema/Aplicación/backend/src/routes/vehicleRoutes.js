import express from 'express';
import { VehicleController } from '../controllers/vehicleController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas de vehículos requieren autenticación
router.use(authenticateToken);

// Rutas de vehículos
router.post('/', VehicleController.createVehicle);                    // Crear vehículo
router.get('/', VehicleController.getUserVehicles);                   // Obtener todos los vehículos del usuario
router.get('/stats', VehicleController.getVehicleStats);              // Obtener estadísticas
router.get('/:id', VehicleController.getVehicleById);                 // Obtener un vehículo específico
router.put('/:id', VehicleController.updateVehicle);                  // Actualizar vehículo
router.patch('/:id/kilometers', VehicleController.updateKilometers);  // Actualizar solo kilometraje
router.delete('/:id', VehicleController.deleteVehicle);               // Eliminar vehículo (soft delete)

export default router;
