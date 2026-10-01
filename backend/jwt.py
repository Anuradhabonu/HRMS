from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from fastapi import HTTPException

from config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    user_id: int,
    email: str,
    role: str
):
    """
    Creates JWT access token.

    Token validity:
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440
    1440 minutes = 24 hours
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(
    token: str
):
    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # ----------------------------------------------------
        # CHECK USER ID
        # ----------------------------------------------------

        user_id = payload.get(
            "sub"
        )

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token: User ID missing"
            )

        # ----------------------------------------------------
        # CHECK EMAIL
        # ----------------------------------------------------

        email = payload.get(
            "email"
        )

        if email is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token: Email missing"
            )

        # ----------------------------------------------------
        # CHECK ROLE
        # ----------------------------------------------------

        role = payload.get(
            "role"
        )

        if role not in [
            "hr",
            "employee"
        ]:

            raise HTTPException(
                status_code=401,
                detail="Invalid token: Role missing"
            )

        # ----------------------------------------------------
        # RETURN PAYLOAD
        # ----------------------------------------------------

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )