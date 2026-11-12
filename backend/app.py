"""
CodeScribe AI — Backend Server
SIH2026 Problem Statement SIH26047 | Team Code Raiders
Flask REST API with SQLite, demo-mode services, and FHIR generation.
"""
import os
import json
from datetime import datetime
import pytz
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Encounter, AuditEvent, ConsentRecord
from demo_data import SCENARIOS, get_scenario, get_all_scenarios
from services.fhir_service import to_fhir

DEMO_MODE = os.environ.get('DEMO_MODE', 'true').lower() == 'true'
IST = pytz.timezone('Asia/Kolkata')

app = Flask(__name__)
cors_origins_env = os.environ.get('CORS_ORIGINS', '*').strip()
cors_origins = '*' if cors_origins_env == '*' else [o.strip() for o in cors_origins_env.split(',') if o.strip()]
CORS(app, resources={r"/api/*": {"origins": cors_origins}})
# Keep the existing on-disk database as the default, while allowing an isolated
# database to be selected for QA and deployment environments.
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///codescribe.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.after_request
def add_security_headers(response):
    """Attach baseline HTTP security headers to all API responses."""
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'DENY')
    response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response

@app.errorhandler(400)
def bad_request(_err):
    return jsonify({"error": "Bad request"}), 400

@app.errorhandler(404)
def not_found(_err):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(405)
def method_not_allowed(_err):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(500)
def internal_error(_err):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment platforms."""
    return jsonify({"status": "ok", "demo_mode": DEMO_MODE})

@app.route('/api/config', methods=['GET'])
def get_config():
    """Expose only the feature mode needed by the client UI."""
    return jsonify({"demo_mode": DEMO_MODE})

# ─── Encounter CRUD ────────────────────────────────────────────────

@app.route('/api/encounter', methods=['POST'])
def create_encounter():
    """Create a new encounter from patient flow data."""
    data = request.get_json(silent=True) or {}
    transcript = str(data.get('transcript') or '').strip()
    scenario_id = data.get('scenario_id')

    # If loading a demo scenario
    if scenario_id:
        scenario = get_scenario(scenario_id)
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        return _create_from_scenario(scenario)

    if not transcript:
        return jsonify({"error": "No transcript provided"}), 400

    language = str(data.get('language') or 'en').strip().lower()
    if language not in ('en', 'hi', 'kn'):
        language = 'en'
    patient_name = str(data.get('patient_name') or '').strip() or 'Unknown'

    # Process through clinical extraction (demo or real)
    clinical = _extract_clinical(transcript)
    ayush = _extract_ayush(transcript)
    followup = _generate_followup(clinical)

    enc = Encounter(
        patient_name=patient_name,
        patient_age=str(data.get('patient_age') or '').strip(),
        patient_gender=str(data.get('patient_gender') or '').strip(),
        phone_number=str(data.get('phone_number') or '').strip(),
        email_address=str(data.get('email_address') or '').strip(),
        language=language,
        raw_transcript=transcript,
        chief_complaint=clinical.get('chief_complaint', ''),
        hpi=clinical.get('hpi', ''),
        symptoms=json.dumps(clinical.get('symptoms', [])),
        duration=clinical.get('duration', ''),
        severity=clinical.get('severity', ''),
        associated_symptoms=clinical.get('associated_symptoms', ''),
        medications=clinical.get('medications', ''),
        allergies=clinical.get('allergies', ''),
        past_history=clinical.get('past_history', ''),
        red_flags=json.dumps(clinical.get('red_flags', [])),
        confidence_scores=json.dumps(clinical.get('confidence', {})),
        triage_level=clinical.get('triage_level', 'LOW'),
        patient_summary=clinical.get('patient_summary', ''),
        ayush_prakriti=ayush.get('prakriti', ''),
        ayush_vikriti=ayush.get('vikriti_dosha', ''),
        ayush_agni=ayush.get('agni_status', ''),
        ayush_recommendations=ayush.get('recommendations', ''),
        followup_question=followup.get('question') if followup else None,
        followup_reason=followup.get('reason') if followup else None,
        status='PENDING'
    )
    db.session.add(enc)
    db.session.commit()

    return jsonify({"encounter": enc.to_dict()}), 201


def _create_from_scenario(scenario):
    """Create an encounter from a demo scenario fixture."""
    ce = scenario['clinical_extraction']
    ayush = scenario.get('ayush', {})
    followup = scenario.get('followup')
    patient = scenario['patient']

    enc = Encounter(
        patient_name=patient['name'],
        patient_age=patient['age'],
        patient_gender=patient['gender'],
        phone_number=patient['phone'],
        email_address=patient['email'],
        language=scenario['language'],
        raw_transcript=scenario['transcript'],
        chief_complaint=ce.get('chief_complaint', ''),
        hpi=ce.get('hpi', ''),
        symptoms=json.dumps(ce.get('symptoms', [])),
        duration=ce.get('duration', ''),
        severity=ce.get('severity', ''),
        associated_symptoms=ce.get('associated_symptoms', ''),
        medications=ce.get('medications', ''),
        allergies=ce.get('allergies', ''),
        past_history=ce.get('past_history', ''),
        red_flags=json.dumps(ce.get('red_flags', [])),
        confidence_scores=json.dumps(ce.get('confidence', {})),
        triage_level=scenario['triage_level'],
        patient_summary=scenario['patient_summary'],
        ayush_prakriti=ayush.get('prakriti', ''),
        ayush_vikriti=ayush.get('vikriti_dosha', ''),
        ayush_agni=ayush.get('agni_status', ''),
        ayush_recommendations=ayush.get('recommendations', ''),
        ocr_data=json.dumps(scenario.get('ocr_data')) if scenario.get('ocr_data') else None,
        followup_question=followup['question'] if followup else None,
        followup_reason=followup['reason'] if followup else None,
        followup_answer=followup['answer'] if followup else None,
        status='PENDING',
        scenario_id=scenario['id']
    )
    db.session.add(enc)
    db.session.commit()
    return jsonify({"encounter": enc.to_dict()}), 201


@app.route('/api/encounter/<int:id>', methods=['GET'])
def get_encounter(id):
    enc = db.session.get(Encounter, id)
    if not enc:
        return jsonify({"error": "Not found"}), 404
    return jsonify(enc.to_dict())


@app.route('/api/encounters', methods=['GET'])
def get_encounters():
    """Get patient queue sorted by urgency."""
    status_filter = request.args.get('status', 'PENDING')
    query = Encounter.query
    if status_filter != 'ALL':
        query = query.filter_by(status=status_filter)
    encounters = query.all()

    priority_map = {'EMERGENCY': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    sorted_enc = sorted(encounters, key=lambda e: (priority_map.get(e.triage_level, 4), e.created_at))
    return jsonify([e.to_dict() for e in sorted_enc])


@app.route('/api/encounter/<int:id>', methods=['PATCH'])
def update_encounter(id):
    """Doctor edits a field — creates audit event."""
    enc = db.session.get(Encounter, id)
    if not enc:
        return jsonify({"error": "Not found"}), 404

    data = request.json or {}
    editable_fields = [
        'chief_complaint', 'hpi', 'symptoms', 'duration', 'severity',
        'associated_symptoms', 'medications', 'allergies', 'past_history',
        'red_flags', 'triage_level', 'patient_summary',
        'ayush_prakriti', 'ayush_vikriti', 'ayush_agni', 'ayush_recommendations',
        'followup_answer', 'ocr_data', 'status'
    ]

    for field in editable_fields:
        if field in data:
            old_val = getattr(enc, field, None)
            new_val = data[field]
            if isinstance(new_val, (list, dict)):
                new_val = json.dumps(new_val)

            if str(old_val) != str(new_val):
                audit = AuditEvent(
                    encounter_id=enc.id,
                    actor=data.get('actor', 'doctor'),
                    field_name=field,
                    old_value=str(old_val) if old_val else '',
                    new_value=str(new_val)
                )
                db.session.add(audit)
                setattr(enc, field, new_val)

    db.session.commit()
    return jsonify(enc.to_dict())


@app.route('/api/encounter/<int:id>/approve', methods=['PATCH'])
def approve_encounter(id):
    """Doctor approves the encounter."""
    enc = db.session.get(Encounter, id)
    if not enc:
        return jsonify({"error": "Not found"}), 404

    enc.doctor_approved = True
    enc.doctor_approved_at = datetime.now(IST)
    enc.status = 'COMPLETED'

    audit = AuditEvent(
        encounter_id=enc.id,
        actor='doctor',
        field_name='doctor_approved',
        old_value='false',
        new_value='true'
    )
    db.session.add(audit)

    # Generate FHIR record on approval
    enc.fhir_record = json.dumps(to_fhir(enc.to_dict()))

    db.session.commit()
    return jsonify(enc.to_dict())


@app.route('/api/encounter/<int:id>/audit', methods=['GET'])
def get_audit_trail(id):
    events = AuditEvent.query.filter_by(encounter_id=id).order_by(AuditEvent.timestamp.desc()).all()
    return jsonify([e.to_dict() for e in events])


@app.route('/api/encounter/<int:id>/fhir', methods=['GET'])
def get_fhir(id):
    enc = db.session.get(Encounter, id)
    if not enc:
        return jsonify({"error": "Not found"}), 404

    fhir = to_fhir(enc.to_dict())
    return jsonify(fhir)


# ─── Consent ─────────────────────────────────────────────────────

@app.route('/api/consent', methods=['POST'])
def record_consent():
    data = request.json or {}
    consent = ConsentRecord(
        patient_phone=data.get('phone', ''),
        scope=data.get('scope', 'voice_recording,ai_processing,data_storage'),
        consented=data.get('consented', True)
    )
    db.session.add(consent)
    db.session.commit()
    return jsonify(consent.to_dict()), 201


# ─── Patient History ─────────────────────────────────────────────

@app.route('/api/patient/<phone>/history', methods=['GET'])
def get_patient_history(phone):
    encounters = Encounter.query.filter_by(phone_number=phone).order_by(Encounter.created_at.desc()).all()
    return jsonify([e.to_dict() for e in encounters])


# ─── Analytics ───────────────────────────────────────────────────

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Returns dashboard metrics. Values are simulated in demo mode."""
    total = Encounter.query.count()
    completed = Encounter.query.filter_by(status='COMPLETED').count()
    pending = Encounter.query.filter_by(status='PENDING').count()
    emergency = Encounter.query.filter_by(triage_level='EMERGENCY').count()

    # Language distribution
    lang_counts = {}
    for enc in Encounter.query.all():
        lang = enc.language or 'en'
        lang_counts[lang] = lang_counts.get(lang, 0) + 1

    # Triage distribution
    triage_counts = {}
    for enc in Encounter.query.all():
        t = enc.triage_level or 'LOW'
        triage_counts[t] = triage_counts.get(t, 0) + 1

    return jsonify({
        "simulated_disclaimer": "All metrics below are simulated for hackathon demonstration purposes.",
        "total_patients": total,
        "completed": completed,
        "pending": pending,
        "emergency_count": emergency,
        "avg_intake_duration_seconds": 58 if total > 0 else 0,
        "target_intake_duration_seconds": 60,
        "voice_vs_touch_ratio": {"voice": 72, "touch": 28},
        "language_distribution": lang_counts,
        "triage_distribution": triage_counts,
        "ocr_usage_rate": 20,
        "doctor_correction_rate": 15,
        "ai_confidence_avg": 82,
        "throughput_improvement_target": "+40%"
    })


