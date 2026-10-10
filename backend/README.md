
## Private Expert Review

Uploaded documents can opt into Expert Review with the checkbox on `/upload`. The report uses extracted claims and local glossary/checklist rules to explain terms, show grounded suggestions, and suggest next steps. It is separate from claim commitments, QR codes, and public verification. Open `/documents/<id>/advisor` to generate a report; seeded demo documents have consent enabled for demonstration. This prototype stores reports in memory, so a server restart clears them. The reference SQL schema includes tables for a future persistent deployment.

`ADVISOR=demo` (default) produces a deterministic rule-based report. `ADVISOR=live` currently uses the same rule-based fallback and labels it; no language-model provider is configured. Optional TinyFish term lookups require `TINYFISH_API_KEY` and `ADVISOR_ALLOWED_DOMAINS` (comma-separated official hostnames, default `indiacode.nic.in`). If source lookup fails, the glossary remains available. The in-memory prototype has no user authentication or role-based access control; deploy behind authentication before handling private real-world documents.
