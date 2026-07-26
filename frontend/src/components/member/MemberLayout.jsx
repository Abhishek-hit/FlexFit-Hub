import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';
import { memberApi } from '../../api/memberApi';
import MemberProfileModal from './MemberProfileModal';
import './MemberLayout.css';

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    notificationApi.unreadCount().then((r) => setUnread(r.data.data.count)).catch(() => {});
  }, []);

  async function openProfile() {
    try {
      const { data } = await memberApi.myProfile();
      setProfile(data.data);
      setShowProfile(true);
    } catch {
      // if it fails, the button simply won't open — no need to interrupt navigation
    }
  }

  const linkClass = ({ isActive }) => `member-nav-link${isActive ? ' active' : ''}`;
  const initials = (user?.name || 'M').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="member-shell">
      <header className="member-topbar">
        <div className="member-logo">
          <span className="logo-badge">💪</span>
          <span className="logo-text">GymPro</span>
        </div>

        <nav className="member-nav">
          <NavLink to="/member/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/member/workout" className={linkClass}>Workout Plan</NavLink>
          <NavLink to="/member/diet" className={linkClass}>Diet Plan</NavLink>
          <NavLink to="/member/attendance" className={linkClass}>Attendance</NavLink>
          <NavLink to="/member/payments" className={linkClass}>Payments</NavLink>
        </nav>

        <div className="member-topbar-actions">
          <button className="notif-bell" onClick={() => navigate('/member/notifications')}>
            <FiBell />
            {unread > 0 && <span className="notif-dot" />}
          </button>
          <button className="member-user" onClick={openProfile} title="Edit profile" style={{ border: 'none', background: 'none' }}>
            <div className="avatar-circle">{initials}</div>
            <span className="member-user-name">{user?.name}</span>
          </button>
          <button className="btn-icon logout-btn" onClick={logout} title="Sign out">
            <FiLogOut />
          </button>
        </div>
      </header>

      <main className="member-content">
        <Outlet />
      </main>

      {showProfile && profile && (
        <MemberProfileModal
          profile={profile}
          onClose={() => setShowProfile(false)}
          onSaved={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
