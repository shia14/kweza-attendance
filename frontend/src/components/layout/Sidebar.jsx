import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Settings, 
  History, 
  LayoutDashboard, 
  LogOut,
  Clock,
  ShieldCheck,
  Activity
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Manage People', icon: <Users size={20} />, path: '/people' },
    { name: 'Attendance', icon: <Calendar size={20} />, path: '/attendance' },
    { name: 'Shift Rules', icon: <Clock size={20} />, path: '/shifts' },
    { name: 'Recent Activity', icon: <Activity size={20} />, path: '/activity' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
    { name: 'Security', icon: <ShieldCheck size={20} />, path: '/security' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            onClick={onClose}
          >
            {item.icon}
            <span className="sidebar-item-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span className="sidebar-item-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
