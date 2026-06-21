import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WarehouseMap from './components/WarehouseMap';
import InventoryManager from './components/InventoryManager';
import OrderCreator from './components/OrderCreator';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <WarehouseMap />;
      case 'inventory':
        return <InventoryManager />;
      case 'orders':
        return <OrderCreator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user.role} 
        onLogout={handleLogout} 
      />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Session: </span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{user.username.toUpperCase()}</span>
            <span style={{ marginLeft: '1rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>{user.role}</span>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
