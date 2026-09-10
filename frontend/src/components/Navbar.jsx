import React from 'react';
import { t } from '../i18n';

export default function Navbar({ view, setView, language, setLanguage }) {
  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.75rem 1.5rem', background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 onClick={() => setView('landing')} style={{
          margin: 0, fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer',
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          CodeScribe AI
        </h1>
        {view && view !== 'landing' && (
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            {view === 'patient' ? 'PATIENT KIOSK' : view === 'doctor' ? 'DOCTOR DASHBOARD' : view === 'analytics' ? 'ANALYTICS' : 'DEMO'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select className="input" value={language} onChange={e => setLanguage(e.target.value)}
          style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem', marginBottom: 0 }}>
          <option value="en">EN</option>
          <option value="hi">हिं</option>
          <option value="kn">ಕನ</option>
        </select>

        {view && view !== 'landing' && (
          <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={() => setView('landing')}>
            {t('nav_logout', language)}
          </button>
        )}
      </div>
    </nav>
  );
}
