import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Project, User
from app.schemas.common import ProjectStatus
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from app.services.projects import get_owned_project, to_columns

router = APIRouter(prefix="/projects", tags=["Projects"])

SORT_COLUMNS = {
    "created_at": Project.created_at,
    "name": Project.name,
    "deadline": Project.deadline,
    "status": Project.status,
}


@router.get("", response_model=list[ProjectOut], summary="List my projects")
def list_projects(
    q: str | None = Query(None, max_length=100, description="Search name and description"),
    status_filter: ProjectStatus | None = Query(None, alias="status"),
    sort: Literal["created_at", "name", "deadline", "status"] = "created_at",
    order: Literal["asc", "desc"] = "desc",
    limit: int = Query(200, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = select(Project).where(Project.user_id == user.id).options(selectinload(Project.tasks))
    if q:
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(Project.name.ilike(pattern) | Project.description.ilike(pattern))
    if status_filter:
        stmt = stmt.where(Project.status == status_filter.value)
    column = SORT_COLUMNS[sort]
    stmt = stmt.order_by(column.asc() if order == "asc" else column.desc()).limit(limit)
    return db.scalars(stmt).all()


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED, summary="Create a project")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = Project(user_id=user.id, **to_columns(payload))
    db.add(project)
    db.commit()
    return get_owned_project(db, user, project.id)


@router.get("/{project_id}", response_model=ProjectOut, summary="Get a project")
def get_project(project_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_owned_project(db, user, project_id)


@router.put("/{project_id}", response_model=ProjectOut, summary="Update a project")
def update_project(project_id: uuid.UUID, payload: ProjectUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = get_owned_project(db, user, project_id)
    for field, value in to_columns(payload).items():
        setattr(project, field, value)
    db.commit()
    return get_owned_project(db, user, project_id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a project and its tasks")
def delete_project(project_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Response:
    db.delete(get_owned_project(db, user, project_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
