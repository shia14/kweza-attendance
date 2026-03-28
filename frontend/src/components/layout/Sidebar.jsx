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
  ShieldCheck
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Manage People', icon: <Users size={20} />, path: '/people' },
    { name: 'Attendance', icon: <Calendar size={20} />, path: '/attendance' },
    { name: 'Shift Rules', icon: <Clock size={20} />, path: '/shifts' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
    { name: 'Security', icon: <ShieldCheck size={20} />, path: '/security' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/KWEZA FINANCIAL SOLUTIONS MAIN LOGO.png" alt="Kweza Logo" className="sidebar-brand-img" />
        <span className="system-tag">Attendance Admin</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
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
