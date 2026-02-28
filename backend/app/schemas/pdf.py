"""Pydantic schemas for PDF upload."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class PDFCreate(BaseModel):
    pass  # PDF comes via multipart form


class PDFOut(BaseModel):
    id: UUID
    filename: str
    chunk_count: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
