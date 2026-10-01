from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models import (
    User,
    Employee,
    Leave,
    Notification,
    WorkReport,
    ProjectEmployee,
)

from schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
)

from dependencies import (
    get_current_user,
    require_hr,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)


# ============================================================
# OPTIONAL WELCOME EMAIL
# ============================================================

try:
    from utils.email_service import send_welcome_email
except ImportError:
    send_welcome_email = None


# ============================================================
# HELPER - GET EMPLOYEE BY USER ID
# ============================================================

def find_employee_by_user_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(Employee)
        .filter(Employee.user_id == user_id)
        .first()
    )


# ============================================================
# HELPER - GENERATE EMPLOYEE CODE
# ============================================================

def generate_employee_code(
    db: Session,
):
    last_employee = (
        db.query(Employee)
        .order_by(Employee.id.desc())
        .first()
    )

    if last_employee:
        return f"EMP{last_employee.id + 1:03d}"

    return "EMP001"


# ============================================================
# HR - GET ALL EMPLOYEES
# GET /employees/
# ============================================================

@router.get(
    "/",
    response_model=list[EmployeeResponse],
)
def get_all_employees(
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):
    employees = (
        db.query(Employee)
        .order_by(Employee.id)
        .all()
    )

    return employees


# ============================================================
# HR - CREATE EMPLOYEE
# POST /employees/
# ============================================================

@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=201,
)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):
    # --------------------------------------------------------
    # Check duplicate email in User table
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    # --------------------------------------------------------
    # Check duplicate email in Employee table
    # --------------------------------------------------------

    existing_employee = (
        db.query(Employee)
        .filter(Employee.email == data.email)
        .first()
    )

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists",
        )

    try:
        # ----------------------------------------------------
        # Create User
        # ----------------------------------------------------

        user = User(
            name=data.name,
            email=data.email,
            role="employee",
        )

        # Add phone only if User model supports it
        if hasattr(user, "phone"):
            user.phone = data.phone

        db.add(user)
        db.flush()

        # ----------------------------------------------------
        # Generate Employee Code
        # ----------------------------------------------------

        employee_code = generate_employee_code(db)

        # ----------------------------------------------------
        # Create Employee
        # ----------------------------------------------------

        employee = Employee(
            employee_code=employee_code,
            user_id=user.id,
            name=data.name,
            email=data.email,
            phone=data.phone,
            department=data.department,
            designation=data.designation,
            city=data.city,
            state=data.state,
            country=data.country,
        )

        db.add(employee)

        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        db.commit()
        db.refresh(employee)

        # ----------------------------------------------------
        # Welcome Email
        # ----------------------------------------------------

        if send_welcome_email:
            try:
                send_welcome_email(
                    employee_name=employee.name,
                    employee_email=employee.email,
                )

                print(
                    "WELCOME EMAIL SENT:",
                    employee.email,
                )

            except Exception as email_error:
                print(
                    "WELCOME EMAIL ERROR:",
                    repr(email_error),
                )

        return employee

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Employee creation failed: {str(error)}",
        )


# ============================================================
# EMPLOYEE - GET OWN PROFILE
# GET /employees/me
# ============================================================

@router.get(
    "/me",
    response_model=EmployeeResponse,
)
def get_my_employee(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Employee only
    # --------------------------------------------------------

    if str(current_user.role).lower().strip() != "employee":
        raise HTTPException(
            status_code=403,
            detail="Employee access required",
        )

    # --------------------------------------------------------
    # Find employee linked to current user
    # --------------------------------------------------------

    employee = find_employee_by_user_id(
        db,
        current_user.id,
    )

    # --------------------------------------------------------
    # Employee profile must exist
    # --------------------------------------------------------

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found",
        )

    return employee


# ============================================================
# VIEW EMPLOYEE BY ID
# GET /employees/{employee_id}
#
# HR       -> Can view any employee
# Employee -> Can view only own profile
# ============================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Find employee
    # --------------------------------------------------------

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    role = str(
        current_user.role
    ).lower().strip()

    # --------------------------------------------------------
    # HR can view any employee
    # --------------------------------------------------------

    if role == "hr":
        return employee

    # --------------------------------------------------------
    # Employee can view only own profile
    # --------------------------------------------------------

    if role == "employee":

        if employee.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can access only your own profile",
            )

        return employee

    # --------------------------------------------------------
    # Unknown role
    # --------------------------------------------------------

    raise HTTPException(
        status_code=403,
        detail="Access denied",
    )


