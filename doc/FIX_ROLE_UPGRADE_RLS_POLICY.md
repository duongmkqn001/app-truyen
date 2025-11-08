# Fix Role Upgrade Requests - RLS Policy Error

## ✅ FIXED: Admins Cannot See Role Upgrade Requests

### **Problem:**
Even though role upgrade requests exist in the database, admins cannot see them in the dashboard.

**Error in browser console:**
```
GET .../role_upgrade_requests?select=*,users!...(username,role,created_at) 400 (Bad Request)
{code: '42703', message: 'column users_1.email does not exist'}
```

### **Root Causes:**

#### Issue 1: Wrong Column in Query (FIXED)
- The query was trying to select `email` from the `users` table
- But `email` is stored in Supabase's `auth.users` table, NOT in the public `users` table
- The public `users` table only has: `id`, `username`, `role`, `created_at`, `updated_at`, `is_banned`

**Solution:** Removed `email` from the query in `database.js`

#### Issue 2: Wrong Function in RLS Policy (MAIN ISSUE)
- The RLS policy on `role_upgrade_requests` table uses `is_current_user_admin()` function
- **This function does NOT exist in the database!**
- The correct function is `is_admin()`

**RLS Policy (BROKEN):**
```sql
CREATE POLICY "Users can view own role upgrade requests"
ON role_upgrade_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_current_user_admin());  -- ❌ Function doesn't exist!
```

**Solution:** Created migration `021_fix_role_upgrade_rls_policies.sql` to fix the policy

---

## 📋 Changes Made:

### 1. `js/database.js` - Removed `email` from query
**Before:**
```javascript
.select(`
    *,
    users!role_upgrade_requests_user_id_fkey(username, email, role, created_at)
`)
```

**After:**
```javascript
.select(`
    *,
    users!role_upgrade_requests_user_id_fkey(username, role, created_at)
`)
```

### 2. `js/admin-ui.js` - Fixed username display
**Before:**
```javascript
${request.username || 'N/A'}  // ❌ Wrong - username is nested
```

**After:**
```javascript
${request.users?.username || 'N/A'}  // ✅ Correct - access nested object
```

### 3. `supabase/migrations/021_fix_role_upgrade_rls_policies.sql` - NEW MIGRATION
**Fixes the RLS policies:**
```sql
-- Drop existing broken policies
DROP POLICY IF EXISTS "Users can view own role upgrade requests" ON role_upgrade_requests;
DROP POLICY IF EXISTS "Admins can update role upgrade requests" ON role_upgrade_requests;

-- Create correct policies using is_admin() function
CREATE POLICY "Users can view own role upgrade requests"
ON role_upgrade_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());  -- ✅ Correct function!

CREATE POLICY "Admins can update role upgrade requests"
ON role_upgrade_requests
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

### 4. Removed duplicate admin dashboard
- Deleted `admin-users.html` and `js/admin-users.js`
- Now only `admin.html` is the single admin dashboard

---

## 🎯 What You Need to Do:

### 1. Run the Migration
Go to **Supabase SQL Editor** and run:
```sql
-- File: supabase/migrations/021_fix_role_upgrade_rls_policies.sql
```

### 2. Refresh Your Browser
Press **Ctrl+F5** (or **Cmd+Shift+R** on Mac)

### 3. Test the Fix
1. Go to **admin.html**
2. Click on **"✍️ Yêu cầu nâng cấp vai trò"** tab
3. You should now see all pending role upgrade requests!

---

## 📊 Expected Result:

After running the migration, you should see a table like this:

| Người dùng | Từ vai trò | Lên vai trò | Lý do & Xác minh | Ngày yêu cầu | Hành động |
|------------|------------|-------------|------------------|--------------|-----------|
| username123 | 🟢 reader | 🔵 translator | "I translate novels..."<br>🔗 Website/Wattpad<br>📷 Xem ảnh chứng minh | 06/11/2025 | ✓ Duyệt / ✗ Từ chối |

---

## ✅ Status:

- ✅ **Database query fixed** - Removed non-existent `email` column
- ✅ **Username display fixed** - Access nested `users` object correctly
- ✅ **RLS policy fixed** - Use correct `is_admin()` function
- ✅ **Migration created** - `021_fix_role_upgrade_rls_policies.sql`
- ✅ **Duplicate dashboard removed** - Only `admin.html` remains
- ✅ **Debugging added** - Console logs to help troubleshoot

**Run migration 021 and you should be able to see all role upgrade requests!** 🚀

---

## 🔍 Why This Happened:

The `role_upgrade_requests` table was created in migration `011_role_upgrade_requests.sql` which used a function `is_current_user_admin()` that was never defined. This was likely a typo or oversight during development.

The correct function `is_admin()` was defined in earlier migrations (002, 005, 014b) and checks if the current user has any admin role (`admin`, `super_admin`, or `sub_admin`).

---

## 📝 Technical Details:

### Available Admin Functions:
- ✅ `is_admin()` - Checks if user is any admin type (admin, super_admin, sub_admin)
- ✅ `is_super_admin()` - Checks if user is super_admin
- ✅ `is_sub_admin()` - Checks if user is sub_admin
- ✅ `is_any_admin()` - Alias for is_admin()
- ❌ `is_current_user_admin()` - **DOES NOT EXIST** (was used by mistake)

### RLS Policy Behavior:
- **Before fix:** Policy fails because function doesn't exist → Admins cannot see ANY requests
- **After fix:** Policy works correctly → Admins can see ALL requests, users can see their own

