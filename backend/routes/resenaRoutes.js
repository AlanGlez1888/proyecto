// backendroutes/resenaRoutes.js
const express = require('express');
const router = express.Router();
const { getResenas, crearResena, getProfesoresMaterias, getMaestros, getMaestroDetalle} = require('../controllers/resenaController');
const { filtrarContenido } = require('../middleware/contentFilter');

router.get('/', getResenas);
router.post('/', filtrarContenido, crearResena);
router.get('/clases', getProfesoresMaterias);
router.get('/maestros', getMaestros);
router.get('/maestros/:id', getMaestroDetalle);

module.exports = router;