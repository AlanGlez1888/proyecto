// backend/controllers/carreraController.js
const Carrera = require('../models/Carrera');

const obtenerCarreras = async (req, res) => {
    try {
        const carreras = await Carrera.getTodasCarreras();
        res.json(carreras);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las carreras' });
    }
};

module.exports = { obtenerCarreras };