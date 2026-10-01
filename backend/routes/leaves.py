
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db

from models import (
    Leave,
    Employee,
    Notification
)

from schemas import (
    LeaveCreate,
    LeaveUpdate,
    LeaveResponse,
    LeaveActionResponse
)

from dependencies import (
    require_hr,
    require_employee,
    get_current_user
)

from utils.email_service import (
    send_leave_approved_email,
    send_leave_rejected_email
)


router = APIRouter(
    prefix="/leaves",
    tags=["Leaves"]
)


# ============================================================
# HELPER
# Add employee name + email to leave response
# ============================================================

def leave_response(
    leave: Leave,
    employee: Employee
):
    return {
        "id": leave.id,
        "employee_id": leave.employee_id,

        # IMPORTANT
        "employee_name": employee.name if employee else "Unknown Employee",
        "employee_email": employee.email if employee else "No email",

        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "reason": leave.reason,
        "status": leave.status
    }


# ============================================================
# EMPLOYEE - APPLY LEAVE
# ============================================================

@router.post(
    "/",
    response_model=LeaveResponse
)
def apply_leave(
    data: LeaveCreate,
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

    if data.end_date < data.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date"
        )

    leave = Leave(
        employee_id=employee.id,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status="pending"
    )

    db.add(leave)

    try:
        db.commit()
        db.refresh(leave)

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Leave application failed: {str(e)}"
        )

    # --------------------------------------------------------
    # Employee notification
    # --------------------------------------------------------

    try:

        notification = Notification(
            employee_id=employee.id,
            title="Leave Applied",
            message="Your leave application was submitted successfully.",
            is_read=False
        )

        db.add(notification)
        db.commit()

    except Exception:

        db.rollback()

    return leave_response(
        leave,
        employee
    )


# ============================================================
# EMPLOYEE - MY LEAVES
# ============================================================