# ─── Demo Control ────────────────────────────────────────────────

@app.route('/api/demo/scenarios', methods=['GET'])
def list_scenarios():
    return jsonify(get_all_scenarios())


@app.route('/api/demo/load/<scenario_id>', methods=['POST'])
def load_scenario(scenario_id):
    scenario = get_scenario(scenario_id)
    if not scenario:
        return jsonify({"error": "Scenario not found"}), 404
    return _create_from_scenario(scenario)


@app.route('/api/demo/reset', methods=['POST'])
def reset_demo():
    """Clear all data for a fresh demo."""
    AuditEvent.query.delete()
    ConsentRecord.query.delete()
    Encounter.query.delete()
    db.session.commit()
    return jsonify({"message": "Demo data cleared"})


# ─── Clinical Extraction (mock / real) ───────────────────────────

def _extract_clinical(text):
    """Extract structured clinical data from transcript."""
    if DEMO_MODE:
        return _mock_clinical(text)
    # TODO: Real LLM implementation
    return _mock_clinical(text)


def _extract_ayush(text):
    """Extract Ayush assessment from transcript."""
    if DEMO_MODE:
        return _mock_ayush(text)
    return _mock_ayush(text)


def _generate_followup(clinical):
    """Generate follow-up question based on clinical findings."""
    if DEMO_MODE:
        return _mock_followup(clinical)
    return _mock_followup(clinical)


