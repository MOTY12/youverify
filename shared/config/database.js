const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

function waitForConnection(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      resolve(mongoose);
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('MongoDB connection timed out waiting for open state'));
    }, timeoutMs);

    const onOpen = () => {
      cleanup();
      resolve(mongoose);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timer);
      mongoose.connection.off('open', onOpen);
      mongoose.connection.off('error', onError);
    };

    mongoose.connection.once('open', onOpen);
    mongoose.connection.once('error', onError);
  });
}

async function connectDatabase(uri, options = {}, retries = 12, delayMs = 2000) {
  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose;
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    bufferCommands: false,
    ...options,
  };

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      await mongoose.connect(uri, connectionOptions);
      await waitForConnection();
      await mongoose.connection.db.admin().ping();
      return mongoose;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const backoffMs = Math.min(delayMs * attempt, 10000);
      console.warn(`MongoDB connection attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDatabase, disconnectDatabase };
