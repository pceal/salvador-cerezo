import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importaciones Modulares
import { dbConnection } from './config/config.js'; 
import { handleTypeError, notFound } from './middlewares/errors.js'; 

// Rutas de la Aplicación
import authRoutes from './routes/authRoutes.js'; 
import postRoutes from './routes/postRoutes.js'; // Usamos commentRoutes que ya unifica posts y comentarios
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

// Cargar variables de entorno
dotenv.config();

// Conexión a la Base de Datos
dbConnection(); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ENDPOINTS ---

// Autenticación
app.use('/api/auth', authRoutes); 

// Usuarios (Gestión de admin)
app.use('/api/users', userRoutes);

// Contenido Principal
// IMPORTANTE: Asegúrate de usar 'commentRoutes.js' o el archivo que contenga 
// tanto las rutas de posts como las de comentarios anidadas.
app.use('/api/posts', postRoutes); 

// Libros
app.use('/api/books', bookRoutes); 

// Eventos (CORREGIDO: plural 'events' para coincidir con Postman)
app.use('/api/events', eventRoutes); 

// --- MANEJO DE ERRORES ---

// Middleware para rutas no encontradas (404)
app.use(notFound);

// Manejador de errores global
app.use(handleTypeError);

// --- INICIO ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});