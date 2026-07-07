const mongoose = require('mongoose');

// Flexible MongoDB connection helper
// Supports two call styles for backward compatibility:
// 1) connectDatabase(mongooseInstance, uri, options)
// 2) connectDatabase(uri, options)  -- legacy (will require('mongoose') internally)

function isMongoose(obj) {
  return obj && typeof obj === 'object' && obj.connection && typeof obj.connect === 'function';
}

function waitForConnection(mongooseInstance, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (mongooseInstance.connection.readyState === 1 && mongooseInstance.connection.db) {
      resolve(mongooseInstance);
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('MongoDB connection timed out waiting for open state'));
    }, timeoutMs);

    const onOpen = () => {
      cleanup();
      resolve(mongooseInstance);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timer);
      mongooseInstance.connection.off('open', onOpen);
      mongooseInstance.connection.off('error', onError);
    };

    mongooseInstance.connection.once('open', onOpen);
    mongooseInstance.connection.once('error', onError);
  });
}

async function connectDatabase(mongooseOrUri, uriOrOptions = {}, maybeOptions = {}, retries = 12, delayMs = 2000) {
  // allow signatures: (mongoose, uri, options) OR (uri, options)
  let mongooseInstance;
  let uri;
  let options = maybeOptions;

  if (typeof mongooseOrUri === 'string') {
    // legacy: connectDatabase(uri, options)
    uri = mongooseOrUri;
    options = uriOrOptions || {};
    mongooseInstance = require('mongoose');
  } else if (isMongoose(mongooseOrUri)) {
    mongooseInstance = mongooseOrUri;
    uri = uriOrOptions;
    options = maybeOptions || {};
  } else {
    throw new Error('connectDatabase requires either (mongoose, uri) or (uri)');
  }

  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  // disable mongoose buffering on the provided instance
  try {
    mongooseInstance.set('bufferCommands', false);
  } catch (e) {
    // ignore if instance doesn't support set
  }

  if (mongooseInstance.connection.readyState === 1 && mongooseInstance.connection.db) {
    return mongooseInstance;
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
      if (mongooseInstance.connection.readyState !== 0) {
        // ensure a clean state
        await mongooseInstance.disconnect();
      }

      await mongooseInstance.connect(uri, connectionOptions);
      await waitForConnection(mongooseInstance);

      if (mongooseInstance.connection.readyState !== 1 || !mongooseInstance.connection.db) {
        throw new Error('MongoDB connection did not complete');
      }

      await mongooseInstance.connection.db.admin().ping();
      return mongooseInstance;
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

async function disconnectDatabase(mongooseInstanceOrUndefined) {
  let mongooseInstance = mongooseInstanceOrUndefined;
  if (!mongooseInstance) {
    try {
      mongooseInstance = require('mongoose');
    } catch (e) {
      return;
    }
  }

  if (mongooseInstance && mongooseInstance.connection && mongooseInstance.connection.readyState !== 0) {
    await mongooseInstance.disconnect();
  }
}

module.exports = { connectDatabase, disconnectDatabase };
function getMongoose() {
  return mongoose;
}

module.exports = { connectDatabase, disconnectDatabase, getMongoose };
