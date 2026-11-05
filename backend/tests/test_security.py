
import time

from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_is_hashed_and_can_be_verified() -> None:
    password = "Example-Password-123!"
    password_hash = hash_password(password)

    assert password_hash != password
    assert verify_password(password, password_hash)
    assert not verify_password("Wrong-Password-123!", password_hash)


def test_access_token_contains_user_id() -> None:
    token = create_access_token(
        subject="test-user-123",
        secret_key="test-secret-key-for-unit-tests",
    )

    claims = decode_access_token(
        token,
        secret_key="test-secret-key-for-unit-tests",
    )

    assert claims is not None
    assert claims["sub"] == "test-user-123"


def test_access_token_rejects_wrong_secret() -> None:
    token = create_access_token(
        subject="test-user-123",
        secret_key="correct-test-secret",
    )

    claims = decode_access_token(
        token,
        secret_key="different-test-secret",
    )

    assert claims is None


def test_access_token_expires() -> None:
    token = create_access_token(
        subject="test-user-123",
        secret_key="test-secret-key-for-unit-tests",
        expires_minutes=1,
    )

    # Decode after expiry by waiting is unnecessary: verify an expired
    # token by creating one with an expiration in the past.
    import jwt

    expired_token = jwt.encode(
        {"sub": "test-user-123", "iat": int(time.time()) - 120,
         "exp": int(time.time()) - 60},
        "test-secret-key-for-unit-tests",
        algorithm="HS256",
    )

    assert decode_access_token(
        expired_token,
        secret_key="test-secret-key-for-unit-tests",
    ) is None

    # The freshly created token should still be valid.
    assert decode_access_token(
        token,
        secret_key="test-secret-key-for-unit-tests",
    ) is not None
