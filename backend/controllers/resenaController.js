const { db } = require('../config/db');

const getResenas = async (req, res) => {
    try {
        const [opiniones] = await db.query(`
            SELECT r.ID_Resena as id, r.Puntaje as rating, r.Resena as content,
                   a.Nombre_Alumno as author,
                   CONCAT(p.Nombre_Prof, ' ', p.APat_Prof) as teacher, 
                   m.Nombre_Mat as subject
            FROM resena r
            INNER JOIN alumno a ON r.ID_Alumno = a.ID_Alumno
            INNER JOIN profesor_materia pm ON r.ID_Prof_Mat = pm.ID_Prof_Mat
            INNER JOIN profesor p ON pm.ID_Prof = p.ID_Prof
            INNER JOIN materia m ON pm.ID_Mat = m.ID_Mat
            ORDER BY r.ID_Resena DESC
        `);
        res.json(opiniones);
    } catch (error) {
        console.error("Error exacto en getResenas:", error); // Línea clave
        res.status(500).json({ message: 'Error al obtener reseñas' });
    }
};

const crearResena = async (req, res) => {
    try {
        const { ID_Alumno, ID_Prof_Mat, Puntaje, Resena_texto } = req.body;

        if (!ID_Alumno || !ID_Prof_Mat || !Puntaje || !Resena_texto) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const [result] = await db.query(
            'INSERT INTO resena (ID_Alumno, ID_Prof_Mat, Puntaje, Resena) VALUES (?, ?, ?, ?)',
            [ID_Alumno, ID_Prof_Mat, Puntaje, Resena_texto]
        );
        console.log("Usuario ",ID_Alumno);

        res.status(201).json({ message: 'Reseña publicada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al publicar la reseña' });
    }
};

const getProfesoresMaterias = async (req, res) => {
    try {
        const [clases] = await db.query(`
            SELECT pm.ID_Prof_Mat, p.Nombre_Prof, p.APat_Prof, m.Nombre_Mat 
            FROM profesor_materia pm
            INNER JOIN profesor p ON pm.ID_Prof = p.ID_Prof
            INNER JOIN materia m ON pm.ID_Mat = m.ID_Mat
        `);
        res.json(clases);
    } catch (error) {
        console.error("Error exacto en getProfesoresMaterias:", error); // Línea clave
        res.status(500).json({ message: 'Error al obtener clases' });
    }
};

const getMaestros = async (req, res) => {
    try {
        const [maestros] = await db.query(`
            SELECT 
                pm.ID_Prof_Mat AS id,
                p.ID_Prof AS teacherId,
                CONCAT(p.Nombre_Prof, ' ', p.APat_Prof) AS name,
                m.Nombre_Mat AS subject,
                COALESCE(ROUND(AVG(r.Puntaje), 1), 0) AS rating
            FROM profesor_materia pm
            INNER JOIN profesor p ON pm.ID_Prof = p.ID_Prof
            INNER JOIN materia m ON pm.ID_Mat = m.ID_Mat
            LEFT JOIN resena r ON pm.ID_Prof_Mat = r.ID_Prof_Mat
            GROUP BY pm.ID_Prof_Mat, p.ID_Prof, p.Nombre_Prof, p.APat_Prof, m.Nombre_Mat
            ORDER BY name ASC
        `);
        res.json(maestros);
    } catch (error) {
        console.error("Error exacto en getMaestros:", error);
        res.status(500).json({ message: 'Error al obtener maestros' });
    }
};

const getMaestroDetalle = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Datos del maestro, materia y promedio
        const [maestros] = await db.query(`
            SELECT 
                pm.ID_Prof_Mat AS id,
                CONCAT(p.Nombre_Prof, ' ', p.APat_Prof) AS name,
                m.Nombre_Mat AS subject,
                COALESCE(ROUND(AVG(r.Puntaje), 1), 0) AS rating
            FROM profesor_materia pm
            INNER JOIN profesor p ON pm.ID_Prof = p.ID_Prof
            INNER JOIN materia m ON pm.ID_Mat = m.ID_Mat
            LEFT JOIN resena r ON pm.ID_Prof_Mat = r.ID_Prof_Mat
            WHERE pm.ID_Prof_Mat = ?
            GROUP BY pm.ID_Prof_Mat, p.Nombre_Prof, p.APat_Prof, m.Nombre_Mat
        `, [id]);

        if (maestros.length === 0) {
            return res.status(404).json({ message: 'Maestro no encontrado' });
        }

        // 2. Reseñas de esa clase en específico
        const [comments] = await db.query(`
            SELECT 
                r.ID_Resena AS id,
                r.Puntaje AS rating,
                r.Resena AS content,
                a.Nombre_Alumno AS author,
                CONCAT(p.Nombre_Prof, ' ', p.APat_Prof) AS teacher,
                m.Nombre_Mat AS subject
            FROM resena r
            INNER JOIN alumno a ON r.ID_Alumno = a.ID_Alumno
            INNER JOIN profesor_materia pm ON r.ID_Prof_Mat = pm.ID_Prof_Mat
            INNER JOIN profesor p ON pm.ID_Prof = p.ID_Prof
            INNER JOIN materia m ON pm.ID_Mat = m.ID_Mat
            WHERE r.ID_Prof_Mat = ?
            ORDER BY r.ID_Resena DESC
        `, [id]);

        res.json({
            teacher: maestros[0],
            comments
        });
    } catch (error) {
        console.error("Error exacto en getMaestroDetalle:", error);
        res.status(500).json({ message: 'Error al obtener el detalle del maestro' });
    }
};

module.exports = { getResenas, crearResena, getProfesoresMaterias, getMaestros, getMaestroDetalle };