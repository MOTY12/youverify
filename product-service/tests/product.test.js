const request = require('supertest');
const { createApp } = require('../app');
const { connectDatabase, disconnectDatabase } = require('../../shared/config/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../src/models/Product');

jest.setTimeout(120000);

describe('product service', () => {
  let mongoServer;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
    await connectDatabase(mongoServer.getUri('product_test_db'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await Product.deleteMany({});
    await Product.create({ productId: 'prod-001', name: 'Laptop', price: 999.99, description: '14-inch laptop' });
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongoServer.stop();
  });

  it('returns health status', async () => {
    const app = createApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('lists products', async () => {
    const app = createApp();
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
