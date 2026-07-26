import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { apiErrorMessage } from '../api/axiosClient';

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  function persistSession(authResponse) {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    const sessionUser = {
      userId: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
      gymId: authResponse.gymId,
    };
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      return persistSession(data.data);
    } catch (err) {
      throw new Error(apiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  }

  async function registerMember(payload) {
    setLoading(true);
    try {
      const { data } = await authApi.registerMember(payload);
      return persistSession(data.data);
    } catch (err) {
      throw new Error(apiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  async function registerOwner(payload) {
    setLoading(true);
    try {
      const { data } = await authApi.registerOwner(payload);
      return data.message;
    } catch (err) {
      throw new Error(apiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOwner: user?.role === 'OWNER',
    isMember: user?.role === 'MEMBER',
    login,
    logout,
    registerMember,
    registerOwner,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
