# CodeScribe AI — Multilingual Clinical Case-Taking Kiosk

**Smart India Hackathon 2026** · Problem Statement SIH26047 · Team Code Raiders

> ⚠️ This is a hackathon prototype. Not deployed in any hospital. Not clinically validated.

## What Is This?

CodeScribe AI is a multilingual patient case-taking kiosk for Hospital OPDs. Patients describe symptoms via voice (Hindi, English, Kannada) or touch. AI structures the information into a clinical summary with confidence indicators. Doctors review, edit, approve, and generate interoperability-ready records.

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8, CSS Variables |
| Backend | Flask 3, SQLAlchemy, SQLite |
| AI Services | Mock (DEMO_MODE) / Real (LLM) |
| Interop | FHIR R4 / ABDM-shaped records |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
python app.py
```
Server runs at http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at http://localhost:5173

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| DEMO_MODE | `true` | Set to `false` to use real AI services |
| DATABASE_URL | `sqlite:///codescribe.db` | SQLAlchemy database connection URI |
| CORS_ORIGINS | `*` | Comma-separated allowed frontend origins |
| PORT | `5000` | Backend server port |
| FLASK_DEBUG | `false` | Set to `true` only for local development |
| VITE_API_BASE_URL | `http://localhost:5000/api` | Backend API base URL for Vite frontend |
| OPENAI_API_KEY | — | Required only when DEMO_MODE=false |

### Deployment
- **Backend:** Deploy `backend/` with `Procfile` (`gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4`). Health check endpoint: `GET /api/health`.
- **Frontend:** Deploy `frontend/` (`npm run build`, output `dist/`) with `vercel.json` SPA rewrites and `VITE_API_BASE_URL` pointing to the deployed backend API.

## Demo Mode

By default, `DEMO_MODE=true`. All AI services return deterministic fixture data for 5 fictional scenarios. No API keys needed.

### 5 Demo Scenarios
1. **Lakshmi N. (34, Kannada)** — Joint pain, full voice flow
2. **Rohan Mehta (27, Hindi)** — Fever + headache, triggers follow-up question
3. **Abdul Rahman (58)** — Prescription OCR, Metformin dosage flagged low-confidence
4. **Priya S. (45)** — Vague complaint, multiple missing fields
5. **Arjun K. (61)** — Chest pain emergency, red-flag banner

### Demo Control Center
Navigate to Demo Control from the landing page to instantly load any scenario.

## Core Flow
1. Landing → Select Patient Kiosk
2. Language selection (EN / HI / KN)
3. Consent screen
4. Patient form
5. Voice recording with live waveform
6. AI processing with staged animation
7. Follow-up question with visible reasoning
8. Optional OCR prescription upload
9. Clinical summary with confidence badges
10. Patient confirmation with token number
11. Doctor reviews case with AI badges
12. Doctor inline-edits fields (creates audit trail)
13. Doctor approves → FHIR record generated
14. Analytics dashboard (simulated metrics)

## Safety
- Every AI field carries "AI-Generated" badge until doctor verification
- System never uses diagnostic or prescriptive language
- Every doctor edit creates an immutable audit event
- Missing/low-confidence fields are visibly flagged, never hidden
- Red flags are surfaced for urgent review, never as diagnoses

## Known Limitations
- Web Speech API requires Chrome/Edge
- OCR is simulated in DEMO_MODE
- FHIR records are structurally shaped but not validated against a FHIR server
- Analytics metrics are fixture-based
- Not tested for production hospital deployment
