// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protegemos la ruta pasándole el verifyToken en medio
router.get('/perfil', verifyToken, getProfile);

module.exports = router;