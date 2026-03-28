import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  MoreHorizontal,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { format } from 'date-fns';
import './Attendance.css';

const Attendance = () => {
  const { people, attendanceLogs, checkAttendanceStatus, addAbsenceReason, shiftRules } = useAttendance();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [reason, setReason] = useState('');
  const [viewShift, setViewShift] = useState('All');
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredPeople = people.filter(p => viewShift === 'All' || p.shift === viewShift);

  const handleAddReason = (e) => {
    e.preventDefault();
    addAbsenceReason(selectedPerson.id, today, reason);
    setReason('');
    setSelectedPerson(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Attended': return <CheckCircle2 className="icon-success" size={18} />;
      case 'Absent (Reasoned)': return <PlusCircle className="icon-info" size={18} />;
      case 'Missing': return <XCircle className="icon-error" size={18} />;
      default: return <HelpCircle className="icon-sub" size={18} />;
    }
  };

  return (
    <div className="attendance-tracker animate-fade-in">
      <header className="page-header">
        <h1>Daily Attendance</h1>
        <p>Real-time tracking for {format(new Date(), 'MMMM do, yyyy')}</p>
      </header>

      <div className="attendance-controls card">
        <div className="shift-tabs">
          <button 
            className={`tab ${viewShift === 'All' ? 'active' : ''}`}
            onClick={() => setViewShift('All')}
          >All Shifts</button>
          <button 
            className={`tab ${viewShift === 'Morning' ? 'active' : ''}`}
            onClick={() => setViewShift('Morning')}
          >Morning</button>
          <button 
            className={`tab ${viewShift === 'Afternoon' ? 'active' : ''}`}
            onClick={() => setViewShift('Afternoon')}
          >Afternoon</button>
        </div>
        <div className="current-rules">
          <Clock size={16} />
          <span>Scanning ends at: <strong>{shiftRules.Morning.scanEnd} (M)</strong> / <strong>{shiftRules.Afternoon.scanEnd} (A)</strong></span>
        </div>
      </div>

      <div className="attendance-grid">
        {filteredPeople.map(person => {
          const status = checkAttendanceStatus(person.id, today);
          const log = attendanceLogs.find(l => l.personId === person.id && l.date === today);
          
          return (
            <div key={person.id} className={`attendance-card card ${status === 'Missing' ? 'border-danger' : ''}`}>
              <div className="card-top">
                <div className="person-brief">
                  <div className="person-avatar">{person.name.charAt(0)}</div>
                  <div className="name-meta">
                    <h4>{person.name}</h4>
                    <span className="shift-meta">{person.shift} Shift</span>
                  </div>
                </div>
                <div className="status-indicator">
                  {getStatusIcon(status)}
                  <span
                    className={`status-text ${status
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')}`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="card-details">
                {status === 'Attended' ? (
                  <div className="time-info">
                    <div className="time-block">
                      <span>Check-In</span>
                      <strong>{log.checkIn}</strong>
                    </div>
                    <div className="time-block">
                      <span>Check-Out</span>
                      <strong>{log.checkOut || '--:--'}</strong>
                    </div>
                  </div>
                ) : status === 'Missing' ? (
                  <div className="missing-action">
                    <p className="danger-text">System flagged: Non-attendance</p>
                    <button 
                      className="add-reason-btn"
                      onClick={() => setSelectedPerson(person)}
                    >
                      Add Reason
                    </button>
                  </div>
                ) : (
                  <div className="reasoned-info">
                    <p>Reason provided and approved by admin.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPerson && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in">
            <div className="modal-header">
              <h3>Excused Absence: {selectedPerson.name}</h3>
              <button className="close-btn" onClick={() => setSelectedPerson(null)}>×</button>
            </div>
            <form onSubmit={handleAddReason} className="modal-form">
              <div className="form-group">
                <label>Reason for Absence</label>
                <textarea 
                  rows="4"
                  placeholder="e.g. Health emergency, Authorized leave... (Optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="primary-btn submit-btn">Mark as Excused</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
