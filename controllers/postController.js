import Post from '../models/post.js'; // Asegúrate de que la extensión sea .js
import User from '../models/user.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import fs from 'fs/promises'; 
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../utils/cloudinary.js';

// @desc    Crea una nueva publicación (Solo Admin)
// @route   POST /api/posts
// @access  Private (Admin)
const createPost = asyncHandler(async (req, res) => {
    const { title, content, isPublished, isPinned } = req.body; 
    let imageUrl = null;
    let cloudinaryId = null;

    if (!title || !content) {
        res.status(400);
        throw new Error('Por favor, proporciona el título y el contenido del post.');
    }

    if (req.file) {
        try {
            const uploadResult = await uploadImageToCloudinary(req.file.path);
            imageUrl = uploadResult.url;
            cloudinaryId = uploadResult.publicId;
        } catch (uploadError) {
            res.status(500);
            throw new Error(`Error al subir la imagen: ${uploadError.message}`);
        } finally {
            await fs.unlink(req.file.path);
        }
    }

    const post = await Post.create({
        title,
        content,
        imageUrl, 
        cloudinaryId,
        author: req.user._id,
        isPublished: isPublished !== undefined ? isPublished : true,
        isPinned: isPinned !== undefined ? isPinned : false,
    });

    if (post) {
        res.status(201).json({ message: 'Post creado exitosamente', post });
    } else {
        res.status(400);
        throw new Error('Datos de post no válidos.');
    }
});

// @desc    Obtiene todos los posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ isPublished: true })
        .populate('author', 'username role')
        .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);
});

// @desc    Obtiene un post por ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(404);
        throw new Error('ID de post no válido.');
    }

    const post = await Post.findById(req.params.id).populate('author', 'username role');

    if (post) {
        res.json(post);
    } else {
        res.status(404);
        throw new Error('Post no encontrado.');
    }
});

// @desc    Dar o quitar like a un post (Toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    // Verificar si el usuario ya dio like
    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
        // Quitar Like: Remover del array del post
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        post.numLikes = Math.max(0, post.numLikes - 1);

        // Quitar de likedItems del Usuario
        user.likedItems = user.likedItems.filter(item => 
            !(item.itemId.toString() === post._id.toString() && item.itemType === 'Post')
        );
    } else {
        // Dar Like: Añadir al array del post
        post.likes.push(req.user._id);
        post.numLikes += 1;

        // Añadir a likedItems del Usuario
        user.likedItems.push({ itemId: post._id, itemType: 'Post' });
    }

    await post.save();
    await user.save();

    res.json({ 
        message: alreadyLiked ? 'Like quitado' : 'Like añadido', 
        numLikes: post.numLikes,
        isLiked: !alreadyLiked
    });
});

// @desc    Actualiza un post (Solo Admin)
// @route   PUT /api/posts/:id
// @access  Private (Admin)
const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        const { title, content, isPublished, isPinned } = req.body;
        
        if (req.file) {
            try {
                if (post.cloudinaryId) await deleteImageFromCloudinary(post.cloudinaryId);
                const uploadResult = await uploadImageToCloudinary(req.file.path);
                post.imageUrl = uploadResult.url;
                post.cloudinaryId = uploadResult.publicId;
            } catch (error) {
                res.status(500);
                throw new Error('Error al actualizar imagen.');
            } finally {
                await fs.unlink(req.file.path);
            }
        }
        
        post.title = title || post.title;
        post.content = content || post.content;
        post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;
        post.isPinned = isPinned !== undefined ? isPinned : post.isPinned;

        const updatedPost = await post.save();
        res.json({ message: 'Post actualizado', post: updatedPost });
    } else {
        res.status(404);
        throw new Error('Post no encontrado.');
    }
});

// @desc    Elimina un post (Solo Admin)
// @route   DELETE /api/posts/:id
// @access  Private (Admin)
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        if (post.cloudinaryId) await deleteImageFromCloudinary(post.cloudinaryId);
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
    likePost // <-- Exportamos la nueva función
};