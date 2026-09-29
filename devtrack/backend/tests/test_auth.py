from tests.conftest import register_and_login


def test_register_success_hides_password(client):
    res = client.post("/api/auth/register", json={"name": "Ada", "email": "Ada@Example.com", "password": "longenough1"})
    assert res.status_code == 201
    body = res.json()
    assert body["email"] == "ada@example.com"
    assert "password" not in body and "password_hash" not in body


def test_register_duplicate_email(client):
    payload = {"name": "Ada", "email": "ada@example.com", "password": "longenough1"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 409


def test_register_validation(client):
    res = client.post("/api/auth/register", json={"name": "Ada", "email": "not-an-email", "password": "short"})
    assert res.status_code == 422
    assert {e["field"] for e in res.json()["errors"]} >= {"email", "password"}


def test_login_returns_token_and_user(client):
    register_and_login(client)
    res = client.post("/api/auth/login", json={"email": "dev@example.com", "password": "Sup3rSecret!"})
    assert res.json()["token_type"] == "bearer"
    assert res.json()["user"]["email"] == "dev@example.com"


def test_login_invalid_credentials(client):
    register_and_login(client)
    wrong_pw = client.post("/api/auth/login", json={"email": "dev@example.com", "password": "nope-nope"})
    unknown = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": "nope-nope"})
    assert wrong_pw.status_code == unknown.status_code == 401
    assert wrong_pw.json() == unknown.json()


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_me_returns_current_user(client, auth):
    res = client.get("/api/auth/me", headers=auth)
    assert res.status_code == 200 and res.json()["email"] == "dev@example.com"


def test_update_profile_and_change_password(client, auth):
    res = client.put("/api/users/me", headers=auth, json={"bio": "Hi", "skills": ["Python", "python", "React"], "github_url": "https://github.com/x"})
    assert res.status_code == 200 and res.json()["skills"] == ["Python", "React"]
    assert client.put("/api/users/me", headers=auth, json={"github_url": "javascript:alert(1)"}).status_code == 422

    bad = client.post("/api/users/me/password", headers=auth, json={"current_password": "wrong-one", "new_password": "BrandNew123"})
    assert bad.status_code == 400
    ok = client.post("/api/users/me/password", headers=auth, json={"current_password": "Sup3rSecret!", "new_password": "BrandNew123"})
    assert ok.status_code == 204
    assert client.post("/api/auth/login", json={"email": "dev@example.com", "password": "BrandNew123"}).status_code == 200


def test_health(client):
    assert client.get("/health").json() == {"status": "ok", "database": "up"}
