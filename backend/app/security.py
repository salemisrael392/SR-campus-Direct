
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.config import get_settings


_password_hasher = PasswordHash.recommended()
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash a password securely before storing it."""
    return _password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check a password against its stored hash."""
    try:
        return _password_hasher.verify(password, password_hash)
    except (ValueError, TypeError):
        return False


def create_access_token(
    subject: str,
    secret_key: str | None = None,
    expires_minutes: int | None = None,
) -> str:
    """Create a signed, short-lived JWT for an authenticated user."""
    settings = get_settings()
    signing_key = secret_key or settings.auth_secret_key

    if not signing_key:
        raise RuntimeError(
            "AUTH_SECRET_KEY is not configured. "
            "Set it in the backend environment."
        )

    lifetime = (
        expires_minutes
        if expires_minutes is not None
        else settings.access_token_expire_minutes
    )

    if lifetime <= 0:
        raise ValueError("Token lifetime must be greater than zero.")

    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=lifetime),
    }

    return jwt.encode(payload, signing_key, algorithm=ALGORITHM)


def decode_access_token(
    token: str,
    secret_key: str | None = None,
) -> dict[str, Any] | None:
    """Validate a JWT and return its claims, or None if invalid."""
    settings = get_settings()
    signing_key = secret_key or settings.auth_secret_key

    if not signing_key:
        raise RuntimeError(
            "AUTH_SECRET_KEY is not configured. "
            "Set it in the backend environment."
        )

    try:
        return jwt.decode(
            token,
            signing_key,
            algorithms=[ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )
    except InvalidTokenError:
        return None
