const mongoose = require('mongoose');

function waitForConnection() {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve(mongoose);
      return;
    }

    const onOpen = () => {
      cleanup();
      resolve(mongoose);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      mongoose.connection.off('open', onOpen);
      mongoose.connection.off('error', onError);
    };

    mongoose.connection.once('open', onOpen);
    mongoose.connection.once('error', onError);
  });
}

async function connectDatabase(uri, options = {}, retries = 10, delayMs = 3000) {
  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    await waitForConnection();
    return mongoose;
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 5000,
    ...options,
  };

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, connectionOptions);
      await waitForConnection();
      return mongoose;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(`MongoDB connection attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDatabase, disconnectDatabase };
