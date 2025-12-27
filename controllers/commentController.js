import Comment from '../models/Comment.js'; 
import Post from '../models/post.js';
import User from '../models/user.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/**
 * @desc    Crear un comentario o una respuesta
 * @route   POST /api/posts/:postId/comments
 * @access  Private
 */
const createComment = asyncHandler(async (req, res) => {
    const { content, parentId } = req.body;
    const { postId } = req.params;

    if (!content) {
        res.status(400);
        throw new Error('El contenido del comentario es obligatorio.');
    }

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado.');
    }

    const commentData = {
        content,
        user: req.user._id,
        post: postId,
    };

    // Si viene un parentId, es una respuesta a otro comentario
    if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            res.status(400);
            throw new Error('ID de comentario padre no válido.');
        }
        commentData.parentId = parentId;
    }

    const comment = await Comment.create(commentData);

    // Incrementar contador de comentarios en el post
    post.numComments += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username');

    res.status(201).json(populatedComment);
});

/**
 * @desc    Obtener comentarios de un post
 * @route   GET /api/posts/:postId/comments
 * @access  Public
 */
const getCommentsByPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400);
        throw new Error('ID de post no válido.');
    }

    // Buscamos comentarios del post, ordenados por fecha
    // Puedes luego filtrar en el frontend para anidarlos por parentId
    const comments = await Comment.find({ post: postId })
        .populate('user', 'username')
        .sort({ createdAt: -1 });

    res.json(comments);
});

/**
 * @desc    Dar o quitar like a un COMENTARIO (Toggle)
 * @route   PUT /api/posts/comments/:id/like
 * @access  Private
 */
const likeComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Validar ID de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('ID de comentario no válido.');
    }

    // 2. Buscar comentario y usuario
    const comment = await Comment.findById(id);
    const user = await User.findById(req.user._id);

    if (!comment) {
        res.status(404);
        throw new Error('Comentario no encontrado.');
    }

    // Asegurar que existan los campos necesarios por si hay datos viejos en la DB
    if (!comment.likes) comment.likes = [];
    if (comment.numLikes === undefined) comment.numLikes = 0;
    if (!user.likedItems) user.likedItems = [];

    // 3. Verificar si el usuario ya dio like
    const alreadyLiked = comment.likes.some(likeId => likeId.toString() === req.user._id.toString());

    if (alreadyLiked) {
        // --- QUITAR LIKE ---
        comment.likes = comment.likes.filter(likeId => likeId.toString() !== req.user._id.toString());
        comment.numLikes = Math.max(0, comment.numLikes - 1);

        // Quitar de la actividad del usuario
        user.likedItems = user.likedItems.filter(item => 
            !(item.itemId.toString() === comment._id.toString() && item.itemType === 'Comment')
        );
    } else {
        // --- AÑADIR LIKE ---
        comment.likes.push(req.user._id);
        comment.numLikes += 1;

        // Añadir a la actividad del usuario
        user.likedItems.push({ 
            itemId: comment._id, 
            itemType: 'Comment' 
        });
    }

    // 4. Guardar ambos documentos
    await comment.save();
    await user.save();

    res.json({ 
        message: alreadyLiked ? 'Like quitado' : 'Like añadido', 
        numLikes: comment.numLikes,
        isLiked: !alreadyLiked
    });
});

export { createComment, getCommentsByPost, likeComment };