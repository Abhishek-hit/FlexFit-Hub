import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { apiErrorMessage } from '../../api/axiosClient';
import './Auth.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (!token) return setError('This link is invalid or has expired.');

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      navigate('/login');
    } catch (err) {
      setError(apiErrorMessage(err, 'This link is invalid or has expired.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="logo-badge">💪</span> GymPro</div>
        <h2 className="auth-heading">Set a new password</h2>
        <p className="auth-subheading">Choose a strong password for your account.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password <span className="required">*</span></label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password <span className="required">*</span></label>
            <input className="form-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save password'}
          </button>
        </form>

        <p className="auth-footer-text"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
