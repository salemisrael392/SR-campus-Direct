from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import check_database_connection
from app.routes.auth import router as auth_router
from app.routes.srux import router as srux_router
from app.routes.timetable import router as timetable_router


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend API for SR University Campus Companion.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(timetable_router, prefix=settings.api_prefix)
app.include_router(srux_router, prefix=settings.api_prefix)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "status": "ok",
        "docs": f"{settings.api_prefix}/docs",
    }


@app.get(f"{settings.api_prefix}/health", tags=["system"])
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "database": "configured"
        if settings.database_url
        else "not_configured",
    }


@app.get(f"{settings.api_prefix}/health/database", tags=["system"])
def database_health() -> dict[str, str]:
    check_database_connection()
    return {
        "status": "ok",
        "database": "connected",
    }
