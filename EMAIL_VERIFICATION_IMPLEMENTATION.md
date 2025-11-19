# Email Verification Implementation

## Overview

Implemented complete email verification system for BedRock signup flow with:
- ✅ Send verification codes via email (or console if SMTP not configured)
- ✅ Verify codes with expiry and attempt limits
- ✅ Resend codes functionality
- ✅ Frontend integration with real-time feedback

## Architecture

### Backend Components

#### 1. Email Service (`email_service.py`)

**Features:**
- Generate 6-digit verification codes
- Send verification emails (HTML + plain text)
- In-memory code storage with expiry (10 minutes)
- Maximum 5 verification attempts
- Automatic code cleanup after verification or expiry

**Functions:**
```python
generate_verification_code() -> str
  # Returns 6-digit random code

store_verification_code(email, code) -> None
  # Stores code with 10-minute expiry

verify_code(email, code) -> bool
  # Verifies code, handles attempts and expiry

send_verification_email(email, code) -> bool
  # Sends HTML email or logs to console

send_verification_code(email) -> str
  # Generate + send code

resend_verification_code(email) -> str
  # Delete old code + generate new one
```

**Email Template:**
- Professional HTML design
- BedRock branding (#6B72FF color)
- Large, clear code display
- Expiry time notification
- Plain text fallback

**Configuration (optional):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=BedRock Password Manager
```

**Fallback Mode:**
If SMTP not configured:
- Code printed to console
- Code still stored and validated
- Allows testing without email setup

#### 2. API Endpoints (`main.py`)

**POST /send-verification-code**
- Request: `{ "email": "user@example.com" }`
- Response: `{ "success": true, "message": "...", "email": "..." }`
- Action: Generates and sends 6-digit code

**POST /verify-email-code**
- Request: `{ "email": "user@example.com", "code": "123456" }`
- Response: `{ "success": true, "verified": true }`
- Action: Validates code, checks expiry and attempts
- Error: HTTP 400 if invalid/expired

**POST /resend-verification-code**
- Request: `{ "email": "user@example.com" }`
- Response: `{ "success": true, "message": "...", "email": "..." }`
- Action: Deletes old code, sends new one

### Frontend Components

#### 1. API Functions (`utils/api.ts`)

```typescript
authAPI.sendVerificationCode(email)
  // Sends verification code to email

authAPI.verifyEmailCode(email, code)
  // Verifies the code

authAPI.resendVerificationCode(email)
  // Resends a new code
```

#### 2. Email Verification Screen (`email-verification.tsx`)

**Auto-send on Load:**
- Loads email from AsyncStorage
- Automatically sends verification code
- Shows notice if email sending fails

**User Actions:**
1. Enter 6-digit code
2. Click "Verify Code"
3. Or click "Did not received OTP?" to resend

**Validation:**
- Code must be 6 digits
- Clear error messages
- Success confirmation before proceeding

**Flow:**
```
Screen loads
  ↓
Load email from AsyncStorage
  ↓
Auto-send verification code
  ↓
User enters code
  ↓
Verify with backend
  ↓
If valid → Navigate to recovery key
If invalid → Show error, allow retry
```

## Setup Instructions

### Option 1: Console Mode (Testing)

No setup required! Verification codes will be logged to backend console.

```bash
# Start backend
./scripts/run_backend_vm.sh

# Check console for codes when testing
# Example output:
⚠️  SMTP not configured. Verification code for user@test.com: 123456
```

### Option 2: Email Mode (Production)

**For Gmail:**

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" (name it "BedRock")
   - Copy the 16-character password

3. Update `backend_vm/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=BedRock Password Manager
```

4. Restart backend:
```bash
cd backend_vm
source .venv/bin/activate
uvicorn main:app --reload
```

**For Other Email Providers:**

| Provider | SMTP Host | Port |
|----------|-----------|------|
| Gmail | smtp.gmail.com | 587 |
| Outlook | smtp-mail.outlook.com | 587 |
| Yahoo | smtp.mail.yahoo.com | 587 |
| SendGrid | smtp.sendgrid.net | 587 |

Update `.env` with your provider's settings.

## Testing

### Test Flow 1: Console Mode

```bash
# 1. Start backend
./scripts/run_backend_vm.sh

# 2. Start app
npx expo start --clear

# 3. Sign up with new email
- Enter email: test@example.com
- Create username/password
- Reach verification screen

# 4. Check backend console for code
📧 Stored verification code for test@example.com: 123456 (expires in 10 min)

# 5. Enter code in app
- Type: 123456
- Click "Verify Code"
- Should proceed to recovery key ✓
```

### Test Flow 2: Email Mode

```bash
# 1. Configure SMTP in .env
# 2. Restart backend
# 3. Sign up with real email
# 4. Check email inbox
# 5. Enter code from email
# 6. Verify and proceed ✓
```

### Test Resend Functionality

```bash
# 1. Reach verification screen
# 2. Click "Did not received OTP?"
# 3. New code generated and sent
# 4. Old code becomes invalid
# 5. Use new code to verify ✓
```

### Test Error Cases

**Expired Code:**
```bash
# 1. Send code
# 2. Wait 11+ minutes
# 3. Try to verify
# Result: "Invalid or expired verification code" ✓
```

**Invalid Code:**
```bash
# 1. Send code: 123456
# 2. Enter wrong code: 999999
# Result: "Invalid or expired verification code" ✓
# Attempts: 1/5
```

**Too Many Attempts:**
```bash
# 1. Enter wrong code 5 times
# Result: Code deleted, must resend ✓
```

## Security Features

### Code Generation
- ✅ 6-digit random numbers
- ✅ Cryptographically secure randomness
- ✅ No predictable patterns

### Storage
- ✅ In-memory (fast, no database overhead)
- ✅ Automatic expiry (10 minutes)
- ✅ Deleted after successful verification
- ✅ Deleted after 5 failed attempts

### Validation
- ✅ Email-code pair verification
- ✅ Expiry time check
- ✅ Attempt limit (5 max)
- ✅ Case-sensitive code matching

### Email Security
- ✅ TLS encryption (STARTTLS)
- ✅ No plain-text password storage
- ✅ App-specific passwords recommended
- ✅ Professional email template

## Code Storage

Currently using in-memory dictionary:
```python
verification_codes = {
    "user@example.com": {
        "code": "123456",
        "expiry": datetime(2025, 11, 19, 12, 30),
        "attempts": 0
    }
}
```

**Pros:**
- ✅ Fast
- ✅ No database overhead
- ✅ Automatic cleanup

**Cons:**
- ❌ Lost on server restart
- ❌ Not suitable for multi-server deployment

**Future Enhancement (Optional):**
Use Redis for production:
```python
# Store in Redis with TTL
redis.setex(f"verify:{email}", 600, code)  # 10 min TTL
```

## Email Template Example

**HTML Email:**
```html
┌─────────────────────────────────┐
│   BedRock Password Manager      │  ← Header (blue bg)
├─────────────────────────────────┤
│                                 │
│  Email Verification             │
│  Hello,                         │
│  Your verification code is:     │
│                                 │
│  ┌───────────────────────┐      │
│  │      1 2 3 4 5 6      │      │  ← Big code (blue)
│  └───────────────────────┘      │
│                                 │
│  This code will expire in       │
│  10 minutes.                    │
│                                 │
│  If you didn't request this,    │
│  please ignore this email.      │
│                                 │
│  Best regards,                  │
│  BedRock Team                   │
└─────────────────────────────────┘
  This is an automated email.
```

## API Documentation

### Send Verification Code

**Endpoint:** `POST /send-verification-code`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification code sent to email",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "detail": "Failed to send verification code"
}
```

### Verify Email Code

**Endpoint:** `POST /verify-email-code`

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "verified": true
}
```

**Response (Error):**
```json
{
  "detail": "Invalid or expired verification code"
}
```

### Resend Verification Code

**Endpoint:** `POST /resend-verification-code`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification code resent to email",
  "email": "user@example.com"
}
```

