import User from '../models/user.js';
import asyncHandler from 'express-async-handler';

// @desc    Obtener el perfil del usuario actual
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user viene del middleware 'protect'
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            message: "Perfil actualizado correctamente"
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Obtener todos los usuarios (Solo Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    // Buscamos todos los usuarios devolviendo solo campos necesarios
    const users = await User.find({}).select('username email role isBlocked createdAt');
    res.json(users);
});

// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('No puedes eliminar a otro administrador.');
        }
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'Usuario eliminado correctamente' });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Bloquear o desbloquear un usuario
// @route   PATCH /api/users/:id/block
// @access  Private/Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('No puedes bloquear a un administrador.');
        }
        
        user.isBlocked = !user.isBlocked;
        // Si lo bloqueamos, invalidamos sus tokens para que tenga que salir de la app
        if (user.isBlocked) {
            user.tokens = [];
        }
        
        await user.save();
        res.json({ 
            message: user.isBlocked ? 'Usuario bloqueado' : 'Usuario desbloqueado',
            isBlocked: user.isBlocked 
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

export { getUserProfile, updateUserProfile, getUsers, deleteUser, toggleBlockUser };