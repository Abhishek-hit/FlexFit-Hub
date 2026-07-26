import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiDollarSign, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { paymentApi } from '../../api/paymentApi';
import { memberApi } from '../../api/memberApi';
import { gymApi } from '../../api/gymApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Owner.css';

export default function OwnerFeesPage() {
  const { gymId } = useParams();
  const toast = useToast();

  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [markPaidFor, setMarkPaidFor] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [feesRes, summaryRes] = await Promise.all([
        paymentApi.list(gymId, statusFilter || undefined),
        paymentApi.revenueSummary(gymId),
      ]);
      setFees(feesRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load fees.'));
    } finally {
      setLoading(false);
    }
  }, [gymId, statusFilter, toast]);

  useEffect(() => { load(); }, [load]);

  async function openCreate() {
    try {
      const [membersRes, gymRes] = await Promise.all([memberApi.list(gymId), gymApi.getOwnerGym(gymId)]);
      setMembers(membersRes.data.data);
      setPlans(gymRes.data.data.membershipPlans || []);
      setShowCreate(true);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function remind(paymentId) {
    try {
      await paymentApi.remind(gymId, paymentId);
      toast.success('Reminder sent via SMS, WhatsApp & email.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Fee Management</h1>
          <p className="subtitle">Track dues, payments & revenue</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Create Fee Record</button>
      </div>

      {summary && (
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-icon green"><FiDollarSign /></div><div className="stat-label">Monthly Revenue</div><div className="stat-value">₹{summary.monthlyRevenue.toLocaleString('en-IN')}</div></div>
          <div className="stat-card"><div className="stat-icon blue"><FiDollarSign /></div><div className="stat-label">Total Income</div><div className="stat-value">₹{summary.totalIncome.toLocaleString('en-IN')}</div></div>
          <div className="stat-card"><div className="stat-icon orange"><FiDollarSign /></div><div className="stat-label">Pending Fees</div><div className="stat-value">₹{summary.pendingFees.toLocaleString('en-IN')}</div></div>
          <div className="stat-card"><div className="stat-icon green"><FiDollarSign /></div><div className="stat-label">Paid Fees</div><div className="stat-value">₹{summary.paidFees.toLocaleString('en-IN')}</div></div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 18, padding: '14px 18px' }}>
        <select className="form-select" style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="card">
        {loading ? <Loader /> : fees.length === 0 ? (
          <EmptyState title="No fee records" subtitle="Create a fee record for a member to get started." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Remaining</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td>{f.memberName}</td>
                    <td>{f.membershipPlanName || '—'}</td>
                    <td>₹{f.amount}</td>
                    <td>₹{f.remainingAmount}</td>
                    <td>{f.dueDate}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {f.status !== 'PAID' && (
                        <>
                          <button className="btn btn-sm btn-primary" onClick={() => setMarkPaidFor(f)}>Mark Paid</button>
                          <button className="btn btn-sm btn-outline" onClick={() => remind(f.id)}><FiMessageSquare /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {markPaidFor && (
        <MarkPaidModal gymId={gymId} payment={markPaidFor} onClose={() => setMarkPaidFor(null)} onDone={() => { setMarkPaidFor(null); load(); }} />
      )}
      {showCreate && (
        <CreateFeeModal gymId={gymId} members={members} plans={plans} onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); load(); }} />
      )}
    </div>
  );
}

function MarkPaidModal({ gymId, payment, onClose, onDone }) {
  const toast = useToast();
  const [amount, setAmount] = useState(payment.remainingAmount);
  const [method, setMethod] = useState('CASH');
  const [ref, setRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentApi.markPaid(gymId, payment.id, { amountPaid: parseFloat(amount), method, transactionRef: ref });
      toast.success('Payment recorded.');
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Mark Paid — ${payment.memberName}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Amount Paid</label>
          <input className="form-input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Method</label>
          <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="QR_CODE">QR Code</option>
            <option value="CARD">Card</option><option value="ONLINE_GATEWAY">Online Gateway</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Transaction Reference</label>
          <input className="form-input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Optional" />
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Saving…' : 'Confirm Payment'}</button>
      </form>
    </Modal>
  );
}

function CreateFeeModal({ gymId, members, plans, onClose, onDone }) {
  const toast = useToast();
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [amount, setAmount] = useState(plans[0]?.price || '');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!memberId || !planId || !amount || !dueDate) return toast.error('Fill in all fields.');
    setSubmitting(true);
    try {
      await paymentApi.create(gymId, { memberId, membershipPlanId: planId, amount: parseFloat(amount), dueDate });
      toast.success('Fee record created.');
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create Fee Record" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Member</label>
          <select className="form-select" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Plan</label>
          <select className="form-select" value={planId} onChange={(e) => { setPlanId(e.target.value); const p = plans.find((pl) => pl.id === e.target.value); if (p) setAmount(p.price); }}>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
      </form>
    </Modal>
  );
}
