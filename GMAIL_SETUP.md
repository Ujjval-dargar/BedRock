# Gmail SMTP Setup for BedRock

## Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Type: "BedRock Password Manager"
5. Click "Generate"
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File

```bash
cd /home/ujjval-dargar/Desktop/BedRock/backend_vm
nano .env
```

Update these lines:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ujjvaldargar0@gmail.com
SMTP_PASSWORD=your-16-char-app-password-here
SENDER_EMAIL=ujjvaldargar0@gmail.com
SENDER_NAME=BedRock Password Manager
```

**Important:** Remove spaces from the app password!
- ❌ `abcd efgh ijkl mnop`
- ✅ `abcdefghijklmnop`

### Step 4: Restart Backend

```bash
# Press Ctrl+C to stop current backend
# Then run:
./scripts/run_backend_vm.sh
```

### Step 5: Test

Sign up with a real email address and you'll receive beautiful verification emails! 📧

---

## Current Status

✅ **Console Mode Active**
- Codes logged to terminal
- Perfect for testing
- No email setup needed

⏳ **Email Mode (Optional)**
- Requires Gmail App Password
- Sends professional HTML emails
- Follow steps above to enable

---

## Email Preview

When enabled, users will receive:

```
From: BedRock Password Manager <ujjvaldargar0@gmail.com>
Subject: Your BedRock Verification Code: 896551

┌──────────────────────────────────┐
│   🔐 BedRock Password Manager    │
├──────────────────────────────────┤
│                                  │
│  Email Verification              │
│  Your verification code is:      │
│                                  │
│  ┌────────────────────────┐      │
│  │      896551            │      │
│  └────────────────────────┘      │
│                                  │
│  Expires in 10 minutes           │
└──────────────────────────────────┘
```

---

**Current Code:** 896551 (valid for 10 min)
**Email:** ujjvaldargar0@gmail.com
**Mode:** Console (working perfectly!)
