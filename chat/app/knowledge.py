"""
Knowledge store — plain text, NO embeddings/RAG.

For a small fixed FAQ (10-15 Q&As) we skip vector search entirely and instead
"prompt-stuff": store each doc's raw text, and hand ALL of them to the model on
every message. Simpler, more accurate at this scale, and needs no embedding
model or pgvector.

Docs live in a simple table `chat_knowledge(source TEXT PRIMARY KEY, text TEXT)`.
The CMS POSTs each doc to /ingest on save (upsert by source).
"""
from __future__ import annotations

import psycopg

from .config import Settings


def _connect(settings: Settings):
    # psycopg wants a plain postgresql:// URL (strip any +psycopg dialect part).
    url = settings.sqlalchemy_url.replace("postgresql+psycopg://", "postgresql://")
    return psycopg.connect(url)


def _ensure_table(cur) -> None:
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_knowledge (
            source TEXT PRIMARY KEY,
            text   TEXT NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now()
        )
        """
    )


def ingest_text(settings: Settings, *, source: str, text: str) -> int:
    """Upsert one doc by `source`. Returns 1 (docs, not chunks — no chunking)."""
    with _connect(settings) as conn, conn.cursor() as cur:
        _ensure_table(cur)
        cur.execute(
            """
            INSERT INTO chat_knowledge (source, text, updated_at)
            VALUES (%s, %s, now())
            ON CONFLICT (source) DO UPDATE
              SET text = EXCLUDED.text, updated_at = now()
            """,
            (source, text),
        )
        conn.commit()
    return 1


def delete_doc(settings: Settings, *, source: str) -> None:
    """Remove a doc (called when the CMS deletes a knowledge doc)."""
    with _connect(settings) as conn, conn.cursor() as cur:
        _ensure_table(cur)
        cur.execute("DELETE FROM chat_knowledge WHERE source = %s", (source,))
        conn.commit()


def all_knowledge(settings: Settings) -> str:
    """Return ALL knowledge docs concatenated — the full FAQ to stuff into the
    prompt. Empty string if there are none."""
    with _connect(settings) as conn, conn.cursor() as cur:
        _ensure_table(cur)
        cur.execute("SELECT text FROM chat_knowledge ORDER BY source")
        rows = cur.fetchall()
    return "\n\n---\n\n".join(r[0] for r in rows if r[0])
