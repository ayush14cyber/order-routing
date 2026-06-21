import React, { useState, useEffect } from 'react';
import { ShoppingCart, Target, Info } from 'lucide-react';
import { API_BASE_URL } from '../api';

const OrderCreator = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/products`).then(res => res.json()).then(setProducts);
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            customerName: e.target.customerName.value,
            customerLat: parseFloat(e.target.lat.value),
            customerLng: parseFloat(e.target.lng.value),
            items: [
                {
                    productId: e.target.productId.value,
                    quantity: parseInt(e.target.quantity.value)
                }
            ]
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.error) {
                alert(result.error);
            } else {
                setLastOrder(result);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in grid" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 1fr' }}>
            <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <ShoppingCart color="var(--primary)" />
                    <h3>Simulate Fulfillment Request</h3>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Customer Identification</label>
                        <input name="customerName" placeholder="Client Name" className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white' }} required />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Delivery Coordinates (e.g., Bangalore 12.97, 77.59)</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input name="lat" placeholder="Latitude" type="number" step="any" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                            <input name="lng" placeholder="Longitude" type="number" step="any" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Product Selection</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <select name="productId" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 2 }} required>
                                <option value="">Select Product</option>
                                {products.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            <input name="quantity" type="number" placeholder="Qty" className="glass" style={{ padding: '0.8rem', color: 'white', flex: 1 }} required />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        {loading ? 'Optimizing...' : <> <Target size={20} /> Execute Routing Engine </>}
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {lastOrder ? (
                    <div className="glass animate-in" style={{ padding: '2rem', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '10px', borderRadius: '50%' }}>
                                <Info color="var(--success)" size={24} />
                            </div>
                            <h3>Optimized Selection</h3>
                        </div>
                        
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The engine has calculated the best fulfillment source based on the weighted scoring formula.</p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ASSIGNED FACILITY</span>
                                <h4 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>{lastOrder.assignedWarehouseId?.name}</h4>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ROUTING SCORE</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lastOrder.routingScore?.toFixed(2)}%</div>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>AI EXPLANATION</span>
                                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.5rem', lineHeight: '1.5' }}>"{lastOrder.explanation}"</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Awaiting new fulfillment request...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCreator;
