# App Structure Reorganization Guide

## 📁 New Directory Structure

The app has been reorganized into logical feature-based directories to improve code organization and maintainability.

### Before
```
app/
├── login.tsx
├── signup.tsx
├── create-master-password.tsx
├── enter-master-password.tsx
├── forgot-password-reset.tsx
├── forgot-password-verify.tsx
├── add-password.tsx
├── edit-password-details.tsx
├── view-password-details.tsx
├── weak-passwords-list.tsx
├── duplicate-passwords-list.tsx
├── leaked-passwords-list.tsx
├── safe-passwords-list.tsx
├── share-password.tsx
├── manage-sharing.tsx
├── shared-passwords-list.tsx
├── email-verification.tsx
├── create-authentication-key.tsx
├── welcome.tsx
├── settings.tsx
├── index.tsx
└── (tabs)/
    ├── home.tsx
    ├── vault.tsx
    ├── generator.tsx
    └── analytics.tsx
```

### After
```
app/
├── (auth)/                          # Authentication & account management
│   ├── login.tsx
│   ├── signup.tsx
│   ├── create-master-password.tsx
│   ├── enter-master-password.tsx
│   ├── forgot-password-reset.tsx
│   └── forgot-password-verify.tsx
│
├── (password-management)/           # Password CRUD operations
│   ├── add-password.tsx
│   ├── edit-password-details.tsx
│   ├── view-password-details.tsx
│   ├── weak-passwords-list.tsx
│   ├── duplicate-passwords-list.tsx
│   ├── leaked-passwords-list.tsx
│   └── safe-passwords-list.tsx
│
├── (sharing)/                       # Password sharing features
│   ├── share-password.tsx
│   ├── manage-sharing.tsx
│   └── shared-passwords-list.tsx
│
├── (security)/                      # Security & verification
│   ├── email-verification.tsx
│   └── create-authentication-key.tsx
│
├── (tabs)/                          # Main app tabs
│   ├── home.tsx
│   ├── vault.tsx
│   ├── generator.tsx
│   └── analytics.tsx
│
├── welcome.tsx                      # Onboarding/landing
├── settings.tsx                     # App settings
└── index.tsx                        # Root redirect
```

## 🎯 Feature Groups

### 1. **(auth)** - Authentication
**Purpose:** User authentication and account access
- `login.tsx` - Email input for login
- `signup.tsx` - Account creation (email input)
- `create-master-password.tsx` - Set master password during signup
- `enter-master-password.tsx` - Enter master password for login
- `forgot-password-reset.tsx` - Password reset flow
- `forgot-password-verify.tsx` - Verify password reset

**Routes:**
- `/(auth)/login`
- `/(auth)/signup`
- `/(auth)/create-master-password`
- `/(auth)/enter-master-password`
- `/(auth)/forgot-password-reset`
- `/(auth)/forgot-password-verify`

---

### 2. **(password-management)** - Password Operations
**Purpose:** Create, read, update, delete passwords
- `add-password.tsx` - Create new password entry
- `edit-password-details.tsx` - Modify existing password
- `view-password-details.tsx` - View password details
- `weak-passwords-list.tsx` - List of weak passwords (security analysis)
- `duplicate-passwords-list.tsx` - List of duplicate passwords
- `leaked-passwords-list.tsx` - List of potentially leaked passwords
- `safe-passwords-list.tsx` - List of strong/safe passwords

**Routes:**
- `/(password-management)/add-password`
- `/(password-management)/edit-password-details?id=X`
- `/(password-management)/view-password-details?id=X`
- `/(password-management)/weak-passwords-list`
- `/(password-management)/duplicate-passwords-list`
- `/(password-management)/leaked-passwords-list`
- `/(password-management)/safe-passwords-list`

---

### 3. **(sharing)** - Sharing Features
**Purpose:** Share passwords securely with other users
- `share-password.tsx` - Share a password with another user
- `manage-sharing.tsx` - Manage who has access to a password
- `shared-passwords-list.tsx` - View incoming/outgoing shares

**Routes:**
- `/(sharing)/share-password?id=X`
- `/(sharing)/manage-sharing?id=X&shareId=Y&type=incoming|outgoing`
- `/(sharing)/shared-passwords-list`

---

### 4. **(security)** - Security & Verification
**Purpose:** Additional security features
- `email-verification.tsx` - Verify email address
- `create-authentication-key.tsx` - Generate authentication keys

**Routes:**
- `/(security)/email-verification`
- `/(security)/create-authentication-key`

---

### 5. **(tabs)** - Main Application
**Purpose:** Core app functionality
- `home.tsx` - Dashboard/home screen
- `vault.tsx` - Password vault (list all passwords)
- `generator.tsx` - Password generator
- `analytics.tsx` - Security analytics & insights

**Routes:**
- `/(tabs)/home`
- `/(tabs)/vault`
- `/(tabs)/generator`
- `/(tabs)/analytics`

---

## 🔄 Route Migration Guide

### Updated Routes

