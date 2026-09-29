import os

# Must be set before the app is imported so Settings picks them up.
os.environ["DATABASE_URL"] = "sqlite:///./test_devtrack.db"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-at-least-32-characters-long"

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import engine
from app.main import app


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client():
    return TestClient(app)


def register_and_login(client: TestClient, email="dev@example.com", password="Sup3rSecret!", name="Dev One") -> dict:
    res = client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
    assert res.status_code == 201, res.text
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
def auth(client):
    return register_and_login(client)


@pytest.fixture
def other_auth(client):
    return register_and_login(client, email="other@example.com", name="Other User")
