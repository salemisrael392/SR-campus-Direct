
"""Authenticated SRUX timetable preview and subscription endpoints."""

import hashlib
import json
from typing import Annotated, Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.database import get_engine
from app.routes.timetable import get_authenticated_user_id
from app.services.srux import (
    SruxError,
    fetch_options,
    fetch_timetable,
    validate_selection,
)


router = APIRouter(prefix="/srux", tags=["SRUX timetable"])


class SruxSyncSafetyError(Exception):
    """Raised when an incoming feed appears dangerously incomplete."""


class SruxImportRequest(BaseModel):
    degree: str = Field(min_length=1, max_length=120)
    academic_year: str = Field(min_length=1, max_length=120)
    batch_id: str = Field(min_length=1, max_length=80)


def _srux_error(exc: SruxError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(exc),
    )


def _validate_request_selection(payload: SruxImportRequest) -> None:
    try:
        validate_selection(
            payload.degree.strip(),
            payload.academic_year.strip(),
            payload.batch_id.strip(),
        )
    except SruxError as exc:
        raise _srux_error(exc) from exc


def _fetch_validated_timetable(batch_id: str) -> dict[str, Any]:
    try:
        result = fetch_timetable(batch_id)
    except SruxError as exc:
        raise _srux_error(exc) from exc

    if not result["classes"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "The selected SRUX timetable currently contains no classes. "
                "No subscription or timetable changes were made."
            ),
        )

    return result


def _class_hash(item: dict[str, Any]) -> str:
    """Stable hash of the fields that affect a displayed class."""
    content = {
        "code": item["code"],
        "title": item["title"],
        "day": item["weekday"],
        "start_time": item["start_time"],
        "end_time": item["end_time"],
        "lecturer": item["lecturer"],
        "room": item["room"],
    }

    serialized = json.dumps(
        content,
        sort_keys=True,
        separators=(",", ":"),
    )

    return hashlib.sha256(
        serialized.encode("utf-8")
    ).hexdigest()


def _subscription_response(row: Any) -> dict[str, Any]:
    return {
        "id": row["id"],
        "degree": row["degree"],
        "academic_year": row["academic_year"],
        "batch_id": row["batch_id"],
        "source_last_updated": row["source_last_updated"],
        "last_checked_at": row["last_checked_at"],
        "last_successful_sync_at": row["last_successful_sync_at"],
        "sync_status": row["sync_status"],
        "last_error": row["last_error"],
    }


def _get_owned_import(connection, import_id: str, user_id: str):
    """Retrieve a subscription belonging to the authenticated user."""
    row = connection.execute(
        text(
            """
            SELECT id, user_id, degree, academic_year, batch_id,
                   source_etag, source_last_modified, source_last_updated,
                   last_checked_at, last_successful_sync_at,
                   sync_status, last_error
            FROM timetable_imports
            WHERE id = :import_id AND user_id = :user_id
            """
        ),
        {
            "import_id": import_id,
            "user_id": user_id,
        },
    ).mappings().first()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SRUX subscription not found.",
        )

    return row


