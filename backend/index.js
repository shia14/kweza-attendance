const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'kweza_secret_key';
const QR_VALUE = process.env.QR_VALUE || 'KWEZA-ATTENDANCE-CHECKIN';

app.use(cors());
app.use(express.json());

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
  if (admin && bcrypt.compareSync(password, admin.password)) {
    const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], SECRET_KEY);
    const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(decoded.id);
    if (admin && bcrypt.compareSync(currentPassword, admin.password)) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE admin SET password = ? WHERE id = ?').run(hashedPassword, admin.id);
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// --- Attendance Routes ---
app.get('/api/people', (req, res) => {
  const people = db.prepare('SELECT * FROM people').all();
  res.json(people);
});

app.post('/api/people', (req, res) => {
  const { name, shift, mobile, memberId, pin } = req.body;
  const info = db.prepare('INSERT INTO people (name, shift, mobile, member_id, pin) VALUES (?, ?, ?, ?, ?)').run(name, shift, mobile, memberId, pin);
  res.json({ id: info.lastInsertRowid, name, shift, mobile, member_id: memberId, pin, status: 'Active' });
});

app.get('/api/attendance', (req, res) => {
  const logs = db.prepare('SELECT * FROM attendance_logs').all();
  res.json(logs);
});

app.get('/api/reasons', (req, res) => {
  const reasons = db.prepare('SELECT * FROM absence_reasons').all();
  res.json(reasons);
});

app.post('/api/reasons', (req, res) => {
  const { personId, date, reason } = req.body;
  db.prepare('INSERT INTO absence_reasons (person_id, date, reason) VALUES (?, ?, ?)').run(personId, date, reason);
  res.json({ success: true });
});

app.get('/api/shifts', (req, res) => {
  const shifts = db.prepare('SELECT * FROM shift_rules').all();
  const formatted = shifts.reduce((acc, sh) => ({ ...acc, [sh.shift]: sh }), {});
  res.json(formatted);
});

app.put('/api/shifts', (req, res) => {
  const { Morning, Afternoon } = req.body;
  const updateRule = db.prepare('UPDATE shift_rules SET scan_start = ?, scan_end = ?, departure_end = ? WHERE shift = ?');
  updateRule.run(Morning.scan_start || Morning.scanStart, Morning.scan_end || Morning.scanEnd, Morning.departure_end || Morning.departureEnd, 'Morning');
  updateRule.run(Afternoon.scan_start || Afternoon.scanStart, Afternoon.scan_end || Afternoon.scanEnd, Afternoon.departure_end || Afternoon.departureEnd, 'Afternoon');
  res.json({ success: true });
});

// --- Worker Routes ---
app.post('/api/worker/login', (req, res) => {
  const { memberId, pin } = req.body;
  const worker = db.prepare('SELECT * FROM people WHERE member_id = ? AND pin = ? AND status = "Active"').get(memberId, pin);
  if (worker) {
    res.json({ success: true, worker });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Member ID or PIN' });
  }
});

// --- Scan Routes ---
app.post('/api/scan', (req, res) => {
  const { name, idNumber, qrValue } = req.body || {};

  if (!name || !idNumber || !qrValue) {
    return res.status(400).json({ success: false, message: 'Missing scan data' });
  }

  if (qrValue !== QR_VALUE) {
    return res.status(400).json({ success: false, message: 'Invalid QR code' });
  }

  // Find worker to see their last scan today
  const worker = db.prepare('SELECT * FROM people WHERE member_id = ?').get(idNumber);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  const today = new Date().toISOString().split('T')[0];
  const lastScan = db.prepare(
    'SELECT * FROM scan_events WHERE id_number = ? AND DATE(scanned_at) = ? ORDER BY scanned_at DESC LIMIT 1'
  ).get(idNumber, today);

  let scanType = 'arrival';
  if (lastScan && lastScan.scan_type === 'arrival') {
    scanType = 'departure';
  }

  const scannedAt = new Date().toISOString();
  db.prepare(
    'INSERT INTO scan_events (name, id_number, scan_type, qr_value, scanned_at) VALUES (?, ?, ?, ?, ?)'
  ).run(name, idNumber, scanType, qrValue, scannedAt);

  res.json({ success: true, scanType, scannedAt });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
