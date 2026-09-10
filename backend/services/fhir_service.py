"""
FHIR Service — Generates FHIR-shaped records from clinical data.
Demo mode returns a structured FHIR Bundle.
"""
import json
from datetime import datetime

def to_fhir(encounter_dict):
    """Convert an encounter dict to a FHIR-shaped Bundle."""
    patient = encounter_dict.get('patient', {})
    clinical = encounter_dict.get('clinical', {})

    bundle = {
        "resourceType": "Bundle",
        "type": "document",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
            "tag": [{"display": "SANDBOX — Demo/Simulated Record"}]
        },
        "timestamp": encounter_dict.get('created_at', datetime.now().isoformat()),
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "name": [{"text": patient.get('name', 'Unknown')}],
                    "gender": (patient.get('gender', 'unknown') or 'unknown').lower(),
                    "telecom": [{"system": "phone", "value": patient.get('phone', '')}],
                    "birthDate": None
                }
            },
            {
                "resource": {
                    "resourceType": "Encounter",
                    "status": "finished" if encounter_dict.get('doctor_approved') else "in-progress",
                    "class": {"code": "AMB", "display": "Ambulatory"},
                    "type": [{"text": "OPD Consultation"}],
                    "period": {"start": encounter_dict.get('created_at')}
                }
            },
            {
                "resource": {
                    "resourceType": "Condition",
                    "code": {"text": clinical.get('chief_complaint', 'Not documented')},
                    "note": [{"text": clinical.get('hpi', '')}],
                    "severity": {"text": clinical.get('severity', 'Unknown')}
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {"text": "AI-Structured Clinical Summary"},
                    "status": "preliminary",
                    "note": [
                        {"text": f"Symptoms: {json.dumps(clinical.get('symptoms', []))}"},
                        {"text": f"Duration: {clinical.get('duration', 'N/A')}"},
                        {"text": f"Red Flags: {json.dumps(clinical.get('red_flags', []))}"},
                        {"text": f"Triage Level: {encounter_dict.get('triage_level', 'N/A')}"}
                    ]
                }
            }
        ]
    }

    # Add medication entries from OCR if present
    ocr = encounter_dict.get('ocr_data')
    if ocr and isinstance(ocr, dict):
        for med in ocr.get('medications', []):
            bundle['entry'].append({
                "resource": {
                    "resourceType": "MedicationStatement",
                    "status": "active",
                    "medicationCodeableConcept": {"text": med.get('name', '')},
                    "dosage": [{"text": med.get('dosage', '')}],
                    "note": [{"text": f"OCR confidence: {med.get('confidence', 'N/A')}"}]
                }
            })

    return bundle
