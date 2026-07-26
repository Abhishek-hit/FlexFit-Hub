import React from 'react';

const TONE_MAP = {
  ACTIVE: 'success',
  TRIAL: 'info',
  PAID: 'success',
  EXPIRED: 'danger',
  CANCELLED: 'danger',
  PENDING: 'warning',
  OVERDUE: 'danger',
  EXPIRING: 'warning',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const tone = TONE_MAP[status.toUpperCase()] || 'muted';
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`badge badge-${tone}`}>{label}</span>;
}
