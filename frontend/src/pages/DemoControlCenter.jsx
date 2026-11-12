import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DemoControlCenter({ onOpenCase }) {
  const [scenarios, setScenarios] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getScenarios().then(s => { setScenarios(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const loadScenario = async (id) => {
    setStatus(`Loading ${id}...`);
    try {
      const result = await api.loadScenario(id);
      setStatus(`Opening the complete case for ${id}…`);
      onOpenCase?.(result.encounter?.id);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const resetDB = async () => {
    setStatus('Resetting database...');
    try {
      await api.resetDemo();
      setStatus('Database wiped successfully.');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  if (loading) return <div className="center" style={{ minHeight: '60vh' }}><div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--purple)', borderRadius: '50%' }} /></div>;

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div className="demo-header">
        <div>
          <span className="eyebrow">Presentation workspace</span>
          <h2 className="display-font" style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text)' }}>Demo scenarios</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Load a complete patient journey into the doctor queue in one tap.</p>
        </div>
        <div className="demo-mode">● DEMO MODE · DETERMINISTIC</div>
      </div>

      {status && (
        <div className="glass fade-in" style={{ padding: '1rem', marginBottom: '2rem', background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 'var(--radius-sm)' }}>
          {status}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 2 }}>
          <h3 className="display-font" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Available Test Patients</h3>
          <div className="stack gap-3">
            {scenarios.map((s, index) => (
              <div key={s.id} className="glass-panel scenario-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="scenario-number">Scenario {String(index + 1).padStart(2, '0')} · {s.language?.toUpperCase()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <strong className="display-font" style={{ fontSize: '1.25rem' }}>{s.patient_name || s.label}</strong>
                    <span className={`triage-pill triage-${s.triage_level.toLowerCase()}`}>{s.triage_level}</span>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{(s.transcript || '').substring(0, 80)}...</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-info">Western ✅</span>
                    <span className="badge badge-emerald">Ayush ✅</span>
                    {s.red_flags > 0 && <span className="badge badge-danger">Red Flags: {s.red_flags}</span>}
                  </div>
                </div>
                <button className="btn btn-blue" onClick={() => loadScenario(s.id)}>Load scenario →</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 className="display-font" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text)' }}>System Controls</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '2rem' }}>Reset only when you are ready to start a fresh presentation.</p>
            <button className="btn btn-crimson" style={{ width: '100%', padding: '1rem' }} onClick={resetDB}>
              ⚠ Wipe Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
