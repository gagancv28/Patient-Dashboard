import React from 'react';

const unavailable = (value) => !value || /^(none|not specified|not obtained|not reported|n\/a)$/i.test(String(value).trim());
const reported = (value) => unavailable(value) ? 'Not reported' : String(value);
const detailFromText = (text, matcher) => {
  const sentence = String(text || '').split(/(?<=[.!?])\s+/).find(part => matcher.test(part));
  return sentence ? sentence.trim() : 'Not reported';
};

export const languageLabel = (code) => ({ hi: 'हिन्दी', kn: 'ಕನ್ನಡ', en: 'English' }[code] || 'English');

export const buildSocrates = (encounter) => {
  const clinical = encounter?.clinical || {};
  const source = [encounter?.raw_transcript, clinical.hpi, clinical.associated_symptoms].filter(Boolean).join('. ');
  const symptoms = Array.isArray(clinical.symptoms) ? clinical.symptoms.filter(Boolean).join(', ') : clinical.symptoms;
  return [
    ['S', 'Site', reported(clinical.chief_complaint || symptoms)],
    ['O', 'Onset', reported(clinical.duration)],
    ['C', 'Character', detailFromText(source, /burning|sharp|dull|throbbing|cramp|aching|pressure/i)],
    ['R', 'Radiation', detailFromText(source, /radiat|spread(?:ing)?\s+(?:to|into)|left arm|right arm/i)],
    ['A', 'Associated symptoms', reported(clinical.associated_symptoms)],
    ['T', 'Timing', detailFromText(source, /morning|night|evening|intermittent|constant|after|before|when/i)],
    ['E', 'Exacerbating / relieving', detailFromText(source, /worse|better|reliev|aggravat|trigger|after|with movement/i)],
    ['S', 'Severity', reported(clinical.severity)],
  ].map(([code, label, value]) => ({ code, label, value }));
};

export const getCasePriority = (encounter) => {
  const triage = String(encounter?.triage_level || '').toUpperCase();
  const redFlags = Array.isArray(encounter?.clinical?.red_flags) ? encounter.clinical.red_flags.filter(Boolean) : [];
  const unansweredFollowup = Boolean(encounter?.followup?.question && !encounter?.followup?.answer);
  if (triage === 'EMERGENCY' || redFlags.length) return { label: 'Urgent review', tone: 'urgent', reason: redFlags.length ? `Review prompt: ${redFlags.join('; ')}.` : 'Existing triage level is emergency.' };
  if (unansweredFollowup) return { label: 'Priority review', tone: 'priority', reason: 'An AI follow-up question is still awaiting the patient response.' };
  if (triage === 'HIGH' || triage === 'MEDIUM') return { label: 'Priority review', tone: 'priority', reason: `Existing triage level is ${triage.toLowerCase()}.` };
  if (triage === 'LOW') return { label: 'Routine review', tone: 'routine', reason: 'No red flags are recorded in this encounter.' };
  return { label: 'Review required', tone: 'priority', reason: 'Clinical triage needs clinician review.' };
};

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
