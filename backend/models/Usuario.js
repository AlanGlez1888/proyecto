// backend/models/Usuario.js
const { db } = require('../config/db.js');

const Usuario = {
    // Buscar un usuario por su correo
    findByCorreo: async (correo) => {
        const query = 'SELECT * FROM usuario WHERE correo = ?';
        const [rows] = await db.query(query, [correo]);
        return rows[0]; // Retorna el primer usuario encontrado o undefined
    }
};

module.exports = Usuario;