def _mock_clinical(text):
    t = text.lower()
    
    # Base dynamic response
    resp = {
        "chief_complaint": text if len(text) < 50 else text[:47] + '...',
        "hpi": f"Patient presenting with symptoms: {text}",
        "symptoms": [],
        "duration": "Not specified",
        "severity": "Moderate — 5/10",
        "associated_symptoms": "None",
        "medications": "None reported",
        "allergies": "None reported",
        "past_history": "None reported",
        "red_flags": [],
        "confidence": {
            "chief_complaint": 0.85, "hpi": 0.85, "symptoms": 0.85,
            "duration": 0.85, "severity": 0.85
        },
        "triage_level": "LOW",
        "patient_summary": f"Patient reports: {text}. Routed for routine evaluation."
    }

    # 1. Stomach / Vomiting
    if any(term in t for term in ('stomach', 'abdomin', 'vomit', 'पेट', 'उल्टी', 'ಹೊಟ್ಟೆ', 'ವಾಂತಿ')):
        resp['chief_complaint'] = "Abdominal pain and vomiting"
        resp['symptoms'] = ["Abdominal pain", "Vomiting"]
        resp['triage_level'] = "MEDIUM"
        if 'yesterday' in t or '1 day' in t:
            resp['duration'] = "1 day"
            
    # 2. Fever / Headache
    elif any(term in t for term in ('fever', 'headache', 'bukhar', 'बुखार', 'सिरदर्द', 'ಜ್ವರ', 'ತಲೆನೋವು')):
        resp['chief_complaint'] = "Fever and headache"
        resp['symptoms'] = ["Fever", "Headache"]
        resp['triage_level'] = "MEDIUM"
        if 'two days' in t or '2 days' in t:
            resp['duration'] = "2 days"

    # 3. Shoulder
    elif any(term in t for term in ('shoulder', 'कंध', 'ಭುಜ')):
        resp['chief_complaint'] = "Right shoulder pain" if 'right' in t else "Shoulder pain"
        resp['symptoms'] = [resp['chief_complaint']]

    # 4. Knee
    elif any(term in t for term in ('knee', 'joint', 'घुटन', 'जोड़', 'ಮೊಣಕಾಲ', 'ಕೀಲು')):
        resp['chief_complaint'] = "Left knee pain" if 'left' in t else "Knee pain"
        resp['symptoms'] = [resp['chief_complaint']]

    # 5. Chest / Emergency
    elif any(term in t for term in ('chest', 'heart', 'pressure', 'छाती', 'सीने', 'दिल', 'दबाव', 'ಎದೆ', 'ಹೃದಯ', 'ಒತ್ತಡ')):
        resp['chief_complaint'] = "Chest pain"
        resp['symptoms'] = ["Chest pain"]
        resp['triage_level'] = "EMERGENCY"
        resp['red_flags'] = ["Possible cardiac event", "Requires immediate ECG"]

    # 6. Kannada
    elif any(c in t for c in 'ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹಳ'):
        resp['chief_complaint'] = "Symptoms reported in Kannada"
        resp['symptoms'] = ["Kannada input"]

    else:
        # For simple touch fallbacks like "General Unwellness"
        resp['chief_complaint'] = text
        resp['symptoms'] = [text]

    return resp


