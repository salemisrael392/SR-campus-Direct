from datetime import datetime, time
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import text

from app.database import get_engine
from app.security import decode_access_token


router = APIRouter(prefix="/timetable", tags=["timetable"])
bearer_scheme = HTTPBearer(auto_error=False)

WEEKDAY_NAMES = {
    1: "MON",
    2: "TUE",
    3: "WED",
    4: "THU",
    5: "FRI",
    6: "SAT",
    7: "SUN",
}

WEEKDAY_NUMBERS = {value: key for key, value in WEEKDAY_NAMES.items()}


class TimetableEntryCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=200)
    day: str = Field(pattern=r"^(MON|TUE|WED|THU|FRI|SAT|SUN)$")
    start_time: str = Field(pattern=r"^\d{1,2}:\d{2}\s*(AM|PM)$")
    end_time: str = Field(pattern=r"^\d{1,2}:\d{2}\s*(AM|PM)$")
    lecturer: str | None = Field(default=None, max_length=120)
    room: str | None = Field(default=None, max_length=200)


class TimetableEntryResponse(BaseModel):
    id: str
    code: str
    title: str
    day: str
    start_time: str
    end_time: str
    lecturer: str | None = None
    room: str | None = None
    source: Literal["manual", "upload", "official"]


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


def has_active_srux_import(connection, user_id: str) -> bool:
    """Check whether this student currently subscribes to an SRUX timetable."""
    result = connection.execute(
        text(
            """
            SELECT 1
            FROM timetable_imports
            WHERE user_id = :user_id
              AND source = 'srux'
            LIMIT 1
            """
        ),
        {"user_id": user_id},
    ).first()

    return result is not None


def get_owned_entry(connection, entry_id: str, user_id: str):
    """Find an entry belonging to the signed-in student."""
    return connection.execute(
        text(
            """
            SELECT id, source
            FROM personal_timetable_entries
            WHERE id = :id
              AND user_id = :user_id
            """
        ),
        {"id": entry_id, "user_id": user_id},
    ).mappings().first()


def ensure_manual_entry(connection, entry_id: str, user_id: str) -> None:
    """
    Protect official entries and prevent manual changes while SRUX is active.

    Ownership is checked first so one student cannot discover another
    student's timetable entry through the response.
    """
    entry = get_owned_entry(connection, entry_id, user_id)

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found.",
        )

    if entry["source"] != "manual":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Official SRUX classes cannot be edited or deleted individually. Unsubscribe from the SRUX timetable to remove them.",
        )

    if has_active_srux_import(connection, user_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Manual timetable changes are unavailable while your official SRUX timetable is active.",
        )


def parse_time(value: str) -> time:
    """Parse a 12-hour time string into a datetime.time object."""
    try:
        return datetime.strptime(value.strip(), "%I:%M %p").time()
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Times must use a valid 12-hour format, such as 09:30 AM.",
        ) from exc


def format_time(value: time | str) -> str:
    """Format a database time as a 12-hour time string."""
    if isinstance(value, str):
        value = time.fromisoformat(value)

    return value.strftime("%I:%M %p")


def validate_entry(payload: TimetableEntryCreate) -> dict:
    """Normalize and validate the fields shared by create and update."""
    code = payload.code.strip().upper()
    title = payload.title.strip()
    lecturer = payload.lecturer.strip() if payload.lecturer else None
    room = payload.room.strip() if payload.room else None

    if not code or not title:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Course code and title cannot be blank.",
        )

    start = parse_time(payload.start_time)
    end = parse_time(payload.end_time)

    start_minutes = start.hour * 60 + start.minute
    end_minutes = end.hour * 60 + end.minute

    if start_minutes >= end_minutes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The class end time must be after its start time.",
        )

    return {
        "code": code,
        "title": title,
        "weekday": WEEKDAY_NUMBERS[payload.day],
        "start_time": start.strftime("%H:%M:%S"),
        "end_time": end.strftime("%H:%M:%S"),
        "lecturer": lecturer or None,
        "room": room or None,
    }


def row_to_response(row) -> TimetableEntryResponse:
    return TimetableEntryResponse(
        id=row["id"],
        code=row["course_code"] or "",
        title=row["title"],
        day=WEEKDAY_NAMES[row["weekday"]],
        start_time=format_time(row["start_time"]),
        end_time=format_time(row["end_time"]),
        lecturer=row["lecturer"],
        room=row["room_label"],
        source=row["source"],
    )


