import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// TODO: Agregar más rutas, despues si
// router.use('/users', userRoutes);
// router.use('/vehicles', vehicleRoutes);

export default router;
