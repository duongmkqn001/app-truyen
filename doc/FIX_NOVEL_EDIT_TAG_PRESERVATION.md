# Fix: Novel Edit Form Tag Preservation

## 🐛 Bug Description

**Problem:** When editing a novel in the admin dashboard, all existing tags were being deleted unless manually re-selected.

**Expected Behavior:**
- When the edit form loads, all existing tags should be pre-selected
- Users should only need to add new tags or remove unwanted tags
- Existing tags should be preserved by default when saving

**Actual (Buggy) Behavior:**
- Edit form loaded without any tags pre-selected
- Saving the form without manually re-selecting all original tags would delete them
- Users had to manually re-select all existing tags every time they edited any field

---

## 🔍 Root Cause Analysis

### **Issue 1: Missing Tag IDs in Database View**

The `novels_with_stats` view was returning:
- ✅ `tag_names` - Array of tag names
- ✅ `tag_colors` - Array of tag colors
- ❌ **Missing:** `tag_ids` - Array of tag IDs

**Why this caused the bug:**

The `editNovel()` function in `js/admin-ui.js` expected `novel.tags` to be an array of tag objects with `id`, `name`, and `color` properties:

```javascript
// Line 548 in admin-ui.js (OLD CODE)
renderEditTags(novel.tags || []);
```

But `novel.tags` was **undefined** because the view didn't include it!

The `renderEditTags()` function needs tag IDs to pre-select checkboxes:

```javascript
// Line 563 in admin-ui.js
const selectedTagIds = selectedTags.map(t => t.id);  // ❌ FAILS if tags don't have 'id'
```

Without tag IDs, `selectedTagIds` would be an empty array, so no checkboxes were checked.

---

## ✅ Solution

### **1. Updated Database View (Migration 022)**

**File:** `supabase/migrations/022_fix_novels_with_stats_tags.sql`

Added two new fields to the `novels_with_stats` view:

```sql
CREATE OR REPLACE VIEW novels_with_stats AS
SELECT 
    n.*,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as rating_count,
    COUNT(DISTINCT nom.id) as nomination_count,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
    ARRAY_AGG(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors,
    ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids,  -- ✅ NEW
    -- Also create a JSON array of tag objects for easier frontend use
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', t.id,
                'name', t.name,
                'color', t.color
            )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
    ) as tags  -- ✅ NEW
FROM novels n
LEFT JOIN ratings r ON n.id = r.novel_id
LEFT JOIN nominations nom ON n.id = nom.novel_id
LEFT JOIN novel_tags nt ON n.id = nt.novel_id
LEFT JOIN tags t ON nt.tag_id = t.id
GROUP BY n.id;
```

**What changed:**
- ✅ Added `tag_ids` - Array of tag UUIDs
- ✅ Added `tags` - JSON array of complete tag objects `[{id, name, color}, ...]`

**Benefits:**
- Frontend can now access tag IDs directly
- The `tags` JSON field provides complete tag objects in one field
- Backward compatible - old fields (`tag_names`, `tag_colors`) still exist

---

### **2. Updated Edit Function (JavaScript)**

**File:** `js/admin-ui.js` (Lines 518-571)

Updated the `editNovel()` function to handle both old and new data formats:

```javascript
async function editNovel(novelId) {
    try {
        // Load novel data
        const novelResult = await db.novels.getById(novelId);
        if (!novelResult.success) {
            showMessage('Không thể tải thông tin truyện', true);
            return;
        }

        const novel = novelResult.data;

        // Load all tags
        const tagsResult = await db.tags.getAll();
        if (tagsResult.success) {
            allTags = tagsResult.data;
        }

        // Populate form fields...
        document.getElementById('editNovelId').value = novel.id;
        document.getElementById('editTitle').value = novel.title || '';
        // ... (other fields)

        // ✅ NEW: Handle both old format and new format
        let selectedTags = [];
        if (novel.tags && Array.isArray(novel.tags)) {
            // New format: tags is a JSON array of tag objects
            selectedTags = novel.tags;
        } else if (novel.tag_ids && Array.isArray(novel.tag_ids)) {
            // Fallback: construct tag objects from tag_ids, tag_names, and tag_colors arrays
            selectedTags = novel.tag_ids.map((id, index) => ({
                id: id,
                name: novel.tag_names?.[index] || '',
                color: novel.tag_colors?.[index] || '#10b981'
            }));
        }
        
        console.log('Novel tags for editing:', selectedTags);
        renderEditTags(selectedTags);  // ✅ Now receives proper tag objects with IDs

        // Show modal
        document.getElementById('editNovelModal').classList.remove('hidden');

    } catch (error) {
        console.error('Error loading novel for edit:', error);
        showMessage('Lỗi khi tải thông tin truyện', true);
    }
}
```

