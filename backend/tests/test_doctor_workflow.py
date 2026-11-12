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


class DoctorWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.client = backend_app.app.test_client()
        self.client.post('/api/demo/reset')

    def test_doctor_edit_creates_audit_event(self):
        created = self.client.post('/api/demo/load/scenario_1').get_json()['encounter']
        enc_id = created['id']

        patch_res = self.client.patch(f'/api/encounter/{enc_id}', json={
            'severity': 'Severe — 8/10',
            'actor': 'Dr. Rao',
        })
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.get_json()['clinical']['severity'], 'Severe — 8/10')

        audit = self.client.get(f'/api/encounter/{enc_id}/audit').get_json()
        self.assertEqual(len(audit), 1)
        self.assertEqual(audit[0]['actor'], 'Dr. Rao')
        self.assertEqual(audit[0]['field_name'], 'severity')

    def test_doctor_approve_generates_fhir_bundle_and_updates_status(self):
        created = self.client.post('/api/demo/load/scenario_3').get_json()['encounter']
        enc_id = created['id']

        approve_res = self.client.patch(f'/api/encounter/{enc_id}/approve')
        self.assertEqual(approve_res.status_code, 200)
        approved = approve_res.get_json()
        self.assertTrue(approved['doctor_approved'])
        self.assertEqual(approved['status'], 'COMPLETED')
        self.assertEqual(approved['fhir_record']['resourceType'], 'Bundle')

        fhir_res = self.client.get(f'/api/encounter/{enc_id}/fhir')
        self.assertEqual(fhir_res.status_code, 200)
        self.assertEqual(fhir_res.get_json()['resourceType'], 'Bundle')

    def test_invalid_triage_level_rejected(self):
        created = self.client.post('/api/demo/load/scenario_1').get_json()['encounter']
        res = self.client.patch(f"/api/encounter/{created['id']}", json={
            'triage_level': 'INVALID',
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()['error'], 'Invalid triage_level')


if __name__ == '__main__':
    unittest.main()
