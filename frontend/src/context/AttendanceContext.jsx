import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  const [people, setPeople] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [absenceReasons, setAbsenceReasons] = useState([]);
  const [shiftRules, setShiftRules] = useState({
    Morning: { scan_start: '07:00', scan_end: '08:30', departure_end: '12:30' },
    Afternoon: { scan_start: '13:00', scan_end: '14:30', departure_end: '18:30' },
  });
  const [loading, setLoading] = useState(true);

  const [scanActivity, setScanActivity] = useState([]);

  const fetchData = async () => {
    try {
      const endpoints = ['people', 'attendance', 'reasons', 'shifts', 'activity'];
      const responses = await Promise.all(
        endpoints.map(ep => fetch(`${API_BASE}/api/${ep}`).catch(e => ({ json: () => [], ok: false })))
      );

      const [pData, aData, rData, sData, acData] = await Promise.all(
        responses.map(res => (res.ok ? res.json().catch(() => []) : []))
      );

      setPeople(Array.isArray(pData) ? pData : []);
      setAttendanceLogs(Array.isArray(aData) ? aData : []);
      setAbsenceReasons(Array.isArray(rData) ? rData : []);
      setScanActivity(Array.isArray(acData) ? acData : []);
      if (sData && !Array.isArray(sData) && Object.keys(sData).length > 0) {
        setShiftRules(sData);
      }
    } catch (err) {
      console.error('Critical failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPerson = async (person) => {
    const res = await fetch(`${API_BASE}/api/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    });
    const newPerson = await res.json();
    setPeople([...people, newPerson]);
  };

  const deletePerson = async (id) => {
    const res = await fetch(`${API_BASE}/api/people?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPeople(people.filter(p => p.id !== id));
    }
  };

  const updatePerson = async (id, updates) => {
    const res = await fetch(`${API_BASE}/api/people?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setPeople(people.map(p => p.id === id ? updated : p));
      return { success: true };
    }
    return { success: false };
  };

  const updateShiftRules = async (rules) => {
    const res = await fetch(`${API_BASE}/api/shifts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rules),
    });
    if (res.ok) {
      setShiftRules(rules);
    }
  };

  const addAbsenceReason = async (personId, date, reason) => {
    const res = await fetch(`${API_BASE}/api/reasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, date, reason }),
    });
    if (res.ok) {
        setAbsenceReasons([...absenceReasons, { person_id: personId, date, reason }]);
    }
  };

  const checkAttendanceStatus = (personId, date) => {
    const log = attendanceLogs.find(l => l.person_id === personId && l.date === date);
    const reason = absenceReasons.find(r => r.person_id === personId && r.date === date);
    
    if (log) return 'Attended';
    if (reason) return 'Absent (Reasoned)';
    return 'Missing';
  };

  return (
    <AttendanceContext.Provider value={{
      people,
      addPerson,
      deletePerson,
      updatePerson,
      attendanceLogs,
      absenceReasons,
      addAbsenceReason,
      shiftRules,
      updateShiftRules,
      checkAttendanceStatus,
      scanActivity,
      loading,
      refreshData: fetchData
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};
