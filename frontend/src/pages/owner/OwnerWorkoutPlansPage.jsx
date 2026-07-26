import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { workoutApi } from '../../api/workoutApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';
import './PlanBuilder.css';

const DAY_NAMES = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
const emptyExercise = () => ({ name: '', sets: 3, reps: 10, restTimeSeconds: 60, difficulty: 'MEDIUM_PLACEHOLDER' });

function blankDays() {
  return DAY_NAMES.map((title, i) => ({ dayNumber: i + 1, title, exercises: [] }));
}

export default function OwnerWorkoutPlansPage() {
  const { gymId } = useParams();
  const toast = useToast();

  const [existingPlans, setExistingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState('WEIGHT_GAIN');
  const [title, setTitle] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [days, setDays] = useState(blankDays());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await workoutApi.list(gymId);
      setExistingPlans(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load workout plans.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, toast]);

  useEffect(() => { load(); }, [load]);

  function addExercise() {
    setDays((prev) => prev.map((d, i) => i === activeDay ? { ...d, exercises: [...d.exercises, { name: '', sets: 3, reps: 10, restTimeSeconds: 60, difficulty: 'INTERMEDIATE' }] } : d));
  }
  function updateExercise(idx, field, value) {
    setDays((prev) => prev.map((d, i) => i === activeDay ? { ...d, exercises: d.exercises.map((ex, j) => j === idx ? { ...ex, [field]: value } : ex) } : d));
  }
  function removeExercise(idx) {
    setDays((prev) => prev.map((d, i) => i === activeDay ? { ...d, exercises: d.exercises.filter((_, j) => j !== idx) } : d));
  }
  function updateDayTitle(value) {
    setDays((prev) => prev.map((d, i) => i === activeDay ? { ...d, title: value } : d));
  }
  function copyActiveDayToAll() {
    const source = days[activeDay];
    setDays((prev) => prev.map((d) => ({ ...d, title: source.title, exercises: source.exercises.map((ex) => ({ ...ex })) })));
    toast.info(`${DAY_NAMES[activeDay]}'s exercises copied to all 7 days — tweak any day as needed.`);
  }

  async function handlePublish() {
    if (!title) return toast.error('Give the plan a title.');
    const emptyDay = days.find((d) => d.exercises.length === 0);
    if (emptyDay) {
      setActiveDay(emptyDay.dayNumber - 1);
      return toast.error(`${emptyDay.title || DAY_NAMES[emptyDay.dayNumber - 1]} has no exercises yet — all 7 days need at least one. Tip: fill one day, then use "Copy to all days" (mark rest days by leaving 0 sets/reps if needed).`);
    }
    setSubmitting(true);
    try {
      await workoutApi.createOrReplace(gymId, { goal, title, days });
      toast.success('Workout plan published! Members with this goal have been notified.');
      setTitle('');
      setDays(blankDays());
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Workout Plans</h1>
          <p className="subtitle">Publish a 7-day plan for each fitness goal</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Goal</label>
            <select className="form-select" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="WEIGHT_GAIN">Weight Gain</option>
              <option value="WEIGHT_LOSS">Weight Loss</option>
              <option value="GENERAL_FITNESS">General Fitness</option>
              <option value="MUSCLE_BUILDING">Muscle Building</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Plan Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weight Gain Program — Week 1" />
          </div>
        </div>

        <div className="day-tabs">
          {days.map((d, i) => (
            <button key={d.dayNumber} type="button" className={`day-tab${activeDay === i ? ' active' : ''}${d.exercises.length ? ' filled' : ''}`} onClick={() => setActiveDay(i)}>
              {DAY_NAMES[i]}
            </button>
          ))}
          <button type="button" className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={copyActiveDayToAll}>
            Copy {DAY_NAMES[activeDay]} to all 7 days
          </button>
        </div>

        <input className="form-input" style={{ marginBottom: 14, fontWeight: 600 }} value={days[activeDay].title}
          onChange={(e) => updateDayTitle(e.target.value)} placeholder="Day focus, e.g. Push Day" />

        {days[activeDay].exercises.map((ex, idx) => (
          <div className="exercise-row" key={idx}>
            <input className="form-input" placeholder="Exercise name" value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} />
            <input className="form-input" type="number" placeholder="Sets" value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value || '0', 10))} />
            <input className="form-input" type="number" placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value || '0', 10))} />
            <input className="form-input" type="number" placeholder="Rest (s)" value={ex.restTimeSeconds} onChange={(e) => updateExercise(idx, 'restTimeSeconds', parseInt(e.target.value || '0', 10))} />
            <select className="form-select" value={ex.difficulty} onChange={(e) => updateExercise(idx, 'difficulty', e.target.value)}>
              <option value="BEGINNER">Easy</option><option value="INTERMEDIATE">Medium</option><option value="ADVANCED">Hard</option>
            </select>
            <button type="button" className="btn-icon" onClick={() => removeExercise(idx)}><FiTrash2 /></button>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addExercise}><FiPlus /> Add Exercise</button>

        <div style={{ marginTop: 22, textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={handlePublish} disabled={submitting}>
            <FiSave /> {submitting ? 'Publishing…' : 'Publish Plan'}
          </button>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Published Plans</h3>
      {loading ? <Loader /> : existingPlans.length === 0 ? (
        <EmptyState title="No workout plans yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {existingPlans.map((p) => (
            <div className="card card-pad" key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{p.title}</strong>
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{p.goal.replace('_', ' ')} · {p.days.length} days</div>
                </div>
                {p.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-muted">Archived</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
