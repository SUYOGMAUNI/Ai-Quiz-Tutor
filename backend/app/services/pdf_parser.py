"""PyMuPDF extraction + chunking logic."""
import os
import re
from pathlib import Path

import fitz  # PyMuPDF
from app.config import settings

# ~4 chars per token for English
CHARS_PER_TOKEN = 4
MAX_CHARS = settings.max_chunk_tokens * CHARS_PER_TOKEN
OVERLAP_CHARS = 100 * CHARS_PER_TOKEN


def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    return "\n\n".join(text_parts)


def chunk_text(text: str, max_chars: int = MAX_CHARS, overlap: int = OVERLAP_CHARS) -> list[str]:
    if not text or not text.strip():
        return []
    chunks = []
    start = 0
    text = text.strip()
    while start < len(text):
        end = start + max_chars
        if end < len(text):
            # Try to break at sentence or paragraph
            chunk = text[start:end]
            last_break = max(
                chunk.rfind("\n\n"),
                chunk.rfind(". "),
                chunk.rfind("? "),
                chunk.rfind("! "),
            )
            if last_break > max_chars // 2:
                end = start + last_break + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < len(text) else len(text)
    return chunks


def save_upload_file(file_content: bytes, filename: str, upload_dir: str | None = None) -> str:
    upload_dir = upload_dir or settings.upload_dir
    Path(upload_dir).mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r'[^\w\s.-]', '_', filename)[:200]
    path = os.path.join(upload_dir, safe_name)
    with open(path, "wb") as f:
        f.write(file_content)
    return path
