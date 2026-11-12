import React from 'react';

const links = [
  ['patient', 'Patient Kiosk'], ['doctor', 'Doctor Dashboard'], ['demo', 'Demo'], ['analytics', 'Insights'],
];

export default function Navbar({ view, setView, language, setLanguage }) {
  return <nav className="clinical-nav" aria-label="Main navigation">
    <div className="brand-mark" onClick={() => setView('landing')} role="button" tabIndex="0" onKeyDown={e => e.key === 'Enter' && setView('landing')}><span className="brand-icon">✚</span>CodeScribe AI</div>
    <div className="nav-links">{links.map(([key, label]) => <button key={key} className={`nav-link ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>{label}</button>)}</div>
    <div className="nav-actions"><select aria-label="Interface language" className="input language-select" value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option><option value="kn">ಕನ್ನಡ</option></select>{view !== 'landing' && <button className="btn btn-ghost" onClick={() => setView('landing')}>Home</button>}</div>
  </nav>;
}
