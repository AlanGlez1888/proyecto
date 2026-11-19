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

module.exports = { getResenas, crearResena, getProfesoresMaterias };