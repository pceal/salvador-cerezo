import User from '../models/user.js'; // Importamos el modelo de Usuario (usando 'User.js')
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Para manejar errores asíncronos sin try/catch en cada función

// 1. Función auxiliar para generar el token JWT
const generateToken = (id) => {
    // Firma el token con el ID del usuario y la clave secreta
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // El token expira en 30 días
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body; 

    // Validación de campos básicos
    if (!username || !email || !password) {
        res.status(400); 
        throw new Error('Por favor, proporciona username, email y password.');
    }

    // 1. Verificar si el usuario o email ya existen
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400); 
        throw new Error('El usuario o email ya están registrados. Intenta iniciar sesión.');
    }

    // 2. Crear el nuevo usuario (la contraseña se cifra automáticamente con el hook 'pre-save' del modelo)
    // Nota: El token se genera y guarda en el proceso de login, no en el registro.
    const user = await User.create({ username, email, password });

    // 3. Enviar respuesta exitosa (sin token)
    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
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

    // 1. Verificar usuario y contraseña
    if (!user || !(await user.matchPassword(password))) {
        res.status(401); // Unauthorized
        throw new Error('Credenciales inválidas (email o contraseña incorrectos).');
    }
    
    // 2. Generar el Token JWT
    const token = generateToken(user._id);

    // 3. GUARDAR el Token en la DB (para seguimiento de sesión)
    user.tokens.push(token);
    await user.save();
    
    // 4. Enviar respuesta exitosa
    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token, // Enviamos el token recién generado
        message: `Bienvenid@ ${user.username}` // Mensaje personalizado
    });
});

// @desc    Cerrar sesión (Logout) - Eliminar token de la DB
// @route   DELETE /api/auth/logout
// @access  Private (Requiere Token)
const logoutUser = asyncHandler(async (req, res) => {
    // req.user lo proporciona el middleware 'protect'.
    // req.headers.authorization es la cabecera que contiene "Bearer <token>"
    
    // 1. Obtener el token específico que se quiere revocar
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        res.status(400);
        throw new Error('Cabecera de autorización no válida.');
    }
    
    const tokenToRemove = authHeader.split(' ')[1];

    // 2. Filtrar el array 'tokens' del usuario logeado y eliminar el token actual
    const initialTokenCount = req.user.tokens.length;
    
    req.user.tokens = req.user.tokens.filter(token => token !== tokenToRemove);
    
    // Verificación (opcional): Si el token se eliminó, guardar.
    if (req.user.tokens.length < initialTokenCount) {
        await req.user.save();
        res.status(200).json({ message: 'Sesión cerrada y token revocado exitosamente.' });
    } else {
        // Esto debería ser atrapado por 'protect', pero lo manejamos
        res.status(401);
        throw new Error('El token proporcionado ya está inactivo o no es válido para esta sesión.');
    }
});


export { registerUser, loginUser, logoutUser };