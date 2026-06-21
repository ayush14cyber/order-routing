const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  capacity: { type: Number, required: true },
  city: { type: String, required: true },
  operatingCost: { type: Number, default: 50 }, // Cost per fulfillment
  avgDeliveryTime: { type: Number, default: 24 } // Average delivery time in hours
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
