import express from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación Y rol de administrador
router.use(authenticateToken);
router.use(requireAdmin);

// Rutas de gestión de usuarios (solo para admin)
router.get('/stats', UserController.getUserStats);           // Obtener estadísticas
router.get('/', UserController.getAllUsers);                 // Obtener todos los usuarios
router.get('/:id', UserController.getUserById);              // Obtener usuario por ID
router.patch('/:id/role', UserController.updateUserRole);    // Actualizar rol
router.patch('/:id/toggle', UserController.toggleUserStatus);// Activar/Desactivar
router.delete('/:id', UserController.deleteUser);            // Eliminar usuario

export default router;
