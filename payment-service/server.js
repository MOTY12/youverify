const { createApp } = require('./app');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');

async function start() {
  const app = createApp();
  const port = Number(getEnv('PORT', 3004));
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/youverify/payment_db');

  try {
    await connectDatabase(mongoUri);
    app.listen(port, () => {
      console.log(`Payment service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Payment service failed to start', error);
    process.exit(1);
  }
}

start();
