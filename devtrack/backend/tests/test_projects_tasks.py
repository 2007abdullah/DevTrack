PROJECT = {"name": "Orbit", "description": "API", "technologies": ["FastAPI"], "status": "in_progress",
           "start_date": "2026-01-01", "deadline": "2026-06-01", "github_url": "https://github.com/x/orbit"}


def make_project(client, auth, **overrides):
    res = client.post("/api/projects", headers=auth, json={**PROJECT, **overrides})
    assert res.status_code == 201, res.text
    return res.json()


def make_task(client, auth, project_id, **overrides):
    res = client.post("/api/tasks", headers=auth, json={"project_id": project_id, "title": "Write tests", **overrides})
    assert res.status_code == 201, res.text
    return res.json()


def test_project_crud(client, auth):
    project = make_project(client, auth)
    assert project["progress"] == 0 and project["task_count"] == 0
    pid = project["id"]

    assert client.get(f"/api/projects/{pid}", headers=auth).json()["name"] == "Orbit"
    assert len(client.get("/api/projects", headers=auth).json()) == 1

    res = client.put(f"/api/projects/{pid}", headers=auth, json={**PROJECT, "name": "Orbit v2", "status": "on_hold"})
    assert res.status_code == 200 and res.json()["name"] == "Orbit v2" and res.json()["status"] == "on_hold"

    assert client.delete(f"/api/projects/{pid}", headers=auth).status_code == 204
    assert client.get(f"/api/projects/{pid}", headers=auth).status_code == 404


def test_project_validation(client, auth):
    assert client.post("/api/projects", headers=auth, json={**PROJECT, "deadline": "2025-01-01"}).status_code == 422
    assert client.post("/api/projects", headers=auth, json={**PROJECT, "status": "bogus"}).status_code == 422
    assert client.post("/api/projects", headers=auth, json={**PROJECT, "live_url": "ftp://nope"}).status_code == 422


def test_project_search_filter_sort(client, auth):
    make_project(client, auth, name="Alpha", status="planning")
    make_project(client, auth, name="Beta", status="completed")
    assert [p["name"] for p in client.get("/api/projects?q=alp", headers=auth).json()] == ["Alpha"]
    assert [p["name"] for p in client.get("/api/projects?status=completed", headers=auth).json()] == ["Beta"]
    assert [p["name"] for p in client.get("/api/projects?sort=name&order=asc", headers=auth).json()] == ["Alpha", "Beta"]


def test_task_crud_and_progress(client, auth):
    pid = make_project(client, auth)["id"]
    task = make_task(client, auth, pid, priority="high")
    assert task["project_name"] == "Orbit" and task["status"] == "todo"

    res = client.put(f"/api/tasks/{task['id']}", headers=auth,
                     json={"project_id": pid, "title": "Write more tests", "status": "completed", "priority": "high"})
    assert res.status_code == 200 and res.json()["completed_at"] is not None
    assert client.get(f"/api/projects/{pid}", headers=auth).json()["progress"] == 100

    reopened = client.put(f"/api/tasks/{task['id']}", headers=auth,
                          json={"project_id": pid, "title": "Write more tests", "status": "todo"})
    assert reopened.json()["completed_at"] is None

    assert client.delete(f"/api/tasks/{task['id']}", headers=auth).status_code == 204
    assert client.get(f"/api/tasks/{task['id']}", headers=auth).status_code == 404


def test_task_filters(client, auth):
    pid = make_project(client, auth)["id"]
    make_task(client, auth, pid, title="Low one", priority="low")
    make_task(client, auth, pid, title="Critical one", priority="critical", status="in_progress")
    assert len(client.get("/api/tasks?priority=critical", headers=auth).json()) == 1
    assert len(client.get("/api/tasks?status=in_progress", headers=auth).json()) == 1
    assert client.get("/api/tasks?sort=priority&order=desc", headers=auth).json()[0]["title"] == "Critical one"


def test_deleting_project_removes_its_tasks(client, auth):
    pid = make_project(client, auth)["id"]
    tid = make_task(client, auth, pid)["id"]
    client.delete(f"/api/projects/{pid}", headers=auth)
    assert client.get(f"/api/tasks/{tid}", headers=auth).status_code == 404


def test_unauthorized_access(client):
    for method, url in [("get", "/api/projects"), ("post", "/api/projects"), ("get", "/api/tasks"),
                        ("post", "/api/tasks"), ("get", "/api/dashboard/stats"), ("get", "/api/users/me")]:
        assert getattr(client, method)(url).status_code == 401, (method, url)


def test_users_cannot_access_each_others_data(client, auth, other_auth):
    pid = make_project(client, auth)["id"]
    tid = make_task(client, auth, pid)["id"]

    assert client.get(f"/api/projects/{pid}", headers=other_auth).status_code == 404
    assert client.put(f"/api/projects/{pid}", headers=other_auth, json=PROJECT).status_code == 404
    assert client.delete(f"/api/projects/{pid}", headers=other_auth).status_code == 404
    assert client.get(f"/api/tasks/{tid}", headers=other_auth).status_code == 404
    assert client.delete(f"/api/tasks/{tid}", headers=other_auth).status_code == 404
    assert client.post("/api/tasks", headers=other_auth, json={"project_id": pid, "title": "Sneaky"}).status_code == 404
    assert client.get("/api/projects", headers=other_auth).json() == []
    assert client.get("/api/tasks", headers=other_auth).json() == []


def test_dashboard_stats(client, auth):
    pid = make_project(client, auth)["id"]
    make_task(client, auth, pid, status="completed")
    make_task(client, auth, pid, title="Pending")
    stats = client.get("/api/dashboard/stats", headers=auth).json()
    assert stats["total_projects"] == 1 and stats["active_projects"] == 1
    assert stats["total_tasks"] == 2 and stats["completed_tasks"] == 1 and stats["pending_tasks"] == 1
    assert len(stats["productivity"]) == 7 and stats["productivity"][-1]["completed"] == 1
