# BedRock App - Quick Reference

## 📱 App Structure at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    BedRock App                           │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
   │  (auth)  │    │ (password│    │ (sharing)│
   │          │    │-mgmt)    │    │          │
   └──────────┘    └──────────┘    └──────────┘
        │                │                │
        │                │                │
   ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
   │(security)│    │  (tabs)  │    │   root   │
   │          │    │          │    │          │
   └──────────┘    └──────────┘    └──────────┘
```

## 🗂️ Directory Map

### Authentication (`app/(auth)/`)
```
(auth)/
├── 🔐 login.tsx
├── ✍️  signup.tsx
├── 🔑 create-master-password.tsx
├── 🔓 enter-master-password.tsx
├── 🔄 forgot-password-reset.tsx
└── ✉️  forgot-password-verify.tsx
```
**Purpose:** User authentication and account management

---

### Password Management (`app/(password-management)/`)
```
(password-management)/
├── ➕ add-password.tsx
├── ✏️  edit-password-details.tsx
├── 👁️  view-password-details.tsx
├── ⚠️  weak-passwords-list.tsx
├── 📋 duplicate-passwords-list.tsx
├── 🚨 leaked-passwords-list.tsx
└── ✅ safe-passwords-list.tsx
```
**Purpose:** CRUD operations for passwords

---

### Sharing (`app/(sharing)/`)
```
(sharing)/
├── 🔗 share-password.tsx
├── 👥 manage-sharing.tsx
└── 📤 shared-passwords-list.tsx
```
**Purpose:** Secure password sharing with other users

---

### Security (`app/(security)/`)
```
(security)/
├── 📧 email-verification.tsx
└── 🔐 create-authentication-key.tsx
```
**Purpose:** Additional security features and verification

---

### Main Tabs (`app/(tabs)/`)
```
(tabs)/
├── 🏠 home.tsx         (Dashboard)
├── 🔒 vault.tsx        (All passwords)
├── 🎲 generator.tsx    (Password generator)
└── 📊 analytics.tsx    (Security insights)
```
**Purpose:** Core app functionality

---

### Root Level (`app/`)
```
app/
├── 👋 welcome.tsx      (Landing page)
├── ⚙️  settings.tsx     (App settings)
└── 🎯 index.tsx        (Entry point)
```

---

## 🛣️ Route Cheat Sheet

### Quick Navigation Examples

```typescript
// 🔐 Authentication
router.push('/(auth)/login')
router.push('/(auth)/signup')
router.push('/(auth)/create-master-password')

// 🔒 Password Management
router.push('/(password-management)/add-password')
router.push(`/(password-management)/view-password-details?id=${id}`)
router.push(`/(password-management)/edit-password-details?id=${id}`)

// 👥 Sharing
router.push(`/(sharing)/share-password?id=${id}`)
router.push('/(sharing)/shared-passwords-list')

// 🏠 Main Tabs
router.push('/(tabs)/home')
router.push('/(tabs)/vault')
router.push('/(tabs)/generator')
router.push('/(tabs)/analytics')

// 🎯 Other
router.push('/welcome')
router.push('/settings')
```

---

## 🔗 Common User Flows

### New User Signup
```
/welcome
   ↓ (tap "Register")
/(auth)/signup
   ↓ (enter email)
/(auth)/create-master-password
   ↓ (create password)
/(auth)/login
   ↓ (enter email)
/(auth)/enter-master-password
   ↓ (unlock vault)
/(tabs)/home
```

### Existing User Login
```
/welcome
   ↓ (tap "Login")
/(auth)/login
   ↓ (enter email)
/(auth)/enter-master-password
   ↓ (unlock vault)
/(tabs)/home
```

### Add New Password
```
/(tabs)/vault
   ↓ (tap FAB/+)
/(password-management)/add-password
   ↓ (fill form & save)
/(tabs)/vault (updated)
```

### Share Password
```
/(tabs)/vault
   ↓ (tap password)
/(password-management)/view-password-details
   ↓ (tap "Share")
/(sharing)/share-password
   ↓ (select user & permission)
Success → back to details
```

### Manage Sharing
```
/(tabs)/vault
   ↓ (tap password)
/(password-management)/view-password-details
   ↓ (tap "Manage Sharing")
/(sharing)/manage-sharing
   ↓ (view/revoke access)
```

---

## 📦 File Organization Rules

### Naming Conventions
- ✅ Use kebab-case: `view-password-details.tsx`
- ✅ Be descriptive: `create-master-password.tsx` not `create-pw.tsx`
- ✅ Use singular: `password` not `passwords` (in filenames)

### Import Rules
```typescript
// From subdirectory (auth, password-management, sharing, security)
import { api } from '../../utils/api'
import { crypto } from '../../utils/crypto'

// From root level or tabs
import { api } from '../utils/api'
import { crypto } from '../utils/crypto'

// Using alias (anywhere)
import { api } from '@/utils/api'
import { crypto } from '@/utils/crypto'
```

### Route Groups
- Use parentheses `()` for groups that don't affect URL
- Groups are for organization only
- `/(auth)/login` → URL is just `/login` (if exposed)

---

## 🎯 Feature → Location Mapping

| Want to... | Go to... |
|------------|----------|
| Add login screen | `app/(auth)/` |
| Create password feature | `app/(password-management)/` |
| Add sharing option | `app/(sharing)/` |
| Add 2FA/security | `app/(security)/` |
| Modify main tabs | `app/(tabs)/` |
| Change welcome screen | `app/welcome.tsx` |
| Add settings option | `app/settings.tsx` |

---

## 🚀 Quick Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start --clear

# Check file structure
tree app/ -L 2

# Find all routes
find app -name "*.tsx" | grep -v "__tests__"
```

---

## 📚 Documentation

- **Full Migration Guide:** `APP_STRUCTURE_GUIDE.md`
- **Architecture Overview:** `ARCHITECTURE_OVERVIEW.md`
- **Backend Setup:** `scripts/run_backend_vm.sh`

---

**Quick Tip:** Use VS Code's file search (Ctrl+P / Cmd+P) and type the feature name to quickly find related files!

---

Generated: November 19, 2025  
BedRock App v2.0
