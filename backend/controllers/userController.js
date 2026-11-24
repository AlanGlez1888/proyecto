const { db } = require('../config/db');

// 1. Obtener datos actuales del perfil con alias consistentes
const getProfile = async (req, res) => {
    try {
        const idUsuario = req.usuarioId;

        const query = `
            SELECT 
                u.Correo AS correo,
                u.Rol AS rol,
                a.ID_Alumno AS id_alumno,
                a.Nombre_Alumno AS nombre,
                a.APat_Alumno AS apellido_paterno,
                a.AMat_Alumno AS apellido_materno,
                a.Semestre AS semestre,
                a.ID_Carrera AS id_carrera,
                c.Nom_Carrera AS carrera
            FROM usuario u
            INNER JOIN alumno a ON u.ID_Usuario = a.ID_Usuario
            INNER JOIN carrera c ON a.ID_Carrera = c.ID_Carrera
            WHERE u.ID_Usuario = ?
        `;

        const [rows] = await db.query(query, [idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

// 2. Obtener lista de carreras
const getCarreras = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT ID_Carrera AS id, Nom_Carrera AS nombre FROM carrera'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({ message: 'Error al obtener las carreras' });
    }
};

// 3. Actualizar perfil en usuario y alumno
const updateProfile = async (req, res) => {
    const idUsuario = req.usuarioId;
    const {
        nombre,
        apellido_paterno,
        apellido_materno,
        id_carrera,
        semestre,
        correo
    } = req.body;

    if (!id_carrera) {
        return res.status(400).json({ message: 'Selecciona una carrera válida.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE usuario SET Correo = ? WHERE ID_Usuario = ?',
            [correo?.trim(), idUsuario]
        );

        await connection.query(
            `UPDATE alumno 
             SET Nombre_Alumno = ?, APat_Alumno = ?, AMat_Alumno = ?, ID_Carrera = ?, Semestre = ? 
             WHERE ID_Usuario = ?`,
            [
                nombre?.trim() || '',
                apellido_paterno?.trim() || null,
                apellido_materno?.trim() || null,
                Number(id_carrera),
                Number(semestre),
                idUsuario
            ]
        );

        await connection.commit();

        res.json({
            message: 'Perfil actualizado correctamente',
            user: {
                correo: correo?.trim(),
                nombreCompleto: `${nombre?.trim() || ''} ${apellido_paterno?.trim() || ''}`.trim()
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar perfil:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ese correo ya está en uso por otra cuenta' });
        }
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    } finally {
        connection.release();
    }
};

//4. Obtener mis publicaciones (mis publicaciones en marketplace)
const getMyPublications = async (req, res) => {
    try{
        const idUsuario = req.usuarioId;
        
        const query = `
            SELECT 
                p.ID_Pub AS id,
                p.Descripcion AS title,
                LOWER(p.Tipo) AS type,
                p.Costo AS price,
                p.Ubicacion AS location,
                CAST(p.ID_Mat AS CHAR) AS subject
            FROM publicacion_market p
            INNER JOIN alumno a ON p.ID_Alumno = a.ID_Alumno
            WHERE a.ID_Usuario = ?
            ORDER BY p.ID_Pub DESC
        `;

        const [rows] = await db.query(query, [idUsuario]);
        res.json(rows);
    }
    catch(error){
        console.error('Error al obtener mis publicaciones:', error);
        res.status(500).json({ message: 'Error al obtener mis publicaciones' });
    }
}

// 5. Eliminar un artículo propio
const deleteMyItem = async (req, res) => {
    try {
        const idUsuario = req.usuarioId;
        const { id } = req.params;

        const query = `
            DELETE p FROM publicacion_market p
            INNER JOIN alumno a ON p.ID_Alumno = a.ID_Alumno
            WHERE p.ID_Pub = ? AND a.ID_Usuario = ?
        `;

        const [result] = await db.query(query, [id, idUsuario]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Artículo no encontrado o no tienes permiso para eliminarlo' });
        }

        res.json({ message: 'Artículo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar artículo:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: 'No se puede eliminar porque este artículo tiene solicitudes o reportes asociados.'
            });
        }
        res.status(500).json({ message: error.sqlMessage || 'Error al eliminar el artículo' });
    }
};

// 6. Obtener reseñas de profesores hechas por el alumno logueado
const getMyReviews = async (req, res) => {
    try {
        const idUsuario = req.usuarioId;

        const query = `
            SELECT 
                r.ID_Resena AS id,
                r.Puntaje AS rating,
                r.Resena AS content,
                CONCAT_WS(' ', NULLIF(a.Nombre_Alumno, ''), NULLIF(a.APat_Alumno, ''), NULLIF(a.AMat_Alumno, '')) AS author,
                CONCAT_WS(' ', NULLIF(p.Titulo, ''), NULLIF(p.Nombre_Prof, ''), NULLIF(p.APat_Prof, ''), NULLIF(p.AMat_Prof, '')) AS teacher,
                m.Nombre_Mat AS subject,
                0 AS likes
            FROM resena r
            INNER JOIN alumno a ON r.ID_Alumno = a.ID_Alumno
            INNER JOIN profesor_materia pm ON r.ID_Prof_Mat = pm.ID_Prof_Mat
            INNER JOIN profesor p ON pm.ID_Prof = p.ID_Prof
            INNER JOIN materia m ON pm.ID_Mat = m.ID_Mat
            WHERE a.ID_Usuario = ?
            ORDER BY r.ID_Resena DESC
        `;

        const [rows] = await db.query(query, [idUsuario]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener reseñas del usuario:', error);
        res.status(500).json({ message: 'Error al obtener tus reseñas' });
    }
};

// 7. Eliminar una reseña propia
const deleteMyReview = async (req, res) => {
    try {
        const idUsuario = req.usuarioId;
        const { id } = req.params;

        const query = `
            DELETE r FROM resena r
            INNER JOIN alumno a ON r.ID_Alumno = a.ID_Alumno
            WHERE r.ID_Resena = ? AND a.ID_Usuario = ?
        `;

        const [result] = await db.query(query, [id, idUsuario]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada o no tienes permiso para eliminarla' });
        }

        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({ message: 'Error al eliminar la reseña' });
    }
};

module.exports = { getProfile, getCarreras, updateProfile, getMyPublications, deleteMyItem, getMyReviews, deleteMyReview };