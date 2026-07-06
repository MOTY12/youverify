const express = require('express');
const { getHealth, createOrder, getOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/health', getHealth);
router.post('/orders', createOrder);
router.get('/orders/:orderId', getOrder);

module.exports = router;
