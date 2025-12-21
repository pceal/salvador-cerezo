import mongoose from 'mongoose';

/**
 * Esquema para los Comentarios y Respuestas.
 * Se utiliza el mismo modelo para ambos niveles.
 */
const commentSchema = mongoose.Schema({
    // Referencia al post donde se comenta
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    // Referencia al usuario que escribe el comentario
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // Contenido del comentario
    content: {
        type: String,
        required: [true, 'El contenido del comentario es obligatorio'],
        trim: true
    },
    /**
     * Referencia a otro comentario si es una respuesta.
     * Si es null, es un comentario de primer nivel.
     */
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    /**
     * Array de IDs de usuarios que dieron Like.
     * Utilizado por la función likeComment en el controlador.
     */
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    // Crea automáticamente campos createdAt y updatedAt
    timestamps: true
});

// Middleware opcional: Podrías añadir lógica para limpiar respuestas si se borra el padre
// Aunque por ahora manejaremos la integridad desde los controladores.

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;