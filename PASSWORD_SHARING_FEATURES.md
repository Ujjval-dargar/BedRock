# Password Sharing Feature Documentation

## Overview
A comprehensive password sharing system has been added to BedRock, enabling secure collaboration between users. The feature includes modern UI design, permission management, and multiple access points throughout the app.

---

## New Screens Added

### 1. **Share Password Screen** (`share-password.tsx`)
**Purpose:** Allow users to share a password with another user

**Features:**
- Email input with validation
- Permission level selection (View Only / Can Edit)
- Optional message field
- Secure sharing indicator with encryption notice
- Modern card-based design with gradient icon container

**Navigation:**
- From: Password details screen → "Share" button
- Route: `/share-password?id={passwordId}`

**Design Highlights:**
- Purple gradient theme (#6B5BFF)
- Toggle buttons for permission selection
- Information cards with contextual help
- Floating action button with shadow effects

---

### 2. **Shared Passwords List Screen** (`shared-passwords-list.tsx`)
**Purpose:** View all shared passwords in one place

**Features:**
- **Two Tabs:**
  - "Shared with Me" - Passwords received from others
  - "Shared by Me" - Passwords shared with others
- Search functionality for both tabs
- Permission badges (View/Edit)
- Sharing direction indicators (arrow icons)
- Empty state messages
- Quick access to manage sharing details

**Navigation:**
- From: Settings → "Shared Passwords"
- Route: `/shared-passwords-list`

**Design Highlights:**
- Material Top Tabs navigation
- Card-based password items
- Icon containers with service logos
- Timestamp displays ("2 days ago", etc.)
- Color-coded permission badges

---

### 3. **Manage Sharing Screen** (`manage-sharing.tsx`)
**Purpose:** Manage sharing permissions and users for a specific password

**Features:**
- **For Password Owners (Sent Passwords):**
  - View all users with access
  - Add new users
  - Change user permissions (View ↔ Edit)
  - Remove user access
  - Link sharing toggle
  - Auto-expiration settings
  - "Stop Sharing with Everyone" option
  - Last accessed timestamps

- **For Recipients (Received Passwords):**
  - View who shared the password
  - See granted permissions
  - Permission breakdown checklist
  - "Remove from My Vault" option

**Navigation:**
- From: Shared passwords list → Tap any password card
- Route: `/manage-sharing?id={passwordId}&type={received|sent}`

**Design Highlights:**
- User avatars with initials
- Interactive permission pills
- Toggle switches for settings
- Color-coded info cards
- Destructive action buttons (red)

---

### 4. **Updated View Password Details Screen**
**Enhancements:**
- Added "Share" button alongside "Edit" button
- New button layout with flex row
- Icon integration (share-social-outline)
- Outlined style for Share button vs filled Edit button
- Maintains existing design consistency

---

## Navigation & Access Points

### Primary Access:
1. **Settings Screen** → "Shared Passwords" (new menu item at top)
2. **Password Details** → "Share" button
3. **Deep linking** via routes

### Settings Integration:
- New menu item: "Shared Passwords"
- Icon: `share-social`
- Accent color: Purple (#8B5CF6)
- Positioned at top of settings list

---

## Design System

### Color Palette:
- **Primary Purple:** `#6B5BFF` (buttons, accents)
- **Light Purple:** `#F0EDFF` (backgrounds)
- **Success Green:** `#059669` (View permission)
- **Blue:** `#2563EB` (Edit permission)
- **Warning Yellow:** `#F59E0B` (alerts)
- **Danger Red:** `#DC2626` (destructive actions)

### Typography:
- **Headers:** 18px, bold, purple
- **Card Titles:** 16-20px, bold
- **Body Text:** 14-15px, regular
- **Metadata:** 11-13px, light gray

### Components:
- **Cards:** White background, 16px border radius, shadow elevation
- **Buttons:** 12px padding, 10-12px border radius
- **Badges:** 8px border radius, icon + text
- **Avatar Circles:** Initial-based, colored backgrounds
- **Icon Containers:** 50-80px, rounded, gradient backgrounds

### Spacing:
- **Container Padding:** 16px
- **Card Margins:** 12-16px bottom
- **Section Gaps:** 24px
- **Element Gaps:** 6-12px

---

## Mock Data Structure

### Shared Password Object:
```typescript
{
  id: string;
  title: string;
  username: string;
  sharedWith?: string;      // For sent passwords
  sharedBy?: string;        // For received passwords
  permission: "view" | "edit";
  sharedDate: string;
  icon: string;
  category: string;
  lastAccessed?: string;
}
```

---

## User Flow Examples

### Sharing a Password:
1. User opens password details
2. Taps "Share" button
3. Enters recipient email
4. Selects permission level
5. Optionally adds message
6. Taps "Share Password"
7. Confirmation shown

### Managing Shared Access:
1. User goes to Settings → Shared Passwords
2. Selects "Shared by Me" tab
3. Taps a password card
4. Views all users with access
5. Changes permissions or removes users
6. Enables/disables link sharing

### Receiving Shared Password:
1. User goes to Settings → Shared Passwords
2. Views "Shared with Me" tab
3. Sees who shared each password
4. Taps to view permissions
5. Can remove from vault if desired

---

## Future Integration Notes

### API Integration Points:
- `share-password.tsx` - Line 21: Add passwordId from params
- `share-password.tsx` - `handleShare()`: Implement POST /api/passwords/share
- `shared-passwords-list.tsx` - Replace mock data with API fetch
- `manage-sharing.tsx` - Implement user management API calls

### Backend Requirements:
- User lookup by email
- Share permission storage
- Access tracking (last accessed timestamps)
- Link generation for sharing
- Expiration scheduling
- Notification system for new shares

### Security Considerations:
- End-to-end encryption for shared passwords
- Audit logging for permission changes
- Rate limiting on share invitations
- Email verification before sharing
- Master password re-authentication for sensitive shares

---

## Files Modified/Created

### New Files:
1. `/app/share-password.tsx` (177 lines)
2. `/app/shared-passwords-list.tsx` (333 lines)
3. `/app/manage-sharing.tsx` (523 lines)

### Modified Files:
1. `/app/view-password-details.tsx` - Added Share button
2. `/app/settings.tsx` - Added Shared Passwords menu item

---

## Testing Checklist

- [ ] Share password modal opens correctly
- [ ] Email validation works
- [ ] Permission toggles switch properly
- [ ] Tab navigation in shared list works
- [ ] Search filters passwords correctly
- [ ] Empty states display properly
- [ ] Permission badges show correct colors
- [ ] User can navigate between screens
- [ ] Back buttons work correctly
- [ ] Settings link navigates to shared list

---

## Screenshots Locations

Key screens for documentation:
- Share password modal with permission options
- Shared passwords list with tabs
- Manage sharing screen (owner view)
- Manage sharing screen (recipient view)
- Updated password details with Share button

---

## Accessibility Features

- Touch targets: 44x44 minimum
- Color contrast ratios meet WCAG AA
- Descriptive labels for icons
- Keyboard navigation support (web)
- Screen reader compatible text labels

---

## Performance Optimizations

- Lazy loading of shared passwords list
- Debounced search inputs
- Memoized card components
- Optimized re-renders with proper keys
- ScrollView with performance props

---

## Known Limitations (Current Mock Implementation)

1. No actual backend integration
2. Mock data only (not persisted)
3. No real-time updates
4. No push notifications
5. Link sharing generates alert only
6. No email sending functionality

These will need implementation when connecting to backend services.
