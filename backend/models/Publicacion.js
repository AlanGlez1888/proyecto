// backend/models/Publicacion.js
const { db } = require('../config/db.js');

const Publicacion = {
    // Obtener todas las publicaciones con datos del alumno y materia
    getAll: async () => {
        const query = `
            SELECT 
                p.ID_Pub            AS id,
                p.Descripcion       AS descripcion,
                p.Tipo              AS tipo,
                p.Costo             AS costo,
                p.Ubicacion         AS ubicacion,
                p.Correo_Contacto   AS correoContacto,
                p.Tel_Contacto      AS telContacto,
                p.ID_Mat            AS idMateria,
                m.Nombre_Mat        AS materia,
                a.ID_Alumno         AS idAlumno,
                CONCAT(a.Nombre_Alumno, ' ', a.APat_Alumno) AS vendedor
            FROM publicacion_market p
            LEFT JOIN alumno a ON p.ID_Alumno = a.ID_Alumno
            LEFT JOIN materia m ON p.ID_Mat = m.ID_Mat
            ORDER BY p.ID_Pub DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Crear una nueva publicación
    create: async (data) => {
        const {
            idAlumno, idMateria, descripcion,
            tipo, costo, ubicacion, correoContacto, telContacto
        } = data;

        const query = `
            INSERT INTO publicacion_market 
            (ID_Alumno, ID_Mat, Descripcion, Tipo, Costo, Ubicacion, Correo_Contacto, Tel_Contacto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            idAlumno, idMateria, descripcion,
            tipo, costo, ubicacion, correoContacto, telContacto
        ]);
        return result.insertId;
    }
};

module.exports = Publicacion;