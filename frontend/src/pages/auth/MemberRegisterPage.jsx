import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { gymApi } from '../../api/gymApi';
import { apiErrorMessage } from '../../api/axiosClient';
import './Auth.css';

export default function MemberRegisterPage() {
  const { registerMember } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', address: '',
    weightKg: '', heightCm: '', age: '', gender: 'MALE', goal: 'GENERAL_FITNESS',
  });

  useEffect(() => {
    searchGyms('');
  }, []);

  async function searchGyms(q) {
    setSearching(true);
    try {
      const { data } = await gymApi.search({ query: q });
      setGyms(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load gyms.'));
    } finally {
      setSearching(false);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function chooseGym(gym) {
    setSelectedGym(gym);
    setStep(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.mobile || !form.email || !form.password || !form.weightKg || !form.heightCm || !form.age) {
      return setError('Please fill in all required fields.');
    }
    setSubmitting(true);
    try {
      const sessionUser = await registerMember({
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
        address: form.address,
        weightKg: parseFloat(form.weightKg),
        heightCm: parseFloat(form.heightCm),
        age: parseInt(form.age, 10),
        gender: form.gender,
        goal: form.goal,
        gymId: selectedGym.id,
      });
      toast.success(`Welcome, ${sessionUser.name.split(' ')[0]}! Your 3-day free trial has started.`);
      navigate('/member/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 620 }}>
        <div className="auth-brand"><span className="logo-badge">💪</span> GymPro</div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">Sign In</Link>
          <button className="auth-tab active" type="button">Join as a Member</button>
        </div>

        {step === 0 && (
          <>
            <h2 className="auth-heading">Find your gym</h2>
            <p className="auth-subheading">Search by gym name or city to get started</p>

            <div className="input-with-prefix" style={{ marginBottom: 18 }}>
              <span className="input-prefix"><FiSearch /></span>
              <input
                className="form-input"
                placeholder="Search gyms by name or city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchGyms(query)}
              />
            </div>

            {searching ? (
              <div className="loader-wrap"><div className="spinner" /></div>
            ) : gyms.length === 0 ? (
              <div className="empty-state"><h4>No gyms found</h4><p>Try a different search term.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
                {gyms.map((gym) => (
                  <button
                    key={gym.id}
                    type="button"
                    onClick={() => chooseGym(gym)}
                    className="gym-pick-card"
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{gym.name}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiMapPin size={12} /> {gym.city}, {gym.state}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)', fontWeight: 600 }}>
                      <FiStar size={13} /> {gym.avgRating?.toFixed(1) || 'New'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <h2 className="auth-heading">Your details</h2>
            <p className="auth-subheading">Joining <strong>{selectedGym?.name}</strong> · {selectedGym?.city}</p>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Arjun Singh" />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="required">*</span></label>
                <input className="form-input" maxLength={10} value={form.mobile} onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))} placeholder="9876543210" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input className="form-input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 characters" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Your address" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age <span className="required">*</span></label>
                <input className="form-input" type="number" min={10} max={100} value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="26" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender <span className="required">*</span></label>
                <select className="form-select" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg) <span className="required">*</span></label>
                <input className="form-input" type="number" step="0.1" value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} placeholder="72" />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm) <span className="required">*</span></label>
                <input className="form-input" type="number" step="0.1" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} placeholder="178" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Fitness Goal <span className="required">*</span></label>
              <select className="form-select" value={form.goal} onChange={(e) => update('goal', e.target.value)}>
                <option value="WEIGHT_GAIN">Weight Gain</option>
                <option value="WEIGHT_LOSS">Weight Loss</option>
                <option value="GENERAL_FITNESS">General Fitness</option>
                <option value="MUSCLE_BUILDING">Muscle Building</option>
              </select>
            </div>

            <div className="step-actions">
              <button type="button" className="btn btn-outline" onClick={() => setStep(0)}><FiChevronLeft /> Change gym</button>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating account…' : <>Start Free Trial <FiChevronRight /></>}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
