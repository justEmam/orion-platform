"""
Human handoff — saves the escalation as a record in the CMS (NOT email).

When the bot can't answer, we POST the visitor's contact + question +
transcript to the CMS `escalations` collection. Admins/editors then see the
list in the admin dashboard. No email is sent.
"""
from __future__ import annotations

import httpx

from .config import Settings


def escalate(
    settings: Settings,
    *,
    question: str,
    visitor_name: str | None,
    visitor_email: str | None,
    visitor_company: str | None,
    visitor_job: str | None,
    visitor_details: str | None,
    transcript: str,
) -> bool:
    """Create an Escalation record in the CMS. Returns True on success."""
    if not settings.cms_escalation_url:
        return False
    payload = {
        "name": visitor_name or "",
        "email": visitor_email or "",
        "company": visitor_company or "",
        "job": visitor_job or "",
        "details": visitor_details or "",
        "question": question,
        "transcript": transcript,
        "handled": False,
    }
    try:
        headers = {"Content-Type": "application/json"}
        if settings.cms_escalation_token:
            headers["Authorization"] = f"Bearer {settings.cms_escalation_token}"
        r = httpx.post(
            settings.cms_escalation_url, json=payload, headers=headers, timeout=10
        )
        return r.status_code in (200, 201)
    except Exception:
        return False
