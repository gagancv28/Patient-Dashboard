import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { t } from '../i18n';

export default function AnalyticsDashboard({ language }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="center" style={{ minHeight: '60vh' }}><div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--blue)', borderRadius: '50%' }} /></div>;

  const StatCard = ({ title, value, subtitle, color, isSimulated }) => (
    <div className="glass-panel slide-up" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: color }} />
      <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '150px', background: `radial-gradient(circle, ${color}, transparent 60%)`, opacity: 0.1, filter: 'blur(20px)' }} />
      
      <div className="display-font" style={{ fontSize: '4rem', fontWeight: 800, color, lineHeight: 1.1, marginBottom: '0.5rem', textShadow: `0 0 20px ${color}40` }}>
        {value}
      </div>
      <div style={{ fontSize: '1rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.5rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {subtitle} {isSimulated && <span style={{ color: 'var(--amber)', opacity: 0.8 }}>(Simulated)</span>}
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 className="display-font" style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            OPD Analytics Dashboard
          </h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Real-time triage and throughput metrics</p>
        </div>
        <div className="badge badge-warning pulse-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          SIMULATED FOR DEMO · NOT VALIDATED CLINICAL DATA
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Processed" value={data?.total_encounters || 0} subtitle="Today" color="var(--text)" />
        <StatCard title="Emergency Cases" value={data?.triage_breakdown?.EMERGENCY || 0} subtitle="Immediate Attention" color="var(--crimson)" />
        <StatCard title="Avg Intake Time" value="58s" subtitle="Target: <60s" color="var(--blue)" isSimulated />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="AI Confidence Avg" value="82%" subtitle="Speech-to-Text accuracy" color="var(--emerald)" isSimulated />
        <StatCard title="Doctor Correction Rate" value="15%" subtitle="Manual edits on AI fields" color="var(--amber)" isSimulated />
        <StatCard title="Throughput Increase" value="+40%" subtitle="Compared to manual typing" color="var(--emerald)" isSimulated />
      </div>

      <div className="glass slide-up" style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        <p>In a production environment, this dashboard would visualize actual FHIR resource generation metrics, multi-site OPD throughput, and real-time STT accuracy tracking.</p>
      </div>
    </div>
  );
}
