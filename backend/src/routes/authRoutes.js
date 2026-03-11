const express = require('express');
const router = express.Router();
const { register, login, me, verifyToken, googleLogin } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticateToken, me);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
