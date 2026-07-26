import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { apiErrorMessage } from '../../api/axiosClient';
import './Auth.css';

const STEPS = ['Personal Info', 'Gym Details', 'Verify Email'];

export default function OwnerRegisterPage() {
  const { registerOwner } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [form, setForm] = useState({
    ownerName: '', gymName: '', mobileNumber: '', email: '', password: '', confirmPassword: '',
    gymAddress: '', state: '', city: '', openingTime: '06:00', closingTime: '22:00', gymDescription: '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateStep1() {
    if (!form.ownerName || !form.gymName || !form.mobileNumber || !form.email || !form.password) {
      return 'Please fill in all required fields.';
    }
    if (!/^\d{10}$/.test(form.mobileNumber)) return 'Mobile number must be 10 digits.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  }

  function validateStep2() {
    if (!form.gymAddress || !form.state || !form.city || !form.openingTime || !form.closingTime) {
      return 'Please fill in all required fields.';
    }
    return '';
  }

  function goNext() {
    setError('');
    if (step === 0) {
      const err = validateStep1();
      if (err) return setError(err);
      setStep(1);
    } else if (step === 1) {
      const err = validateStep2();
      if (err) return setError(err);
      submitRegistration();
    }
  }

  async function submitRegistration() {
    setSubmitting(true);
    setError('');
    try {
      await registerOwner({
        ownerName: form.ownerName,
        gymName: form.gymName,
        mobileNumber: form.mobileNumber,
        email: form.email,
        password: form.password,
        gymAddress: form.gymAddress,
        state: form.state,
        city: form.city,
        gymDescription: form.gymDescription,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
      });
      toast.success('Registration successful! Enter the OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) return setError('Enter the full 6-digit code.');
    setSubmitting(true);
    try {
      await authApi.verifyOtp({ identifier: form.email, otp: code, purpose: 'EMAIL_VERIFICATION' });
      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid or expired OTP.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    try {
      await authApi.sendOtp({ identifier: form.email, purpose: 'EMAIL_VERIFICATION' });
      toast.info('A new OTP has been sent to your email.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  function handleOtpChange(idx, value) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 620 }}>
        <div className="auth-brand"><span className="logo-badge">💪</span> GymPro</div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">Sign In</Link>
          <button className="auth-tab active" type="button">Register Gym</button>
        </div>

        <h2 className="auth-heading">Register Your Gym</h2>
        <p className="auth-subheading">Join gym owners running their business on GymPro</p>

        <div className="auth-steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`auth-step ${i < step ? 'done' : i === step ? 'current' : ''}`}>
                <span className="auth-step-num">{i < step ? <FiCheck /> : i + 1}</span>
                {label}
              </div>
              {i < STEPS.length - 1 && <div className="auth-step-line" />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {step === 0 && (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Owner Full Name <span className="required">*</span></label>
                <input className="form-input" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="Vikram Kumar" />
              </div>
              <div className="form-group">
                <label className="form-label">Gym Name <span className="required">*</span></label>
                <input className="form-input" value={form.gymName} onChange={(e) => update('gymName', e.target.value)} placeholder="FitZone Gym" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="required">*</span></label>
                <div className="input-with-prefix">
                  <span className="input-prefix">+91</span>
                  <input className="form-input" maxLength={10} value={form.mobileNumber}
                    onChange={(e) => update('mobileNumber', e.target.value.replace(/\D/g, ''))} placeholder="9876543210" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="vikram@fitzonegym.in" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div className="form-hint">Min 6 characters</div>
              <input className="form-input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Create a strong password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <input className="form-input" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Re-enter your password" />
            </div>

            <div className="step-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={goNext}>Continue <FiChevronRight /></button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Gym Address <span className="required">*</span></label>
              <input className="form-input" value={form.gymAddress} onChange={(e) => update('gymAddress', e.target.value)} placeholder="123 MG Road, near City Mall" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State <span className="required">*</span></label>
                <input className="form-input" value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="Karnataka" />
              </div>
              <div className="form-group">
                <label className="form-label">City <span className="required">*</span></label>
                <input className="form-input" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Bengaluru" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Opening Time <span className="required">*</span></label>
                <input className="form-input" type="time" value={form.openingTime} onChange={(e) => update('openingTime', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Closing Time <span className="required">*</span></label>
                <input className="form-input" type="time" value={form.closingTime} onChange={(e) => update('closingTime', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Gym Description</label>
              <textarea className="form-textarea" rows={3} value={form.gymDescription}
                onChange={(e) => update('gymDescription', e.target.value)} placeholder="Tell members what makes your gym great..." />
            </div>

            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => setStep(0)}><FiChevronLeft /> Back</button>
              <button className="btn btn-primary" onClick={goNext} disabled={submitting}>
                {submitting ? 'Submitting…' : <>Continue <FiChevronRight /></>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13.5 }}>
              We sent a 6-digit code to <strong>{form.email}</strong>
            </p>
            <div className="otp-boxes">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  maxLength={1}
                  inputMode="numeric"
                />
              ))}
            </div>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <p className="auth-footer-text">
              Didn't get the code? <button type="button" className="link" onClick={resendOtp}>Resend OTP</button>
            </p>
          </form>
        )}

        <p className="auth-footer-text">Already registered? <Link to="/login">Sign in</Link></p>
        <p className="auth-copyright">© 2026 GymPro Technologies · Made in India 🇮🇳</p>
      </div>
    </div>
  );
}
