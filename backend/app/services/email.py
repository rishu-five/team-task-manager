import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(email_to: str, subject: str, html_content: str):
    print(f"DEBUG: Attempting to send email to {email_to}")
    print(f"DEBUG: SMTP_HOST={settings.SMTP_HOST}, SMTP_USER={settings.SMTP_USER}")
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"\n\n[MOCK EMAIL SERVICE] To: {email_to}")
        print(f"[MOCK EMAIL SERVICE] Subject: {subject}")
        print(f"[MOCK EMAIL SERVICE] Content: {html_content}")
        print("[MOCK EMAIL SERVICE] Reason: SMTP not configured in .env\n\n")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to

    part = MIMEText(html_content, "html")
    message.attach(part)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, message.as_string())
            print(f"Email sent successfully to {email_to}")
    except Exception as e:
        print(f"Failed to send email to {email_to}: {e}")

def send_otp_email(email_to: str, otp: str):
    subject = f"Your Password Reset OTP - {settings.PROJECT_NAME}"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; rounded: 8px;">
                <h2 style="color: #6366f1; text-align: center;">Team Task Manager</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your account. Please use the following 6-digit One-Time Password (OTP) to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6366f1; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">
                        {otp}
                    </span>
                </div>
                <p>This OTP will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                    This is an automated message, please do not reply.
                </p>
            </div>
        </body>
    </html>
    """
    send_email(email_to, subject, html_content)
