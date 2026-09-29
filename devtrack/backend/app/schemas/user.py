import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.schemas.common import OptionalText, OptionalUrl


def _clean_list(values: list[str]) -> list[str]:
    seen, out = set(), []
    for v in values:
        v = v.strip()
        if v and v.lower() not in seen:
            seen.add(v.lower())
            out.append(v[:40])
    return out[:30]


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.lower()


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.lower()


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    bio: str | None = None
    profile_picture: str | None = None
    skills: list[str] = []
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    bio: OptionalText = Field(default=None, max_length=1000)
    profile_picture: OptionalUrl = None
    skills: list[str] | None = None
    github_url: OptionalUrl = None
    linkedin_url: OptionalUrl = None
    portfolio_url: OptionalUrl = None

    @field_validator("skills")
    @classmethod
    def clean_skills(cls, v):
        return None if v is None else _clean_list(v)

    @field_validator("email")
    @classmethod
    def lower_email(cls, v):
        return v.lower() if v else v


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)

    @model_validator(mode="after")
    def differs(self):
        if self.current_password == self.new_password:
            raise ValueError("New password must be different from the current password")
        return self


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
