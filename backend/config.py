import os

from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "hrms-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


# ============================================================
# JWT TOKEN EXPIRATION
# 1440 minutes = 24 hours
# ============================================================

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "1440"
    )
)


# ============================================================
# EMAIL CONFIGURATION
# ============================================================

SMTP_SERVER = os.getenv(
    "SMTP_SERVER",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587"
    )
)

HR_EMAIL = os.getenv(
    "HR_EMAIL"
)

EMAIL_PASSWORD = os.getenv(
    "EMAIL_PASSWORD"
)