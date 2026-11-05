from pathlib import Path
from uuid import uuid4
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text

from app.database import get_engine
from app.security import decode_access_token


router = APIRouter(prefix="/profile", tags=["profile"])

bearer_scheme = HTTPBearer(auto_error=False)

# Backend upload storage.
BACKEND_DIR = Path(__file__).resolve().parents[2]
PROFILE_PICTURE_DIR = BACKEND_DIR / "uploads" / "profile-pictures"

PROFILE_PICTURE_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 3 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "jpeg": {
        "extension": ".jpg",
        "signature": b"\xff\xd8\xff",
    },
    "png": {
        "extension": ".png",
        "signature": b"\x89PNG\r\n\x1a\n",
    },
}


def get_authenticated_user_id(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> str:
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

    return claims["sub"]


def identify_image(contents: bytes) -> tuple[str, str]:
    """Identify supported images using their actual file signatures."""

    if contents.startswith(b"\xff\xd8\xff"):
        return "jpeg", ".jpg"

    if contents.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png", ".png"

    if (
        len(contents) >= 12
        and contents[:4] == b"RIFF"
        and contents[8:12] == b"WEBP"
    ):
        return "webp", ".webp"

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported image. Please upload a JPEG, PNG or WebP image.",
    )


def delete_stored_picture(picture_url: str | None) -> None:
    """Delete only files inside our generated profile-picture directory."""

    if not picture_url:
        return

    prefix = "/media/profile-pictures/"

    if not picture_url.startswith(prefix):
        return

    filename = Path(picture_url).name
    picture_path = (PROFILE_PICTURE_DIR / filename).resolve()

    if picture_path.parent != PROFILE_PICTURE_DIR.resolve():
        return

    if picture_path.is_file():
        picture_path.unlink()


@router.post("/picture")
async def upload_profile_picture(
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
    file: Annotated[UploadFile, File(...)],
) -> dict[str, str]:
    contents = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty.",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="The image must not exceed 3 MB.",
        )

    image_type, extension = identify_image(contents)

    filename = f"{uuid4().hex}{extension}"
    picture_path = PROFILE_PICTURE_DIR / filename
    picture_url = f"/media/profile-pictures/{filename}"

    # Save the new image before updating the database.
    picture_path.write_bytes(contents)

    engine = get_engine()
    old_picture_url = None

    try:
        with engine.begin() as connection:
            user = connection.execute(
                text(
                    """
                    SELECT profile_picture_url
                    FROM users
                    WHERE id = :user_id
                    LIMIT 1
                    """
                ),
                {"user_id": user_id},
            ).mappings().first()

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User account not found.",
                )

            old_picture_url = user["profile_picture_url"]

            connection.execute(
                text(
                    """
                    UPDATE users
                    SET profile_picture_url = :picture_url,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :user_id
                    """
                ),
                {
                    "picture_url": picture_url,
                    "user_id": user_id,
                },
            )

    except Exception:
        if picture_path.is_file():
            picture_path.unlink()
        raise

    finally:
        engine.dispose()

    # Remove the previous image only after the database update succeeds.
    if old_picture_url and old_picture_url != picture_url:
        delete_stored_picture(old_picture_url)

    return {
        "message": "Profile picture updated successfully.",
        "profile_picture_url": picture_url,
    }


@router.delete("/picture")
def remove_profile_picture(
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> dict[str, str | None]:
    engine = get_engine()
    old_picture_url = None

    try:
        with engine.begin() as connection:
            user = connection.execute(
                text(
                    """
                    SELECT profile_picture_url
                    FROM users
                    WHERE id = :user_id
                    LIMIT 1
                    """
                ),
                {"user_id": user_id},
            ).mappings().first()

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User account not found.",
                )

            old_picture_url = user["profile_picture_url"]

            connection.execute(
                text(
                    """
                    UPDATE users
                    SET profile_picture_url = NULL,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :user_id
                    """
                ),
                {"user_id": user_id},
            )

    finally:
        engine.dispose()

    if old_picture_url:
        delete_stored_picture(old_picture_url)

    return {
        "message": "Profile picture removed successfully.",
        "profile_picture_url": None,
    }