| Old Route | New Route | File Location |
|-----------|-----------|---------------|
| `/login` | `/(auth)/login` | `app/(auth)/login.tsx` |
| `/signup` | `/(auth)/signup` | `app/(auth)/signup.tsx` |
| `/create-master-password` | `/(auth)/create-master-password` | `app/(auth)/create-master-password.tsx` |
| `/enter-master-password` | `/(auth)/enter-master-password` | `app/(auth)/enter-master-password.tsx` |
| `/add-password` | `/(password-management)/add-password` | `app/(password-management)/add-password.tsx` |
| `/edit-password-details` | `/(password-management)/edit-password-details` | `app/(password-management)/edit-password-details.tsx` |
| `/view-password-details` | `/(password-management)/view-password-details` | `app/(password-management)/view-password-details.tsx` |
| `/share-password` | `/(sharing)/share-password` | `app/(sharing)/share-password.tsx` |
| `/manage-sharing` | `/(sharing)/manage-sharing` | `app/(sharing)/manage-sharing.tsx` |
| `/shared-passwords-list` | `/(sharing)/shared-passwords-list` | `app/(sharing)/shared-passwords-list.tsx` |

### Files Updated

The following files have been updated with new route paths:

**Navigation:**
- ✅ `app/welcome.tsx` - Login/Signup buttons
- ✅ `app/(auth)/login.tsx` - Navigation to enter-master-password
- ✅ `app/(auth)/signup.tsx` - Navigation to create-master-password
- ✅ `app/(auth)/create-master-password.tsx` - Redirect to login after signup
- ✅ `app/(tabs)/generator.tsx` - Add password button
- ✅ `app/(tabs)/vault.tsx` - View password details, add password
- ✅ `app/(tabs)/_layout.tsx` - FAB button
- ✅ `components/recently-added.tsx` - View/Edit password navigation
- ✅ `app/(password-management)/view-password-details.tsx` - Share button
- ✅ `app/(sharing)/manage-sharing.tsx` - Share button
- ✅ `app/(sharing)/shared-passwords-list.tsx` - View shared passwords

**Import Paths:**
All files in subdirectories now use relative imports:
- ✅ `app/(auth)/*` - Import from `../../utils/api`
- ✅ `app/(password-management)/*` - Import from `../../utils/api`
- ✅ `app/(sharing)/*` - Import from `../../utils/api`
- ✅ `app/(security)/*` - Import from `../../utils/api`

---

## 🎨 Benefits of New Structure

### 1. **Better Organization**
- Related features grouped together
- Easy to find specific functionality
- Clear separation of concerns

### 2. **Improved Maintainability**
- Easier to understand codebase structure
- Simpler to onboard new developers
- Reduced cognitive load when navigating

### 3. **Scalability**
- Easy to add new features to existing groups
- Can create new groups as app grows
- Modular architecture

### 4. **Route Grouping**
- Expo Router's parentheses `()` syntax creates route groups
- Groups don't affect URL structure
- Provides logical organization without nesting URLs

---

## 🚀 Using the New Structure

### Navigating to Auth Screens
```typescript
import { router } from 'expo-router';

// Login
router.push('/(auth)/login');

// Signup
router.push('/(auth)/signup');

// After signup
router.replace('/(auth)/login');
```

### Navigating to Password Management
```typescript
// Add password
router.push('/(password-management)/add-password');

// View password
router.push(`/(password-management)/view-password-details?id=${passwordId}`);

// Edit password
router.push(`/(password-management)/edit-password-details?id=${passwordId}`);
```

### Navigating to Sharing Features
```typescript
// Share password
router.push(`/(sharing)/share-password?id=${passwordId}`);

// Manage sharing
router.push(`/(sharing)/manage-sharing?id=${passwordId}`);

// View shared passwords
router.push('/(sharing)/shared-passwords-list');
```

---

## 📝 Development Guidelines

### Adding New Features

**For Authentication:**
```
Create file: app/(auth)/new-auth-feature.tsx
Route: /(auth)/new-auth-feature
```

**For Password Management:**
```
Create file: app/(password-management)/new-feature.tsx
Route: /(password-management)/new-feature
```

**For Sharing:**
```
Create file: app/(sharing)/new-sharing-feature.tsx
Route: /(sharing)/new-sharing-feature
```

### Import Guidelines

When creating files in subdirectories:
```typescript
// ❌ Wrong
import { api } from '../utils/api';

// ✅ Correct (from subdirectories)
import { api } from '../../utils/api';

// ✅ Correct (using alias)
import { api } from '@/utils/api';
```

---

## 🔧 Next Steps

### Optional Improvements

1. **Create `_layout.tsx` files** in each group for shared layouts
2. **Add middleware** for route protection (auth required)
3. **Implement breadcrumbs** to show current location
4. **Add analytics** to track feature usage
5. **Create index files** to re-export common components

### Example Group Layout
```typescript
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      {/* ... */}
    </Stack>
  );
}
```

---

## 🐛 Troubleshooting

### Type Errors with Routes
If you see TypeScript errors about route types:
```typescript
// Use 'as any' for now (Expo Router type generation needed)
router.push('/(auth)/login' as any);

// Or regenerate types
npx expo customize tsconfig.json
```

### Import Errors
If imports fail:
1. Check relative path depth (`../../` vs `../`)
2. Use absolute imports with `@/` alias
3. Verify file exists in new location

### Route Not Found
1. Ensure file is in correct directory
2. Check file naming (no typos)
3. Restart Metro bundler: `npx expo start --clear`

---

## 📚 Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [File-based Routing](https://docs.expo.dev/router/create-pages/)
- [Route Groups](https://docs.expo.dev/router/advanced/groups/)

---

**Migration Date:** November 19, 2025  
**Version:** 2.0  
**Status:** ✅ Complete
