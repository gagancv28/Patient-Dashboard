import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const StatCard = ({ title, value, subtitle, color, isSimulated }) => (
  <div className="glass-panel slide-up" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: color }} />
    <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '150px', background: `radial-gradient(circle, ${color}, transparent 60%)`, opacity: 0.1, filter: 'blur(20px)' }} />
    <div className="display-font" style={{ fontSize: '4rem', fontWeight: 800, color, lineHeight: 1.1, marginBottom: '0.5rem', textShadow: `0 0 20px ${color}40` }}>{value}</div>
    <div style={{ fontSize: '1rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</div>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtitle} {isSimulated && <span style={{ color: 'var(--amber)', opacity: 0.8 }}>(Simulated)</span>}</div>
  </div>
);

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAnalytics()
      .then(d => { setData(d); setError(''); })
      .catch(() => setError('Analytics are temporarily unavailable. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center" style={{ minHeight: '60vh' }}><div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--blue)', borderRadius: '50%' }} /></div>;

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 className="display-font" style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            OPD Demo Metrics
          </h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Encounter counts from this local demo session; timing and quality values are simulated.</p>
        </div>
        <div className="badge badge-warning pulse-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          SIMULATED FOR DEMO · NOT VALIDATED CLINICAL DATA
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <StatCard title="Encounters recorded" value={data?.total_patients || 0} subtitle="Current local demo session" color="var(--text)" />
        <StatCard title="Awaiting review" value={data?.pending || 0} subtitle="Current queue" color="var(--crimson)" />
        <StatCard title="Languages used" value={Object.keys(data?.language_distribution || {}).length} subtitle="Recorded encounter languages" color="var(--blue)" />
      </div>

      {error && <div role="alert" className="glass" style={{ marginTop: '1.5rem', padding: '1rem', color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.35)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Emergency triage" value={data?.emergency_count || 0} subtitle="Existing encounter triage" color="var(--crimson)" />
        <StatCard title="Average intake" value={data?.avg_intake_duration_seconds ? `${data.avg_intake_duration_seconds}s` : '—'} subtitle="Prototype timing value" color="var(--amber)" isSimulated />
        <StatCard title="OCR usage" value={data?.ocr_usage_rate !== undefined ? `${data.ocr_usage_rate}%` : '—'} subtitle="Prototype usage value" color="var(--emerald)" isSimulated />
      </div>

      <div className="glass slide-up" style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        <p>Safety note: these metrics are for a hackathon prototype. They do not demonstrate clinical quality, operational throughput, or production performance.</p>
      </div>
    </div>
  );
}
