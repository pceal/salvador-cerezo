import express from 'express';
import { 
    getEvents, 
    createEvent, 
    updateEvent,
    toggleAttendance, 
    deleteEvent 
} from '../controllers/eventController.js';
import { protect, admin } from '../middlewares/authentication.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// --------------------------------------------------------------------
// RUTAS PÚBLICAS Y DE USUARIO
// --------------------------------------------------------------------

// Ruta pública para ver calendario de eventos
router.get('/', getEvents);

// Ruta para que usuarios marquen "Asistiré" (Requiere estar logueado)
router.post('/:id/attend', protect, toggleAttendance);

// --------------------------------------------------------------------
// RUTAS ADMINISTRATIVAS (Solo Admin)
// --------------------------------------------------------------------

// Crear evento: Requiere Token + Rol Admin + Manejo de archivos (máx 5)
router.post('/', protect, admin, upload.array('media', 5), createEvent);

// Editar evento: Requiere Token + Rol Admin + Manejo de archivos
router.put('/:id', protect, admin, upload.array('media', 5), updateEvent);

// Eliminar evento: Requiere Token + Rol Admin
router.delete('/:id', protect, admin, deleteEvent);

export default router;