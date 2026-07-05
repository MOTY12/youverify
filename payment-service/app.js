const express = require('express');
const paymentRoutes = require('./routes/payments');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(paymentRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
