# Database Migrations

This folder contains SQL migration files for the Vietnamese Novel Platform database.

## Migration Order

**Run migrations in numerical order (001 → 018):**

### Core Schema (Required)
1. **001_initial_schema.sql** - Initial database schema (users, novels, tags, ratings, comments, reviews, nominations, reports)
2. **002_rls_policies.sql** - Row Level Security policies for all tables
3. **003_seed_data.sql** - Sample data for testing (OPTIONAL - skip for production)

### RBAC System (Required)
4. **004_rbac_system_fixed.sql** - Role-Based Access Control system, translator_requests, likes table
5. **005_rbac_policies_fixed.sql** - RLS policies for RBAC system
6. **006_seed_tags.sql** - Default tags (12 Vietnamese novel genres)
7. **007_add_tag_categories.sql** - Tag categories system
8. **008_fix_users_rls_policies.sql** - Fix user table RLS policies
9. **009_fix_rls_with_anon_access.sql** - Allow anonymous read access
10. **010_use_trigger_for_profile.sql** - Auto-create user profile on signup

### Feature Enhancements (Required)
11. **011_role_upgrade_requests.sql** - Role upgrade request system with verification fields
12. **012_add_extra_chapters.sql** - Add extra_chapters field to novels table
13. **013_auto_approve_users.sql** - Auto-approve new users as 'reader' role
14. **014_admin_hierarchy.sql** - Add super_admin and sub_admin roles
15. **014b_admin_hierarchy_policies.sql** - RLS policies for admin hierarchy
16. **015_novel_info_reports.sql** - Add novel_info report type
17. **016_cleanup_duplicate_policies.sql** - Clean up duplicate RLS policies (IMPORTANT)

### New Features (Optional but Recommended)
17. **017_anonymous_posts.sql** - Add is_anonymous field to comments, reviews, nominations
18. **018_threaded_comments.sql** - Add parent_comment_id for nested comment replies

### Bug Fixes (Required)
19. **019_fix_likes_rls_policy.sql** - Fix 403 error when liking/disliking comments (CRITICAL)
20. **020_fix_role_upgrade_constraint.sql** - Fix 400 error when requesting translator role (CRITICAL)
21. **021_fix_role_upgrade_rls_policies.sql** - Fix RLS policies preventing admins from viewing role upgrade requests (CRITICAL)
22. **022_fix_novels_with_stats_tags.sql** - Fix novels_with_stats view to include tag_ids and tags JSON for proper tag pre-selection in edit forms (CRITICAL)

## How to Run Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. For each migration file (in order 001 → 018):
   - Click **New Query**
   - Copy and paste the content of the migration file
   - Click **Run** (wait for success message)
   - Verify no errors before proceeding to next migration

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations
supabase db push
```

## Important Notes

- ⚠️ **Run migrations in numerical order** (001 → 020)
- ⚠️ **Migration 016 is CRITICAL** - It fixes duplicate RLS policies that can cause infinite recursion errors
- ⚠️ **Migration 019 is CRITICAL** - It fixes 403 errors when liking/disliking comments
- ⚠️ **Migration 020 is CRITICAL** - It fixes 400 errors when requesting translator role
- Migration 003 (seed data) is optional - skip for production databases
- Migrations 017 and 018 are optional but recommended for new features
- If you encounter "already exists" errors, the migration was already run - skip to the next one

## System Overview

### User Roles (6-tier hierarchy)
1. **reader** - Default role for new users (can comment, review, rate, nominate)
2. **translator** - Can upload novels and edit own novels (requires verification)
3. **admin** - Full permissions (legacy role)
4. **super_admin** - Full permissions including delete users and manage all admin roles
5. **sub_admin** - Limited permissions (ban/unban regular users only)

**Note:** The `pending_approval` role has been deprecated. New users are auto-assigned `reader` role.

### Key Tables
- `users` - User accounts with roles and ban status
- `novels` - Novel information with approval workflow
- `tags` - Genre/category tags
- `novel_tags` - Many-to-many relationship
- `ratings` - Star ratings (1-5)
- `comments` - User comments (supports threading and anonymous posts)
- `reviews` - Detailed reviews (supports anonymous posts)
- `nominations` - User votes for favorites (supports anonymous)
- `reports` - Content violation reports
- `likes` - Like/dislike votes for comments and reviews
- `role_upgrade_requests` - Requests to upgrade roles (with verification for translator)

### Key Features
- **Anonymous Posts** - Users can post comments/reviews/nominations anonymously
- **Threaded Comments** - Comments support nested replies (1 level deep)
- **Role Verification** - Translator role requires website/Wattpad link and proof image
- **Admin Hierarchy** - Different admin levels with different permissions
- **Extra Chapters** - Novels can have separate count for extra/bonus chapters

## Initial Setup

After running all migrations, you'll need to create your first admin user:

### Create Super Admin User

1. Sign up for an account through the application
2. Run this SQL in Supabase SQL Editor:

```sql
-- Replace with your email
UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

### Optional: Approve Existing Novels

If you have existing novels that need approval:

```sql
UPDATE novels SET is_approved = true WHERE is_approved = false;
```

## Troubleshooting

### Error: "relation already exists"
- This means the migration was already run. Skip to the next migration.

### Error: "permission denied"
- Make sure you're logged in as the database owner or have sufficient privileges.

### Error: "column already exists"
- The migration may have been partially run. Check which columns exist and manually run the remaining parts.

### Error: "infinite recursion detected in policy"
- This is a critical error! Run migration **016_cleanup_duplicate_policies.sql** immediately.
- If that doesn't work, run this emergency fix:

```sql
-- EMERGENCY FIX: Remove all policies on users table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Disable and re-enable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "allow_all_select"
ON users FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_own_update"
ON users FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## Migration History

This database has gone through several iterations:
- **v1.0** (001-003): Initial schema with basic features
- **v2.0** (004-010): RBAC system with 4 roles
- **v3.0** (011-015): Enhanced features (role upgrades, admin hierarchy, extra chapters)
- **v3.1** (016): Critical bug fixes for RLS policies
- **v4.0** (017-018): New features (anonymous posts, threaded comments)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the migration file comments for details
3. Check the main project README.md for application setup

