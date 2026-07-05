const amqplib = require('amqplib');

async function publishToQueue({ uri, queueName, payload }) {
  const connection = await amqplib.connect(uri);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
  await channel.close();
  await connection.close();
}

module.exports = { publishToQueue };
