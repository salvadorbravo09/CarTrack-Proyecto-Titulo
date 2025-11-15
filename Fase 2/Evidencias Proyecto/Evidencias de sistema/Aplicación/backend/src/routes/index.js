import { Router } from 'express';
import authRoutes from './authRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import fuelRoutes from './fuelRoutes.js';
import insuranceRoutes from './insuranceRoutes.js';
import userRoutes from './userRoutes.js';
import soapRoutes from './soapRoutes.js';
import vehicleDocumentRoutes from './vehicleDocumentRoutes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de vehículos
router.use('/vehicles', vehicleRoutes);

// Rutas de mantenimiento
router.use('/maintenance', maintenanceRoutes);

// Rutas de combustible
router.use('/fuel', fuelRoutes);

// Rutas de seguros vehiculares
router.use('/insurances', insuranceRoutes);

// Rutas de SOAP
router.use('/soap', soapRoutes);

// Rutas de documentos de vehículos
router.use('/documents', vehicleDocumentRoutes);

// Rutas de gestión de usuarios (solo admin)
router.use('/users', userRoutes);

export default router;
