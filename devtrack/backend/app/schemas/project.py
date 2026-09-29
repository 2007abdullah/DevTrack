import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.common import OptionalText, OptionalUrl, ProjectStatus
from app.schemas.user import _clean_list


class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: OptionalText = Field(default=None, max_length=2000)
    technologies: list[str] = Field(default_factory=list)
    github_url: OptionalUrl = None
    live_url: OptionalUrl = None
    status: ProjectStatus = ProjectStatus.planning
    start_date: date | None = None
    deadline: date | None = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("technologies")
    @classmethod
    def clean_tech(cls, v: list[str]) -> list[str]:
        return _clean_list(v)

    @model_validator(mode="after")
    def deadline_after_start(self):
        if self.start_date and self.deadline and self.deadline < self.start_date:
            raise ValueError("Deadline cannot be before the start date")
        return self


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    task_count: int
    completed_task_count: int
    progress: int
    created_at: datetime
    updated_at: datetime
