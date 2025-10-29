import { Router } from 'express';
import maintenanceController from '../controllers/maintenanceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para tipos de mantenimiento
router.get('/types', maintenanceController.getTypes);
router.post('/types', maintenanceController.createType);

// Rutas para mantenimientos
router.post('/', maintenanceController.create);
router.get('/', maintenanceController.getAll);
router.get('/stats', maintenanceController.getStats);
router.get('/vehicle/:vehicleId', maintenanceController.getByVehicle);
router.get('/:id', maintenanceController.getById);
router.put('/:id', maintenanceController.update);
router.delete('/:id', maintenanceController.delete);

export default router;

