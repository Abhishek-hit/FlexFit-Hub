import React, { useEffect, useState } from 'react';
import { FiClock, FiRepeat, FiCheckCircle } from 'react-icons/fi';
import { workoutApi } from '../../api/workoutApi';
import { memberApi } from '../../api/memberApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Member.css';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DIFF_TONE = { BEGINNER: 'success', INTERMEDIATE: 'warning', ADVANCED: 'danger' };

export default function MemberWorkoutPage() {
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [myGoal, setMyGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [marking, setMarking] = useState(false);

  const todayDayNumber = ((new Date().getDay() + 6) % 7) + 1;

  async function load() {
    setLoading(true);
    try {
      const planRes = await workoutApi.myPlan().catch(() => null);
      setPlan(planRes?.data?.data || null);
      if (planRes) setActiveDay(todayDayNumber - 1);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load workout plan.'));
    }

    memberApi.myProfile().then((r) => setMyGoal(r.data.data.goal)).catch(() => {});

    try {
      const progressRes = await workoutApi.myProgress();
      setProgress(progressRes.data.data);
    } catch (err) {
      // Non-fatal — the plan itself can still render without progress stats.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function markComplete() {
    setMarking(true);
    try {
      const { data } = await workoutApi.markComplete(activeDay + 1);
      setProgress(data.data);
      toast.success('Workout marked complete! Keep the streak going 🔥');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not mark complete.'));
    } finally {
      setMarking(false);
    }
  }

  if (loading) return <Loader />;
  if (!plan) {
    return (
      <EmptyState
        title="No workout plan yet"
        subtitle={
          myGoal
            ? `Your goal is set to "${myGoal.replace('_', ' ')}" — your gym owner hasn't published a workout plan for this goal yet. Ask them to publish one, or update your goal in your profile to match an existing plan.`
            : "Your gym owner hasn't published a plan for your goal yet."
        }
      />
    );
  }

  const day = plan.days[activeDay];
  const isToday = activeDay + 1 === todayDayNumber;
  const alreadyDoneToday = progress?.completedDatesThisMonth?.includes(new Date().toISOString().slice(0, 10));

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>7-Day Workout Plan</h1>
          <p className="subtitle">{plan.title}</p>
        </div>
        {progress && <span className="live-pill">🔥 {progress.currentStreak}-day streak</span>}
      </div>

      <div className="day-selector">
        {plan.days.map((d, i) => (
          <button key={d.dayNumber} className={`day-pill${activeDay === i ? ' active' : ''}${d.exercises.length === 0 ? ' rest' : ''}`} onClick={() => setActiveDay(i)}>
            {DAY_NAMES[i]} {i + 1 === todayDayNumber && <span className="dot" />}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>{day.title || DAY_NAMES[activeDay]}</h3>
          {isToday && (
            <button className="btn btn-primary btn-sm" disabled={marking || alreadyDoneToday} onClick={markComplete}>
              <FiCheckCircle /> {alreadyDoneToday ? 'Completed Today' : marking ? 'Saving…' : 'Mark Today Complete'}
            </button>
          )}
        </div>

        {day.exercises.length === 0 ? (
          <EmptyState title="Rest day" subtitle="Recover and come back stronger tomorrow." />
        ) : (
          day.exercises.map((ex, i) => (
            <div className="exercise-card" key={i}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="exercise-card-num">{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</div>
                  {ex.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ex.description}</div>}
                </div>
              </div>
              <div className="exercise-card-meta">
                <span><FiRepeat size={12} /> {ex.sets} sets × {ex.reps}</span>
                <span><FiClock size={12} /> {ex.restTimeSeconds}s</span>
                <span className={`badge badge-${DIFF_TONE[ex.difficulty] || 'muted'}`}>{ex.difficulty}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
