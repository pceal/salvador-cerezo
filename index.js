// 1. IMPORTACIONES
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import swaggerUI from 'swagger-ui-express';

// Importaciones Modulares (Configuración, Middlewares y Documentación)
import { dbConnection } from './config/config.js'; // Conexión a DB
import { handleTypeError } from './middlewares/errors.js'; // Manejo de errores
//import docs from './docs/index.js'; // Documentación Swagger

// Rutas de la Aplicación (Contenido y Autenticación)
import authRoutes from './routes/authRoutes.js'; // Rutas de registro/login
import postRoutes from './routes/postRoutes.js'; // Rutas de posts, comentarios y likestes
import userRoutes from './routes/userRoutes.js';
// Eliminamos rutas de e-commerce (productRoutes, userRoutes, etc.)

// Cargar variables de entorno desde .env
dotenv.config();

// Conexión a la Base de Datos
dbConnection(); 

// Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;


// -----------------------------------------------------
// 2. MIDDLEWARE PRINCIPAL (Configuración del Servidor)
// -----------------------------------------------------

// CORS: Permite peticiones de diferentes orígenes
app.use(cors());

// Body Parser: Permite recibir datos JSON en el cuerpo de las peticiones
app.use(express.json());


// -----------------------------------------------------
// 3. ENDPOINTS (Rutas de la Aplicación)
// -----------------------------------------------------

// Rutas de Autenticación y Usuarios
app.use('/api/auth', authRoutes); 

// Rutas de Contenido Principal (Posts, Comentarios, Likes)
app.use('/api/posts', postRoutes); 
app.use('/api/users', userRoutes); 

// Manejador de Errores Centralizado (DEBE ir después de las rutas)
app.use(handleTypeError);

// Ruta para la Documentación (Swagger UI)
//app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(docs));


// -----------------------------------------------------
// 4. INICIO DEL SERVIDOR
// -----------------------------------------------------

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});