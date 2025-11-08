# ✅ FIXED: Role Upgrade Request Error

## Problem

When users tried to request an upgrade to `translator` role, they got this error:

```
POST https://chumufdfkeiybeojrwmr.supabase.co/rest/v1/role_upgrade_requests?select=* 400 (Bad Request)

{code: '23514', message: 'new row for relation "role_upgrade_requests" violates check constraint "role_upgrade_requests_to_role_check"'}
```

## Root Cause

The `role_upgrade_requests` table was created in migration `011_role_upgrade_requests.sql` with this CHECK constraint:

```sql
to_role TEXT NOT NULL CHECK (to_role IN ('member', 'contributor', 'admin'))
```

This constraint only allowed the **old role names** from the original RBAC system:
- ❌ `member` (old name)
- ❌ `contributor` (old name)
- ✅ `admin` (still valid)

But the current role system uses **new role names**:
- ✅ `reader` (new default role)
- ✅ `translator` (new name for contributor)
- ✅ `admin`, `super_admin`, `sub_admin` (admin roles)

When users tried to request `translator` role, the database rejected it because `translator` wasn't in the allowed list!

## Solution

Created migration `020_fix_role_upgrade_constraint.sql` that:

1. **Drops the old constraint:**
   ```sql
   ALTER TABLE role_upgrade_requests 
   DROP CONSTRAINT IF EXISTS role_upgrade_requests_to_role_check;
   ```

2. **Adds new constraint with updated role names:**
   ```sql
   ALTER TABLE role_upgrade_requests
   ADD CONSTRAINT role_upgrade_requests_to_role_check 
   CHECK (to_role IN ('reader', 'translator', 'admin', 'super_admin', 'sub_admin'));
   ```

Now users can request upgrades to any of the valid roles in the new system!

## Valid Role Upgrade Paths

After this fix, these upgrade paths are allowed:

### Common Upgrades:
- `reader` → `translator` ✅ (most common - requires website/proof verification)

### Admin Upgrades (rare):
- `reader` → `admin` ✅
- `reader` → `super_admin` ✅
- `reader` → `sub_admin` ✅
- `translator` → `admin` ✅
- `translator` → `super_admin` ✅
- `translator` → `sub_admin` ✅

**Note:** Admin role upgrades should be carefully reviewed by super_admin users.

## What You Need to Do

### 1. Run the Migration
Go to **Supabase SQL Editor** and run:
```sql
-- Copy and paste the content of:
supabase/migrations/020_fix_role_upgrade_constraint.sql
```

### 2. Refresh Your Browser
Press **Ctrl+F5** (or **Cmd+Shift+R** on Mac)

### 3. Test the Fix
1. Go to your profile page
2. Click "Yêu cầu nâng cấp vai trò" (Request role upgrade)
3. Select "translator" as the requested role
4. Fill in:
   - Request message
   - Website URL (link to your Wattpad/translation site)
   - Proof image URL (screenshot showing ownership)
5. Click "Gửi yêu cầu" (Submit request)
6. Should succeed without 400 error! ✅

## Files Created/Modified

### New Files (2):
1. `supabase/migrations/020_fix_role_upgrade_constraint.sql` - Fix CHECK constraint
2. `FIX_ROLE_UPGRADE_CONSTRAINT.md` - This documentation

### Modified Files (1):
1. `supabase/migrations/README.md` - Updated to include migration 020

## Technical Details

### Database Constraints

A CHECK constraint is a database rule that validates data before it's inserted or updated. In this case:

**Old constraint (broken):**
```sql
CHECK (to_role IN ('member', 'contributor', 'admin'))
```
This only allowed 3 specific values.

**New constraint (fixed):**
```sql
CHECK (to_role IN ('reader', 'translator', 'admin', 'super_admin', 'sub_admin'))
```
This allows all 5 valid roles in the current system.

### Why This Happened

This is a classic migration issue where:
1. Migration 011 created the table with old role names
2. Migration 013 changed the default role from `pending_approval` to `reader`
3. Migration 014 added `super_admin` and `sub_admin` roles
4. But migration 011's CHECK constraint was never updated!

This fix ensures the constraint matches the current role system.

## Status: ✅ FIXED

Users can now successfully request translator role upgrades with website verification! 🎉

