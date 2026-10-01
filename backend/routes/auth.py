
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models import User, Employee

from schemas import (
    OTPRequest,
    OTPVerify,
    OTPResponse,
    LoginResponse,
    UserResponse
)

from jwt import create_access_token

from utils.email_service import send_otp_email


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =====================================================
# SEND OTP
# =====================================================

@router.post(
    "/send-otp",
    response_model=OTPResponse
)
def send_otp(
    data: OTPRequest,
    db: Session = Depends(get_db)
):

    # -------------------------------------------------
    # CLEAN EMAIL
    # -------------------------------------------------

    email = str(data.email).lower().strip()

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    print("\n======================================")
    print("HRMS SEND OTP")
    print("Email:", email)
    print("======================================")


    # -------------------------------------------------
    # FIND USER
    # -------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


    # -------------------------------------------------
    # CREATE USER IF NOT EXISTS
    # -------------------------------------------------

    if not user:

        user = User(
            name=email.split("@")[0],
            email=email,
            role="employee",
            otp_verified=False
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print("New user created")
        print("User ID:", user.id)


    # -------------------------------------------------
    # GENERATE 6 DIGIT OTP
    # -------------------------------------------------

    otp = str(
        random.randint(
            100000,
            999999
        )
    )


    # -------------------------------------------------
    # SAVE OTP
    # -------------------------------------------------

    user.otp = otp
    user.otp_verified = False

    db.add(user)
    db.commit()
    db.refresh(user)


    print("\n======================================")
    print("OTP DATABASE")
    print("User ID:", user.id)
    print("Email:", user.email)
    print("Generated OTP:", otp)
    print("Saved OTP:", user.otp)
    print("======================================")


    # -------------------------------------------------
    # SEND OTP EMAIL
    # -------------------------------------------------

    try:

        send_otp_email(
            to_email=email,
            otp=otp
        )

        print("OTP EMAIL SENT SUCCESSFULLY")


        return OTPResponse(
            status="success",
            message="OTP sent successfully",
            development_otp=None
        )


    except Exception as e:

        print("\n======================================")
        print("OTP EMAIL FAILED")
        print("ERROR:", repr(e))
        print("DEVELOPMENT OTP:", otp)
        print("======================================")


        # Development fallback
        return OTPResponse(
            status="warning",
            message="OTP generated but email sending failed",
            development_otp=otp
        )


# =====================================================
# VERIFY OTP
# =====================================================

@router.post(
    "/verify-otp",
    response_model=LoginResponse
)
def verify_otp(
    data: OTPVerify,
    db: Session = Depends(get_db)
):

    # -------------------------------------------------
    # CLEAN DATA
    # -------------------------------------------------

    email = str(data.email).lower().strip()
    otp = str(data.otp).strip()
    role = str(data.role).lower().strip()


    # -------------------------------------------------
    # VALIDATE EMAIL
    # -------------------------------------------------

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )


    # -------------------------------------------------
    # VALIDATE OTP
    # -------------------------------------------------

    if not otp:

        raise HTTPException(
            status_code=400,
            detail="OTP is required"
        )

    if len(otp) != 6 or not otp.isdigit():

        raise HTTPException(
            status_code=400,
            detail="OTP must be 6 digits"
        )


    # -------------------------------------------------
    # VALIDATE ROLE
    # -------------------------------------------------

    if role not in [
        "hr",
        "employee"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Role must be hr or employee"
        )


    print("\n======================================")
    print("HRMS VERIFY OTP")
    print("Email:", email)
    print("Entered OTP:", otp)
    print("Role:", role)
    print("======================================")


    # -------------------------------------------------
    # FIND USER
    # -------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found. Please request OTP again."
        )


    print("User ID:", user.id)
    print("Database OTP:", user.otp)


    # -------------------------------------------------
    # CHECK OTP EXISTS
    # -------------------------------------------------

    if user.otp is None:

        raise HTTPException(
            status_code=400,
            detail="OTP not found. Please request a new OTP."
        )


    # -------------------------------------------------
    # CHECK OTP
    # -------------------------------------------------

    if str(user.otp).strip() != otp:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )


    print("OTP VERIFIED SUCCESSFULLY")


    # -------------------------------------------------
    # UPDATE USER
    # -------------------------------------------------

    user.otp_verified = True
    user.role = role

    db.add(user)
    db.commit()
    db.refresh(user)


    # -------------------------------------------------
    # FIND EMPLOYEE PROFILE
    # -------------------------------------------------

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == user.id
        )
        .first()
    )


    employee_id = (
        employee.id
        if employee
        else None
    )


    # -------------------------------------------------
    # CREATE JWT TOKEN
    # -------------------------------------------------

    try:

        token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role
        )

    except Exception as e:

        print("\n======================================")
        print("JWT TOKEN CREATION FAILED")
        print("ERROR:", repr(e))
        print("======================================")

        raise HTTPException(
            status_code=500,
            detail="JWT token creation failed"
        )


    # -------------------------------------------------
    # CLEAR OTP AFTER SUCCESSFUL LOGIN
    # -------------------------------------------------

    user.otp = None

    db.add(user)
    db.commit()
    db.refresh(user)


    # -------------------------------------------------
    # LOGIN SUCCESS
    # -------------------------------------------------

    print("\n======================================")
    print("LOGIN SUCCESSFUL")
    print("User ID:", user.id)
    print("Name:", user.name)
    print("Email:", user.email)
    print("Role:", user.role)
    print("Employee ID:", employee_id)
    print("JWT TOKEN CREATED: YES")
    print("======================================")


    # -------------------------------------------------
    # RETURN LOGIN RESPONSE
    # -------------------------------------------------

    return LoginResponse(

        access_token=token,

        token_type="bearer",

        user=UserResponse(

            id=user.id,

            name=user.name,

            email=user.email,

            role=user.role,

            employee_id=employee_id

        )
    )
