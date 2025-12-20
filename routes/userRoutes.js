import express from 'express';
import { getUsers, deleteUser, toggleBlockUser } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authentication.js';

const router = express.Router();

// Todas estas rutas requieren estar logueado Y ser admin
router.use(protect);
router.use(admin);

// GET /api/users - Ver todos los usuarios
router.get('/', getUsers);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', deleteUser);

// PATCH /api/users/:id/block - Bloquear/Desbloquear usuario
router.patch('/:id/block', toggleBlockUser);

export default router;