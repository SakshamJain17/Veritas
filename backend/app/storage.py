"""Local durable state and private upload storage.

SQLite is deliberately used only outside Vercel.  A serverless deployment must
provide a durable database/object store; silently writing to /tmp would lose
records between invocations.
"""
from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any, Optional


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv("VERITAS_DATA_DIR", ROOT / ".veritas-data"))
DB_PATH = Path(os.getenv("VERITAS_SQLITE_PATH", DATA_DIR / "veritas.sqlite3"))
UPLOAD_DIR = Path(os.getenv("VERITAS_UPLOAD_DIR", DATA_DIR / "uploads"))


def local_persistence_enabled() -> bool:
    return os.getenv("VERCEL") != "1" and os.getenv("VERITAS_DISABLE_PERSISTENCE") != "1"


def _connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL)")
    return conn


def load_state() -> Optional[dict[str, Any]]:
    if not local_persistence_enabled():
        return None
    with _connect() as conn:
        row = conn.execute("SELECT payload FROM state WHERE id=1").fetchone()
    return json.loads(row[0]) if row else None


def save_state(payload: dict[str, Any]) -> None:
    if not local_persistence_enabled():
        return
    encoded = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    with _connect() as conn:
        conn.execute(
            "INSERT INTO state(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
            (encoded,),
        )


def store_upload(document_id: str, filename: str, content: bytes) -> Optional[str]:
    if not local_persistence_enabled():
        return None
    safe_suffix = Path(filename or "upload.bin").suffix.lower()[:10]
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = UPLOAD_DIR / f"{document_id}{safe_suffix}"
    path.write_bytes(content)
    return str(path)

