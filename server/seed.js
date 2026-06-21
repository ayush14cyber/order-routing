const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Warehouse = require('./models/Warehouse');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const User = require('./models/User');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://ayuoptional_db_user:ZetxUJ2kKhHaPsRw@cluster0.sctee3l.mongodb.net/';

const seedData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

        // Clear existing
        await Warehouse.deleteMany({});
        await Product.deleteMany({});
        await Inventory.deleteMany({});
        await User.deleteMany({});

        // Add Warehouses
        const w1 = await Warehouse.create({ name: 'North Hub (Delhi)', lat: 28.6139, lng: 77.2090, capacity: 5000, city: 'Delhi', operatingCost: 40, avgDeliveryTime: 18 });
        const w2 = await Warehouse.create({ name: 'South Hub (Bangalore)', lat: 12.9716, lng: 77.5946, capacity: 8000, city: 'Bangalore', operatingCost: 60, avgDeliveryTime: 12 });
        const w3 = await Warehouse.create({ name: 'West Hub (Mumbai)', lat: 19.0760, lng: 72.8777, capacity: 6000, city: 'Mumbai', operatingCost: 55, avgDeliveryTime: 24 });

        // Add Users
        await User.create({ username: 'admin', password: 'password123', role: 'Admin' });
        await User.create({ username: 'manager1', password: 'password123', role: 'Warehouse Manager', assignedWarehouseId: w1._id });

        // Add Products
        const p1 = await Product.create({ name: 'Eco-Smart Watch', sku: 'WATCH-001', price: 199, description: 'Next-gen logistics tracker' });
        const p2 = await Product.create({ name: 'Pro Drone X1', sku: 'DRONE-X1', price: 899, description: 'Delivery specialized drone' });

        // Add Inventory
        await Inventory.create({ productId: p1._id, warehouseId: w1._id, quantity: 50 });
        await Inventory.create({ productId: p1._id, warehouseId: w2._id, quantity: 15 });
        await Inventory.create({ productId: p2._id, warehouseId: w2._id, quantity: 10 });
        await Inventory.create({ productId: p2._id, warehouseId: w3._id, quantity: 25 });

        console.log('Data seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
