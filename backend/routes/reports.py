
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db

from models import (
    WorkReport,
    Employee
)

from schemas import (
    WorkReportCreate,
    WorkReportUpdate,
    WorkReportResponse
)

from dependencies import (
    require_hr,
    require_employee
)


router = APIRouter(
    prefix="/reports",
    tags=["Work Reports"]
)


# =====================================================
# HELPER - FORMAT WORK REPORT RESPONSE
# =====================================================

def report_response(report, employee):

    return {
        "id": report.id,
        "employee_id": employee.id,
        "employee_name": employee.name,
        "employee_email": employee.email,
        "submit_date": report.submit_date,
        "duration": report.duration,
        "report": report.report
    }


# =====================================================
# EMPLOYEE - CREATE WORK REPORT
# =====================================================

@router.post(
    "/",
    response_model=WorkReportResponse
)
def create_report(
    data: WorkReportCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    report = WorkReport(
        employee_id=employee.id,
        submit_date=data.submit_date,
        duration=data.duration,
        report=data.report
    )

    try:

        db.add(report)
        db.commit()
        db.refresh(report)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Work report creation failed: {str(e)}"
        )

    return report_response(
        report,
        employee
    )


# =====================================================
# EMPLOYEE - OWN REPORTS
# =====================================================

@router.get(
    "/me",
    response_model=list[WorkReportResponse]
)
def get_my_reports(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee)
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    reports = (
        db.query(WorkReport)
        .filter(
            WorkReport.employee_id == employee.id
        )
        .order_by(
            WorkReport.id.desc()
        )
        .all()
    )

    return [
        report_response(
            report,
            employee
        )
        for report in reports
    ]


# =====================================================
# HR - ALL REPORTS
# =====================================================

@router.get(
    "/",
    response_model=list[WorkReportResponse]
)
def get_all_reports(
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    rows = (
        db.query(
            WorkReport,
            Employee
        )
        .join(
            Employee,
            Employee.id == WorkReport.employee_id
        )
        .order_by(
            WorkReport.id.desc()
        )
        .all()
    )

    return [
        report_response(
            report,
            employee
        )
        for report, employee in rows
    ]


# =====================================================
# HR - VIEW SINGLE REPORT
# =====================================================

@router.get(
    "/{report_id}",
    response_model=WorkReportResponse
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    row = (
        db.query(
            WorkReport,
            Employee
        )
        .join(
            Employee,
            Employee.id == WorkReport.employee_id
        )
        .filter(
            WorkReport.id == report_id
        )
        .first()
    )

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Work report not found"
        )

    report, employee = row

    return report_response(
        report,
        employee
    )


# =====================================================
# HR - EDIT REPORT
# =====================================================

@router.put(
    "/{report_id}",
    response_model=WorkReportResponse
)
def update_report(
    report_id: int,
    data: WorkReportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    report = (
        db.query(WorkReport)
        .filter(
            WorkReport.id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Work report not found"
        )

    report.submit_date = data.submit_date
    report.duration = data.duration
    report.report = data.report

    try:

        db.commit()
        db.refresh(report)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Work report update failed: {str(e)}"
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == report.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return report_response(
        report,
        employee
    )


# =====================================================
# HR - DELETE REPORT
# =====================================================

@router.delete(
    "/{report_id}"
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    report = (
        db.query(WorkReport)
        .filter(
            WorkReport.id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Work report not found"
        )

    try:

        db.delete(report)
        db.commit()

        return {
            "status": "success",
            "message": "Work report deleted successfully"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Work report deletion failed: {str(e)}"
        )
