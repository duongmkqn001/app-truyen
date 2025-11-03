# Vietnamese Novel Platform - RBAC System Documentation

## 📋 Overview

This is a comprehensive Vietnamese novel listing platform with a 4-tier role-based access control (RBAC) system, built with static HTML/CSS/JavaScript and Supabase backend.

---

## 🎯 Features Implemented

### ✅ 1. Four-Tier Role System

| Role | Vietnamese | Permissions |
|------|-----------|-------------|
| **Pending Approval** | Chờ duyệt | Read-only access (browse novels like a guest) |
| **Reader** | Độc giả | Comment, review, rate, upload novels (pending approval) |
| **Translator** | Dịch giả | All reader permissions + auto-approved uploads |
| **Admin** | Quản trị viên | Full access + approve/reject content |

### ✅ 2. Novel Upload System

**Manual Upload** (`upload.html`)
- Form-based single novel upload
- All required and optional fields
- Instant validation

**CSV Bulk Upload** (`upload.html`)
- Download CSV template with proper escaping
- Upload and preview before import
- Error reporting per row
- Handles commas and quotes in fields correctly

### ✅ 3. Search & Discovery

**Advanced Search** (`search.html`)
- Filter by: title, author, translator, status, tags, rating
- Sort by: newest, oldest, title, rating
- Pagination (12 items per page)
- Tag-based filtering (multi-select)

**Ranking System** (`ranking.html`)
- Time periods: All time, Year, Quarter, Month, Week
- Ranking types:
  - ⭐ Highest rated
  - 👁️ Most viewed (using rating count as proxy)
  - 🎯 Most nominated
  - 🆕 Newest
- Top 50 display with medal icons for top 3

### ✅ 4. Novel Detail Modal

**Tabbed Interface:**
- **Info Tab**: Full novel details, user rating widget
- **Comments Tab**: User comments with like/dislike
- **Reviews Tab**: Detailed reviews with like/dislike

**Interactive Features:**
- Star rating (1-5 stars, clickable)
- Like/dislike buttons (toggle logic)
- Report button for violations
- Real-time count updates

### ✅ 5. Admin Dashboard

**Six Management Tabs:**
1. **Pending Members** - Approve/reject new registrations
2. **Pending Novels** - Approve/reject reader uploads
3. **Translator Requests** - Approve/reject upgrade requests
4. **Users** - Manage all users, ban/unban
5. **Novels** - Manage all novels
6. **Reports** - Moderate reported content

### ✅ 6. Engagement System

**Like/Dislike:**
- Toggle logic (click again to remove)
- Switch between like/dislike
- Real-time count updates via triggers
- Works on comments and reviews

**Reports:**
- Report types: novel, comment, review, user
- Reason + details fields
- Admin moderation queue
- Resolve/dismiss actions

**Translator Requests:**
- Users can request translator role upgrade
- Message field for justification
- Admin approval workflow
- Automatic role update on approval

---

## 🗄️ Database Schema

### New Tables

**translator_requests**
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- request_message (TEXT)
- status (pending/approved/rejected)
- reviewed_by (UUID, FK → users)
- reviewed_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

**likes**
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- target_type (comment/review)
- target_id (UUID)
- is_like (BOOLEAN) - true=like, false=dislike
- created_at (TIMESTAMPTZ)
- UNIQUE(user_id, target_type, target_id)
```

### Updated Tables

**users**
- `role` enum: `pending_approval`, `reader`, `translator`, `admin`

**novels**
- `approval_status` (pending/approved/rejected)
- `approved_by` (UUID, FK → users)
- `approved_at` (TIMESTAMPTZ)
- `rejected_reason` (TEXT)

**comments & reviews**
- `like_count` (INTEGER)
- `dislike_count` (INTEGER)

**reports**
- `report_type` enum: `comment`, `review`, `novel`, `user`
- `details` (TEXT) - additional information

---

## 📁 File Structure

```
app-truyen/
├── index.html              # Home page
├── login.html              # Login/signup page
├── admin.html              # Admin dashboard
├── upload.html             # Manual & CSV upload
├── search.html             # Advanced search
├── ranking.html            # Ranking page
├── styles.css              # Global styles
│
├── js/
│   ├── config.js           # Supabase configuration
│   ├── database.js         # Database service layer
│   ├── script.js           # Home page logic
│   ├── components.js       # Reusable UI components
│   ├── novel-modal.js      # Novel detail modal
│   ├── admin-ui.js         # Admin dashboard logic
│   ├── upload.js           # Upload page logic
│   ├── search.js           # Search page logic
│   └── ranking.js          # Ranking page logic
│
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_rls_policies.sql
        ├── 003_seed_data.sql
        ├── 004_rbac_system_fixed.sql      # ⭐ RBAC schema
        ├── 005_rbac_policies_fixed.sql    # ⭐ RBAC policies
        └── README.md
```

---

## 🚀 Setup Instructions

### 1. Database Setup

Run migrations in Supabase SQL Editor in order:

```sql
-- If starting fresh:
1. 001_initial_schema.sql
2. 002_rls_policies.sql
3. 003_seed_data.sql (optional)
4. 004_rbac_system_fixed.sql
5. 005_rbac_policies_fixed.sql

-- If already have 001-003:
4. 004_rbac_system_fixed.sql
5. 005_rbac_policies_fixed.sql
```

### 2. Configure Supabase

Update `js/config.js`:
```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Create Admin User

After signup, run in Supabase SQL Editor:
```sql
UPDATE users 
SET role = 'admin' 
WHERE username = 'your-username';
```

### 4. Open Application

Simply open `index.html` in a web browser. No server needed!

---

## 🎨 Design Theme

