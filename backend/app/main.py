"""FastAPI app entry, CORS, router registration."""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, pdfs, quiz, stats

app = FastAPI(title="AI Quiz Tutor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(pdfs.router, prefix="/pdfs", tags=["pdfs"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])


@app.get("/")
def root():
    return {"message": "AI Quiz Tutor API", "docs": "/docs"}