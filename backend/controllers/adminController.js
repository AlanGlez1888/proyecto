const { db } = require('../config/db');

// 1. Crear reporte (incrementa Conteo si ya existe uno pendiente para el mismo elemento)
const crearReporte = async (req, res) => {
    try {
        const { id_pub, id_resena, id_usuario_reportado, motivo } = req.body;

        if (!id_pub && !id_resena && !id_usuario_reportado) {
            return res.status(400).json({ message: 'Debes indicar qué publicación, reseña o usuario deseas reportar.' });
        }

        let campo = 'ID_Pub';
        let valor = id_pub;

        if (id_resena) {
            campo = 'ID_Resena';
            valor = id_resena;
        } else if (id_usuario_reportado) {
            campo = 'ID_Usuario_Reportado';
            valor = id_usuario_reportado;
        }

        // Verificar si ya existe un reporte pendiente para ese mismo objetivo
        const [existentes] = await db.query(
            `SELECT ID_Reporte FROM reportes WHERE ${campo} = ? AND Estado = 'pendiente' LIMIT 1`,
            [valor]
        );

        if (existentes.length > 0) {
            await db.query(
                'UPDATE reportes SET Conteo = Conteo + 1, Motivo = COALESCE(?, Motivo) WHERE ID_Reporte = ?',
                [motivo || null, existentes[0].ID_Reporte]
            );
            return res.json({ message: 'Reporte registrado. Se incrementó el contador de reportes pendientes.' });
        }

        await db.query(
            `INSERT INTO reportes (${campo}, Conteo, Motivo, Estado) VALUES (?, 1, ?, 'pendiente')`,
            [valor, motivo || 'Contenido inapropiado']
        );

        res.status(201).json({ message: 'Reporte enviado correctamente.' });
    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({ message: 'Error al enviar el reporte.' });
    }
};

// 2. Obtener métricas para el panel de administración
const getMetricas = async (req, res) => {
    try {
        const [[usuariosActivos]] = await db.query(
            "SELECT COUNT(*) AS total FROM usuario WHERE Estado = 'activo'"
        );
        const [[usuariosSuspendidos]] = await db.query(
            "SELECT COUNT(*) AS total FROM usuario WHERE Estado != 'activo'"
        );
        const [[reportesPendientes]] = await db.query(
            "SELECT COUNT(*) AS total FROM reportes WHERE Estado = 'pendiente'"
        );
        const [porCategoria] = await db.query(`
            SELECT 
                m.ID_Mat AS id,
                m.Nombre_Mat AS categoria,
                COUNT(p.ID_Pub) AS total
            FROM materia m
            LEFT JOIN publicacion_market p ON m.ID_Mat = p.ID_Mat
            GROUP BY m.ID_Mat, m.Nombre_Mat
            ORDER BY total DESC
        `);

        res.json({
            usuariosActivos: usuariosActivos.total,
            usuariosSuspendidos: usuariosSuspendidos.total,
            reportesPendientes: reportesPendientes.total,
            publicacionesPorCategoria: porCategoria
        });
    } catch (error) {
        console.error('Error al obtener métricas:', error);
        res.status(500).json({ message: 'Error al cargar las métricas del sistema.' });
    }
};

// 3. Listar reportes pendientes para moderadores y administradores
const getReportesPendientes = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.ID_Reporte AS id,
                r.ID_Pub AS id_pub,
                r.ID_Resena AS id_resena,
                r.ID_Usuario_Reportado AS id_usuario_reportado,
                r.Conteo AS conteo,
                r.Motivo AS motivo,
                r.Estado AS estado,
                p.Descripcion AS pub_descripcion,
                res.Resena AS resena_contenido,
                u.Correo AS usuario_correo
            FROM reportes r
            LEFT JOIN publicacion_market p ON r.ID_Pub = p.ID_Pub
            LEFT JOIN resena res ON r.ID_Resena = res.ID_Resena
            LEFT JOIN usuario u ON r.ID_Usuario_Reportado = u.ID_Usuario
            WHERE r.Estado = 'pendiente'
            ORDER BY r.Conteo DESC, r.ID_Reporte DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al listar reportes:', error);
        res.status(500).json({ message: 'Error al obtener los reportes pendientes.' });
    }
};

