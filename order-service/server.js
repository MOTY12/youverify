const mongoose = require('mongoose');
const { createApp } = require('./app');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');

async function start() {
  const app = createApp();
  const port = Number(getEnv('PORT', 3003));
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/youverify/order_db');

  try {
    await connectDatabase(mongoose, mongoUri);
    app.listen(port, () => {
      console.log(`Order service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Order service failed to start', error);
    process.exit(1);
  }
}

start();
