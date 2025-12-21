import Event from '../models/event.js';
import asyncHandler from 'express-async-handler';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs/promises';

// @desc    Obtener todos los eventos
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
});

// @desc    Crear un evento (Solo Admin)
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, allowsAttendance } = req.body;

    const eventData = {
        title,
        description,
        date,
        location,
        allowsAttendance: allowsAttendance === 'true' || allowsAttendance === true,
        createdBy: req.user._id,
        images: [],
        videos: []
    };

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadImageToCloudinary(file.path);
            await fs.unlink(file.path);
            
            if (file.mimetype.startsWith('video')) {
                eventData.videos.push({ url: result.url, cloudinaryId: result.publicId });
            } else {
                eventData.images.push({ url: result.url, cloudinaryId: result.publicId });
            }
        }
    }

    const event = await Event.create(eventData);
    res.status(201).json(event);
});

// @desc    Actualizar un evento (Solo Admin)
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Evento no encontrado');
    }

    // Actualizar campos de texto
    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.location = req.body.location || event.location;
    
    if (req.body.allowsAttendance !== undefined) {
        event.allowsAttendance = req.body.allowsAttendance === 'true' || req.body.allowsAttendance === true;
    }

    // Si se suben nuevos archivos
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadImageToCloudinary(file.path);
            await fs.unlink(file.path);
            
            if (file.mimetype.startsWith('video')) {
                event.videos.push({ url: result.url, cloudinaryId: result.publicId });
            } else {
                event.images.push({ url: result.url, cloudinaryId: result.publicId });
            }
        }
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});

// @desc    Confirmar asistencia a un evento (Toggle)
// @route   POST /api/events/:id/attend
// @access  Private
const toggleAttendance = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Evento no encontrado');
    }

    if (!event.allowsAttendance) {
        res.status(400);
        throw new Error('Este evento no permite confirmación de asistencia');
    }

    const alreadyAttending = event.attendees.includes(req.user._id);

    if (alreadyAttending) {
        event.attendees = event.attendees.filter(
            (id) => id.toString() !== req.user._id.toString()
        );
    } else {
        event.attendees.push(req.user._id);
    }

    await event.save();
    res.json({ 
        attending: !alreadyAttending, 
        count: event.attendees.length 
    });
});

// @desc    Eliminar evento (Solo Admin)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
        res.status(404);
        throw new Error('Evento no encontrado');
    }

    // Limpiar archivos de Cloudinary antes de borrar
    const allMedia = [...event.images, ...event.videos];
    for (const item of allMedia) {
        if (item.cloudinaryId) {
            await deleteImageFromCloudinary(item.cloudinaryId);
        }
    }

    await event.deleteOne();
    res.json({ message: 'Evento y multimedia eliminados correctamente' });
});

export { getEvents, createEvent, updateEvent, toggleAttendance, deleteEvent };