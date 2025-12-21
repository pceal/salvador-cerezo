import Book from '../models/book.js';
import asyncHandler from 'express-async-handler';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs/promises';

/**
 * @desc    Registrar un nuevo libro con Logs de seguimiento para Debugging
 * @route   POST /api/books
 * @access  Private/Admin
 */
const createBook = asyncHandler(async (req, res) => {
    console.log('--- 🚀 Iniciando petición createBook ---');
    
    const { title, description, link } = req.body;
    console.log('📦 Datos del body:', { title, description, link });

    // Verificamos si Multer capturó el archivo
    if (!req.file) {
        console.log('❌ Error: No se recibió ningún archivo en req.file');
        res.status(400);
        throw new Error('Por favor, selecciona una imagen (archivo físico) para el libro');
    }

    console.log('📂 Archivo detectado temporalmente en:', req.file.path);

    try {
        // Paso 1: Cloudinary
        console.log('☁️ Paso 1: Intentando subir a Cloudinary...');
        const uploadResult = await uploadImageToCloudinary(req.file.path);
        console.log('✅ Paso 1 completado. URL obtenida:', uploadResult.url);
        
        // Paso 2: Borrar archivo local
        console.log('🗑️ Paso 2: Eliminando archivo temporal del servidor...');
        await fs.unlink(req.file.path);
        console.log('✅ Paso 2 completado.');

        // Paso 3: Guardar en Base de Datos
        console.log('💾 Paso 3: Guardando registro en MongoDB...');
        const book = await Book.create({
            title,
            description,
            link,
            imageUrl: uploadResult.url,
            cloudinaryId: uploadResult.publicId,
            author: req.user._id
        });

        console.log('🏁 FINALIZADO: Libro creado con éxito');
        
        // Enviamos la respuesta (Si esto no se ejecuta, Postman se queda cargando)
        return res.status(201).json(book);

    } catch (error) {
        console.error('🔥 ERROR EN EL PROCESO:', error.message);
        
        // Limpieza de emergencia del archivo local
        try {
            if (req.file) await fs.unlink(req.file.path);
        } catch (unlinkError) {
            console.error('No se pudo borrar el archivo temporal tras el error');
        }

        res.status(500);
        return res.json({ 
            error: true,
            message: error.message 
        });
    }
});

/**
 * @desc    Obtener todos los libros
 */
const getBooks = asyncHandler(async (req, res) => {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.json(books);
});

/**
 * @desc    Actualizar un libro
 */
const updateBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
        res.status(404);
        throw new Error('Libro no encontrado');
    }

    book.title = req.body.title || book.title;
    book.description = req.body.description || book.description;
    book.link = req.body.link || book.link;

    if (req.file) {
        if (book.cloudinaryId) await deleteImageFromCloudinary(book.cloudinaryId);
        const uploadResult = await uploadImageToCloudinary(req.file.path);
        await fs.unlink(req.file.path);
        book.imageUrl = uploadResult.url;
        book.cloudinaryId = uploadResult.publicId;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
});

/**
 * @desc    Eliminar un libro
 */
const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
        res.status(404);
        throw new Error('Libro no encontrado');
    }

    if (book.cloudinaryId) {
        await deleteImageFromCloudinary(book.cloudinaryId);
    }
    await book.deleteOne();
    res.json({ message: 'Libro eliminado correctamente' });
});

export { getBooks, createBook, updateBook, deleteBook };