const amqplib = require('amqplib');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');
const Transaction = require('./models/Transaction');

async function startWorker() {
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/payment_db');
  const rabbitMqUrl = getEnv('RABBITMQ_URL', 'amqp://localhost:5672');
  const queueName = getEnv('RABBITMQ_QUEUE', 'transactions');

  await connectDatabase(mongoUri);
  const connection = await amqplib.connect(rabbitMqUrl);
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

startWorker().catch((error) => {
  console.error('Transaction worker failed', error);
  process.exit(1);
});
