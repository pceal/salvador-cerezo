import express from 'express';
import { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost, 
    likePost 
} from '../controllers/postController.js';
import { protect, admin } from '../middlewares/authentication.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Obtener todos los posts publicados
 * @access  Public
 */
router.get('/', getPosts);

/**
 * @route   GET /api/posts/:id
 * @desc    Obtener un post específico por su ID
 * @access  Public
 */
router.get('/:id', getPostById);

/**
 * @route   POST /api/posts
 * @desc    Crear un nuevo post (Con subida de imagen a Cloudinary)
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.single('image'), createPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Actualizar un post existente
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.single('image'), updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Eliminar un post
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deletePost);

/**
 * @route   PUT /api/posts/:id/like
 * @desc    Dar o quitar like a un post
 * @access  Private
 */
router.put('/:id/like', protect, likePost);

export default router;