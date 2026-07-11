"""
FastAPI entrypoint for the Orion agentic chat service.

Endpoints:
  GET  /health            liveness probe
  POST /chat              visitor message -> grounded reply or human handoff
  POST /ingest            CMS pushes a knowledge doc into the vector store

The public site talks to /chat; the CMS talks to /ingest. The LLM provider is
whatever CHAT_PROVIDER is set to (anthropic / groq / openai) — no code change
needed to swap it.
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from .agent import ChatTurn, generate_reply
from .config import get_settings
from .escalation import escalate
from .knowledge import ingest_text, delete_doc
from .providers import build_chat_model
from .schemas import (
    ChatRequest,
    ChatResponse,
    IngestRequest,
    IngestResponse,
)

settings = get_settings()
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])

app = FastAPI(title="Orion Chat Service", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# Apply the default rate limit globally via middleware (not a per-route
# decorator — decorating the route wraps its signature and breaks FastAPI's
# Pydantic body detection).
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Chat model is stateless & thread-safe to reuse across requests.
chat_model = build_chat_model(settings)


@app.get("/health")
def health():
    return {"status": "ok", "provider": settings.chat_provider}


@app.post("/chat", response_model=ChatResponse)
def chat(request: Request, payload: ChatRequest):
    history = [ChatTurn(role=t.role, content=t.content) for t in payload.history]
    reply = generate_reply(
        settings, chat_model, message=payload.message, history=history
    )

    if reply.escalate:
        transcript = "\n".join(f"{t.role}: {t.content}" for t in history[-6:])
        transcript += f"\nuser: {payload.message}"
        escalate(
            settings,
            question=payload.message,
            visitor_name=payload.visitor_name,
            visitor_email=payload.visitor_email,
            visitor_company=payload.visitor_company,
            visitor_job=payload.visitor_job,
            visitor_details=payload.visitor_details,
            transcript=transcript,
        )
        # Use the model's own contextual, localized acknowledgement; fall back
        # to the config message only if the model produced none.
        reply_text = reply.text.strip() or settings.escalation_reply
        return ChatResponse(reply=reply_text, escalated=True, sources=[])

    return ChatResponse(reply=reply.text, escalated=False, sources=reply.sources)


@app.post("/ingest", response_model=IngestResponse)
def ingest(payload: IngestRequest):
    """Called by the CMS when an admin adds/edits a knowledge document."""
    n = ingest_text(settings, source=payload.source, text=payload.text)
    return IngestResponse(source=payload.source, chunks=n)


@app.post("/ingest/delete")
def ingest_delete(payload: dict):
    """Called by the CMS when a knowledge document is deleted."""
    source = payload.get("source")
    if source:
        delete_doc(settings, source=source)
    return {"deleted": source}
