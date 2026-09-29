from fastapi import APIRouter

from app.api.routes import auth, dashboard, projects, tasks, users

api_router = APIRouter(prefix="/api")
for module in (auth, users, projects, tasks, dashboard):
    api_router.include_router(module.router)
