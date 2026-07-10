from pydantic import BaseModel, Field


class Turn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[Turn] = Field(default_factory=list)
    visitor_name: str | None = None
    visitor_email: str | None = None


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
