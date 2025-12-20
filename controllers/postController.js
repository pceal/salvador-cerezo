import Post from '../models/post.js';
import User from '../models/user.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import fs from 'fs/promises'; // Para eliminar el archivo temporal de Multer
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../utils/cloudinary.js';

// NOTA IMPORTANTE: Se asume que todas las rutas POST, PUT, y DELETE
// están protegidas en routes/postRoutes.js con el middleware:
// restrictTo('admin')

// @desc    Crea una nueva publicación (Solo Admin)
// @route   POST /api/posts
// @access  Private (Requiere token y rol Admin)
const createPost = asyncHandler(async (req, res) => {
    // Nota: Los datos de texto vienen de req.body, el archivo viene de req.file
    const { title, content, isPublished, isPinned } = req.body; 
    let imageUrl = null;
    let cloudinaryId = null;

    // Validación de campos obligatorios
    if (!title || !content) {
        res.status(400);
        throw new Error('Por favor, proporciona el título y el contenido del post.');
    }

    // 1. Manejo de la subida de la imagen
    if (req.file) {
        try {
            const uploadResult = await uploadImageToCloudinary(req.file.path);
            imageUrl = uploadResult.url;
            cloudinaryId = uploadResult.publicId;

        } catch (uploadError) {
            // Si la subida falla (ej: error en cloud_name o keys), detenemos la creación del post
            res.status(500);
            throw new Error(`Error al subir la imagen: ${uploadError.message}`);
        } finally {
            // CRÍTICO: Eliminar el archivo temporal del servidor después de usarlo
            await fs.unlink(req.file.path);
        }
    }

    // 2. Crear el Post en la DB
    // req.user._id contiene el ID del administrador logueado
    const post = await Post.create({
        title,
        content,
        imageUrl, 
        cloudinaryId,
        author: req.user._id, // <--- El autor siempre es el Admin
        isPublished: isPublished !== undefined ? isPublished : true,
        isPinned: isPinned !== undefined ? isPinned : false,
    });

    if (post) {
        res.status(201).json({
            message: 'Post creado exitosamente',
            post: post
        });
    } else {
        res.status(400);
        throw new Error('Datos de post no válidos o error de base de datos.');
    }
});

// @desc    Obtiene todos los posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
    // Obtenemos solo los posts publicados y ordenados por fecha de creación descendente
    const posts = await Post.find({ isPublished: true })
        .populate('author', 'username role') // Solo muestra username y role del autor
        .sort({ isPinned: -1, createdAt: -1 }); // Prioriza pinned, luego fecha

    res.json(posts);
});

// @desc    Obtiene un post por ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
    // Aseguramos que el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(404);
        throw new Error('Post no encontrado. ID inválido.');
    }

    // Buscamos el post y populamos la información del autor
    const post = await Post.findById(req.params.id).populate('author', 'username role');

    if (post && post.isPublished) {
        res.json(post);
    } else if (post && !post.isPublished && (req.user && req.user.role === 'admin')) {
        // Permitir que el admin vea sus posts no publicados
        res.json(post);
    } else {
        res.status(404);
        throw new Error('Post no encontrado.');
    }
});


// @desc    Actualiza un post (Solo Admin)
// @route   PUT /api/posts/:id
// @access  Private (Requiere token y rol Admin)
const updatePost = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(404);
        throw new Error('Post no encontrado. ID inválido.');
    }

    const post = await Post.findById(req.params.id);

    if (post) {
        // *** SE ELIMINA LA VERIFICACIÓN DE AUTORÍA ***
        // Se asume que solo los Administradores llegan a esta función
        
        // Obtenemos las propiedades a actualizar.
        const { title, content, isPublished, isPinned } = req.body;
        
        // 1. Manejo de la NUEVA imagen (si se proporciona)
        if (req.file) {
            try {
                // Si ya existe una imagen previa, la eliminamos de Cloudinary
                if (post.cloudinaryId) {
                    await deleteImageFromCloudinary(post.cloudinaryId);
                }

                // Subir la nueva imagen a Cloudinary
                const uploadResult = await uploadImageToCloudinary(req.file.path);
                
                // Actualizar los campos del post
                post.imageUrl = uploadResult.url;
                post.cloudinaryId = uploadResult.publicId;

            } catch (uploadError) {
                res.status(500);
                throw new Error(`Error al subir la nueva imagen: ${uploadError.message}`);
            } finally {
                // CRÍTICO: Eliminar el archivo temporal del servidor
                await fs.unlink(req.file.path);
            }
        }
        
        // 2. Actualizar campos de texto
        post.title = title !== undefined ? title : post.title; // Uso de operador ternario mejorado
        post.content = content !== undefined ? content : post.content;
        post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;
        post.isPinned = isPinned !== undefined ? isPinned : post.isPinned;

        const updatedPost = await post.save();
        res.json({
            message: 'Post actualizado exitosamente',
            post: updatedPost
        });

    } else {
        res.status(404);
        throw new Error('Post no encontrado.');
    }
});

// @desc    Elimina un post (Solo Admin)
// @route   DELETE /api/posts/:id
// @access  Private (Requiere token y rol Admin)
const deletePost = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(404);
        throw new Error('Post no encontrado. ID inválido.');
    }

    const post = await Post.findById(req.params.id);

    if (post) {
        // *** SE ELIMINA LA VERIFICACIÓN DE AUTORÍA ***
        // Se asume que solo los Administradores llegan a esta función
        
        // 1. Eliminar la imagen de Cloudinary si existe
        if (post.cloudinaryId) {
            await deleteImageFromCloudinary(post.cloudinaryId);
        }
        
        // 2. Eliminar el post de MongoDB
        await post.deleteOne();
        res.json({ message: 'Post eliminado correctamente' });
    } else {
        res.status(404);
        throw new Error('Post no encontrado.');
    }
});


export {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
};