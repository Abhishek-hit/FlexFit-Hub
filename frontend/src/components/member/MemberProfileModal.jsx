import React, { useState } from 'react';
import Modal from '../common/Modal';
import { memberApi } from '../../api/memberApi';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';

const GOALS = [
  { value: 'WEIGHT_GAIN', label: 'Weight Gain' },
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
  { value: 'MUSCLE_BUILDING', label: 'Muscle Building' },
];

export default function MemberProfileModal({ profile, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    address: profile.address || '',
    age: profile.age || '',
    gender: profile.gender || 'MALE',
    heightCm: profile.heightCm || '',
    weightKg: profile.weightKg || '',
    goal: profile.goal || 'GENERAL_FITNESS',
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await memberApi.updateMyProfile({
        ...form,
        age: form.age ? parseInt(form.age, 10) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      });
      toast.success('Profile updated.');
      onSaved(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Edit My Profile" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-input" value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input className="form-input" type="number" value={form.age} onChange={(e) => update('age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
              <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input className="form-input" type="number" step="0.1" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Fitness Goal</label>
          <select className="form-select" value={form.goal} onChange={(e) => update('goal', e.target.value)}>
            {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <div className="form-hint" style={{ marginTop: 6 }}>
            Changing your goal switches which workout/diet plan you see — only plans your gym owner has published for that goal will appear.
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </Modal>
  );
}
