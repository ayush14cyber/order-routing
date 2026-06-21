import React from 'react';
import { LayoutDashboard, Map as MapIcon, Package, ShoppingCart, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, userRole, onLogout }: SidebarProps) => {
  const allItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Warehouse Manager'] },
    { id: 'map', icon: MapIcon, label: 'Warehouse Map', roles: ['Admin'] },
    { id: 'inventory', icon: Package, label: 'Inventory', roles: ['Admin', 'Warehouse Manager'] },
    { id: 'orders', icon: ShoppingCart, label: 'Routing Engine', roles: ['Admin'] },
  ];

  const menuItems = allItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="sidebar glass" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LOGI-CORE
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Optimization Engine</p>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              color: activeTab === item.id ? 'var(--text-main)' : 'var(--text-muted)',
              background: activeTab === item.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              transition: 'all 0.3s ease',
              borderLeft: activeTab === item.id ? '4px solid var(--primary)' : '4px solid transparent'
            }}
          >
            <item.icon size={20} style={{ marginRight: '1rem' }} />
            <span style={{ fontWeight: activeTab === item.id ? '600' : '400' }}>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          {/* <Settings size={20} style={{ marginRight: '1rem' }} />
          <span>Settings</span> */}
        </div>
        <div 
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', padding: '1rem', color: 'var(--danger)', cursor: 'pointer' }}
        >
          <LogOut size={20} style={{ marginRight: '1rem' }} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
