const express = require('express');
const router = express.Router();
const { register, login, me, googleLogin } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticateToken, me);

module.exports = router;
