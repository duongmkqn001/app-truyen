# Priority 1 & 2 Fixes Summary

## ✅ Priority 1: Critical Bugs - FIXED

### Bug 1: `db.nominations.remove is not a function`
**Error:** `Uncaught (in promise) TypeError: db.nominations.remove is not a function`

**Root Cause:** The function was named `delete`, not `remove`

**Fix:** Updated `js/novel-modal.js` line 449
- Changed: `db.nominations.remove(currentNovel.id)`
- To: `db.nominations.delete(currentNovel.id)`

**Status:** ✅ FIXED

---

### Bug 2: Duplicate key error in ratings upsert
**Error:** `{code: '23505', message: 'duplicate key value violates unique constraint "ratings_novel_id_user_id_key"'}`

**Root Cause:** The `upsert` operation didn't specify which columns make the record unique, so PostgreSQL couldn't determine if it should INSERT or UPDATE.

**Fix:** Updated `js/database.js` line 786
- Added `onConflict` parameter to the upsert call:
```javascript
.upsert({
    novel_id: novelId,
    user_id: user.id,
    rating: rating
}, {
    onConflict: 'novel_id,user_id'  // <-- Added this
})
```

**Status:** ✅ FIXED

---

### Bug 3: Nomination system
**Status:** ✅ FIXED (same as Bug 1)

---

## ✅ Priority 2: Role Upgrade Request Enhancement - COMPLETE

### Changes Made:

#### 1. Removed "pending_approval" references
**Files Updated:**
- `profile.html` - Updated role explanation section
- `js/profile.js` - Updated role hierarchy and role names

**Before:**
- pending_approval → member → contributor → admin

**After:**
- reader → translator → admin

#### 2. Updated role descriptions
**New role explanation:**
- **Độc giả (reader)**: Tài khoản mới tự động được vai trò này, có thể bình luận, đánh giá, đề cử truyện
- **Dịch giả (translator)**: Có thể tải lên truyện, chỉnh sửa truyện của mình (cần xác minh)
- **Quản trị viên (admin)**: Toàn quyền quản lý hệ thống

#### 3. Added translator verification fields
**New required fields for translator role requests:**
1. **Link Website/Wattpad** (required)
   - Input type: URL
   - Placeholder: `https://www.wattpad.com/user/yourname hoặc https://yourwebsite.com`

2. **Link ảnh chứng minh (Google Drive - công khai)** (required)
   - Input type: URL
   - Placeholder: `https://drive.google.com/...`
   - Help text: "Chụp màn hình trang cài đặt tài khoản hoặc trang profile của bạn trên website/Wattpad, upload lên Google Drive và chia sẻ công khai"

#### 4. Updated JavaScript validation
**File:** `js/profile.js`

**Changes:**
- Updated `filterAvailableRoles()` to use new role hierarchy
- Updated `getRoleName()` to include all role types (reader, translator, admin, super_admin, sub_admin)
- Updated verification field visibility to show for "translator" role (instead of "contributor")
- Updated validation to require website URL and proof image URL for translator requests
- Updated request submission to send verification data only for translator requests

---

## Testing Checklist

### Priority 1 - Star Rating & Nomination:
- [ ] Click on a novel to open the modal
- [ ] Try rating the novel with stars (1-5 stars)
- [ ] Verify no duplicate key error appears
- [ ] Try rating the same novel again with different stars
- [ ] Verify the rating updates successfully
- [ ] Try clicking the "Đề cử" (nominate) button
- [ ] Verify nomination is added
- [ ] Click "Đề cử" again to remove nomination
- [ ] Verify nomination is removed without error

### Priority 2 - Role Upgrade Request:
- [ ] Login as a "reader" role user
- [ ] Go to profile page
- [ ] Check that role explanation no longer mentions "pending_approval"
- [ ] Check that only "Dịch giả (Translator)" option appears in dropdown
- [ ] Select "Dịch giả (Translator)"
- [ ] Verify verification fields appear (Website URL and Proof Image URL)
- [ ] Try submitting without filling verification fields
- [ ] Verify validation error appears
- [ ] Fill in all fields and submit
- [ ] Verify request is created successfully

---

## Next Steps

**Priority 3:** Implement remaining features
- Anonymous Comments/Nominations
- Threaded Comment Replies

**Priority 4:** Clean up migrations folder
- Delete diagnostic SQL files
- Consolidate core migrations

