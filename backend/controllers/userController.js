// backend/controllers/userController.js
const { db } = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const idUsuario = req.usuarioId; // Obtenido del middleware

        const query = `
            SELECT 
                u.Correo, u.Rol, 
                a.Nombre_Alumno, a.APat_Alumno, a.AMat_Alumno, 
                a.Semestre, c.Nom_Carrera
            FROM usuario u
            INNER JOIN alumno a ON u.ID_Usuario = a.ID_Usuario
            INNER JOIN carrera c ON a.Id_Carrera = c.Id_carrera
            WHERE u.ID_Usuario = ?
        `;

        const [rows] = await db.query(query, [idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

module.exports = { getProfile };