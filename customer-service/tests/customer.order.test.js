const request = require('supertest');
const { createApp } = require('../app');
const { connectDatabase, disconnectDatabase } = require('../../shared/config/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Customer = require('../models/Customer');

jest.setTimeout(120000);

jest.mock('axios', () => ({
  post: jest.fn(),
}));

const axios = require('axios');

describe('customer service order forwarding', () => {
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

  beforeEach(() => {
    axios.post.mockReset();
  });

  it('forwards order creation to the order service', async () => {
    const app = createApp();
    axios.post.mockResolvedValue({ data: { orderId: 'order-001', orderStatus: 'pending' } });

    const response = await request(app)
      .post('/customers/customer-001/orders')
      .send({ productId: 'prod-001', amount: 42 });

    expect(response.status).toBe(201);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), expect.objectContaining({
      customerId: 'customer-001',
      productId: 'prod-001',
      amount: 42,
    }));
  });
});
