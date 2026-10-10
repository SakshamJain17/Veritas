"""Bounded public-source observations via TinyFish Fetch.

Never send uploaded files, owner names, claim snippets, or arbitrary client URLs.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


SOURCE_PROFILES = {
    "land-jurisdiction": {
        "url": "https://upbhulekh.gov.in/GeoDashboard/public_report",
        "label": "Uttar Pradesh Bhulekh public report",
        "scope": "JURISDICTION_CONTEXT_ONLY",
        "purpose": "Observe the public land-record dashboard; do not infer a parcel owner or issuer signature.",
    }
}


def source_profile_for_claim(claim):
    if claim.get("subject", "").lower().startswith("land parcel"):
        return SOURCE_PROFILES["land-jurisdiction"]
    return None


def run_source_check(claim):
    profile = source_profile_for_claim(claim)
    if profile is None:
        return {"status": "UNSUPPORTED", "message": "No approved public source is configured for this claim type."}

    observed_at = datetime.now(timezone.utc).isoformat()
    base = {
        "status": "UNAVAILABLE",
        "provider": "TinyFish Fetch",
        "sourceUrl": profile["url"],
        "sourceLabel": profile["label"],
        "scope": profile["scope"],
        "observedAt": observed_at,
        "claimMatch": "NOT_CHECKED",
        "issuerAttestation": "NOT_CHECKED",
        "message": "Public page observation does not establish ownership or issuer attestation.",
    }
    api_key = os.environ.get("TINYFISH_API_KEY", "").strip()
    if not api_key:
        if os.environ.get("VERCEL") == "1":
            excerpt = "Saved demonstration: the configured Uttar Pradesh Bhulekh page is a public land-record reporting source. A live TinyFish Fetch request requires TINYFISH_API_KEY in the Vercel project."
            return {
                **base,
                "status": "SAVED_DEMO",
                "provider": "TinyFish Fetch (saved fallback)",
                "pageTitle": profile["label"],
                "excerpt": excerpt,
                "contentSha256": hashlib.sha256(excerpt.encode("utf-8")).hexdigest(),
                "message": "Saved TinyFish demonstration shown because the production API key is not configured.",
            }
        return {**base, "status": "NOT_CONFIGURED", "message": "Set TINYFISH_API_KEY on the backend to run a live public-source check."}

    body = json.dumps({
        "urls": [profile["url"]],
        "purpose": profile["purpose"],
        "format": "markdown",
        "links": False,
        "image_links": False,
        "iframe_links": False,
        "page_metadata": False,
        "ttl": 0,
        "per_url_timeout_ms": 15000,
    }).encode("utf-8")
    request = Request(
        "https://api.fetch.tinyfish.ai/",
        data=body,
        headers={"Content-Type": "application/json", "X-API-Key": api_key},
        method="POST",
    )
    try:
        with urlopen(request, timeout=20) as response:
            result = json.load(response)
        item = next((entry for entry in result.get("results", []) if entry.get("url") == profile["url"]), None)
        if not item:
            error = (result.get("errors") or [{}])[0].get("error", "empty_result")
            return {**base, "status": "UNAVAILABLE", "message": f"TinyFish could not observe this source ({error})."}
        final_url = item.get("final_url") or profile["url"]
        if not final_url.startswith("https://upbhulekh.gov.in/"):
            return {**base, "status": "UNAVAILABLE", "message": "Source redirected outside the approved domain."}
        content = item.get("text") or ""
        if not content.strip():
            return {**base, "status": "UNAVAILABLE", "message": "TinyFish returned no readable source text."}
        return {
            **base,
            "status": "OBSERVED",
            "finalUrl": final_url,
            "pageTitle": item.get("title") or profile["label"],
            "excerpt": " ".join(content.split())[:500],
            "contentSha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
            "requestId": result.get("request_id"),
        }
    except (HTTPError, URLError, TimeoutError, ValueError, OSError) as exc:
        return {**base, "status": "UNAVAILABLE", "message": f"TinyFish request failed ({type(exc).__name__})."}
