const express = require('express');
const { createNotice, getNoticesForAssociation, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { createNoticeSchema } = require('../models/noticeValidators');

const router = express.Router();
router.use(protect);

router.post('/', validateRequest(createNoticeSchema), createNotice);
router.get('/association/:associationId', getNoticesForAssociation);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

module.exports = router;
