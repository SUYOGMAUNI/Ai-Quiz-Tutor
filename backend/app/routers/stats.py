"""GET /stats/{pdf_id}."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer

from app.database import get_db
from app.models import Attempt, Question
from app.schemas.stats import StatsOut
from app.utils.jwt import decode_token

router = APIRouter()


def _get_user_id(authorization: str | None = None) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(authorization.split()[1])
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return UUID(payload["sub"])


@router.get("/{pdf_id}", response_model=StatsOut)
def get_stats(
    pdf_id: UUID,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(authorization)
    qids = db.query(Question.id).filter(Question.pdf_id == pdf_id).subquery()
    attempts = (
        db.query(
            func.count(Attempt.id).label("total"),
            func.sum(func.cast(Attempt.is_correct, Integer)).label("correct"),
        )
        .filter(Attempt.user_id == user_id, Attempt.question_id.in_(qids))
        .first()
    )
    total = attempts.total or 0
    correct = attempts.correct or 0
    accuracy = (correct / total * 100) if total else 0.0
    by_diff = (
        db.query(
            Question.difficulty,
            func.count(Attempt.id),
            func.sum(func.cast(Attempt.is_correct, Integer)),
        )
        .join(Attempt, Attempt.question_id == Question.id)
        .filter(Question.pdf_id == pdf_id, Attempt.user_id == user_id)
        .group_by(Question.difficulty)
        .all()
    )
    by_difficulty = {}
    for diff, t, c in by_diff:
        by_difficulty[diff] = {
            "total": t,
            "correct": c or 0,
            "accuracy": (c / t * 100) if t else 0,
        }
    return StatsOut(
        total_attempts=total,
        correct_count=correct,
        accuracy_percent=round(accuracy, 1),
        by_difficulty=by_difficulty,
    )