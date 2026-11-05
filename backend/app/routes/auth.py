
from uuid import uuid4
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.config import get_settings
from app.database import get_engine
from app.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["authentication"])
bearer_scheme = HTTPBearer(auto_error=False)


def _issue_auth_response(
    user_id: str,
    email: str,
    name: str | None,
    email_verified: bool,
) -> AuthResponse:
    settings = get_settings()

    return AuthResponse(
        access_token=create_access_token(subject=user_id),
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse(
            id=user_id,
            email=email,
            name=name,
            email_verified=email_verified,
        ),
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest) -> AuthResponse:
    settings = get_settings()

    if settings.require_email_verification:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email verification is required but is not yet available.",
        )

    email = str(payload.email).strip().lower()
    email_domain = email.rsplit("@", 1)[-1]
    allowed_domain = settings.normalized_university_email_domain

    if not allowed_domain or email_domain != allowed_domain:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is limited to the configured university email domain.",
        )

    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Name must contain at least two non-space characters.",
        )

    user_id = str(uuid4())
    password_hash = hash_password(payload.password)
    engine = get_engine()

    try:
        with engine.begin() as connection:
            existing_user = connection.execute(
                text(
                    """
                    SELECT id
                    FROM users
                    WHERE LOWER(email) = :email
                    LIMIT 1
                    """
                ),
                {"email": email},
            ).first()

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists.",
                )

            connection.execute(
                text(
                    """
                    INSERT INTO users (
                        id, email, name, created_at, updated_at
                    )
                    VALUES (
                        :id, :email, :name,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {"id": user_id, "email": email, "name": name},
            )

            connection.execute(
                text(
                    """
                    INSERT INTO user_credentials (
                        user_id, password_hash, created_at, updated_at
                    )
                    VALUES (
                        :user_id, :password_hash,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "user_id": user_id,
                    "password_hash": password_hash,
                },
            )

    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from exc
    finally:
        engine.dispose()

    return _issue_auth_response(
        user_id=user_id,
        email=email,
        name=name,
        email_verified=False,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    email = str(payload.email).strip().lower()
    engine = get_engine()

    try:
        with engine.connect() as connection:
            row = connection.execute(
                text(
                    """
                    SELECT
                        users.id,
                        users.email,
                        users.name,
                        users.email_verified_at,
                        user_credentials.password_hash
                    FROM users
                    JOIN user_credentials
                      ON user_credentials.user_id = users.id
                    WHERE LOWER(users.email) = :email
                    LIMIT 1
                    """
                ),
                {"email": email},
            ).mappings().first()
    finally:
        engine.dispose()

    if row is None or not verify_password(
        payload.password,
        row["password_hash"] if row else "",
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()
    email_verified = row["email_verified_at"] is not None

    if settings.require_email_verification and not email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your university email before logging in.",
        )

    if not row["email"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return _issue_auth_response(
        user_id=row["id"],
        email=row["email"],
        name=row["name"],
        email_verified=email_verified,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> UserResponse:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    claims = decode_access_token(credentials.credentials)

    if not claims or not isinstance(claims.get("sub"), str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    engine = get_engine()

    try:
        with engine.connect() as connection:
            row = connection.execute(
                text(
                    """
                    SELECT id, email, name, email_verified_at
                    FROM users
                    WHERE id = :user_id
                    LIMIT 1
                    """
                ),
                {"user_id": claims["sub"]},
            ).mappings().first()
    finally:
        engine.dispose()

    if row is None or not row["email"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserResponse(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        email_verified=row["email_verified_at"] is not None,
    )
