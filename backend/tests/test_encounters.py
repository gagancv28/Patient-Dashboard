import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault(
    'DATABASE_URL',
    f"sqlite:///{os.path.join(tempfile.gettempdir(), 'codescribe_ci_test.db')}",
)

import app as backend_app  # noqa: E402


class EncounterCreationTests(unittest.TestCase):
    def setUp(self):
        self.client = backend_app.app.test_client()
        self.client.post('/api/demo/reset')

    def test_create_encounter_rejects_empty_transcript(self):
        res = self.client.post('/api/encounter', json={'transcript': '   '})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()['error'], 'No transcript provided')

    def test_create_encounter_extracts_clinical_fields_and_normalizes_language(self):
        res = self.client.post('/api/encounter', json={
            'patient_name': '  Asha Rao  ',
            'language': 'fr',
            'transcript': 'I have fever and headache for 2 days',
        })
        self.assertEqual(res.status_code, 201)
        enc = res.get_json()['encounter']
        self.assertEqual(enc['patient']['name'], 'Asha Rao')
        self.assertEqual(enc['language'], 'en')
        self.assertEqual(enc['triage_level'], 'MEDIUM')
        self.assertEqual(enc['clinical']['chief_complaint'], 'Fever and headache')

    def test_load_demo_scenario_and_unknown_scenario(self):
        missing = self.client.post('/api/demo/load/nonexistent')
        self.assertEqual(missing.status_code, 404)

        res = self.client.post('/api/demo/load/scenario_5')
        self.assertEqual(res.status_code, 201)
        enc = res.get_json()['encounter']
        self.assertEqual(enc['triage_level'], 'EMERGENCY')


if __name__ == '__main__':
    unittest.main()
