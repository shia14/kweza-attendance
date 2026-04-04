import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Calendar, AlertCircle } from 'lucide-react';
import './WorkerHistory.css';

const WorkerHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, attendanceLogs, addAbsenceReason, refreshData } = useAttendance();
  const [person, setPerson] = useState(null);
  const [reason, setReason] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const found = people.find(p => p.id === parseInt(id));
    if (found) setPerson(found);
  }, [id, people]);

  if (!person) return <div className="loading">Loading worker data...</div>;

  const logs = attendanceLogs
    .filter(l => l.person_id === person.id)
    .filter(l => !filterDate || l.date === filterDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddReason = async (e) => {
    e.preventDefault();
    const today = format(new Date(), 'yyyy-MM-dd');
    await addAbsenceReason(person.id, today, reason);
    setReason('');
    refreshData();
  };

  return (
    <div className="worker-history-page animate-fade-in">
      <header className="page-header sticky">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to Attendance</span>
        </button>
        <div className="worker-title-section">
          <div className="avatar-large">{person.name.charAt(0)}</div>
          <div className="title-meta">
             <h1>{person.name}</h1>
             <p>{person.shift} Shift | ID: {person.member_id} | {person.mobile || 'No Mobile'}</p>
          </div>
        </div>
      </header>

      <div className="history-content-grid">
        <section className="logs-section card">
          <div className="section-header">
            <h3>Attendance History</h3>
            <div className="filter-box">
              <Calendar size={18} />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="history-table-wrapper">
             <table className="history-table">
                <thead>
                   <tr>
                      <th>Date</th>
                      <th>Arrival</th>
                      <th>Departure</th>
                      <th>Status</th>
                   </tr>
                </thead>
                <tbody>
                   {logs.map(log => (
                      <tr key={log.id}>
                         <td data-label="Date">{format(new Date(log.date), 'EEEE, MMM do, yyyy')}</td>
                         <td data-label="Arrival" className="time-td"><Clock size={14}/> {log.check_in || '--:--'}</td>
                         <td data-label="Departure" className="time-td"><Clock size={14}/> {log.check_out || '--:--'}</td>
                         <td data-label="Status">
                            <span className={`status-pill ${log.status?.toLowerCase() || 'attended'}`}>
                               {log.status || 'Attended'}
                            </span>
                         </td>
                      </tr>
                   ))}
                   {logs.length === 0 && (
                      <tr><td colSpan="4" className="no-data">No attendance records found.</td></tr>
                   )}
                </tbody>
             </table>
          </div>
        </section>

        <aside className="action-aside">
          <div className="action-card card">
            <h3>Daily Management</h3>
            <p>Assign a reason for absence for today's shift.</p>
            <form onSubmit={handleAddReason} className="aside-form">
               <textarea 
                 placeholder="e.g. Authorized leave, medical reason..."
                 value={reason}
                 onChange={(e) => setReason(e.target.value)}
                 rows="3"
               />
               <button type="submit" className="primary-btn">Excuse Today's Absence</button>
            </form>
          </div>
          
          <div className="info-card card">
             <div className="info-header">
                <AlertCircle size={20} />
                <h4>System Note</h4>
             </div>
             <p>Scans are automatically flagged as "Late" if recorded after the shift end-scan window.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WorkerHistory;
