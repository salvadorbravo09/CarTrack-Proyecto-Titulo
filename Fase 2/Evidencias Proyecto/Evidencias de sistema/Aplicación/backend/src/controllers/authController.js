import { AuthService } from '../services/authService.js';

export class AuthController {
  // Registro de usuario
  static async register(req, res) {
    try {
      const { email, username, password, firstName, lastName, phone, role } = req.body;

      // Validaciones básicas
      if (!email || !password || !firstName || !lastName || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Email, contraseña, nombre, apellido y teléfono son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresion regular para validar el formato del email
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Validar formato de teléfono chileno (+56912121212)
      const phoneRegex = /^\+569\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de teléfono inválido. Debe ser +56912121212'
        });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Validar username si se proporciona
      if (username && username.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario debe tener al menos 3 caracteres'
        });
      }

      const result = await AuthService.register({
        email,
        username,
        password,
        firstName,
        lastName,
        phone,
        role
      });

      res.status(201).json(result);

    } catch (error) {
      console.error('Error en registro:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Inicio de sesión
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      const result = await AuthService.login(email, password);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error en login:', error.message);
      
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await AuthService.getUserById(userId);

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error.message);
      
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verificar token (endpoint para validar si el token es válido)
  static async verifyToken(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await AuthService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: 'Token válido',
        user
      });

    } catch (error) {
      console.error('Error al verificar token:', error.message);
      
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }
}