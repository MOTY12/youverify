const express = require('express');
const { getHealth, listProducts, getProduct } = require('../controllers/productController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/products', listProducts);
router.get('/products/:id', getProduct);

module.exports = router;
