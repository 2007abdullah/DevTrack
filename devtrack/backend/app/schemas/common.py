from enum import Enum
from typing import Annotated
from urllib.parse import urlparse

from pydantic import AfterValidator, BeforeValidator


class ProjectStatus(str, Enum):
    planning = "planning"
    in_progress = "in_progress"
    completed = "completed"
    on_hold = "on_hold"


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


def _blank_to_none(value):
    return None if isinstance(value, str) and not value.strip() else value


def _check_url(value: str | None) -> str | None:
    if value is None:
        return None
    parsed = urlparse(value.strip())
    if parsed.scheme not in ("http", "https") or not parsed.netloc or len(value) > 500:
        raise ValueError("Must be a valid http(s) URL")
    return value.strip()


OptionalUrl = Annotated[str | None, BeforeValidator(_blank_to_none), AfterValidator(_check_url)]
OptionalText = Annotated[str | None, BeforeValidator(_blank_to_none)]
