import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { FiBell, FiSearch, FiChevronDown } from 'react-icons/fi';
import OwnerSidebar from './OwnerSidebar';
import { useAuth } from '../../context/AuthContext';
import { memberApi } from '../../api/memberApi';
import { paymentApi } from '../../api/paymentApi';
import { notificationApi } from '../../api/notificationApi';
import { gymApi } from '../../api/gymApi';
import './OwnerLayout.css';

export default function OwnerLayout() {
  const { gymId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [membersCount, setMembersCount] = useState(0);
  const [pendingFeesCount, setPendingFeesCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [gymName, setGymName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!gymId) return;
    memberApi.list(gymId).then((r) => setMembersCount(r.data.data.length)).catch(() => {});
    paymentApi.list(gymId, 'PENDING').then((r) => setPendingFeesCount(r.data.data.length)).catch(() => {});
    notificationApi.unreadCount().then((r) => setUnread(r.data.data.count)).catch(() => {});
    gymApi.getOwnerGym(gymId).then((r) => setGymName(r.data.data.name)).catch(() => {});
  }, [gymId]);

  const initials = (user?.name || 'O').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="owner-shell">
      <OwnerSidebar membersCount={membersCount} pendingFeesCount={pendingFeesCount} />

      <div className="owner-main">
        <header className="owner-topbar">
          <div className="topbar-search">
            <FiSearch />
            <input placeholder="Search members, plans..." />
          </div>

          <div className="topbar-actions">
            <button className="notif-bell" onClick={() => navigate(`/owner/gyms/${gymId}/notifications`)}>
              <FiBell />
              {unread > 0 && <span className="notif-dot" />}
            </button>

            <div className="topbar-user" onClick={() => setMenuOpen((o) => !o)}>
              <div className="avatar-circle">{initials}</div>
              <div className="topbar-user-info">
                <div className="topbar-user-name">{user?.name}</div>
                <div className="topbar-user-sub">{gymName || 'Loading...'}</div>
              </div>
              <FiChevronDown size={14} color="var(--color-text-faint)" />
              {menuOpen && (
                <div className="user-dropdown" onMouseLeave={() => setMenuOpen(false)}>
                  <button onClick={() => navigate(`/owner/gyms/${gymId}/settings`)}>Settings</button>
                  <button onClick={logout} className="danger">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="owner-content">
          <Outlet context={{ membersCount, pendingFeesCount }} />
        </main>
      </div>
    </div>
  );
}
