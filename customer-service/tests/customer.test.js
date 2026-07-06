const request = require('supertest');
const { createApp } = require('../app');
const { connectDatabase, disconnectDatabase } = require('../../shared/config/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Customer = require('../src/models/Customer');

jest.setTimeout(120000);

describe('customer service', () => {
  let mongoServer;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
    await connectDatabase(mongoServer.getUri('customer_test_db'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await Customer.deleteMany({});
    await Customer.create({ customerId: 'customer-001', name: 'Ada Lovelace', email: 'ada@example.com' });
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

  it('retrieves a customer by id', async () => {
    const app = createApp();
    const response = await request(app).get('/customers/customer-001');
    expect(response.status).toBe(200);
    expect(response.body.customerId).toBe('customer-001');
  });
});
