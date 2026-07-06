const amqplib = require('amqplib');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');
const Transaction = require('./models/Transaction');

async function connectWithRetry(uri, retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await amqplib.connect(uri);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(`RabbitMQ connection attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function startWorker() {
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/youverify/payment_db');
  const rabbitMqUrl = getEnv('RABBITMQ_URL', 'amqp://localhost:5672');
  const queueName = getEnv('RABBITMQ_QUEUE', 'transactions');

  await connectDatabase(mongoUri);
  const connection = await connectWithRetry(rabbitMqUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (message) => {
    if (!message) {
      return;
    }

    try {
      const payload = JSON.parse(message.content.toString());
      await Transaction.create(payload);
      channel.ack(message);
    } catch (error) {
      console.error('Failed to process transaction', error);
      channel.nack(message, false, false);
    }
  }, { noAck: false });

  console.log('Transaction worker listening for messages');
}

if (require.main === module) {
  startWorker().catch((error) => {
    console.error('Transaction worker failed', error);
    process.exit(1);
  });
}

module.exports = { startWorker };