**Pastel Mint Green Color Scheme:**
- Primary: `#10b981` (Green 600)
- Background: Gradient from green-50 to blue-50
- Accents: Soft pastels throughout
- Responsive: Mobile-first design with hamburger menu

---

## 🔐 Permission Matrix

| Feature | Pending | Reader | Translator | Admin |
|---------|---------|--------|------------|-------|
| Browse novels | ✅ | ✅ | ✅ | ✅ |
| View details | ✅ | ✅ | ✅ | ✅ |
| Comment | ❌ | ✅ | ✅ | ✅ |
| Review | ❌ | ✅ | ✅ | ✅ |
| Rate | ❌ | ✅ | ✅ | ✅ |
| Like/Dislike | ❌ | ✅ | ✅ | ✅ |
| Report | ❌ | ✅ | ✅ | ✅ |
| Upload novel | ❌ | ✅ (pending) | ✅ (auto-approved) | ✅ (auto-approved) |
| Request translator | ❌ | ✅ | ❌ | ❌ |
| Approve members | ❌ | ❌ | ❌ | ✅ |
| Approve novels | ❌ | ❌ | ❌ | ✅ |
| Approve translators | ❌ | ❌ | ❌ | ✅ |
| Moderate reports | ❌ | ❌ | ❌ | ✅ |
| Ban users | ❌ | ❌ | ❌ | ✅ |

---

## 📝 CSV Upload Format

**Template Headers:**
```csv
title,author_name,editor_name,chapter_count,summary,novel_url,cover_image_url,status
```

**Example Row:**
```csv
"Tên truyện","Tác giả","Người dịch",100,"Tóm tắt có thể có dấu phẩy, và ""dấu ngoặc kép""","https://example.com/novel","https://example.com/cover.jpg","Đang ra"
```

**Rules:**
- Required fields: `title`, `author_name`, `status`
- Status must be: `Đang ra`, `Hoàn thành`, or `Tạm ngưng`
- Fields with commas or quotes must be wrapped in quotes
- Quotes inside fields must be escaped as `""`
- UTF-8 encoding required

---

## 🔧 Key Functions

### Database Service (`js/database.js`)

```javascript
// Authentication
db.auth.signUp(email, password, username)
db.auth.signIn(email, password)
db.auth.getCurrentUser()
db.auth.getUserProfile(userId)

// Users
db.auth.getAllUsers()
db.auth.getPendingUsers()
db.auth.approveUser(userId)
db.auth.banUser(userId)

// Novels
db.novels.create(novelData)
db.novels.bulkCreate(novelsArray)
db.novels.getAll()
db.novels.getPending()
db.novels.approve(novelId)
db.novels.reject(novelId, reason)

// Translator Requests
db.translatorRequests.create(message)
db.translatorRequests.getAll()
db.translatorRequests.getPending()

// Likes
db.likes.toggle(targetType, targetId, isLike)
db.likes.getUserVote(targetType, targetId)

// Reports
db.reports.create(reportType, contentId, reason, details)
db.reports.getAll()
db.reports.getPending()
db.reports.resolve(reportId, action)
```

### UI Components (`js/components.js`)

```javascript
UIComponents.createRoleBadge(role)
UIComponents.createStarRating(rating, maxStars, interactive, novelId)
UIComponents.createLikeDislikeButtons(targetType, targetId, likeCount, dislikeCount, userVote)
UIComponents.createReportButton(targetType, targetId)
UIComponents.showToast(message, type)
```

---

## 🎯 User Workflows

### New User Registration
1. Sign up → Role: `pending_approval`
2. Admin approves → Role: `reader`
3. User can now interact with content

### Novel Upload (Reader)
1. Upload novel → Status: `pending`
2. Admin reviews and approves/rejects
3. If approved → Novel visible to all

### Translator Upgrade
1. Reader requests translator role
2. Provides justification message
3. Admin reviews and approves/rejects
4. If approved → Role: `translator`, future uploads auto-approved

### Content Moderation
1. User reports inappropriate content
2. Report appears in admin dashboard
3. Admin reviews and resolves/dismisses
4. Admin can ban users or delete content

---

## 🐛 Troubleshooting

**Issue: Email column errors**
- The `users` table doesn't have an `email` column
- Email is stored in `auth.users` (not accessible in queries)
- Use `username` instead

**Issue: Enum value errors**
- Make sure migrations 004 and 005 ran successfully
- Check enum values: `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;`

**Issue: Policy errors**
- Migration 004 drops all policies before altering enums
- Migration 005 recreates all policies (idempotent)

---

## 📊 Statistics & Views

The system includes optimized database views:

- `translator_requests_with_users` - Requests with user info
- `comments_with_engagement` - Comments with like/dislike counts
- `reviews_with_engagement` - Reviews with like/dislike counts

Automatic triggers update like/dislike counts in real-time.

---

## 🎉 Complete Feature List

✅ 4-tier role system with approval workflow
✅ Manual novel upload with form validation
✅ CSV bulk upload with preview and error handling
✅ Advanced search with multiple filters
✅ Ranking system with time periods
✅ Novel detail modal with tabs
✅ Star rating system (interactive)
✅ Like/dislike engagement system
✅ Report system for moderation
✅ Translator upgrade requests
✅ Admin dashboard with 6 management queues
✅ Role badges throughout UI
✅ Responsive design with mobile menu
✅ Toast notifications
✅ Loading overlays
✅ Pagination for search results
✅ Real-time count updates via triggers
✅ Row Level Security policies
✅ Static file deployment (no server needed)

---

## 📞 Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Supabase logs for database errors
3. Network tab for API call failures

---

**Built with ❤️ using Supabase, Tailwind CSS, and vanilla JavaScript**

