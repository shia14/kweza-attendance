import React from 'react';
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAttendance } from '../context/AttendanceContext';
import './Dashboard.css';

const Dashboard = () => {
  const { people, attendanceLogs, absenceReasons } = useAttendance();

  const stats = [
    { title: 'Total Workers', value: people.length, icon: <Users />, color: '#007BA7' },
    { title: 'Morning Shift', value: people.filter(p => p.shift === 'Morning').length, icon: <Clock />, color: '#87CEEB' },
    { title: 'Afternoon Shift', value: people.filter(p => p.shift === 'Afternoon').length, icon: <Briefcase />, color: '#005f82' },
    { title: 'Today Attended', value: attendanceLogs.filter(l => l.date === '2026-03-26').length, icon: <CheckCircle />, color: '#10b981' },
  ];

  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 15 },
    { name: 'Wed', count: 18 },
    { name: 'Thu', count: 20 },
    { name: 'Fri', count: 17 },
    { name: 'Sat', count: 10 },
  ];

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="page-header">
        <h1>Overview</h1>
        <p>Dashboard summary for March 26, 2026</p>
      </header>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-content">
              <h3>{s.title}</h3>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <div className="chart-card card animate-fade-in">
          <div className="card-header">
            <h3>Weekly Attendance</h3>
            <span className="badge">Last 6 Days</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#007BA7' : '#87CEEB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="alerts-card card animate-fade-in">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="text-btn">View All</button>
          </div>
          <div className="activity-list">
            {scanActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <span className={`activity-dot ${activity.scan_type === 'arrival' ? 'check' : 'info'}`}></span>
                <div className="activity-info">
                  <p><strong>{activity.name}</strong> scanned for {activity.scan_type}</p>
                  <span>{new Date(activity.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {scanActivity.length === 0 && <p className="no-data">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
