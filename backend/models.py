import json
import pytz
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def get_ist_now():
    return datetime.now(pytz.timezone('Asia/Kolkata'))

def _safe_json(val):
    """Parse a JSON-encoded column value, falling back to the raw value."""
    if val is None:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val

class Encounter(db.Model):
    __tablename__ = 'encounters'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=get_ist_now)

    # Patient profile
    patient_name = db.Column(db.String(100), nullable=False)
    patient_age = db.Column(db.String(10))
    patient_gender = db.Column(db.String(20))
    phone_number = db.Column(db.String(20))
    email_address = db.Column(db.String(100))
    language = db.Column(db.String(10), default='en')

    # Raw input
    raw_transcript = db.Column(db.Text, nullable=False)

    # Structured clinical (AI-generated)
    chief_complaint = db.Column(db.String(200))
    hpi = db.Column(db.Text)
    symptoms = db.Column(db.Text)        # JSON array
    duration = db.Column(db.String(100))
    severity = db.Column(db.String(100))
    associated_symptoms = db.Column(db.Text)
    medications = db.Column(db.Text)
    allergies = db.Column(db.Text)
    past_history = db.Column(db.Text)
    red_flags = db.Column(db.Text)       # JSON array
    confidence_scores = db.Column(db.Text) # JSON object

    # Triage
    triage_level = db.Column(db.String(20), default='LOW')
    patient_summary = db.Column(db.Text)

    # Ayush
    ayush_prakriti = db.Column(db.String(200))
    ayush_vikriti = db.Column(db.String(200))
    ayush_agni = db.Column(db.String(200))
    ayush_recommendations = db.Column(db.Text)

    # OCR
    ocr_data = db.Column(db.Text)  # JSON

    # FHIR
    fhir_record = db.Column(db.Text)  # JSON

    # Follow-up
    followup_question = db.Column(db.Text)
    followup_reason = db.Column(db.Text)
    followup_answer = db.Column(db.Text)

    # Status
    status = db.Column(db.String(20), default='PENDING')
    doctor_approved = db.Column(db.Boolean, default=False)
    doctor_approved_at = db.Column(db.DateTime)

    # Scenario tag (for demo)
    scenario_id = db.Column(db.String(50))

    # Relationships
    audit_events = db.relationship('AuditEvent', backref='encounter', lazy=True, cascade='all, delete-orphan')
    consent_records = db.relationship('ConsentRecord', backref='encounter', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'patient': {
                'name': self.patient_name,
                'age': self.patient_age,
                'gender': self.patient_gender,
                'phone': self.phone_number,
                'email': self.email_address,
            },
            'language': self.language,
            'raw_transcript': self.raw_transcript,
            'clinical': {
                'chief_complaint': self.chief_complaint,
                'hpi': self.hpi,
                'symptoms': _safe_json(self.symptoms),
                'duration': self.duration,
                'severity': self.severity,
                'associated_symptoms': self.associated_symptoms,
                'medications': self.medications,
                'allergies': self.allergies,
                'past_history': self.past_history,
                'red_flags': _safe_json(self.red_flags),
                'confidence': _safe_json(self.confidence_scores),
            },
            'triage_level': self.triage_level,
            'patient_summary': self.patient_summary,
            'ayush': {
                'prakriti': self.ayush_prakriti,
                'vikriti_dosha': self.ayush_vikriti,
                'agni_status': self.ayush_agni,
                'recommendations': self.ayush_recommendations,
            },
            'ocr_data': _safe_json(self.ocr_data),
            'fhir_record': _safe_json(self.fhir_record),
            'followup': {
                'question': self.followup_question,
                'reason': self.followup_reason,
                'answer': self.followup_answer,
            } if self.followup_question else None,
            'status': self.status,
            'doctor_approved': self.doctor_approved,
            'doctor_approved_at': self.doctor_approved_at.isoformat() if self.doctor_approved_at else None,
            'scenario_id': self.scenario_id,
        }


class AuditEvent(db.Model):
    __tablename__ = 'audit_events'
    id = db.Column(db.Integer, primary_key=True)
    encounter_id = db.Column(db.Integer, db.ForeignKey('encounters.id'), nullable=False)
    actor = db.Column(db.String(100), nullable=False, default='doctor')
    field_name = db.Column(db.String(100), nullable=False)
    old_value = db.Column(db.Text)
    new_value = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'encounter_id': self.encounter_id,
            'actor': self.actor,
            'field_name': self.field_name,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
        }


class ConsentRecord(db.Model):
    __tablename__ = 'consent_records'
    id = db.Column(db.Integer, primary_key=True)
    encounter_id = db.Column(db.Integer, db.ForeignKey('encounters.id'), nullable=True)
    patient_phone = db.Column(db.String(20))
    scope = db.Column(db.String(200), default='voice_recording,ai_processing,data_storage')
    consented = db.Column(db.Boolean, default=True)
    timestamp = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'encounter_id': self.encounter_id,
            'patient_phone': self.patient_phone,
            'scope': self.scope,
            'consented': self.consented,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
        }
