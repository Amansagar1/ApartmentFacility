const express = require('express');
const { createUser, getAllUsers } = require('../controllers/userController');
const { protect, authorizeSuperAdmin } = require('../../../middlewares/authMiddleware');

const router = express.Router();

// ----------------Protect all routes and require SuperAdmin------------
router.use(protect);
router.use(authorizeSuperAdmin);

router.post('/', createUser);
router.get('/', getAllUsers);

module.exports = router;
