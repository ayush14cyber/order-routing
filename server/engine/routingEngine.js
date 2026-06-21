/**
 * Haversine formula to calculate distance between two points in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Routing Engine - Logic for warehouse selection
 */
const selectOptimalWarehouse = async (customerLoc, items, warehouses, inventories) => {
    const weights = {
        distance: 0.35,
        inventory: 0.35,
        deliveryTime: 0.20,
        cost: 0.10
    };

    let candidates = [];

    for (const warehouse of warehouses) {
        // 1. Inventory Check (Elimination)
        let hasAllStock = true;
        for (const item of items) {
            const inv = inventories.find(i => 
                i.warehouseId.toString() === warehouse._id.toString() && 
                i.productId.toString() === item.productId.toString()
            );
            if (!inv || inv.quantity < item.quantity) {
                hasAllStock = false;
                break;
            }
        }

        if (!hasAllStock) continue;

        // 2. Metrics Calculation
        const dist = calculateDistance(customerLoc.lat, customerLoc.lng, warehouse.lat, warehouse.lng);
        
        candidates.push({
            warehouse,
            distance: dist,
            deliveryTime: warehouse.avgDeliveryTime,
            cost: warehouse.operatingCost + (dist * 0.5) // Example shipping cost calculation
        });
    }

    if (candidates.length === 0) return null;

    // 3. Normalization and Scoring
    const maxDist = Math.max(...candidates.map(c => c.distance)) || 1;
    const maxTime = Math.max(...candidates.map(c => c.deliveryTime)) || 1;
    const maxCost = Math.max(...candidates.map(c => c.cost)) || 1;

    candidates = candidates.map(c => {
        const distScore = 1 - (c.distance / maxDist);
        const invScore = 1; // Since we filtered, they all have stock
        const timeScore = 1 - (c.deliveryTime / maxTime);
        const costScore = 1 - (c.cost / maxCost);

        const finalScore = (
            (distScore * weights.distance) +
            (invScore * weights.inventory) +
            (timeScore * weights.deliveryTime) +
            (costScore * weights.cost)
        ) * 100;

        return { ...c, finalScore };
    });

    // 4. Sort and select best
    candidates.sort((a, b) => b.finalScore - a.finalScore);
    const best = candidates[0];

    // 5. Generate AI-based explanation
    const explanation = generateExplanation(best);

    return { 
        selectedWarehouse: best.warehouse, 
        score: best.finalScore,
        explanation 
    };
};

const generateExplanation = (best) => {
    const { warehouse, distance, deliveryTime } = best;
    // Simple rule-based explanation simulation
    return `${warehouse.name} was selected because it has sufficient inventory, is located approximately ${distance.toFixed(2)} km from the customer, and provides a fast delivery time of ${deliveryTime} hours with optimized operational costs.`;
};

module.exports = { selectOptimalWarehouse };
