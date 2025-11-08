# Troubleshooting Guide: User Role Reset Issue

## Problem
User accounts are being reset to `'pending_approval'` instead of maintaining their assigned role.

## Diagnosis Completed ✅
- ✅ Trigger function `handle_new_user()` is correctly set to `'reader'`
- ✅ JavaScript code doesn't modify roles during normal operations
- ✅ `updateUsername()` function only updates username, not role

## Possible Causes & Solutions

### 1. RLS Policy WITH CHECK Constraint
**Issue**: The "Users can update own profile" policy might not preserve the role field.

**Solution**: Run `FIX_user_update_policy.sql` in Supabase SQL Editor

### 2. Check Current Policies
**Action**: Run `CHECK_ALL_POLICIES.sql` to see all active RLS policies on users table

Look for any policies with `with_check_expression` that might be modifying the role.

### 3. Supabase Email Confirmation Settings
**Issue**: Email confirmation might trigger a user update that resets the role.

**Check in Supabase Dashboard**:
1. Go to **Authentication** → **Settings**
2. Check if "Enable email confirmations" is ON
3. If yes, this might be causing the issue

**Potential Fix**: 
- Disable email confirmations for testing, OR
- Check if there's a webhook/trigger on email confirmation

### 4. Check for Database Triggers on UPDATE
**Action**: Run this SQL to check for UPDATE triggers:

```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_manipulation = 'UPDATE';
```

### 5. Check auth.users Metadata
**Issue**: The role might be stored in `auth.users.raw_user_meta_data` and being synced incorrectly.

**Action**: Run this SQL to check your user's metadata:

```sql
SELECT 
    id,
    email,
    raw_user_meta_data,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'duongmkqn001@gmail.com';
```

### 6. Specific Test Case
**To isolate the issue, try this**:

1. Create a new test user via signup
2. Immediately check the database - what role does it have?
3. If it has 'reader', then confirm the email
4. Check again - did the role change?

This will tell us WHEN the role is being reset.

### 7. Check for Application-Level Code
**Search for any code that might update user profiles**:
- Check if there's any code in `onAuthStateChange` listeners
- Check if profile updates happen after login
- Check if there's any "sync profile" logic

## Recommended Next Steps

1. **Run CHECK_ALL_POLICIES.sql** and share the results
2. **Check Supabase Auth Settings** for email confirmation
3. **Test the specific scenario** described in #6 above
4. **Run FIX_user_update_policy.sql** to add role preservation constraint

## Questions to Answer

1. **When does the role reset happen?**
   - Immediately after signup?
   - After email confirmation?
   - After first login?
   - After updating profile (e.g., changing username)?

2. **Which user is experiencing this?**
   - Is it YOUR account (duongmkqn001@gmail.com)?
   - Is it new signups?
   - Is it all users?

3. **What is the current role of duongmkqn001@gmail.com in the database?**
   - Check in Supabase Dashboard → Table Editor → users table

Please provide answers to these questions so we can pinpoint the exact cause!

