
"""Safe client and validator for the public SRUX timetable feed."""

from datetime import date, datetime, time, timedelta
import json
import re
from typing import Any

import httpx


SRUX_BASE_URL = "https://www.srux.in"
OPTIONS_URL = f"{SRUX_BASE_URL}/timetable_options.json"

REQUEST_TIMEOUT_SECONDS = 8.0
MAX_RESPONSE_BYTES = 2_000_000
MAX_CLASSES_PER_BATCH = 300

DAY_NUMBERS = {
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
    "Sunday": 7,
}

BATCH_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,80}$")


class SruxError(Exception):
    """A safe, user-displayable SRUX integration error."""


def _fetch_json(url: str) -> dict[str, Any]:
    """Fetch a bounded JSON response from the fixed SRUX host."""

    try:
        with httpx.Client(
            timeout=REQUEST_TIMEOUT_SECONDS,
            follow_redirects=False,
            headers={"Accept": "application/json"},
        ) as client:
            with client.stream("GET", url) as response:
                response.raise_for_status()

                content_length = response.headers.get("content-length")

                if content_length:
                    try:
                        if int(content_length) > MAX_RESPONSE_BYTES:
                            raise SruxError(
                                "The SRUX response is larger than expected."
                            )
                    except ValueError:
                        pass

                body = bytearray()

                for chunk in response.iter_bytes():
                    body.extend(chunk)

                    if len(body) > MAX_RESPONSE_BYTES:
                        raise SruxError(
                            "The SRUX response is larger than expected."
                        )

                payload = json.loads(body)

    except SruxError:
        raise

    except (httpx.HTTPError, ValueError) as exc:
        raise SruxError(
            "SRUX is temporarily unavailable or returned invalid data."
        ) from exc

    if not isinstance(payload, dict):
        raise SruxError(
            "SRUX returned an unexpected response format."
        )

    return payload


def fetch_options() -> list[dict[str, Any]]:
    """Return validated degree/year/batch options from SRUX."""

    raw = _fetch_json(OPTIONS_URL)

    options: list[dict[str, Any]] = []

    for degree, years in sorted(raw.items()):

        if not isinstance(degree, str) or not isinstance(years, dict):
            continue

        year_options = []

        for academic_year, batches in sorted(years.items()):

            if not isinstance(academic_year, str):
                continue

            if not isinstance(batches, list):
                continue

            valid_batches = sorted(
                {
                    batch.strip()
                    for batch in batches
                    if isinstance(batch, str)
                    and BATCH_ID_PATTERN.fullmatch(batch.strip())
                }
            )

            if valid_batches:
                year_options.append(
                    {
                        "year": academic_year,
                        "batches": valid_batches,
                    }
                )

        if year_options:
            options.append(
                {
                    "degree": degree,
                    "years": year_options,
                }
            )

    if not options:
        raise SruxError(
            "SRUX did not provide any usable batch options."
        )

    return options


def validate_selection(
    degree: str,
    academic_year: str,
    batch_id: str,
) -> None:
    """Require the requested batch to appear in the official options feed."""

    if not BATCH_ID_PATTERN.fullmatch(batch_id):
        raise SruxError("The selected SRUX batch is invalid.")

    options = fetch_options()

    for degree_option in options:

        if degree_option["degree"] != degree:
            continue

        for year_option in degree_option["years"]:

            if year_option["year"] == academic_year:
                if batch_id in year_option["batches"]:
                    return

    raise SruxError(
        "That batch is not available under the selected degree and year."
    )


def _parse_slot_time(value: Any) -> time:
    """Validate an SRUX class start time."""

    if not isinstance(value, str):
        raise SruxError(
            "A timetable slot has an invalid time."
        )

    try:
        parsed = datetime.strptime(
            value.strip(),
            "%H:%M",
        ).time()

    except ValueError as exc:
        raise SruxError(
            "A timetable slot has an invalid time."
        ) from exc

    if parsed.minute not in (0, 30):
        raise SruxError(
            "A timetable slot has an unsupported time."
        )

    if not (time(8, 30) <= parsed <= time(20, 30)):
        raise SruxError(
            "A timetable slot falls outside the supported day."
        )

    return parsed


def _format_time(value: time) -> str:
    return value.strftime("%I:%M %p")


