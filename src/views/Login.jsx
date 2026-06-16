import React, { useState, useContext } from 'react';
import { StallContext } from '../contexts/StallContext';
import { Store, Lock, User, LogIn } from 'lucide-react';

const Login = ({ showToast }) => {
  const { login, registerStall } = useContext(StallContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stallName, setStallName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (isLogin) {
      const result = await login(username, password);
      if (result.success) {
        showToast('Logged in successfully!', 'success');
      } else {
        showToast(result.message, 'error');
      }
    } else {
      if (!stallName) {
        showToast('Please provide a stall name', 'error');
        return;
      }
      const result = await registerStall(username, password, stallName);
      if (result.success) {
        showToast('Stall registered and logged in!', 'success');
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <Store size={48} style={{ color: '#6366f1', marginBottom: '10px' }} />
        <h1 className="auth-title">ExpoStall</h1>
        <p className="auth-subtitle">Manage your stall visitors and invoices seamlessly</p>
      </div>

      <div className="card auth-card">
        <img 
          src="/exhibition_stall.png" 
          alt="Exhibition Stall Photo" 
          className="auth-stall-photo" 
        />
        <h2 style={{ marginBottom: '20px', textAlign: 'left', fontWeight: '600' }}>
          {isLogin ? 'Login to Stall' : 'Register New Stall'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="stallName">Stall Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="stallName"
                  className="form-input"
                  placeholder="e.g. Jain Creations"
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Store size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username / Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <LogIn size={18} />
            {isLogin ? 'Login' : 'Create Stall Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have a stall account?" : 'Already have a stall account?'}
          <button 
            className="auth-switch-btn" 
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername('');
              setPassword('');
              setStallName('');
            }}
          >
            {isLogin ? 'Register Now' : 'Login Now'}
          </button>
        </div>

        {isLogin && (
          <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
            <p>Demo Login: <strong>demo</strong> / <strong>password</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