def _synchronize_import(
    connection,
    import_row,
    timetable: dict[str, Any],
) -> dict[str, int]:
    """
    Apply a complete validated feed.

    All database changes happen inside the caller's transaction.
    Suspiciously incomplete feeds are rejected before modifications.
    """
    import_id = import_row["id"]
    user_id = import_row["user_id"]

    existing_rows = connection.execute(
        text(
            """
            SELECT
                mappings.id AS mapping_id,
                mappings.source_record_id,
                mappings.source_hash,
                entries.id AS entry_id
            FROM timetable_import_entries AS mappings
            JOIN personal_timetable_entries AS entries
              ON entries.id = mappings.timetable_entry_id
            WHERE mappings.import_id = :import_id
            """
        ),
        {
            "import_id": import_id,
        },
    ).mappings().all()

    # ---------------------------------------------------------
    # SAFETY CHECK
    # ---------------------------------------------------------
    # Do not accept an incoming timetable that has lost more
    # than 50% of its previously imported classes.
    #
    # This check happens BEFORE inserting, updating or deleting
    # any timetable records.
    #
    # The minimum of six existing classes avoids applying this
    # percentage rule to very small timetables.
    # ---------------------------------------------------------

    existing_count = len(existing_rows)
    incoming_count = len(timetable["classes"])

    if (
        existing_count >= 6
        and incoming_count * 2 < existing_count
    ):
        raise SruxSyncSafetyError(
            "SRUX returned substantially fewer classes than the "
            "last successful timetable. The existing timetable "
            "has been preserved for safety."
        )

    existing = {
        row["source_record_id"]: row
        for row in existing_rows
    }

    incoming_ids: set[str] = set()

    added = 0
    updated = 0
    unchanged = 0

    # ---------------------------------------------------------
    # INSERT NEW CLASSES AND UPDATE CHANGED CLASSES
    # ---------------------------------------------------------

    for item in timetable["classes"]:
        source_id = item["source_record_id"]

        incoming_ids.add(source_id)

        current_hash = _class_hash(item)
        old = existing.get(source_id)

        # New official class.
        if old is None:
            entry_id = str(uuid4())
            mapping_id = str(uuid4())

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
                        'official', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "id": entry_id,
                    "user_id": user_id,
                    "code": item["code"] or None,
                    "title": item["title"],
                    "weekday": item["weekday"],
                    "start_time": item["start_time"],
                    "end_time": item["end_time"],
                    "lecturer": item["lecturer"],
                    "room": item["room"],
                },
            )

            connection.execute(
                text(
                    """
                    INSERT INTO timetable_import_entries (
                        id, import_id, timetable_entry_id,
                        source_record_id, source_hash,
                        created_at, updated_at
                    )
                    VALUES (
                        :id, :import_id, :entry_id,
                        :source_id, :source_hash,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "id": mapping_id,
                    "import_id": import_id,
                    "entry_id": entry_id,
                    "source_id": source_id,
                    "source_hash": current_hash,
                },
            )

            added += 1
            continue

        # Existing class has not changed.
        if old["source_hash"] == current_hash:
            unchanged += 1
            continue

        # Existing class has changed.
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
                WHERE id = :entry_id
                  AND user_id = :user_id
                  AND source = 'official'
                """
            ),
            {
                "entry_id": old["entry_id"],
                "user_id": user_id,
                "code": item["code"] or None,
                "title": item["title"],
                "weekday": item["weekday"],
                "start_time": item["start_time"],
                "end_time": item["end_time"],
                "lecturer": item["lecturer"],
                "room": item["room"],
            },
        )

        connection.execute(
            text(
                """
                UPDATE timetable_import_entries
                SET source_hash = :source_hash,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :mapping_id
                """
            ),
            {
                "source_hash": current_hash,
                "mapping_id": old["mapping_id"],
            },
        )

        updated += 1

    # ---------------------------------------------------------
    # REMOVE CLASSES NO LONGER PRESENT IN THE COMPLETE FEED
    # ---------------------------------------------------------

    removed = 0

    for source_id, old in existing.items():
        if source_id in incoming_ids:
            continue

        connection.execute(
            text(
                """
                DELETE FROM personal_timetable_entries
                WHERE id = :entry_id
                  AND user_id = :user_id
                  AND source = 'official'
                """
            ),
            {
                "entry_id": old["entry_id"],
                "user_id": user_id,
            },
        )

        removed += 1

    # ---------------------------------------------------------
    # UPDATE SUBSCRIPTION STATUS AFTER SUCCESSFUL SYNCHRONIZATION
    # ---------------------------------------------------------

    connection.execute(
        text(
            """
            UPDATE timetable_imports
            SET source_last_updated = :source_updated,
                last_checked_at = CURRENT_TIMESTAMP,
                last_successful_sync_at = CURRENT_TIMESTAMP,
                sync_status = 'synced',
                last_error = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :import_id AND user_id = :user_id
            """
        ),
        {
            "source_updated": timetable["source_last_updated"],
            "import_id": import_id,
            "user_id": user_id,
        },
    )

    return {
        "added": added,
        "updated": updated,
        "unchanged": unchanged,
        "removed": removed,
        "total": len(timetable["classes"]),
    }


# =============================================================
# SRUX OPTIONS
# =============================================================

