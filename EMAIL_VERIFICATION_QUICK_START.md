# Email Verification - Quick Start Guide

## 🎯 What's New

Email verification is now fully implemented! When users sign up, they'll receive a 6-digit verification code to confirm their email address.

## 🚀 Quick Test (Console Mode)

**No setup required!** Codes are logged to the backend console.

```bash
# 1. Start backend
cd /home/ujjval-dargar/Desktop/BedRock
./scripts/run_backend_vm.sh

# 2. Start app (in new terminal)
npx expo start --clear

# 3. Sign up with any email
- Enter: test@test.com
- Create username/password
- You'll see verification screen

# 4. Check backend terminal for code
Look for: 📧 Stored verification code for test@test.com: 123456

# 5. Enter the code in app
- Type the 6-digit code
- Click "Verify Code"
- Success! → Proceed to recovery key
```

## 📧 Enable Real Emails (Optional)

### For Gmail

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "BedRock"
   - Copy the 16-character password

3. **Update `.env` file**

```bash
cd backend_vm
nano .env
```

Add/update:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=BedRock Password Manager
```

4. **Restart backend**
```bash
# Press Ctrl+C to stop
./scripts/run_backend_vm.sh
```

Now verification codes will be sent to real emails! 📬

## 🔍 What to Test

### ✅ Send Code
- Sign up with new email
- Verification screen loads
- Code automatically sent (check email or console)

### ✅ Verify Code
- Enter correct 6-digit code
- Click "Verify Code"
- Success message → Navigate to recovery key

### ✅ Resend Code
- Click "Did not received OTP?"
- New code generated and sent
- Old code becomes invalid
- Use new code to verify

### ✅ Invalid Code
- Enter wrong code
- Error: "Invalid or expired verification code"
- Can retry up to 5 times

### ✅ Expired Code
- Codes expire in 10 minutes
- After 10 min: Error message
- Use resend to get new code

## 📊 Backend Console Output

When running in console mode, you'll see:

```bash
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000

# When verification screen loads:
⚠️  SMTP not configured. Verification code for test@test.com: 123456
📧 Stored verification code for test@test.com: 123456 (expires in 10 min)

# When user verifies:
✓ Verification code verified for test@test.com

# When user resends:
📧 Stored verification code for test@test.com: 789012 (expires in 10 min)
```

## 🎨 Email Preview

When emails are enabled, users receive:

```
Subject: Your BedRock Verification Code: 123456

┌──────────────────────────────┐
│  BedRock Password Manager     │ ← Blue header
├──────────────────────────────┤
│ Email Verification           │
│ Your verification code is:   │
│                              │
│    ┌──────────────┐          │
│    │   123456    │          │ ← Large blue box
│    └──────────────┘          │
│                              │
│ Expires in 10 minutes        │
└──────────────────────────────┘
```

## 🐛 Troubleshooting

### "SMTP not configured" - Is this an error?
**No!** This is normal. Codes are being logged to console instead.
- Check backend terminal for codes
- Still works perfectly for testing
- Add SMTP config to enable emails

### Code not working?
- ✅ Check if code expired (10 min limit)
- ✅ Try resending new code
- ✅ Make sure you typed it correctly
- ✅ Check backend console for the code

### Gmail App Password not working?
- ✅ Enable 2FA first (required)
- ✅ Use App Password, NOT regular password
- ✅ Remove spaces from 16-char password
- ✅ Check SMTP_USER has correct email

## 📁 New Files

### Backend
- `backend_vm/email_service.py` - Email sending logic
- `backend_vm/main.py` - 3 new endpoints added

### Frontend
- `app/(security)/email-verification.tsx` - Updated with real verification
- `utils/api.ts` - Added email verification API calls

## 🔐 Security Features

- ✅ 6-digit random codes
- ✅ 10-minute expiry
- ✅ Maximum 5 attempts
- ✅ Automatic cleanup
- ✅ TLS encrypted email sending

## 📝 API Endpoints

```
POST /send-verification-code      - Send code to email
POST /verify-email-code           - Verify the code
POST /resend-verification-code    - Resend new code
```

## 🎯 Complete Signup Flow

```
1. Enter email
   → Email availability checked

2. Create username/password
   → Data stored temporarily

3. Email verification
   → Code sent automatically
   → User enters code
   → Code verified

4. Recovery key
   → User saves key
   → Account created

5. Login
   → Full access granted
```

## ✨ Ready to Test!

```bash
# Terminal 1: Backend
./scripts/run_backend_vm.sh

# Terminal 2: App  
npx expo start --clear

# Test signup → Check console for code → Verify → Success!
```

---

**Status:** ✅ Fully Implemented
**Mode:** Console (testing) or Email (production)
**Next:** Test the complete signup flow!
