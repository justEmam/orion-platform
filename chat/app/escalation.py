"""
Human handoff. When the agent can't answer confidently, we capture the
visitor's question (and contact, if given) and notify the human team by email,
and optionally Slack. No live-agent console needed for launch.
"""
from __future__ import annotations

import smtplib
from email.message import EmailMessage

import httpx

from .config import Settings


def _send_email(settings: Settings, subject: str, body: str) -> bool:
    if not settings.smtp_host:
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_user or settings.support_email
    msg["To"] = settings.support_email
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as s:
            s.starttls()
            if settings.smtp_user and settings.smtp_password:
                s.login(settings.smtp_user, settings.smtp_password)
            s.send_message(msg)
        return True
    except Exception:
        return False


def _send_slack(settings: Settings, text: str) -> bool:
    if not settings.slack_webhook_url:
        return False
    try:
        httpx.post(settings.slack_webhook_url, json={"text": text}, timeout=10)
        return True
    except Exception:
        return False


def escalate(
    settings: Settings,
    *,
    question: str,
    visitor_name: str | None,
    visitor_email: str | None,
    transcript: str,
) -> bool:
    """Notify humans. Returns True if at least one channel accepted it."""
    who = visitor_name or "A website visitor"
    contact = visitor_email or "(no email provided)"
    body = (
        f"{who} asked something the assistant couldn't answer from the "
        f"knowledge base.\n\n"
        f"Contact: {contact}\n\n"
        f"Question:\n{question}\n\n"
        f"Recent transcript:\n{transcript}\n"
    )
    emailed = _send_email(settings, "Orion chat — human handoff", body)
    slacked = _send_slack(settings, f":wave: Chat handoff from {contact}: {question}")
    return emailed or slacked
