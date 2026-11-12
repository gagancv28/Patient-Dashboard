import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import PatientFlow from './pages/PatientFlow';
import DoctorDashboard from './pages/DoctorDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DemoControlCenter from './pages/DemoControlCenter';

const VIEWS = ['landing', 'patient', 'doctor', 'analytics', 'demo'];

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="center" style={{ minHeight: '100vh', padding: '2rem', textAlign: 'center' }}><div className="glass-panel" style={{ maxWidth: '560px', padding: '2.5rem' }}><span className="badge badge-warning">Safe recovery</span><h1 style={{ margin: '1rem 0' }}>We couldn’t open this view.</h1><p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>Your clinical data has not been changed. Return to the home screen and try again.</p><button className="btn btn-blue btn-lg" style={{ marginTop: '1.5rem' }} onClick={() => { localStorage.removeItem('cs_view'); window.location.reload(); }}>Return to home</button></div></main>;
    return this.props.children;
  }
}

function getInitialView() {
  try { const value = localStorage.getItem('cs_view'); if (VIEWS.includes(value)) return value; localStorage.removeItem('cs_view'); } catch { /* Browser storage can be unavailable. */ }
  return 'landing';
}

const portalCards = [
  { key: 'patient', icon: '◉', title: 'Patient Kiosk', copy: 'A simple, multilingual guided intake experience.', action: 'Begin patient intake' },
  { key: 'doctor', icon: '✚', title: 'Doctor Dashboard', copy: 'Review AI-assisted histories with clinical context.', action: 'Open clinical workspace' },
  { key: 'demo', icon: '◆', title: 'Demo scenarios', copy: 'Load deterministic cases for a reliable presentation.', action: 'Explore demo mode' },
];

function Landing({ setView }) {
  return <>
    <main className="health-hero">
      <div className="hero-grid">
        <section className="slide-up">
          <div className="eyebrow">● Multilingual clinical intake</div>
          <h1>CodeScribe AI<br /><span>Your Voice. Your Language.</span><br />Your Health Story.</h1>
          <p className="hero-copy">A multilingual, AI-powered patient case-taking system that helps hospitals capture structured clinical histories faster, more clearly, and with the doctor always in control.</p>
          <div className="hero-actions"><button className="btn btn-blue btn-lg" onClick={() => setView('patient')}>Start patient kiosk →</button><button className="btn btn-ghost btn-lg" onClick={() => setView('demo')}>View demo scenarios</button></div>
          <div className="trust-row"><span>✓ English · हिन्दी · ಕನ್ನಡ</span><span>✓ Doctor review required</span><span>✓ FHIR-ready record</span></div>
        </section>
        <aside className="hero-workflow slide-up" style={{ animationDelay: '.08s' }}>
          <div className="workflow-kicker">How CodeScribe works</div>
          {[['01', 'Patient', 'Chooses language and shares symptoms'], ['02', 'Voice or touch', 'Accessible intake, with typed fallback'], ['03', 'AI structuring', 'Clear history and confidence indicators'], ['04', 'Doctor review', 'Clinician edits, verifies and approves'], ['05', 'Digital record', 'FHIR-shaped clinical bundle']].map(([n, title, copy]) => <div className="workflow-step" key={n}><span className="workflow-icon">{n}</span><div><strong>{title}</strong><small>{copy}</small></div></div>)}
        </aside>
      </div>
    </main>
    <section className="portal-section slide-up" style={{ animationDelay: '.14s' }}><div className="section-label">Choose a workspace</div><h2>Purpose-built for the OPD journey.</h2><div className="portal-grid">{portalCards.map(card => <button className="portal-card" key={card.key} onClick={() => setView(card.key)}><span className="portal-icon">{card.icon}</span><h3>{card.title}</h3><p>{card.copy}</p><span>{card.action} →</span></button>)}</div></section>
  </>;
}

export default function App() {
  const [view, setView] = useState(getInitialView);
  const [language, setLanguage] = useState('en');
  const [reviewEncounterId, setReviewEncounterId] = useState(null);
  useEffect(() => { try { localStorage.setItem('cs_view', view); } catch { /* Ignore unavailable storage. */ } }, [view]);
  return <ErrorBoundary><div className="app-bg" /><div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}><Navbar view={view} setView={setView} language={language} setLanguage={setLanguage} />
    {view === 'landing' && <Landing setView={setView} />}
    {view === 'patient' && <div style={{ flex: 1 }}><PatientFlow language={language} onLanguageChange={setLanguage} onLogout={() => setView('landing')} /></div>}
    {view === 'doctor' && <div style={{ flex: 1, padding: '1.25rem' }}><DoctorDashboard language={language} initialEncounterId={reviewEncounterId} /></div>}
    {view === 'analytics' && <AnalyticsDashboard />}
    {view === 'demo' && <DemoControlCenter onOpenCase={(encounterId) => { setReviewEncounterId(encounterId); setView('doctor'); }} />}
  </div></ErrorBoundary>;
}
