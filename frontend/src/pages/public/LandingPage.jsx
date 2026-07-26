import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar } from 'react-icons/fi';
import { gymApi } from '../../api/gymApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './LandingPage.css';

const FILTERS = [
  { key: 'all', label: 'All Gyms' },
  { key: 'weightGainSpecialized', label: 'Weight Gain' },
  { key: 'weightLossSpecialized', label: 'Weight Loss' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [gyms, setGyms] = useState([]);
  const [topGyms, setTopGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gymApi.topTen().then((r) => setTopGyms(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function runSearch() {
    setLoading(true);
    try {
      const params = { query: query || undefined };
      if (filter !== 'all') params[filter] = true;
      const { data } = await gymApi.search(params);
      setGyms(data.data);
    } catch {
      setGyms([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <nav className="landing-nav">
        <div className="brand"><span className="logo-badge">💪</span> GymPro</div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-outline">Sign In</Link>
          <Link to="/register/gym" className="btn btn-primary">List Your Gym</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Find your perfect gym. Train smarter, together.</h1>
        <p>Search 1,200+ gyms by location, rating, and specialty. Track workouts, diet plans, and attendance — all in one place.</p>
        <form className="hero-search" onSubmit={(e) => { e.preventDefault(); runSearch(); }}>
          <FiSearch style={{ alignSelf: 'center', marginLeft: 10, color: 'var(--color-text-faint)' }} />
          <input placeholder="Search gyms by name or city…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </section>

      {topGyms.length > 0 && (
        <>
          <div className="section-heading">
            <h2>🏆 Top 10 Gyms</h2>
            <p>Ranked by rating &amp; reviews</p>
          </div>
          <div className="gym-grid">
            {topGyms.slice(0, 4).map((gym) => <GymCard key={gym.id} gym={gym} onClick={() => navigate(`/gyms/${gym.id}`)} />)}
          </div>
        </>
      )}

      <div className="section-heading">
        <h2>Explore Gyms</h2>
      </div>
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button key={f.key} className={`filter-chip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : gyms.length === 0 ? (
        <EmptyState title="No gyms found" subtitle="Try a different search or filter." />
      ) : (
        <div className="gym-grid">
          {gyms.map((gym) => <GymCard key={gym.id} gym={gym} onClick={() => navigate(`/gyms/${gym.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function GymCard({ gym, onClick }) {
  return (
    <div className="gym-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="gym-card-image">🏋️</div>
      <div className="gym-card-body">
        <h3>{gym.name}</h3>
        <div className="gym-card-loc"><FiMapPin size={12} /> {gym.city}, {gym.state}</div>
        <div className="gym-card-meta">
          <span className="gym-card-rating"><FiStar size={13} /> {gym.avgRating?.toFixed(1) || 'New'} ({gym.totalReviews || 0})</span>
          <span className="gym-card-price">{gym.startingPrice ? `₹${gym.startingPrice}/mo` : '—'}</span>
        </div>
      </div>
    </div>
  );
}
