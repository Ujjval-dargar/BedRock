# Password Sharing Feature - Quick Start Guide

## 🚀 How to Use the New Password Sharing Features

### 1️⃣ Share a Password

**From Password Details Screen:**
```
1. Open any password in your vault
2. Tap the "Share" button (next to Edit)
3. Enter recipient's email address
4. Choose permission level:
   - View Only: Recipient can only see the password
   - Can Edit: Recipient can modify the password
5. Add an optional message
6. Tap "Share Password"
```

**Result:** Password is securely shared with the recipient!

---

### 2️⃣ View Your Shared Passwords

**From Settings:**
```
1. Go to Settings (gear icon)
2. Tap "Shared Passwords" (first item in list)
3. Switch between tabs:
   - "Shared with Me" - Passwords others shared with you
   - "Shared by Me" - Passwords you shared with others
```

**Features:**
- 🔍 Search through shared passwords
- 👁️ View/Edit badges show permission levels
- 📧 See who shared or who received each password
- 📅 View sharing timestamps

---

### 3️⃣ Manage Sharing Permissions

**From Shared Passwords List:**
```
1. Tap any password card
2. See all details and users with access
```

**If you're the owner (Shared by Me):**
- ➕ Add more users
- 🔄 Change permissions (View ↔ Edit)
- ❌ Remove user access
- 🔗 Enable link sharing
- ⏰ Set auto-expiration
- 🚫 Stop sharing with everyone

**If you're a recipient (Shared with Me):**
- 👤 See who shared it with you
- ✅ View your permissions
- 🗑️ Remove from your vault

---

## 🎨 Visual Guide

### Screen Flow:
```
┌─────────────────┐
│  Password       │
│  Details        │
│  [Edit][Share]  │
└────────┬────────┘
         │ tap Share
         ▼
┌─────────────────┐
│  Share          │
│  Password       │
│  - Email input  │
│  - Permissions  │
│  - Message      │
└────────┬────────┘
         │ success
         ▼
┌─────────────────┐
│  Settings       │
│  > Shared Pwd   │ ◄──── Access from here too!
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Shared List    │
│  [With Me][By]  │
│  - Search       │
│  - Cards list   │
└────────┬────────┘
         │ tap card
         ▼
┌─────────────────┐
│  Manage         │
│  Sharing        │
│  - Users list   │
│  - Settings     │
│  - Actions      │
└─────────────────┘
```

---

## 🎯 Key Features

### Security First 🔒
- ✅ End-to-end encryption notice
- ✅ Permission-based access control
- ✅ Audit trail with timestamps
- ✅ Individual access revocation

### User Experience 🎨
- ✅ Modern, consistent design
- ✅ Intuitive navigation
- ✅ Clear permission indicators
- ✅ Empty state messages
- ✅ Search functionality

### Flexibility 🔧
- ✅ Two permission levels
- ✅ Multiple users per password
- ✅ Link sharing option
- ✅ Auto-expiration settings
- ✅ Bulk revocation

---

## 📱 UI Elements Reference

### Permission Badges:
- **Green badge with eye icon** = View Only
- **Blue badge with pencil icon** = Can Edit

### Arrow Icons:
- **Down arrow** = Received from someone
- **Up arrow** = Sent to someone

### Button Colors:
- **Purple filled** = Primary action (Share, Edit)
- **Purple outline** = Secondary action (Share from details)
- **Red** = Destructive action (Remove, Stop Sharing)
- **Light purple** = Tertiary action (Copy Link)

---

## 💡 Tips & Best Practices

1. **Use View Only for sensitive passwords**
   - Banking credentials
   - Primary email accounts
   - Admin passwords

2. **Use Can Edit for team passwords**
   - Shared service accounts
   - Team resource logins
   - Collaborative tools

3. **Add messages when sharing**
   - Explain why you're sharing
   - Provide context or instructions
   - Set expectations

4. **Regularly review shared access**
   - Check "Shared by Me" tab monthly
   - Remove inactive users
   - Update permissions as needed

5. **Use link sharing carefully**
   - Only for temporary access
   - Enable auto-expiration
   - Monitor who accesses

---

## 🐛 Troubleshooting

### "Can't find shared password?"
- Check the correct tab (With Me vs By Me)
- Use the search function
- Verify spelling of password name

### "Permission level not changing?"
- Owner must change permissions
- Tap the permission badge to toggle
- Wait for confirmation

### "Want to stop receiving a shared password?"
- Go to Manage Sharing (received view)
- Scroll down to "Remove from My Vault"
- Confirm removal

---

## 🔮 Coming Soon (Backend Integration)

- Real-time notifications when passwords are shared
- Email invitations to recipients
- Activity logs and access history
- Bulk sharing to multiple users
- Team/group sharing
- Password sharing analytics
- Integration with organization policies

---

## 📞 Need Help?

If you encounter issues or have suggestions:
1. Check Settings → Help & Support
2. Review the full documentation in `PASSWORD_SHARING_FEATURES.md`
3. Contact the development team

---

**Enjoy secure password sharing! 🎉**
