import React, { useEffect, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { attendanceApi } from '../../api/attendanceApi';
import { memberApi } from '../../api/memberApi';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Member.css';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function monthRange(date) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

export default function MemberAttendancePage() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const now = new Date();

  async function load() {
    setLoading(true);
    const { from, to } = monthRange(now);
    try {
      const [attRes, profileRes] = await Promise.all([
        attendanceApi.myAttendance(from, to),
        memberApi.myProfile(),
      ]);
      setRecords(attRes.data.data);
      setProfile(profileRes.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load attendance.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCheckIn() {
    if (!profile?.attendanceCode) return;
    setCheckingIn(true);
    try {
      await attendanceApi.checkIn({ code: profile.attendanceCode, method: 'MANUAL' });
      toast.success('Checked in! Keep the streak alive.');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not check in.'));
    } finally {
      setCheckingIn(false);
    }
  }

  if (loading) return <Loader />;

  const presentDays = new Set(records.map((r) => r.date));
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = now.toISOString().slice(0, 10);
  const checkedInToday = presentDays.has(todayStr);

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const attendanceRate = daysInMonth ? Math.round((records.length / now.getDate()) * 100) : 0;

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Attendance</h1>
          <p className="subtitle">{now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · {records.length} days present · {attendanceRate}% rate</p>
        </div>
        <button className="btn btn-primary" disabled={checkingIn || checkedInToday} onClick={handleCheckIn}>
          <FiCheckCircle /> {checkedInToday ? 'Checked in today' : checkingIn ? 'Checking in…' : 'Check In Now'}
        </button>
      </div>

      <div className="card card-pad">
        <div className="calendar-grid" style={{ marginBottom: 6 }}>
          {DAY_LABELS.map((l, i) => <div className="calendar-daylabel" key={i}>{l}</div>)}
        </div>
        <div className="calendar-grid">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="calendar-cell blank" />;
            const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
            const present = presentDays.has(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <div key={i} className={`calendar-cell${present ? ' present' : ''}${isToday ? ' today' : ''}`}>
                {d}
              </div>
            );
          })}
        </div>
      </div>

      {profile?.attendanceCode && (
        <div className="card card-pad" style={{ marginTop: 18, textAlign: 'center' }}>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginBottom: 8 }}>Your attendance code — show this at the gym kiosk or scanner</p>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: 'var(--color-primary)' }}>{profile.attendanceCode}</div>
        </div>
      )}
    </div>
  );
}
