const { connectDatabase, disconnectDatabase } = require('../../shared/config/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Transaction = require('../src/models/Transaction');

jest.setTimeout(120000);

jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

const amqplib = require('amqplib');

jest.mock('../models/Transaction', () => ({
  create: jest.fn(),
}));

describe('transaction worker', () => {
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

  beforeEach(() => {
    Transaction.create.mockReset();
    amqplib.connect.mockReset();
  });

  it('saves consumed transaction payloads', async () => {
    const channel = {
      assertQueue: jest.fn().mockResolvedValue(),
      consume: jest.fn().mockImplementation((_queue, handler) => {
        handler({ content: Buffer.from(JSON.stringify({ customerId: 'c1', orderId: 'o1', productId: 'p1', amount: 10 })) });
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    };
    const connection = { createChannel: jest.fn().mockResolvedValue(channel) };
    amqplib.connect.mockResolvedValue(connection);
    Transaction.create.mockResolvedValue({});

    const worker = require('../worker');
    await worker.startWorker();

    expect(Transaction.create).toHaveBeenCalledWith({ customerId: 'c1', orderId: 'o1', productId: 'p1', amount: 10 });
  });
});
