const Product = require('../models/Product');

async function getHealth(req, res) {
  res.json({ status: 'ok', service: 'product-service' });
}

async function listProducts(req, res, next) {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({ productId: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth, listProducts, getProduct };
