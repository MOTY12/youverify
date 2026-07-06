const express = require('express');
const orderRoutes = require('./src/routes/orders');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(orderRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