def _validate_week_structure(
    timetable: dict[str, Any],
) -> None:
    """Require an explicit, valid entry for every weekday."""

    missing_days = [
        day
        for day in DAY_NUMBERS
        if day not in timetable
    ]

    if missing_days:
        raise SruxError(
            "SRUX returned an incomplete timetable. "
            "One or more weekdays are missing."
        )

    for day_name in DAY_NUMBERS:

        if not isinstance(timetable[day_name], list):
            raise SruxError(
                f"SRUX returned an invalid {day_name} timetable."
            )


def fetch_timetable(batch_id: str) -> dict[str, Any]:
    """Fetch and normalize one allowlisted SRUX batch timetable."""

    if not BATCH_ID_PATTERN.fullmatch(batch_id):
        raise SruxError(
            "The selected SRUX batch is invalid."
        )

    # The hostname is fixed. Users cannot supply arbitrary URLs.
    raw = _fetch_json(
        f"{SRUX_BASE_URL}/timetables/{batch_id}.json"
    )

    if raw.get("batch") != batch_id:
        raise SruxError(
            "SRUX returned a timetable for a different batch."
        )

    degree = raw.get("degree")
    academic_year = raw.get("year")
    source_updated = raw.get("lastUpdated")
    timetable = raw.get("timetable")

    if (
        not isinstance(degree, str)
        or not degree.strip()
        or not isinstance(academic_year, str)
        or not academic_year.strip()
        or not isinstance(timetable, dict)
    ):
        raise SruxError(
            "SRUX returned an incomplete timetable."
        )

    # A missing weekday must never be interpreted as an empty weekday.
    _validate_week_structure(timetable)

    normalized_classes: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for day_name, weekday in DAY_NUMBERS.items():

        slots = timetable[day_name]

        for slot in slots:

            if not isinstance(slot, dict):
                raise SruxError(
                    "SRUX returned an invalid timetable slot."
                )

            start = _parse_slot_time(
                slot.get("time")
            )

            subjects = slot.get("subjects")

            if not isinstance(subjects, list):
                raise SruxError(
                    "SRUX returned invalid slot subjects."
                )

            for subject in subjects:

                if isinstance(subject, str):
                    # Free Slot and other non-record placeholders
                    # are deliberately not imported.
                    continue

                if not isinstance(subject, dict):
                    raise SruxError(
                        "SRUX returned an invalid class record."
                    )

                source_id = subject.get("unique_id")
                title = subject.get("subject")

                if (
                    not isinstance(source_id, str)
                    or not source_id.strip()
                ):
                    raise SruxError(
                        "A class is missing its stable source ID."
                    )

                source_id = source_id.strip()

                if source_id in seen_ids:
                    raise SruxError(
                        "SRUX returned a duplicate class record."
                    )

                seen_ids.add(source_id)

                if (
                    not isinstance(title, str)
                    or not title.strip()
                ):
                    raise SruxError(
                        "A class is missing its subject name."
                    )

                end_datetime = datetime.combine(
                    date(2000, 1, 1),
                    start,
                ) + timedelta(hours=1)

                course_code = subject.get("coursecode")

                if (
                    course_code is not None
                    and not isinstance(course_code, str)
                ):
                    raise SruxError(
                        "A class has an invalid course code."
                    )

                lecturer = subject.get("facultyName")
                room = subject.get("room_name")

                if lecturer is not None and not isinstance(
                    lecturer, str
                ):
                    lecturer = None

                if room is not None and not isinstance(
                    room, str
                ):
                    room = None

                normalized_classes.append(
                    {
                        "source_record_id": source_id,
                        "code": (
                            course_code.strip()
                            if isinstance(course_code, str)
                            else ""
                        ),
                        "title": title.strip(),
                        "day": day_name[:3].upper(),
                        "weekday": weekday,
                        "start_time": start.strftime("%H:%M:%S"),
                        "end_time": end_datetime.strftime("%H:%M:%S"),
                        "start_label": _format_time(start),
                        "end_label": _format_time(
                            end_datetime.time()
                        ),
                        "lecturer": (
                            lecturer.strip()
                            if lecturer and lecturer.strip()
                            else None
                        ),
                        "room": (
                            room.strip()
                            if room and room.strip()
                            else None
                        ),
                    }
                )

                if len(normalized_classes) > MAX_CLASSES_PER_BATCH:
                    raise SruxError(
                        "SRUX returned more classes than "
                        "the supported limit."
                    )

    return {
        "degree": degree.strip(),
        "academic_year": academic_year.strip(),
        "batch_id": batch_id,
        "source_last_updated": (
            source_updated
            if isinstance(source_updated, str)
            else None
        ),
        "classes": normalized_classes,
    }
