import React, { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, LogOut } from 'lucide-react';
import Scanner from './components/Scanner';

const QR_VALUE = 'KWEZA-ATTENDANCE-CHECKIN';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://kweza-attendance.vercel.app';

function App() {
  const [screen, setScreen] = useState('login');
  const [memberId, setMemberId] = useState('');
  const [pin, setPin] = useState('');
  const [worker, setWorker] = useState(null);
  const [errors, setErrors] = useState({});
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!memberId || !pin) return setErrors({ general: 'Please fill all fields' });

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${API_BASE}/api/worker-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberId.trim(), pin: pin.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setWorker(data.worker);
        setScreen('scan');
      } else {
        setErrors({ general: data.message || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ general: 'Connection failed. Is the server running?' });
    } finally {
      setLoading(false);
    }
  };

  const processScan = async (decodedText) => {
    const trimmed = (decodedText || '').trim();
    if (trimmed !== QR_VALUE) {
      alert(`Access Denied: This QR code is not valid for Kweza Attendance. (Value: ${trimmed})`);
      setScanning(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: worker.name,
          idNumber: worker.member_id,
          qrValue: decodedText
        }),
      });
      const result = await response.json();
      if (result.success) {
        const time = new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (result.scanType === 'arrival') {
          setArrival({ time });
        } else {
          setDeparture({ time });
        }
      } else {
        alert(result.message || 'Scan failed');
      }
    } catch (err) {
      alert('Network error recording scan');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  if (screen === 'login') {
    return (
      <main className="login-page animate-fade-in">
        <header className="header-section">
          <div className="logo-container">
            <img src="/logo.png" alt="Kweza Logo" className="logo" />
          </div>
          <h1>Welcome to My Kweza</h1>
          <p>Secure portal for the Kweza Team</p>
        </header>

        <section className="login-card">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Member ID</label>
              <div className="input-box">
                <User size={18} />
                <input
                  type="text"
                  placeholder="e.g. XOU-2028-003"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  autoCapitalize="none"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>PIN Code</label>
              <div className="input-box">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••"
                  maxLength="4"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
            </div>

            {errors.general && (
              <div className="error-badge">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN TO ACCOUNT'}
            </button>
          </form>

          <footer className="card-footer">
            <p>Professional financial services for Malawi & Community.</p>
            <p className="copyright">© 2026 Kweza Pay. All rights reserved.</p>
          </footer>
        </section>

        <style>{`
          .login-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 40px 24px;
            gap: 32px;
          }
          .header-section {
            text-align: center;
          }
          .logo-container {
            height: 120px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo {
            height: 220px;
            width: auto;
            position:relative;
            top: 45px;
          }
          .header-section h1 {
            font-size: 22px;
            font-weight: 800;
            color: var(--text-main);
            margin-bottom: 6px;
          }
          .header-section p {
            font-size: 14px;
            color: var(--text-sub);
          }
          .login-card {
            background-color: var(--card-bg);
            border-radius: var(--radius-lg);
            padding: 24px 20px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            max-width: 300px;
            max-hieght:400px;
            margin: 0 auto;
            width: 100%;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #718096;
            margin-bottom: 6px;
            margin-left: 4px;
          }
          .input-box {
            background: white;
            border: 1.5px solid #E2E8F0;
            border-radius: var(--radius-md);
            padding: 0 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s ease;
          }
          .input-box input {
            flex: 1;
            padding: 12px 0;
            border: none;
            background: transparent;
            font-size: 15px;
            color: var(--text-main);
          }
          .login-btn {
            background: var(--primary);
            color: white;
            border-radius: var(--radius-md);
            padding: 14px;
            font-weight: 800;
            font-size: 14px;
            letter-spacing: 0.5px;
            margin-top: 4px;
            box-shadow: 0 4px 12px rgba(42, 82, 190, 0.4);
          }
          .error-badge {
              background: #FFF5F5;
              color: var(--error);
              padding: 12px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              font-weight: 600;
          }
          .card-footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #CBD5E0;
            text-align: center;
            font-size: 13px;
            color: var(--text-sub);
            line-height: 1.5;
          }
          .copyright {
            margin-top: 4px;
            font-weight: 600;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="scan-page animate-fade-in">
      {scanning && <Scanner onScan={processScan} onCancel={() => setScanning(false)} />}

      <header className="scan-header">
        <img src="/logo.png" alt="Logo" className="logo-mini" />
        <div className="worker-info">
          <h2>Attendance Scan</h2>
          <p>{worker.name} | ID: {worker.member_id}</p>
        </div>
        <button className="logout-btn" onClick={() => setScreen('login')}>
          <LogOut size={20} />
        </button>
      </header>

      <section className="scan-body">
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Arrival Scan</span>
            <span className={`status-time ${arrival ? 'active' : ''}`}>
              {arrival ? arrival.time : '--:--'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Departure Scan</span>
            <span className={`status-time ${departure ? 'active' : ''}`}>
              {departure ? departure.time : '--:--'}
            </span>
          </div>
        </div>

        <div className="scan-action">
          <button
            className={`big-scan-btn ${loading ? 'loading' : ''}`}
            onClick={() => setScanning(true)}
            disabled={loading}
          >
            {loading ? (
              <div className="loader"></div>
            ) : (
              <>
                <span className="btn-title">TAP TO SCAN</span>
                <span className="btn-subtitle">Attendance QR Code</span>
              </>
            )}
          </button>
        </div>
      </section>

      <style>{`
          .scan-page {
            padding: 24px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 40px;
          }
          .scan-header {
              display: flex;
              align-items: center;
              gap: 16px;
          }
          .logo-mini {
              width: auto;
              height: 100px;
          }
          .worker-info h2 {
              font-size: 20px;
              color: var(--text-main);
              font-weight: 800;
          }
          .worker-info p {
              font-size: 14px;
              color: var(--text-sub);
          }
          .logout-btn {
              margin-left: auto;
              color: var(--text-sub);
              padding: 10px;
          }
          .status-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 60px;
          }
          .status-item {
              background: var(--card-bg);
              padding: 20px;
              border-radius: 20px;
              text-align: center;
              border: 1px solid var(--border);
          }
          .status-label {
              display: block;
              font-size: 12px;
              font-weight: 700;
              color: var(--text-sub);
              text-transform: uppercase;
              margin-bottom: 8px;
          }
          .status-time {
              font-size: 20px;
              font-weight: 800;
              color: #CBD5E0;
          }
          .status-time.active {
              color: var(--success);
          }
          .scan-action {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
          }
          .big-scan-btn {
              width: 220px;
              height: 220px;
              background: var(--primary);
              border-radius: 50%;
              color: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 20px 40px rgba(42, 82, 190, 0.3);
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .big-scan-btn:hover {
              transform: translateY(-5px) scale(1.02);
              box-shadow: 0 25px 50px rgba(42, 82, 190, 0.4);
          }
          .btn-title {
              font-size: 20px;
              font-weight: 900;
          }
          .btn-subtitle {
              font-size: 11px;
              opacity: 0.8;
              margin-top: 4px;
              font-weight: 700;
              letter-spacing: 1px;
          }
          .loader {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 1s infinite linear;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
       `}</style>
    </main>
  );
}

export default App;
