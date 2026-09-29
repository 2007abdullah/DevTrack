import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Project, Task, User


def get_owned_project(db: Session, user: User, project_id: uuid.UUID) -> Project:
    """Return the project only if it belongs to the user (404 otherwise, never 403)."""
    project = db.scalar(
        select(Project)
        .where(Project.id == project_id, Project.user_id == user.id)
        .options(selectinload(Project.tasks))
    )
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return project


def get_owned_task(db: Session, user: User, task_id: uuid.UUID) -> Task:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user.id))
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return task


def to_columns(payload) -> dict:
    """Dump a Pydantic model to column values, turning enums into plain strings."""
    return {k: (v.value if hasattr(v, "value") else v) for k, v in payload.model_dump().items()}
