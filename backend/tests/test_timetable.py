import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

import app.routes.timetable as timetable_routes
from app.main import app


@pytest.fixture
def timetable_database(tmp_path, monkeypatch) -> Engine:
    """Use an isolated SQLite database for timetable API tests."""
    database_file = tmp_path / "timetable_test.sqlite3"
    engine = create_engine(f"sqlite:///{database_file}")

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE,
                    name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TABLE personal_timetable_entries (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    course_code TEXT,
                    title TEXT NOT NULL,
                    weekday INTEGER NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    lecturer TEXT,
                    room_label TEXT,
                    place_id TEXT,
                    course_section_id TEXT,
                    source TEXT NOT NULL DEFAULT 'manual',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TABLE timetable_imports (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL UNIQUE,
                    source TEXT NOT NULL DEFAULT 'srux',
                    degree TEXT NOT NULL,
                    academic_year TEXT NOT NULL,
                    batch_id TEXT NOT NULL,
                    sync_status TEXT NOT NULL DEFAULT 'pending'
                )
                """
            )
        )

    monkeypatch.setattr(timetable_routes, "get_engine", lambda: engine)
    monkeypatch.setattr(
        timetable_routes,
        "decode_access_token",
        lambda token: {"sub": token}
        if token in {"student-a", "student-b"}
        else None,
    )

    yield engine
    engine.dispose()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def auth_headers(student: str = "student-a") -> dict[str, str]:
    return {"Authorization": f"Bearer {student}"}


def class_payload(**overrides) -> dict:
    payload = {
        "code": "CS201",
        "title": "Data Structures",
        "day": "MON",
        "start_time": "09:00 AM",
        "end_time": "10:00 AM",
        "lecturer": "Dr Example",
        "room": "Room 204",
    }
    payload.update(overrides)
    return payload


def create_class(
    client: TestClient,
    student: str = "student-a",
) -> dict:
    response = client.post(
        "/api/v1/timetable",
        headers=auth_headers(student),
        json=class_payload(),
    )
    assert response.status_code == 201
    return response.json()


def add_active_srux_import(
    engine: Engine,
    student: str = "student-a",
) -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                INSERT INTO timetable_imports (
                    id, user_id, source, degree,
                    academic_year, batch_id, sync_status
                )
                VALUES (
                    :id, :user_id, 'srux',
                    'BCA', 'Year 2', '25CAIBC00B01', 'synced'
                )
                """
            ),
            {
                "id": f"import-{student}",
                "user_id": student,
            },
        )