@router.get("", response_model=list[TimetableEntryResponse])
def list_timetable(
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> list[TimetableEntryResponse]:
    engine = get_engine()

    try:
        with engine.connect() as connection:
            active_srux = has_active_srux_import(connection, user_id)

            if active_srux:
                # Keep manual records in the database, but do not display
                # them while the student is subscribed to the official feed.
                rows = connection.execute(
                    text(
                        """
                        SELECT id, course_code, title, weekday,
                               start_time, end_time, lecturer, room_label,
                               source
                        FROM personal_timetable_entries
                        WHERE user_id = :user_id
                          AND source != 'manual'
                        ORDER BY weekday, start_time
                        """
                    ),
                    {"user_id": user_id},
                ).mappings().all()
            else:
                rows = connection.execute(
                    text(
                        """
                        SELECT id, course_code, title, weekday,
                               start_time, end_time, lecturer, room_label,
                               source
                        FROM personal_timetable_entries
                        WHERE user_id = :user_id
                        ORDER BY weekday, start_time
                        """
                    ),
                    {"user_id": user_id},
                ).mappings().all()

        return [row_to_response(row) for row in rows]

    finally:
        engine.dispose()


@router.post(
    "",
    response_model=TimetableEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_timetable_entry(
    payload: TimetableEntryCreate,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> TimetableEntryResponse:
    fields = validate_entry(payload)
    entry_id = str(uuid4())

    engine = get_engine()

    try:
        with engine.begin() as connection:
            if has_active_srux_import(connection, user_id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Manual timetable creation is unavailable while your official SRUX timetable is active.",
                )

            connection.execute(
                text(
                    """
                    INSERT INTO personal_timetable_entries (
                        id, user_id, course_code, title, weekday,
                        start_time, end_time, lecturer, room_label,
                        source, created_at, updated_at
                    )
                    VALUES (
                        :id, :user_id, :code, :title, :weekday,
                        :start_time, :end_time, :lecturer, :room,
                        'manual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "id": entry_id,
                    "user_id": user_id,
                    **fields,
                    "room": fields["room"],
                },
            )

            row = connection.execute(
                text(
                    """
                    SELECT id, course_code, title, weekday,
                           start_time, end_time, lecturer, room_label,
                           source
                    FROM personal_timetable_entries
                    WHERE id = :id
                      AND user_id = :user_id
                    """
                ),
                {"id": entry_id, "user_id": user_id},
            ).mappings().one()

        return row_to_response(row)

    finally:
        engine.dispose()


@router.put("/{entry_id}", response_model=TimetableEntryResponse)
def update_timetable_entry(
    entry_id: str,
    payload: TimetableEntryCreate,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> TimetableEntryResponse:
    """Update a manual timetable entry belonging to the signed-in user."""
    fields = validate_entry(payload)
    engine = get_engine()

    try:
        with engine.begin() as connection:
            ensure_manual_entry(connection, entry_id, user_id)

            connection.execute(
                text(
                    """
                    UPDATE personal_timetable_entries
                    SET course_code = :code,
                        title = :title,
                        weekday = :weekday,
                        start_time = :start_time,
                        end_time = :end_time,
                        lecturer = :lecturer,
                        room_label = :room,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                      AND user_id = :user_id
                      AND source = 'manual'
                    """
                ),
                {
                    "id": entry_id,
                    "user_id": user_id,
                    **fields,
                    "room": fields["room"],
                },
            )

            row = connection.execute(
                text(
                    """
                    SELECT id, course_code, title, weekday,
                           start_time, end_time, lecturer, room_label,
                           source
                    FROM personal_timetable_entries
                    WHERE id = :id
                      AND user_id = :user_id
                    """
                ),
                {"id": entry_id, "user_id": user_id},
            ).mappings().one()

        return row_to_response(row)

    finally:
        engine.dispose()


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable_entry(
    entry_id: str,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> None:
    engine = get_engine()

    try:
        with engine.begin() as connection:
            ensure_manual_entry(connection, entry_id, user_id)

            connection.execute(
                text(
                    """
                    DELETE FROM personal_timetable_entries
                    WHERE id = :id
                      AND user_id = :user_id
                      AND source = 'manual'
                    """
                ),
                {"id": entry_id, "user_id": user_id},
            )

    finally:
        engine.dispose()
