import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Clock, X, Check, Loader } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import './People.css';

const EMPTY_FORM = { name: '', shift: 'Morning', mobile: '', status: 'Active', memberId: '', pin: '' };

const People = () => {
  const { people, addPerson, deletePerson, updatePerson } = useAttendance();
  const [searchTerm, setSearchTerm]   = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson]     = useState(EMPTY_FORM);

  // Edit state
  const [editPerson, setEditPerson]   = useState(null); // person being edited
  const [editForm, setEditForm]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.member_id && p.member_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deletePerson(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addPerson(newPerson);
    setNewPerson(EMPTY_FORM);
    setShowAddModal(false);
  };

  const openEdit = (person) => {
    setEditPerson(person);
    setEditForm({
      name:   person.name,
      shift:  person.shift,
      mobile: person.mobile || '',
      pin:    '', // Don't prefill PIN for security; blank = keep existing
    });
    setSaveError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.shift) return;
    setSaving(true);
    setSaveError('');
    const result = await updatePerson(editPerson.id, editForm);
    setSaving(false);
    if (result.success) {
      setEditPerson(null);
    } else {
      setSaveError('Failed to save. Please try again.');
    }
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
            placeholder="Search by name or ID..."
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
              <th>Member ID</th>
              <th>Shift</th>
              <th>Mobile</th>
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
                  </div>
                </td>
                <td><code style={{ fontSize: '12px', color: '#4a5568' }}>{person.member_id}</code></td>
                <td>
                  <span className={`shift-tag ${person.shift.toLowerCase()}`}>
                    <Clock size={14} />
                    {person.shift}
                  </span>
                </td>
                <td>{person.mobile || <span style={{ color: '#a0aec0' }}>—</span>}</td>
                <td>
                  <span className="status-badge active">{person.status}</span>
                </td>
                <td className="actions">
                  <button
                    className="icon-btn edit"
                    title="Edit"
                    onClick={() => openEdit(person)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="icon-btn delete"
                    title="Delete"
                    onClick={() => handleDelete(person.id, person.name)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPeople.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
                  No workers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Modal ──────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in">
            <div className="modal-header">
              <h3>Register New Person</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20}/></button>
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
                  <option value="Morning">Morning (7 AM – 12 PM)</option>
                  <option value="Afternoon">Afternoon (1 PM – 6 PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Member ID</label>
                <input
                  type="text"
                  placeholder="e.g. XOU-2028-003"
                  value={newPerson.memberId}
                  onChange={(e) => setNewPerson({...newPerson, memberId: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>PIN Code</label>
                <input
                  type="password"
                  maxLength="4"
                  placeholder="4-digit PIN"
                  value={newPerson.pin}
                  onChange={(e) => setNewPerson({...newPerson, pin: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number <span style={{fontWeight:400,color:'#a0aec0'}}>(optional)</span></label>
                <input
                  type="text"
                  value={newPerson.mobile}
                  onChange={(e) => setNewPerson({...newPerson, mobile: e.target.value})}
                />
              </div>
              <button type="submit" className="primary-btn submit-btn">Register Worker</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {editPerson && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in">
            <div className="modal-header">
              <h3>Edit — {editPerson.name}</h3>
              <button className="close-btn" onClick={() => setEditPerson(null)}><X size={20}/></button>
            </div>
            <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '16px' }}>
              Member ID: <strong>{editPerson.member_id}</strong> (cannot be changed)
            </p>
            <form onSubmit={handleEditSave} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Shift Assignment</label>
                <select
                  value={editForm.shift}
                  onChange={(e) => setEditForm({...editForm, shift: e.target.value})}
                >
                  <option value="Morning">Morning (7 AM – 12 PM)</option>
                  <option value="Afternoon">Afternoon (1 PM – 6 PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mobile Number <span style={{fontWeight:400,color:'#a0aec0'}}>(optional)</span></label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>New PIN <span style={{fontWeight:400,color:'#a0aec0'}}>(leave blank to keep current)</span></label>
                <input
                  type="password"
                  maxLength="4"
                  placeholder="••••"
                  value={editForm.pin}
                  onChange={(e) => setEditForm({...editForm, pin: e.target.value})}
                />
              </div>
              {saveError && (
                <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '8px' }}>{saveError}</p>
              )}
              <button type="submit" className="primary-btn submit-btn" disabled={saving}>
                {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default People;
