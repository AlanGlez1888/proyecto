// backendroutes/resenaRoutes.js
const express = require('express');
const router = express.Router();
const { getResenas, crearResena, getProfesoresMaterias } = require('../controllers/resenaController');
const { filtrarContenido } = require('../middleware/contentFilter');

router.get('/', getResenas);
router.post('/', filtrarContenido, crearResena);
router.get('/clases', getProfesoresMaterias);

module.exports = router;