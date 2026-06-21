const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const { selectOptimalWarehouse } = require('../engine/routingEngine');

const User = require('../models/User');

// --- Auth Routes ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({ 
            _id: user._id, 
            username: user.username, 
            role: user.role,
            assignedWarehouseId: user.assignedWarehouseId 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Warehouse Routes ---
router.post('/warehouses', async (req, res) => {
    try {
        const warehouse = new Warehouse(req.body);
        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/warehouses', async (req, res) => {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
});

// --- Product Routes ---
router.post('/products', async (req, res) => {
    try {
        const { name, sku, price, description, warehouseId, initialQuantity } = req.body;
        const product = new Product({ name, sku, price, description });
        await product.save();

        if (warehouseId) {
            const inventory = new Inventory({
                productId: product._id,
                warehouseId,
                quantity: initialQuantity || 0
            });
            await inventory.save();
        }

        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// --- Inventory Routes ---
router.post('/inventory', async (req, res) => {
    try {
        const { productId, warehouseId, quantity } = req.body;
        let inventory = await Inventory.findOne({ productId, warehouseId });
        if (inventory) {
            inventory.quantity += quantity;
        } else {
            inventory = new Inventory(req.body);
        }
        await inventory.save();
        res.status(201).json(inventory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/inventory', async (req, res) => {
    const inv = await Inventory.find().populate('productId').populate('warehouseId');
    res.json(inv);
});

// --- Order & Routing Routes ---
router.post('/orders', async (req, res) => {
    try {
        const { customerName, customerLat, customerLng, items } = req.body;
        
        // 1. Fetch all warehouses and inventories
        const warehouses = await Warehouse.find();
        const inventories = await Inventory.find();

        // 2. Run Routing Engine
        const result = await selectOptimalWarehouse(
            { lat: customerLat, lng: customerLng },
            items,
            warehouses,
            inventories
        );

        if (!result) {
            return res.status(400).json({ error: "No warehouse with sufficient inventory found." });
        }

        // 3. Create Order
        const order = new Order({
            customerName,
            customerLat,
            customerLng,
            items,
            assignedWarehouseId: result.selectedWarehouse._id,
            routingScore: result.score,
            explanation: result.explanation,
            status: 'Assigned'
        });

        await order.save();

        // 4. Update Inventory (Simulation: decrement stock)
        for (const item of items) {
            await Inventory.findOneAndUpdate(
                { productId: item.productId, warehouseId: result.selectedWarehouse._id },
                { $inc: { quantity: -item.quantity } }
            );
        }

        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/orders', async (req, res) => {
    const orders = await Order.find().populate('assignedWarehouseId');
    res.json(orders);
});

router.patch('/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('assignedWarehouseId');
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
