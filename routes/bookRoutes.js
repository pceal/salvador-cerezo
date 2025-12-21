import express from 'express';
import { 
    getBooks, 
    createBook, 
    updateBook, 
    deleteBook 
} from '../controllers/bookController.js';
import { protect, admin } from '../middlewares/authentication.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

/**
 * @route   GET /api/books
 * @desc    Obtener lista de libros
 * @access  Public
 */
router.get('/', getBooks);

/**
 * @route   POST /api/books
 * @desc    Crear un nuevo libro
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.single('image'), createBook);

/**
 * @route   PUT /api/books/:id
 * @desc    Actualizar un libro existente
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.single('image'), updateBook);

/**
 * @route   DELETE /api/books/:id
 * @desc    Eliminar un libro
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteBook);

export default router;