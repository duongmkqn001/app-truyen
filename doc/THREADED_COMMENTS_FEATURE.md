# ✅ Threaded Comment Replies Feature - Implementation Complete

## Overview
Users can now reply to comments, creating nested comment threads. Replies are displayed in a collapsible/expandable format to keep the UI clean. Each comment has a "Trả lời" (Reply) button, and replies are indented to show the thread hierarchy.

---

## Changes Made

### 1. Database Migration ✅

**File:** `supabase/migrations/018_threaded_comments.sql`

Added `parent_comment_id` field to comments table:
- `comments.parent_comment_id` (UUID, nullable, references comments.id)
- If NULL: top-level comment
- If set: reply to another comment
- ON DELETE CASCADE: deleting a comment also deletes all its replies

Also created:
- Index on `parent_comment_id` for faster queries
- View `comments_with_reply_count` to get reply counts

**To apply this migration:**
1. Go to Supabase SQL Editor
2. Run the contents of `supabase/migrations/018_threaded_comments.sql`

---

### 2. Database API Updates ✅

**File:** `js/database.js`

#### Updated Function:
```javascript
async create(novelId, content, isAnonymous = false, parentCommentId = null)
```
- Added `parentCommentId` parameter (optional, default: null)
- When set, creates a reply to the specified comment

#### New Function:
```javascript
async getReplies(commentId)
```
- Gets all replies for a specific comment
- Returns replies sorted by creation date (ascending)
- Only returns non-flagged replies

---

### 3. UI Updates ✅

**File:** `js/novel-modal.js`

#### Comment Display (renderComment function)
- Added `isReply` parameter to distinguish replies from top-level comments
- Replies are indented with `ml-8` (margin-left)
- Added "💬 Trả lời" button (only on top-level comments, not on replies)
- Added hidden reply form for each comment
- Added replies container to display nested replies
- Added toggle button container for show/hide functionality

#### Reply Form
Each comment now has an inline reply form (hidden by default) with:
- Textarea for reply content (max 500 characters)
- Anonymous checkbox
- Cancel and Submit buttons

#### Load Comments (loadComments function)
- Filters to show only top-level comments (no parent_comment_id)
- Calls `loadAllReplies()` after rendering comments

#### New Functions:

**toggleReplyForm(commentId)**
- Shows/hides the reply form for a comment
- Focuses on textarea when showing

**cancelReply(commentId)**
- Hides reply form
- Clears textarea and anonymous checkbox

**submitReply(parentCommentId)**
- Submits reply to database
- Calls `db.comments.create()` with parentCommentId
- Reloads replies after successful submission

**loadReplies(commentId)**
- Loads all replies for a specific comment
- Renders replies (initially hidden)
- Creates toggle button showing reply count

**toggleReplies(commentId)**
- Shows/hides replies for a comment
- Updates button text:
  - Hidden: "▶ Xem X câu trả lời"
  - Visible: "▼ Ẩn X câu trả lời"

**loadAllReplies()**
- Loads replies for all top-level comments
- Called automatically after loading comments

---

## How It Works

### For Users:

1. **Viewing Comments:**
   - Top-level comments are displayed normally
   - If a comment has replies, a "▶ Xem X câu trả lời" button appears
   - Click the button to expand/collapse replies
   - Replies are indented to show hierarchy

2. **Replying to Comments:**
   - Click "💬 Trả lời" button on any top-level comment
   - A reply form appears below the comment
   - Type your reply (max 500 characters)
   - Optionally check "Ẩn danh" to post anonymously
   - Click "Gửi" to submit or "Hủy" to cancel

3. **Reply Limitations:**
   - Only 1 level of nesting (replies to replies are not allowed)
   - This keeps the UI clean and prevents deep nesting

### Default State:
- All reply forms are hidden
- All reply threads are collapsed
- Users must click to expand replies

---

## UI Design

### Top-Level Comment:
```
┌─────────────────────────────────────┐
│ Username [Role Badge]    Date       │
│ Comment content here...             │
│ 👍 10  👎 2  💬 Trả lời  🚩 Báo cáo │
│                                     │
│ [Hidden Reply Form]                 │
│                                     │
│ ▶ Xem 3 câu trả lời                │
└─────────────────────────────────────┘
```

### Expanded Replies:
```
┌─────────────────────────────────────┐
│ Username [Role Badge]    Date       │
│ Comment content here...             │
│ 👍 10  👎 2  💬 Trả lời  🚩 Báo cáo │
│                                     │
│ ▼ Ẩn 3 câu trả lời                 │
│   ┌─────────────────────────────┐  │
│   │ Reply User    Date          │  │
│   │ Reply content...            │  │
│   │ 👍 2  👎 0  🚩 Báo cáo      │  │
│   └─────────────────────────────┘  │
│   ┌─────────────────────────────┐  │
│   │ Another Reply...            │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Run migration `018_threaded_comments.sql` in Supabase SQL Editor
- [ ] Test posting a top-level comment
- [ ] Verify "💬 Trả lời" button appears on top-level comments
- [ ] Click "Trả lời" and verify reply form appears
- [ ] Test posting a reply
- [ ] Verify reply appears indented below parent comment
- [ ] Verify toggle button shows correct reply count
- [ ] Test expanding/collapsing replies
- [ ] Verify button text changes (▶/▼)
- [ ] Test posting anonymous reply
- [ ] Verify anonymous reply shows "Ẩn danh"
- [ ] Test canceling reply
- [ ] Verify form clears and hides
- [ ] Verify replies do NOT have "Trả lời" button (no nested replies)
- [ ] Test deleting a parent comment
- [ ] Verify all replies are also deleted (CASCADE)

---

## Technical Details

### Database Schema:
```sql
ALTER TABLE comments
ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
```

### Query for Top-Level Comments:
```javascript
comments.filter(c => !c.parent_comment_id)
```

### Query for Replies:
```javascript
SELECT * FROM comments 
WHERE parent_comment_id = 'comment-id' 
ORDER BY created_at ASC
```

### Cascade Delete:
When a parent comment is deleted, all its replies are automatically deleted due to `ON DELETE CASCADE`.

---

## Future Enhancements (Optional)

1. **Reply Notifications**: Notify users when someone replies to their comment
2. **@Mentions**: Allow users to mention other users in replies
3. **Deeper Nesting**: Allow replies to replies (2-3 levels max)
4. **Reply Count Badge**: Show reply count on the "Trả lời" button
5. **Sort Replies**: Add option to sort replies by date or likes

---

## Files Modified

1. ✅ `supabase/migrations/018_threaded_comments.sql` (NEW)
2. ✅ `js/database.js` (2 functions updated, 1 function added)
3. ✅ `js/novel-modal.js` (6 functions updated/added)

---

## Status: ✅ COMPLETE

The threaded comment replies feature is fully implemented and ready for testing!

**Priority 3 is now 100% complete!** ✅
- ✅ Feature 10: Anonymous Comments/Nominations
- ✅ Feature 11: Threaded Comment Replies

