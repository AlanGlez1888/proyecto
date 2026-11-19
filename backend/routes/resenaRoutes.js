// backendroutes/resenaRoutes.js
const express = require('express');
const router = express.Router();
const { getResenas, crearResena, getProfesoresMaterias } = require('../controllers/resenaController');

router.get('/', getResenas);
router.post('/', crearResena);
router.get('/clases', getProfesoresMaterias);

module.exports = router;