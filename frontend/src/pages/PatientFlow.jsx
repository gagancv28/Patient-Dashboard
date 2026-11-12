import React, { useState, useEffect, useRef } from 'react';
import { t } from '../i18n';
import { api } from '../services/api';
import { SocratesHistory, WordsComparison } from '../components/ClinicalHistory';

const STEPS = ['language', 'consent', 'form', 'voice', 'processing', 'followup', 'ocr', 'summary', 'confirmation'];

const StepIndicator = ({ current, total }) => {
  return (
    <div className="steps-container">
      <div className="steps">
        <div className="steps-progress" style={{ width: `${(current / (total - 1)) * 100}%` }} />
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`step-dot ${i === current ? 'active' : i < current ? 'done' : ''}`} />
        ))}
      </div>
    </div>
  );
};

// ─── Step 1: Language ─────────────────────────────────────────────
const LanguageSelect = ({ onSelect, lang }) => (
  <div className="center slide-up" style={{ flexDirection: 'column', gap: '3rem', minHeight: '65vh' }}>
    <div style={{ textAlign: 'center' }}>
      <span className="eyebrow">Choose your language</span>
      <h2 className="display-font" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '.75rem' }}>Tell us what you’re feeling.</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Select the language that feels most comfortable for you.</p>
    </div>
    <div className="language-grid">
      {[{code:'en',label:'English',native:'English', icon:'A'},{code:'hi',label:'हिंदी',native:'Hindi', icon:'अ'},{code:'kn',label:'ಕನ್ನಡ',native:'Kannada', icon:'ಅ'}].map(l => (
        <button key={l.code} className="language-card" onClick={() => onSelect(l.code)}>
          <span className="language-symbol">{l.icon}</span><strong>{l.label}</strong><small>{l.native} · Speech & touch supported</small>
        </button>
      ))}
    </div>
  </div>
);

// ─── Step 2: Consent ─────────────────────────────────────────────
const ConsentScreen = ({ onAccept, onDecline, lang }) => (
  <div className="center slide-up" style={{ flexDirection: 'column', minHeight: '65vh' }}>
    <div className="glass-panel" style={{ maxWidth: '700px', padding: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, var(--emerald-glow), transparent 70%)', filter: 'blur(30px)', opacity: 0.5 }} />
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.5))' }}>🛡️</div>
      <h2 className="display-font" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{t('consent_title', lang)}</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>{t('consent_body', lang)}</p>
      
      <div style={{ textAlign: 'left', marginBottom: '3rem', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        {(t('consent_points', lang) || []).map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--emerald)', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>✓</div>
            <span style={{ color: 'var(--text)', fontSize: '1.05rem' }}>{p}</span>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
        <button className="btn btn-emerald btn-xl" onClick={onAccept}>{t('consent_accept', lang)}</button>
        <button className="btn btn-ghost btn-xl" onClick={onDecline}>{t('consent_decline', lang)}</button>
      </div>
    </div>
  </div>
);

// ─── Step 3: Form ─────────────────────────────────────────────
const PatientForm = ({ onSubmit, lang }) => {
  const [form, setForm] = useState({ patient_name: '', patient_age: '', patient_gender: 'Female', phone_number: '', email_address: '' });
  const handle = (e) => { e.preventDefault(); onSubmit(form); };
  return (
    <div className="center slide-up" style={{ minHeight: '65vh' }}>
      <div className="glass-panel" style={{ maxWidth: '550px', width: '100%', padding: '3.5rem' }}>
        <h2 className="display-font" style={{ fontSize: '2.2rem', marginBottom: '2.5rem', textAlign: 'center' }}>{t('form_title', lang)}</h2>
        <form onSubmit={handle} className="stack gap-3">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontWeight: 600 }}>{t('form_name', lang)}</label>
            <input className="input" required value={form.patient_name} onChange={e => setForm({...form, patient_name: e.target.value})} placeholder="e.g. Lakshmi N." />
          </div>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontWeight: 600 }}>{t('form_age', lang)}</label>
              <input className="input" type="number" required value={form.patient_age} onChange={e => setForm({...form, patient_age: e.target.value})} placeholder="Years" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontWeight: 600 }}>{t('form_gender', lang)}</label>
              <select className="input" value={form.patient_gender} onChange={e => setForm({...form, patient_gender: e.target.value})}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontWeight: 600 }}>{t('form_phone', lang)}</label>
            <input className="input" type="tel" required value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} placeholder="10-digit number" />
          </div>
          <button type="submit" className="btn btn-blue btn-xl" style={{ marginTop: '1rem', width: '100%' }}>{t('form_submit', lang)}</button>
        </form>
      </div>
    </div>
  );
};

