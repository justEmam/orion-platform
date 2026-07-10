"""
The agentic RAG reply pipeline.

Flow per visitor message:
  1. Retrieve relevant knowledge-base chunks (pgvector).
  2. If nothing clears the relevance threshold -> ESCALATE (don't guess).
  3. Otherwise answer with the LLM, grounded strictly in the retrieved context.
  4. If the grounded model still can't answer from context, it emits the
     ESCALATE sentinel and we hand off to a human.

"Escalate" here == capture the visitor's question + contact and email/ticket
the human team (see escalation.py). The provider is chosen in providers.py, so
this file is model-agnostic.
"""
from __future__ import annotations

from dataclasses import dataclass

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from .config import Settings
from .knowledge import retrieve

ESCALATE = "[[ESCALATE]]"

SYSTEM_PROMPT = f"""You are the Orion Assistant, the on-site AI concierge for \
Orion Media, a full-service media agency headquartered in Abu Dhabi, UAE.

Answer the visitor ONLY using the CONTEXT provided below, which comes from \
Orion Media's own documents. Rules:
- If the CONTEXT contains the answer (even partially), USE THE SPECIFIC FACTS \
from it — real service names, real client names, the real contact email, etc. \
Reply warmly and concisely (2-4 sentences), like a knowledgeable account \
manager. Do NOT give vague filler like "a diverse range of clients" when the \
context lists actual names — name them.
- Do NOT say "I don't have that information" if the information IS in the \
context. Only escalate when the context genuinely doesn't cover the question.
- If the CONTEXT does not cover the question, do NOT guess, invent, or use \
outside knowledge. Reply with EXACTLY this token and nothing else: {ESCALATE}
- Never fabricate pricing, timelines, client names, case studies or statistics \
that are not in the context.
"""


@dataclass
class ChatTurn:
    role: str  # "user" | "assistant"
    content: str


@dataclass
class Reply:
    text: str
    escalate: bool
    sources: list[str]


def _history_messages(history: list[ChatTurn], settings: Settings):
    trimmed = history[-settings.max_history_turns :]
    out = []
    for turn in trimmed:
        if turn.role == "user":
            out.append(HumanMessage(content=turn.content[: settings.max_message_length]))
        elif turn.role == "assistant":
            out.append(AIMessage(content=turn.content[: settings.max_message_length]))
    return out


def generate_reply(
    settings: Settings,
    model: BaseChatModel,
    *,
    message: str,
    history: list[ChatTurn],
) -> Reply:
    message = message[: settings.max_message_length].strip()

    # 1. Retrieve
    hits = retrieve(settings, message)
    relevant = [(doc, score) for doc, score in hits if score >= settings.min_relevance_score]

    # 2. Hard escalation: nothing relevant in the knowledge base
    if not relevant:
        return Reply(text="", escalate=True, sources=[])

    context = "\n\n---\n\n".join(doc.page_content for doc, _ in relevant)
    sources = sorted({doc.metadata.get("source", "?") for doc, _ in relevant})

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        *_history_messages(history, settings),
        HumanMessage(
            content=f"CONTEXT:\n{context}\n\nVISITOR QUESTION:\n{message}"
        ),
    ]

    # 3. Grounded generation
    result = model.invoke(messages)
    text = (result.content or "").strip()

    # 4. Soft escalation: model decided context was insufficient
    if ESCALATE in text or not text:
        return Reply(text="", escalate=True, sources=sources)

    return Reply(text=text, escalate=False, sources=sources)
