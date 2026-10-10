import io
import json
import os
import unittest
from unittest.mock import patch

from app.services.tinyfish import run_source_check


LAND_CLAIM = {"subject": "Land Parcel 184/2", "object": "Rahul Sharma"}


class TinyFishCheckTests(unittest.TestCase):
    def test_missing_key_does_not_claim_verification(self):
        with patch.dict(os.environ, {"TINYFISH_API_KEY": ""}):
            result = run_source_check(LAND_CLAIM)
        self.assertEqual(result["status"], "NOT_CONFIGURED")
        self.assertEqual(result["claimMatch"], "NOT_CHECKED")

    def test_public_demo_uses_labelled_saved_fallback_without_key(self):
        with patch.dict(os.environ, {"TINYFISH_API_KEY": "", "VERCEL": "1"}):
            result = run_source_check(LAND_CLAIM)
        self.assertEqual(result["status"], "SAVED_DEMO")
        self.assertIn("saved", result["provider"].lower())
        self.assertEqual(result["claimMatch"], "NOT_CHECKED")

    def test_public_page_observation_is_context_only(self):
        payload = {"results": [{
            "url": "https://upbhulekh.gov.in/GeoDashboard/public_report",
            "final_url": "https://upbhulekh.gov.in/GeoDashboard/public_report",
            "title": "Public report",
            "text": "District Agra public report",
        }]}
        with patch.dict(os.environ, {"TINYFISH_API_KEY": "test-key"}), patch(
            "app.services.tinyfish.urlopen", return_value=io.BytesIO(json.dumps(payload).encode())
        ) as fetch:
            result = run_source_check(LAND_CLAIM)
        self.assertEqual(result["status"], "OBSERVED")
        self.assertEqual(result["claimMatch"], "NOT_CHECKED")
        self.assertEqual(result["issuerAttestation"], "NOT_CHECKED")
        sent = json.loads(fetch.call_args.args[0].data)
        self.assertNotIn("Rahul Sharma", json.dumps(sent))
        self.assertEqual(sent["urls"], ["https://upbhulekh.gov.in/GeoDashboard/public_report"])

    def test_redirect_outside_allowlist_is_rejected(self):
        payload = {"results": [{
            "url": "https://upbhulekh.gov.in/GeoDashboard/public_report",
            "final_url": "https://example.com/other",
            "text": "content",
        }]}
        with patch.dict(os.environ, {"TINYFISH_API_KEY": "test-key"}), patch(
            "app.services.tinyfish.urlopen", return_value=io.BytesIO(json.dumps(payload).encode())
        ):
            result = run_source_check(LAND_CLAIM)
        self.assertEqual(result["status"], "UNAVAILABLE")


if __name__ == "__main__":
    unittest.main()
