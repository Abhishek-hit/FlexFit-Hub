import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiTrendingUp, FiCalendar, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import { dashboardApi } from '../../api/dashboardApi';
import { workoutApi } from '../../api/workoutApi';
import { dietApi } from '../../api/dietApi';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Member.css';

export default function MemberDashboardPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.member()
      .then((r) => setData(r.data.data))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load dashboard.')))
      .finally(() => setLoading(false));

    workoutApi.myPlan().then((r) => setWorkoutPlan(r.data.data)).catch(() => setWorkoutPlan(null));
    dietApi.myPlan().then((r) => setDietPlan(r.data.data)).catch(() => setDietPlan(null));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !data) return <Loader />;

  const { profile, progress, recentPayments } = data;
  const initials = (profile.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const todayIdx = new Date().getDay(); // 0=Sun
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayName = dayOrder[(todayIdx + 6) % 7];
  const todayWorkout = workoutPlan?.days?.find((d) => d.dayNumber === ((todayIdx + 6) % 7) + 1);
  const todayDiet = dietPlan?.days?.find((d) => d.dayNumber === ((todayIdx + 6) % 7) + 1);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>My Fitness Hub</h1>
          <p className="subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        {progress.currentStreak > 0 && <span className="live-pill">🔥 {progress.currentStreak}-day streak</span>}
      </div>

      <div className="hub-grid">
        <div className="profile-card">
          <div className="profile-card-top">
            <div className="profile-avatar">{initials}</div>
            <div>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {profile.name} <StatusBadge status={profile.membershipStatus} />
              </div>
              <div className="profile-meta">Member ID: {profile.id.slice(-8).toUpperCase()}</div>
            </div>
          </div>
          <div className="profile-meta">{profile.mobile} · {profile.email}</div>
          {profile.address && <div className="profile-meta"><FiMapPin size={11} /> {profile.address}</div>}
          <div className="profile-meta"><FiTarget size={11} /> Goal: {profile.goal?.replace('_', ' ')}</div>
          <div className="profile-stats-row">
            <div className="profile-stat"><div className="num">{profile.age || '—'}</div><div className="lbl">Age</div></div>
            <div className="profile-stat"><div className="num">{profile.heightCm || '—'}</div><div className="lbl">Height (cm)</div></div>
            <div className="profile-stat"><div className="num">{profile.weightKg || '—'}</div><div className="lbl">Weight (kg)</div></div>
            <div className="profile-stat"><div className="num">{profile.bmi || '—'}</div><div className="lbl">BMI</div></div>
          </div>
        </div>

        <div className="streak-card">
          <FiTrendingUp size={20} />
          <div className="streak-num">{progress.currentStreak}</div>
          <div className="streak-sub">days in a row 🔥</div>
          <div className="streak-foot">
            <span>Best: {progress.longestStreak} days</span>
            <span>Total: {progress.totalWorkoutDays} days</span>
          </div>
        </div>

        <div className="hub-mini-card">
          <div className="mini-label"><FiCalendar /> Membership</div>
          <div className="mini-value">{profile.membershipPlanName || 'Free Trial'}</div>
          <div className="mini-sub">
            {profile.membershipStatus === 'TRIAL' ? `Trial ends ${profile.trialEndDate}` : `Expires ${profile.membershipExpiry || '—'}`}
          </div>
        </div>

        <div className="hub-mini-card">
          <div className="mini-label"><FiCalendar /> This Month</div>
          <div className="mini-value">{progress.completedThisMonth} days</div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (progress.completedThisMonth / 30) * 100)}%` }} />
          </div>
        </div>

        <div className="hub-mini-card">
          <div className="mini-label"><FiAlertCircle /> Fee Status</div>
          <div className="mini-value">
            {recentPayments?.[0] ? <StatusBadge status={recentPayments[0].status} /> : '—'}
          </div>
          <div className="mini-sub">
            {recentPayments?.[0] ? `₹${recentPayments[0].amount} · Due ${recentPayments[0].dueDate}` : 'No dues on file'}
          </div>
        </div>
      </div>

      <div className="dash-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15.5 }}>🏋️ 7-Day Workout Plan</h3>
              {workoutPlan && <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{workoutPlan.title}</p>}
            </div>
            <Link to="/member/workout" style={{ fontSize: 12.5, color: 'var(--color-primary)', fontWeight: 600 }}>View full plan →</Link>
          </div>
          {todayWorkout ? (
            <>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginBottom: 10 }}>Today ({todayName}) · {todayWorkout.title}</p>
              {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f3f8', fontSize: 13.5 }}>
                  <span>{ex.name}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{ex.sets} × {ex.reps}</span>
                </div>
              ))}
            </>
          ) : <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No workout plan published for your goal yet.</p>}
        </div>

        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15.5 }}>🥗 7-Day Diet Plan</h3>
              {dietPlan && <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{dietPlan.title}</p>}
            </div>
            <Link to="/member/diet" style={{ fontSize: 12.5, color: 'var(--color-primary)', fontWeight: 600 }}>Full plan →</Link>
          </div>
          {todayDiet ? (
            <div className="macro-grid" style={{ marginBottom: 0 }}>
              <div className="macro-item"><div className="num" style={{ color: '#dc2626' }}>{todayDiet.breakfast.proteinGrams + todayDiet.lunch.proteinGrams + todayDiet.dinner.proteinGrams + todayDiet.snacks.proteinGrams}g</div><div className="lbl">Protein</div></div>
              <div className="macro-item"><div className="num" style={{ color: '#d97706' }}>{todayDiet.breakfast.carbsGrams + todayDiet.lunch.carbsGrams + todayDiet.dinner.carbsGrams + todayDiet.snacks.carbsGrams}g</div><div className="lbl">Carbs</div></div>
              <div className="macro-item"><div className="num" style={{ color: '#16a34a' }}>{todayDiet.breakfast.fatsGrams + todayDiet.lunch.fatsGrams + todayDiet.dinner.fatsGrams + todayDiet.snacks.fatsGrams}g</div><div className="lbl">Fat</div></div>
              <div className="macro-item"><div className="num" style={{ color: 'var(--color-primary)' }}>{todayDiet.waterIntakeLiters}L</div><div className="lbl">Water</div></div>
            </div>
          ) : <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No diet plan published for your goal yet.</p>}
        </div>
      </div>
    </div>
  );
}
