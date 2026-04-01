import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Clock, User, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import './Activity.css';

const Activity = () => {
  const { scanActivity } = useAttendance();

  return (
    <div className="activity-page animate-fade-in">
      <header className="page-header">
        <h1>Recent Activity</h1>
        <p>Live stream of attendance scans</p>
      </header>

      <div className="activity-container card">
        <div className="activity-feed">
          {scanActivity.map((activity) => (
            <div key={activity.id} className="feed-item">
              <div className="feed-icon-wrapper">
                {activity.scan_type === 'arrival' ? 
                  <CheckCircle className="feed-icon-check" size={20} /> : 
                  <Info className="feed-icon-info" size={20} />}
              </div>
              <div className="feed-content">
                <div className="feed-main">
                  <h3>{activity.name}</h3>
                  <span className="feed-id">ID: {activity.id_number}</span>
                </div>
                <p>Recorded an <strong>{activity.scan_type}</strong> scan via PWA.</p>
                <div className="feed-meta">
                  <Clock size={14} />
                  <span>{format(new Date(activity.scanned_at), 'MMM d, h:mm a')}</span>
                  <span className="dot">·</span>
                  <span className="qr-ref">QR: {activity.qr_value}</span>
                </div>
              </div>
            </div>
          ))}
          {scanActivity.length === 0 && (
            <div className="no-activity">
              <Clock size={48} />
              <p>No scans recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
