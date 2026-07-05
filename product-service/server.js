const { createApp } = require('./app');
const { connectDatabase } = require('../shared/config/database');
const { getEnv } = require('../shared/config/env');
const Product = require('./models/Product');

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.create([
      { productId: 'prod-001', name: 'Laptop', price: 999.99, description: '14-inch laptop' },
      { productId: 'prod-002', name: 'Keyboard', price: 79.5, description: 'Mechanical keyboard' },
      { productId: 'prod-003', name: 'Mouse', price: 39.0, description: 'Wireless mouse' },
    ]);
  }
}

async function start() {
  const app = createApp();
  const port = Number(getEnv('PORT', 3002));
  const mongoUri = getEnv('MONGO_URI', 'mongodb://localhost:27017/product_db');

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
