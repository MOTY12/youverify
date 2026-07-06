const request = require('supertest');
const { createApp } = require('../app');
const { connectDatabase, disconnectDatabase } = require('../../shared/config/database');
const { publishToQueue } = require('../../shared/rabbitmq/client');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Transaction = require('../src/models/Transaction');

jest.setTimeout(120000);

jest.mock('../../shared/rabbitmq/client', () => ({
  publishToQueue: jest.fn(),
}));

describe('payment service publishing', () => {
  let mongoServer;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
    await connectDatabase(mongoServer.getUri('payment_test_db'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Transaction.deleteMany({});
    publishToQueue.mockReset();
  });

  it('publishes a transaction payload when payment is requested', async () => {
    const app = createApp();
    publishToQueue.mockResolvedValue();

    const response = await request(app)
      .post('/payments')
      .send({ customerId: 'customer-001', orderId: 'order-001', productId: 'prod-001', amount: 42 });

    expect(response.status).toBe(202);
    expect(publishToQueue).toHaveBeenCalledWith(expect.objectContaining({
      payload: { customerId: 'customer-001', orderId: 'order-001', productId: 'prod-001', amount: 42 },
    }));
  });
});
