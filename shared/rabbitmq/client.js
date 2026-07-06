const amqplib = require('amqplib');

async function publishToQueue({ uri, queueName, payload }, retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const connection = await amqplib.connect(uri);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName, { durable: true });
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
      await channel.close();
      await connection.close();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(`RabbitMQ publish attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { publishToQueue };
