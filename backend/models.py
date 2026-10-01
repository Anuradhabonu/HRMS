
from datetime import date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship

from database import Base


# =====================================================
# USER
# =====================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    phone = Column(
        String(20),
        nullable=True,
    )

    role = Column(
        String(20),
        nullable=False,
        default="employee",
    )

    otp = Column(
        String(10),
        nullable=True,
    )

    otp_verified = Column(
        Boolean,
        default=False,
    )

    employee = relationship(
        "Employee",
        back_populates="user",
        uselist=False,
    )


# =====================================================
# EMPLOYEE
# =====================================================

class Employee(Base):

    __tablename__ = "employees"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_code = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(150),
        nullable=False,
    )

    phone = Column(
        String(20),
        nullable=True,
    )

    department = Column(
        String(100),
        nullable=True,
    )

    designation = Column(
        String(100),
        nullable=True,
    )

    city = Column(
        String(100),
        nullable=True,
    )

    state = Column(
        String(100),
        nullable=True,
    )

    country = Column(
        String(100),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="employee",
    )

    leaves = relationship(
        "Leave",
        back_populates="employee",
    )

    notifications = relationship(
        "Notification",
        back_populates="employee",
    )

    work_reports = relationship(
        "WorkReport",
        back_populates="employee",
    )


# =====================================================
# LEAVE
# =====================================================

class Leave(Base):

    __tablename__ = "leaves"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    start_date = Column(
        Date,
        nullable=False,
    )

    end_date = Column(
        Date,
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=False,
    )

    status = Column(
        String(20),
        default="pending",
        nullable=False,
    )

    employee = relationship(
        "Employee",
        back_populates="leaves",
    )


# =====================================================
# PROJECT
# =====================================================

class Project(Base):

    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(150),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(50),
        default="active",
    )

    assignments = relationship(
        "ProjectEmployee",
        back_populates="project",
    )


# =====================================================
# PROJECT EMPLOYEE
# =====================================================

class ProjectEmployee(Base):

    __tablename__ = "project_employees"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="assignments",
    )


# =====================================================
# NOTIFICATION
# DATE INCLUDED
# =====================================================

class Notification(Base):

    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True,
    )

    title = Column(
        String(200),
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    is_read = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # -------------------------------------------------
    # Notification created date
    # Example:
    # 2026-09-28
    # -------------------------------------------------

    created_at = Column(
        Date,
        default=date.today,
        nullable=False,
    )

    employee = relationship(
        "Employee",
        back_populates="notifications",
    )


# =====================================================
# WORK REPORT
# SUBMIT DATE ONLY
# =====================================================

class WorkReport(Base):

    __tablename__ = "work_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    # -------------------------------------------------
    # Report submission date
    # Example:
    # 2026-09-29
    # -------------------------------------------------

    submit_date = Column(
        Date,
        nullable=False,
    )

    duration = Column(
        String(50),
        nullable=True,
    )

    report = Column(
        Text,
        nullable=False,
    )

    employee = relationship(
        "Employee",
        back_populates="work_reports",
    )
