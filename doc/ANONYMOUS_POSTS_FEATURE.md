# ✅ Anonymous Posts Feature - Implementation Complete

## Overview
Users can now post comments, reviews, and nominations anonymously. When posting anonymously, their username is hidden from regular users (shown as "Ẩn danh" instead). Admins can still see the real user_id in the database for moderation purposes.

---

## Changes Made

### 1. Database Migration ✅

**File:** `supabase/migrations/017_anonymous_posts.sql`

Added `is_anonymous` boolean field to three tables:
- `comments.is_anonymous` (default: false)
- `reviews.is_anonymous` (default: false)
- `nominations.is_anonymous` (default: false)

Also created indexes for faster queries on anonymous posts.

**To apply this migration:**
1. Go to Supabase SQL Editor
2. Run the contents of `supabase/migrations/017_anonymous_posts.sql`

---

### 2. Database API Updates ✅

**File:** `js/database.js`

Updated three functions to accept `isAnonymous` parameter:

**Comments:**
```javascript
async create(novelId, content, isAnonymous = false)
```

**Reviews:**
```javascript
async upsert(novelId, reviewText, isAnonymous = false)
```

**Nominations:**
```javascript
async create(novelId, isAnonymous = false)
```

---

### 3. UI Updates ✅

**File:** `js/novel-modal.js`

#### Comment Display (renderComment function)
- Checks `comment.is_anonymous` field
- If true: displays "Ẩn danh" instead of username
- If true: hides role badge
- If false: displays normal username and role badge

#### Review Display (renderReview function)
- Checks `review.is_anonymous` field
- If true: displays "Ẩn danh" instead of username
- If true: hides role badge
- If false: displays normal username and role badge

#### Comment Form (renderCommentFooter function)
- Added checkbox: "Ẩn danh"
- Checkbox ID: `commentAnonymous`
- Positioned next to character count

#### Review Form (renderReviewFooter function)
- Added checkbox: "Ẩn danh"
- Checkbox ID: `reviewAnonymous`
- Positioned next to character count

#### Form Submission Handlers
- Comment form: reads `commentAnonymous` checkbox value and passes to `db.comments.create()`
- Review form: reads `reviewAnonymous` checkbox value and passes to `db.reviews.upsert()`
- Both forms reset the checkbox after successful submission

---

## How It Works

### For Regular Users:
1. When posting a comment or review, user can check the "Ẩn danh" checkbox
2. If checked, their username will be hidden from other users
3. The post will show "Ẩn danh" instead of their username
4. Their role badge will also be hidden

### For Admins:
- Admins can see the `user_id` field in the database
- This allows admins to identify the real user for moderation purposes
- The Reports tab in the admin panel can be used to moderate anonymous content

### For Nominations:
- Nominations are typically not displayed with usernames (they're just counts)
- The `is_anonymous` field is available for future features (e.g., showing top nominators)

---

## Testing Checklist

- [ ] Run migration `017_anonymous_posts.sql` in Supabase SQL Editor
- [ ] Test posting a comment with "Ẩn danh" checked
- [ ] Verify comment shows "Ẩn danh" instead of username
- [ ] Verify role badge is hidden for anonymous comments
- [ ] Test posting a comment without "Ẩn danh" checked
- [ ] Verify comment shows real username and role badge
- [ ] Test posting a review with "Ẩn danh" checked
- [ ] Verify review shows "Ẩn danh" instead of username
- [ ] Test posting a review without "Ẩn danh" checked
- [ ] Verify review shows real username and role badge
- [ ] Verify checkbox resets after successful submission

---

## Bug Fixes Included

### Fixed: Review Form Calling Non-Existent Function
**Problem:** Review form was calling `db.reviews.create()` which doesn't exist  
**Solution:** Changed to `db.reviews.upsert()` (the correct function)  
**File:** `js/novel-modal.js` line 525

---

## Next Steps

### Optional Enhancements (Not Required):
1. **Admin View Enhancement**: Add a special admin view in the Reports tab that shows real usernames for anonymous posts
2. **Nomination Display**: If you add a feature to show top nominators, respect the `is_anonymous` flag
3. **User Profile**: Show user's own anonymous posts in their profile (they can see their own posts even if anonymous)

---

## Files Modified

1. ✅ `supabase/migrations/017_anonymous_posts.sql` (NEW)
2. ✅ `js/database.js` (3 functions updated)
3. ✅ `js/novel-modal.js` (4 functions updated)

---

## Status: ✅ COMPLETE

The anonymous posts feature is fully implemented and ready for testing!

