// backend/controllers/marketplaceController.js
const Publicacion = require('../models/Publicacion');

// GET /api/marketplace
const getPublicaciones = async (req, res) => {
    try {
        const publicaciones = await Publicacion.getAll();
        res.json(publicaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las publicaciones' });
    }
};

// POST /api/marketplace
const crearPublicacion = async (req, res) => {
    try {
        const {
            idAlumno, idMateria, descripcion,
            tipo, costo, ubicacion, correoContacto, telContacto
        } = req.body;

        if (!idAlumno || !descripcion || !tipo) {
            return res.status(400).json({ 
                message: 'Faltan campos obligatorios: idAlumno, descripcion, tipo' 
            });
        }

        if (!['Venta', 'Renta'].includes(tipo)) {
            return res.status(400).json({ 
                message: 'El tipo debe ser "Venta" o "Renta"' 
            });
        }

        const nuevoId = await Publicacion.create({
            idAlumno,
            idMateria: idMateria || null,
            descripcion,
            tipo,
            costo: costo || 0,
            ubicacion: ubicacion || null,
            correoContacto: correoContacto || null,
            telContacto: telContacto || null
        });

        res.status(201).json({ 
            message: 'Publicación creada exitosamente', 
            id: nuevoId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la publicación' });
    }
};

// GET /api/marketplace/alumno/:id
const getPublicacionesPorAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const publicaciones = await Publicacion.getByAlumno(id);
        res.json(publicaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las publicaciones del alumno' });
    }
};

// PUT /api/marketplace/:id
const actualizarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { idAlumno } = req.body; // Necesario para validar propiedad
        
        if (!idAlumno) return res.status(400).json({ message: 'Falta el idAlumno' });

        const afectadas = await Publicacion.update(id, idAlumno, req.body);
        
        if (afectadas === 0) {
            return res.status(404).json({ message: 'Publicación no encontrada o no autorizada' });
        }
        res.json({ message: 'Publicación actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la publicación' });
    }
};

// DELETE /api/marketplace/:id
const eliminarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { idAlumno } = req.query; // Lo enviaremos por query string
        
        if (!idAlumno) return res.status(400).json({ message: 'Falta el idAlumno' });

        const afectadas = await Publicacion.delete(id, idAlumno);
        
        if (afectadas === 0) {
            return res.status(404).json({ message: 'Publicación no encontrada o no autorizada' });
        }
        res.json({ message: 'Publicación eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la publicación' });
    }
};

// Modifica el module.exports al final del archivo:
module.exports = { 
    getPublicaciones, 
    crearPublicacion, 
    getPublicacionesPorAlumno,
    actualizarPublicacion,
    eliminarPublicacion 
};

