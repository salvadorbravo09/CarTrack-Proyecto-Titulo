import { Router } from 'express';
import authRoutes from './authRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de vehículos
router.use('/vehicles', vehicleRoutes);

// TODO: Agregar más rutas después
// router.use('/users', userRoutes);
// router.use('/maintenance', maintenanceRoutes);

export default router;
