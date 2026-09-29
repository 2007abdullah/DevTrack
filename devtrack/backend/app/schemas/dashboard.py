import uuid
from datetime import date

from pydantic import BaseModel


class DeadlineItem(BaseModel):
    id: uuid.UUID
    kind: str  # "task" or "project"
    title: str
    due_date: date
    project_id: uuid.UUID
    priority: str | None = None


class DailyCount(BaseModel):
    date: date
    completed: int


class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    upcoming_deadline_count: int
    project_status: dict[str, int]
    task_status: dict[str, int]
    productivity: list[DailyCount]
    upcoming_deadlines: list[DeadlineItem]
