# Database Migrations

This folder contains SQL migration files for the Vietnamese Novel Platform database.

## Migration Files

### If You Already Ran Migrations 001, 002, 003:
**Just run these two files to add RBAC:**
1. **004_rbac_system_fixed.sql** - Adds 4-tier role system, new tables, approval workflow
2. **005_rbac_policies_fixed.sql** - Adds RLS policies for the new RBAC system

### If Starting Fresh (New Database):
Run all migrations in order:
1. **001_initial_schema.sql** - Initial database schema (users, novels, tags, etc.)
2. **002_rls_policies.sql** - Row Level Security policies
3. **003_seed_data.sql** - Sample data for testing (optional - skip if you want empty database)
4. **004_rbac_system_fixed.sql** - Role-Based Access Control system (4-tier roles)
5. **005_rbac_policies_fixed.sql** - RLS policies for RBAC system

## How to Run Migrations

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the content of **`004_rbac_system_fixed.sql`**
5. Click **Run** (wait for success message)
6. Click **New Query** again
7. Copy and paste the content of **`005_rbac_policies_fixed.sql`**
8. Click **Run** (wait for success message)

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Important Notes

- **Run migrations in order** (001 → 002 → 003 → 004 → 005)
- Migration 003 (seed data) is optional - skip if you want to start with an empty database
- Migration 004 and 005 add the new RBAC system with 4 user roles
- After running migrations 004 and 005, you'll need to update existing users' roles manually if needed

## RBAC System Overview

The new RBAC system (migrations 004 & 005) introduces:

### User Roles
1. **pending_approval** - New users waiting for admin approval (read-only)
2. **reader** - Approved members (can comment, review, rate, upload novels for approval)
3. **translator** - Trusted users (auto-approved uploads, can edit own novels)
4. **admin** - Full access (approve/reject everything, moderate content)

### New Tables
- `translator_requests` - Requests to upgrade from reader to translator
- `likes` - Like/dislike votes for comments and reviews

### New Columns
- `novels.approval_status` - pending/approved/rejected
- `novels.rejected_reason` - Reason for rejection
- `comments.like_count`, `comments.dislike_count` - Engagement metrics
- `reviews.like_count`, `reviews.dislike_count` - Engagement metrics

## Updating Existing Data

After running migrations 004 and 005, you may want to:

1. **Update existing users to approved status:**
```sql
UPDATE users SET role = 'reader' WHERE role = 'pending_approval';
```

2. **Approve all existing novels:**
```sql
UPDATE novels SET approval_status = 'approved', is_approved = true WHERE approval_status = 'pending';
```

3. **Create an admin user:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Troubleshooting

### Error: "relation already exists"
- This means the migration was already run. Skip to the next migration.

### Error: "permission denied"
- Make sure you're logged in as the database owner or have sufficient privileges.

### Error: "column already exists"
- The migration may have been partially run. Check which columns exist and manually run the remaining parts.

## Rollback

If you need to rollback migrations, you can drop the tables/columns manually:

```sql
-- Rollback migration 005 (RLS policies)
DROP POLICY IF EXISTS ... ON ...;

-- Rollback migration 004 (RBAC system)
DROP TABLE IF EXISTS translator_requests CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
ALTER TABLE novels DROP COLUMN IF EXISTS approval_status;
-- etc.
```

**Note:** Be careful with rollbacks as they may result in data loss!

