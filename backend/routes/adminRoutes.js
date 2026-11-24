const express = require('express');
const router = express.Router();
const {
    crearReporte,
    getMetricas,
    getReportesPendientes,
    resolverReporte,
    getUsuarios,
    actualizarUsuarioAdmin,
    crearCategoria,
    eliminarCategoria
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Cualquier alumno autenticado puede enviar reportes
router.post('/reportes', verifyToken, crearReporte);

// Moderadores y Administradores pueden ver métricas y atender reportes
router.get('/metricas', verifyToken, requireRole('moderador', 'administrador'), getMetricas);
router.get('/reportes', verifyToken, requireRole('moderador', 'administrador'), getReportesPendientes);
router.put('/reportes/:id', verifyToken, requireRole('moderador', 'administrador'), resolverReporte);

// Solo Administradores pueden cambiar roles, suspender/banear usuarios y gestionar categorías
router.get('/usuarios', verifyToken, requireRole('administrador'), getUsuarios);
router.put('/usuarios/:id', verifyToken, requireRole('administrador'), actualizarUsuarioAdmin);
router.post('/categorias', verifyToken, requireRole('administrador'), crearCategoria);
router.delete('/categorias/:id', verifyToken, requireRole('administrador'), eliminarCategoria);

module.exports = router;