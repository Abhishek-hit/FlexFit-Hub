import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiSave } from 'react-icons/fi';
import { dietApi } from '../../api/dietApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';
import './PlanBuilder.css';

const DAY_NAMES = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
const MEAL_KEYS = [
  { key: 'breakfast', label: '🍳 Breakfast' },
  { key: 'lunch', label: '🍛 Lunch' },
  { key: 'dinner', label: '🌙 Dinner' },
  { key: 'snacks', label: '🍎 Snacks' },
];
const emptyMeal = () => ({ description: '', calories: 0, proteinGrams: 0, carbsGrams: 0, fatsGrams: 0 });

function blankDays() {
  return DAY_NAMES.map((_, i) => ({
    dayNumber: i + 1,
    breakfast: emptyMeal(), lunch: emptyMeal(), dinner: emptyMeal(), snacks: emptyMeal(),
    waterIntakeLiters: 3,
  }));
}

export default function OwnerDietPlansPage() {
  const { gymId } = useParams();
  const toast = useToast();

  const [existingPlans, setExistingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState('WEIGHT_LOSS');
  const [title, setTitle] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [days, setDays] = useState(blankDays());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dietApi.list(gymId);
      setExistingPlans(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load diet plans.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, toast]);

  useEffect(() => { load(); }, [load]);

  function updateMeal(mealKey, field, value) {
    setDays((prev) => prev.map((d, i) => i === activeDay ? { ...d, [mealKey]: { ...d[mealKey], [field]: value } } : d));
  }
  function updateWater(value) {
    setDays((prev) => prev.map((d, i) => i === activeDay ? { ...d, waterIntakeLiters: value } : d));
  }

  function copyActiveDayToAll() {
    const source = days[activeDay];
    setDays((prev) => prev.map((d) => ({
      ...d,
      breakfast: { ...source.breakfast },
      lunch: { ...source.lunch },
      dinner: { ...source.dinner },
      snacks: { ...source.snacks },
      waterIntakeLiters: source.waterIntakeLiters,
    })));
    toast.info(`${DAY_NAMES[activeDay]}'s meals copied to all 7 days — tweak any day as needed.`);
  }

  async function handlePublish() {
    if (!title) return toast.error('Give the plan a title.');

    const incompleteDay = days.find((d) =>
      !d.breakfast.description?.trim() || !d.lunch.description?.trim() ||
      !d.dinner.description?.trim() || !d.snacks.description?.trim()
    );
    if (incompleteDay) {
      setActiveDay(incompleteDay.dayNumber - 1);
      return toast.error(`Day ${incompleteDay.dayNumber} is missing a meal description — all 7 days need breakfast, lunch, dinner & snacks filled in. Tip: fill one day, then use "Copy to all days".`);
    }

    setSubmitting(true);
    try {
      await dietApi.createOrReplace(gymId, { goal, title, days });
      toast.success('Diet plan published! Members with this goal have been notified.');
      setTitle('');
      setDays(blankDays());
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const day = days[activeDay];

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Diet Plans</h1>
          <p className="subtitle">Publish a 7-day meal plan for each fitness goal</p>
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
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weight Loss Diet — ~1800 kcal/day" />
          </div>
        </div>

        <div className="day-tabs">
          {days.map((d, i) => (
            <button key={i} type="button" className={`day-tab${activeDay === i ? ' active' : ''}`} onClick={() => setActiveDay(i)}>
              {DAY_NAMES[i]}
            </button>
          ))}
          <button type="button" className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={copyActiveDayToAll}>
            Copy {DAY_NAMES[activeDay]}'s meals to all 7 days
          </button>
        </div>

        {MEAL_KEYS.map(({ key, label }) => (
          <div className="meal-card" key={key}>
            <h4>{label}</h4>
            <input className="form-input" style={{ marginBottom: 8 }} placeholder="What's on the menu..."
              value={day[key].description} onChange={(e) => updateMeal(key, 'description', e.target.value)} />
            <div className="meal-grid">
              <div><label className="form-hint">Calories</label><input className="form-input" type="number" value={day[key].calories} onChange={(e) => updateMeal(key, 'calories', parseFloat(e.target.value || '0'))} /></div>
              <div><label className="form-hint">Protein (g)</label><input className="form-input" type="number" value={day[key].proteinGrams} onChange={(e) => updateMeal(key, 'proteinGrams', parseFloat(e.target.value || '0'))} /></div>
              <div><label className="form-hint">Carbs (g)</label><input className="form-input" type="number" value={day[key].carbsGrams} onChange={(e) => updateMeal(key, 'carbsGrams', parseFloat(e.target.value || '0'))} /></div>
              <div><label className="form-hint">Fats (g)</label><input className="form-input" type="number" value={day[key].fatsGrams} onChange={(e) => updateMeal(key, 'fatsGrams', parseFloat(e.target.value || '0'))} /></div>
            </div>
          </div>
        ))}

        <div className="form-group" style={{ maxWidth: 200 }}>
          <label className="form-label">Water Intake (L)</label>
          <input className="form-input" type="number" step="0.5" value={day.waterIntakeLiters} onChange={(e) => updateWater(parseFloat(e.target.value || '0'))} />
        </div>

        <div style={{ marginTop: 10, textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={handlePublish} disabled={submitting}>
            <FiSave /> {submitting ? 'Publishing…' : 'Publish Plan'}
          </button>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Published Plans</h3>
      {loading ? <Loader /> : existingPlans.length === 0 ? (
        <EmptyState title="No diet plans yet" />
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
