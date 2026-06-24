const cron = require('node-cron');
const Warehouse = require('./models/Warehouse');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const Order = require('./models/Order');
const { selectOptimalWarehouse } = require('./engine/routingEngine');

// Helper to generate random coordinates within a range
function getRandomCoordinate(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to generate and place an automatic order
async function placeAutomaticOrder() {
    try {
        console.log('[CRON] Attempting to place automatic order...');
        
        // 1. Get a random product
        const products = await Product.find();
        if (!products || products.length === 0) {
            console.log('[CRON] No products available to order.');
            return;
        }
        const randomProduct = products[Math.floor(Math.random() * products.length)];

        // Random quantity between 1 and 5
        const quantity = Math.floor(Math.random() * 5) + 1;
        
        const items = [{
            productId: randomProduct._id,
            quantity: quantity
        }];

        // Dummy customer data
        const timestamp = new Date().toISOString();
        const customerName = `Auto Customer ${timestamp}`;
        // Generate coordinates somewhat broadly (e.g. within US bounds or anywhere)
        const customerLat = getRandomCoordinate(30, 45);
        const customerLng = getRandomCoordinate(-120, -75);

        // 2. Fetch all warehouses and inventories
        const warehouses = await Warehouse.find();
        const inventories = await Inventory.find();

        // 3. Run Routing Engine
        const result = await selectOptimalWarehouse(
            { lat: customerLat, lng: customerLng },
            items,
            warehouses,
            inventories
        );

        if (!result) {
            console.log('[CRON] No warehouse with sufficient inventory found for automatic order.');
            return;
        }

        // 4. Create Order
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

        // 5. Update Inventory (Simulation: decrement stock)
        for (const item of items) {
            await Inventory.findOneAndUpdate(
                { productId: item.productId, warehouseId: result.selectedWarehouse._id },
                { $inc: { quantity: -item.quantity } }
            );
        }

        console.log(`[CRON] Successfully placed automatic order ID: ${order._id} for product ${randomProduct.name} (Qty: ${quantity})`);

    } catch (err) {
        console.error('[CRON] Error placing automatic order:', err.message);
    }
}

// Initialize the cron job
function initCron() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        placeAutomaticOrder();
    });
    console.log('[CRON] Automatic order cron job initialized (runs every 5 minutes).');
}

module.exports = { initCron };
