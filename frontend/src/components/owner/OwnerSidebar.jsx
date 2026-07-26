import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  FiGrid, FiBarChart2, FiUsers, FiCalendar, FiCreditCard,
  FiActivity, FiClipboard, FiVideo, FiSettings, FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './OwnerLayout.css';

export default function OwnerSidebar({ pendingFeesCount, membersCount }) {
  const { gymId } = useParams();
  const { logout } = useAuth();
  const base = `/owner/gyms/${gymId}`;

  const linkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <aside className="owner-sidebar">
      <div className="sidebar-logo">
        <span className="logo-badge">💪</span>
        <span className="logo-text">GymPro</span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section">Overview</p>
        <NavLink to={`${base}/dashboard`} className={linkClass}>
          <FiGrid /> Dashboard
        </NavLink>
        <NavLink to={`${base}/analytics`} className={linkClass}>
          <FiBarChart2 /> Analytics
        </NavLink>

        <p className="sidebar-section">Members</p>
        <NavLink to={`${base}/members`} className={linkClass}>
          <FiUsers /> All Members
          {membersCount > 0 && <span className="sidebar-count">{membersCount}</span>}
        </NavLink>
        <NavLink to={`${base}/attendance`} className={linkClass}>
          <FiCalendar /> Attendance
        </NavLink>
        <NavLink to={`${base}/fees`} className={linkClass}>
          <FiCreditCard /> Fee Management
          {pendingFeesCount > 0 && <span className="sidebar-count warn">{pendingFeesCount}</span>}
        </NavLink>

        <p className="sidebar-section">Programs</p>
        <NavLink to={`${base}/workout-plans`} className={linkClass}>
          <FiActivity /> Workout Plans
        </NavLink>
        <NavLink to={`${base}/diet-plans`} className={linkClass}>
          <FiClipboard /> Diet Plans
        </NavLink>
        <NavLink to={`${base}/exercise-videos`} className={linkClass}>
          <FiVideo /> Exercise Videos
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to={`${base}/settings`} className={linkClass}>
          <FiSettings /> Settings
        </NavLink>
        <button className="sidebar-link signout" onClick={logout}>
          <FiLogOut /> Sign Out
        </button>
      </div>
    </aside>
  );
}
