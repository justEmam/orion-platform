"""
Provider factory — the ONE place that knows which concrete LLM / embeddings
class to instantiate. Everything else in the app depends only on the
LangChain interfaces (BaseChatModel, Embeddings), so switching from Claude to
Groq to a free local model is a config change, never a code change.

This is the whole point of using LangChain here instead of a single vendor SDK.
"""
from langchain_core.embeddings import Embeddings
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


def build_embeddings(settings: Settings) -> Embeddings:
    """Return an embeddings model.

    Three options, chosen by EMBEDDINGS_PROVIDER:
      - "hf"     Hugging Face Inference API — FREE hosted, tiny image, no torch.
                 Default. Best for a demo and for cheap/free hosts.
      - "openai" OpenAI hosted — highest quality; costs ~pennies (embeddings are
                 ~$0.02 / 1M tokens, so FAQ-scale usage is effectively free).
      - "local"  Runs the model in-container via sentence-transformers. Fully
                 offline, no API, but pulls a ~2GB torch stack (opt-in — install
                 requirements-local.txt). Least friendly to free hosts.

    Embeddings are cheap regardless; this choice is mostly about image size /
    where you can host, not cost.
    """
    provider = settings.embeddings_provider

    if provider == "hf":
        from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings

        return HuggingFaceInferenceAPIEmbeddings(
            api_key=settings.hf_api_key,
            model_name=settings.hf_embeddings_model,
        )

    if provider == "openai":
        from langchain_openai import OpenAIEmbeddings

        return OpenAIEmbeddings(
            model=settings.openai_embeddings_model,
            api_key=settings.openai_api_key,
        )

    if provider == "local":
        # Requires the heavy stack: pip install -r requirements-local.txt
        from langchain_community.embeddings import HuggingFaceEmbeddings

        return HuggingFaceEmbeddings(model_name=settings.local_embeddings_model)

    raise ValueError(f"Unknown embeddings_provider: {provider!r}")
