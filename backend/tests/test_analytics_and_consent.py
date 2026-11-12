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


class AnalyticsAndConsentTests(unittest.TestCase):
    def setUp(self):
        self.client = backend_app.app.test_client()
        self.client.post('/api/demo/reset')

    def test_record_consent_persists_scope(self):
        res = self.client.post('/api/consent', json={
            'phone': '9876543210',
            'scope': 'voice_recording,ai_processing',
            'consented': True,
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data['patient_phone'], '9876543210')
        self.assertTrue(data['consented'])

    def test_patient_history_and_queue_priority_sorting(self):
        self.client.post('/api/demo/load/scenario_1')  # LOW
        self.client.post('/api/demo/load/scenario_5')  # EMERGENCY

        queue = self.client.get('/api/encounters').get_json()
        self.assertEqual(len(queue), 2)
        self.assertEqual(queue[0]['triage_level'], 'EMERGENCY')

        history = self.client.get('/api/patient/9876500001/history').get_json()
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]['patient']['name'], 'Lakshmi N.')

    def test_analytics_reflects_loaded_encounters_and_reset(self):
        self.client.post('/api/demo/load/scenario_2')
        analytics = self.client.get('/api/analytics').get_json()
        self.assertEqual(analytics['total_patients'], 1)
        self.assertEqual(analytics['pending'], 1)

        self.client.post('/api/demo/reset')
        empty_analytics = self.client.get('/api/analytics').get_json()
        self.assertEqual(empty_analytics['total_patients'], 0)


if __name__ == '__main__':
    unittest.main()