// 4. Resolver reporte (descartar o eliminar contenido / suspender usuario)
const resolverReporte = async (req, res) => {
    const { id } = req.params;
    const { accion } = req.body; // 'descartar' o 'eliminar'

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT * FROM reportes WHERE ID_Reporte = ?',
            [id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Reporte no encontrado.' });
        }

        const reporte = rows[0];

        if (accion === 'eliminar') {
            // Limpiar llaves foráneas en reportes antes de eliminar el registro original
            await connection.query(
                "UPDATE reportes SET Estado = 'resuelto', ID_Pub = NULL, ID_Resena = NULL WHERE ID_Reporte = ?",
                [id]
            );

            if (reporte.ID_Pub) {
                await connection.query('DELETE FROM solicitud_publicacion WHERE ID_Pub = ?', [reporte.ID_Pub]);
                await connection.query('DELETE FROM publicacion_market WHERE ID_Pub = ?', [reporte.ID_Pub]);
            } else if (reporte.ID_Resena) {
                await connection.query('DELETE FROM resena WHERE ID_Resena = ?', [reporte.ID_Resena]);
            } else if (reporte.ID_Usuario_Reportado) {
                await connection.query(
                    "UPDATE usuario SET Estado = 'suspendido' WHERE ID_Usuario = ?",
                    [reporte.ID_Usuario_Reportado]
                );
            }
        } else {
            await connection.query(
                "UPDATE reportes SET Estado = 'descartado' WHERE ID_Reporte = ?",
                [id]
            );
        }

        await connection.commit();
        res.json({ message: 'Reporte atendido correctamente.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al resolver reporte:', error);
        res.status(500).json({ message: 'Error al procesar la acción sobre el reporte.' });
    } finally {
        connection.release();
    }
};

// 5. Listar usuarios y actualizar su rol o estado (activo, suspendido, baneado)
const getUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                u.ID_Usuario AS id,
                u.Correo AS correo,
                LOWER(u.Rol) AS rol,
                LOWER(u.Estado) AS estado,
                CONCAT_WS(' ', a.Nombre_Alumno, a.APat_Alumno, a.AMat_Alumno) AS nombre
            FROM usuario u
            LEFT JOIN alumno a ON u.ID_Usuario = a.ID_Usuario
            ORDER BY u.ID_Usuario DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al cargar la lista de usuarios.' });
    }
};

const actualizarUsuarioAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol, estado } = req.body;

        await db.query(
            'UPDATE usuario SET Rol = ?, Estado = ? WHERE ID_Usuario = ?',
            [rol, estado, id]
        );
        res.json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario.' });
    }
};

// 6. Gestión de categorías (tabla materia)
const crearCategoria = async (req, res) => {
    try {
        const { nombre, semestre, creditos } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre de la categoría es obligatorio.' });
        }

        await db.query(
            'INSERT INTO materia (Nombre_Mat, Semestre_Mat, Creditos_Mat) VALUES (?, ?, ?)',
            [nombre.trim(), Number(semestre) || 1, Number(creditos) || 5]
        );
        res.status(201).json({ message: 'Categoría creada correctamente.' });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ message: 'Error al crear la categoría.' });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM materia WHERE ID_Mat = ?', [id]);
        res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: 'No se puede eliminar porque esta materia tiene artículos o profesores asignados.'
            });
        }
        res.status(500).json({ message: 'Error al eliminar la categoría.' });
    }
};

module.exports = {
    crearReporte,
    getMetricas,
    getReportesPendientes,
    resolverReporte,
    getUsuarios,
    actualizarUsuarioAdmin,
    crearCategoria,
    eliminarCategoria
};