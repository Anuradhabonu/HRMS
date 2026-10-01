import smtplib

from email.message import EmailMessage

from config import (
    SMTP_SERVER,
    SMTP_PORT,
    HR_EMAIL,
    EMAIL_PASSWORD
)


# =========================================================
# GENERIC EMAIL FUNCTION
# =========================================================

def send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None
):

    if not to_email:
        raise Exception("Recipient email is missing")

    if not HR_EMAIL:
        raise Exception("HR_EMAIL is missing in .env")

    if not EMAIL_PASSWORD:
        raise Exception("EMAIL_PASSWORD is missing in .env")

    message = EmailMessage()

    message["From"] = HR_EMAIL
    message["To"] = to_email
    message["Subject"] = subject

    message.set_content(body)

    if html_body:
        message.add_alternative(
            html_body,
            subtype="html"
        )

    try:

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT,
            timeout=30
        ) as server:

            server.ehlo()
            server.starttls()
            server.ehlo()

            server.login(
                HR_EMAIL,
                EMAIL_PASSWORD
            )

            server.send_message(message)

        print(
            f"EMAIL SENT SUCCESSFULLY -> {to_email}"
        )

    except Exception as e:

        print("======================================")
        print("EMAIL ERROR:")
        print(repr(e))
        print("======================================")

        raise Exception(
            f"Email sending failed: {str(e)}"
        )


# =========================================================
# OTP EMAIL
# =========================================================

def send_otp_email(
    to_email: str,
    otp: str
):

    subject = "HRMS Login Verification OTP"

    body = f"""
HRMS LOGIN

Your HRMS Login Verification OTP is:

{otp}

This OTP is required to complete your HRMS login.

Please do not share this OTP with anyone.

Regards,
HRMS Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width, initial-scale=1.0">
<title>HRMS Login OTP</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
"
>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
background:#f3f4f6;
padding:40px 15px;
"
>

<tr>
<td align="center">

<table
width="550"
cellpadding="0"
cellspacing="0"
style="
max-width:550px;
width:100%;
background:#ffffff;
border-radius:18px;
overflow:hidden;
"
>

<tr>

<td
align="center"
style="
background:#2563eb;
padding:35px 20px;
"
>

<div
style="
width:90px;
height:90px;
margin:auto;
background:#ffffff;
border-radius:50%;
line-height:90px;
font-size:28px;
font-weight:bold;
color:#2563eb;
text-align:center;
"
>
HR
</div>

<h1
style="
margin:18px 0 0 0;
color:#ffffff;
font-size:30px;
"
>
HRMS
</h1>

<p
style="
margin:8px 0 0 0;
color:#dbeafe;
font-size:14px;
"
>
Human Resource Management System
</p>

</td>
</tr>

<tr>

<td
style="
padding:40px 35px;
text-align:center;
"
>

<h2
style="
margin:0 0 15px 0;
color:#111827;
font-size:24px;
"
>
Login Verification
</h2>

<p
style="
color:#4b5563;
font-size:15px;
line-height:1.6;
"
>
Use the One-Time Password below
to complete your HRMS login.
</p>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="margin:30px 0;"
>

<tr>

<td
align="center"
style="
background:#eff6ff;
border:2px solid #2563eb;
border-radius:14px;
padding:25px;
"
>

<p
style="
margin:0 0 12px 0;
font-size:12px;
font-weight:bold;
letter-spacing:2px;
color:#6b7280;
"
>
YOUR OTP
</p>

<div
style="
font-size:36px;
font-weight:bold;
letter-spacing:10px;
color:#2563eb;
"
>
{otp}
</div>

</td>
</tr>
</table>

<p
style="
color:#374151;
font-size:14px;
line-height:1.6;
"
>
Please do not share this OTP with anyone.
</p>

<p
style="
color:#6b7280;
font-size:13px;
line-height:1.6;
"
>
If you did not request this login,
you can safely ignore this email.
</p>

<hr
style="
border:none;
border-top:1px solid #e5e7eb;
margin:30px 0;
"
/>

<p
style="
margin:0;
color:#111827;
font-size:14px;
"
>
Regards,<br>
<strong>HRMS Team</strong>
</p>

<p
style="
margin-top:20px;
color:#9ca3af;
font-size:11px;
"
>
This is an automated email from HRMS.
</p>

<p
style="
margin:5px 0 0 0;
color:#9ca3af;
font-size:11px;
"
>
© HRMS Team
</p>

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
"""

    send_email(
        to_email=to_email,
        subject=subject,
        body=body,
        html_body=html_body
    )


# =========================================================
# WELCOME EMAIL
# =========================================================

