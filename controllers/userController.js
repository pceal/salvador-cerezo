import User from '../models/user.js';
import asyncHandler from 'express-async-handler';

// @desc    Obtener el perfil del usuario autenticado
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user se adjunta gracias al middleware 'protect'
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado.');
  }
});

// @desc    Actualizar el perfil del usuario autenticado
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // 1. Actualizar campos
    // Permitimos actualizar username y email si se proporcionan
    user.username = req.body.username || user.username;

    if (req.body.email && req.body.email !== user.email) {
      // Opcional: Verificar si el nuevo email ya está en uso
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Este email ya está en uso por otra cuenta.');
      }
      user.email = req.body.email;
    }

    // 2. Actualizar contraseña (si se proporciona)
    if (req.body.password) {
      // El hook 'pre-save' del modelo la cifrará automáticamente.
      user.password = req.body.password;
    }

    // 3. Guardar cambios
    const updatedUser = await user.save();

    // 4. Enviar respuesta
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      message: 'Perfil actualizado exitosamente.',
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado.');
  }
});


// @desc    Obtener todos los usuarios (Solo para administradores)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // El middleware 'admin' ya se encargó de verificar el rol.
  // .select('-password') excluye la contraseña de la respuesta.
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Eliminar un usuario (Solo para administradores)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const userToDelete = await User.findById(req.params.id);

    if (userToDelete) {
        // Validación de seguridad: un admin no puede eliminarse a sí mismo
        if (userToDelete._id.toString() === req.user._id.toString()) {
             res.status(400);
             throw new Error('Un administrador no puede eliminar su propia cuenta a través de esta ruta.');
        }
        
        // Eliminación del usuario
        await User.deleteOne({ _id: userToDelete._id });
        res.json({ message: 'Usuario eliminado exitosamente.' });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});


export { getUserProfile, updateUserProfile, getUsers, deleteUser };