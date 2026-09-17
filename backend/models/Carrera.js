// backend/models/Carrera.js
const { db } = require('../config/db');

const Carrera = {
    // Obtener todas las carreras (departamentos)
    getTodasCarreras: async () => {
        const query = 'SELECT ID_Carrera AS id, Nom_Carrera AS nombre FROM carrera';
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = Carrera;