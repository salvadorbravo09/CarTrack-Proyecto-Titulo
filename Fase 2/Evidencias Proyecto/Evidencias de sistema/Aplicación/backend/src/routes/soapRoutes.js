import express from 'express';
import { SoapController } from '../controllers/soapController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear un nuevo SOAP
router.post('/', SoapController.createSoap);

// Obtener todos los SOAPs de un vehículo
router.get('/vehicle/:vehicleId', SoapController.getSoapsByVehicle);

// Obtener SOAP activo de un vehículo
router.get('/vehicle/:vehicleId/active', SoapController.getActiveSoap);

// Obtener un SOAP específico por ID
router.get('/:id', SoapController.getSoapById);

// Actualizar un SOAP
router.put('/:id', SoapController.updateSoap);

// Eliminar un SOAP
router.delete('/:id', SoapController.deleteSoap);

export default router;