**What changed:**
- ✅ Added logic to extract tags from the new `tags` JSON field
- ✅ Added fallback to construct tag objects from separate arrays (`tag_ids`, `tag_names`, `tag_colors`)
- ✅ Added console logging for debugging
- ✅ Backward compatible with old data format

---

## 📋 Files Modified

### Database Migration:
- ✅ `supabase/migrations/022_fix_novels_with_stats_tags.sql` - NEW
- ✅ `supabase/migrations/README.md` - Updated to document migration 022

### JavaScript:
- ✅ `js/admin-ui.js` - Updated `editNovel()` function (lines 518-571)

### Documentation:
- ✅ `doc/FIX_NOVEL_EDIT_TAG_PRESERVATION.md` - This file

---

## 🎯 How to Apply the Fix

### Step 1: Run Database Migration

**Option A: Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/022_fix_novels_with_stats_tags.sql`
4. Paste and click **Run**
5. Verify success message

**Option B: Supabase CLI**

```bash
supabase db push
```

### Step 2: Refresh Browser

1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
2. Reload the admin dashboard

### Step 3: Test the Fix

1. Go to `admin.html`
2. Click on the **"📚 Truyện"** (Novels) tab
3. Click **"Sửa"** (Edit) on any novel that has tags
4. **Verify:** All existing tags should now be checked ✅
5. Try editing a field (e.g., chapter count) without touching tags
6. Click **"Lưu thay đổi"** (Save changes)
7. **Verify:** Tags are still there after saving ✅

---

## ✅ Expected Results After Fix

### **Before Fix:**
```
Novel: "Ma Đạo Tổ Sư"
Tags: [Đam mỹ, Huyền huyễn, Tiên hiệp]

[Click Edit]
Edit Form:
  ☐ Đam mỹ          ❌ NOT CHECKED
  ☐ Huyền huyễn     ❌ NOT CHECKED
  ☐ Tiên hiệp       ❌ NOT CHECKED

[Save without re-selecting]
Result: Tags deleted! ❌
```

### **After Fix:**
```
Novel: "Ma Đạo Tổ Sư"
Tags: [Đam mỹ, Huyền huyễn, Tiên hiệp]

[Click Edit]
Edit Form:
  ☑ Đam mỹ          ✅ CHECKED
  ☑ Huyền huyễn     ✅ CHECKED
  ☑ Tiên hiệp       ✅ CHECKED

[Save without changing tags]
Result: Tags preserved! ✅
```

---

## 🔍 Technical Details

### **Database View Structure (After Fix)**

```sql
SELECT * FROM novels_with_stats WHERE id = 'some-uuid';
```

**Returns:**
```json
{
  "id": "uuid",
  "title": "Ma Đạo Tổ Sư",
  "author_name": "Mặc Hương Đồng Khứu",
  "tag_names": ["Đam mỹ", "Huyền huyễn", "Tiên hiệp"],
  "tag_colors": ["#ec4899", "#8b5cf6", "#3b82f6"],
  "tag_ids": ["uuid1", "uuid2", "uuid3"],  // ✅ NEW
  "tags": [  // ✅ NEW
    {"id": "uuid1", "name": "Đam mỹ", "color": "#ec4899"},
    {"id": "uuid2", "name": "Huyền huyễn", "color": "#8b5cf6"},
    {"id": "uuid3", "name": "Tiên hiệp", "color": "#3b82f6"}
  ]
}
```

### **Frontend Tag Rendering**

The `renderEditTags()` function now receives proper tag objects:

```javascript
function renderEditTags(selectedTags) {
    const container = document.getElementById('editTagsContainer');
    
    // Extract tag IDs from tag objects
    const selectedTagIds = selectedTags.map(t => t.id);  // ✅ NOW WORKS
    
    container.innerHTML = allTags.map(tag => {
        const isSelected = selectedTagIds.includes(tag.id);  // ✅ PROPERLY CHECKS
        return `
            <label class="inline-flex items-center mr-4 mb-2 cursor-pointer">
                <input type="checkbox"
                       class="edit-tag-checkbox mr-2 rounded"
                       value="${tag.id}"
                       ${isSelected ? 'checked' : ''}>  <!-- ✅ CHECKED IF SELECTED -->
                <span class="px-3 py-1 rounded-full text-sm" 
                      style="background-color: ${tag.color}20; color: ${tag.color};">
                    ${tag.name}
                </span>
            </label>
        `;
    }).join('');
}
```

---

## 🎉 Status: FIXED

- ✅ **Database view updated** - Now includes `tag_ids` and `tags` JSON
- ✅ **Edit function updated** - Properly extracts and uses tag IDs
- ✅ **Backward compatible** - Works with both old and new data formats
- ✅ **Tags preserved** - Existing tags are pre-selected in edit form
- ✅ **User-friendly** - No need to manually re-select all tags when editing

**Test the fix and confirm that editing a novel now preserves all existing tags!** 🚀

