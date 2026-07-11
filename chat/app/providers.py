"""
Provider factory — the ONE place that knows which concrete LLM class to
instantiate. Everything else depends only on LangChain's BaseChatModel, so
switching OpenAI <-> Anthropic <-> Groq is a config change (CHAT_PROVIDER),
never a code change. That's the point of LangChain over a single vendor SDK.

(No embeddings — the chat prompt-stuffs the FAQ instead of doing RAG.)
"""
from langchain_core.language_models.chat_models import BaseChatModel

from .config import Settings


def build_chat_model(settings: Settings) -> BaseChatModel:
    """Return a chat model for the configured provider."""
    provider = settings.chat_provider

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,
            max_tokens=settings.max_tokens,
            temperature=0.3,
        )

    if provider == "groq":
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=settings.groq_model,
            api_key=settings.groq_api_key,
            max_tokens=settings.max_tokens,
            temperature=0.3,
        )

    if provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            max_tokens=settings.max_tokens,
            temperature=0.3,
        )

    raise ValueError(f"Unknown chat_provider: {provider!r}")
