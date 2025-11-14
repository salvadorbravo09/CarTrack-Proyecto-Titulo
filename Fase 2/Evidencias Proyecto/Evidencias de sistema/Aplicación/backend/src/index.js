import 'dotenv/config';
import express from "express";
import cors from "cors";
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CarTrack API está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api', routes);

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CarTrack API corriendo en el puerto: ${PORT}`);
  console.log(`📊 Health check disponible en: http://localhost:${PORT}/health`);
});
