const BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Encounters
  createEncounter: (data) => request('/encounter', { method: 'POST', body: JSON.stringify(data) }),
  getEncounter: (id) => request(`/encounter/${id}`),
  getQueue: (status = 'PENDING') => request(`/encounters?status=${status}`),
  updateEncounter: (id, data) => request(`/encounter/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  approveEncounter: (id) => request(`/encounter/${id}/approve`, { method: 'PATCH' }),
  getAuditTrail: (id) => request(`/encounter/${id}/audit`),
  getFHIR: (id) => request(`/encounter/${id}/fhir`),

  // Patient
  getPatientHistory: (phone) => request(`/patient/${phone}/history`),

  // Consent
  recordConsent: (data) => request('/consent', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Demo
  getScenarios: () => request('/demo/scenarios'),
  loadScenario: (id) => request(`/demo/load/${id}`, { method: 'POST' }),
  resetDemo: () => request('/demo/reset', { method: 'POST' }),
};
