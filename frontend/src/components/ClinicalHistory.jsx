import React from 'react';
import { buildSocrates, languageLabel } from '../utils/clinicalHistory';

export const SocratesHistory = ({ encounter, title = 'Structured clinical history' }) => (
  <section className="history-section" aria-label={title}>
    <div className="history-heading"><div><span className="eyebrow">SOCRATES</span><h3>{title}</h3></div><span className="badge badge-ai">AI-assisted extraction</span></div>
    <div className="history-grid">{buildSocrates(encounter).map((item, index) => <div className="history-card" key={`${item.code}-${index}`}><span className="history-code">{item.code}</span><div><strong>{item.label}</strong><p className={item.value === 'Not reported' ? 'not-reported' : ''}>{item.value}</p></div></div>)}</div>
    <p className="history-note">Based only on the current encounter. “Not reported” means no supporting detail was captured.</p>
  </section>
);

export const WordsComparison = ({ encounter }) => (
  <section className="words-comparison" aria-label="Patient words and AI structured history">
    <div><span className="eyebrow">Patient’s words · {languageLabel(encounter?.language)}</span><p>{encounter?.raw_transcript || 'No original input captured.'}</p></div>
    <div><span className="eyebrow">AI structured summary · English</span><p>{encounter?.patient_summary || encounter?.clinical?.hpi || 'No structured summary available.'}</p></div>
  </section>
);
