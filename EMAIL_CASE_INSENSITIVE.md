# Email Case-Insensitive Implementation

## Overview
All email addresses in BedRock are now case-insensitive and stored in lowercase in the database. This ensures consistent behavior regardless of how users type their email addresses.

## Changes Made

### Backend Changes (`backend_vm/main.py`)

All endpoints that accept email addresses now convert them to lowercase before processing:

#### 1. **Email Verification Endpoints**
- `POST /check-email` - Converts email to lowercase before checking existence
- `POST /send-verification-code` - Normalizes email before sending OTP
- `POST /verify-email-code` - Converts email to lowercase for verification
- `POST /resend-verification-code` - Normalizes email before resending

#### 2. **Authentication Endpoints**
- `POST /signup` - Stores email in lowercase in database
- `POST /login` - Converts email to lowercase for lookup

#### 3. **Recovery & Password Reset**
- `POST /verify-recovery-key` - Normalizes email for recovery key verification
- `POST /reset-password` - Converts email to lowercase for password reset

#### 4. **Biometric Authentication**
- `POST /biometric/check` - Normalizes email before checking biometric status
- `POST /biometric/login` - Converts email to lowercase for biometric login

#### 5. **User Profile Updates**
- `PATCH /me` - When updating email, stores new email in lowercase

### Frontend Changes (`utils/api.ts`)

All API calls that send email addresses now convert them to lowercase before sending:

#### 1. **Authentication APIs**
```typescript
checkEmail(email) → email.toLowerCase()
signup(email) → email.toLowerCase()
login(email) → email.toLowerCase() + stores in AsyncStorage as lowercase
```

#### 2. **Email Verification APIs**
```typescript
sendVerificationCode(email) → email.toLowerCase()
verifyEmailCode(email) → email.toLowerCase()
resendVerificationCode(email) → email.toLowerCase()
```

#### 3. **Biometric APIs**
```typescript
checkBiometricStatus(email) → email.toLowerCase()
biometricLogin(email) → email.toLowerCase() + stores in AsyncStorage as lowercase
getBiometricMasterPassword(email) → email.toLowerCase()
verifyMasterPassword(email) → email.toLowerCase()
```

#### 4. **Recovery & Reset APIs**
```typescript
verifyRecoveryKey(email) → email.toLowerCase()
resetPassword(email) → email.toLowerCase()
```

## Benefits

### 1. **Consistent User Experience**
Users can log in with any case combination:
- `john@example.com`
- `John@Example.com`
- `JOHN@EXAMPLE.COM`

All will match the same account.

### 2. **Prevents Duplicate Accounts**
Before: Users could accidentally create multiple accounts with same email in different cases
After: System recognizes them as the same email

### 3. **Database Consistency**
All emails stored in database are in lowercase format, making queries simpler and more reliable.

### 4. **AsyncStorage Consistency**
Email stored in AsyncStorage is always lowercase, ensuring consistent retrieval.

## Examples

### Signup Flow
```typescript
// User types: "John@Example.COM"
// Frontend sends: "john@example.com"
// Database stores: "john@example.com"
```

### Login Flow
```typescript
// User types: "JOHN@EXAMPLE.COM"
// Frontend sends: "john@example.com"
// Database query: WHERE email = "john@example.com"
// ✅ Match found!
```

### Biometric Login
```typescript
// AsyncStorage has: "john@example.com"
// User types: "John@Example.com"
// Frontend normalizes: "john@example.com"
// Backend query matches: "john@example.com"
// ✅ Biometric enabled check succeeds
```

## Technical Implementation

### Backend Pattern
```python
# All endpoints follow this pattern:
@app.post("/endpoint")
async def endpoint(data: EmailCheckIn, db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_email(db, data.email.lower())
    # ... rest of logic
```

### Frontend Pattern
```typescript
// All API calls follow this pattern:
async apiCall(email: string) {
    return await fetchAPI('/endpoint', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase() }),
    });
}
```

### Storage Pattern
```typescript
// Email stored in lowercase:
const normalizedEmail = email.toLowerCase();
await AsyncStorage.setItem(STORAGE_KEYS.EMAIL, normalizedEmail);
```

## Database Schema

No database migration needed - the `email` column remains VARCHAR/TEXT type. The case normalization happens at the application level.

```sql
-- Database stores emails like this:
email = "john@example.com"  -- Always lowercase
```

## Testing Checklist

To verify case-insensitive functionality:

- [ ] Signup with `Test@Example.com` → should succeed
- [ ] Try signup again with `test@example.com` → should fail (email exists)
- [ ] Login with `TEST@EXAMPLE.COM` → should succeed
- [ ] Enable biometric with `test@example.com` → should succeed
- [ ] Login with biometric using `Test@Example.Com` → should succeed
- [ ] Forgot password with `TeSt@ExAmPlE.cOm` → should work
- [ ] Reset password with different case → should work

## Security Notes

1. **No Security Impact**: Email case normalization is a standard practice and doesn't affect security
2. **Password Remains Case-Sensitive**: Master passwords are still case-sensitive for security
3. **Recovery Key Remains Case-Sensitive**: Recovery keys maintain their exact format
4. **Username May Remain Case-Sensitive**: Username case handling is separate from email

## Future Enhancements

Potential improvements:
1. Add email validation to reject invalid formats
2. Add email domain verification
3. Trim whitespace from email inputs
4. Add email normalization middleware for all endpoints

## Migration Guide

For existing databases with mixed-case emails:

```python
# Run this migration script to normalize existing emails:
import asyncio
from database import get_session
from crud import get_all_users, update_user

async def normalize_emails():
    async with get_session() as db:
        users = await get_all_users(db)
        for user in users:
            if user.email != user.email.lower():
                user.email = user.email.lower()
                await update_user(db, user)
                print(f"Normalized: {user.username}")

# Run migration:
# asyncio.run(normalize_emails())
```

## Rollback Plan

If issues occur, emails can be restored to original case (if tracked in logs), but this is not recommended as it would break the case-insensitive feature.

---

**Implementation Date**: November 19, 2025  
**Status**: ✅ Complete  
**Tested**: Pending user testing  
**Breaking Changes**: None - backward compatible
