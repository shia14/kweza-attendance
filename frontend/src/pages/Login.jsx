import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.token);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-full-page">
      <div className="login-decorative-bg"></div>
      <div className="login-card-container">
        <div className="login-card-inner">
          <div className="login-header">
            <img src="/KWEZA FINANCIAL SOLUTIONS MAIN LOGO.png" alt="Kweza Logo" className="login-logo" />
            <h1>Welcome to My Kweza</h1>
            <p>Admin Portal & System Management</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label>Username</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  type="text" 
                  placeholder="Enter administrator username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : <span>SIGN IN TO DASHBOARD</span>}
            </button>
          </form>

          <div className="login-footer-text">
            <p>Professional financial services for Malawi & Community.</p>
            <p className="copyright">© 2026 Kweza Financial Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
