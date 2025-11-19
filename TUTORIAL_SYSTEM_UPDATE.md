# Tutorial System - Database-Driven Implementation

## Overview
The tutorial system has been updated to use a database column (`is_first_login`) instead of local storage to track whether users should see the tutorial. This ensures consistent tutorial display across devices and after app reinstalls.

## Changes Made

### Database Changes

#### New Column: `is_first_login`
```python
is_first_login = Column(Boolean, default=True, nullable=False)
```

- **Type**: Boolean
- **Default**: True (show tutorial)
- **Purpose**: Track if user has completed the tutorial
- **Behavior**: 
  - True → Show tutorial on next login
  - False → Skip tutorial

### Backend Changes (`backend_vm/`)

#### 1. **Models (`models.py`)**
```python
class User(Base):
    # ... existing fields ...
    is_first_login = Column(Boolean, default=True, nullable=False)
```

#### 2. **Schemas (`schemas.py`)**
Added `is_first_login` to response models:
```python
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    biometric_enabled: bool = False
    is_first_login: bool = True

class SignupResponse(BaseModel):
    # ... existing fields ...
    is_first_login: bool = True
```

#### 3. **API Endpoints (`main.py`)**

**Login Endpoint** - Returns `is_first_login`:
```python
@app.post("/login")
async def login(...):
    # ... authentication logic ...
    return JSONResponse({
        "access_token": access_token,
        "token_type": "bearer",
        "encrypted_vault_key": user.encrypted_vault_key.hex(),
        "vault_salt": user.vault_salt.hex(),
        "public_key_pem": user.public_key_pem,
        "is_first_login": user.is_first_login  # NEW
    })
```

**Biometric Login Endpoint** - Also returns `is_first_login`:
```python
@app.post("/biometric/login")
async def biometric_login(...):
    # ... biometric authentication ...
    return JSONResponse({
        # ... existing fields ...
        "is_first_login": user.is_first_login  # NEW
    })
```

**New Endpoint** - Complete Tutorial:
```python
@app.post("/complete-tutorial")
async def complete_tutorial(current: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_session)):
    """Mark tutorial as completed for the user (set is_first_login to False)"""
    current.is_first_login = False
    db.add(current)
    await db.commit()
    return {"message": "Tutorial completed", "is_first_login": False}
```

### Frontend Changes

#### 1. **API Client (`utils/api.ts`)**

**Added Storage Key**:
```typescript
export const STORAGE_KEYS = {
  // ... existing keys ...
  IS_FIRST_LOGIN: 'is_first_login',
};
```

**Updated Login Response**:
```typescript
async login(email: string, masterPassword: string): Promise<{
  access_token: string;
  encrypted_vault_key: string;
  vault_salt: string;
  public_key_pem: string;
  is_first_login?: boolean;  // NEW
}>
```

**Store `is_first_login` Flag**:
```typescript
// Login
if (response.is_first_login !== undefined) {
  await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LOGIN, response.is_first_login.toString());
}

// Biometric Login  
if (response.is_first_login !== undefined) {
  await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LOGIN, response.is_first_login.toString());
}
```

**New API Method**:
```typescript
async completeTutorial(): Promise<{ message: string; is_first_login: boolean }> {
  const response = await fetchAPI('/complete-tutorial', {
    method: 'POST',
  });
  // Update local storage
  await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LOGIN, 'false');
  return response;
}
```

#### 2. **Tutorial Hook (`hooks/use-tutorial.ts`)**

**Before (Local Storage Only)**:
```typescript
const TUTORIAL_COMPLETED_KEY = '@bedrock_tutorial_completed';
const completed = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
```

**After (Database-Driven)**:
```typescript
import { authAPI, STORAGE_KEYS } from '../utils/api';

const checkTutorialStatus = async () => {
  // Check is_first_login flag from AsyncStorage (set during login)
  const isFirstLogin = await AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_LOGIN);
  
  if (isFirstLogin === 'false') {
    setShowTutorial(false);
  } else {
    setShowTutorial(true);
  }
};

const completeTutorial = async () => {
  // Call API to mark tutorial as completed in database
  await authAPI.completeTutorial();
  tutorialCompleted = true;
  setShowTutorial(false);
};

const skipTutorial = async () => {
  // Call API to mark tutorial as completed in database
  await authAPI.completeTutorial();
  tutorialCompleted = true;
  setShowTutorial(false);
};
```

### Migration

#### Database Migration Script
File: `backend_vm/add_is_first_login_column.py`

```python
# Add is_first_login column (default True for new users)
cursor.execute("""
    ALTER TABLE users 
    ADD COLUMN is_first_login BOOLEAN NOT NULL DEFAULT 1
""")
```

**Running the Migration**:
```bash
cd backend_vm
python3 add_is_first_login_column.py
```

**Output**:
```
✓ Migration completed successfully!
✓ Added is_first_login column to users table
✓ Default value: True (tutorial will be shown)
✓ Existing users will see tutorial on next login
```

## How It Works

### 1. **User Signup Flow**
```
1. User creates account
2. Database creates user with is_first_login = True
3. User completes signup flow
```

