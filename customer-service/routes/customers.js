const express = require('express');
const { getHealth, getCustomer, createOrder } = require('../controllers/customerController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/customers/:id', getCustomer);
router.post('/customers/:customerId/orders', createOrder);

module.exports = router;
