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
    chat_provider: Literal["anthropic", "groq", "openai"] = "openai"

    # Per-provider model + key. Only the active provider's key is required.
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-haiku-4-5-20251001"  # fast + cheap for a widget

    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"          # free tier friendly

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    # (No embeddings — the chat prompt-stuffs all FAQ docs. See knowledge.py.)

    # --- Generation limits ----------------------------------------------
    max_tokens: int = 400
    max_history_turns: int = 6
    max_message_length: int = 800

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
    # Escalations are SAVED TO THE CMS (shown in the admin), not emailed.
    support_email: str = "hello@orionilam.com"
    # CMS endpoint that creates an Escalation record (the collection's REST API).
    cms_escalation_url: str | None = "http://cms:3001/api/escalations"
    # Optional API key if the collection's create is protected.
    cms_escalation_token: str | None = None
    # The reply shown to the visitor when escalated.
    escalation_reply: str = (
        "Thanks — I've noted your question and our team will contact you by "
        "email within 1–2 hours."
    )

    # --- Security -------------------------------------------------------
    allowed_origins: str = "http://localhost:3000"  # comma-separated
    rate_limit: str = "20/minute"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
