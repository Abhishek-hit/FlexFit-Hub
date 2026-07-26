import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { attendanceApi } from '../../api/attendanceApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useWebSocketTopic } from '../../utils/useWebSocketTopic';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function OwnerAttendancePage() {
  const { gymId } = useParams();
  const toast = useToast();

  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, reportRes] = await Promise.all([
        attendanceApi.byDate(gymId, date),
        attendanceApi.report(gymId),
      ]);
      setRecords(recRes.data.data);
      setReport(reportRes.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load attendance.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, date, toast]);

  useEffect(() => { load(); }, [load]);

  const onEvent = useCallback((payload) => {
    if (payload.date === date) {
      setRecords((prev) => [payload, ...prev.filter((r) => r.id !== payload.id)]);
    }
  }, [date]);

  useWebSocketTopic(`/topic/gym/${gymId}/attendance`, onEvent, !!gymId);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Attendance</h1>
          <p className="subtitle">Track daily check-ins and trends</p>
        </div>
        <div className="input-with-prefix" style={{ width: 200 }}>
          <span className="input-prefix"><FiCalendar /></span>
          <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayIso()} />
        </div>
      </div>

      {report && (
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Today</div><div className="stat-value">{report.todayCount}</div></div>
          <div className="stat-card"><div className="stat-label">This Week</div><div className="stat-value">{report.weeklyCount}</div></div>
          <div className="stat-card"><div className="stat-label">This Month</div><div className="stat-value">{report.monthlyCount}</div></div>
          <div className="stat-card"><div className="stat-label">Last Month</div><div className="stat-value">{report.lastMonthCount}</div></div>
          <div className="stat-card"><div className="stat-label">Attendance %</div><div className="stat-value">{report.attendancePercentage}%</div></div>
          <div className="stat-card"><div className="stat-label">Late Entries</div><div className="stat-value">{report.lateEntries}</div></div>
        </div>
      )}

      <div className="card">
        <div className="panel-header"><h3>Check-ins on {date}</h3></div>
        {loading ? <Loader /> : records.length === 0 ? (
          <EmptyState title="No check-ins yet" subtitle="Members who check in on this date will show up here." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Member</th><th>Time</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="mini-avatar">{(r.memberName || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
                      {r.memberName}
                    </td>
                    <td><FiClock style={{ marginRight: 4, verticalAlign: 'middle' }} />{new Date(r.checkInTime).toLocaleTimeString()}</td>
                    <td><span className="badge badge-info">{r.method}</span></td>
                    <td>{r.late ? <span className="badge badge-warning">Late</span> : <span className="badge badge-success">On time</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
