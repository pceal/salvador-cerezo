import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import asyncHandler from 'express-async-handler'; // Necesario para manejar errores en funciones asíncronas de Express

// @desc    Middleware para proteger rutas (verifica el token JWT)
// @access  Requiere Token Válido
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Revisa si existe un token Bearer en las cabeceras
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtiene el token de la cadena: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica el token y decodifica el ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Encuentra al usuario por ID y lo guarda temporalmente
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado.');
      }
      
      // 4. VERIFICACIÓN CRÍTICA DE REVOCACIÓN (Lista Negra en la DB)
      // Comprueba si el token enviado AÚN existe en el array 'tokens' del usuario.
      if (!user.tokens.includes(token)) {
          res.status(401);
          // Este mensaje indica que el token es conocido pero ya fue revocado/expulsado.
          throw new Error('No autorizado, el token ha sido revocado (Sesión cerrada).');
      }

      // 5. Si todo es válido, adjunta el usuario al objeto request
      req.user = user; 

      next();
    } catch (error) {
      console.error('Error al verificar el token:', error.message);
      // Si el error es la revocación, el mensaje ya será más específico, 
      // si es otro error de JWT (expirado, inválido), se usa este genérico.
      if (!res.headersSent) {
          res.status(401); 
          throw new Error('No autorizado, token fallido.');
      }
    }
  }

  if (!token) {
    res.status(401); // No autorizado
    throw new Error('No autorizado, no hay token.');
  }
});

// @desc    Middleware para verificar si el usuario autenticado es 'admin'
// @access  Requiere Rol Admin
const admin = (req, res, next) => {
  // Verificamos que req.user exista (gracias a 'protect') y que tenga el rol 'admin'
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403); // Prohibido
    throw new Error('No autorizado, solo para administradores.');
  }
};

export { protect, admin };