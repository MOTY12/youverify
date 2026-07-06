const request = require('supertest');
const { createApp } = require('../app');
const { connectDatabase, disconnectDatabase } = require('../../shared/config/database');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(120000);

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const axios = require('axios');

describe('order service forwarding', () => {
  let mongoServer;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
    await connectDatabase(mongoServer.getUri('order_test_db'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongoServer.stop();
  });

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
  });

  it('creates an order and forwards payment request', async () => {
    const app = createApp();
    axios.get.mockResolvedValue({ data: { productId: 'prod-001' } });
    axios.post.mockResolvedValue({ data: { status: 'accepted' } });

    const response = await request(app)
      .post('/orders')
      .send({ customerId: 'customer-001', productId: 'prod-001', amount: 42 });

    expect(response.status).toBe(201);
    expect(axios.get).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/payments'), expect.objectContaining({
      customerId: 'customer-001',
      productId: 'prod-001',
      amount: 42,
    }));
  });
});
