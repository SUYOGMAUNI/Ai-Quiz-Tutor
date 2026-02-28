"""Groq API calls + JSON parsing."""
import json
import re
import asyncio
import os
from typing import Any

from groq import Groq

SYSTEM_PROMPT = """You are an expert tutor and quiz generator. Given content extracted from a PDF, generate high-quality quiz questions.

Rules:
- Only generate questions from the provided content. Never use outside knowledge.
- Each question must have exactly 4 options (A, B, C, D).
- Only one correct answer per question.
- Vary difficulty: 40% easy, 40% medium, 20% hard.
- Never repeat questions.
- If content is insufficient, generate fewer questions rather than hallucinating.

Respond ONLY in this JSON format, no extra text:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "answer": "A",
      "explanation": "...",
      "difficulty": "easy|medium|hard"
    }
  ]
}
"""


def _user_message(chunk: str, n: int = 4) -> str:
    return f'''Content:
"""
{chunk}
"""

Generate {n} quiz questions from the content above.'''


from json_repair import repair_json

def _parse_json(response_text: str) -> list[dict[str, Any]]:
    text = response_text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = re.sub(r"^```\w*\n?", "", text).rstrip("`").strip()
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        print(f"[ERROR] No JSON object found: {text[:200]}")
        return []
    text = text[start:end]
    try:
        data = json.loads(repair_json(text))
        return data.get("questions", [])
    except Exception as e:
        print(f"[ERROR] JSON parse failed: {e} | snippet: {text[:200]}")
        return []

def _generate_sync(chunk: str, n: int = 4) -> list[dict[str, Any]]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return []
    client = Groq(api_key=api_key)
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _user_message(chunk, n)},
            ],
            temperature=0.3,
        )
        text = response.choices[0].message.content
        if not text:
            return []
        return _parse_json(text)
    except Exception as e:
        print(f"[ERROR] Groq chunk failed: {e}")
        return []


async def generate_questions_for_chunk(chunk: str, n: int = 4) -> list[dict[str, Any]]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _generate_sync, chunk, n)


async def generate_questions_for_chunks(chunks: list[str], questions_per_chunk: int = 4) -> list[dict[str, Any]]:
    all_questions = []
    batch_size = 2  # 3 chunks at a time to stay under 6000 TPM limit
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"[DEBUG] Processing batch {i // batch_size + 1}/{(len(chunks) + batch_size - 1) // batch_size}")
        tasks = [generate_questions_for_chunk(c, questions_per_chunk) for c in batch]
        results = await asyncio.gather(*tasks)
        for qlist in results:
            all_questions.extend(qlist)
        if i + batch_size < len(chunks):
            await asyncio.sleep(15)  # wait 15s between batches to reset TPM window
    print(f"[DEBUG] Total questions generated: {len(all_questions)}")
    return all_questions