import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiSave, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { gymApi } from '../../api/gymApi';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';

export default function OwnerSettingsPage() {
  const { gymId } = useParams();
  const toast = useToast();

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await gymApi.getOwnerGym(gymId);
      setGym(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [gymId, toast]);

  useEffect(() => { load(); }, [load]);

  function update(field, value) { setGym((g) => ({ ...g, [field]: value })); }

  async function handleSave() {
    setSaving(true);
    try {
      await gymApi.updateGym(gymId, {
        name: gym.name, description: gym.description, address: gym.address,
        state: gym.state, city: gym.city, contactNumber: gym.contactNumber,
        openingTime: gym.openingTime, closingTime: gym.closingTime,
        facilities: gym.facilities, weightGainSpecialized: gym.weightGainSpecialized,
        weightLossSpecialized: gym.weightLossSpecialized, upiId: gym.upiId,
      });
      toast.success('Gym profile updated.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await gymApi.uploadImage(gymId, formData);
      setGym(data.data);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Upload failed — check Cloudinary credentials.'));
    } finally {
      setUploading(false);
    }
  }

  async function removePlan(planId) {
    if (!window.confirm('Remove this plan?')) return;
    try {
      const { data } = await gymApi.removePlan(gymId, planId);
      setGym(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (loading || !gym) return <Loader />;

  return (
    <div>
      <div className="page-title-row">
        <div><h1>Settings</h1><p className="subtitle">Manage your gym profile & membership plans</p></div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <h3 style={{ marginBottom: 18 }}>Gym Profile</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gym Name</label>
            <input className="form-input" value={gym.name || ''} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input className="form-input" value={gym.contactNumber || ''} onChange={(e) => update('contactNumber', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" rows={3} value={gym.description || ''} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-input" value={gym.address || ''} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-input" value={gym.state || ''} onChange={(e) => update('state', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" value={gym.city || ''} onChange={(e) => update('city', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Opening Time</label>
            <input className="form-input" type="time" value={gym.openingTime || ''} onChange={(e) => update('openingTime', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Closing Time</label>
            <input className="form-input" type="time" value={gym.closingTime || ''} onChange={(e) => update('closingTime', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">UPI ID (for Pay via UPI)</label>
          <input className="form-input" value={gym.upiId || ''} onChange={(e) => update('upiId', e.target.value)} placeholder="yourgym@okaxis" />
        </div>
        <div className="form-group" style={{ display: 'flex', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 13.5 }}>
            <input type="checkbox" checked={!!gym.weightGainSpecialized} onChange={(e) => update('weightGainSpecialized', e.target.checked)} />
            Weight Gain Specialized
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 13.5 }}>
            <input type="checkbox" checked={!!gym.weightLossSpecialized} onChange={(e) => update('weightLossSpecialized', e.target.checked)} />
            Weight Loss Specialized
          </label>
        </div>

        <div style={{ marginTop: 8 }}>
          <label className="form-label">Gym Images</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {(gym.images || []).map((url) => (
              <img key={url} src={url} alt="gym" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
          <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
            <FiUpload /> {uploading ? 'Uploading…' : 'Upload Image'}
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Membership Plans</h3>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddPlan(true)}><FiPlus /> Add Plan</button>
        </div>
        {(gym.membershipPlans || []).length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>No plans yet — add one so members can join.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gym.membershipPlans.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>₹{p.price} · {p.durationInDays} days</div>
                </div>
                <button className="btn-icon" onClick={() => removePlan(p.id)}><FiTrash2 /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddPlan && (
        <AddPlanModal gymId={gymId} onClose={() => setShowAddPlan(false)} onAdded={(updatedGym) => { setGym(updatedGym); setShowAddPlan(false); }} />
      )}
    </div>
  );
}

function AddPlanModal({ gymId, onClose, onAdded }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', durationInDays: 30, price: '', features: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Fill in all required fields.');
    setSubmitting(true);
    try {
      const { data } = await gymApi.addPlan(gymId, {
        name: form.name,
        durationInDays: parseInt(form.durationInDays, 10),
        price: parseFloat(form.price),
        features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      });
      toast.success('Plan added.');
      onAdded(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add Membership Plan" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Plan Name</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Premium Monthly" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Duration (days)</label>
            <input className="form-input" type="number" value={form.durationInDays} onChange={(e) => setForm({ ...form, durationInDays: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Features (comma separated)</label>
          <input className="form-input" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Access to all equipment, Locker, Personal trainer" />
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Adding…' : 'Add Plan'}</button>
      </form>
    </Modal>
  );
}
