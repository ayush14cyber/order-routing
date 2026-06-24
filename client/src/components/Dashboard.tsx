import { useEffect, useState, useCallback } from 'react';
import { Activity, BarChart3, PackageCheck, AlertCircle, Clock, Play, Square, Zap } from 'lucide-react';
import { API_BASE_URL } from '../api';

const Dashboard = ({ user }: { user?: any }) => {
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    totalOrders: 0,
    inventoryValue: 0,
    lowStockAlerts: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [cronInterval, setCronInterval] = useState(5);
  const [cronProductId, setCronProductId] = useState('');
  const [cronQuantity, setCronQuantity] = useState(1);
  const [cronLat, setCronLat] = useState('');
  const [cronLng, setCronLng] = useState('');
  const [cronLoading, setCronLoading] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState('');

  const fetchOrders = () => {
    fetch(`${API_BASE_URL}/api/orders`).then(res => res.json()).then(data => {
      setStats(prev => ({ ...prev, totalOrders: data.filter((o:any) => o.status === 'Fulfilled').length }));
      setRecentOrders(data.slice(-10).reverse());
    });
  };

  const fetchCronStatus = useCallback(() => {
    fetch(`${API_BASE_URL}/api/cron/status`)
      .then(res => res.json())
      .then(data => {
        setCronStatus(data);
        setCronInterval(data.intervalMinutes || 5);
        if (data.selectedProductId) setCronProductId(data.selectedProductId);
        if (data.selectedQuantity) setCronQuantity(data.selectedQuantity);
        if (data.selectedLat != null) setCronLat(String(data.selectedLat));
        if (data.selectedLng != null) setCronLng(String(data.selectedLng));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Initial fetch
    fetch(`${API_BASE_URL}/api/warehouses`).then(res => res.json()).then(data => 
      setStats(prev => ({ ...prev, totalWarehouses: data.length }))
    );
    
    fetchOrders();
    fetchCronStatus();

    fetch(`${API_BASE_URL}/api/products`).then(res => res.json()).then(setProducts);

    fetch(`${API_BASE_URL}/api/inventory`).then(res => res.json()).then(data => {
      setStats(prev => ({ ...prev, lowStockAlerts: data.filter((i:any) => i.quantity < 10).length }));
    });

    // Poll cron status every 30s
    const interval = setInterval(fetchCronStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchCronStatus]);

  const handleFulfill = async (orderId: string) => {
    await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Fulfilled' })
    });
    fetchOrders();
  };

  const handleCronStart = async () => {
    setCronLoading(true);
    const selectedProduct = products.find((p: any) => p._id === cronProductId);
    await fetch(`${API_BASE_URL}/api/cron/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intervalMinutes: cronInterval,
        productId: cronProductId || null,
        productName: selectedProduct?.name || 'Random',
        quantity: cronQuantity || null,
        lat: cronLat !== '' ? parseFloat(cronLat) : null,
        lng: cronLng !== '' ? parseFloat(cronLng) : null,
      })
    });
    await fetchCronStatus();
    setCronLoading(false);
  };

  const handleCronStop = async () => {
    setCronLoading(true);
    await fetch(`${API_BASE_URL}/api/cron/stop`, { method: 'POST' });
    await fetchCronStatus();
    setCronLoading(false);
  };

  const handleTriggerNow = async () => {
    setCronLoading(true);
    setTriggerMsg('');
    const res = await fetch(`${API_BASE_URL}/api/cron/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: cronProductId || null,
        quantity: cronQuantity || null,
        lat: cronLat !== '' ? parseFloat(cronLat) : null,
        lng: cronLng !== '' ? parseFloat(cronLng) : null,
      })
    });
    const data = await res.json();
    setTriggerMsg(data.message || data.error || 'Done');
    fetchOrders();
    setCronLoading(false);
    setTimeout(() => setTriggerMsg(''), 4000);
  };

  const cards = [
    { label: 'Active Warehouses', value: stats.totalWarehouses, icon: Activity, color: '#6366f1' },
    { label: 'Orders Fulfilled', value: stats.totalOrders, icon: PackageCheck, color: '#22c55e' },
    { label: 'Avg Efficiency', value: '94%', icon: BarChart3, color: '#22d3ee' },
    { label: 'Low Stock Alerts', value: stats.lowStockAlerts, icon: AlertCircle, color: '#ef4444' },
  ];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Logistics Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time intelligence and routing performance metrics.</p>
      </div>

      <div className="grid">
        {cards.map((card, i) => (
          <div key={i} className="card glass animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{card.label}</p>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{card.value}</h3>
              </div>
              <div style={{ background: `${card.color}20`, padding: '12px', borderRadius: '12px' }}>
                <card.icon size={24} color={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Auto Order Scheduler Panel ── */}
      <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Clock size={20} color="var(--accent)" />
          <h3 style={{ margin: 0 }}>Auto Order Scheduler</h3>
          {cronStatus && (
            <span style={{
              marginLeft: 'auto',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: cronStatus.running ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: cronStatus.running ? 'var(--success)' : '#ef4444',
              border: `1px solid ${cronStatus.running ? 'var(--success)' : '#ef4444'}`,
            }}>
              {cronStatus.running ? '● RUNNING' : '○ STOPPED'}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>AUTO ORDERS PLACED</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0' }}>{cronStatus?.ordersPlaced ?? '—'}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>INTERVAL</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0' }}>{cronStatus?.intervalMinutes ?? '—'} min</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>SELECTED PRODUCT</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: '4px 0 0', color: 'var(--accent)' }}>
              {cronStatus?.selectedProductName || 'Random'}
              {cronStatus?.selectedQuantity ? ` × ${cronStatus.selectedQuantity}` : ''}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>DELIVERY LOCATION</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '4px 0 0', color: 'var(--accent)' }}>
              {cronStatus?.selectedLat != null && cronStatus?.selectedLng != null
                ? `${parseFloat(cronStatus.selectedLat).toFixed(4)}, ${parseFloat(cronStatus.selectedLng).toFixed(4)}`
                : '🎲 Random'}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>LAST RAN</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '4px 0 0' }}>
              {cronStatus?.lastRanAt ? new Date(cronStatus.lastRanAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
          {/* Product Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Product</label>
            <select
              id="cron-product-select"
              value={cronProductId}
              onChange={e => setCronProductId(e.target.value)}
              className="glass"
              style={{ padding: '0.5rem 0.75rem', color: 'white', minWidth: '180px' }}
            >
              <option value="">🎲 Random Product</option>
              {products.map((p: any) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Quantity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty</label>
            <input
              id="cron-quantity-input"
              type="number"
              min={1}
              max={100}
              value={cronQuantity}
              onChange={e => setCronQuantity(parseInt(e.target.value) || 1)}
              className="glass"
              style={{ width: '70px', padding: '0.5rem 0.75rem', color: 'white', textAlign: 'center' }}
            />
          </div>
          {/* Latitude */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Latitude</label>
            <input
              id="cron-lat-input"
              type="number"
              step="any"
              placeholder="e.g. 12.97"
              value={cronLat}
              onChange={e => setCronLat(e.target.value)}
              className="glass"
              style={{ width: '110px', padding: '0.5rem 0.75rem', color: 'white' }}
            />
          </div>
          {/* Longitude */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Longitude</label>
            <input
              id="cron-lng-input"
              type="number"
              step="any"
              placeholder="e.g. 77.59"
              value={cronLng}
              onChange={e => setCronLng(e.target.value)}
              className="glass"
              style={{ width: '110px', padding: '0.5rem 0.75rem', color: 'white' }}
            />
          </div>
          {/* Interval */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Interval (min)</label>
            <input
              id="cron-interval-input"
              type="number"
              min={1}
              max={60}
              value={cronInterval}
              onChange={e => setCronInterval(parseInt(e.target.value) || 5)}
              className="glass"
              style={{ width: '90px', padding: '0.5rem 0.75rem', color: 'white', textAlign: 'center' }}
            />
          </div>
          <button
            id="cron-start-btn"
            onClick={handleCronStart}
            disabled={cronLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'rgba(34,197,94,0.15)', border: '1px solid var(--success)', color: 'var(--success)' }}
          >
            <Play size={16} /> Start
          </button>
          <button
            id="cron-stop-btn"
            onClick={handleCronStop}
            disabled={cronLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444' }}
          >
            <Square size={16} /> Stop
          </button>
          <button
            id="cron-trigger-btn"
            onClick={handleTriggerNow}
            disabled={cronLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'rgba(99,102,241,0.15)', border: '1px solid var(--primary)', color: 'var(--primary)' }}
          >
            <Zap size={16} /> Trigger Now
          </button>
          {triggerMsg && <span style={{ color: 'var(--success)', fontSize: '0.875rem', fontStyle: 'italic' }}>✓ {triggerMsg}</span>}
        </div>
      </div>

      <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Routing Decisions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Assigned Warehouse</th>
              <th style={{ padding: '1rem' }}>Efficiency</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order: any) => (
              <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{order.customerName}</td>
                <td style={{ padding: '1rem' }}>{order.assignedWarehouseId?.name || 'Unassigned'}</td>
                <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        background: 'rgba(99, 102, 241, 0.2)', 
                        color: 'var(--accent)', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem' 
                    }}>
                        {order.routingScore?.toFixed(1)}%
                    </span>
                </td>
                <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        color: order.status === 'Fulfilled' ? 'var(--success)' : 'var(--accent)',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                        {order.status.toUpperCase()}
                    </span>
                </td>
                <td style={{ padding: '1rem' }}>
                    {order.status !== 'Fulfilled' && user?.role === 'Warehouse Manager' && (
                        <button 
                            onClick={() => handleFulfill(order._id)}
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                            Fulfill
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
