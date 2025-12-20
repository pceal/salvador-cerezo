import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Referencia al modelo de Usuario
  },
  title: {
    type: String,
    required: [true, 'El título del post es obligatorio'],
    trim: true,
    minlength: [5, 'El título debe tener al menos 5 caracteres.'],
  },
  content: {
    type: String,
    required: [true, 'El contenido del post es obligatorio.'],
    minlength: [20, 'El contenido debe tener al menos 20 caracteres.'],
  },
  imageUrl: {
    type: String,
    // La URL de la imagen subida a Cloudinary. No es obligatoria.
  },
  cloudinaryId: {
    type: String,
    // El ID público de Cloudinary, necesario para eliminar la imagen
  },
  numLikes: {
    type: Number,
    required: true,
    default: 0,
  },
  // Array de usuarios que han dado 'like'. Esto puede ser útil para
  // evitar que un usuario de 'like' dos veces y para desglosar quién dio 'like'.
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  numComments: {
    type: Number,
    required: true,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true, // Por defecto, el post se publica al crearse
  },
  isPinned: {
    type: Boolean,
    default: false, // Indica si el post debe aparecer fijo en la parte superior
  },
}, {
  timestamps: true, // Añade automáticamente `createdAt` y `updatedAt`
});

// Nota: No se está utilizando un hook 'pre-save' para incrementar/decrementar numLikes o numComments
// porque es mejor manejar esa lógica en los controladores para tener más control transaccional.

const Post = mongoose.model('Post', postSchema);
export default Post;