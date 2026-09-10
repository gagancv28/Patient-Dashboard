"""
CodeScribe AI — Demo Scenario Fixtures
5 fictional patients for SIH2026 demonstration.
All data is fictional. No real patient data.
"""

SCENARIOS = {
    "scenario_1": {
        "id": "scenario_1",
        "label": "Lakshmi N. — Joint Pain (Kannada)",
        "language": "kn",
        "patient": {
            "name": "Lakshmi N.",
            "age": "34",
            "gender": "Female",
            "phone": "9876500001",
            "email": "lakshmi.demo@codescribe.ai"
        },
        "transcript": "ನನಗೆ ಎರಡು ವಾರಗಳಿಂದ ಎಡ ಮೊಣಕಾಲಿನಲ್ಲಿ ನೋವು ಇದೆ. ಮೆಟ್ಟಿಲು ಹತ್ತುವಾಗ ಹೆಚ್ಚಾಗುತ್ತದೆ. ಬೆಳಗ್ಗೆ ಎದ್ದಾಗ ಕೀಲು ಬಿಗಿಯಾಗಿರುತ್ತದೆ.",
        "transcript_en": "I have pain in my left knee for two weeks. It gets worse when climbing stairs. The joint feels stiff in the morning.",
        "clinical_extraction": {
            "chief_complaint": "Left knee pain",
            "hpi": "34-year-old female presenting with left knee pain for 2 weeks, worsening on stairs, with morning stiffness.",
            "symptoms": ["Left knee pain", "Morning stiffness", "Pain on stairs"],
            "duration": "2 weeks",
            "severity": "Moderate — 5/10",
            "associated_symptoms": "Morning stiffness lasting ~30 minutes",
            "medications": "None reported",
            "allergies": "None reported",
            "past_history": "No significant past medical history reported",
            "red_flags": [],
            "confidence": {
                "chief_complaint": 0.95,
                "hpi": 0.90,
                "symptoms": 0.92,
                "duration": 0.95,
                "severity": 0.85,
                "associated_symptoms": 0.88,
                "medications": 0.70,
                "allergies": 0.70,
                "past_history": 0.60
            }
        },
        "triage_level": "LOW",
        "patient_summary": "Patient reports left knee pain for 2 weeks with morning stiffness and difficulty on stairs. Routed to Orthopedics for routine evaluation.",
        "followup": {
            "question": "Does the stiffness improve after moving around for some time, or does it stay the same throughout the day?",
            "reason": "Distinguishing between inflammatory arthritis (stiffness improves with activity) and mechanical causes (stiffness worsens with activity) to guide workup.",
            "answer": "It usually gets better after I walk around for about 30 minutes."
        },
        "ayush": {
            "prakriti": "Vata-Kapha",
            "vikriti_dosha": "Vata aggravation in Sandhigata (joints)",
            "agni_status": "Mandagni (low digestive fire)",
            "recommendations": "Janu Basti (warm oil pooling on knee) recommended. Avoid cold foods. Dashamoola Kashaya may be considered."
        },
        "ocr_data": None
    },
    "scenario_2": {
        "id": "scenario_2",
        "label": "Rohan Mehta — Fever & Headache (Hindi/English)",
        "language": "hi",
        "patient": {
            "name": "Rohan Mehta",
            "age": "27",
            "gender": "Male",
            "phone": "9876500002",
            "email": "rohan.demo@codescribe.ai"
        },
        "transcript": "Mujhe teen din se bukhar aa raha hai, around 102°F. Sar mein bahut dard hai, especially forehead area. Thoda body pain bhi hai and I feel very tired.",
        "transcript_en": "I have had fever for three days, around 102°F. I have a lot of headache, especially in the forehead area. Some body pain too and I feel very tired.",
        "clinical_extraction": {
            "chief_complaint": "Fever with headache",
            "hpi": "27-year-old male presenting with high-grade fever (102°F) for 3 days, associated with frontal headache and generalized body ache.",
            "symptoms": ["High-grade fever 102°F", "Frontal headache", "Body ache", "Fatigue"],
            "duration": "3 days",
            "severity": "Moderate-High — 7/10",
            "associated_symptoms": "Generalized body ache, fatigue",
            "medications": "None reported",
            "allergies": "None reported",
            "past_history": "None reported",
            "red_flags": [],
            "confidence": {
                "chief_complaint": 0.97,
                "hpi": 0.93,
                "symptoms": 0.95,
                "duration": 0.96,
                "severity": 0.90,
                "associated_symptoms": 0.92,
                "medications": 0.65,
                "allergies": 0.65,
                "past_history": 0.55
            }
        },
        "triage_level": "MEDIUM",
        "patient_summary": "Patient reports 3-day high-grade fever with frontal headache and body ache. Scheduled for General Medicine evaluation to rule out dengue/viral fever.",
        "followup": {
            "question": "Is the fever continuous throughout the day, or does it come and go with chills and sweating?",
            "reason": "Fever pattern helps differentiate between viral fever (continuous), malaria (intermittent with rigors), and dengue (saddle-back pattern). Critical for workup in endemic regions.",
            "answer": "It comes and goes. I get chills before the fever rises, then I sweat a lot when it breaks."
        },
        "ayush": {
            "prakriti": "Pitta-Vata",
            "vikriti_dosha": "Pitta aggravation with Ama (toxin) accumulation",
            "agni_status": "Tikshnagni (hyperactive digestive fire) with Ama",
            "recommendations": "Langhana (therapeutic fasting with warm fluids). Sudarshana Churna may be considered for Jwara (fever). Avoid heavy, oily foods."
        },
        "ocr_data": None
    },
    "scenario_3": {
        "id": "scenario_3",
        "label": "Abdul Rahman — Prescription OCR",
        "language": "en",
        "patient": {
            "name": "Abdul Rahman",
            "age": "58",
            "gender": "Male",
            "phone": "9876500003",
            "email": "abdul.demo@codescribe.ai"
        },
        "transcript": "I am a diabetes patient for the last 10 years. I have been taking medicines regularly. I brought my old prescription. I also feel some tingling in my feet recently.",
        "transcript_en": "I am a diabetes patient for the last 10 years. I have been taking medicines regularly. I brought my old prescription. I also feel some tingling in my feet recently.",
        "clinical_extraction": {
            "chief_complaint": "Diabetes follow-up with new tingling in feet",
            "hpi": "58-year-old male with 10-year history of diabetes mellitus presenting for follow-up. Reports new onset tingling sensation in both feet.",
            "symptoms": ["Tingling in feet (bilateral)", "Known diabetes mellitus"],
            "duration": "Diabetes: 10 years. Tingling: recent onset",
            "severity": "Low-Moderate — 4/10",
            "associated_symptoms": "None reported beyond tingling",
            "medications": "Metformin (per prescription — see OCR)",
            "allergies": "None reported",
            "past_history": "Type 2 Diabetes Mellitus — 10 years",
            "red_flags": ["New-onset peripheral neuropathy symptoms"],
            "confidence": {
                "chief_complaint": 0.93,
                "hpi": 0.91,
                "symptoms": 0.88,
                "duration": 0.94,
                "severity": 0.80,
                "associated_symptoms": 0.75,
                "medications": 0.60,
                "allergies": 0.65,
                "past_history": 0.95
            }
        },
        "triage_level": "MEDIUM",
        "patient_summary": "Long-standing diabetic patient with new peripheral neuropathy symptoms (tingling feet). Prescription OCR shows Metformin. Flagged for Endocrinology review.",
        "followup": {
            "question": "Have you noticed any numbness, burning sensation, or any wounds on your feet that are slow to heal?",
            "reason": "Screening for diabetic peripheral neuropathy progression and diabetic foot complications, which require early intervention.",
            "answer": "Just tingling for now. No wounds or numbness."
        },
        "ayush": {
            "prakriti": "Kapha-Pitta",
            "vikriti_dosha": "Kapha aggravation with Medodhatvagni mandya (impaired fat tissue metabolism)",
            "agni_status": "Mandagni (low digestive fire)",
            "recommendations": "Nisha Amalaki Churna (Turmeric + Amla) for Prameha (diabetes). Foot care with warm sesame oil massage for Vata-related tingling."
        },
        "ocr_data": {
            "raw_text": "Dr. S. Patel\nCity General Hospital\nDate: 15/07/2026\n\nRx:\n1. Tab. Metformin 500mg — BD (after meals)\n2. Tab. Glimepiride 1mg — OD (before breakfast)\n3. Cap. Methylcobalamin 1500mcg — OD\n\nAdvice: Monitor fasting blood sugar weekly",
            "medications": [
                {"name": "Metformin 500mg", "dosage": "Twice daily after meals", "confidence": 0.92},
                {"name": "Glimepiride 1mg", "dosage": "Once daily before breakfast", "confidence": 0.88},
                {"name": "Methylcobalamin 1500mcg", "dosage": "Once daily", "confidence": 0.72}
            ],
            "doctor_name": "Dr. S. Patel",
            "hospital": "City General Hospital",
            "date": "15/07/2026",
            "overall_confidence": 0.84
        }
    },
    "scenario_4": {
        "id": "scenario_4",
        "label": "Priya S. — Vague Complaint (Tamil)",
        "language": "en",
        "patient": {
            "name": "Priya S.",
            "age": "45",
            "gender": "Female",
            "phone": "9876500004",
            "email": "priya.demo@codescribe.ai"
        },
        "transcript": "I just don't feel well. I have been feeling tired and sometimes I feel dizzy. My appetite is less. I don't know what is wrong.",
        "transcript_en": "I just don't feel well. I have been feeling tired and sometimes I feel dizzy. My appetite is less. I don't know what is wrong.",
        "clinical_extraction": {
            "chief_complaint": "General malaise with fatigue and dizziness",
            "hpi": "45-year-old female presenting with non-specific complaints of general unwellness, fatigue, intermittent dizziness, and reduced appetite. Duration unclear.",
            "symptoms": ["Fatigue", "Intermittent dizziness", "Reduced appetite"],
            "duration": "Unclear — patient unable to specify",
            "severity": "Unknown — needs clarification",
            "associated_symptoms": "Reduced appetite",
            "medications": "Not obtained",
            "allergies": "Not obtained",
            "past_history": "Not obtained",
            "red_flags": [],
            "confidence": {
                "chief_complaint": 0.70,
                "hpi": 0.55,
                "symptoms": 0.72,
                "duration": 0.30,
                "severity": 0.25,
                "associated_symptoms": 0.60,
                "medications": 0.15,
                "allergies": 0.15,
                "past_history": 0.15
            }
        },
        "triage_level": "LOW",
        "patient_summary": "Patient reports vague symptoms of fatigue, dizziness, and appetite loss. Multiple clinical fields could not be determined — requires detailed doctor interview.",
        "followup": {
            "question": "How long have you been feeling this way — days, weeks, or months? And have you noticed any changes in your weight?",
            "reason": "Establishing timeline and weight change helps narrow differential between anemia, thyroid disorders, depression, and other systemic conditions.",
            "answer": "Maybe a few weeks. I'm not sure about weight."
        },
        "ayush": {
            "prakriti": "Assessment incomplete — requires Nadi Pariksha",
            "vikriti_dosha": "Possible Tridosha imbalance — insufficient data",
            "agni_status": "Likely Mandagni based on appetite loss",
            "recommendations": "Detailed Dashavidha Pariksha recommended before Ayurvedic intervention. General Pachana (digestive support) with warm ginger water."
        },
        "ocr_data": None
    },
    "scenario_5": {
        "id": "scenario_5",
        "label": "Arjun K. — Chest Pain Emergency (English)",
        "language": "en",
        "patient": {
            "name": "Arjun K.",
            "age": "61",
            "gender": "Male",
            "phone": "9876500005",
            "email": "arjun.demo@codescribe.ai"
        },
        "transcript": "I have very bad chest pain since this morning. It is like a heavy pressure on my chest. The pain goes to my left arm. I am also feeling short of breath and sweating a lot.",
        "transcript_en": "I have very bad chest pain since this morning. It is like a heavy pressure on my chest. The pain goes to my left arm. I am also feeling short of breath and sweating a lot.",
        "clinical_extraction": {
            "chief_complaint": "Acute chest pain with radiation to left arm",
            "hpi": "61-year-old male presenting with acute onset heavy, pressure-like chest pain since morning, radiating to left arm, associated with shortness of breath and diaphoresis. Cardiac emergency until proven otherwise.",
            "symptoms": ["Severe chest pain — pressure-like", "Left arm radiation", "Shortness of breath", "Diaphoresis (excessive sweating)"],
            "duration": "Since this morning (acute onset)",
            "severity": "Very High — 9/10",
            "associated_symptoms": "Shortness of breath, diaphoresis, left arm radiation",
            "medications": "Not obtained — emergent presentation",
            "allergies": "Not obtained — emergent presentation",
            "past_history": "Not obtained — emergent presentation",
            "red_flags": [
                "Acute chest pain with cardiac features",
                "Left arm radiation — classic anginal pattern",
                "Associated diaphoresis and dyspnea",
                "Age >60 — high cardiovascular risk"
            ],
            "confidence": {
                "chief_complaint": 0.98,
                "hpi": 0.95,
                "symptoms": 0.97,
                "duration": 0.90,
                "severity": 0.95,
                "associated_symptoms": 0.96,
                "medications": 0.10,
                "allergies": 0.10,
                "past_history": 0.10
            }
        },
        "triage_level": "EMERGENCY",
        "patient_summary": "URGENT: Patient presents with acute pressure-like chest pain radiating to left arm with breathlessness and sweating. Flagged for immediate cardiac evaluation — do not delay.",
        "followup": None,
        "ayush": {
            "prakriti": "Assessment deferred — emergent case",
            "vikriti_dosha": "Assessment deferred — emergent case",
            "agni_status": "Assessment deferred — emergent case",
            "recommendations": "Ayurvedic assessment deferred. Patient requires immediate allopathic emergency evaluation. Hridaya (cardiac) Basti contraindicated in acute phase."
        },
        "ocr_data": None
    }
}

def get_scenario(scenario_id):
    return SCENARIOS.get(scenario_id)

def get_all_scenarios():
    return [
        {
            "id": s["id"], 
            "label": s["label"], 
            "language": s["language"], 
            "triage_level": s["triage_level"],
            "patient_name": s["patient"]["name"],
            "transcript": s["transcript_en"],
            "red_flags": len(s.get("clinical_extraction", {}).get("red_flags", []))
        } for s in SCENARIOS.values()
    ]