def _mock_ayush(text):
    t = text.lower()
    resp = {
        "prakriti": "Vata-Pitta",
        "vikriti_dosha": "Tridosha imbalance",
        "agni_status": "Vishamagni (Irregular digestion)",
        "recommendations": "General dietary modifications and rest."
    }
    
    if any(term in t for term in ('chest', 'heart', 'छाती', 'सीने', 'दिल', 'ಎದೆ', 'ಹೃದಯ')):
        resp['vikriti_dosha'] = "Prana Vata and Vyana Vata imbalance"
        resp['recommendations'] = "Urgent medical referral. Avoid heavy foods."
    elif any(term in t for term in ('fever', 'headache', 'bukhar', 'बुखार', 'सिरदर्द', 'ಜ್ವರ', 'ತಲೆನೋವು')):
        resp['prakriti'] = "Pitta"
        resp['vikriti_dosha'] = "Pitta aggravation"
        resp['agni_status'] = "Tikshnagni (Hyperactive digestion)"
        resp['recommendations'] = "Cooling herbs, hydration, avoid spicy foods."
    elif any(term in t for term in ('stomach', 'vomit', 'पेट', 'उल्टी', 'ಹೊಟ್ಟೆ', 'ವಾಂತಿ')):
        resp['vikriti_dosha'] = "Saman Vata and Pachaka Pitta imbalance"
        resp['agni_status'] = "Mandagni (Low digestive fire)"
        resp['recommendations'] = "Light easily digestible food (Khichdi). Ginger water."
    elif any(term in t for term in ('knee', 'shoulder', 'joint', 'घुटन', 'कंध', 'जोड़', 'ಮೊಣಕಾಲ', 'ಕೀಲು', 'ಭುಜ')):
        resp['vikriti_dosha'] = "Vata aggravation in Sandhigata (joints)"
        resp['recommendations'] = "Warm oil application. Avoid cold foods."
        
    return resp