# ============================================================
# HR - UPDATE EMPLOYEE
# PUT /employees/{employee_id}
# ============================================================

@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):
    # --------------------------------------------------------
    # Find employee
    # --------------------------------------------------------

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    try:
        # ----------------------------------------------------
        # Duplicate email check
        # ----------------------------------------------------

        if data.email is not None:

            existing_user = (
                db.query(User)
                .filter(
                    User.email == data.email,
                    User.id != employee.user_id,
                )
                .first()
            )

            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Email already exists",
                )

            existing_employee = (
                db.query(Employee)
                .filter(
                    Employee.email == data.email,
                    Employee.id != employee.id,
                )
                .first()
            )

            if existing_employee:
                raise HTTPException(
                    status_code=400,
                    detail="Employee email already exists",
                )

            employee.email = data.email

        # ----------------------------------------------------
        # Update Name
        # ----------------------------------------------------

        if data.name is not None:
            employee.name = data.name

        # ----------------------------------------------------
        # Update Phone
        # ----------------------------------------------------

        if data.phone is not None:
            employee.phone = data.phone

        # ----------------------------------------------------
        # Update Department
        # ----------------------------------------------------

        if data.department is not None:
            employee.department = data.department

        # ----------------------------------------------------
        # Update Designation
        # ----------------------------------------------------

        if data.designation is not None:
            employee.designation = data.designation

        # ----------------------------------------------------
        # Update City
        # ----------------------------------------------------

        if data.city is not None:
            employee.city = data.city

        # ----------------------------------------------------
        # Update State
        # ----------------------------------------------------

        if data.state is not None:
            employee.state = data.state

        # ----------------------------------------------------
        # Update Country
        # ----------------------------------------------------

        if data.country is not None:
            employee.country = data.country

        # ----------------------------------------------------
        # Update linked User
        # ----------------------------------------------------

        if employee.user_id:

            user = (
                db.query(User)
                .filter(
                    User.id == employee.user_id
                )
                .first()
            )

            if user:

                if data.name is not None:
                    user.name = data.name

                if data.email is not None:
                    user.email = data.email

                if (
                    data.phone is not None
                    and hasattr(user, "phone")
                ):
                    user.phone = data.phone

        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        db.commit()
        db.refresh(employee)

        return employee

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Employee update failed: {str(error)}",
        )


# ============================================================
# HR - DELETE EMPLOYEE
# DELETE /employees/{employee_id}
# ============================================================

@router.delete(
    "/{employee_id}",
)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):
    # --------------------------------------------------------
    # Find employee
    # --------------------------------------------------------

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    user_id = employee.user_id

    try:
        # ----------------------------------------------------
        # Delete Leaves
        # ----------------------------------------------------

        db.query(Leave).filter(
            Leave.employee_id == employee.id
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------------
        # Delete Notifications
        # ----------------------------------------------------

        db.query(Notification).filter(
            Notification.employee_id == employee.id
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------------
        # Delete Work Reports
        # ----------------------------------------------------

        db.query(WorkReport).filter(
            WorkReport.employee_id == employee.id
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------------
        # Delete Project Assignments
        # ----------------------------------------------------

        db.query(ProjectEmployee).filter(
            ProjectEmployee.employee_id == employee.id
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------------
        # Delete Employee
        # ----------------------------------------------------

        db.delete(employee)
        db.flush()

        # ----------------------------------------------------
        # Delete linked User
        # ----------------------------------------------------

        if user_id:

            user = (
                db.query(User)
                .filter(
                    User.id == user_id
                )
                .first()
            )

            if user:
                db.delete(user)

        # ----------------------------------------------------
        # Commit
        # ----------------  ------------------------------------

        db.commit()

        return {
            "status": "success",
            "message": "Employee deleted successfully",
            "employee_id": employee_id,
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Employee deletion failed: {str(error)}",
        )