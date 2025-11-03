# Migration Guide: Local JSON to Supabase

This guide explains how to migrate your existing novel data from `data/novels.json` to Supabase.

## Overview

The application now supports **both** local JSON and Supabase backends:
- If Supabase is configured, it will use the cloud database
- If Supabase is not configured or fails, it falls back to local JSON

## Prerequisites

1. Complete the [Supabase Setup](SUPABASE_SETUP.md) first
2. Have your existing `data/novels.json` file ready
3. Have created an admin user in Supabase

## Migration Steps

### Step 1: Prepare Your Data

1. Open `data/novels.json`
2. Review the structure of your novels
3. Note the following mappings:

| JSON Field | Supabase Field |
|------------|----------------|
| `title` | `title` |
| `author` | `author_name` |
| `editor` | `editor_name` |
| `chapters` | `chapter_count` |
| `genres` | Tags (via `novel_tags` table) |
| `status` | `status` (enum: 'ongoing', 'completed', 'hiatus') |
| `lastUpdate` | `updated_at` |
| `rating` | Calculated from `ratings` table |
| `votes` | Count from `ratings` or `nominations` table |

### Step 2: Create Migration Script

Create a file `migrate-data.sql` with the following template:

```sql
-- Replace 'YOUR_ADMIN_USER_ID' with your actual admin user ID

-- Insert novels
INSERT INTO novels (
    title,
    author_name,
    editor_name,
    chapter_count,
    summary,
    status,
    is_approved,
    created_by
) VALUES
    ('Novel Title 1', 'Author 1', 'Editor 1', 100, 'Summary...', 'ongoing', true, 'YOUR_ADMIN_USER_ID'),
    ('Novel Title 2', 'Author 2', 'Editor 2', 50, 'Summary...', 'completed', true, 'YOUR_ADMIN_USER_ID');
-- Add more novels as needed

-- Get tag IDs for assignment
-- First, check available tags:
SELECT id, name FROM tags;

-- Then assign tags to novels
-- Example: Assign "Huyền huyễn" and "Tu tiên" to first novel
INSERT INTO novel_tags (novel_id, tag_id)
SELECT 
    n.id,
    t.id
FROM novels n
CROSS JOIN tags t
WHERE n.title = 'Novel Title 1'
  AND t.name IN ('Huyền huyễn', 'Tu tiên');
```

### Step 3: Convert JSON to SQL

You can use this JavaScript helper to convert your JSON data:

```javascript
// Run this in browser console on a page with your novels.json loaded
const novels = /* paste your novels array here */;

const sql = novels.map(novel => {
    const title = novel.title.replace(/'/g, "''");
    const author = novel.author.replace(/'/g, "''");
    const editor = novel.editor.replace(/'/g, "''");
    const chapters = novel.chapters;
    const status = novel.status === 'Hoàn thành' ? 'completed' : 'ongoing';
    
    return `('${title}', '${author}', '${editor}', ${chapters}, '', '${status}', true, 'YOUR_ADMIN_USER_ID')`;
}).join(',\n    ');

console.log(`INSERT INTO novels (title, author_name, editor_name, chapter_count, summary, status, is_approved, created_by) VALUES\n    ${sql};`);
```

### Step 4: Run Migration

1. Go to Supabase SQL Editor
2. Paste your migration SQL
3. Replace `'YOUR_ADMIN_USER_ID'` with your actual admin user ID
4. Click "Run"
5. Verify the data was inserted:

```sql
SELECT * FROM novels_with_stats;
```

### Step 5: Migrate Ratings/Votes

If you want to preserve ratings and votes:

```sql
-- For each novel, create sample ratings
-- Replace novel_id and user_id with actual values

INSERT INTO ratings (novel_id, user_id, rating)
VALUES 
    ('novel-uuid-1', 'user-uuid-1', 5),
    ('novel-uuid-1', 'user-uuid-2', 4);

-- Or create nominations for vote counts
INSERT INTO nominations (novel_id, user_id)
VALUES 
    ('novel-uuid-1', 'user-uuid-1'),
    ('novel-uuid-1', 'user-uuid-2');
```

