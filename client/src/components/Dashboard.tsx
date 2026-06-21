import React, { useEffect, useState } from 'react';
import { Activity, BarChart3, PackageCheck, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    totalOrders: 0,
    inventoryValue: 0,
    lowStockAlerts: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const fetchOrders = () => {
    fetch(`${API_BASE_URL}/api/orders`).then(res => res.json()).then(data => {
      setStats(prev => ({ ...prev, totalOrders: data.filter((o:any) => o.status === 'Fulfilled').length }));
      setRecentOrders(data.slice(-10).reverse());
    });
  };

  useEffect(() => {
    // Initial fetch
    fetch(`${API_BASE_URL}/api/warehouses`).then(res => res.json()).then(data => 
      setStats(prev => ({ ...prev, totalWarehouses: data.length }))
    );
    
    fetchOrders();

    fetch(`${API_BASE_URL}/api/inventory`).then(res => res.json()).then(data => {
      setStats(prev => ({ ...prev, lowStockAlerts: data.filter((i:any) => i.quantity < 10).length }));
    });
  }, []);

  const handleFulfill = async (orderId: string) => {
    await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Fulfilled' })
    });
    fetchOrders(); // Refresh table
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
                    {order.status !== 'Fulfilled' && (
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
