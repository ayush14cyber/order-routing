const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In a real app, this would be hashed
  role: { 
    type: String, 
    enum: ['Admin', 'Warehouse Manager'], 
    required: true 
  },
  assignedWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' } // Only for Warehouse Managers
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
