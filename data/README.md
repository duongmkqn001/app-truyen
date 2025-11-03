# Data Directory

## ⚠️ Important Notice

The `novels.json` file in this directory is **NO LONGER USED** by the application.

## Migration to Supabase

This application now uses **Supabase** as the exclusive cloud database backend. All novel data, rankings, user information, and other content are stored in and loaded from Supabase.

### What Changed

- **Before**: Data was loaded from `data/novels.json` (local file)
- **After**: Data is loaded from Supabase (cloud database)

### Why This File Still Exists

This file is kept for reference purposes only:
- Historical backup of initial data
- Reference for data structure
- Migration reference

### How to Use the Application

1. **Configure Supabase**: Edit `js/config.js` with your Supabase credentials
2. **Set up Database**: Run the SQL migrations in `supabase/migrations/`
3. **Add Data**: Use the admin dashboard or SQL Editor to add novels

### If You Need the Old Data

If you want to migrate the data from `novels.json` to Supabase, see the [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) in the root directory.

### Can I Delete This File?

Yes, you can safely delete `novels.json` if you:
- Have already migrated your data to Supabase
- Don't need it as a backup reference
- Are starting fresh with Supabase

## Current Data Source

**All data is now loaded from Supabase cloud database.**

The application will show an error message if Supabase is not configured or if the connection fails. There is no fallback to local JSON files.

---

For more information, see:
- [README.md](../README.md) - Main project documentation
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) - How to set up Supabase
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - How to migrate data

