import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../api';

interface LoginProps {
    onLogin: (user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                onLogin(data);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a)'
        }}>
            <div className="glass animate-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        background: 'rgba(99, 102, 241, 0.2)', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <ShieldCheck size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Intelligence Access</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Logistics Optimization Engine</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="glass"
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', color: 'white', borderRadius: '12px' }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass"
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', color: 'white', borderRadius: '12px' }}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ marginTop: '0.5rem', height: '48px' }}
                    >
                        {loading ? 'Authenticating...' : 'Enter System'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <p>Demo: <b>admin</b> / <b>password123</b></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
