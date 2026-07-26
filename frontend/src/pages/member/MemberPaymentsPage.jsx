import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiCreditCard } from 'react-icons/fi';
import { paymentApi } from '../../api/paymentApi';
import { gymApi } from '../../api/gymApi';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { apiErrorMessage } from '../../api/axiosClient';
import './Member.css';

export default function MemberPaymentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModalFor, setPayModalFor] = useState(null);

  useEffect(() => {
    paymentApi.myPayments()
      .then((r) => setPayments(r.data.data))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load payment history.')))
      .finally(() => setLoading(false));

    if (user?.gymId) {
      gymApi.getById(user.gymId).then((r) => setGym(r.data.data)).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loader />;

  const nextDue = payments.find((p) => p.status !== 'PAID');

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Payments</h1>
          {nextDue && <p className="subtitle">Next due: {nextDue.dueDate} · ₹{nextDue.remainingAmount}</p>}
        </div>
        {nextDue && (
          <button className="btn btn-primary" onClick={() => setPayModalFor(nextDue)}>
            <FiCreditCard /> Pay Now
          </button>
        )}
      </div>

      <div className="card">
        {payments.length === 0 ? (
          <EmptyState title="No payment history yet" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Plan</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.membershipPlanName || '—'}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.dueDate || '—'}</td>
                    <td>{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}</td>
                    <td>{p.method || '—'}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payModalFor && (
        <PayModal payment={payModalFor} gym={gym} onClose={() => setPayModalFor(null)} />
      )}
    </div>
  );
}

function PayModal({ payment, gym, onClose }) {
  const toast = useToast();
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [order, setOrder] = useState(null);

  async function payOnline() {
    setCreatingOrder(true);
    try {
      const { data } = await paymentApi.createOnlineOrder(payment.remainingAmount);
      setOrder(data.data);
      toast.info('Payment order created. Complete it in your bank app, then ask the gym to confirm.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <Modal title="Pay via UPI" onClose={onClose} width={420}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 200, height: 200, margin: '0 auto 16px', background: '#f4f6fb', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {gym?.upiId ? (
            <QRCodeSVG
              value={`upi://pay?pa=${encodeURIComponent(gym.upiId)}&pn=${encodeURIComponent(gym.name)}&am=${payment.remainingAmount}&cu=INR`}
              size={168}
            />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>UPI ID not set up yet</span>
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{gym?.name || 'Your Gym'}</div>
        <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          UPI ID: {gym?.upiId || 'not configured yet'}
        </div>

        <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: 14, textAlign: 'left', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Amount</span>
            <strong>₹{payment.remainingAmount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>For</span>
            <strong>{payment.membershipPlanName || 'Membership fee'}</strong>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-faint)', marginBottom: 16 }}>
          Scan with any UPI app — PhonePe, GPay, Paytm
        </p>

        <button className="btn btn-primary btn-block" onClick={payOnline} disabled={creatingOrder}>
          {creatingOrder ? 'Creating order…' : 'Pay via Card / Netbanking'}
        </button>
        {order && (
          <div className="alert alert-success" style={{ marginTop: 14, textAlign: 'left' }}>
            Order <strong>{order.orderId}</strong> created for ₹{order.amount}. Once completed, your gym owner will mark it as paid.
          </div>
        )}
      </div>
    </Modal>
  );
}
