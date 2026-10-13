// backend/routes/marketplaceRoutes.js
const express = require('express');
const router = express.Router();
const { getPublicaciones, crearPublicacion } = require('../controllers/marketplaceController');

router.get('/', getPublicaciones);
router.post('/', crearPublicacion);

module.exports = router;