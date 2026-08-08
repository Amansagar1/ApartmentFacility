const express = require('express');
const { addFlat, getFlatsByAssociation, updateFlat, deleteFlat } = require('../controllers/flatController');
const { protect } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { addFlatSchema } = require('../models/flatValidators');

const router = express.Router();

// Require user to be logged in
router.use(protect);

router.post('/', validateRequest(addFlatSchema), addFlat);
router.get('/:associationId', getFlatsByAssociation);
router.put('/:id', updateFlat);
router.delete('/:id', deleteFlat);

module.exports = router;
