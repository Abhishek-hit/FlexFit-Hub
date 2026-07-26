import React, { useEffect, useState } from 'react';
import { notificationApi } from '../../api/notificationApi';
import Loader from './Loader';
import EmptyState from './EmptyState';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';

const TYPE_ICONS = {
  FEE_REMINDER: '💳', MEMBERSHIP_EXPIRY: '⏰', NEW_WORKOUT: '🏋️', NEW_DIET_PLAN: '🥗',
  NEW_VIDEO: '🎥', ATTENDANCE_MARKED: '✅', PAYMENT_SUCCESSFUL: '🎉', WELCOME: '👋',
  TRIAL_ENDING: '⌛', GENERAL: '🔔',
};

export default function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.list()
      .then((r) => setNotifications(r.data.data))
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function markRead(id) {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-title-row"><div><h1>Notifications</h1></div></div>
      {loading ? <Loader /> : notifications.length === 0 ? (
        <EmptyState title="You're all caught up" subtitle="New notifications will appear here." />
      ) : (
        <div className="card">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              style={{
                display: 'flex', gap: 14, padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                background: n.read ? 'transparent' : '#f8fafc',
                cursor: n.read ? 'default' : 'pointer',
              }}
            >
              <div style={{ fontSize: 20 }}>{TYPE_ICONS[n.type] || '🔔'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-faint)', marginTop: 6 }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', marginTop: 6 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
