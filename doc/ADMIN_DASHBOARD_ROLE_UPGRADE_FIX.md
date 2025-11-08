# Admin Dashboard - Role Upgrade Requests Fix

## ✅ FIXED: Role Upgrade Requests Now Visible in Admin Dashboard

### **Problem:**
1. Role upgrade requests were being created successfully but not visible in admin dashboard
2. Admin dashboard still had "Pending Members" tab which is no longer needed (users auto-approved as 'reader')

### **Root Cause:**
- There were TWO admin dashboards:
  - `admin.html` - Was using OLD `translator_requests` table (deprecated)
  - `admin-users.html` - Uses NEW `role_upgrade_requests` table (correct)
- User was creating requests in the NEW table but `admin.html` was querying the OLD table
- "Pending Members" tab was obsolete since users are now auto-approved as 'reader' role

### **Solution:**
Updated `admin.html` and `js/admin-ui.js` to:
1. ✅ Remove "Pending Members" tab (no longer needed)
2. ✅ Rename "Translator Requests" to "Role Upgrade Requests"
3. ✅ Query the NEW `role_upgrade_requests` table instead of OLD `translator_requests` table
4. ✅ Display verification fields (website URL and proof image URL)
5. ✅ Update approve/reject functions to use new API

---

## 📋 Changes Made:

### 1. `admin.html` - Updated Tab Navigation
**Before:**
- ⏳ Thành viên chờ duyệt (Pending Members) - REMOVED
- 📖 Truyện chờ duyệt (Pending Novels)
- ✍️ Yêu cầu dịch giả (Translator Requests) - RENAMED
- 👥 Người dùng (Users)
- 📚 Truyện (Novels)
- 🚩 Báo cáo (Reports)

**After:**
- 📖 Truyện chờ duyệt (Pending Novels) - NOW FIRST TAB
- ✍️ Yêu cầu nâng cấp vai trò (Role Upgrade Requests) - RENAMED & UPDATED
- 👥 Người dùng (Users)
- 📚 Truyện (Novels)
- 🚩 Báo cáo (Reports)

### 2. `js/admin-ui.js` - Updated Functions

#### Replaced `loadTranslatorRequests()` with `loadRoleUpgradeRequests()`:
- ✅ Now calls `db.roleUpgradeRequests.getPendingRequests()` instead of `db.translatorRequests.getPending()`
- ✅ Displays `from_role` → `to_role` with role badges
- ✅ Shows verification links:
  - 🔗 Website/Wattpad link (if provided)
  - 📷 Proof image link (if provided)

#### Replaced approve/reject functions:
- ✅ `approveTranslatorRequest()` → `approveRoleUpgradeRequest()`
- ✅ `rejectTranslatorRequest()` → `rejectRoleUpgradeRequest()`
- ✅ Both now use `db.roleUpgradeRequests` API

#### Removed pending members functionality:
- ✅ Commented out `loadPendingMembers()` function
- ✅ Commented out `approveUser()` function
- ✅ Updated `banUser()` to reload users list instead of pending members
- ✅ Removed refresh button event listener for pending members

---

## 🎯 What You Can Do Now:

### As Admin:
1. Go to **admin.html**
2. Click on **"✍️ Yêu cầu nâng cấp vai trò"** tab
3. You will see all pending role upgrade requests with:
   - Username
   - Current role (from_role)
   - Requested role (to_role)
   - Request message
   - Website/Wattpad link (if provided)
   - Proof image link (if provided)
   - Date of request
   - Approve/Reject buttons

### To Approve a Request:
1. Click **"✓ Duyệt"** button
2. Optionally add notes for the user
3. User's role will be upgraded immediately

### To Reject a Request:
1. Click **"✗ Từ chối"** button
2. Enter reason for rejection (required)
3. User will be notified with the reason

---

## 📊 Request Display Format:

The role upgrade requests table now shows:

| Người dùng | Từ vai trò | Lên vai trò | Lý do & Xác minh | Ngày yêu cầu | Hành động |
|------------|------------|-------------|------------------|--------------|-----------|
| username123 | 🟢 reader | 🔵 translator | "I translate novels on Wattpad"<br>🔗 Website/Wattpad<br>📷 Xem ảnh chứng minh | 06/11/2025 | ✓ Duyệt / ✗ Từ chối |

---

## ✅ Status:

- ✅ **Role upgrade requests visible** - Fixed
- ✅ **Pending members tab removed** - No longer needed
- ✅ **Verification links displayed** - Website URL and proof image
- ✅ **Approve/reject working** - Using new API

**All role upgrade requests are now visible and manageable in the admin dashboard!** 🚀

---

## 📝 Notes:

- The old `translator_requests` table is still in the database but is no longer used
- The new `role_upgrade_requests` table supports all role upgrades (not just translator)
- Users can request upgrade to: `translator`, `admin`, `super_admin`, `sub_admin`
- Admins should verify the website URL and proof image before approving translator requests
- The `admin-users.html` dashboard also has role upgrade request management (alternative interface)

