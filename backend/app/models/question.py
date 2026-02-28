"""Question ORM model."""
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False)  # {"A": "...", "B": "...", "C": "...", "D": "..."}
    answer = Column(String(1), nullable=False)  # A | B | C | D
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # easy | medium | hard

    pdf = relationship("PDF", back_populates="questions")
    attempts = relationship("Attempt", back_populates="question", cascade="all, delete-orphan")
