const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
