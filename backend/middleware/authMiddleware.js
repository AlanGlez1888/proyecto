// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // El frontend enviará el token en el header "Authorization"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: 'No se proporcionó un token.' });
    }

    // El token llega con el formato "Bearer eyJhbGci..." así que lo separamos
    const token = authHeader.split(' ')[1];

    try {
        // Desencriptamos el token. OJO: Usa tu mismo JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
        
        // Guardamos el ID del usuario en la request para que el controlador lo pueda usar
        req.usuarioId = decoded.id; 
        next(); // Permitir que pase al controlador
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = { verifyToken };