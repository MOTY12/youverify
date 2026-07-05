const axios = require('axios');
const Customer = require('../models/Customer');
const { getEnv } = require('../../shared/config/env');

async function getHealth(req, res) {
  res.json({ status: 'ok', service: 'customer-service' });
}

async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const { customerId } = req.params;
    const { productId, amount } = req.body;

    if (!customerId || !productId || !amount) {
      return res.status(400).json({ error: 'customerId, productId, and amount are required' });
    }

    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orderServiceUrl = getEnv('ORDER_SERVICE_URL', 'http://localhost:3003');
    const response = await axios.post(`${orderServiceUrl}/orders`, {
      customerId,
      productId,
      amount,
    });

    res.status(201).json(response.data);
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth, getCustomer, createOrder };