def send_welcome_email(
    employee_name: str,
    employee_email: str
):

    subject = "Welcome to HRMS 🎉"

    body = f"""
Hello {employee_name},

Welcome to the HRMS system.

Your employee account has been successfully created.

You can now login to HRMS using your registered email.

Regards,
HR Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>

<body
style="
margin:0;
padding:40px;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
"
>

<div
style="
max-width:550px;
margin:auto;
background:white;
padding:40px;
border-radius:16px;
text-align:center;
"
>

<div
style="
width:80px;
height:80px;
margin:auto;
background:#2563eb;
border-radius:50%;
line-height:80px;
color:white;
font-size:25px;
font-weight:bold;
"
>
HR
</div>

<h1>
Welcome to HRMS 🎉
</h1>

<h2>
Hello {employee_name}
</h2>

<p>
Welcome to our HRMS system.
</p>

<p>
Your employee account has been
successfully created.
</p>

<p>
You can now login using your
registered email address.
</p>

<br>

<p>
Regards,<br>
<b>HR Team</b>
</p>

</div>

</body>
</html>
"""

    send_email(
        to_email=employee_email,
        subject=subject,
        body=body,
        html_body=html_body
    )


# =========================================================
# LEAVE APPROVED EMAIL
# =========================================================

def send_leave_approved_email(
    employee_name: str,
    employee_email: str,
    start_date: str,
    end_date: str
):

    subject = "Leave Application Approved ✓"

    body = f"""
Hello {employee_name},

Your leave application has been APPROVED by HR.

Start Date: {start_date}
End Date: {end_date}

Regards,
HR Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>

<body
style="
margin:0;
padding:40px;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
"
>

<div
style="
max-width:550px;
margin:auto;
background:white;
padding:40px;
border-radius:16px;
text-align:center;
"
>

<div
style="
width:80px;
height:80px;
margin:auto;
background:#2563eb;
border-radius:50%;
line-height:80px;
color:white;
font-size:25px;
font-weight:bold;
"
>
HR
</div>

<h1>
Leave Approved ✓
</h1>

<h2>
Hello {employee_name}
</h2>

<p>
Your leave application has been
<b>APPROVED</b> by HR.
</p>

<div
style="
margin:25px 0;
padding:20px;
background:#f0fdf4;
border-radius:10px;
"
>

<p>
<b>Start Date:</b> {start_date}
</p>

<p>
<b>End Date:</b> {end_date}
</p>

</div>

<p>
Regards,<br>
<b>HR Team</b>
</p>

</div>

</body>
</html>
"""

    send_email(
        to_email=employee_email,
        subject=subject,
        body=body,
        html_body=html_body
    )


# =========================================================
# LEAVE REJECTED EMAIL
# =========================================================

def send_leave_rejected_email(
    employee_name: str,
    employee_email: str,
    start_date: str,
    end_date: str
):

    subject = "Leave Application Rejected"

    body = f"""
Hello {employee_name},

Your leave application has been REJECTED by HR.

Start Date: {start_date}
End Date: {end_date}

Please contact HR if you need more information.

Regards,
HR Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>

<body
style="
margin:0;
padding:40px;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
"
>

<div
style="
max-width:550px;
margin:auto;
background:white;
padding:40px;
border-radius:16px;
text-align:center;
"
>

<div
style="
width:80px;
height:80px;
margin:auto;
background:#2563eb;
border-radius:50%;
line-height:80px;
color:white;
font-size:25px;
font-weight:bold;
"
>
HR
</div>

<h1>
Leave Rejected
</h1>

<h2>
Hello {employee_name}
</h2>

<p>
Your leave application has been
<b>REJECTED</b> by HR.
</p>

<div
style="
margin:25px 0;
padding:20px;
background:#fef2f2;
border-radius:10px;
"
>

<p>
<b>Start Date:</b> {start_date}
</p>

<p>
<b>End Date:</b> {end_date}
</p>

</div>

<p>
Please contact HR if you need
more information.
</p>

<p>
Regards,<br>
<b>HR Team</b>
</p>

</div>

</body>
</html>
"""

    send_email(
        to_email=employee_email,
        subject=subject,
        body=body,
        html_body=html_body
    )


# =========================================================
# NOTIFICATION EMAIL
# =========================================================

def send_notification_email(
    employee_name: str,
    employee_email: str,
    title: str,
    notification_message: str
):

    subject = f"HRMS Notification: {title}"

    body = f"""
Hello {employee_name},

You have received a new HRMS notification.

Title:
{title}

Message:
{notification_message}

Regards,
HR Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>

<body
style="
margin:0;
padding:40px;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
"
>

<div
style="
max-width:550px;
margin:auto;
background:white;
padding:40px;
border-radius:16px;
text-align:center;
"
>

<div
style="
width:80px;
height:80px;
margin:auto;
background:#2563eb;
border-radius:50%;
line-height:80px;
color:white;
font-size:25px;
font-weight:bold;
"
>
HR
</div>

<h1>
HRMS Notification
</h1>

<h2>
{title}
</h2>

<p>
Hello <b>{employee_name}</b>,
</p>

<div
style="
margin:25px 0;
padding:20px;
background:#eff6ff;
border-radius:10px;
text-align:left;
"
>

<p>
{notification_message}
</p>

</div>

<p>
Regards,<br>
<b>HR Team</b>
</p>

</div>

</body>
</html>
"""

    send_email(
        to_email=employee_email,
        subject=subject,
        body=body,
        html_body=html_body
    )


# =========================================================
# PROJECT ASSIGNMENT EMAIL
# =========================================================

def send_project_assignment_email(
    employee_email: str,
    employee_name: str,
    project_name: str,
    project_description: str | None = None,
    project_status: str | None = None,
):

    subject = f"New Project Assigned - {project_name}"

    description = project_description or "No project description provided."
    status = project_status or "active"

    # -----------------------------------------------------
    # PLAIN TEXT
    # -----------------------------------------------------

    body = f"""
Hello {employee_name},

A new project has been assigned to you in HRMS.

Project Name:
{project_name}

Project Description:
{description}

Project Status:
{status}

Please login to HRMS to view your project details.

Regards,
HR Team
"""

    # -----------------------------------------------------
    # HTML EMAIL
    # -----------------------------------------------------

    html_body = f"""
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>New Project Assigned</title>

</head>

<body
style="
margin:0;
padding:40px 15px;
background:#f3f4f6;
font-family:Arial,Helvetica,sans-serif;
"
>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
margin:auto;
background:#ffffff;
border-radius:18px;
overflow:hidden;
"
>

<!-- HEADER -->

<tr>

<td
align="center"
style="
background:#2563eb;
padding:35px 20px;
"
>

<div
style="
width:80px;
height:80px;
margin:auto;
background:#ffffff;
border-radius:50%;
line-height:80px;
font-size:25px;
font-weight:bold;
color:#2563eb;
"
>
HR
</div>

<h1
style="
margin:15px 0 5px;
color:#ffffff;
font-size:28px;
"
>
HRMS
</h1>

<p
style="
margin:0;
color:#dbeafe;
font-size:14px;
"
>
Project Assignment
</p>

</td>

</tr>


<!-- CONTENT -->

<tr>

<td
style="
padding:35px;
"
>

<h2
style="
margin:0 0 12px;
color:#111827;
font-size:24px;
"
>
New Project Assigned
</h2>

<p
style="
color:#374151;
font-size:15px;
line-height:1.6;
"
>
Hello <b>{employee_name}</b>,
</p>

<p
style="
color:#4b5563;
font-size:15px;
line-height:1.6;
"
>
A new project has been assigned to you
by HR through the HRMS system.
</p>


<!-- PROJECT CARD -->

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
margin:25px 0;
background:#eff6ff;
border:1px solid #bfdbfe;
border-radius:12px;
"
>

<tr>

<td
style="
padding:25px;
"
>

<p
style="
margin:0 0 8px;
font-size:12px;
font-weight:bold;
color:#6b7280;
text-transform:uppercase;
letter-spacing:1px;
"
>
PROJECT NAME
</p>

<h2
style="
margin:0 0 20px;
color:#1d4ed8;
font-size:22px;
"
>
{project_name}
</h2>

<p
style="
margin:0 0 8px;
font-size:12px;
font-weight:bold;
color:#6b7280;
text-transform:uppercase;
letter-spacing:1px;
"
>
DESCRIPTION
</p>

<p
style="
margin:0 0 20px;
color:#374151;
font-size:14px;
line-height:1.6;
"
>
{description}
</p>

<p
style="
margin:0 0 8px;
font-size:12px;
font-weight:bold;
color:#6b7280;
text-transform:uppercase;
letter-spacing:1px;
"
>
STATUS
</p>

<p
style="
margin:0;
color:#2563eb;
font-size:15px;
font-weight:bold;
text-transform:capitalize;
"
>
{status}
</p>

</td>

</tr>

</table>


<p
style="
color:#4b5563;
font-size:14px;
line-height:1.6;
"
>
Please login to HRMS to view your complete
project information.
</p>


<hr
style="
border:none;
border-top:1px solid #e5e7eb;
margin:30px 0;
"
/>


<p
style="
margin:0;
color:#111827;
font-size:14px;
"
>
Regards,<br>
<strong>HR Team</strong>
</p>


<p
style="
margin-top:20px;
color:#9ca3af;
font-size:11px;
text-align:center;
"
>
This is an automated email from HRMS.
</p>

</td>

</tr>

</table>

</body>

</html>
"""

    send_email(
        to_email=employee_email,
        subject=subject,
        body=body,
        html_body=html_body
    )