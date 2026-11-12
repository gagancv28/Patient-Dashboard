import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
_TEST_DB = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
_TEST_DB.close()
os.environ['DATABASE_URL'] = f"sqlite:///{_TEST_DB.name}"

import app as backend_app  # noqa: E402


class HealthAndConfigTests(unittest.TestCase):
    def setUp(self):
        self.client = backend_app.app.test_client()

    def test_health_endpoint_returns_ok_and_security_headers(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), {'status': 'ok', 'demo_mode': True})
        self.assertEqual(res.headers.get('X-Content-Type-Options'), 'nosniff')
        self.assertEqual(res.headers.get('X-Frame-Options'), 'DENY')

    def test_config_exposes_demo_mode(self):
        res = self.client.get('/api/config')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), {'demo_mode': True})

    def test_unknown_route_returns_json_404(self):
        res = self.client.get('/api/does-not-exist')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.get_json(), {'error': 'Not found'})


if __name__ == '__main__':
    unittest.main()
