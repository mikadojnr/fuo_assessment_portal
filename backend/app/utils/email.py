import os
import smtplib
smtplib.SMTP.debuglevel = 1 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import Config
    

def send_email(to, subject, body):
    """Send an email using the configured SMTP server."""
    msg = MIMEMultipart()
    msg['From'] = Config.MAIL_DEFAULT_SENDER
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP_SSL(Config.MAIL_SERVER, Config.MAIL_PORT)

        server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_password_reset_email(user):
    """Send a password reset email to the user."""
    # Make sure the token is properly URL-encoded if needed
    reset_token = user.reset_token
    
    # In a real application, this would be a frontend URL
    reset_url = f"http://localhost:3000/reset-password/{reset_token}"
    
    subject = "Password Reset Request"
    
    # HTML email template
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #2A5C82, #00BFA5); padding: 20px; text-align: center; color: white;">
                <h1>Password Reset</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <p>Hello {user.first_name},</p>
                <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                <p>To reset your password, click the button below:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" style="background: linear-gradient(to right, #2A5C82, #00BFA5); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="{reset_url}">{reset_url}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>Best regards,<br>University Learning Platform Team</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user.email, subject, body)
