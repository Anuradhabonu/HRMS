from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Employee, Project, ProjectEmployee
from schemas import ProjectCreate, ProjectAssign
from dependencies import get_current_user, require_hr
from utils.email_service import send_project_assignment_email


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


# ============================================================
# GET MY PROJECTS
# EMPLOYEE ONLY
# ============================================================

@router.get("/me")
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Employee access required"
        )

    employee = (
        db.query(Employee)
        .filter(Employee.user_id == current_user.id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    assignments = (
        db.query(ProjectEmployee)
        .filter(
            ProjectEmployee.employee_id == employee.id
        )
        .all()
    )

    if not assignments:
        return []

    project_ids = [
        assignment.project_id
        for assignment in assignments
    ]

    projects = (
        db.query(Project)
        .filter(Project.id.in_(project_ids))
        .order_by(Project.id.desc())
        .all()
    )

    result = []

    for project in projects:

        project_assignments = (
            db.query(ProjectEmployee)
            .filter(
                ProjectEmployee.project_id == project.id
            )
            .all()
        )

        assigned_employees = []

        for assignment in project_assignments:

            assigned_employee = (
                db.query(Employee)
                .filter(
                    Employee.id == assignment.employee_id
                )
                .first()
            )

            if assigned_employee:
                assigned_employees.append({
                    "id": assigned_employee.id,
                    "employee_code": assigned_employee.employee_code,
                    "name": assigned_employee.name,
                    "email": assigned_employee.email,
                    "department": assigned_employee.department,
                    "designation": assigned_employee.designation,
                })

        result.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "employee_id": employee.id,
            "employee_name": employee.name,
            "employees": assigned_employees,
        })

    return result


# ============================================================
# GET ALL PROJECTS
# HR ONLY
# ============================================================

@router.get("/")
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    projects = (
        db.query(Project)
        .order_by(Project.id.desc())
        .all()
    )

    result = []

    for project in projects:

        assignments = (
            db.query(ProjectEmployee)
            .filter(
                ProjectEmployee.project_id == project.id
            )
            .all()
        )

        employees = []

        for assignment in assignments:

            employee = (
                db.query(Employee)
                .filter(
                    Employee.id == assignment.employee_id
                )
                .first()
            )

            if employee:
                employees.append({
                    "id": employee.id,
                    "employee_code": employee.employee_code,
                    "name": employee.name,
                    "email": employee.email,
                    "department": employee.department,
                    "designation": employee.designation,
                })

        result.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "employees": employees,
            "employee_ids": [
                employee["id"]
                for employee in employees
            ],
        })

    return result


# ============================================================
# CREATE PROJECT
# HR ONLY
# ============================================================

@router.post("/")
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    project = Project(
        name=data.name,
        description=data.description,
        status=data.status or "active",
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "message": "Project created successfully",
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "employees": [],
            "employee_ids": [],
        }
    }


# ============================================================
# ASSIGN PROJECT TO MULTIPLE EMPLOYEES
# HR ONLY
# ============================================================

@router.post("/{project_id}/assign")
def assign_project(
    project_id: int,
    data: ProjectAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    # --------------------------------------------------------
    # CHECK PROJECT
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # --------------------------------------------------------
    # REMOVE DUPLICATES
    # --------------------------------------------------------

    employee_ids = list(
        dict.fromkeys(data.employee_ids)
    )

    if not employee_ids:
        raise HTTPException(
            status_code=422,
            detail="At least one employee is required"
        )

    # --------------------------------------------------------
    # FIND EMPLOYEES
    # --------------------------------------------------------

    employees = (
        db.query(Employee)
        .filter(Employee.id.in_(employee_ids))
        .all()
    )

    found_ids = {
        employee.id
        for employee in employees
    }

    missing_ids = [
        employee_id
        for employee_id in employee_ids
        if employee_id not in found_ids
    ]

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Employees not found: {missing_ids}"
        )

    # --------------------------------------------------------
    # FIND EXISTING ASSIGNMENTS
    # --------------------------------------------------------

    existing_rows = (
        db.query(ProjectEmployee)
        .filter(
            ProjectEmployee.project_id == project_id,
            ProjectEmployee.employee_id.in_(employee_ids)
        )
        .all()
    )

    existing_ids = {
        row.employee_id
        for row in existing_rows
    }

    # --------------------------------------------------------
    # NEW EMPLOYEES ONLY
    # --------------------------------------------------------

    new_ids = [
        employee_id
        for employee_id in employee_ids
        if employee_id not in existing_ids
    ]

    # --------------------------------------------------------
    # CREATE ASSIGNMENTS
    # --------------------------------------------------------

    for employee_id in new_ids:

        assignment = ProjectEmployee(
            project_id=project_id,
            employee_id=employee_id,
        )

        db.add(assignment)

    db.commit()

    # --------------------------------------------------------
    # SEND PROJECT EMAIL
    # ONLY NEWLY ASSIGNED EMPLOYEES
    # --------------------------------------------------------

    email_sent = 0
    email_failed = 0

    new_employees = [
        employee
        for employee in employees
        if employee.id in new_ids
    ]

    for employee in new_employees:

        if not employee.email:
            continue

        try:
            send_project_assignment_email(
                employee_email=employee.email,
                employee_name=employee.name,
                project_name=project.name,
                project_description=project.description,
                project_status=project.status,
            )

            email_sent += 1

        except Exception:
            email_failed += 1

    # --------------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------------

    return {
        "message": "Project assigned successfully",

        "project_id": project.id,

        "project_name": project.name,

        "assigned_employee_ids": new_ids,

        "already_assigned_employee_ids": list(
            existing_ids
        ),

        "email_sent": email_sent,

        "email_failed": email_failed,

        "employees": [
            {
                "id": employee.id,
                "employee_code": employee.employee_code,
                "name": employee.name,
                "email": employee.email,
            }
            for employee in employees
        ],
    }


# ============================================================
# GET SINGLE PROJECT
# HR ONLY
# ============================================================

@router.get("/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    assignments = (
        db.query(ProjectEmployee)
        .filter(
            ProjectEmployee.project_id == project.id
        )
        .all()
    )

    employees = []

    for assignment in assignments:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == assignment.employee_id
            )
            .first()
        )

        if employee:
            employees.append({
                "id": employee.id,
                "employee_code": employee.employee_code,
                "name": employee.name,
                "email": employee.email,
                "department": employee.department,
                "designation": employee.designation,
            })

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "employees": employees,
        "employee_ids": [
            employee["id"]
            for employee in employees
        ],
    }


# ============================================================
# UPDATE PROJECT
# HR ONLY
# ============================================================

@router.put("/{project_id}")
def update_project(
    project_id: int,
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    project.name = data.name
    project.description = data.description
    project.status = data.status or "active"

    db.commit()
    db.refresh(project)

    return {
        "message": "Project updated successfully",

        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
        }
    }


# ============================================================
# DELETE PROJECT
# HR ONLY
# ============================================================

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # --------------------------------------------------------
    # DELETE ASSIGNMENTS
    # --------------------------------------------------------

    db.query(ProjectEmployee).filter(
        ProjectEmployee.project_id == project_id
    ).delete(
        synchronize_session=False
    )

    # --------------------------------------------------------
    # DELETE PROJECT
    # --------------------------------------------------------

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully",
        "project_id": project_id,
    }