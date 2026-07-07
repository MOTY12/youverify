const mongoose = require('mongoose');
const { createApp } = require('./app');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');

// avoid command buffering during startup so failures surface
mongoose.set('bufferCommands', false);

async function seedProducts() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      if (!mongoose.connection.db) {
        throw new Error('mongoose.connection.db not available yet');
      }
      await mongoose.connection.db.admin().ping();

      const collection = mongoose.connection.db.collection('products');
      const count = await collection.countDocuments();
      if (count === 0) {
        await collection.insertMany([
          { productId: 'prod-001', name: 'Laptop', price: 999.99, description: '14-inch laptop' },
          { productId: 'prod-002', name: 'Keyboard', price: 79.5, description: 'Mechanical keyboard' },
          { productId: 'prod-003', name: 'Mouse', price: 39.0, description: 'Wireless mouse' },
        ]);
        console.log('Product seeding completed');
      }
      return;
    } catch (error) {
      console.warn(`Product seeding attempt ${attempt} failed:`, error && error.message ? error.message : error);
      if (attempt === 10) {
        throw error;
      }
      const backoffMs = Math.min(2000 * attempt, 10000);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}

async function start() {
  const port = Number(getEnv('PORT', 3002));
  const mongoUri = getEnv('MONGO_URI', 'mongodb+srv://dev:aCeHr1234@acehr.phurqzy.mongodb.net/assessments?retryWrites=true&w=majority&appName=Acehr');

  try {
    await connectDatabase(mongoose, mongoUri);
    if (getEnv('SEED_DATA', 'true') === 'true') {
      await seedProducts();
    }
    const app = createApp();
    app.listen(port, () => {
      console.log(`Product service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Product service failed to start', error);
    process.exit(1);
  }
}

start();