### Step 6: Test the Migration

1. Open your application in a browser
2. Check the browser console for any errors
3. Verify that novels are loading from Supabase
4. Check that rankings are calculated correctly
5. Test search functionality

### Step 7: Verify Data Integrity

Run these queries in Supabase SQL Editor:

```sql
-- Check novel count
SELECT COUNT(*) FROM novels;

-- Check novels with tags
SELECT 
    n.title,
    ARRAY_AGG(t.name) as tags
FROM novels n
LEFT JOIN novel_tags nt ON n.id = nt.novel_id
LEFT JOIN tags t ON nt.tag_id = t.id
GROUP BY n.id, n.title;

-- Check novels with stats
SELECT 
    title,
    avg_rating,
    rating_count,
    nomination_count
FROM novels_with_stats
ORDER BY avg_rating DESC;
```

## Troubleshooting

### Issue: Novels not appearing

**Solution:**
- Check that `is_approved = true` for all novels
- Verify RLS policies are set up correctly
- Check browser console for errors

### Issue: Tags not showing

**Solution:**
- Verify tags exist in the `tags` table
- Check `novel_tags` junction table has correct mappings
- Run: `SELECT * FROM novels_with_stats` to see if tags are in the view

### Issue: Ratings showing as 0

**Solution:**
- Insert some sample ratings in the `ratings` table
- Or insert nominations in the `nominations` table
- The view will automatically calculate averages

### Issue: "Permission denied" errors

**Solution:**
- Make sure you're logged in as admin
- Check RLS policies in Supabase dashboard
- Verify your user has `role = 'admin'` in the `users` table

## Rollback Plan

If you need to rollback to local JSON:

1. Keep your `data/novels.json` file as backup
2. The application automatically falls back to JSON if Supabase fails
3. To force JSON mode, comment out the Supabase config in `js/config.js`:

```javascript
// const SUPABASE_URL = 'your-url';
// const SUPABASE_ANON_KEY = 'your-key';
```

## Post-Migration Tasks

After successful migration:

1. **Backup your data:**
   - Export from Supabase regularly
   - Keep `data/novels.json` as a backup

2. **Set up monitoring:**
   - Check Supabase dashboard for usage
   - Monitor error logs

3. **Update documentation:**
   - Document your custom tags
   - Note any special configurations

4. **Train users:**
   - Show admins how to use the admin dashboard
   - Explain the new authentication system

## Next Steps

1. **Add more novels:** Use the admin dashboard or SQL Editor
2. **Invite users:** Share the registration page
3. **Enable features:** Implement comments, reviews, ratings UI
4. **Customize:** Modify the UI to match your branding

## Support

If you encounter issues during migration:
1. Check the browser console for detailed error messages
2. Review Supabase logs in the dashboard
3. Verify all migration SQL ran successfully
4. Test with a small dataset first before migrating all data

## Example: Complete Migration for One Novel

```sql
-- 1. Insert the novel
INSERT INTO novels (
    title,
    author_name,
    editor_name,
    chapter_count,
    summary,
    status,
    is_approved,
    created_by
) VALUES (
    'Đấu Phá Thương Khung',
    'Thiên Tàm Thổ Đậu',
    'Editor Name',
    1648,
    'Câu chuyện về Tiêu Viêm...',
    'completed',
    true,
    'your-admin-user-id'
) RETURNING id;

-- 2. Note the returned ID, then assign tags
INSERT INTO novel_tags (novel_id, tag_id)
SELECT 
    'returned-novel-id',
    id
FROM tags
WHERE name IN ('Huyền huyễn', 'Tu tiên', 'Dị giới');

-- 3. Add some ratings
INSERT INTO ratings (novel_id, user_id, rating)
VALUES 
    ('returned-novel-id', 'user-id-1', 5),
    ('returned-novel-id', 'user-id-2', 5),
    ('returned-novel-id', 'user-id-3', 4);

-- 4. Verify
SELECT * FROM novels_with_stats WHERE id = 'returned-novel-id';
```

This should show your novel with tags, average rating, and rating count!

