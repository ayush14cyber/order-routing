const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerLat: { type: Number, required: true },
  customerLng: { type: Number, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true }
    }
  ],
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'Fulfilled', 'Cancelled'], 
    default: 'Pending' 
  },
  assignedWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  routingScore: { type: Number },
  explanation: { type: String } // AI-generated explanation
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
