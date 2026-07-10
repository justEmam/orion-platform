"""
Central configuration.

Everything is read from environment variables (see chat/.env.example) so the
same image runs in dev and prod without code changes. The LLM provider is
chosen here at startup — swap CHAT_PROVIDER between "anthropic", "groq" and
"openai" without touching the chat logic.
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- Which LLM provider to use for chat replies ---------------------
    # "anthropic" -> Claude | "groq" -> Groq free tier | "openai" -> OpenAI
    chat_provider: Literal["anthropic", "groq", "openai"] = "anthropic"

    # Per-provider model + key. Only the active provider's key is required.
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-haiku-4-5-20251001"  # fast + cheap for a widget

    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"          # free tier friendly

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    # --- Embeddings -----------------------------------------------------
    # "hf"     -> Hugging Face Inference API (FREE hosted, tiny image) [default]
    # "openai" -> hosted, ~pennies, highest quality
    # "local"  -> in-container sentence-transformers (~2GB torch; opt-in)
    embeddings_provider: Literal["hf", "openai", "local"] = "hf"
    hf_api_key: str | None = None
    hf_embeddings_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    openai_embeddings_model: str = "text-embedding-3-small"
    # Multilingual model — understands Arabic (incl. synonyms & dialect) and
    # English. Bigger than all-MiniLM but far better for a bilingual site.
    local_embeddings_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    # --- Generation limits (ported from the customer's original chat.js) -
    max_tokens: int = 400
    max_history_turns: int = 6
    max_message_length: int = 800
    retrieval_k: int = 4               # chunks pulled from the vector store
    min_relevance_score: float = 0.15  # below this -> escalate to a human
    # ^ lowered: casual phrasings ("what do you guys do") still match the docs
    #   instead of wrongly escalating. The grounded prompt still refuses to
    #   answer anything not actually supported by the retrieved text.

    # --- Database (shared with the CMS; separate schema for vectors) -----
    database_url: str = "postgresql+psycopg://orion:orion@db:5432/orion"

    @property
    def sqlalchemy_url(self) -> str:
        """Normalize the DB URL for SQLAlchemy/psycopg. Hosts like Render inject
        a plain `postgres://` / `postgresql://` string; psycopg3 needs the
        `postgresql+psycopg://` dialect prefix. Convert if needed."""
        url = self.database_url
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        if url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://") :]
        return url

    # --- Escalation / human handoff -------------------------------------
    support_email: str = "hello@orionilam.com"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    slack_webhook_url: str | None = None  # optional extra ping

    # --- Security -------------------------------------------------------
    allowed_origins: str = "http://localhost:3000"  # comma-separated
    rate_limit: str = "20/minute"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
