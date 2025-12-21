import Comment from '../models/comment.js';
import Post from '../models/post.js';
import asyncHandler from 'express-async-handler';

// @desc    Crear un nuevo comentario en un post (o respuesta)
// @route   POST /api/posts/:postId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
    const { content, parentId } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    // 1. Crear el comentario
    const comment = await Comment.create({
        post: postId,
        user: req.user._id,
        content,
        parentId: parentId || null
    });

    // 2. Incrementar contador en el post
    post.numComments += 1;
    await post.save();

    // 3. Devolver el comentario con info del autor Y del padre (si existe)
    const populatedComment = await Comment.findById(comment._id)
        .populate('user', 'username')
        .populate({
            path: 'parentId',
            select: 'user',
            populate: { path: 'user', select: 'username' }
        });

    res.status(201).json(populatedComment);
});

// @desc    Obtener comentarios de un post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getCommentsByPost = asyncHandler(async (req, res) => {
    const comments = await Comment.find({ post: req.params.postId })
        .populate('user', 'username')
        .populate({
            path: 'parentId',
            select: 'user',
            populate: { path: 'user', select: 'username' }
        })
        .sort({ createdAt: -1 });

    res.json(comments);
});

// @desc    Dar o quitar Like a un comentario (o respuesta)
// @route   PUT /api/posts/comments/:id/like
// @access  Private
const likeComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404);
        throw new Error('Comentario no encontrado');
    }

    // Asegurarse de que el array de likes existe en el modelo
    if (!comment.likes) {
        comment.likes = [];
    }

    // Verificar si el usuario ya dio like
    const alreadyLiked = comment.likes.find(
        (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
        // Quitar like (Soporte para Toggle)
        comment.likes = comment.likes.filter(
            (id) => id.toString() !== req.user._id.toString()
        );
    } else {
        // Añadir like
        comment.likes.push(req.user._id);
    }

    await comment.save();
    
    res.json({ 
        message: alreadyLiked ? 'Like quitado' : 'Like añadido',
        likesCount: comment.likes.length 
    });
});

export { createComment, getCommentsByPost, likeComment };