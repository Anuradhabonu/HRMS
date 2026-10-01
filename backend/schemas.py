
from datetime import date
from typing import List, Optional

from pydantic import (
    BaseModel,
    EmailStr,
    ConfigDict,
)


# =====================================================
# COMMON ORM CONFIG
# =====================================================

class ORMBaseModel(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# AUTH
# =====================================================

class OTPRequest(BaseModel):

    email: EmailStr


class OTPVerify(BaseModel):

    email: EmailStr
    otp: str
    role: str


class OTPResponse(BaseModel):

    status: str
    message: str
    development_otp: Optional[str] = None


class UserResponse(ORMBaseModel):

    id: int
    name: str
    email: EmailStr
    role: str
    employee_id: Optional[int] = None


class LoginResponse(BaseModel):

    access_token: str
    token_type: str
    user: UserResponse


# =====================================================
# EMPLOYEE
# =====================================================

class EmployeeCreate(BaseModel):

    name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class EmployeeUpdate(BaseModel):

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class EmployeeResponse(ORMBaseModel):

    id: int
    employee_code: Optional[str] = None
    user_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


# =====================================================
# PROFILE
# =====================================================

class ProfileUpdate(BaseModel):

    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class ProfileResponse(ORMBaseModel):

    id: int
    user_id: int
    employee_code: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    role: Optional[str] = None


# =====================================================
# LEAVES
# =====================================================

class LeaveCreate(BaseModel):

    start_date: date
    end_date: date
    reason: str


class LeaveUpdate(BaseModel):

    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None
    status: Optional[str] = None


class LeaveResponse(ORMBaseModel):

    id: int
    employee_id: int
    start_date: date
    end_date: date
    reason: str
    status: str


class LeaveActionResponse(BaseModel):

    status: str
    message: str


# =====================================================
# PROJECT
# =====================================================

class ProjectCreate(BaseModel):

    name: str
    description: Optional[str] = None
    status: str = "active"


class ProjectUpdate(BaseModel):

    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


# =====================================================
# PROJECT ASSIGN
# MULTIPLE EMPLOYEES
# =====================================================

class ProjectAssign(BaseModel):

    employee_ids: List[int]


class ProjectEmployeeResponse(ORMBaseModel):

    id: int
    project_id: int
    employee_id: int


class ProjectResponse(ORMBaseModel):

    id: int
    name: str
    description: Optional[str] = None
    status: Optional[str] = "active"


# =====================================================
# NOTIFICATIONS
# MULTIPLE EMPLOYEES
# DATE INCLUDED
# =====================================================

class NotificationCreate(BaseModel):

    employee_ids: List[int]
    title: str
    message: str


class NotificationUpdate(BaseModel):

    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None


class NotificationResponse(ORMBaseModel):

    id: int
    employee_id: Optional[int] = None
    title: str
    message: str
    is_read: bool
    created_at: date


# =====================================================
# WORK REPORTS
# SUBMIT DATE ONLY
# =====================================================

class WorkReportCreate(BaseModel):

    submit_date: date
    duration: Optional[str] = None
    report: str


class WorkReportUpdate(BaseModel):

    submit_date: Optional[date] = None
    duration: Optional[str] = None
    report: Optional[str] = None


class WorkReportResponse(ORMBaseModel):

    id: int
    employee_id: int

    # Employee information
    employee_name: str
    employee_email: EmailStr

    # Work report information
    submit_date: date
    duration: Optional[str] = None
    report: str


# =====================================================
# ANALYTICS
# =====================================================

class AnalyticsSummary(BaseModel):

    total_employees: int = 0
    total_projects: int = 0
    total_leaves: int = 0

    pending_leaves: int = 0
    approved_leaves: int = 0
    rejected_leaves: int = 0

    total_reports: int = 0
    total_notifications: int = 0


# =====================================================
# HR DASHBOARD
# =====================================================

class HRAnalytics(BaseModel):

    total_employees: int = 0
    total_work_reports: int = 0
    total_leaves: int = 0

    approved_leaves: int = 0
    rejected_leaves: int = 0
    pending_leaves: int = 0

    total_projects: int = 0
    total_notifications: int = 0


class HRDashboardResponse(BaseModel):

    status: str = "success"
    analytics: HRAnalytics


# =====================================================
# EMPLOYEE DASHBOARD
# =====================================================

class EmployeeDashboardResponse(BaseModel):

    employee_id: int
    employee_name: str

    total_projects: int = 0

    total_leaves: int = 0
    pending_leaves: int = 0
    approved_leaves: int = 0
    rejected_leaves: int = 0

    total_reports: int = 0
    unread_notifications: int = 0
