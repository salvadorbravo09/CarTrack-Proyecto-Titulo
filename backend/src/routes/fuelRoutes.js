import express from 'express';
import fuelController from '../controllers/fuelController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las recargas del usuario
router.get('/', fuelController.getAll);

// Obtener recargas por vehículo
router.get('/vehicle/:vehicleId', fuelController.getByVehicle);

// Obtener estadísticas de combustible
router.get('/stats', fuelController.getStats);

// Obtener una recarga específica
router.get('/:id', fuelController.getById);

// Crear una nueva recarga
router.post('/', fuelController.create);

// Actualizar una recarga
router.put('/:id', fuelController.update);

// Eliminar una recarga (soft delete)
router.delete('/:id', fuelController.delete);

export default router;
