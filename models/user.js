
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define el esquema para los Usuarios
const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    // AÑADIDO: Array para almacenar tokens de sesión activos
    tokens: [{ 
        type: String 
    }],
    // Propiedad para el sistema de likes
    likedItems: [{ 
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
        itemType: { type: String, required: true, enum: ['Post', 'Comment'] }
    }],
}, {
    timestamps: true // Añade createdAt y updatedAt
});

// --------------------------------------------------------------------
// MIDDLEWARE DE MONGOOSE: Encriptar la contraseña antes de guardar (pre-save hook)
// --------------------------------------------------------------------

// ESTE FORMATO ES EL ÚNICO CORRECTO: USA 'function(next)' para acceder a 'this' y a 'next'
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --------------------------------------------------------------------
// MÉTODOS DEL MODELO: Para comparar contraseñas
// --------------------------------------------------------------------

// Método para comparar la contraseña ingresada con la hasheada en la DB
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);
export default User;