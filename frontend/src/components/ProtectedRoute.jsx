import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    const home = user?.role === 'OWNER' ? '/owner/dashboard' : '/member/dashboard';
    return <Navigate to={home} replace />;
  }
  return children;
}
