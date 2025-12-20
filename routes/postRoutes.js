import express from 'express';
// Importamos las funciones del controlador
import { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost 
} from '../controllers/postController.js'; 
// Importamos los middlewares de protección (protect) y autorización (admin)
import { protect, admin } from '../middlewares/authentication.js'; 
// Importamos la configuración de Multer para manejo de archivos
import upload from '../middlewares/multer.js'; // Asumo que tienes un middleware multer.js

const router = express.Router();

// --------------------------------------------------------------------
// RUTAS PÚBLICAS (Lectura)
// ENDPOINT BASE: /api/posts
// --------------------------------------------------------------------

// GET /api/posts - Obtener todos los posts (Solo publicados)
router.get('/', getPosts);

// GET /api/posts/:id - Obtener un post por ID (Público, pero el controlador maneja si está 'isPublished: false')
router.get('/:id', getPostById);

// --------------------------------------------------------------------
// RUTAS PRIVADAS (Administración: Requieren Token + Rol Admin)
// --------------------------------------------------------------------

// POST /api/posts - Crear un nuevo post
// Orden: protect -> admin -> upload (maneja imagen) -> createPost
router.post('/', protect, admin, upload.single('image'), createPost);

// PUT /api/posts/:id - Actualizar un post existente
// Orden: protect -> admin -> upload (maneja imagen) -> updatePost
router.put('/:id', protect, admin, upload.single('image'), updatePost);

// DELETE /api/posts/:id - Eliminar un post
// Orden: protect -> admin -> deletePost
router.delete('/:id', protect, admin, deletePost);


export default router;