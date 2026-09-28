// backend/routes/materiaRoutes.js
const express = require('express');
const router = express.Router();
const { getMaterias } = require('../controllers/materiaController');

router.get('/', getMaterias);

module.exports = router;