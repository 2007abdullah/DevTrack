from collections import Counter
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Project, Task, User
from app.schemas.dashboard import DailyCount, DashboardStats, DeadlineItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

DEADLINE_WINDOW_DAYS = 14


def _counts(db: Session, model, user: User) -> dict[str, int]:
    rows = db.execute(
        select(model.status, func.count()).where(model.user_id == user.id).group_by(model.status)
    ).all()
    return {status: count for status, count in rows}


@router.get("/stats", response_model=DashboardStats, summary="Aggregated dashboard statistics")
def stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> DashboardStats:
    today = date.today()
    horizon = today + timedelta(days=DEADLINE_WINDOW_DAYS)
    project_status = {s: 0 for s in ("planning", "in_progress", "completed", "on_hold")} | _counts(db, Project, user)
    task_status = {s: 0 for s in ("todo", "in_progress", "completed")} | _counts(db, Task, user)

    since = datetime.combine(today - timedelta(days=6), time.min, tzinfo=timezone.utc)
    done_at = db.scalars(
        select(Task.completed_at).where(Task.user_id == user.id, Task.completed_at >= since)
    ).all()
    per_day = Counter(d.date() for d in done_at if d)
    productivity = [
        DailyCount(date=today - timedelta(days=i), completed=per_day.get(today - timedelta(days=i), 0))
        for i in range(6, -1, -1)
    ]

    tasks_due = db.scalars(
        select(Task)
        .where(Task.user_id == user.id, Task.status != "completed", Task.due_date.between(today, horizon))
        .order_by(Task.due_date)
    ).all()
    projects_due = db.scalars(
        select(Project)
        .where(Project.user_id == user.id, Project.status != "completed", Project.deadline.between(today, horizon))
        .order_by(Project.deadline)
    ).all()
    deadlines = [
        DeadlineItem(id=t.id, kind="task", title=t.title, due_date=t.due_date, project_id=t.project_id, priority=t.priority)
        for t in tasks_due
    ] + [
        DeadlineItem(id=p.id, kind="project", title=p.name, due_date=p.deadline, project_id=p.id)
        for p in projects_due
    ]
    deadlines.sort(key=lambda d: d.due_date)

    total_tasks = sum(task_status.values())
    return DashboardStats(
        total_projects=sum(project_status.values()),
        active_projects=project_status["in_progress"],
        completed_projects=project_status["completed"],
        total_tasks=total_tasks,
        completed_tasks=task_status["completed"],
        pending_tasks=total_tasks - task_status["completed"],
        upcoming_deadline_count=len(deadlines),
        project_status=project_status,
        task_status=task_status,
        productivity=productivity,
        upcoming_deadlines=deadlines[:8],
    )
