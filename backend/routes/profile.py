from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Employee
from schemas import ProfileUpdate
from dependencies import get_current_user, require_hr


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# ============================================================
# DEFAULT HR DETAILS
# ============================================================

DEFAULT_HR_DETAILS = {
    "employee_code": "HR001",
    "name": "Mediatize",
    "email": "mediatize87@gmail.com",
    "phone": "9876543210",
    "department": "Human Resources",
    "designation": "HR Manager",
    "city": "Hyderabad",
    "state": "Telangana",
    "country": "India",
    "role": "hr",
    "status": "active",
}


# ============================================================
# BUILD PROFILE RESPONSE
# ============================================================

def build_profile_response(
    current_user: User,
    employee=None,
):
    # ========================================================
    # EMPLOYEE PROFILE EXISTS
    # ========================================================

    if employee:

        return {
            "id": employee.id,
            "user_id": employee.user_id,
            "employee_code": employee.employee_code,
            "name": employee.name,
            "email": employee.email,
            "phone": getattr(
                employee,
                "phone",
                None
            ),
            "department": getattr(
                employee,
                "department",
                None
            ),
            "designation": getattr(
                employee,
                "designation",
                None
            ),
            "city": getattr(
                employee,
                "city",
                None
            ),
            "state": getattr(
                employee,
                "state",
                None
            ),
            "country": getattr(
                employee,
                "country",
                None
            ),
            "role": current_user.role,
            "status": getattr(
                employee,
                "status",
                "active"
            ),
        }

    # ========================================================
    # HR USER WITHOUT EMPLOYEE RECORD
    # ========================================================

    if str(current_user.role).strip().lower() == "hr":

        return {
            "id": current_user.id,
            "user_id": current_user.id,
            "employee_code": DEFAULT_HR_DETAILS[
                "employee_code"
            ],
            "name": (
                current_user.name
                or DEFAULT_HR_DETAILS["name"]
            ),
            "email": (
                current_user.email
                or DEFAULT_HR_DETAILS["email"]
            ),
            "phone": (
                getattr(
                    current_user,
                    "phone",
                    None
                )
                or DEFAULT_HR_DETAILS["phone"]
            ),
            "department": (
                getattr(
                    current_user,
                    "department",
                    None
                )
                or DEFAULT_HR_DETAILS["department"]
            ),
            "designation": (
                getattr(
                    current_user,
                    "designation",
                    None
                )
                or DEFAULT_HR_DETAILS["designation"]
            ),
            "city": (
                getattr(
                    current_user,
                    "city",
                    None
                )
                or DEFAULT_HR_DETAILS["city"]
            ),
            "state": (
                getattr(
                    current_user,
                    "state",
                    None
                )
                or DEFAULT_HR_DETAILS["state"]
            ),
            "country": (
                getattr(
                    current_user,
                    "country",
                    None
                )
                or DEFAULT_HR_DETAILS["country"]
            ),
            "role": "hr",
            "status": (
                getattr(
                    current_user,
                    "status",
                    None
                )
                or DEFAULT_HR_DETAILS["status"]
            ),
        }

    # ========================================================
    # NORMAL USER WITHOUT EMPLOYEE RECORD
    # ========================================================

    return {
        "id": current_user.id,
        "user_id": current_user.id,
        "employee_code": None,
        "name": current_user.name,
        "email": current_user.email,
        "phone": getattr(
            current_user,
            "phone",
            None
        ),
        "department": getattr(
            current_user,
            "department",
            None
        ),
        "designation": getattr(
            current_user,
            "designation",
            None
        ),
        "city": getattr(
            current_user,
            "city",
            None
        ),
        "state": getattr(
            current_user,
            "state",
            None
        ),
        "country": getattr(
            current_user,
            "country",
            None
        ),
        "role": current_user.role,
        "status": getattr(
            current_user,
            "status",
            "active"
        ),
    }


# ============================================================
# GET MY PROFILE
# ============================================================

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )

    return build_profile_response(
        current_user,
        employee
    )


# ============================================================
# GET HR PROFILE
# ============================================================

@router.get("/hr")
def get_hr_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )

    return build_profile_response(
        current_user,
        employee
    )


# ============================================================
# GET EMPLOYEE PROFILE - HR ONLY
# ============================================================

@router.get("/employees/{employee_id}")
def get_employee_profile(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    user = (
        db.query(User)
        .filter(
            User.id == employee.user_id
        )
        .first()
    )

    return {
        "id": employee.id,
        "user_id": employee.user_id,
        "employee_code": employee.employee_code,
        "name": employee.name,
        "email": employee.email,
        "phone": getattr(
            employee,
            "phone",
            None
        ),
        "department": getattr(
            employee,
            "department",
            None
        ),
        "designation": getattr(
            employee,
            "designation",
            None
        ),
        "city": getattr(
            employee,
            "city",
            None
        ),
        "state": getattr(
            employee,
            "state",
            None
        ),
        "country": getattr(
            employee,
            "country",
            None
        ),
        "role": (
            user.role
            if user
            else "employee"
        ),
        "status": getattr(
            employee,
            "status",
            "active"
        ),
    }


# ============================================================
# UPDATE MY PROFILE
# ============================================================

@router.put("/me")
def update_my_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )

    data = profile.model_dump(
        exclude_unset=True
    )

    # ========================================================
    # UPDATE EMPLOYEE
    # ========================================================

    if employee:

        for field, value in data.items():

            if hasattr(employee, field):
                setattr(
                    employee,
                    field,
                    value
                )

        db.commit()
        db.refresh(employee)

        return build_profile_response(
            current_user,
            employee
        )

    # ========================================================
    # UPDATE USER
    # ========================================================

    for field, value in data.items():

        if hasattr(current_user, field):
            setattr(
                current_user,
                field,
                value
            )

    db.commit()
    db.refresh(current_user)

    return build_profile_response(
        current_user
    )


# ============================================================
# DELETE MY PROFILE
# ============================================================

@router.delete("/me")
def delete_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )

    if employee:
        db.delete(employee)

    db.delete(current_user)

    db.commit()

    return {
        "status": "success",
        "message": "Profile deleted successfully",
    }


# ============================================================
# DELETE EMPLOYEE PROFILE - HR ONLY
# ============================================================

@router.delete("/employees/{employee_id}")
def delete_employee_profile(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    user_id = employee.user_id

    db.delete(employee)

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

    db.commit()

    return {
        "status": "success",
        "message": "Employee profile deleted successfully",
    }