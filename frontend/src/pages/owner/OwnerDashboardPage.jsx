import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUsers, FiCalendar, FiDollarSign, FiAlertTriangle, FiUserPlus, FiUserX,
  FiMessageSquare, FiPhone, FiMail, FiCheckCircle,
} from 'react-icons/fi';
import { dashboardApi } from '../../api/dashboardApi';
import { paymentApi } from '../../api/paymentApi';
import { useWebSocketTopic } from '../../utils/useWebSocketTopic';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';

export default function OwnerDashboardPage() {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [overview, setOverview] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, overduePayments] = await Promise.all([
        dashboardApi.owner(gymId),
        paymentApi.list(gymId, 'OVERDUE'),
      ]);
      setOverview(dash.data.data);
      setOverdue(overduePayments.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load dashboard.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const onAttendanceEvent = useCallback((payload) => {
    setActivity((prev) => [
      { id: `att-${payload.id}`, icon: <FiCheckCircle />, text: `${payload.memberName} checked in via ${payload.method}`, time: 'just now' },
      ...prev,
    ].slice(0, 20));
    setOverview((prev) => prev ? { ...prev, todaysAttendance: prev.todaysAttendance + 1 } : prev);
  }, []);

  const { connected } = useWebSocketTopic(`/topic/gym/${gymId}/attendance`, onAttendanceEvent, !!gymId);

  async function remind(paymentId) {
    try {
      await paymentApi.remind(gymId, paymentId);
      toast.success('Reminder sent via SMS, WhatsApp & email.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (loading) return <Loader />;
  if (!overview) return <EmptyState title="Could not load dashboard" />;

  const stats = [
    { label: 'Active Members', value: overview.activeMembers, icon: <FiUsers />, tone: 'blue', sub: `${overview.totalMembers} total` },
    { label: "Today's Check-ins", value: overview.todaysAttendance, icon: <FiCalendar />, tone: 'green' },
    { label: 'Monthly Revenue', value: `₹${overview.monthlyRevenue.toLocaleString('en-IN')}`, icon: <FiDollarSign />, tone: 'purple' },
    { label: 'Pending Fees', value: `₹${overview.pendingFees.toLocaleString('en-IN')}`, icon: <FiAlertTriangle />, tone: 'red' },
    { label: 'Expired Members', value: overview.expiredMembers, icon: <FiUserX />, tone: 'orange' },
    { label: 'New Members', value: overview.newMembersThisMonth, icon: <FiUserPlus />, tone: 'blue' },
  ];

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Overview of your gym's performance</p>
        </div>
        <span className="live-pill"><span className="live-dot" /> {connected ? 'Live · Updated just now' : 'Connecting…'}</span>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.tone}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="dash-grid-2">
        <div className="card">
          <div className="panel-header">
            <h3>🔴 Overdue Fees {overdue.length > 0 && <span className="badge badge-danger">{overdue.length}</span>}</h3>
            <button className="view-all" onClick={() => navigate(`/owner/gyms/${gymId}/fees`)}>View all →</button>
          </div>
          {overdue.length === 0 ? (
            <EmptyState title="No overdue fees" subtitle="Nice — everyone is paid up." />
          ) : (
            <div>
              {overdue.slice(0, 6).map((p) => (
                <div className="overdue-row" key={p.id}>
                  <div className="overdue-member">
                    <div className="mini-avatar">{p.memberName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.memberName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.membershipPlanName} · ₹{p.remainingAmount}</div>
                    </div>
                  </div>
                  <div className="overdue-actions">
                    <button title="Send reminder" onClick={() => remind(p.id)}><FiMessageSquare size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="panel-header">
            <h3>Live Activity</h3>
          </div>
          <p style={{ padding: '0 20px', fontSize: 12, color: 'var(--color-text-muted)' }}>Real-time gym events</p>
          <div className="activity-feed">
            {activity.length === 0 ? (
              <EmptyState title="No recent activity" subtitle="Check-ins will appear here in real time." />
            ) : (
              activity.map((a) => (
                <div className="activity-item" key={a.id}>
                  <div className="activity-dot">{a.icon}</div>
                  <div>
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
