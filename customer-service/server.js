const { createApp } = require('./app');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');
const Customer = require('./src/models/Customer');

async function seedCustomer() {
  const existing = await Customer.findOne({ customerId: 'customer-001' });
  if (!existing) {
    await Customer.create({
      customerId: 'customer-001',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
  }
}

async function start() {
  const app = createApp();
  const port = Number(getEnv('PORT', 3001));
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/youverify/customer_db');

  try {
    await connectDatabase(mongoUri);
    if (getEnv('SEED_DATA', 'true') === 'true') {
      await seedCustomer();
    }
    app.listen(port, () => {
      console.log(`Customer service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Customer service failed to start', error);
    process.exit(1);
  }
}

start();
