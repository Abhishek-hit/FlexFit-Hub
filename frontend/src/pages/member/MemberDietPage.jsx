import React, { useEffect, useState } from 'react';
import { dietApi } from '../../api/dietApi';
import { memberApi } from '../../api/memberApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Member.css';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = [
  { key: 'breakfast', label: '🍳 Breakfast' },
  { key: 'lunch', label: '🍛 Lunch' },
  { key: 'snacks', label: '🍎 Snacks' },
  { key: 'dinner', label: '🌙 Dinner' },
];

export default function MemberDietPage() {
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myGoal, setMyGoal] = useState(null);
  const [activeDay, setActiveDay] = useState(((new Date().getDay() + 6) % 7));

  useEffect(() => {
    dietApi.myPlan()
      .then((r) => setPlan(r.data.data))
      .catch((err) => { if (err.response?.status !== 404) toast.error(apiErrorMessage(err)); })
      .finally(() => setLoading(false));
    memberApi.myProfile().then((r) => setMyGoal(r.data.data.goal)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loader />;
  if (!plan) {
    return (
      <EmptyState
        title="No diet plan yet"
        subtitle={
          myGoal
            ? `Your goal is set to "${myGoal.replace('_', ' ')}" — your gym owner hasn't published a diet plan for this goal yet. Ask them to publish one, or update your goal in your profile to match an existing plan.`
            : "Your gym owner hasn't published a plan for your goal yet."
        }
      />
    );
  }

  const day = plan.days[activeDay];
  const totalCalories = day.breakfast.calories + day.lunch.calories + day.dinner.calories + day.snacks.calories;
  const totalProtein = day.breakfast.proteinGrams + day.lunch.proteinGrams + day.dinner.proteinGrams + day.snacks.proteinGrams;
  const totalCarbs = day.breakfast.carbsGrams + day.lunch.carbsGrams + day.dinner.carbsGrams + day.snacks.carbsGrams;
  const totalFats = day.breakfast.fatsGrams + day.lunch.fatsGrams + day.dinner.fatsGrams + day.snacks.fatsGrams;

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>7-Day Diet Plan</h1>
          <p className="subtitle">{plan.title}</p>
        </div>
      </div>

      <div className="day-selector">
        {plan.days.map((d, i) => (
          <button key={d.dayNumber} className={`day-pill${activeDay === i ? ' active' : ''}`} onClick={() => setActiveDay(i)}>
            {DAY_NAMES[i]}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3>Daily Calories</h3>
          <strong>{Math.round(totalCalories)} kcal</strong>
        </div>
        <div className="macro-grid">
          <div className="macro-item"><div className="num" style={{ color: '#dc2626' }}>{Math.round(totalProtein)}g</div><div className="lbl">Protein</div></div>
          <div className="macro-item"><div className="num" style={{ color: '#d97706' }}>{Math.round(totalCarbs)}g</div><div className="lbl">Carbs</div></div>
          <div className="macro-item"><div className="num" style={{ color: '#16a34a' }}>{Math.round(totalFats)}g</div><div className="lbl">Fat</div></div>
          <div className="macro-item"><div className="num" style={{ color: 'var(--color-primary)' }}>{day.waterIntakeLiters}L</div><div className="lbl">Water</div></div>
        </div>

        {MEALS.map(({ key, label }) => (
          <div className={`meal-block ${key}`} key={key}>
            <div className="meal-block-head">
              <span>{label}</span>
              <span>{Math.round(day[key].calories)} kcal</span>
            </div>
            <div className="meal-block-desc">{day[key].description || 'Not specified'}</div>
            <div className="meal-block-desc" style={{ marginTop: 6 }}>
              P: {day[key].proteinGrams}g · C: {day[key].carbsGrams}g · F: {day[key].fatsGrams}g
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
