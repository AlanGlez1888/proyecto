// backend/routes/carreraRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerCarreras } = require('../controllers/carreraController');

// GET /api/carreras
router.get('/', obtenerCarreras);

module.exports = router;