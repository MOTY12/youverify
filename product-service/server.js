const mongoose = require('mongoose');
const { createApp } = require('./app');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');

async function seedProducts() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const collection = mongoose.connection.db.collection('products');
      const count = await collection.countDocuments();
      if (count === 0) {
        await collection.insertMany([
          { productId: 'prod-001', name: 'Laptop', price: 999.99, description: '14-inch laptop' },
          { productId: 'prod-002', name: 'Keyboard', price: 79.5, description: 'Mechanical keyboard' },
          { productId: 'prod-003', name: 'Mouse', price: 39.0, description: 'Wireless mouse' },
        ]);
      }
      return;
    } catch (error) {
      if (attempt === 10) {
        throw error;
      }
      const backoffMs = Math.min(2000 * attempt, 10000);
      console.warn(`Product seeding attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}

async function start() {
  const app = createApp();
  const port = Number(getEnv('PORT', 3002));
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/youverify/product_db');

  try {
    await connectDatabase(mongoUri);
    if (getEnv('SEED_DATA', 'true') === 'true') {
      await seedProducts();
    }
    app.listen(port, () => {
      console.log(`Product service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Product service failed to start', error);
    process.exit(1);
  }
}

start();
