import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Hello, this is a test email from Python!")
msg["Subject"] = "SMTP Test"
msg["From"] = "edidavo.97@gmail.com"
msg["To"] = "YOUR_EMAIL@gmail.com"

try:
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.login("edidavo.97@gmail.com", "mllgwsrapugjhszu")
    server.send_message(msg)
    server.quit()
    print("✅ Email sent successfully.")
except Exception as e:
    print(f"❌ Error: {e}")
