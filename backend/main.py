from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routes.auth import router as auth_router
from routes.analytics import router as analytics_router
from routes.employees import router as employees_router
from routes.leaves import router as leaves_router
from routes.profile import router as profile_router
from routes.projects import router as projects_router
from routes.notifications import router as notifications_router
from routes.dashboard import router as dashboard_router
from routes.reports import router as reports_router


# =====================================================
# CREATE DATABASE TABLES
# =====================================================

Base.metadata.create_all(bind=engine)


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="HRMS API",
    description="Human Resource Management System API",
    version="1.0.0"
)


# =====================================================
# CORS CONFIGURATION
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Vite frontend - port 5173
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Vite frontend - port 5174
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# ROUTERS
# =====================================================

app.include_router(auth_router)

app.include_router(employees_router)

app.include_router(analytics_router)

app.include_router(leaves_router)

app.include_router(profile_router)

app.include_router(projects_router)

app.include_router(notifications_router)

app.include_router(dashboard_router)

app.include_router(reports_router)


# =====================================================
# ROOT API
# =====================================================

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Welcome to HRMS Application"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health():
    return {
        "status": "success",
        "message": "HRMS backend is running"
    }