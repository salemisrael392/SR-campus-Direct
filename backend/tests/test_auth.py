
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

import app.routes.auth as auth_routes
from app.main import app


@pytest.fixture
def test_database(tmp_path, monkeypatch) -> Engine:
    """Use a temporary SQLite file, never the working PostgreSQL database."""
    database_file = tmp_path / "auth_test.sqlite3"
    engine = create_engine(f"sqlite:///{database_file}")

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id TEXT PRIMARY KEY,
                    external_id TEXT UNIQUE,
                    email TEXT UNIQUE,
                    name TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    email_verified_at TIMESTAMP NULL,
                    profile_picture_url TEXT NULL
                )
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE TABLE user_credentials (
                    user_id TEXT PRIMARY KEY REFERENCES users(id)
                        ON DELETE CASCADE,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

    monkeypatch.setattr(auth_routes, "get_engine", lambda: engine)
    yield engine
    engine.dispose()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_register_creates_account_and_returns_token(
    client: TestClient,
    test_database: Engine,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@sru.edu.in",
            "password": "Example-Password-123!",
            "name": "Test Student",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["user"]["email"] == "student@sru.edu.in"
    assert data["user"]["name"] == "Test Student"
    assert data["user"]["email_verified"] is False
    assert "password_hash" not in data["user"]

    with test_database.connect() as connection:
        user_count = connection.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar_one()
        credential_count = connection.execute(
            text("SELECT COUNT(*) FROM user_credentials")
        ).scalar_one()

    assert user_count == 1
    assert credential_count == 1


def test_register_rejects_non_university_email(
    client: TestClient,
    test_database: Engine,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@example.com",
            "password": "Example-Password-123!",
            "name": "Test Student",
        },
    )

    assert response.status_code == 403

    with test_database.connect() as connection:
        user_count = connection.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar_one()

    assert user_count == 0


def test_register_rejects_duplicate_email(
    client: TestClient,
    test_database: Engine,
) -> None:
    payload = {
        "email": "student@sru.edu.in",
        "password": "Example-Password-123!",
        "name": "Test Student",
    }

    first_response = client.post("/api/v1/auth/register", json=payload)
    second_response = client.post("/api/v1/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_login_accepts_correct_password(
    client: TestClient,
    test_database: Engine,
) -> None:
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@sru.edu.in",
            "password": "Example-Password-123!",
            "name": "Test Student",
        },
    )
    assert registration.status_code == 201

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@sru.edu.in",
            "password": "Example-Password-123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["user"]["email"] == "student@sru.edu.in"


def test_login_rejects_wrong_password(
    client: TestClient,
    test_database: Engine,
) -> None:
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@sru.edu.in",
            "password": "Example-Password-123!",
            "name": "Test Student",
        },
    )
    assert registration.status_code == 201

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@sru.edu.in",
            "password": "Wrong-Password-123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_login_rejects_unknown_email(
    client: TestClient,
    test_database: Engine,
) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "unknown@sru.edu.in",
            "password": "Example-Password-123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_me_returns_authenticated_user(
    client: TestClient,
    test_database: Engine,
) -> None:
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@sru.edu.in",
            "password": "Example-Password-123!",
            "name": "Test Student",
        },
    )
    assert registration.status_code == 201

    token = registration.json()["access_token"]
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "student@sru.edu.in"
    assert response.json()["name"] == "Test Student"
    assert "password_hash" not in response.json()
