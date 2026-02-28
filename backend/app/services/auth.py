"""Password hashing, token creation."""
from passlib.context import CryptContext
from app.utils.jwt import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain[:72], hashed)

def get_token_for_user(user_id: str) -> str:
    return create_access_token(data={"sub": str(user_id)})
