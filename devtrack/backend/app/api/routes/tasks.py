import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import case, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Task, User
from app.models.base import utcnow
from app.schemas.common import TaskPriority, TaskStatus
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.services.projects import get_owned_project, get_owned_task, to_columns

router = APIRouter(prefix="/tasks", tags=["Tasks"])

PRIORITY_RANK = case(
    {"critical": 4, "high": 3, "medium": 2, "low": 1}, value=Task.priority, else_=0
)


def _apply_payload(task: Task, payload: TaskCreate | TaskUpdate) -> None:
    was_completed = task.status == "completed"
    for field, value in to_columns(payload).items():
        setattr(task, field, value)
    if task.status == "completed" and not was_completed:
        task.completed_at = utcnow()
    elif task.status != "completed":
        task.completed_at = None


def _load(db: Session, user: User, task_id: uuid.UUID) -> Task:
    task = get_owned_task(db, user, task_id)
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskOut], summary="List my tasks")
def list_tasks(
    q: str | None = Query(None, max_length=100),
    status_filter: TaskStatus | None = Query(None, alias="status"),
    priority: TaskPriority | None = None,
    project_id: uuid.UUID | None = None,
    sort: Literal["created_at", "due_date", "priority", "title"] = "created_at",
    order: Literal["asc", "desc"] = "desc",
    limit: int = Query(500, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = select(Task).where(Task.user_id == user.id).options(joinedload(Task.project))
    if q:
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(Task.title.ilike(pattern) | Task.description.ilike(pattern))
    if status_filter:
        stmt = stmt.where(Task.status == status_filter.value)
    if priority:
        stmt = stmt.where(Task.priority == priority.value)
    if project_id:
        stmt = stmt.where(Task.project_id == project_id)
    columns = {"created_at": Task.created_at, "due_date": Task.due_date, "priority": PRIORITY_RANK, "title": Task.title}
    column = columns[sort]
    stmt = stmt.order_by(column.asc() if order == "asc" else column.desc()).limit(limit)
    return db.scalars(stmt).unique().all()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED, summary="Create a task")
def create_task(payload: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_owned_project(db, user, payload.project_id)  # 404 if the project is not the user's
    task = Task(user_id=user.id)
    _apply_payload(task, payload)
    db.add(task)
    db.commit()
    return _load(db, user, task.id)


@router.get("/{task_id}", response_model=TaskOut, summary="Get a task")
def get_task(task_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_owned_task(db, user, task_id)


@router.put("/{task_id}", response_model=TaskOut, summary="Update a task")
def update_task(task_id: uuid.UUID, payload: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = get_owned_task(db, user, task_id)
    get_owned_project(db, user, payload.project_id)
    _apply_payload(task, payload)
    db.commit()
    return _load(db, user, task_id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a task")
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Response:
    db.delete(get_owned_task(db, user, task_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
