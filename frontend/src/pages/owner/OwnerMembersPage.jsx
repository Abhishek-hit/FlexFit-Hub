import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiUserPlus, FiSearch, FiMoreVertical, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiMail, FiTarget, FiCalendar } from 'react-icons/fi';
import { memberApi } from '../../api/memberApi';
import { gymApi } from '../../api/gymApi';
import { paymentApi } from '../../api/paymentApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';

const GOALS = ['WEIGHT_GAIN', 'WEIGHT_LOSS', 'GENERAL_FITNESS', 'MUSCLE_BUILDING'];

export default function OwnerMembersPage() {
  const { gymId } = useParams();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [viewMemberId, setViewMemberId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, gymRes] = await Promise.all([
        memberApi.list(gymId, query || undefined),
        gymApi.getOwnerGym(gymId),
      ]);
      setMembers(membersRes.data.data);
      setPlans(gymRes.data.data.membershipPlans || []);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load members.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, query, toast]);

  useEffect(() => { load(); }, [gymId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleDelete(memberId) {
    if (!window.confirm('Remove this member? This cannot be undone.')) return;
    try {
      await memberApi.remove(gymId, memberId);
      toast.success('Member removed.');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const filtered = statusFilter === 'ALL' ? members : members.filter((m) => m.membershipStatus === statusFilter);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>All Members</h1>
          <p className="subtitle">{members.length} members found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><FiUserPlus /> Add Member</button>
      </div>

      <div className="card" style={{ marginBottom: 18, padding: '14px 18px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="input-with-prefix" style={{ flex: 1, minWidth: 220 }}>
          <span className="input-prefix"><FiSearch /></span>
          <input className="form-input" placeholder="Search members…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="card">
        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState title="No members found" subtitle="Add your first member to get started." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th><th>Plan</th><th>Status</th><th>Goal</th>
                  <th>Joined</th><th>Expires</th><th>BMI</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} onClick={() => setViewMemberId(m.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="mini-avatar">{(m.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{m.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td>{m.membershipPlanName || '—'}</td>
                    <td><StatusBadge status={m.membershipStatus} /></td>
                    <td>{m.goal ? m.goal.replace('_', ' ') : '—'}</td>
                    <td>{m.joiningDate || '—'}</td>
                    <td>{m.membershipExpiry || m.trialEndDate || '—'}</td>
                    <td>{m.bmi || '—'}</td>
                    <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon" onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}>
                        <FiMoreVertical />
                      </button>
                      {openMenuId === m.id && (
                        <div className="user-dropdown" style={{ right: 0, top: 36 }} onMouseLeave={() => setOpenMenuId(null)}>
                          <button onClick={() => { setViewMemberId(m.id); setOpenMenuId(null); }}><FiUserPlus style={{ marginRight: 6 }} /> View Profile</button>
                          <button onClick={() => { setEditMember(m); setOpenMenuId(null); }}><FiEdit2 style={{ marginRight: 6 }} /> Edit</button>
                          <button className="danger" onClick={() => handleDelete(m.id)}><FiTrash2 style={{ marginRight: 6 }} /> Remove</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddMemberModal gymId={gymId} plans={plans} onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); load(); }} />
      )}
      {editMember && (
        <EditMemberModal gymId={gymId} member={editMember} onClose={() => setEditMember(null)} onSaved={() => { setEditMember(null); load(); }} />
      )}
      {viewMemberId && (
        <MemberDetailModal gymId={gymId} memberId={viewMemberId} onClose={() => setViewMemberId(null)} />
      )}
    </div>
  );
}

function MemberDetailModal({ gymId, memberId, onClose }) {
  const toast = useToast();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberApi.get(gymId, memberId).then((r) => setMember(r.data.data)).catch((err) => toast.error(apiErrorMessage(err)));
    paymentApi.list(gymId).then((r) => setPayments(r.data.data.filter((p) => p.memberId === memberId))).catch(() => {});
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId, memberId]);

  return (
    <Modal title="Member Profile" onClose={onClose} width={560}>
      {loading || !member ? <Loader /> : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div className="mini-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
              {(member.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                {member.name} <StatusBadge status={member.membershipStatus} />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', display: 'flex', gap: 14, marginTop: 4 }}>
                <span><FiPhone size={11} /> {member.mobile}</span>
                <span><FiMail size={11} /> {member.email}</span>
              </div>
            </div>
          </div>

          {member.address && (
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              <FiMapPin size={12} /> {member.address}
            </div>
          )}

          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
            <div className="stat-card" style={{ padding: 12 }}><div className="stat-label">Age</div><div className="stat-value" style={{ fontSize: 18 }}>{member.age || '—'}</div></div>
            <div className="stat-card" style={{ padding: 12 }}><div className="stat-label">Height</div><div className="stat-value" style={{ fontSize: 18 }}>{member.heightCm || '—'}</div></div>
            <div className="stat-card" style={{ padding: 12 }}><div className="stat-label">Weight</div><div className="stat-value" style={{ fontSize: 18 }}>{member.weightKg || '—'}</div></div>
            <div className="stat-card" style={{ padding: 12 }}><div className="stat-label">BMI</div><div className="stat-value" style={{ fontSize: 18 }}>{member.bmi || '—'}</div></div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 13.5 }}>
            <div><FiTarget size={12} /> Goal: <strong>{member.goal?.replace('_', ' ') || '—'}</strong></div>
            <div><FiCalendar size={12} /> Joined: <strong>{member.joiningDate || '—'}</strong></div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Membership Plan</span>
              <strong>{member.membershipPlanName || 'No plan yet'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {member.membershipStatus === 'TRIAL' ? 'Trial ends' : 'Expires'}
              </span>
              <strong>{member.membershipExpiry || member.trialEndDate || '—'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontSize: 13.5 }}>
            <div>🔥 Streak: <strong>{member.currentStreak}</strong> (best {member.longestStreak})</div>
            <div>Total workout days: <strong>{member.totalWorkoutDays}</strong></div>
          </div>

          <h4 style={{ fontSize: 13.5, marginBottom: 10 }}>Payment History</h4>
          {payments.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No fee records yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{p.membershipPlanName || 'Fee'} · Due {p.dueDate}</span>
                  <span>₹{p.amount} <StatusBadge status={p.status} /></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function AddMemberModal({ gymId, plans, onClose, onAdded }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '', goal: 'GENERAL_FITNESS', membershipPlanId: plans[0]?.id || '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.mobile || !form.email || !form.membershipPlanId) {
      return setError('Please fill in all required fields.');
    }
    setSubmitting(true);
    try {
      await memberApi.add(gymId, form);
      toast.success('Member added — a welcome email/SMS with password setup link was sent.');
      onAdded();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add Member" onClose={onClose}>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name <span className="required">*</span></label>
          <input className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mobile <span className="required">*</span></label>
            <input className="form-input" maxLength={10} value={form.mobile} onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span className="required">*</span></label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-input" value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Goal</label>
            <select className="form-select" value={form.goal} onChange={(e) => update('goal', e.target.value)}>
              {GOALS.map((g) => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Membership Plan <span className="required">*</span></label>
            <select className="form-select" value={form.membershipPlanId} onChange={(e) => update('membershipPlanId', e.target.value)}>
              <option value="">Select a plan</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Adding…' : 'Add Member'}</button>
      </form>
    </Modal>
  );
}

function EditMemberModal({ gymId, member, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    address: member.address || '', age: member.age || '', gender: member.gender || 'MALE',
    heightCm: member.heightCm || '', weightKg: member.weightKg || '', goal: member.goal || 'GENERAL_FITNESS',
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await memberApi.update(gymId, member.id, {
        ...form,
        age: form.age ? parseInt(form.age, 10) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      });
      toast.success('Member updated.');
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Edit ${member.name}`} onClose={onClose}>
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
          <label className="form-label">Goal</label>
          <select className="form-select" value={form.goal} onChange={(e) => update('goal', e.target.value)}>
            {GOALS.map((g) => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </Modal>
  );
}
