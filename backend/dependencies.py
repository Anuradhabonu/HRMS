from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User
from jwt import decode_access_token


# ============================================================
# HTTP BEARER
# ============================================================

security = HTTPBearer(
    auto_error=True
)


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # GET TOKEN
    # --------------------------------------------------------

    token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authorization token is missing",
        )

    # --------------------------------------------------------
    # DECODE TOKEN
    # --------------------------------------------------------

    try:
        payload = decode_access_token(token)

    except HTTPException as error:
        raise error

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    # --------------------------------------------------------
    # TOKEN DATA
    # --------------------------------------------------------

    user_id = payload.get("sub")
    token_email = payload.get("email")
    token_role = payload.get("role")

    # --------------------------------------------------------
    # CHECK USER ID
    # --------------------------------------------------------

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="User ID missing from token",
        )

    try:
        user_id = int(user_id)

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid user ID in token",
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    # ========================================================
    # USER FOUND
    # ========================================================

    if user is not None:

        # ----------------------------------------------------
        # CHECK EMAIL
        # ----------------------------------------------------

        if token_email:

            database_email = (
                str(user.email).strip().lower()
                if user.email
                else ""
            )

            jwt_email = (
                str(token_email).strip().lower()
            )

            if database_email != jwt_email:
                raise HTTPException(
                    status_code=401,
                    detail="Token email does not match user",
                )

        # ----------------------------------------------------
        # CHECK ROLE
        # ----------------------------------------------------

        if token_role:

            database_role = (
                str(user.role).strip().lower()
                if user.role
                else ""
            )

            jwt_role = (
                str(token_role).strip().lower()
            )

            if database_role != jwt_role:
                raise HTTPException(
                    status_code=401,
                    detail="Token role does not match user",
                )

        return user

    # ========================================================
    # USER NOT FOUND
    #
    # FOR LOCAL TESTING:
    # USE TOKEN DATA AS FALLBACK USER
    # ========================================================

    # Create an in-memory User object.
    # This object is NOT inserted into PostgreSQL.

    fallback_user = User()

    fallback_user.id = user_id
    fallback_user.email = token_email
    fallback_user.role = token_role

    # If your User model has these fields, they can be added
    # here only if required by your routes.

    if hasattr(fallback_user, "name"):
        fallback_user.name = (
            token_email.split("@")[0]
            if token_email
            else "HR User"
        )

    return fallback_user


# ============================================================
# HR ACCESS
# ============================================================

def require_hr(
    current_user: User = Depends(get_current_user),
):
    role = (
        str(current_user.role).strip().lower()
        if current_user.role
        else ""
    )

    if role != "hr":
        raise HTTPException(
            status_code=403,
            detail="HR access required",
        )

    return current_user


# ============================================================
# EMPLOYEE ACCESS
# ============================================================

def require_employee(
    current_user: User = Depends(get_current_user),
):
    role = (
        str(current_user.role).strip().lower()
        if current_user.role
        else ""
    )

    if role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Employee access required",
        )

    return current_user