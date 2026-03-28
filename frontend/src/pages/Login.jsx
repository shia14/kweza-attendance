import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

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
      const response = await fetch('http://localhost:5000/api/login', {
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
      <div className="login-card-container">
        <div className="login-logo-section">
          <img src="/KWEZA FINANCIAL SOLUTIONS MAIN LOGO.png" alt="Kweza Logo" className="login-logo" />
          <p className="login-tagline">Attendance System Admin</p>
        </div>

        <div className="login-form-section">
          <h2>Welcome back!</h2>
          <p>Please enter your credentials to manage the system</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label><User size={16} /> Username</label>
              <input 
                type="text" 
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <div className="login-form-group">
              <label><Lock size={16} /> Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : <LogIn size={20} />}
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
      
      <footer className="login-footer">
         &copy; 2026 Kweza Financial Solutions. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
