import { Router } from 'express';
import authRoutes from './authRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import fuelRoutes from './fuelRoutes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de vehículos
router.use('/vehicles', vehicleRoutes);

// Rutas de mantenimiento
router.use('/maintenance', maintenanceRoutes);

// Rutas de combustible
router.use('/fuel', fuelRoutes);

// TODO: Agregar más rutas después
// router.use('/users', userRoutes);

export default router;
