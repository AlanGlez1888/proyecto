// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { register } = require('../controllers/authController');

// Ruta POST para el login
router.post('/login', login);

// Ruta POST para el registro
router.post('/register', register);
module.exports = router;