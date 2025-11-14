import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify-token', authenticateToken, AuthController.verifyToken);

export default router;