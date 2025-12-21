import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'El título es obligatorio'] 
    },
    description: { 
        type: String, 
        required: [true, 'La descripción es obligatoria'] 
    },
    date: { 
        type: Date, 
        required: [true, 'La fecha es obligatoria'] 
    },
    location: { 
        type: String, 
        required: [true, 'El lugar es obligatorio'] 
    },
    // Multimedia: Guardaremos arrays de URLs
    images: [{ 
        url: String, 
        cloudinaryId: String 
    }],
    videos: [{ 
        url: String, 
        cloudinaryId: String 
    }],
    // Configuración: ¿Permite confirmar asistencia?
    allowsAttendance: { 
        type: Boolean, 
        default: false 
    },
    // Lista de IDs de usuarios que asistirán
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;