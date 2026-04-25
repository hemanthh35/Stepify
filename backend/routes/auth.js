const express = require('express');
const { signup, login, logout, profile, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
