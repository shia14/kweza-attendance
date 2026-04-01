import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { format } from 'date-fns';
import './Attendance.css';

const Attendance = () => {
  const { people, attendanceLogs, checkAttendanceStatus, shiftRules } = useAttendance();
  const navigate = useNavigate();
  const [viewShift, setViewShift] = useState('All');
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredPeople = people.filter(p => viewShift === 'All' || p.shift === viewShift);

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
          <span>Shifts: <strong>{shiftRules.Morning.scan_start} (M)</strong> / <strong>{shiftRules.Afternoon.scan_start} (A)</strong></span>
        </div>
      </div>

      <div className="attendance-grid">
        {filteredPeople.map(person => {
          const status = checkAttendanceStatus(person.id, today);
          const log = attendanceLogs.find(l => l.person_id === person.id && l.date === today);
          
          return (
            <div 
              key={person.id} 
              className={`attendance-card card hoverable ${status === 'Missing' ? 'border-danger' : ''}`}
              onClick={() => navigate(`/worker/${person.id}/history`)}
            >
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
                    {log?.status || status}
                  </span>
                </div>
              </div>

              <div className="card-details">
                {status === 'Attended' || log ? (
                  <div className="time-info">
                    <div className="time-block">
                      <span>Check-In</span>
                      <strong>{log?.check_in || '--:--'}</strong>
                    </div>
                    <div className="time-block">
                      <span>Check-Out</span>
                      <strong>{log?.check_out || '--:--'}</strong>
                    </div>
                  </div>
                ) : status === 'Missing' ? (
                  <div className="missing-action">
                    <p className="danger-text">Directly flagged</p>
                    <button className="add-reason-btn">Full Profile & History</button>
                  </div>
                ) : (
                  <div className="reasoned-info">
                    <p>Reason provided (See History)</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Attendance;