@router.get("/options")
def get_srux_options(
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> dict[str, Any]:
    del user_id

    try:
        return {
            "degrees": fetch_options(),
        }
    except SruxError as exc:
        raise _srux_error(exc) from exc


# =============================================================
# SRUX TIMETABLE PREVIEW
# =============================================================

@router.get("/timetable/{batch_id}")
def preview_srux_timetable(
    batch_id: str,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
    degree: str = Query(min_length=1, max_length=120),
    academic_year: str = Query(min_length=1, max_length=120),
) -> dict[str, Any]:
    del user_id

    payload = SruxImportRequest(
        degree=degree,
        academic_year=academic_year,
        batch_id=batch_id,
    )

    _validate_request_selection(payload)

    timetable = _fetch_validated_timetable(batch_id)

    if (
        timetable["degree"] != degree
        or (timetable["academic_year"] is not None and timetable["academic_year"] != academic_year)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "The SRUX timetable details do not match "
                "the selected batch."
            ),
        )

    return timetable


# =============================================================
# SUBSCRIBE TO SRUX
# =============================================================

@router.post("/import", status_code=status.HTTP_201_CREATED)
def subscribe_to_srux(
    payload: SruxImportRequest,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> dict[str, Any]:
    payload = SruxImportRequest(
        degree=payload.degree.strip(),
        academic_year=payload.academic_year.strip(),
        batch_id=payload.batch_id.strip(),
    )

    _validate_request_selection(payload)

    timetable = _fetch_validated_timetable(payload.batch_id)

    if (
        timetable["degree"] != payload.degree
        or (timetable["academic_year"] is not None and timetable["academic_year"] != payload.academic_year)
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "The SRUX timetable does not match "
                "the selected degree and year."
            ),
        )

    import_id = str(uuid4())
    engine = get_engine()

    try:
        with engine.begin() as connection:
            existing = connection.execute(
                text(
                    """
                    SELECT id
                    FROM timetable_imports
                    WHERE user_id = :user_id
                    """
                ),
                {
                    "user_id": user_id,
                },
            ).first()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "You already have an active SRUX timetable. "
                        "Refresh it or unsubscribe before selecting "
                        "another batch."
                    ),
                )

            connection.execute(
                text(
                    """
                    INSERT INTO timetable_imports (
                        id, user_id, source, degree, academic_year,
                        batch_id, source_last_updated,
                        last_checked_at, last_successful_sync_at,
                        sync_status, created_at, updated_at
                    )
                    VALUES (
                        :id, :user_id, 'srux', :degree, :academic_year,
                        :batch_id, :source_updated,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
                        'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "id": import_id,
                    "user_id": user_id,
                    "degree": payload.degree,
                    "academic_year": payload.academic_year,
                    "batch_id": payload.batch_id,
                    "source_updated": timetable["source_last_updated"],
                },
            )

            import_row = {
                "id": import_id,
                "user_id": user_id,
            }

            counts = _synchronize_import(
                connection,
                import_row,
                timetable,
            )

            row = connection.execute(
                text(
                    """
                    SELECT id, degree, academic_year, batch_id,
                           source_last_updated, last_checked_at,
                           last_successful_sync_at, sync_status, last_error
                    FROM timetable_imports
                    WHERE id = :id AND user_id = :user_id
                    """
                ),
                {
                    "id": import_id,
                    "user_id": user_id,
                },
            ).mappings().one()

        return {
            "subscription": _subscription_response(row),
            "sync": counts,
        }

    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An SRUX timetable subscription already exists.",
        ) from exc

    finally:
        engine.dispose()


# =============================================================
# LIST ACTIVE SRUX SUBSCRIPTIONS
# =============================================================

@router.get("/imports")
def list_srux_imports(
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> dict[str, Any]:
    engine = get_engine()

    try:
        with engine.connect() as connection:
            rows = connection.execute(
                text(
                    """
                    SELECT id, degree, academic_year, batch_id,
                           source_last_updated, last_checked_at,
                           last_successful_sync_at, sync_status, last_error
                    FROM timetable_imports
                    WHERE user_id = :user_id
                    ORDER BY created_at DESC
                    """
                ),
                {
                    "user_id": user_id,
                },
            ).mappings().all()

        return {
            "imports": [
                _subscription_response(row)
                for row in rows
            ]
        }

    finally:
        engine.dispose()


# =============================================================
# GET SUBSCRIPTION STATUS
# =============================================================

@router.get("/imports/{import_id}/status")
def get_srux_import_status(
    import_id: str,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> dict[str, Any]:
    engine = get_engine()

    try:
        with engine.connect() as connection:
            row = _get_owned_import(
                connection,
                import_id,
                user_id,
            )

        return _subscription_response(row)

    finally:
        engine.dispose()


# =============================================================
# REFRESH SRUX SUBSCRIPTION
# =============================================================

@router.post("/imports/{import_id}/refresh")
def refresh_srux_import(
    import_id: str,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> dict[str, Any]:
    engine = get_engine()

    try:
        with engine.connect() as connection:
            import_row = _get_owned_import(
                connection,
                import_id,
                user_id,
            )

        timetable = _fetch_validated_timetable(
            import_row["batch_id"]
        )

        if (
            timetable["degree"] != import_row["degree"]
            or (timetable["academic_year"] is not None and timetable["academic_year"] != import_row["academic_year"])
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "SRUX returned timetable details that do not "
                    "match your subscription."
                ),
            )

        with engine.begin() as connection:
            current = _get_owned_import(
                connection,
                import_id,
                user_id,
            )

            counts = _synchronize_import(
                connection,
                current,
                timetable,
            )

            row = connection.execute(
                text(
                    """
                    SELECT id, degree, academic_year, batch_id,
                           source_last_updated, last_checked_at,
                           last_successful_sync_at, sync_status, last_error
                    FROM timetable_imports
                    WHERE id = :id AND user_id = :user_id
                    """
                ),
                {
                    "id": import_id,
                    "user_id": user_id,
                },
            ).mappings().one()

        return {
            "subscription": _subscription_response(row),
            "sync": counts,
        }

    except SruxSyncSafetyError as exc:
        error_message = str(exc)[:500]

        # The synchronization transaction has rolled back.
        # Only the subscription status is changed here.
        # Existing timetable classes remain untouched.
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    UPDATE timetable_imports
                    SET sync_status = 'stale',
                        last_error = :error,
                        last_checked_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id AND user_id = :user_id
                    """
                ),
                {
                    "error": error_message,
                    "id": import_id,
                    "user_id": user_id,
                },
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=error_message,
        ) from exc

    except HTTPException as exc:
        if exc.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
            with engine.begin() as connection:
                connection.execute(
                    text(
                        """
                        UPDATE timetable_imports
                        SET sync_status = 'stale',
                            last_error = :error,
                            last_checked_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id AND user_id = :user_id
                        """
                    ),
                    {
                        "error": str(exc.detail)[:500],
                        "id": import_id,
                        "user_id": user_id,
                    },
                )

        raise

    finally:
        engine.dispose()


# =============================================================
# UNSUBSCRIBE FROM SRUX
# =============================================================

@router.delete(
    "/imports/{import_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def unsubscribe_from_srux(
    import_id: str,
    user_id: Annotated[str, Depends(get_authenticated_user_id)],
) -> None:
    engine = get_engine()

    try:
        with engine.begin() as connection:
            _get_owned_import(
                connection,
                import_id,
                user_id,
            )

            # Remove only official entries mapped to this subscription.
            # Manual timetable entries are deliberately preserved.
            connection.execute(
                text(
                    """
                    DELETE FROM personal_timetable_entries
                    WHERE source = 'official'
                      AND user_id = :user_id
                      AND id IN (
                          SELECT timetable_entry_id
                          FROM timetable_import_entries
                          WHERE import_id = :import_id
                      )
                    """
                ),
                {
                    "user_id": user_id,
                    "import_id": import_id,
                },
            )

            connection.execute(
                text(
                    """
                    DELETE FROM timetable_imports
                    WHERE id = :id AND user_id = :user_id
                    """
                ),
                {
                    "id": import_id,
                    "user_id": user_id,
                },
            )

    finally:
        engine.dispose()
