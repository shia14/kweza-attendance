import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import Attendance from './pages/Attendance';
import Shifts from './pages/Shifts';
import History from './pages/History';
import Login from './pages/Login';
import Activity from './pages/Activity';
import WorkerHistory from './pages/WorkerHistory';
import { AttendanceProvider } from './context/AttendanceContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AttendanceProvider>
        <div className="app-container">
          <Sidebar onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/people" element={<People />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/worker/:id/history" element={<WorkerHistory />} />
              <Route path="/shifts" element={<Shifts />} />
              <Route path="/history" element={<History />} />
              <Route path="/security" element={<Security />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AttendanceProvider>
    </Router>
  );
}

export default App;
