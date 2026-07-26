import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiPhone } from 'react-icons/fi';
import { gymApi } from '../../api/gymApi';
import Loader from '../../components/common/Loader';
import './LandingPage.css';

export default function GymDetailPage() {
  const { gymId } = useParams();
  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([gymApi.getById(gymId), gymApi.reviews(gymId)])
      .then(([g, r]) => { setGym(g.data.data); setReviews(r.data.data); })
      .finally(() => setLoading(false));
  }, [gymId]);

  if (loading) return <div className="container"><Loader /></div>;
  if (!gym) return <div className="container"><p>Gym not found.</p></div>;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <nav className="landing-nav">
        <Link to="/" className="brand"><span className="logo-badge">💪</span> GymPro</Link>
        <Link to="/login" className="btn btn-outline">Sign In</Link>
      </nav>

      <div className="gym-card-image" style={{ height: 220, borderRadius: 16, fontSize: 60, marginBottom: 24 }}>🏋️</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>{gym.name}</h1>
          <div className="gym-card-loc" style={{ fontSize: 14, marginTop: 6 }}><FiMapPin /> {gym.address}, {gym.city}, {gym.state}</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 10, color: 'var(--color-text-muted)', fontSize: 13.5 }}>
            <span className="gym-card-rating"><FiStar /> {gym.avgRating?.toFixed(1) || 'New'} ({gym.totalReviews} reviews)</span>
            <span><FiClock /> {gym.openingTime} – {gym.closingTime}</span>
            <span><FiPhone /> {gym.contactNumber}</span>
          </div>
        </div>
        <Link to="/register/member" className="btn btn-primary">Join This Gym</Link>
      </div>

      {gym.description && <p style={{ marginTop: 24, color: 'var(--color-text-muted)', maxWidth: 700 }}>{gym.description}</p>}

      {gym.facilities?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Facilities</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {gym.facilities.map((f) => <span key={f} className="badge badge-info">{f}</span>)}
          </div>
        </div>
      )}

      {gym.membershipPlans?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Membership Plans</h3>
          <div className="gym-grid">
            {gym.membershipPlans.map((plan) => (
              <div key={plan.id} className="card card-pad">
                <div style={{ fontWeight: 700, fontSize: 15 }}>{plan.name}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0' }}>₹{plan.price}</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginBottom: 10 }}>{plan.durationInDays} days</div>
                {plan.features?.map((f) => <div key={f} style={{ fontSize: 13, marginBottom: 4 }}>✓ {f}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Member Reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.id} className="card card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{r.memberName}</strong>
                  <span className="gym-card-rating"><FiStar size={13} /> {r.rating}</span>
                </div>
                <p style={{ marginTop: 6, color: 'var(--color-text-muted)', fontSize: 13.5 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
