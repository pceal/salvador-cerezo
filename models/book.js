import mongoose from 'mongoose';

const bookSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'El título es obligatorio'] 
    },
    description: { 
        type: String, 
        required: [true, 'La descripción es obligatoria'] 
    },
    imageUrl: { 
        type: String, 
        required: [true, 'La imagen es obligatoria'] 
    },
    cloudinaryId: { 
        type: String 
    },
    link: { 
        type: String, 
        required: [true, 'El enlace de compra o descarga es obligatorio'] 
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;