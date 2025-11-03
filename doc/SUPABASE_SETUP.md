# Supabase Setup Guide

This guide will help you set up Supabase for the Vietnamese Novel Platform.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Basic understanding of SQL and JavaScript

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Vietnamese Novel Platform (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Run Database Migrations

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration
5. Repeat for `002_rls_policies.sql` and `003_seed_data.sql`

Alternatively, if you have the Supabase CLI installed:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Configure the Application

1. Open `js/config.js` in your code editor
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Step 5: Create Your First Admin User

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click "Add user" → "Create new user"
4. Fill in:
   - **Email**: your admin email
   - **Password**: choose a strong password
   - **Auto Confirm User**: ✓ (check this box)
5. Click "Create user"
6. Copy the **User UID** (you'll need this)

7. Go to **SQL Editor** and run this query to make the user an admin:

```sql
-- Replace 'USER_UID_HERE' with the actual UID you copied
INSERT INTO users (id, username, role, is_banned)
VALUES ('USER_UID_HERE', 'admin', 'admin', false)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Step 6: Seed Initial Data (Optional)

If you want to migrate your existing novels from `data/novels.json`:

1. Open `supabase/migrations/003_seed_data.sql`
2. Uncomment the INSERT statements
3. Replace `'ADMIN_USER_ID'` with your admin user's UID
4. Run the SQL in the SQL Editor
5. Uncomment and run the tag assignment queries

## Step 7: Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - Enable "Enable email confirmations" if you want users to verify their email
   - Or disable it for easier testing
3. Under **Site URL**, add your application URL (e.g., `http://localhost:8000`)
4. Under **Redirect URLs**, add:
   - `http://localhost:8000/index.html`
   - Your production URL when deploying

## Step 8: Test the Application

1. Start a local web server:
```bash
python -m http.server 8000
# or
npx serve
```

2. Open `http://localhost:8000` in your browser
3. Try the following:
   - Browse novels (should work without login)
   - Click "Đăng nhập" to test authentication
   - Register a new user
   - Login with your admin account
   - Access admin features

## Step 9: Enable Row Level Security (RLS)

The RLS policies are already created in the migration files. Verify they're enabled:

1. Go to **Database** → **Tables**
2. For each table, click the table name
3. Go to the **Policies** tab
4. Verify that policies are listed and enabled

## Step 10: Set Up Storage (Optional)

If you want to allow users to upload novel cover images:

1. Go to **Storage** in the Supabase dashboard
2. Click "Create a new bucket"
3. Name it `novel-covers`
4. Set it to **Public** if you want images to be publicly accessible
5. Add storage policies for upload/delete permissions

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct anon key from Settings → API
- Make sure there are no extra spaces or quotes

### "User already registered" error
- The email is already in use
- Try a different email or delete the user from Authentication → Users

### RLS policies blocking queries
- Make sure you're logged in when performing authenticated actions
- Check the browser console for detailed error messages
- Verify policies in the Supabase dashboard

### Cannot create admin user
- Make sure you ran all migration files in order
- Check that the users table exists in Database → Tables
- Verify the user UID is correct (no quotes in the SQL query)

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Enable email confirmation for new users
- [ ] Set up proper CORS settings in Supabase
- [ ] Add your production domain to allowed redirect URLs
- [ ] Review and test all RLS policies
- [ ] Enable rate limiting in Supabase settings
- [ ] Set up database backups
- [ ] Monitor usage and set up alerts

## Next Steps

1. **Customize the UI**: Modify the HTML/CSS to match your branding
2. **Add more features**: Implement the reader features (comments, ratings, reviews)
3. **Build admin dashboard**: Create admin pages for content management
4. **Deploy**: Host on Vercel, Netlify, or your preferred platform
5. **Monitor**: Set up error tracking and analytics

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Consult the Supabase documentation
4. Ask in the Supabase Discord community

