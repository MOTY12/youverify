const express = require('express');
const { getHealth, createPayment, listTransactions, getTransaction } = require('../controllers/paymentController');

const router = express.Router();

router.get('/health', getHealth);
router.post('/payments', createPayment);
router.get('/transactions', listTransactions);
router.get('/transactions/:orderId', getTransaction);

module.exports = router;
