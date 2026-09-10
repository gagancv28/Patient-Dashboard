import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PatientFlow from './pages/PatientFlow';
import DoctorDashboard from './pages/DoctorDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DemoControlCenter from './pages/DemoControlCenter';
import { t } from './i18n';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Error Caught by Boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem', background: '#0f172a', color: '#fff', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>🚨</div>
          <h1 className="display-font" style={{ fontSize: '2.5rem', color: 'var(--crimson)' }}>Portal Crash Detected</h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: '600px', lineHeight: 1.6 }}>
            A critical error occurred while rendering this portal. The corrupted state has been isolated to prevent further crashes.
          </p>
          <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--amber)', fontSize: '0.9rem', maxWidth: '600px', wordWrap: 'break-word' }}>
            {this.state.error?.message}
          </div>
          <button className="btn btn-blue btn-xl" onClick={() => { localStorage.removeItem('cs_view'); window.location.reload(); }}>
            ↻ Reset & Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function getInitialView() {
  try {
    const v = localStorage.getItem('cs_view');
    if (['landing', 'patient', 'doctor', 'analytics', 'demo'].includes(v)) {
      return v;
    }
    localStorage.removeItem('cs_view');
  } catch (e) {
    console.error("Failed to parse persisted state", e);
  }
  return 'landing';
}

function App() {
  const [view, setView] = useState(getInitialView);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    try {
      localStorage.setItem('cs_view', view);
    } catch (e) {}
  }, [view]);

  return (
    <ErrorBoundary>
      <div className="app-bg" />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Navbar view={view} setView={setView} language={language} setLanguage={setLanguage} />

        {view === 'landing' && (
          <div className="center" style={{ flex: 1, flexDirection: 'column', padding: '3rem 2rem' }}>
            
            {/* Hero Section */}
            <div className="slide-up" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
              <div className="badge badge-ai" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                <span style={{ marginRight: '0.5rem' }}>✨</span> Transform Raw Speech into Structured Clinical Data
              </div>
              <h1 className="display-font" style={{
                fontSize: '4.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1,
                background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Listen. Understand. <br/>
                <span className="text-gradient">Structure.</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-dim)', fontWeight: 400, marginBottom: '2rem', lineHeight: 1.6 }}>
                CodeScribe AI is a voice-first clinical case-taking kiosk for Indian OPDs. It captures patient stories in their native language and delivers doctor-ready insights.
              </p>
              
              {/* Feature Tags */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>🎙️ Multilingual Voice</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>🤖 Automated Triage</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>⚖️ Western & Ayush</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>🔗 ABDM/FHIR Ready</span>
              </div>
            </div>

            {/* Application Portals */}
            <div className="slide-up" style={{ animationDelay: '0.2s', width: '100%', maxWidth: '1200px' }}>
              <h3 className="display-font" style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '2rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Access Portals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {[
                  { key: 'patient', icon: '🎙️', label: 'Patient Kiosk', desc: 'Experience the multilingual voice intake flow', color: 'var(--blue)' },
                  { key: 'doctor', icon: '🩺', label: 'Doctor Dashboard', desc: 'Review AI insights, edit, and approve records', color: 'var(--emerald)' },
                  { key: 'analytics', icon: '📊', label: 'OPD Analytics', desc: 'Monitor throughput and triage distributions', color: 'var(--amber)' },
                  { key: 'demo', icon: '🎮', label: 'Demo Control', desc: 'Inject test scenarios and manage state', color: 'var(--purple)' },
                ].map((card, i) => (
                  <button key={card.key} className="glass"
                    onClick={() => setView(card.key)}
                    style={{
                      padding: '2.5rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', flexDirection: 'column', gap: '1rem',
                      position: 'relative', overflow: 'hidden'
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = card.color; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ 
                      position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
                      background: `radial-gradient(circle at top right, ${card.color}, transparent 70%)`, opacity: 0.1, borderRadius: '0 16px 0 100%' 
                    }} />
                    <span style={{ fontSize: '2.5rem', background: 'rgba(0,0,0,0.2)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                      {card.icon}
                    </span>
                    <div>
                      <h3 className="display-font" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>{card.label}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{card.desc}</p>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', color: card.color, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Launch Portal <span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <p>Smart India Hackathon 2026 · Problem Statement SIH26047 · Team Code Raiders</p>
              <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>This is a hackathon prototype. Not clinically validated.</p>
            </div>
          </div>
        )}

        {view === 'patient' && (
          <div style={{ flex: 1, padding: '0 0 2rem 0', display: 'flex', flexDirection: 'column' }}>
            <PatientFlow language={language} onLogout={() => setView('landing')} />
          </div>
        )}

        {view === 'doctor' && (
          <div style={{ flex: 1, padding: '1.5rem', overflow: 'hidden' }}>
            <DoctorDashboard language={language} />
          </div>
        )}

        {view === 'analytics' && <AnalyticsDashboard language={language} />}
        {view === 'demo' && <DemoControlCenter />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
