import User from '../models/user.js'; // Importamos el modelo de Usuario
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Para manejar errores asíncronos

// Función auxiliar para generar el token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '365d', // Sesión extendida para permanencia
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, confirmPassword } = req.body; 

    // 1. Verificar que todos los campos obligatorios estén presentes
    if (!username || !email || !password || !confirmPassword) {
        res.status(400); 
        throw new Error('Por favor, proporciona username, email, password y confirmación.');
    }

    // 2. Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
        res.status(400);
        throw new Error('Las contraseñas no coinciden.');
    }

    // 3. Verificar si el email ya existe
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        res.status(400);
        throw new Error('Este correo electrónico ya está registrado.');
    }

    // 4. Verificar si el nombre de usuario ya existe
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        res.status(400);
        throw new Error('El nombre de usuario ya está en uso.');
    }

    // 5. Crear el usuario si las validaciones pasan
    const user = await User.create({ username, email, password });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            message: 'Usuario registrado exitosamente.'
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario no válidos o error de base de datos.');
    }
});

// @desc    Autenticar un usuario, obtener token y GUARDARLO en DB
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
        res.status(401); 
        throw new Error('Credenciales inválidas (email o contraseña incorrectos).');
    }

    // Verificar si el usuario está bloqueado antes de permitir el login
    if (user.isBlocked) {
        res.status(403);
        throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador.');
    }
    
    // 1. Generar el Token JWT
    const token = generateToken(user._id);

    // 2. GUARDAR el Token en la DB (para seguimiento de sesión)
    user.tokens.push(token);
    await user.save();
    
    // 3. Enviar respuesta exitosa
    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token, 
        message: `Bienvenid@ ${user.username}` 
    });
});

// @desc    Cerrar sesión (Logout) - Eliminar token de la DB
// @route   DELETE /api/auth/logout
// @access  Private (Requiere Token)
const logoutUser = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        res.status(400);
        throw new Error('Cabecera de autorización no válida.');
    }
    
    const tokenToRemove = authHeader.split(' ')[1];
    const initialTokenCount = req.user.tokens.length;
    
    req.user.tokens = req.user.tokens.filter(token => token !== tokenToRemove);
    
    if (req.user.tokens.length < initialTokenCount) {
        await req.user.save();
        res.status(200).json({ message: 'Sesión cerrada y token revocado exitosamente.' });
    } else {
        res.status(401);
        throw new Error('El token proporcionado ya está inactivo o no es válido para esta sesión.');
    }
});

export { registerUser, loginUser, logoutUser };