import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'cartrack_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  // Registrar nuevo usuario
  static async register(userData) {
    const { email, username, password, firstName, lastName, phone, role = 'USER' } = userData;

    try {
      // Verificar si el usuario ya existe por email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUserByEmail) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el username ya existe (si se proporciona)
      if (username) {
        const existingUserByUsername = await prisma.user.findUnique({
          where: { username }
        });

        if (existingUserByUsername) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      // Verificar si el teléfono ya está registrado
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingUserByPhone) {
        throw new Error('El número de teléfono ya está registrado');
      }

      // Encriptar la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el usuario
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: newUser,
        token
      };

    } catch (error) {
      throw new Error(error.message || 'Error al registrar usuario');
    }
  }

  // Iniciar sesión
  static async login(email, password) {
    try {
      // Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        throw new Error('Cuenta desactivada. Contacte al administrador');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Retornar datos del usuario sin la contraseña
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        user: userWithoutPassword,
        token
      };

    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  // Verificar token JWT
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, data: decoded };
    } catch (error) {
      return { success: false, error: 'Token inválido o expirado' };
    }
  }

  // Obtener usuario por ID
  static async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuario');
    }
  }
}