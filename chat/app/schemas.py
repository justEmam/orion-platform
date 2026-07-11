from pydantic import BaseModel, Field


class Turn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[Turn] = Field(default_factory=list)
    # Contact info collected by the widget's required pre-chat form.
    visitor_name: str | None = None
    visitor_email: str | None = None
    visitor_company: str | None = None
    visitor_job: str | None = None
    # All form fields as "Label: value" lines (supports custom/added fields).
    visitor_details: str | None = None


class ChatResponse(BaseModel):
    reply: str
    escalated: bool = False
    sources: list[str] = Field(default_factory=list)


class IngestRequest(BaseModel):
    """Sent by the CMS when an admin adds/edits a knowledge doc."""
    source: str = Field(..., description="Stable id: filename or CMS doc id")
    text: str


class IngestResponse(BaseModel):
    source: str
    chunks: int
