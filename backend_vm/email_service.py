import os
import random
import string
from datetime import datetime, timedelta
from typing import Dict, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from dotenv import load_dotenv

load_dotenv()

verification_codes: Dict[str, Dict[str, any]] = {}

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USER)
SENDER_NAME = os.getenv("SENDER_NAME", "BedRock Password Manager")

CODE_LENGTH = 6
CODE_EXPIRY_MINUTES = 10


def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=CODE_LENGTH))


def store_verification_code(email: str, code: str) -> None:
    expiry = datetime.now() + timedelta(minutes=CODE_EXPIRY_MINUTES)
    verification_codes[email] = {
        'code': code,
        'expiry': expiry,
        'attempts': 0
    }
    print(f"📧 Stored verification code for {email}: {code} (expires in {CODE_EXPIRY_MINUTES} min)")


def verify_code(email: str, code: str) -> bool:
    if email not in verification_codes:
        print(f"No verification code found for {email}")
        return False
    
    stored_data = verification_codes[email]
    
    if datetime.now() > stored_data['expiry']:
        print(f"Verification code expired for {email}")
        del verification_codes[email]
        return False
    
    if stored_data['attempts'] >= 5:
        print(f"Too many verification attempts for {email}")
        del verification_codes[email]
        return False
    
    stored_data['attempts'] += 1
    
    if stored_data['code'] == code:
        print(f"✓ Verification code verified for {email}")
        del verification_codes[email]
        return True
    else:
        print(f"Invalid verification code for {email} (attempt {stored_data['attempts']}/5)")
        return False


async def send_verification_email(email: str, code: str) -> bool:
    """Send verification code email."""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Your BedRock Verification Code: {code}"
        message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message["To"] = email
        text_content = f"""
Hello,

Your BedRock verification code is: {code}

This code will expire in {CODE_EXPIRY_MINUTES} minutes.

If you didn't request this code, please ignore this email.

Best regards,
BedRock Team
        """
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #6B72FF;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }}
        .code {{
            background-color: #6B72FF;
            color: white;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BedRock Password Manager</h1>
        </div>
        <div class="content">
            <h2>Email Verification</h2>
            <p>Hello,</p>
            <p>Your verification code is:</p>
            <div class="code">{code}</div>
            <p>This code will expire in <strong>{CODE_EXPIRY_MINUTES} minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>BedRock Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        """
        
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)
        
        if not SMTP_USER or not SMTP_PASSWORD:
            print(f"⚠️  SMTP not configured. Verification code for {email}: {code}")
            print(f"   Add SMTP_USER and SMTP_PASSWORD to .env file to enable email sending")
            store_verification_code(email, code)
            return True
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        
        store_verification_code(email, code)
        print(f"Verification email sent to {email}")
        return True
        
    except Exception as e:
        print(f"Failed to send verification email to {email}: {e}")
        store_verification_code(email, code)
        return False


async def send_verification_code(email: str) -> str:
    code = generate_verification_code()
    await send_verification_email(email, code)
    return code


async def resend_verification_code(email: str) -> Optional[str]:
    if email in verification_codes:
        del verification_codes[email]
    
    code = generate_verification_code()
    await send_verification_email(email, code)
    return code
