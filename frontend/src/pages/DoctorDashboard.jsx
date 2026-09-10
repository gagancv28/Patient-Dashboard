import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { t } from '../i18n';

const formatIST = (iso) => {
  try { return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'; }
  catch { return iso; }
};
const relTime = (iso) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'Just now'; if (s < 3600) return `${Math.round(s/60)} min ago`;
  return `${Math.round(s/3600)} hr ago`;
};

const ConfBar = ({ val }) => {
  const v = Math.round((val||0)*100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100px' }}>
      <div className="confidence-bar">
        <div className={`confidence-fill ${v>=80?'conf-high':v>=50?'conf-med':'conf-low'}`} style={{ width: `${v}%` }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{v}%</span>
    </div>
  );
};

export default function DoctorDashboard({ language }) {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('western');
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [audit, setAudit] = useState([]);
  const [fhir, setFhir] = useState(null);
  const [showFhir, setShowFhir] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchQueue = async () => {
    try { const d = await api.getQueue(); setQueue(d); if (!selected && d.length) setSelected(d[0]); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); const i = setInterval(fetchQueue, 3000); return () => clearInterval(i); }, []);

  useEffect(() => {
    if (selected?.patient?.phone) {
      api.getPatientHistory(selected.patient.phone).then(setHistory).catch(() => {});
      api.getAuditTrail(selected.id).then(setAudit).catch(() => {});
    }
  }, [selected?.id]);

  const handleApprove = async (id) => {
    await api.approveEncounter(id);
    setSelected(null); fetchQueue();
  };

  const handleEdit = async (id, field) => {
    await api.updateEncounter(id, { [field]: editVal, actor: 'Dr. Sharma (Demo)' });
    setEditing(null); setEditVal('');
    const updated = await api.getEncounter(id);
    setSelected(updated);
    api.getAuditTrail(id).then(setAudit);
  };

  const showFhirView = async (id) => {
    const f = await api.getFHIR(id); setFhir(f); setShowFhir(true);
  };

  const criticalCount = queue.filter(e => e.triage_level === 'EMERGENCY' || e.triage_level === 'HIGH').length;

  if (loading) return <div className="center" style={{ minHeight: '60vh' }}><div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--blue)', borderRadius: '50%' }} /></div>;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 100px)', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* LEFT: Queue List */}
      <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Stats Banner */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="display-font" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{queue.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('doc_total', language)}</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="display-font" style={{ fontSize: '1.8rem', fontWeight: 700, color: criticalCount > 0 ? 'var(--crimson)' : 'var(--text)' }}>{criticalCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('doc_critical', language)}</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="display-font" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--emerald)' }}>{queue.length > 0 ? '~5m' : '--'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('doc_avg_wait', language)}</div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {queue.length === 0 ? (
            <div className="center glass" style={{ padding: '3rem 1rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', opacity: 0.5 }}>☕</span>
              <p>Queue is empty.<br/>Waiting for new patients.</p>
            </div>
          ) : queue.map(enc => {
            const isActive = selected?.id === enc.id;
            const triage = enc.triage_level || 'LOW';
            const glowCls = triage === 'EMERGENCY' ? 'glow-emergency' : triage === 'HIGH' ? 'glow-high' : '';
            return (
              <div key={enc.id} className={`glass ${glowCls}`}
                onClick={() => { setSelected(enc); setShowFhir(false); setShowAudit(false); }}
                style={{ padding: '1.25rem', cursor: 'pointer', borderLeft: isActive ? '4px solid var(--blue)' : '4px solid transparent', background: isActive ? 'rgba(30,41,59,0.9)' : 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong className="display-font" style={{ fontSize: '1.1rem' }}>{enc.patient?.name}</strong>
                  <span className={`triage-pill triage-${triage.toLowerCase()}`}>{triage}</span>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{enc.clinical?.chief_complaint || 'Pending analysis...'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span>CS-{enc.id}</span>
                  <span>{relTime(enc.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Case Detail */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        {!selected ? (
          <div className="center glass-panel" style={{ height: '100%', color: 'var(--text-dim)', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontSize: '4rem', opacity: 0.5 }}>🩺</span>
            <p className="display-font" style={{ fontSize: '1.5rem' }}>Select a patient from the queue</p>
          </div>
        ) : (
          <div className="stack gap-3 fade-in">
            
            {/* Red Flag Banner */}
            {selected.clinical?.red_flags?.length > 0 && (
              <div className="pulse-danger" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }}>🚨</span>
                <div>
                  <strong className="display-font" style={{ color: 'var(--crimson)', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>{t('doc_red_flag', language)}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selected.clinical.red_flags.map((f,i) => <span key={i} className="badge badge-danger">{f}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* Main Header */}
            <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.05))`, zIndex: 0 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h2 className="display-font" style={{ fontSize: '2.2rem', margin: 0 }}>{selected.patient?.name}</h2>
                    <span className={`triage-pill triage-${(selected.triage_level||'low').toLowerCase()}`} style={{ fontSize: '0.85rem' }}>{selected.triage_level}</span>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>
                    {selected.patient?.age} yrs · {selected.patient?.gender} · ID: CS-{selected.id} · {formatIST(selected.created_at)}
                  </p>
                </div>
                {selected.doctor_approved && (
                  <div className="badge badge-verified" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>✓ Doctor Verified</div>
                )}
              </div>

              {/* AI Narrative Summary */}
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--blue)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <span className="badge badge-ai">AI Case Synthesis</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-generated from patient voice</span>
                </div>
                <p style={{ fontStyle: 'italic', lineHeight: 1.7, fontSize: '1.1rem', color: 'var(--text-dim)' }}>"{selected.patient_summary}"</p>
              </div>
            </div>

            {/* View Toggles */}
            <div className="glass" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}>
              <button className={`btn ${viewMode==='western'?'btn-blue':'btn-ghost'}`} style={{ flex: 1 }} onClick={() => {setViewMode('western');setShowFhir(false);setShowAudit(false);}}>{t('doc_western', language)}</button>
              <button className={`btn ${viewMode==='ayush'?'btn-emerald':'btn-ghost'}`} style={{ flex: 1 }} onClick={() => {setViewMode('ayush');setShowFhir(false);setShowAudit(false);}}>{t('doc_ayush', language)}</button>
              <div style={{ width: '2px', background: 'var(--border)', margin: '0 0.5rem' }} />
              <button className={`btn ${showAudit?'btn-purple':'btn-ghost'}`} style={{ padding: '0.75rem 1.5rem' }} onClick={() => {setShowAudit(!showAudit);setShowFhir(false);}}>Audit Trail</button>
              <button className={`btn ${showFhir?'btn-purple':'btn-ghost'}`} style={{ padding: '0.75rem 1.5rem' }} onClick={() => showFhirView(selected.id)}>FHIR Record</button>
            </div>

            {/* FHIR View */}
            {showFhir && fhir && (
              <div className="glass-panel slide-up" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="display-font" style={{ fontSize: '1.5rem' }}>FHIR R4 Bundle <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 400 }}>(ABDM Profile)</span></h3>
                  <span className="badge badge-info">Sandbox Endpoint</span>
                </div>
                <pre style={{ background: '#000', padding: '1.5rem', borderRadius: 'var(--radius-sm)', overflow: 'auto', maxHeight: '500px', fontSize: '0.85rem', color: '#6ee7b7', border: '1px solid var(--border)' }}>
                  {JSON.stringify(fhir, null, 2)}
                </pre>
              </div>
            )}

            {/* Audit Trail */}
            {showAudit && (
              <div className="glass-panel slide-up" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 className="display-font" style={{ fontSize: '1.5rem' }}>Immutable Audit Trail</h3>
                  <span className="badge badge-warning">Medico-legal Log</span>
                </div>
                {audit.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No modifications recorded.</div> : (
                  <div className="stack gap-3">
                    {audit.map(a => (
                      <div key={a.id} style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>👨‍⚕️</span>
                            <strong style={{ color: 'var(--text)' }}>{a.actor}</strong> modified <span className="badge badge-info">{a.field_name}</span>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{formatIST(a.timestamp)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ flex: 1, color: 'var(--crimson)', textDecoration: 'line-through', fontSize: '0.9rem' }}>{a.old_value || '(empty)'}</div>
                          <span style={{ color: 'var(--text-muted)' }}>→</span>
                          <div style={{ flex: 1, color: 'var(--emerald)', fontSize: '0.9rem' }}>{a.new_value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Clinical Fields (Western) */}
            {!showFhir && !showAudit && viewMode === 'western' && (
              <div className="glass-panel slide-up" style={{ padding: '2rem' }}>
                <h3 className="display-font" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--blue)' }}>Structured Assessment (SOCRATES)</h3>
                
                {/* Symptoms Tags */}
                {selected.clinical?.symptoms?.length > 0 && (
                  <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Extracted Symptoms</span>
                      <span className="badge badge-ai">AI-Generated</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {selected.clinical.symptoms.map((s,i) => <span key={i} className="badge badge-info" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>{s}</span>)}
                    </div>
                  </div>
                )}

                <div className="stack gap-4">
                  {[{k:'chief_complaint',l:'Chief Complaint'},{k:'hpi',l:'History of Present Illness'},{k:'duration',l:'Duration'},{k:'severity',l:'Severity'},{k:'associated_symptoms',l:'Associated Symptoms'},{k:'medications',l:'Medications'},{k:'allergies',l:'Allergies'},{k:'past_history',l:'Past History'}].map(({k,l}) => {
                    const val = selected.clinical?.[k];
                    const conf = selected.clinical?.confidence?.[k];
                    const isMissing = !val || val === 'Not obtained' || val === 'Not obtained — emergent presentation';
                    const isEditing = editing === k;

                    return (
                      <div key={k} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{l}</span>
                            {selected.doctor_approved ? <span className="badge badge-verified">Verified</span> : isMissing ? <span className="badge badge-warning">Needs Review</span> : <span className="badge badge-ai">AI</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {conf !== undefined && <ConfBar val={conf} />}
                            {!selected.doctor_approved && !isEditing && <button className="btn btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => { setEditing(k); setEditVal(val || ''); }}>Edit</button>}
                          </div>
                        </div>
                        {isEditing ? (
                          <div className="fade-in" style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blue)' }}>
                            <input className="input" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ margin: 0 }} autoFocus />
                            <button className="btn btn-blue" onClick={() => handleEdit(selected.id, k)}>Save to Audit Log</button>
                            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ padding: '1rem', background: isMissing ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: isMissing ? 'rgba(245,158,11,0.2)' : 'var(--border-light)', color: isMissing ? 'var(--amber)' : 'var(--text)', fontStyle: isMissing ? 'italic' : 'normal', lineHeight: 1.6 }}>
                            {isMissing ? '⚠ ' + (val || 'Missing — please collect during consultation') : (typeof val === 'string' ? val : JSON.stringify(val))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Follow-up / OCR Sections inside Western view */}
                {(selected.followup?.question || selected.ocr_data) && <hr style={{ border: 0, borderBottom: '1px dashed var(--border)', margin: '3rem 0' }} />}
                
                {/* Follow-up Info */}
                {selected.followup?.question && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 className="display-font" style={{ color: 'var(--purple)', marginBottom: '1rem', fontSize: '1.25rem' }}>AI Follow-Up Interaction</h4>
                    <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong style={{ color: '#c4b5fd', marginRight: '0.5rem' }}>Q:</strong> {selected.followup.question}</p>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>Reason: {selected.followup.reason}</p>
                      {selected.followup.answer ? (
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--emerald)' }}>
                          <p style={{ color: 'var(--emerald)' }}><strong>A:</strong> <span style={{ color: 'var(--text)' }}>{selected.followup.answer}</span></p>
                        </div>
                      ) : <span className="badge badge-warning">Patient Skipped</span>}
                    </div>
                  </div>
                )}

                {/* OCR Data */}
                {selected.ocr_data && (
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 className="display-font" style={{ color: 'var(--emerald)', fontSize: '1.25rem', margin: 0 }}>OCR Prescription Data</h4>
                      <span className="badge badge-warning">Verify before use</span>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {selected.ocr_data.medications?.map((m, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{m.name}</strong>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{m.dosage}</p>
                          </div>
                          <ConfBar val={m.confidence} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ayush View */}
            {!showFhir && !showAudit && viewMode === 'ayush' && (
              <div className="glass-panel slide-up" style={{ padding: '2rem' }}>
                <h3 className="display-font" style={{ color: 'var(--emerald)', marginBottom: '2rem', fontSize: '1.5rem' }}>Dashavidha Pariksha Assessment</h3>
                <div className="stack gap-4">
                  {[{k:'prakriti',l:'Prakriti (Constitution)'},{k:'vikriti_dosha',l:'Vikriti (Dosha Imbalance)'},{k:'agni_status',l:'Agni (Digestive Fire)'},{k:'recommendations',l:'Recommended Intervention'}].map(({k,l}) => (
                    <div key={k}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#6ee7b7', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{l}</span>
                        <span className="badge badge-ai">AI-Generated</span>
                      </div>
                      <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--text)', lineHeight: 1.6 }}>
                        {selected.ayush?.[k] || 'Not assessed'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Longitudinal Timeline */}
            {history.filter(h => h.id !== selected.id).length > 0 && (
              <div className="glass" style={{ padding: '2rem', marginTop: '1rem' }}>
                <h4 className="display-font" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Patient Visit History</h4>
                <div className="stack gap-2">
                  {history.filter(h => h.id !== selected.id).map(h => (
                    <div key={h.id} style={{ display: 'flex', gap: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', alignItems: 'center', borderLeft: '3px solid var(--emerald)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '100px', fontWeight: 600 }}>{formatIST(h.created_at).split(',')[0]}</span>
                      <strong style={{ flex: 1, color: 'var(--text)' }}>{h.clinical?.chief_complaint || 'General Visit'}</strong>
                      <span className="badge badge-verified">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approve Action */}
            {!selected.doctor_approved && (
              <div className="glass slide-up" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))', borderColor: 'rgba(16,185,129,0.3)' }}>
                <div>
                  <h4 style={{ color: 'var(--emerald)', margin: 0 }}>Ready for Approval</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Approving will lock the record and generate a FHIR Bundle.</p>
                </div>
                <button className="btn btn-emerald btn-xl" onClick={() => handleApprove(selected.id)}>
                  ✓ Approve & Generate Record
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
