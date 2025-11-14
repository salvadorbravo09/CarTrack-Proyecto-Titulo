/**
 * Middleware para verificar que el usuario tenga rol de administrador
 */
export const requireAdmin = (req, res, next) => {
  try {
    // El usuario ya fue autenticado por authenticateToken
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No estás autenticado'
      });
    }

    // Verificar si el usuario es admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    // Si es admin, continuar
    next();

  } catch (error) {
    console.error('Error en requireAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};

/**
 * Middleware para verificar múltiples roles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No estás autenticado'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      }

      next();

    } catch (error) {
      console.error('Error en requireRole middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};
