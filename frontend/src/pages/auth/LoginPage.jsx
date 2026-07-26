import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const sessionUser = await login(form.email, form.password);
      toast.success(`Welcome back, ${sessionUser.name.split(' ')[0]}!`);
      if (sessionUser.role === 'OWNER') {
        navigate(`/owner/gyms/${sessionUser.gymId}/dashboard`);
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="logo-badge">💪</span> GymPro
        </div>
        <h2 className="auth-heading">Sign in to your account</h2>
        <p className="auth-subheading">Owner or member — one login, your own dashboard.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <div className="input-with-prefix">
              <span className="input-prefix"><FiMail /></span>
              <input
                className="form-input"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div className="input-with-prefix" style={{ position: 'relative' }}>
              <span className="input-prefix"><FiLock /></span>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ position: 'absolute', right: 12, top: 11, background: 'none', border: 'none', color: 'var(--color-text-faint)' }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Link to="/forgot-password" style={{ fontSize: 12.5, color: 'var(--color-primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={submitting}>
            <FiLogIn /> {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          New gym owner? <Link to="/register/gym">Register your gym</Link>
        </p>
        <p className="auth-footer-text">
          Joining a gym as a member? <Link to="/register/member">Create a member account</Link>
        </p>
      </div>
    </div>
  );
}