### 2. **First Login Flow**
```
1. User logs in (email/password or biometric)
2. Backend returns is_first_login = True
3. Frontend stores flag in AsyncStorage
4. Tutorial hook checks flag → Shows tutorial
5. User completes/skips tutorial
6. Frontend calls /complete-tutorial API
7. Backend sets is_first_login = False
8. AsyncStorage updated to 'false'
```

### 3. **Subsequent Login Flow**
```
1. User logs in again
2. Backend returns is_first_login = False
3. Frontend stores flag in AsyncStorage
4. Tutorial hook checks flag → Skips tutorial
5. User goes directly to home screen
```

### 4. **Device/App Reinstall**
```
1. User reinstalls app or uses new device
2. Logs in with same account
3. Backend returns is_first_login = False (from database)
4. Tutorial automatically skipped
5. No tutorial shown even on fresh install
```

## Benefits

### 1. **Persistent State**
- Tutorial completion persists across:
  - App reinstalls
  - Device changes
  - Cache clearing
  - Local storage loss

### 2. **Consistent Experience**
- Same tutorial state on all devices
- No duplicate tutorials after switching devices
- Database is source of truth

### 3. **Better UX**
- Existing users won't see tutorial again
- New users always see tutorial once
- Tutorial can be reset for support/testing

### 4. **Security**
- No local manipulation of tutorial state
- Server-controlled flag
- Authenticated API endpoint

## API Reference

### Endpoints

#### `POST /complete-tutorial`
Mark tutorial as completed for authenticated user.

**Authentication**: Required (JWT token)

**Request**: None

**Response**:
```json
{
  "message": "Tutorial completed",
  "is_first_login": false
}
```

**Side Effects**:
- Sets `is_first_login = False` in database
- User won't see tutorial on next login

#### `POST /login`
Login with email and password.

**Response** (Updated):
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "encrypted_vault_key": "hex_string",
  "vault_salt": "hex_string",
  "public_key_pem": "pem_string",
  "is_first_login": true  // NEW FIELD
}
```

#### `POST /biometric/login`
Login with biometric authentication.

**Response** (Updated):
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "encrypted_vault_key": "hex_string",
  "vault_salt": "hex_string",
  "public_key_pem": "pem_string",
  "master_password_hash": "hash_string",
  "is_first_login": true  // NEW FIELD
}
```

## Testing

### Test Scenarios

1. **New User Signup**
   - [ ] Create new account
   - [ ] Login for first time
   - [ ] Verify tutorial is shown (`is_first_login = true`)
   - [ ] Complete tutorial
   - [ ] Logout and login again
   - [ ] Verify tutorial is skipped (`is_first_login = false`)

2. **Existing User**
   - [ ] Login with existing account
   - [ ] If first time after migration, tutorial shown
   - [ ] Complete tutorial
   - [ ] Verify `is_first_login = false` in database
   - [ ] Future logins skip tutorial

3. **Cross-Device**
   - [ ] Login on Device A
   - [ ] Complete tutorial
   - [ ] Login on Device B with same account
   - [ ] Verify tutorial is skipped

4. **App Reinstall**
   - [ ] Complete tutorial
   - [ ] Uninstall app
   - [ ] Reinstall app
   - [ ] Login with same account
   - [ ] Verify tutorial is skipped

5. **Biometric Login**
   - [ ] Enable biometric
   - [ ] Logout
   - [ ] Login with biometric
   - [ ] Verify tutorial state matches database

### Database Verification

Check tutorial status in database:
```sql
SELECT id, username, email, is_first_login FROM users;
```

Expected values:
- New users: `is_first_login = 1` (True)
- Tutorial completed: `is_first_login = 0` (False)

## Troubleshooting

### Tutorial Still Showing After Completion

**Check**:
```typescript
// In React Native Debugger
AsyncStorage.getItem('is_first_login').then(console.log);
```

**Fix**:
```typescript
// Reset tutorial state
await authAPI.completeTutorial();
```

### Tutorial Not Showing for New User

**Check Database**:
```sql
SELECT is_first_login FROM users WHERE email = 'user@example.com';
```

**Fix**:
```sql
UPDATE users SET is_first_login = 1 WHERE email = 'user@example.com';
```

### API Error on Complete Tutorial

**Error**: "401 Unauthorized"
- **Cause**: User not logged in
- **Fix**: Ensure JWT token is valid

**Error**: "500 Internal Server Error"
- **Cause**: Database connection issue
- **Fix**: Check backend logs, restart server

## Migration Notes

### For Existing Users

All existing users will have `is_first_login = 1` (True) after migration, meaning:
- They will see the tutorial on their next login
- This is intentional to ensure everyone sees the tutorial at least once
- After completion, they won't see it again

### Rollback Plan

If needed to rollback:
```sql
-- Remove column (loses all tutorial completion data)
ALTER TABLE users DROP COLUMN is_first_login;
```

Then revert code changes and use old local storage system.

## Future Enhancements

Possible improvements:
1. Add tutorial version tracking
2. Show tutorial again when major updates occur
3. Add tutorial_completed_at timestamp
4. Analytics on tutorial completion rate
5. Different tutorials for different user roles

---

**Implementation Date**: November 20, 2025  
**Database Migration**: ✅ Complete  
**Backend Updated**: ✅ Complete  
**Frontend Updated**: ✅ Complete  
**Testing Status**: Pending user testing
