import express from 'express';
// Importamos las tres funciones del controlador de autenticación
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js'; 
// Importamos el middleware de protección. Asumo que se llama 'protect' desde 'middlewares/auth.js'
import { protect } from '../middlewares/authentication.js'; 

const router = express.Router();

// --------------------------------------------------------------------
// RUTAS PÚBLICAS (No necesitan token)
// ENDPOINT BASE: /api/auth
// --------------------------------------------------------------------

// POST /api/auth/register - Crear un nuevo usuario
router.post('/register', registerUser);

// POST /api/auth/login - Iniciar sesión, generar y guardar token en DB
router.post('/login', loginUser);

// --------------------------------------------------------------------
// RUTA PRIVADA (Requiere Token)
// --------------------------------------------------------------------

// DELETE /api/auth/logout - Cerrar sesión y eliminar token de la DB
// Requiere el middleware 'protect' para verificar el token y obtener req.user.
router.delete('/logout', protect, logoutUser); 

export default router;