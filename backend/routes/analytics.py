from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User,
    Employee,
    Leave,
    Project,
    WorkReport
)
from dependencies import require_hr


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# ============================================================
# ANALYTICS SUMMARY
# GET /analytics/summary
# HR ONLY
# ============================================================

@router.get("/summary")
def analytics_summary(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    # ========================================================
    # EMPLOYEE COUNTS
    # ========================================================

    total_employees = (
        db.query(Employee)
        .count()
    )

    # If Employee table does not have a status column,
    # all employee records are treated as active.
    active_employees = total_employees


    # ========================================================
    # USER COUNTS
    # ========================================================

    total_users = (
        db.query(User)
        .count()
    )

    employee_users = (
        db.query(User)
        .filter(User.role == "employee")
        .count()
    )

    hr_users = (
        db.query(User)
        .filter(User.role == "hr")
        .count()
    )


    # ========================================================
    # LEAVE COUNTS
    # ========================================================

    total_leaves = (
        db.query(Leave)
        .count()
    )

    pending_leaves = (
        db.query(Leave)
        .filter(Leave.status == "pending")
        .count()
    )

    approved_leaves = (
        db.query(Leave)
        .filter(Leave.status == "approved")
        .count()
    )

    rejected_leaves = (
        db.query(Leave)
        .filter(Leave.status == "rejected")
        .count()
    )


    # ========================================================
    # PROJECT COUNTS
    # ========================================================

    total_projects = (
        db.query(Project)
        .count()
    )

    active_projects = (
        db.query(Project)
        .filter(Project.status == "active")
        .count()
    )

    completed_projects = (
        db.query(Project)
        .filter(Project.status == "completed")
        .count()
    )


    # ========================================================
    # WORK REPORT COUNTS
    # ========================================================

    total_reports = (
        db.query(WorkReport)
        .count()
    )


    # ========================================================
    # RETURN FLAT RESPONSE
    # This matches Analytics.jsx
    # ========================================================

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,

        "total_users": total_users,
        "employee_users": employee_users,
        "hr_users": hr_users,

        "total_projects": total_projects,
        "active_projects": active_projects,
        "completed_projects": completed_projects,

        "total_leaves": total_leaves,
        "pending_leaves": pending_leaves,
        "approved_leaves": approved_leaves,
        "rejected_leaves": rejected_leaves,

        "total_reports": total_reports
    }


# ============================================================
# EMPLOYEE ANALYTICS
# GET /analytics/employees
# HR ONLY
# ============================================================

@router.get("/employees")
def employee_analytics(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    employees = (
        db.query(Employee)
        .all()
    )

    department_data = {}

    for employee in employees:

        department = (
            getattr(employee, "department", None)
            or "Unknown"
        )

        if department not in department_data:
            department_data[department] = 0

        department_data[department] += 1

    return {
        "total_employees": len(employees),
        "departments": department_data
    }


# ============================================================
# LEAVE ANALYTICS
# GET /analytics/leaves
# HR ONLY
# ============================================================

@router.get("/leaves")
def leave_analytics(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    total = (
        db.query(Leave)
        .count()
    )

    pending = (
        db.query(Leave)
        .filter(Leave.status == "pending")
        .count()
    )

    approved = (
        db.query(Leave)
        .filter(Leave.status == "approved")
        .count()
    )

    rejected = (
        db.query(Leave)
        .filter(Leave.status == "rejected")
        .count()
    )

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }


# ============================================================
# PROJECT ANALYTICS
# GET /analytics/projects
# HR ONLY
# ============================================================

@router.get("/projects")
def project_analytics(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    total = (
        db.query(Project)
        .count()
    )

    active = (
        db.query(Project)
        .filter(Project.status == "active")
        .count()
    )

    completed = (
        db.query(Project)
        .filter(Project.status == "completed")
        .count()
    )

    return {
        "total": total,
        "active": active,
        "completed": completed
    }


# ============================================================
# WORK REPORT ANALYTICS
# GET /analytics/reports
# HR ONLY
# ============================================================

@router.get("/reports")
def report_analytics(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    total_reports = (
        db.query(WorkReport)
        .count()
    )

    return {
        "total_reports": total_reports
    }