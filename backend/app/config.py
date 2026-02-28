"""Settings loaded from .env."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://quizuser:quizpass@db:5432/quiztutor"
    secret_key: str = "your-strong-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    gemini_api_key: str = ""
    upload_dir: str = "uploads"
    max_chunk_tokens: int = 1500

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
