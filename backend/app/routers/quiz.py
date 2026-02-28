"""POST /quiz/generate, GET /quiz/{pdf_id}, POST /quiz/submit."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Question
from app.schemas.quiz import QuestionOutNoAnswer, QuizSubmit, QuizSubmitResponse
from app.utils.jwt import decode_token
from app.services.quiz import get_questions_for_quiz, record_attempt

router = APIRouter()


def _get_user_id(authorization: str | None = None) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(authorization.split()[1])
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return UUID(payload["sub"])


@router.post("/generate")
async def generate_quiz(
    pdf_id: UUID = Query(...),
    count: int = Query(10, ge=1, le=50),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    """Generate questions for a PDF (questions already created on upload; this can return existing or trigger re-gen)."""
    _get_user_id(authorization)
    # For MVP we generate on upload; this endpoint can return existing questions count
    return {"message": "Questions are generated on PDF upload.", "pdf_id": str(pdf_id)}


@router.get("/{pdf_id}", response_model=list[QuestionOutNoAnswer])
def get_quiz(
    pdf_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(authorization)
    questions = get_questions_for_quiz(db, pdf_id, user_id, limit=limit)
    return [
        QuestionOutNoAnswer(
            id=q.id,
            question=q.question,
            options=q.options,
            difficulty=q.difficulty,
        )
        for q in questions
    ]


@router.post("/submit", response_model=QuizSubmitResponse)
def submit_answer(
    body: QuizSubmit,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(authorization)
    is_correct, correct_answer, explanation = record_attempt(
        db, user_id, body.question_id, body.selected
    )
    return QuizSubmitResponse(
        is_correct=is_correct,
        correct_answer=correct_answer,
        explanation=explanation,
    )
