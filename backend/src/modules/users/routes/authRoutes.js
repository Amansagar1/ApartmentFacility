const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const validateRequest = require('../../../middlewares/validateRequest');
const { protect } = require('../../../middlewares/authMiddleware');
const { registerSchema, loginSchema } = require('../models/userValidators');

// ----------------Auth Router------------
const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