def _mock_followup(clinical):
    cc = (clinical.get('chief_complaint', '') or '').lower()
    if 'chest' in cc:
        return None  # Emergency — no follow-up
    elif 'fever' in cc:
        return {
            "question": "Is the fever continuous throughout the day, or does it come and go with chills and sweating?",
            "reason": "Differentiating between viral fever (continuous) and malaria/dengue (intermittent with rigors)."
        }
    elif 'stomach' in cc or 'vomit' in cc:
        return {
            "question": "Does the pain move anywhere else, and is the vomit yellowish or food particles?",
            "reason": "Checking for biliary/pancreatic involvement vs simple gastroenteritis."
        }
    elif 'knee' in cc or 'shoulder' in cc or 'joint' in cc:
        return {
            "question": "Does the stiffness improve after moving around, or does it get worse?",
            "reason": "Distinguishing inflammatory vs mechanical joint pain."
        }
    return {
        "question": "Are there any other symptoms you haven't mentioned yet?",
        "reason": "Ensuring complete history collection."
    }


# ─── Legacy compatibility ────────────────────────────────────────

@app.route('/api/transcribe', methods=['POST'])
def legacy_transcribe():
    """Backward-compatible endpoint."""
    return create_encounter()


@app.route('/api/queue', methods=['GET'])
def legacy_queue():
    """Backward-compatible endpoint."""
    return get_encounters()


@app.route('/api/queue/<int:id>/status', methods=['PATCH'])
def legacy_update_status(id):
    """Backward-compatible endpoint."""
    data = request.json or {}
    enc = db.session.get(Encounter, id)
    if not enc:
        return jsonify({"error": "Not found"}), 404
    enc.status = data.get('status', 'COMPLETED')
    if enc.status == 'COMPLETED':
        enc.doctor_approved = True
        enc.doctor_approved_at = datetime.now(IST)
        enc.fhir_record = json.dumps(to_fhir(enc.to_dict()))
    db.session.commit()
    return jsonify(enc.to_dict())


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"\n[CodeScribe AI Backend] DEMO_MODE={'ON' if DEMO_MODE else 'OFF'}")
    print(f"   SIH2026 | Team Code Raiders | Problem SIH26047\n")
    app.run(host='0.0.0.0', port=port, debug=debug)
