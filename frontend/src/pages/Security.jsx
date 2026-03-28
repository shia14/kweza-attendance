import React, { useState } from 'react';
import { Lock, Save, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';
import qrCodeSvg from '../assets/attendance-qr.svg';
import './Security.css';

const Security = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const qrValue = 'KWEZA-ATTENDANCE-CHECKIN';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('New passwords do not match');
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-container animate-fade-in">
      <header className="page-header">
         <h1>Security Settings</h1>
         <p>Update your administration password</p>
      </header>

      <div className="security-card card animate-fade-in">
         <div className="card-header">
            <Lock size={20} className="icon-primary" />
            <h3>Change Admin Password</h3>
         </div>
         
         <form onSubmit={handleSubmit} className="security-form">
            <div className="form-group">
               <label>Current Password</label>
               <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
               />
            </div>

            <div className="form-group">
               <label>New Password</label>
               <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
               />
            </div>

            <div className="form-group">
               <label>Confirm New Password</label>
               <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
               />
            </div>

            {error && (
              <div className="security-badge error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="security-badge success">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="primary-btn security-btn" disabled={loading}>
               <Save size={18} />
               <span>{loading ? 'Updating...' : 'Save Password'}</span>
            </button>
         </form>
      </div>

      <div className="security-card card qr-card animate-fade-in">
         <div className="card-header">
            <QrCode size={20} className="icon-primary" />
            <h3>Attendance QR Code</h3>
         </div>
         <p className="qr-subtitle">
            Display this code at the entrance. Staff scan it on arrival and departure.
         </p>
         <div className="qr-body">
            <div className="qr-code">
               <img src={qrCodeSvg} alt="Attendance QR code" />
            </div>
            <div className="qr-meta">
               <span className="qr-label">Encoded value</span>
               <div className="qr-value">{qrValue}</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Security;
