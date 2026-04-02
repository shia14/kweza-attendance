import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  Download, 
  ArrowLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { format } from 'date-fns';
import './History.css';

const History = () => {
  const { people, attendanceLogs, checkAttendanceStatus } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const selectedPerson = people.find(p => p.id === selectedPersonId);

  // Generate some dummy history for demonstration
  const dates = ['2026-03-26', '2026-03-25', '2026-03-24', '2026-03-23'];

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = dates.filter(date => {
    const status = checkAttendanceStatus(selectedPersonId, date);
    const dayName = format(new Date(date), 'EEEE');
    const formattedDate = format(new Date(date), 'MMM dd, yyyy');
    
    const matchesSearch = formattedDate.toLowerCase().includes(logSearchTerm.toLowerCase()) || 
                          dayName.toLowerCase().includes(logSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="history-container animate-fade-in">
      <header className="page-header">
        <div className="header-breadcrumbs">
          {selectedPersonId && (
            <button className="back-btn" onClick={() => setSelectedPersonId(null)}>
              <ArrowLeft size={18} />
              <span>Back to All</span>
            </button>
          )}
          <h1>{selectedPersonId ? `${selectedPerson.name}'s History` : 'Attendance History'}</h1>
          <p>Historical logs for all workers from Monday to Saturday</p>
        </div>
        <div className="header-actions">
           <button className="secondary-btn">
             <Download size={18} />
             <span>Export Report</span>
           </button>
        </div>
      </header>

      {!selectedPersonId ? (
        <div className="history-overview">
          <div className="history-controls card">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search person or date..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Calendar size={18} />
              <span>Mar 1 - Mar 26, 2026</span>
            </div>
          </div>

          <div className="people-history-list card">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Total Present</th>
                  <th>Late Arrivals</th>
                  <th>Excused Absences</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map(person => (
                  <tr key={person.id} className="table-row clickable" onClick={() => {
                    setSelectedPersonId(person.id);
                    setLogSearchTerm('');
                    setStatusFilter('All');
                  }}>
                    <td className="user-info">
                      <div className="avatar small">{person.name.charAt(0)}</div>
                      <div className="user-details">
                        <p className="user-name">{person.name}</p>
                        <p className="user-email">{person.shift} Shift</p>
                      </div>
                    </td>
                    <td>22 / 24 Days</td>
                    <td>2 Times</td>
                    <td>1 Time</td>
                    <td className="actions">
                      <ChevronRight size={20} className="icon-sub" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="individual-history animate-fade-in">
          <div className="history-stats grid">
             <div className="h-stat card">
                <span>Monthly Attendance Rate</span>
                <strong>92%</strong>
             </div>
             <div className="h-stat card">
                <span>Avg. Check-in Time</span>
                <strong>07:35 AM</strong>
             </div>
             <div className="h-stat card">
                <span>Total Work Hours</span>
                <strong>118.5h</strong>
             </div>
          </div>

          <div className="history-logs card">
            <div className="logs-header">
               <h3>March 2026 Logs</h3>
               <div className="log-filters">
                  <div className="search-bar mini">
                    <Search size={14} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Filter by date or day..." 
                      value={logSearchTerm}
                      onChange={(e) => setLogSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Attended">Attended</option>
                    <option value="Missing">Missing</option>
                    <option value="Absent (Reasoned)">Reasoned</option>
                  </select>
               </div>
            </div>
            <table className="history-table">
               <thead>
                  <tr>
                     <th>Date</th>
                     <th>Day</th>
                     <th>Check-In</th>
                     <th>Check-Out</th>
                     <th>Status</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(date => {
                      const status = checkAttendanceStatus(selectedPersonId, date);
                      const log = attendanceLogs.find(l => l.person_id === selectedPersonId && l.date === date);
                      return (
                        <tr key={date} className="table-row">
                          <td>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Africa/Johannesburg' })}</td>
                          <td>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Africa/Johannesburg' })}</td>
                          <td>{log?.check_in || '--:--'}</td>
                          <td>{log?.check_out || '--:--'}</td>

                          <td>
                            <span className={`status-badge ${status.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)' }}>
                        No logs found matching your filters.
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
