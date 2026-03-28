import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Filter, Mail, Phone, Clock } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import './People.css';

const People = () => {
  const { people, addPerson } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', shift: 'Morning', mobile: '', status: 'Active' });

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addPerson(newPerson);
    setNewPerson({ name: '', shift: 'Morning', mobile: '', status: 'Active' });
    setShowAddModal(false);
  };

  return (
    <div className="people-container animate-fade-in">
      <header className="page-header">
        <div className="header-actions">
          <div>
            <h1>Manage People</h1>
            <p>Add and manage workers in the system</p>
          </div>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <UserPlus size={18} />
            <span>Add Person</span>
          </button>
        </div>
      </header>

      <div className="table-controls card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Morning</button>
          <button className="filter-btn">Afternoon</button>
        </div>
      </div>

      <div className="people-list card">
        <table className="people-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Shift</th>
              <th>Mobile No.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((person) => (
              <tr key={person.id} className="table-row">
                <td className="user-info">
                  <div className="avatar">{person.name.charAt(0)}</div>
                  <div className="user-details">
                    <p className="user-name">{person.name}</p>
                    <p className="user-email">emp-{person.id}@kweza.com</p>
                  </div>
                </td>
                <td>
                  <span className={`shift-tag ${person.shift.toLowerCase()}`}>
                    <Clock size={14} />
                    {person.shift}
                  </span>
                </td>
                <td>{person.mobile}</td>
                <td>
                  <span className="status-badge active">{person.status}</span>
                </td>
                <td className="actions">
                  <button className="icon-btn edit"><Edit2 size={16} /></button>
                  <button className="icon-btn delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in">
            <div className="modal-header">
              <h3>Register New Person</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Shift Assignment</label>
                <select 
                  value={newPerson.shift}
                  onChange={(e) => setNewPerson({...newPerson, shift: e.target.value})}
                >
                  <option value="Morning">Morning (7 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (1 PM - 6 PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input 
                  type="text" 
                  value={newPerson.mobile}
                  onChange={(e) => setNewPerson({...newPerson, mobile: e.target.value})}
                  required 
                />
              </div>
              <button type="submit" className="primary-btn submit-btn">Register Worker</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default People;
