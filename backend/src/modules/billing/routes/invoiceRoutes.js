const express = require('express');
const { generateInvoices, getMyInvoices, getAllForAssociation, createOrder, verifyPayment, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { generateInvoicesSchema } = require('../models/invoiceValidators');

const router = express.Router();
router.use(protect);

router.post('/generate', validateRequest(generateInvoicesSchema), generateInvoices);
router.get('/my', getMyInvoices);
router.get('/association/:associationId', getAllForAssociation);
router.post('/:id/create-order', createOrder);
router.post('/:id/verify-payment', verifyPayment);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
