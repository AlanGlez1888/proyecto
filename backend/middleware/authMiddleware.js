const jwt = require('jsonwebtoken');
const { db } = require('../config/db.js');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: 'No se proporcionó un token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
        req.usuarioId = decoded.id || decoded.ID_Usuario; 

        // Verificar que la cuenta exista y no esté suspendida o baneada
        const [rows] = await db.query(
            'SELECT Rol, Estado FROM usuario WHERE ID_Usuario = ?',
            [req.usuarioId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const { Rol, Estado } = rows[0];

        if (Estado === 'suspendido' || Estado === 'baneado') {
            return res.status(403).json({ message: 'Acceso denegado. Su cuenta está suspendida o baneada.' });
        }

        req.usuarioRol = (Rol || 'alumno').toLowerCase();
        next();
    } catch (error) {
        console.error('Error en verifyToken:', error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

const requireRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuarioRol || !rolesPermitidos.includes(req.usuarioRol)) {
            return res.status(403).json({
                message: 'No tienes permisos suficientes para realizar esta acción.'
            });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };