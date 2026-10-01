
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

HR_EMAIL = os.getenv("HR_EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587


def send_email(to_email, subject, body):
    message = EmailMessage()

    message["From"] = HR_EMAIL
    message["To"] = to_email
    message["Subject"] = subject

    message.set_content(body)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(HR_EMAIL, EMAIL_PASSWORD)
        server.send_message(message)

