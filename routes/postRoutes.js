import express from 'express';
import { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost, 
    likePost 
} from '../controllers/postController.js';

// Importamos las funciones necesarias del controlador de comentarios
import { 
    createComment, 
    getCommentsByPost, 
    likeComment 
} from '../controllers/commentController.js';

import { protect, admin } from '../middlewares/authentication.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// --- RUTAS DE POSTS (/api/posts) ---
router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, admin, upload.single('image'), createPost);
router.put('/:id', protect, admin, upload.single('image'), updatePost);
router.delete('/:id', protect, admin, deletePost);
router.put('/:id/like', protect, likePost);

// --- RUTAS DE COMENTARIOS Y RESPUESTAS (/api/posts/...) ---

// Crear un comentario en un post (o una respuesta si se envía parentId en el body)
router.post('/:postId/comments', protect, createComment);

// Obtener todos los comentarios de un post
router.get('/:postId/comments', getCommentsByPost);

// Dar o quitar LIKE a un comentario o a una respuesta (comentario de comentario)
// Al usar el ID del comentario, la función likeComment servirá para ambos niveles.
router.put('/comments/:id/like', protect, likeComment);

export default router;