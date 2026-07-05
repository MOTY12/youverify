const mongoose = require('mongoose');

async function connectDatabase(uri, options = {}) {
  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 5000,
    ...options,
  };

  await mongoose.connect(uri, connectionOptions);
  return mongoose;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDatabase, disconnectDatabase };
