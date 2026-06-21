import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { API_BASE_URL } from '../api';

const InventoryManager = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [view, setView] = useState('inventory'); // 'inventory', 'add-warehouse', 'add-product'

    const refreshData = () => {
        fetch(`${API_BASE_URL}/api/warehouses`).then(res => res.json()).then(setWarehouses);
        fetch(`${API_BASE_URL}/api/products`).then(res => res.json()).then(setProducts);
        fetch(`${API_BASE_URL}/api/inventory`).then(res => res.json()).then(setInventory);
    };

    useEffect(refreshData, []);

    const handleAddWarehouse = async (e: any) => {
        e.preventDefault();
        const data = {
            name: e.target.name.value,
            city: e.target.city.value,
            lat: parseFloat(e.target.lat.value),
            lng: parseFloat(e.target.lng.value),
            capacity: parseInt(e.target.capacity.value),
            operatingCost: parseInt(e.target.operatingCost.value) || 50,
            avgDeliveryTime: parseInt(e.target.avgDeliveryTime.value) || 24
        };
        await fetch(`${API_BASE_URL}/api/warehouses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        refreshData();
        setView('inventory');
    };

    const handleAddProduct = async (e: any) => {
        e.preventDefault();
        const data = {
            name: e.target.name.value,
            sku: e.target.sku.value,
            price: parseFloat(e.target.price.value),
            description: e.target.description.value,
            warehouseId: e.target.warehouseId.value,
            initialQuantity: parseInt(e.target.initialQuantity.value) || 0
        };
        await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        refreshData();
        setView('inventory');
    };

    const handleUpdateStock = async (e: any) => {
        e.preventDefault();
        const data = {
            productId: e.target.productId.value,
            warehouseId: e.target.warehouseId.value,
            quantity: parseInt(e.target.quantity.value)
        };
        await fetch(`${API_BASE_URL}/api/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        refreshData();
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2>Resource Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setView('inventory')} className={view === 'inventory' ? 'active' : ''}>Inventory</button>
                    <button onClick={() => setView('add-warehouse')} className={view === 'add-warehouse' ? 'active' : ''}>+ Add Warehouse</button>
                    <button onClick={() => setView('add-product')} className={view === 'add-product' ? 'active' : ''}>+ Add Product</button>
                </div>
            </div>

            {view === 'add-warehouse' && (
                <div className="glass" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                    <h3>Register New Warehouse</h3>
                    <form onSubmit={handleAddWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <input name="name" placeholder="Warehouse Name" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <input name="city" placeholder="City" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input name="lat" placeholder="Latitude" type="number" step="any" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                            <input name="lng" placeholder="Longitude" type="number" step="any" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input name="capacity" placeholder="Capacity" type="number" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                            <input name="operatingCost" placeholder="Op. Cost ($)" type="number" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                        </div>
                        <input name="avgDeliveryTime" placeholder="Avg Delivery Time (hrs)" type="number" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <button type="submit">Initialize Warehouse</button>
                    </form>
                </div>
            )}

            {view === 'add-product' && (
                <div className="glass" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
                    <h3>Catalog New Product</h3>
                    <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <input name="name" placeholder="Product Name" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <input name="sku" placeholder="SKU (e.g. PROD-001)" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <input name="price" placeholder="Price ($)" type="number" step="0.01" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <textarea name="description" placeholder="Description" className="glass" style={{ padding: '0.8rem', color: 'white', minHeight: '100px' }} required />
                        <select name="warehouseId" className="glass" style={{ padding: '0.8rem', color: 'white' }} required>
                            <option value="">Select Initial Warehouse</option>
                            {warehouses.map((w: any) => <option key={w._id} value={w._id}>{w.name}</option>)}
                        </select>
                        <input name="initialQuantity" type="number" placeholder="Initial Quantity" className="glass" style={{ padding: '0.8rem', color: 'white' }} required />
                        <button type="submit">Add to Catalog</button>
                    </form>
                </div>
            )}

            {view === 'inventory' && (
                <div className="grid">
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <h3>Stock Reconciliation</h3>
                        <form onSubmit={handleUpdateStock} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
                            <select name="warehouseId" className="glass" style={{ padding: '0.8rem', color: 'white', minWidth: '150px' }} required>
                                <option value="">Select Warehouse</option>
                                {warehouses.map((w: any) => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                            <select name="productId" className="glass" style={{ padding: '0.8rem', color: 'white', minWidth: '150px' }} required>
                                <option value="">Select Product</option>
                                {products.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            <input name="quantity" type="number" placeholder="Qty" className="glass" style={{ padding: '0.8rem', color: 'white', width: '80px' }} required />
                            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Truck size={18} /> Update
                            </button>
                        </form>

                        <div style={{ marginTop: '2rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Warehouse</th>
                                        <th style={{ padding: '1rem' }}>Product</th>
                                        <th style={{ padding: '1rem' }}>Quantity</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((inv: any) => (
                                        <tr key={inv._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem' }}>{inv.warehouseId?.name}</td>
                                            <td style={{ padding: '1rem' }}>{inv.productId?.name}</td>
                                            <td style={{ padding: '1rem' }}>{inv.quantity}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    color: inv.quantity < 10 ? 'var(--danger)' : 'var(--success)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {inv.quantity < 10 ? 'LOW STOCK' : 'HEALTHY'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <h3>Warehouse Network</h3>
                        <div style={{ marginTop: '1.5rem' }}>
                            {warehouses.map((w: any) => (
                                <div key={w._id} style={{ 
                                    padding: '1rem', 
                                    borderBottom: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{w.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.city} ({w.lat}, {w.lng})</div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        Cap: <span style={{ color: 'var(--accent)' }}>{w.capacity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
