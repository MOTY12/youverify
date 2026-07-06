const Transaction = require('../src/models/Transaction');
const { getEnv } = require('../../shared/config/env');
const { publishToQueue } = require('../../../shared/rabbitmq/client');

async function getHealth(req, res) {
  res.json({ status: 'ok', service: 'payment-service' });
}

async function createPayment(req, res, next) {
  try {
    const { customerId, orderId, productId, amount } = req.body;

    if (!customerId || !orderId || !productId || !amount) {
      return res.status(400).json({ error: 'customerId, orderId, productId, and amount are required' });
    }

    const queueName = getEnv('RABBITMQ_QUEUE', 'transactions');
    const rabbitMqUrl = getEnv('RABBITMQ_URL', 'amqp://localhost:5672');

    await publishToQueue({
      uri: rabbitMqUrl,
      queueName,
      payload: { customerId, orderId, productId, amount },
    });

    res.status(202).json({ status: 'accepted', message: 'Payment request accepted', transaction: { customerId, orderId, productId, amount } });
  } catch (error) {
    next(error);
  }
}

async function listTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

async function getTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ orderId: req.params.orderId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth, createPayment, listTransactions, getTransaction };
