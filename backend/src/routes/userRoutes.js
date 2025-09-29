import { Router } from 'express';
import userController from '../controllers/userController.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (con autenticación - por ahora públicas)
router.get('/profile/:id', userController.getProfile);

export default router;