def insert_official_class(
    engine: Engine,
    student: str = "student-a",
) -> str:
    entry_id = f"official-{student}"

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                INSERT INTO personal_timetable_entries (
                    id, user_id, course_code, title, weekday,
                    start_time, end_time, lecturer, room_label,
                    source
                )
                VALUES (
                    :id, :user_id, 'CS301', 'Artificial Intelligence',
                    2, '10:00:00', '11:00:00',
                    'Dr Official', 'Room 301', 'official'
                )
                """
            ),
            {
                "id": entry_id,
                "user_id": student,
            },
        )

    return entry_id


def test_timetable_requires_authentication(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    response = client.get("/api/v1/timetable")

    assert response.status_code == 401


def test_student_can_create_and_list_class(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    create_response = client.post(
        "/api/v1/timetable",
        headers=auth_headers(),
        json=class_payload(),
    )

    assert create_response.status_code == 201
    created = create_response.json()

    assert created["code"] == "CS201"
    assert created["title"] == "Data Structures"
    assert created["day"] == "MON"
    assert created["start_time"] == "09:00 AM"
    assert created["end_time"] == "10:00 AM"
    assert created["lecturer"] == "Dr Example"
    assert created["room"] == "Room 204"
    assert created["source"] == "manual"
    assert created["id"]

    list_response = client.get(
        "/api/v1/timetable",
        headers=auth_headers(),
    )

    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["id"] == created["id"]


def test_student_cannot_see_another_students_class(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    created = create_class(client, "student-a")

    response = client.get(
        "/api/v1/timetable",
        headers=auth_headers("student-b"),
    )

    assert response.status_code == 200
    assert response.json() == []
    assert created["source"] == "manual"


def test_student_cannot_delete_another_students_class(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    created = create_class(client, "student-a")
    entry_id = created["id"]

    response = client.delete(
        f"/api/v1/timetable/{entry_id}",
        headers=auth_headers("student-b"),
    )

    assert response.status_code == 404

    remaining = client.get(
        "/api/v1/timetable",
        headers=auth_headers("student-a"),
    )
    assert len(remaining.json()) == 1


def test_student_can_delete_their_own_class(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    created = create_class(client)
    entry_id = created["id"]

    response = client.delete(
        f"/api/v1/timetable/{entry_id}",
        headers=auth_headers(),
    )

    assert response.status_code == 204

    remaining = client.get(
        "/api/v1/timetable",
        headers=auth_headers(),
    )
    assert remaining.json() == []


def test_class_rejects_end_time_before_start_time(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    response = client.post(
        "/api/v1/timetable",
        headers=auth_headers(),
        json=class_payload(
            start_time="10:00 AM",
            end_time="09:00 AM",
        ),
    )

    assert response.status_code == 422


def test_class_rejects_invalid_time(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    response = client.post(
        "/api/v1/timetable",
        headers=auth_headers(),
        json=class_payload(start_time="99:99 AM"),
    )

    assert response.status_code == 422


def test_manual_classes_are_hidden_while_srux_is_active(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    manual_class = create_class(client)
    official_id = insert_official_class(timetable_database)
    add_active_srux_import(timetable_database)

    response = client.get(
        "/api/v1/timetable",
        headers=auth_headers(),
    )

    assert response.status_code == 200

    entries = response.json()

    assert len(entries) == 1
    assert entries[0]["id"] == official_id
    assert entries[0]["source"] == "official"

    # The hidden manual entry must still exist in the database.
    with timetable_database.connect() as connection:
        stored = connection.execute(
            text(
                """
                SELECT id, source
                FROM personal_timetable_entries
                WHERE id = :id
                """
            ),
            {"id": manual_class["id"]},
        ).mappings().one()

    assert stored["source"] == "manual"


def test_manual_classes_reappear_after_srux_unsubscribe(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    manual_class = create_class(client)
    add_active_srux_import(timetable_database)

    hidden_response = client.get(
        "/api/v1/timetable",
        headers=auth_headers(),
    )
    assert hidden_response.json() == []

    with timetable_database.begin() as connection:
        connection.execute(
            text(
                "DELETE FROM timetable_imports WHERE user_id = :user_id"
            ),
            {"user_id": "student-a"},
        )

    restored_response = client.get(
        "/api/v1/timetable",
        headers=auth_headers(),
    )

    assert restored_response.status_code == 200
    assert len(restored_response.json()) == 1
    assert restored_response.json()[0]["id"] == manual_class["id"]
    assert restored_response.json()[0]["source"] == "manual"


def test_manual_class_creation_is_blocked_while_srux_is_active(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    add_active_srux_import(timetable_database)

    response = client.post(
        "/api/v1/timetable",
        headers=auth_headers(),
        json=class_payload(),
    )

    assert response.status_code == 409
    assert "SRUX" in response.json()["detail"]


def test_manual_class_update_is_blocked_while_srux_is_active(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    created = create_class(client)
    add_active_srux_import(timetable_database)

    response = client.put(
        f"/api/v1/timetable/{created['id']}",
        headers=auth_headers(),
        json=class_payload(title="Changed Title"),
    )

    assert response.status_code == 409

    with timetable_database.connect() as connection:
        stored = connection.execute(
            text(
                """
                SELECT title
                FROM personal_timetable_entries
                WHERE id = :id
                """
            ),
            {"id": created["id"]},
        ).scalar_one()

    assert stored == "Data Structures"


def test_manual_class_deletion_is_blocked_while_srux_is_active(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    created = create_class(client)
    add_active_srux_import(timetable_database)

    response = client.delete(
        f"/api/v1/timetable/{created['id']}",
        headers=auth_headers(),
    )

    assert response.status_code == 409

    with timetable_database.connect() as connection:
        exists = connection.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM personal_timetable_entries
                    WHERE id = :id
                )
                """
            ),
            {"id": created["id"]},
        ).scalar()

    assert bool(exists) is True


def test_official_class_cannot_be_updated_individually(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    official_id = insert_official_class(timetable_database)

    response = client.put(
        f"/api/v1/timetable/{official_id}",
        headers=auth_headers(),
        json=class_payload(title="Attempted Change"),
    )

    assert response.status_code == 409
    assert "Official SRUX classes" in response.json()["detail"]


def test_official_class_cannot_be_deleted_individually(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    official_id = insert_official_class(timetable_database)

    response = client.delete(
        f"/api/v1/timetable/{official_id}",
        headers=auth_headers(),
    )

    assert response.status_code == 409

    with timetable_database.connect() as connection:
        exists = connection.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM personal_timetable_entries
                    WHERE id = :id
                )
                """
            ),
            {"id": official_id},
        ).scalar()

    assert bool(exists) is True


def test_srux_subscription_does_not_hide_another_students_manual_classes(
    client: TestClient,
    timetable_database: Engine,
) -> None:
    student_a_class = create_class(client, "student-a")
    student_b_class = create_class(client, "student-b")

    add_active_srux_import(timetable_database, "student-a")

    student_a_response = client.get(
        "/api/v1/timetable",
        headers=auth_headers("student-a"),
    )

    student_b_response = client.get(
        "/api/v1/timetable",
        headers=auth_headers("student-b"),
    )

    assert student_a_response.json() == []
    assert len(student_b_response.json()) == 1
    assert student_b_response.json()[0]["id"] == student_b_class["id"]

    assert student_a_class["id"] != student_b_class["id"]
