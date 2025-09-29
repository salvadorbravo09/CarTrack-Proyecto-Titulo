import { AuthService } from '../services/authService.js';

// Middleware para verificar autenticación JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }

  const verificationResult = AuthService.verifyToken(token);

  if (!verificationResult.success) {
    return res.status(403).json({
      success: false,
      message: verificationResult.error
    });
  }

  // Agregar información del usuario a la request
  req.user = verificationResult.data;
  next();
};

// Middleware para verificar roles específicos
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar si el usuario es administrador
export const requireAdmin = (req, res, next) => {
  return authorizeRoles('ADMIN')(req, res, next);
};

// Middleware para verificar si el usuario es mecánico o administrador
export const requireMechanicOrAdmin = (req, res, next) => {
  return authorizeRoles('ADMIN', 'MECHANIC')(req, res, next);
};