from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from database import get_db

from models import (
    Notification,
    Employee,
)

from schemas import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
)

from dependencies import (
    require_hr,
    require_employee,
)

from utils.email_service import (
    send_notification_email,
)


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# =====================================================
# HR - CREATE NOTIFICATION
# MULTIPLE EMPLOYEES
# DATE INCLUDED
# =====================================================

@router.post(
    "/",
    response_model=list[NotificationResponse],
)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):

    # -------------------------------------------------
    # Validate employee IDs
    # -------------------------------------------------

    if not data.employee_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one employee ID is required",
        )

    # -------------------------------------------------
    # Remove duplicate employee IDs
    # -------------------------------------------------

    employee_ids = list(
        dict.fromkeys(data.employee_ids)
    )

    # -------------------------------------------------
    # Validate title
    # -------------------------------------------------

    title = data.title.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Notification title is required",
        )

    # -------------------------------------------------
    # Validate message
    # -------------------------------------------------

    message = data.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Notification message is required",
        )

    # -------------------------------------------------
    # Get employees
    # -------------------------------------------------

    employees = (
        db.query(Employee)
        .filter(
            Employee.id.in_(employee_ids)
        )
        .all()
    )

    # -------------------------------------------------
    # Check invalid employee IDs
    # -------------------------------------------------

    found_employee_ids = {
        employee.id
        for employee in employees
    }

    invalid_employee_ids = [
        employee_id
        for employee_id in employee_ids
        if employee_id not in found_employee_ids
    ]

    if invalid_employee_ids:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Some employee IDs were not found",
                "invalid_employee_ids": invalid_employee_ids,
            },
        )

    # -------------------------------------------------
    # Today's notification date
    #
    # Example:
    # 2026-09-28
    # -------------------------------------------------

    notification_date = date.today()

    # -------------------------------------------------
    # Create notification for every employee
    # -------------------------------------------------

    created_notifications = []

    try:

        for employee in employees:

            notification = Notification(
                employee_id=employee.id,
                title=title,
                message=message,
                is_read=False,
                created_at=notification_date,
            )

            db.add(notification)

            created_notifications.append(
                notification
            )

        # -------------------------------------------------
        # Save notifications
        # -------------------------------------------------

        db.commit()

        # -------------------------------------------------
        # Refresh notifications
        # -------------------------------------------------

        for notification in created_notifications:
            db.refresh(notification)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Notification creation failed: {str(e)}",
        )

    # =================================================
    # SEND EMAIL TO EACH EMPLOYEE
    # =================================================

    for employee in employees:

        try:

            if employee.email:

                send_notification_email(
                    employee_name=employee.name,
                    employee_email=employee.email,
                    title=title,
                    notification_message=message,
                )

                print(
                    "NOTIFICATION EMAIL SENT:"
                )

                print(
                    f"Employee: {employee.name}"
                )

                print(
                    f"Email: {employee.email}"
                )

        except Exception as email_error:

            # Email failure should not rollback
            # database notification.

            print(
                "NOTIFICATION EMAIL ERROR:"
            )

            print(
                f"Employee: {employee.name}"
            )

            print(
                f"Email: {employee.email}"
            )

            print(
                repr(email_error)
            )

    # -------------------------------------------------
    # Return created notifications
    # -------------------------------------------------

    return created_notifications


# =====================================================
# HR - ALL NOTIFICATIONS
# =====================================================

@router.get(
    "/",
    response_model=list[NotificationResponse],
)
def get_all_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):

    return (
        db.query(Notification)
        .order_by(
            Notification.id.desc()
        )
        .all()
    )


# =====================================================
# EMPLOYEE - OWN NOTIFICATIONS
# =====================================================

@router.get(
    "/me",
    response_model=list[NotificationResponse],
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(require_employee),
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
            detail="Employee not found",
        )

    return (
        db.query(Notification)
        .filter(
            Notification.employee_id == employee.id
        )
        .order_by(
            Notification.id.desc()
        )
        .all()
    )


# =====================================================
# HR - VIEW SINGLE NOTIFICATION
# =====================================================

@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return notification


# =====================================================
# HR - EDIT NOTIFICATION
# TITLE + MESSAGE + READ STATUS
# =====================================================

@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def update_notification(
    notification_id: int,
    data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    # -------------------------------------------------
    # Update title
    # -------------------------------------------------

    if data.title is not None:

        title = data.title.strip()

        if not title:
            raise HTTPException(
                status_code=400,
                detail="Notification title is required",
            )

        notification.title = title

    # -------------------------------------------------
    # Update message
    # -------------------------------------------------

    if data.message is not None:

        message = data.message.strip()

        if not message:
            raise HTTPException(
                status_code=400,
                detail="Notification message is required",
            )

        notification.message = message

    # -------------------------------------------------
    # Update read status
    # -------------------------------------------------

    if data.is_read is not None:
        notification.is_read = data.is_read

    # -------------------------------------------------
    # Save changes
    # -------------------------------------------------

    try:

        db.commit()

        db.refresh(notification)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Notification update failed: {str(e)}",
        )

    return notification


# =====================================================
# HR - DELETE NOTIFICATION
# =====================================================

@router.delete(
    "/{notification_id}",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_hr),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    try:

        db.delete(notification)

        db.commit()

        return {
            "status": "success",
            "message": "Notification deleted successfully",
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Notification deletion failed: {str(e)}",
        )


# =====================================================
# EMPLOYEE - MARK NOTIFICATION AS READ
# =====================================================

@router.put(
    "/{notification_id}/read",
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_employee),
):

    # -------------------------------------------------
    # Find logged-in employee
    # -------------------------------------------------

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
            detail="Employee not found",
        )

    # -------------------------------------------------
    # Find employee notification
    # -------------------------------------------------

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.employee_id == employee.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    # -------------------------------------------------
    # Mark as read
    # -------------------------------------------------

    notification.is_read = True

    try:

        db.commit()

        db.refresh(notification)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark notification as read: {str(e)}",
        )

    return {
        "status": "success",
        "message": "Notification marked as read",
    }