## Files Created/Modified

### Backend
- ✅ `backend_vm/email_service.py` (new) - Email verification logic
- ✅ `backend_vm/main.py` - Added 3 endpoints
- ✅ `backend_vm/requirements.txt` - Added aiosmtplib, email-validator
- ✅ `backend_vm/.env` - Added SMTP configuration

### Frontend
- ✅ `utils/api.ts` - Added 3 API functions
- ✅ `app/(security)/email-verification.tsx` - Integrated real verification

## Troubleshooting

### Issue: "SMTP not configured"
**Solution:** This is normal! Codes are logged to console for testing.
To enable email: Add SMTP credentials to `.env`

### Issue: Gmail "Less secure apps" error
**Solution:** Use App Password, not your regular password
- Enable 2FA first
- Generate App Password at myaccount.google.com/apppasswords

### Issue: Codes not being sent
**Solution:** Check backend console
- Look for errors in server logs
- Verify SMTP_USER and SMTP_PASSWORD in .env
- Try console mode first

### Issue: "Invalid or expired code"
**Solution:** 
- Codes expire in 10 minutes
- After 5 failed attempts, must resend
- Case-sensitive (use exact code)

## Future Enhancements

### Short Term
- [ ] Store codes in database (currently in-memory)
- [ ] Add rate limiting for code requests
- [ ] Email template customization
- [ ] Multi-language support

### Long Term
- [ ] SMS verification as alternative
- [ ] Redis for distributed systems
- [ ] Email verification history
- [ ] Configurable expiry times
- [ ] Custom email branding

## Summary

✅ **Complete email verification system implemented**
✅ **Auto-send code on screen load**
✅ **Verify code with expiry and attempt limits**
✅ **Resend functionality**
✅ **Works in console mode (testing) or email mode (production)**
✅ **Professional HTML email template**
✅ **Security features: expiry, attempts, TLS**

**Status:** Ready for testing!
**Mode:** Console (codes logged to terminal)
**To enable emails:** Add SMTP credentials to `.env`

---

**Implemented:** November 19, 2025
**Backend:** 3 new endpoints, email service module
**Frontend:** Integrated verification screen
**Testing:** Console mode active, email mode ready
