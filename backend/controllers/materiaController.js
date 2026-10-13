// backend/controllers/materiaController.js
const { db } = require('../config/db.js');

const getMaterias = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT ID_Mat AS id, Nombre_Mat AS nombre FROM materia'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener materias' });
    }
};

module.exports = { getMaterias };