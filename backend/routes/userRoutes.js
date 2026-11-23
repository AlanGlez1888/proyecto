// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, 
    getCarreras, 
    updateProfile,
    getMyPublications, 
    deleteMyItem,
    getMyReviews,
    deleteMyReview
 } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');


// Protegemos la ruta pasándole el verifyToken en medio
router.get('/perfil', verifyToken, getProfile);
router.put('/perfil', verifyToken, updateProfile);
router.get('/carreras', getCarreras);
router.get('/mis-publicaciones', verifyToken, getMyPublications);
router.delete('/publicaciones/:id', verifyToken, deleteMyItem);
router.get('/mis-resenas', verifyToken, getMyReviews);
router.delete('/resenas/:id', verifyToken, deleteMyReview);

module.exports = router;