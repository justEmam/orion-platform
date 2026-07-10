"""
Knowledge base: ingest admin-uploaded docs into pgvector, and retrieve
relevant chunks at query time.

The store is the same Postgres the CMS uses, in its own set of tables managed
by langchain-postgres (PGVector). Admins upload docs from the panel -> the CMS
POSTs the file text to /ingest here -> it's chunked, embedded and stored.
"""
from __future__ import annotations

from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import Settings
from .providers import build_embeddings

COLLECTION = "orion_knowledge"


def get_vector_store(settings: Settings) -> PGVector:
    return PGVector(
        embeddings=build_embeddings(settings),
        collection_name=COLLECTION,
        connection=settings.sqlalchemy_url,
        use_jsonb=True,
    )


def ingest_text(settings: Settings, *, source: str, text: str) -> int:
    """Chunk + embed a document. `source` is a stable id (filename / CMS doc id)
    so re-uploading the same doc replaces its old chunks instead of duplicating.
    Returns the number of chunks stored."""
    store = get_vector_store(settings)

    # Replace any prior version of this source.
    try:
        store.delete(filter={"source": source})
    except Exception:
        pass  # nothing to delete on first ingest

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800, chunk_overlap=120
    )
    chunks = splitter.split_text(text)
    docs = [
        Document(page_content=c, metadata={"source": source, "chunk": i})
        for i, c in enumerate(chunks)
    ]
    if docs:
        store.add_documents(docs)
    return len(docs)


def retrieve(settings: Settings, query: str) -> list[tuple[Document, float]]:
    """Return (document, relevance_score) pairs, highest relevance first.
    Score is normalized 0..1 (1 = most relevant)."""
    store = get_vector_store(settings)
    # returns (doc, distance); convert distance -> similarity for a friendly score
    results = store.similarity_search_with_relevance_scores(
        query, k=settings.retrieval_k
    )
    return results
