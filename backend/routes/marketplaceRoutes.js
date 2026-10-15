const express = require('express');
const router = express.Router();
const { 
    getPublicaciones, 
    crearPublicacion, 
    getPublicacionesPorAlumno,
    actualizarPublicacion,
    eliminarPublicacion
} = require('../controllers/marketplaceController');

router.get('/', getPublicaciones);
router.post('/', crearPublicacion);
router.get('/alumno/:id', getPublicacionesPorAlumno);
router.put('/:id', actualizarPublicacion); // <-- NUEVA
router.delete('/:id', eliminarPublicacion); // <-- NUEVA

module.exports = router;