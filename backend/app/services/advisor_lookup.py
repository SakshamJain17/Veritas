"""Optional official-term lookup through TinyFish browser automation."""
import hashlib
import ipaddress
import json
import os
import time
from urllib.parse import urlsplit, urlencode
from urllib.request import Request, urlopen
class TinyFishError(Exception):
    pass

def validate_public_url(value):
    url = value.strip()
    parsed = urlsplit(url)
    host = (parsed.hostname or "").lower().rstrip(".")
    if parsed.scheme != "https" or not host or parsed.username or parsed.password or parsed.port not in (None, 443) or len(url) > 2048:
        raise ValueError("Public HTTPS URL required")
    if host == "localhost" or host.endswith((".localhost", ".local", ".internal")):
        raise ValueError("Public HTTPS URL required")
    try:
        ipaddress.ip_address(host)
    except ValueError:
        return url
    raise ValueError("IP addresses are not allowed")

CACHE = {}
CANDIDATES = ("cadastral", "revenue circle", "mutation extract", "registered titleholder", "attestation", "ward")

def allowed_domains():
    return [d.strip().lower().rstrip('.') for d in os.getenv('ADVISOR_ALLOWED_DOMAINS', 'indiacode.nic.in').split(',') if d.strip()]

def allowed_url(url, domains=None):
    try:
        validated = validate_public_url(url)
    except ValueError:
        return False
    host = (urlsplit(validated).hostname or '').lower().rstrip('.')
    return host in (domains or allowed_domains())

def _run(url, term):
    key = os.getenv('TINYFISH_API_KEY')
    if not key:
        raise TinyFishError('TinyFish is not configured')
    if url == 'search':
        query = urlencode({'query': term + ' land record meaning', 'include_domains': ','.join(allowed_domains()), 'location': 'IN', 'language': 'en'})
        request = Request('https://api.search.tinyfish.ai?' + query, headers={'X-API-Key': key}, method='GET')
        with urlopen(request, timeout=20) as response:
            result = json.load(response)
        for item in result.get('results', []):
            candidate = str(item.get('url', ''))
            if candidate and not candidate.startswith(('https://', 'http://')):
                candidate = 'https://' + candidate
            if allowed_url(candidate):
                return {'url': candidate}
        return {}
    if not allowed_url(url):
        return {}
    body = json.dumps({'urls':[url], 'purpose':f'Find a short official definition or explanation for {term}', 'format':'markdown', 'links':False, 'image_links':False, 'ttl':86400, 'per_url_timeout_ms':15000}).encode()
    request = Request('https://api.fetch.tinyfish.ai', data=body, headers={'X-API-Key':key, 'Content-Type':'application/json'}, method='POST')
    with urlopen(request, timeout=20) as response:
        result = json.load(response)
    item = next((entry for entry in result.get('results', []) if entry.get('url') == url), None)
    if not item or not allowed_url(str(item.get('final_url') or url)):
        return {}
    content = str(item.get('text') or '')
    pos = content.casefold().find(term.casefold())
    if pos < 0:
        return {}
    return {'excerpt': ' '.join(content[max(0,pos-100):pos+500].split())[:600], 'final_url': item.get('final_url') or url}

def lookup_term(term, domains=None, run=_run):
    domains = domains or allowed_domains()
    if not domains:
        return None
    domain = domains[0]
    cache_key = (term.casefold(), domain)
    cached = CACHE.get(cache_key)
    if cached and time.time() - cached[0] < 24*60*60:
        return dict(cached[1], cached=True)
    homepage = f'https://{domain}/'
    search = run('search', term)
    url = str(search.get('url',''))
    if not allowed_url(url, domains):
        return None
    fetched = run(url, term)
    excerpt = str(fetched.get('excerpt',''))[:600]
    if not excerpt:
        return None
    result = {'id': f"official-{hashlib.sha256((term+url).encode()).hexdigest()[:12]}", 'term':term, 'sourceType':'official', 'url':url, 'domain':domain, 'excerpt':excerpt, 'contentDigest':hashlib.sha256(excerpt.encode()).hexdigest(), 'retrievedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()), 'cached':False}
    CACHE[cache_key] = (time.time(), result)
    return result

def lookup_missing_terms(text, glossary_terms, max_lookups=6, lookup=lookup_term):
    known = {x.casefold() for term in glossary_terms for x in [term['term'], *term.get('aliases',[])]}
    candidates = [term for term in CANDIDATES if term in text.casefold() and term.casefold() not in known]
    results = []
    for term in candidates[:min(max_lookups, 6)]:
        try:
            result = lookup(term)
            if result: results.append(result)
        except (TinyFishError, OSError, TimeoutError):
            continue
    return results