// ─── Step 4: Voice Recording (WOW MOMENT) ─────────────────────────
const VoiceRecorder = ({ onSubmit, lang, patientName }) => {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState('');
  const [manualText, setManualText] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speechError, setSpeechError] = useState('');

  // Mock keyword detection for visual effect
  const medicalKeywords = ['pain', 'fever', 'headache', 'chest', 'pressure', 'knee', 'joint', 'sweating', 'days', 'weeks', 'severe', 'mild'];
  
  useEffect(() => {
    const words = text.toLowerCase().split(/\s+/);
    const found = words.filter(w => medicalKeywords.some(mk => w.includes(mk)));
    if (found.length > detectedKeywords.length) {
      setDetectedKeywords(Array.from(new Set(found)));
    }
  }, [text]);

  useEffect(() => {
    let rec = null;
    let isActive = true;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      rec = new SR();
      rec.continuous = true; 
      rec.interimResults = true;
      rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
      setSpeechAvailable(true);
      
      let fullText = '';
      
      rec.onstart = () => {
        if (isActive) setRecording(true);
      };
      
      rec.onresult = (e) => {
        if (!isActive) return;
        let interim = '';
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) { fullText += e.results[i][0].transcript + ' '; }
          else { interim += e.results[i][0].transcript; }
        }
        setText(fullText + interim);
      };
      
      rec.onerror = (event) => {
        if (!isActive) return;
        setRecording(false);
        setSpeechError(event.error === 'not-allowed'
          ? 'Microphone access was not granted. You can type your symptoms or use a quick symptom option below.'
          : 'Voice input is unavailable right now. You can type your symptoms or use a quick symptom option below.');
      };
      rec.onend = () => { if (isActive) setRecording(false); };
      
      setRecognition(rec);
    } else {
      setSpeechAvailable(false);
      setSpeechError('Voice input is not supported in this browser. You can type your symptoms or use a quick symptom option below.');
    }
    
    return () => {
      isActive = false;
      if (rec) {
        try { rec.stop(); } catch(e) {}
      }
      setRecording(false);
    };
  }, [lang]);

  const toggle = () => {
    if (recording) { 
      recognition?.stop(); 
      if (text.trim()) onSubmit(text.trim()); 
    } else { 
      setText(''); 
      setDetectedKeywords([]); 
      if (!recognition) {
        setSpeechError('Voice input is unavailable. Type your symptoms or choose a quick symptom option below.');
        return;
      }
      setSpeechError('');
      try { recognition.start(); } catch (error) {
        setSpeechError('Voice input could not start. Type your symptoms or choose a quick symptom option below.');
      }
    }
  };

  const symptoms = t('voice_symptoms', lang) || [];

  return (
    <div className="center slide-up" style={{ flexDirection: 'column', gap: '2rem', minHeight: '65vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="display-font" style={{ fontSize: '2.5rem', fontWeight: 600 }}>
          Hi {patientName.split(' ')[0]}, <span className="text-gradient">Tell Us How You Feel</span>
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginTop: '0.5rem' }}>{t('voice_subtitle', lang)}</p>
      </div>

      <div className="voice-layout">
        
        {/* Left: Input Area */}
        <div className="glass-panel voice-panel" style={{ position: 'relative' }}>
          {recording && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--crimson)', border: '1px solid var(--crimson)' }}>
                <span style={{ width:'8px',height:'8px',borderRadius:'50%',background:'var(--crimson)',marginRight:'6px', display:'inline-block', animation:'pulse 1s infinite' }}></span>
                RECORDING
              </span>
            </div>
          )}

          <div className="waveform-container" style={{ margin: '2rem 0' }}>
            {Array.from({length: 15}).map((_, i) => (
              <div key={i} className={`waveform-bar ${recording ? 'recording' : ''}`} 
                style={{ height: recording ? `${Math.random() * 80 + 20}%` : '20%', transitionDuration: '0.2s' }} />
            ))}
          </div>

          <button onClick={toggle} aria-label={recording ? 'Stop recording' : 'Start recording'} className={`mic-orb ${recording ? 'listening' : ''}`}>
            {recording ? '⏹' : '🎤'}
          </button>
          <div style={{ marginTop: '1.5rem', fontWeight: 600, color: recording ? 'var(--crimson)' : 'var(--blue)', fontSize: '1.2rem' }}>
            {recording ? 'Listening… tap to finish' : 'Tap to speak'}
          </div>
          {!speechAvailable && <p style={{ color: 'var(--amber)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>Voice recognition is unavailable in this browser.</p>}
        </div>

        {/* Right: Live AI Analysis */}
        <div className="glass voice-panel" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h3 className="display-font" style={{ fontSize: '1.2rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="spin" style={{ display: recording ? 'inline-block' : 'none', fontSize: '1.2rem' }}>⚙️</span> 
              What we heard
            </h3>
            {recording && <span style={{ color: 'var(--purple)', fontSize: '0.85rem', fontWeight: 600 }} className="pulse">Listening...</span>}
          </div>

          <div style={{ flex: 1, minHeight: '150px', color: text ? 'var(--text)' : 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.8, fontStyle: text ? 'normal' : 'italic' }}>
            {text ? text : "Your words will appear here. You can also type or choose a symptom below."}
          </div>

          {/* Extracted Entities Visualization */}
          {detectedKeywords.length > 0 && (
            <div className="fade-in" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem', fontWeight: 700 }}>Auto-Detected Entities</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {detectedKeywords.map((k, i) => (
                  <span key={i} className="badge badge-ai slide-in-right" style={{ animationDelay: `${i*0.1}s` }}>{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Touch Fallback */}
      {!recording && !text && (
        <div className="fade-in" style={{ marginTop: '1rem', width: '100%', maxWidth: '800px', textAlign: 'center' }}>
          {speechError && <p role="alert" style={{ color: 'var(--amber)', marginBottom: '1rem', lineHeight: 1.5 }}>{speechError}</p>}
          <div className="glass" style={{ padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
            <label htmlFor="manual-symptoms" style={{ display: 'block', color: 'var(--text-dim)', marginBottom: '0.5rem', fontWeight: 600 }}>Or type your symptoms</label>
            <textarea id="manual-symptoms" className="input" rows="3" value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Describe what you are feeling..." style={{ resize: 'vertical' }} />
            <button className="btn btn-blue" disabled={!manualText.trim()} onClick={() => onSubmit(manualText.trim())}>Continue with typed symptoms</button>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem' }}>{t('voice_touch', lang)}</p>
          <div className="touch-grid">
            {symptoms.map(s => (
              <button key={s} className="touch-option" onClick={() => onSubmit(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step 5: AI Processing (WOW MOMENT) ───────────────────────────
const AIProcessingScreen = ({ text, onDone, lang }) => {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    if (stage < 4) {
      const timer = setTimeout(() => setStage(s => s + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onDone, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const rawJsonLines = [
    '{',
    '  "chief_complaint": "Extracted...",',
    '  "symptoms": ["Mapping to SNOMED..."],',
    '  "duration": "Parsing time context...",',
    '  "severity": "Evaluating magnitude...",',
    '}'
  ];

  return (
    <div className="center slide-up" style={{ flexDirection: 'column', gap: '2rem', minHeight: '65vh' }}>
      <h2 className="display-font text-gradient-purple" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Structuring Clinical Data</h2>
      
      <div style={{ display: 'flex', width: '100%', maxWidth: '1000px', height: '350px', background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        
        {/* Left: Raw Text */}
        <div style={{ flex: 1, padding: '2rem', borderRight: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Raw Patient Audio Transcript</div>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.7, fontStyle: 'italic' }}>"{text}"</p>
          
          {/* Scanning Laser Effect */}
          <div style={{ position: 'absolute', left: 0, width: '100%', height: '4px', background: 'var(--blue)', boxShadow: '0 0 20px var(--blue)', animation: 'aiScan 2s infinite ease-in-out', zIndex: 10 }} />
        </div>

        {/* Center: Processing Visualization */}
        <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.9)', borderRight: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
          <div className="waveform-container" style={{ transform: 'rotate(90deg)', width: '200px' }}>
            {Array.from({length: 8}).map((_, i) => <div key={i} className="waveform-bar ai-active" style={{ height: `${Math.random()*80+20}%` }} />)}
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '50%', border: '2px solid var(--purple)' }}>
             <span className="spin" style={{ display: 'block', fontSize: '1.5rem' }}>⚙️</span>
          </div>
        </div>

        {/* Right: Structured Data (Simulated building) */}
        <div style={{ flex: 1.2, padding: '2rem', background: '#0f172a', fontFamily: 'monospace', fontSize: '0.9rem', color: '#6ee7b7' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>FHIR / JSON Mapping</div>
          <div className="stack gap-1">
            {rawJsonLines.map((line, i) => (
              <div key={i} className={i <= stage ? 'fade-in' : ''} style={{ opacity: i <= stage ? 1 : 0, color: i === 0 || i === 5 ? '#e2e8f0' : i <= stage ? '#6ee7b7' : 'transparent', transition: 'opacity 0.3s' }}>
                {i > 0 && i < 5 && stage > i ? line.replace('...', '✓') : line}
              </div>
            ))}
            {stage >= 4 && (
              <div className="fade-in" style={{ marginTop: '2rem', color: 'var(--blue)' }}>
                {">"} Routing to Doctor Queue... <br/>
                {">"} Checking for Red Flags... ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 6: Follow-up ─────────────────────────────────────────────
const FollowUpQuestion = ({ question, reason, onAnswer, onSkip, lang }) => {
  const [answer, setAnswer] = useState('');

  return (
    <div className="center slide-up" style={{ flexDirection: 'column', minHeight: '65vh' }}>
      <div className="glass-panel" style={{ maxWidth: '700px', width: '100%', padding: '4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139,92,246,0.15)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '2rem', fontWeight: 600, fontSize: '0.85rem' }}>
          <span className="pulse" style={{ width: '8px', height: '8px', background: '#c4b5fd', borderRadius: '50%' }}></span>
          AI CLARIFICATION REQUIRED
        </div>
        
        <h2 className="display-font" style={{ fontSize: '2.2rem', marginBottom: '1.5rem', lineHeight: 1.4, color: 'var(--text)' }}>"{question}"</h2>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem', borderLeft: '4px solid var(--purple)', textAlign: 'left' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.6 }}><strong style={{ color: '#c4b5fd', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', marginRight: '0.5rem' }}>Reasoning:</strong> {reason}</p>
        </div>
        
        <div className="stack gap-3">
          <input className="input" placeholder="Type or speak your answer..." value={answer} onChange={e => setAnswer(e.target.value)} style={{ padding: '1.25rem', fontSize: '1.1rem' }} />
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button className="btn btn-blue btn-xl" disabled={!answer.trim()} onClick={() => onAnswer(answer.trim())}>Submit Answer</button>
            <button className="btn btn-ghost btn-xl" onClick={onSkip}>{t('followup_skip', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 7: OCR ─────────────────────────────────────────────
const OCRUpload = ({ onSkip, onResult, lang }) => {
  const [scanning, setScanning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  useEffect(() => { api.getConfig().then(config => setDemoMode(Boolean(config.demo_mode))).catch(() => setError('Unable to confirm OCR availability. You can skip this step.')); }, []);
  const demoResult = {
    raw_text: "Demo prescription sample\n\n1. Metformin 500mg — BD\n2. Glimepiride 1mg — OD\n3. Methylcobalamin 1500mcg — OD",
    medications: [
      { name: "Metformin 500mg", dosage: "Twice daily after meals", confidence: 0.92 },
      { name: "Glimepiride 1mg", dosage: "Once daily before breakfast", confidence: 0.88 },
      { name: "Methylcobalamin 1500mcg", dosage: "Once daily", confidence: 0.72 },
    ], overall_confidence: 0.84, source: 'demo'
  };
  const handleFile = (file) => {
    if (!file) return;
    setError('');
    if (!demoMode) {
      setError('Prescription OCR is not configured in this environment. No medication details were extracted; please skip and have the clinician verify the prescription.');
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false); setResult(demoResult);
    }, 2500);
  };

  if (scanning) {
    return (
      <div className="center slide-up" style={{ flexDirection: 'column', gap: '2rem', minHeight: '65vh' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <div className="spin" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid var(--border)', borderTop: '4px solid var(--emerald)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2.5rem' }}>📄</div>
        </div>
        <h2 className="display-font text-gradient" style={{ fontSize: '2rem' }}>{t('ocr_scanning', lang)}</h2>
        <p style={{ color: 'var(--text-dim)' }}>{demoMode ? 'Demo OCR is extracting the scripted medication sample…' : 'Checking prescription OCR…'}</p>
      </div>
    );
  }

  if (result) return (
    <div className="center slide-up" style={{ flexDirection: 'column', minHeight: '65vh' }}><div className="glass-panel" style={{ maxWidth: '680px', width: '100%', padding: '2.5rem' }}>
      <span className="badge badge-warning">DEMO OCR EXTRACTION · VERIFY WITH CLINICIAN</span>
      <h2 className="display-font" style={{ margin: '1rem 0' }}>Review extracted medication details</h2>
      <div className="stack gap-2">{result.medications.map((medication, index) => <div key={index} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}><span><strong>{medication.name}</strong><br /><small>{medication.dosage}</small></span><span className="badge badge-ai">{Math.round(medication.confidence * 100)}%</span></div>)}</div>
      <p className="history-note" style={{ marginTop: '1rem' }}>This demo extraction is not a prescription verification. A clinician must confirm all medicines and doses.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}><button className="btn btn-emerald" style={{ flex: 1 }} onClick={() => onResult(result)}>Continue to review</button><button className="btn btn-ghost" onClick={() => { setResult(null); fileRef.current?.click(); }}>Try another</button></div>
    </div></div>
  );

  return (
    <div className="center slide-up" style={{ flexDirection: 'column', minHeight: '65vh' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '4rem', textAlign: 'center' }}>
        <div className="float" style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>📷</div>
        <h2 className="display-font" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{t('ocr_title', lang)}</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '3rem', fontSize: '1.1rem' }}>{t('ocr_subtitle', lang)}</p>
        
        <div className="stack gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files?.[0])} />
          <button className="btn btn-blue btn-xl" onClick={() => fileRef.current?.click()}>Upload Prescription Image</button>
          {demoMode && <span className="badge badge-warning" style={{ justifyContent: 'center' }}>DEMO MODE · SCRIPTED OCR SAMPLE</span>}
          {error && <p role="alert" style={{ color: 'var(--crimson)', lineHeight: 1.5 }}>{error}</p>}
          <button className="btn btn-ghost" style={{ padding: '1rem' }} onClick={onSkip}>{t('ocr_skip', lang)}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 8: Summary ─────────────────────────────────────────────
const ClinicalSummary = ({ encounter, onContinue, lang }) => {
  const c = encounter?.clinical || {};
  const conf = c.confidence || {};
  
  const ConfBar = ({ val }) => {
    const v = Math.round((val || 0) * 100);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
        <div className="confidence-bar">
          <div className={`confidence-fill ${v >= 80 ? 'conf-high' : v >= 50 ? 'conf-med' : 'conf-low'}`} style={{ width: `${v}%` }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, width: '30px', textAlign: 'right' }}>{v}%</span>
      </div>
    );
  };

  const fields = [
    { key: 'chief_complaint', label: 'Chief Complaint' },
    { key: 'hpi', label: 'History of Present Illness' },
    { key: 'duration', label: 'Duration' },
    { key: 'severity', label: 'Severity' },
  ];

  return (
    <div className="center slide-up" style={{ flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="display-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('summary_title', lang)}</h2>
        <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>{t('summary_ai_note', lang)}</span>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px', width: '100%', padding: '0', overflow: 'hidden' }}>
        
        {/* Report Header */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="display-font" style={{ fontSize: '1.5rem', margin: 0 }}>{encounter?.patient?.name || 'Patient'}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{encounter?.patient?.age}Y · {encounter?.patient?.gender}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Triage Level</div>
            <div className={`triage-pill triage-${(encounter?.triage_level || 'LOW').toLowerCase()}`} style={{ marginTop: '0.3rem' }}>{encounter?.triage_level}</div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Red flags */}
          {c.red_flags && c.red_flags.length > 0 && (
            <div className="pulse-danger" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>🚨</span>
              <div>
                <strong style={{ color: 'var(--crimson)', fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>Critical Indicators Detected</strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  {c.red_flags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Symptoms */}
          {c.symptoms && c.symptoms.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Extracted Symptoms</span>
                <span className="badge badge-ai">AI-Generated</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {c.symptoms.map((s, i) => <span key={i} className="badge badge-info" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>{s}</span>)}
              </div>
            </div>
          )}

          {/* Core Fields */}
          <div className="stack gap-4">
            {fields.map(f => {
              const isMissing = !c[f.key] || c[f.key].includes('Not obtained');
              return (
                <div key={f.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{f.label}</div>
                    {conf[f.key] !== undefined && <ConfBar val={conf[f.key]} />}
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: isMissing ? 'var(--amber)' : 'var(--text)', fontStyle: isMissing ? 'italic' : 'normal', lineHeight: 1.6 }}>
                    {c[f.key] || 'Not provided'}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <WordsComparison encounter={encounter} />
            <SocratesHistory encounter={encounter} title="Your structured clinical history" />
          </div>
        </div>
      </div>

      <button className="btn btn-emerald btn-xl" style={{ width: '100%', maxWidth: '800px' }} onClick={onContinue}>Looks Correct — Submit to Doctor</button>
    </div>
  );
};

// ─── Step 9: Confirmation ─────────────────────────────────────────────
const PatientConfirmation = ({ encounter, onNewPatient, lang }) => (
  <div className="center slide-up" style={{ flexDirection: 'column', minHeight: '65vh' }}>
    <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top, rgba(16,185,129,0.1), transparent 60%)', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 10px 20px rgba(16,185,129,0.4))' }}>✅</div>
        <h2 className="display-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('confirm_title', lang)}</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '3rem', fontSize: '1.1rem' }}>{t('confirm_subtitle', lang)}</p>

        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2) inset' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em', fontWeight: 600 }}>{t('confirm_token', lang)}</p>
          <p className="display-font" style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>CS-{encounter?.id || '000'}</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>{t('confirm_dept', lang)}</p>
          <p style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--emerald)' }}>{encounter?.clinical?.chief_complaint ? 'General OPD — Assessed' : 'General OPD'}</p>
        </div>

        <p style={{ color: 'var(--text-dim)', marginBottom: '3rem', lineHeight: 1.6, fontSize: '1.1rem' }}>{t('confirm_wait', lang)}</p>
        <button className="btn btn-ghost btn-xl" style={{ width: '100%' }} onClick={onNewPatient}>Start a new patient intake</button>
      </div>
    </div>
  </div>
);


// ─── Main Wizard ────────────────────────────────────────────────

export default function PatientFlow({ language: initialLang, onLanguageChange, onLogout }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(initialLang || 'en');
  const [patient, setPatient] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [encounter, setEncounter] = useState(null);
  const [error, setError] = useState('');

  const currentStep = STEPS[step];
  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));

  useEffect(() => { setLang(initialLang || 'en'); }, [initialLang]);

  const handleLanguage = (code) => { setLang(code); onLanguageChange?.(code); goNext(); };
  const handleConsent = () => goNext();
  const handleForm = async (data) => {
    try {
      await api.recordConsent({ phone: data.phone_number, scope: 'voice_recording,ai_processing,data_storage', consented: true });
      setPatient(data);
      goNext();
    } catch (e) {
      setError('We could not record consent. Please check the connection and try again.');
    }
  };
  const handleVoice = (text) => { setTranscript(text); goNext(); };
  const handleProcessingDone = async () => {
    try {
      const res = await api.createEncounter({ ...patient, transcript, language: lang });
      setEncounter(res.encounter);
      if (res.encounter?.followup?.question) { goNext(); } else { setStep(STEPS.indexOf('ocr')); }
    } catch (e) { setError(e.message); setStep(STEPS.indexOf('voice')); }
  };
  const handleFollowupAnswer = async (ans) => {
    if (!encounter) return goNext();
    try {
      const updated = await api.updateEncounter(encounter.id, { followup_answer: ans });
      setEncounter(updated);
      goNext();
    } catch (e) {
      setError('We could not save your answer. Please try again.');
    }
  };
  const handleOCR = async (data) => {
    if (!encounter) return goNext();
    try {
      const updated = await api.updateEncounter(encounter.id, { ocr_data: data });
      setEncounter(updated);
      goNext();
    } catch (e) {
      setError('We could not save prescription details. Please try again or skip this step.');
    }
  };
  const reset = () => { const nextLanguage = initialLang || 'en'; setStep(0); setLang(nextLanguage); onLanguageChange?.(nextLanguage); setPatient(null); setTranscript(''); setEncounter(null); setError(''); };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <StepIndicator current={step} total={STEPS.length} />
      {error && <div className="glass fade-in" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--crimson)', padding: '1rem', margin: '0 auto 2rem', border: '1px solid var(--crimson)', borderRadius: 'var(--radius-md)', maxWidth: '600px', textAlign: 'center' }}>Error: {error}</div>}

      <div className="container" style={{ flex: 1, paddingBottom: '4rem' }}>
        {currentStep === 'language' && <LanguageSelect onSelect={handleLanguage} lang={lang} />}
        {currentStep === 'consent' && <ConsentScreen onAccept={handleConsent} onDecline={onLogout} lang={lang} />}
        {currentStep === 'form' && <PatientForm onSubmit={handleForm} lang={lang} />}
        {currentStep === 'voice' && <VoiceRecorder onSubmit={handleVoice} lang={lang} patientName={patient?.patient_name || 'Patient'} />}
        {currentStep === 'processing' && <AIProcessingScreen text={transcript} onDone={handleProcessingDone} lang={lang} />}
        {currentStep === 'followup' && encounter?.followup && <FollowUpQuestion question={encounter.followup.question} reason={encounter.followup.reason} onAnswer={handleFollowupAnswer} onSkip={() => goNext()} lang={lang} />}
        {currentStep === 'ocr' && <OCRUpload onSkip={() => goNext()} onResult={handleOCR} lang={lang} />}
        {currentStep === 'summary' && <ClinicalSummary encounter={encounter} onContinue={goNext} lang={lang} />}
        {currentStep === 'confirmation' && <PatientConfirmation encounter={encounter} onNewPatient={reset} lang={lang} />}
      </div>
    </div>
  );
}
