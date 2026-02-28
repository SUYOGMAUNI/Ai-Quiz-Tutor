"""Pydantic schemas for questions/answers."""
from uuid import UUID
from pydantic import BaseModel
from typing import Dict


class QuestionOut(BaseModel):
    id: UUID
    question: str
    options: Dict[str, str]
    answer: str
    explanation: str
    difficulty: str

    class Config:
        from_attributes = True


class QuestionOutNoAnswer(BaseModel):
    """For serving quiz — no answer/explanation until submitted."""
    id: UUID
    question: str
    options: Dict[str, str]
    difficulty: str

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    question_id: UUID
    selected: str


class QuizSubmitResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str
