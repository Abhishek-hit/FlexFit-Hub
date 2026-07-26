import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';
import GymDetailPage from './pages/public/GymDetailPage';
import LoginPage from './pages/auth/LoginPage';
import OwnerRegisterPage from './pages/auth/OwnerRegisterPage';
import MemberRegisterPage from './pages/auth/MemberRegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import OwnerLayout from './components/owner/OwnerLayout';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerAnalyticsPage from './pages/owner/OwnerAnalyticsPage';
import OwnerMembersPage from './pages/owner/OwnerMembersPage';
import OwnerAttendancePage from './pages/owner/OwnerAttendancePage';
import OwnerFeesPage from './pages/owner/OwnerFeesPage';
import OwnerWorkoutPlansPage from './pages/owner/OwnerWorkoutPlansPage';
import OwnerDietPlansPage from './pages/owner/OwnerDietPlansPage';
import OwnerExerciseVideosPage from './pages/owner/OwnerExerciseVideosPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';

import MemberLayout from './components/member/MemberLayout';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MemberWorkoutPage from './pages/member/MemberWorkoutPage';
import MemberDietPage from './pages/member/MemberDietPage';
import MemberAttendancePage from './pages/member/MemberAttendancePage';
import MemberPaymentsPage from './pages/member/MemberPaymentsPage';

import NotificationsPage from './components/common/NotificationsPage';

/** Sends a logged-in owner to their gym-scoped dashboard URL. */
function OwnerHomeRedirect() {
  const { user } = useAuth();
  if (!user?.gymId) return <div className="container" style={{ padding: 40 }}>Setting up your gym… please refresh in a moment.</div>;
  return <Navigate to={`/owner/gyms/${user.gymId}/dashboard`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/gyms/:gymId" element={<GymDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/gym" element={<OwnerRegisterPage />} />
      <Route path="/register/member" element={<MemberRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Owner */}
      <Route path="/owner/dashboard" element={<ProtectedRoute role="OWNER"><OwnerHomeRedirect /></ProtectedRoute>} />
      <Route
        path="/owner/gyms/:gymId"
        element={<ProtectedRoute role="OWNER"><OwnerLayout /></ProtectedRoute>}
      >
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        <Route path="analytics" element={<OwnerAnalyticsPage />} />
        <Route path="members" element={<OwnerMembersPage />} />
        <Route path="attendance" element={<OwnerAttendancePage />} />
        <Route path="fees" element={<OwnerFeesPage />} />
        <Route path="workout-plans" element={<OwnerWorkoutPlansPage />} />
        <Route path="diet-plans" element={<OwnerDietPlansPage />} />
        <Route path="exercise-videos" element={<OwnerExerciseVideosPage />} />
        <Route path="settings" element={<OwnerSettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Member */}
      <Route path="/member" element={<ProtectedRoute role="MEMBER"><MemberLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<MemberDashboardPage />} />
        <Route path="workout" element={<MemberWorkoutPage />} />
        <Route path="diet" element={<MemberDietPage />} />
        <Route path="attendance" element={<MemberAttendancePage />} />
        <Route path="payments" element={<MemberPaymentsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
