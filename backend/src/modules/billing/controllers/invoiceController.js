const Invoice = require('../models/Invoice');
const Flat = require('../../associations/models/Flat');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

const generateInvoices = async (req, res, next) => {
  try {
    const { associationId, amount, billingMonth, dueDate, flatIds } = req.body;
    
    // Find flats for this association (either specific ones or all)
    let query = { associationId };
    if (flatIds && Array.isArray(flatIds) && flatIds.length > 0) {
      query._id = { $in: flatIds };
    }

    const flats = await Flat.find(query);
    if (!flats || flats.length === 0) {
      return next(new AppError('No flats found to generate invoices for. Please check your selection or add flats to the directory first.', HTTP_STATUS.BAD_REQUEST));
    }

    // Create an invoice for each flat
    const invoicesData = flats.map(flat => ({
      associationId,
      flatId: flat._id,
      amount,
      billingMonth,
      dueDate: new Date(dueDate),
      status: 'UNPAID'
    }));

    await Invoice.insertMany(invoicesData);
    res.status(HTTP_STATUS.CREATED).json({ success: true, message: `Generated ${invoicesData.length} invoices successfully.` });
  } catch (error) { next(error); }
};

const getMyInvoices = async (req, res, next) => {
  try {
    // Find flats where ownerEmail or tenantEmail matches user.email
    const userFlats = await Flat.find({
      $or: [{ ownerEmail: req.user.email }, { tenantEmail: req.user.email }]
    });
    const flatIds = userFlats.map(f => f._id);

    const invoices = await Invoice.find({ flatId: { $in: flatIds } })
      .populate('flatId', 'blockName flatNumber')
      .sort('-createdAt');
      
    res.status(HTTP_STATUS.OK).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) { next(error); }
};

const getAllForAssociation = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ associationId: req.params.associationId })
      .populate('flatId', 'blockName flatNumber')
      .sort('-createdAt');
    res.status(HTTP_STATUS.OK).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) { next(error); }
};

// --- Razorpay Order Creation ---
const createOrder = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice || invoice.status === 'PAID') {
      return next(new AppError('Invalid invoice or already paid', HTTP_STATUS.BAD_REQUEST));
    }

    const options = {
      amount: invoice.amount * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: `receipt_inv_${invoice._id}`
    };

    const order = await razorpay.orders.create(options);
    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) { next(error); }
};

// --- Razorpay Payment Verification ---
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const invoiceId = req.params.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
                                    .update(body.toString())
                                    .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await Invoice.findByIdAndUpdate(invoiceId, { status: 'PAID' });
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Payment successful!' });
    } else {
      return next(new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST));
    }
  } catch (error) { next(error); }
};

// --- Invoice Management (Update & Delete) ---
const updateInvoice = async (req, res, next) => {
  try {
    const { amount, dueDate } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { amount, dueDate },
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Invoice not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Invoice not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

module.exports = { generateInvoices, getMyInvoices, getAllForAssociation, createOrder, verifyPayment, updateInvoice, deleteInvoice };
