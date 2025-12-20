// @desc    Middleware para manejar rutas 404 (no encontradas)
// Se coloca después de todas las rutas de la API.
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no Encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pasa el error al siguiente middleware (errorHandler)
};

// @desc    Middleware general de manejo de errores
// El handler con 4 argumentos (err, req, res, next) es reconocido automáticamente por Express.
const errorHandler = (err, req, res, next) => {
  // A veces Express devuelve un código 200 aunque haya error, forzamos el 500 o el status code existente
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Solo mostramos el stack (detalles internos) si estamos en modo desarrollo
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// Ya que tu index.js está pidiendo 'handleTypeError', la definimos como un alias
// de 'errorHandler' para satisfacer la importación.
const handleTypeError = errorHandler;

export { notFound, errorHandler, handleTypeError };