"""Optional development seed data.  Run: python -m app.seed

Demo account (development only, not a real credential):
    email:    demo@devtrack.dev
    password: DemoPass123!
"""
from datetime import date, timedelta

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import Project, Task, User
from app.models.base import utcnow

DEMO_EMAIL = "demo@devtrack.dev"
DEMO_PASSWORD = "DemoPass123!"


def seed() -> None:
    today = date.today()
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == DEMO_EMAIL)):
            print("Demo data already present; skipping.")
            return
        user = User(
            name="Demo Developer", email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD),
            bio="Full-stack developer who likes shipping small, well-tested releases.",
            skills=["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            github_url="https://github.com/example", linkedin_url="https://linkedin.com/in/example",
            portfolio_url="https://example.com",
        )
        db.add(user)
        db.flush()
        specs = [
            ("Orbit API", "Public REST API for a scheduling product.", ["FastAPI", "PostgreSQL"], "in_progress", -30, 12,
             [("Design database schema", "completed", "high", -20), ("Implement auth endpoints", "completed", "critical", -10),
              ("Add rate limiting", "in_progress", "medium", 5), ("Write OpenAPI examples", "todo", "low", 9)]),
            ("Pixel Portfolio", "Personal portfolio site with a blog.", ["React", "Tailwind CSS", "Vite"], "planning", -3, 40,
             [("Sketch wireframes", "in_progress", "medium", 3), ("Pick a type scale", "todo", "low", 8)]),
            ("CLI Toolbox", "Small command line utilities published to PyPI.", ["Python", "Typer"], "completed", -90, -10,
             [("Publish v1.0", "completed", "high", -12), ("Write README", "completed", "medium", -15)]),
            ("Legacy Migration", "Move the old cron jobs to a queue.", ["Python", "Redis"], "on_hold", -60, 25,
             [("Inventory cron jobs", "completed", "medium", -40), ("Choose queue library", "todo", "high", 2)]),
        ]
        for name, desc, tech, status, start, end, tasks in specs:
            project = Project(user_id=user.id, name=name, description=desc, technologies=tech, status=status,
                              start_date=today + timedelta(days=start), deadline=today + timedelta(days=end),
                              github_url="https://github.com/example/" + name.lower().replace(" ", "-"))
            db.add(project)
            db.flush()
            for title, t_status, priority, due in tasks:
                db.add(Task(project_id=project.id, user_id=user.id, title=title, status=t_status, priority=priority,
                            due_date=today + timedelta(days=due), completed_at=utcnow() if t_status == "completed" else None))
        db.commit()
        print(f"Seeded demo user {DEMO_EMAIL}")


if __name__ == "__main__":
    seed()
