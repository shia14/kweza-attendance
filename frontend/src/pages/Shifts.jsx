import React, { useState } from 'react';
import { Clock, ShieldAlert, Save, Info } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import './Shifts.css';

const Shifts = () => {
  const { shiftRules, updateShiftRules } = useAttendance();
  const [morning, setMorning] = useState(shiftRules.Morning);
  const [afternoon, setAfternoon] = useState(shiftRules.Afternoon);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateShiftRules({ Morning: morning, Afternoon: afternoon });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="shifts-container animate-fade-in">
      <header className="page-header">
        <h1>Shift Rules & Timing</h1>
        <p>Set the scan window and attendance thresholds</p>
      </header>

      <div className="shifts-grid">
        <div className="shift-config-card card">
          <div className="config-header morning-accent">
            <Clock size={24} />
            <h3>Morning Shift (7 AM - 12 PM)</h3>
          </div>
          <div className="config-body">
            <div className="form-group">
              <label>Scan Window Starts</label>
              <input 
                type="time" 
                value={morning.scan_start}
                onChange={(e) => setMorning({...morning, scan_start: e.target.value})}
              />
              <span className="field-info">People can start scanning arrived from this time.</span>
            </div>
            <div className="form-group border-danger-soft">
              <label>Late Threshold (Scan Ends)</label>
              <input 
                type="time" 
                value={morning.scan_end}
                onChange={(e) => setMorning({...morning, scan_end: e.target.value})}
              />
              <span className="field-info danger-text">If scan exceeds this time, it will be BLOCKED by the system.</span>
            </div>
            <div className="form-group">
              <label>Departure Window Ends</label>
              <input 
                type="time" 
                value={morning.departure_end}
                onChange={(e) => setMorning({...morning, departure_end: e.target.value})}
              />
              <span className="field-info">Deadline for recording departure scan.</span>
            </div>
          </div>
        </div>

        <div className="shift-config-card card">
          <div className="config-header afternoon-accent">
            <Clock size={24} />
            <h3>Afternoon Shift (1 PM - 6 PM)</h3>
          </div>
          <div className="config-body">
            <div className="form-group">
              <label>Scan Window Starts</label>
              <input 
                type="time" 
                value={afternoon.scan_start}
                onChange={(e) => setAfternoon({...afternoon, scan_start: e.target.value})}
              />
            </div>
            <div className="form-group border-danger-soft">
              <label>Late Threshold (Scan Ends)</label>
              <input 
                type="time" 
                value={afternoon.scan_end}
                onChange={(e) => setAfternoon({...afternoon, scan_end: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Departure Window Ends</label>
              <input 
                type="time" 
                value={afternoon.departure_end}
                onChange={(e) => setAfternoon({...afternoon, departure_end: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rule-info-card card animate-fade-in">
        <div className="info-icon">
          <ShieldAlert size={20} />
        </div>
        <div className="info-text">
          <h4>Policy Enforcement</h4>
          <p>Scans outside these windows will trigger a "Scan Restricted" message on the mobile app. Admin dashboard will flag these as "Missing" unless a reason is manually provided.</p>
        </div>
      </div>

      <div className="footer-actions">
        {saved && <span className="save-toast">Settings saved successfully!</span>}
        <button className="primary-btn save-btn" onClick={handleSave}>
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default Shifts;
