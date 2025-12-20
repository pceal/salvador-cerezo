import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
} from '../controllers/userController.js'; // Asegúrate de que este archivo exista

// Importamos los middlewares de protección y administración
// NOTA: Asumimos que están en '../middlewares/authentication.js' o similar
import { protect, admin } from '../middlewares/authentication.js'; 

const router = express.Router();

// --------------------------------------------------------------------
// RUTAS PRIVADAS (Perfil del usuario logeado)
// Requiere 'protect' (cualquier usuario con token válido)
// ENDPOINT BASE: /api/users
// --------------------------------------------------------------------

// GET /api/users/profile - Obtener el perfil del usuario autenticado
// PUT /api/users/profile - Actualizar el perfil del usuario autenticado
router.route('/profile')
    .get(protect, getUserProfile) 
    .put(protect, updateUserProfile); 

// --------------------------------------------------------------------
// RUTAS DE ADMINISTRACIÓN (Gestión de usuarios)
// Requiere 'protect' + 'admin'
// --------------------------------------------------------------------

// GET /api/users - Obtener la lista de todos los usuarios
router.route('/')
    .get(protect, admin, getUsers); 

// DELETE /api/users/:id - Eliminar un usuario por ID
router.route('/:id')
    // Nota: El orden de los middlewares importa (primero protect, luego admin)
    .delete(protect, admin, deleteUser); 

export default router;