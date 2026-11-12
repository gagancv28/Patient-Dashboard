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
