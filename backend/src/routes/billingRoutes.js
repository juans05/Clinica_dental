const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Invoices
router.post('/invoices', invoiceController.createInvoice);
router.get('/invoices', invoiceController.getInvoices);

// Payments
router.post('/payments', paymentController.createPayment);
router.get('/payments/treatment/:treatmentId', paymentController.getPaymentsByTreatment);

module.exports = router;
