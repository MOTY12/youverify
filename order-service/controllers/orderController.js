const axios = require('axios');
const { randomUUID } = require('crypto');
const Order = require('../models/Order');
const { getEnv } = require('../../shared/config/env');

async function getHealth(req, res) {
  res.json({ status: 'ok', service: 'order-service' });
}

async function createOrder(req, res, next) {
  try {
    const { customerId, productId, amount } = req.body;

    if (!customerId || !productId || !amount) {
      return res.status(400).json({ error: 'customerId, productId, and amount are required' });
    }

    const productServiceUrl = getEnv('PRODUCT_SERVICE_URL', 'http://localhost:3002');
    await axios.get(`${productServiceUrl}/products/${productId}`);

    const order = await Order.create({
      orderId: randomUUID(),
      customerId,
      productId,
      amount,
      orderStatus: 'pending',
    });

    const paymentServiceUrl = getEnv('PAYMENT_SERVICE_URL', 'http://localhost:3004');
    await axios.post(`${paymentServiceUrl}/payments`, {
      customerId,
      orderId: order.orderId,
      productId,
      amount,
    });

    res.status(201).json({
      customerId,
      orderId: order.orderId,
      productId,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth, createOrder, getOrder };
