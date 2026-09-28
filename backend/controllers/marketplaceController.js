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

module.exports = { getPublicaciones, crearPublicacion };