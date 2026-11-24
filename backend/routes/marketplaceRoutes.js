const express = require('express');
const router = express.Router();
const { 
    getPublicaciones, 
    crearPublicacion, 
    getPublicacionesPorAlumno,
    actualizarPublicacion,
    eliminarPublicacion
} = require('../controllers/marketplaceController');
const { filtrarContenido } = require('../middleware/contentFilter');

router.get('/', getPublicaciones);
router.post('/', filtrarContenido, crearPublicacion);
router.get('/alumno/:id', getPublicacionesPorAlumno);
router.put('/:id', filtrarContenido, actualizarPublicacion); // <-- NUEVA
router.delete('/:id', eliminarPublicacion); // <-- NUEVA

module.exports = router;