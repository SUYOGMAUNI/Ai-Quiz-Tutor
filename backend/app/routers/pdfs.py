"""POST /pdfs/upload, GET /pdfs/, DELETE /pdfs/{pdf_id}."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PDF, Question
from app.schemas.pdf import PDFOut
from app.utils.jwt import decode_token
from app.services.pdf_parser import extract_text_from_pdf, chunk_text, save_upload_file
from app.services.groq import generate_questions_for_chunks

router = APIRouter()


def _get_user_id(authorization: str | None = None) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(authorization.split()[1])
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return UUID(payload["sub"])


@router.post("/upload", response_model=PDFOut)
async def upload_pdf(
    file: UploadFile,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(authorization)
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF file required")
    contents = await file.read()
    path = save_upload_file(contents, file.filename)
    try:
        text = extract_text_from_pdf(path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}")
    chunks = chunk_text(text)
    print(f"[DEBUG] chunks: {len(chunks)}, first 200 chars: {chunks[0][:200] if chunks else 'EMPTY'}")
    if not chunks:
        raise HTTPException(status_code=400, detail="No text extracted from PDF")
    try:
        raw_questions = await generate_questions_for_chunks(chunks)
        print(f"[DEBUG] questions generated: {len(raw_questions)}")
        if raw_questions:
            print(f"[DEBUG] first question: {raw_questions[0]}")
    except Exception as e:
        print(f"[ERROR] Groq failed: {e}")
        raw_questions = []
    pdf_row = PDF(user_id=user_id, filename=file.filename, chunk_count=len(chunks))
    db.add(pdf_row)
    db.commit()
    db.refresh(pdf_row)
    for q in raw_questions:
        opt = q.get("options") or {}
        if isinstance(opt, list):
            opt = {k: v for k, v in enumerate(opt)}
        db.add(Question(
            pdf_id=pdf_row.id,
            question=q.get("question", ""),
            options=opt,
            answer=str(q.get("answer", "A"))[0].upper(),
            explanation=q.get("explanation", ""),
            difficulty=(q.get("difficulty") or "medium").lower()[:20],
        ))
    db.commit()
    print(f"[DEBUG] saved {len(raw_questions)} questions to DB for pdf {pdf_row.id}")
    return pdf_row


@router.delete("/{pdf_id}", status_code=204)
def delete_pdf(
    pdf_id: UUID,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(authorization)
    pdf = db.query(PDF).filter(PDF.id == pdf_id, PDF.user_id == user_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    db.delete(pdf)
    db.commit()


@router.get("/", response_model=list[PDFOut])
def list_pdfs(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(authorization)
    pdfs = db.query(PDF).filter(PDF.user_id == user_id).order_by(PDF.uploaded_at.desc()).all()
    return pdfs