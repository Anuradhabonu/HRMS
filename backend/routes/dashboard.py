from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db

from models import (
    Employee,
    Leave,
    WorkReport,
    Project,
    ProjectEmployee,
    Notification
)

from schemas import (
    HRDashboardResponse,
    HRAnalytics
)

from dependencies import (
    require_hr,
    require_employee
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =====================================================
# HR DASHBOARD
# =====================================================

@router.get(
    "/hr",
    response_model=HRDashboardResponse
)
def hr_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(require_hr)
):

    total_employees = db.query(
        Employee
    ).count()

    total_reports = db.query(
        WorkReport
    ).count()

    total_leaves = db.query(
        Leave
    ).count()

    approved = db.query(
        Leave
    ).filter(
        Leave.status == "approved"
    ).count()

    rejected = db.query(
        Leave
    ).filter(
        Leave.status == "rejected"
    ).count()

    pending = db.query(
        Leave
    ).filter(
        Leave.status == "pending"
    ).count()

    total_projects = db.query(
        Project
    ).filter(
        Project.status == "active"
    ).count()

    return HRDashboardResponse(
        status="success",
        analytics=HRAnalytics(
            total_employees=total_employees,
            total_work_reports=total_reports,
            total_leaves=total_leaves,
            approved_leaves=approved,
            rejected_leaves=rejected,
            pending_leaves=pending,
            total_projects=total_projects
        )
    )


# =====================================================
# EMPLOYEE DASHBOARD
# =====================================================

@router.get(
    "/employee"
)
def employee_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(require_employee)
):

    employee = db.query(Employee).filter(
        Employee.user_id == current_user.id
    ).first()

    if not employee:

        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    leaves = db.query(Leave).filter(
        Leave.employee_id == employee.id
    ).all()

    reports = db.query(WorkReport).filter(
        WorkReport.employee_id == employee.id
    ).all()

    notifications = db.query(
        Notification
    ).filter(
        Notification.employee_id == employee.id
    ).all()

    projects = (
        db.query(Project)
        .join(
            ProjectEmployee,
            Project.id == ProjectEmployee.project_id
        )
        .filter(
            ProjectEmployee.employee_id == employee.id
        )
        .all()
    )

    return {
        "status": "success",
        "dashboard": {
            "employee_id": employee.id,
            "employee_code": employee.employee_code,
            "my_leaves": leaves,
            "my_work_reports": reports,
            "my_notifications": notifications,
            "my_projects": projects
        }
    }