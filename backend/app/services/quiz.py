"""Question retrieval, weak topic prioritization."""
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, Integer

from app.models import Question, Attempt


def get_questions_for_quiz(db: Session, pdf_id: UUID, user_id: UUID, limit: int = 10):
    """Get questions for a quiz, prioritizing unanswered and previously wrong."""
    # Subquery: user's attempts per question
    attempted = (
        db.query(Attempt.question_id, func.max(func.cast(Attempt.is_correct, Integer)).label("last_correct"))
        .filter(Attempt.user_id == user_id)
        .group_by(Attempt.question_id)
        .subquery()
    )
    # Prioritize: never attempted first, then wrong, then right
    questions = (
        db.query(Question)
        .filter(Question.pdf_id == pdf_id)
        .outerjoin(attempted, Question.id == attempted.c.question_id)
        .order_by(
            attempted.c.last_correct.asc().nulls_first(),
            Question.id,
        )
        .limit(limit)
        .all()
    )
    return questions


def record_attempt(db: Session, user_id: UUID, question_id: UUID, selected: str) -> tuple[bool, str, str]:
    """Record answer and return (is_correct, correct_answer, explanation)."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise ValueError("Question not found")
    is_correct = q.answer.upper() == selected.upper()
    attempt = Attempt(
        user_id=user_id,
        question_id=question_id,
        selected=selected,
        is_correct=is_correct,
    )
    db.add(attempt)
    db.commit()
    return is_correct, q.answer, q.explanation