# Permission-Based Password Sharing Update

## Overview
Successfully implemented permission-based editing for shared passwords. Users can now select "view" or "edit" permissions when sharing passwords, and recipients with "edit" permission can modify the passwords.

## Changes Made

### Backend Changes

#### 1. Database Model (`backend_vm/models.py`)
- Added `permission` column to `SharedPassword` model
- Default value: "view"
- Allowed values: "view" or "edit"

#### 2. Schemas (`backend_vm/schemas.py`)
- Updated `ShareCreate` to accept permission parameter (optional, defaults to "view")
- Updated `ShareOut` to include permission field in responses

#### 3. API Endpoints (`backend_vm/main.py`)
- **POST /share**: Now accepts and stores permission parameter
- **PUT /passwords/{id}**: Updated to check edit permission
  - Allows owner to edit
  - Allows shared users with "edit" permission to edit
  - Blocks shared users with "view" permission

### Frontend Changes

#### 1. Share Password Screen (`app/share-password.tsx`)
- Now passes the selected permission ("view" or "edit") to the backend
- Permission selection UI already existed, now fully functional

#### 2. View Password Details (`app/view-password-details.tsx`)
- Fetches share permission when viewing shared passwords
- Shows edit button if:
  - User is the owner, OR
  - User has "edit" permission on the shared password
- Hides edit button for users with only "view" permission

#### 3. Edit Password Details (`app/edit-password-details.tsx`)
- Checks permission on screen entry
- Blocks editing if user has only "view" permission
- Allows editing if user has "edit" permission
- Double-checks permission before saving changes

#### 4. Manage Sharing Screen (`app/manage-sharing.tsx`)
- Displays actual permission level for each shared user
- Shows "View" with green eye icon for view permission
- Shows "Edit" with purple pencil icon for edit permission
- Color-coded badges for easy identification

#### 5. API Utils (`utils/api.ts`)
- Updated `sharingAPI.share()` to include permission parameter
- Updated `SharedPassword` interface to include permission field

## Database Migration

A migration script has been created at `backend_vm/update_db.py` to add the permission column to existing databases.

### To Update Your Database:

```bash
cd backend_vm
python update_db.py
```

This will:
1. Add the `permission` column if it doesn't exist
2. Set all existing shares to "view" permission
3. Ensure data consistency

**Note**: The script uses SQLite-specific syntax. If you're running the backend and it crashes, simply restart it - SQLAlchemy will automatically create the column on the next `init_db()` call.

## How It Works

### Sharing Flow with Permissions:
1. User opens share-password screen for a password
2. Enters recipient's username
3. Selects permission level (view or edit)
4. Backend creates share record with selected permission
5. Recipient sees the password in their shared list

### Editing Flow:
1. Recipient opens shared password
2. If permission = "view":
   - No edit button shown
   - View-only access to password details
3. If permission = "edit":
   - Edit button is shown
   - Can modify password details
   - Changes saved successfully

### Permission Display:
- In manage-sharing screen, each shared user shows their permission level
- Green "View" badge with eye icon = view-only access
- Purple "Edit" badge with pencil icon = can edit password

## Testing

### Test View Permission:
1. Share a password with another user, select "View" permission
2. Login as recipient
3. Open the shared password
4. Verify no edit button is shown
5. Try to navigate to edit screen manually - should be blocked

### Test Edit Permission:
1. Share a password with another user, select "Edit" permission
2. Login as recipient
3. Open the shared password
4. Verify edit button is shown
5. Click edit and modify the password
6. Save changes - should succeed
7. Login as owner and verify changes are reflected

### Test Permission Display:
1. Share multiple passwords with different permissions
2. Open manage-sharing screen
3. Verify correct permission badges are shown for each user
4. Colors and icons should match permission levels

## Security Considerations

- Backend validates permission on every edit attempt
- Frontend blocks UI access but backend enforces rules
- Permission checks occur at multiple layers:
  1. View screen: Shows/hides edit button
  2. Edit screen entry: Alerts and redirects if no permission
  3. Save operation: Double-checks before committing changes
  4. Backend endpoint: Final validation before database update

## Future Enhancements

Possible additions:
- Change permission level after sharing (upgrade view to edit or downgrade edit to view)
- Time-limited edit permissions (edit access expires after X days)
- Audit log showing who edited shared passwords and when
- Notification to owner when shared user edits password
- Bulk permission changes for multiple users

## Troubleshooting

### If permissions don't work:
1. Verify database has permission column: `sqlite3 bedrock.db "PRAGMA table_info(shared_passwords);"`
2. Check existing shares have permission set: `sqlite3 bedrock.db "SELECT id, permission FROM shared_passwords;"`
3. Run update script: `python backend_vm/update_db.py`
4. Restart backend server

### If edit button doesn't show for edit permission:
1. Check browser console for errors
2. Verify sharingAPI.getIncoming() returns permission field
3. Check sharePermission state in view-password-details.tsx
4. Ensure permission is correctly stored in database

### If backend blocks editing despite edit permission:
1. Check backend logs for error messages
2. Verify GET /passwords/{id} returns share with permission="edit"
3. Ensure crud.get_share_for_user_and_password() returns correct share
4. Check PUT endpoint permission validation logic

## Summary

The permission-based sharing system is now fully functional. Users can:
- ✅ Share passwords with "view" or "edit" permissions
- ✅ View shared passwords based on their permission level
- ✅ Edit shared passwords if they have edit permission
- ✅ See permission levels in manage-sharing screen
- ✅ Have edit attempts blocked if they only have view permission

All changes are secure, validated at multiple layers, and maintain data integrity throughout the sharing lifecycle.
