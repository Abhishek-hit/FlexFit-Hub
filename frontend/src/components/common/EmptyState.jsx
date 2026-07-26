import React from 'react';

export default function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