@router.get(
    "/me",
    response_model=list[LeaveResponse]
)
def get_my_leaves(
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

    leaves = (
        db.query(Leave)
        .filter(
            Leave.employee_id == employee.id
        )
        .order_by(Leave.id.desc())
        .all()
    )

    return [
        leave_response(
            leave,
            employee
        )
        for leave in leaves
    ]


# ============================================================
# HR - ALL LEAVES
# ============================================================

@router.get(
    "/",
    response_model=list[LeaveResponse]
)
def get_all_leaves(
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    results = (
        db.query(
            Leave,
            Employee
        )
        .join(
            Employee,
            Employee.id == Leave.employee_id
        )
        .order_by(
            Leave.id.desc()
        )
        .all()
    )

    return [
        leave_response(
            leave,
            employee
        )
        for leave, employee in results
    ]


# ============================================================
# VIEW SINGLE LEAVE
#
# HR:
#   Can view any leave.
#
# Employee:
#   Can view only own leave.
# ============================================================

@router.get(
    "/{leave_id}",
    response_model=LeaveResponse
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    leave = (
        db.query(Leave)
        .filter(
            Leave.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == leave.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # --------------------------------------------------------
    # HR can view any leave
    # --------------------------------------------------------

    if current_user.role == "hr":

        return leave_response(
            leave,
            employee
        )

    # --------------------------------------------------------
    # Employee can view only own leave
    # --------------------------------------------------------

    if current_user.role == "employee":

        current_employee = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )

        if not current_employee:
            raise HTTPException(
                status_code=404,
                detail="Employee profile not found"
            )

        if leave.employee_id != current_employee.id:
            raise HTTPException(
                status_code=403,
                detail="You can view only your own leave"
            )

        return leave_response(
            leave,
            employee
        )

    raise HTTPException(
        status_code=403,
        detail="Access denied"
    )


# ============================================================
# UPDATE LEAVE
#
# HR:
#   Can update any leave.
#
# Employee:
#   Can update only own pending leave.
#   Cannot approve/reject.
# ============================================================

@router.put(
    "/{leave_id}",
    response_model=LeaveResponse
)
def update_leave(
    leave_id: int,
    data: LeaveUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    leave = (
        db.query(Leave)
        .filter(
            Leave.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == leave.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # ========================================================
    # EMPLOYEE
    # ========================================================

    if current_user.role == "employee":

        current_employee = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )

        if not current_employee:
            raise HTTPException(
                status_code=404,
                detail="Employee profile not found"
            )

        if leave.employee_id != current_employee.id:
            raise HTTPException(
                status_code=403,
                detail="You can update only your own leave"
            )

        if leave.status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Only pending leaves can be updated"
            )

        if (
            data.status is not None
            and data.status != "pending"
        ):
            raise HTTPException(
                status_code=403,
                detail="Employee cannot approve or reject leave"
            )

    # ========================================================
    # HR
    # ========================================================

    elif current_user.role == "hr":

        if data.status is not None:

            allowed_statuses = [
                "pending",
                "approved",
                "rejected"
            ]

            if data.status not in allowed_statuses:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid leave status"
                )

            leave.status = data.status

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    # ========================================================
    # DATE VALIDATION
    # ========================================================

    if data.end_date < data.start_date:

        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date"
        )

    # ========================================================
    # UPDATE DATA
    # ========================================================

    leave.start_date = data.start_date
    leave.end_date = data.end_date
    leave.reason = data.reason

    if current_user.role == "employee":
        leave.status = "pending"

    try:

        db.commit()
        db.refresh(leave)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Leave update failed: {str(e)}"
        )

    return leave_response(
        leave,
        employee
    )


# ============================================================
# DELETE LEAVE
#
# HR:
#   Can delete any leave.
#
# Employee:
#   Can delete only own pending leave.
# ============================================================

@router.delete(
    "/{leave_id}"
)
def delete_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    leave = (
        db.query(Leave)
        .filter(
            Leave.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    # ========================================================
    # EMPLOYEE
    # ========================================================

    if current_user.role == "employee":

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

        if leave.employee_id != employee.id:
            raise HTTPException(
                status_code=403,
                detail="You can delete only your own leave"
            )

        if leave.status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Only pending leaves can be deleted"
            )

    # ========================================================
    # HR
    # ========================================================

    elif current_user.role == "hr":

        pass

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    # ========================================================
    # DELETE
    # ========================================================

    try:

        db.delete(leave)
        db.commit()

        return {
            "status": "success",
            "message": "Leave deleted successfully"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Leave deletion failed: {str(e)}"
        )


# ============================================================
# HR - APPROVE LEAVE
# ============================================================

@router.put(
    "/{leave_id}/approve",
    response_model=LeaveActionResponse
)
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    leave = (
        db.query(Leave)
        .filter(
            Leave.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == leave.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    if leave.status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Leave is already approved"
        )

    leave.status = "approved"

    notification = Notification(
        employee_id=employee.id,
        title="Leave Approved",
        message="Your leave request has been approved by HR.",
        is_read=False
    )

    db.add(notification)

    try:

        db.commit()
        db.refresh(leave)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Leave approval failed: {str(e)}"
        )

    # ========================================================
    # EMAIL
    # ========================================================

    try:

        send_leave_approved_email(
            employee_name=employee.name,
            employee_email=employee.email,
            start_date=str(leave.start_date),
            end_date=str(leave.end_date)
        )

        print("LEAVE APPROVED EMAIL SENT:")
        print(employee.email)

    except Exception as email_error:

        print("LEAVE APPROVED EMAIL ERROR:")
        print(repr(email_error))

    return LeaveActionResponse(
        status="success",
        message="Leave approved successfully"
    )


# ============================================================
# HR - REJECT LEAVE
# ============================================================

@router.put(
    "/{leave_id}/reject",
    response_model=LeaveActionResponse
)
def reject_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr)
):

    leave = (
        db.query(Leave)
        .filter(
            Leave.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == leave.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    if leave.status == "rejected":
        raise HTTPException(
            status_code=400,
            detail="Leave is already rejected"
        )

    leave.status = "rejected"

    notification = Notification(
        employee_id=employee.id,
        title="Leave Rejected",
        message="Your leave request has been rejected by HR.",
        is_read=False
    )

    db.add(notification)

    try:

        db.commit()
        db.refresh(leave)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Leave rejection failed: {str(e)}"
        )

    # ========================================================
    # EMAIL
    # ========================================================

    try:

        send_leave_rejected_email(
            employee_name=employee.name,
            employee_email=employee.email,
            start_date=str(leave.start_date),
            end_date=str(leave.end_date)
        )

        print("LEAVE REJECTED EMAIL SENT:")
        print(employee.email)

    except Exception as email_error:

        print("LEAVE REJECTED EMAIL ERROR:")
        print(repr(email_error))

    return LeaveActionResponse(
        status="success",
        message="Leave rejected successfully"
    )
