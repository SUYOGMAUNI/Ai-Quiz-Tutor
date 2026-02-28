"""Pydantic schemas for score stats."""
from pydantic import BaseModel
from typing import Dict, Any, Optional


class StatsOut(BaseModel):
    total_attempts: int
    correct_count: int
    accuracy_percent: float
    by_difficulty: Optional[Dict[str, Any]] = None
