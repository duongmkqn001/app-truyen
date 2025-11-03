# 📚 Vietnamese Novel Platform (App Truyện)

A modern, responsive web application for managing and browsing Vietnamese novels with cloud database backend powered by Supabase.

## ✨ Features

### 🎨 User Interface
- **Responsive Design**: Mobile-first design with hamburger menu for mobile devices
- **Pastel Mint Green Theme**: Beautiful, easy-on-the-eyes color scheme
- **Three-Column Layout**: Navigation sidebar, main content, and rankings sidebar
- **Real-time Search**: Instant search filtering by novel title
- **Rankings Display**: Top novels with special styling for top 3

### 👤 User Features
- **Authentication**: Email/password registration and login
- **User Profiles**: Personalized user accounts
- **Rate Novels**: 1-5 star rating system
- **Write Reviews**: Detailed reviews for novels
- **Comment System**: Discuss novels with other readers
- **Nominate Favorites**: Vote for your favorite novels
- **Report Content**: Flag inappropriate content

### 🛡️ Admin Features
- **User Management**: Ban/unban users, change roles
- **Novel Management**: Approve, edit, delete novels
- **Content Moderation**: Review and resolve reports
- **Statistics Dashboard**: View platform metrics
- **Tag Management**: Organize novels by genres/tags

### 🗄️ Database
- **Supabase Backend**: PostgreSQL database with real-time capabilities (REQUIRED)
- **Row Level Security**: Secure data access at the database level
- **Automatic Backups**: Built-in Supabase backup system
- **Cloud-Only**: All data loaded from Supabase (no local data fallback)

## 🚀 Quick Start

### Prerequisites
- A modern web browser
- Internet connection (for Supabase and CDN resources)
- A Supabase account (free tier available)

### ⚡ Static File Usage (No Server Required!)

This application can be opened directly in your browser without any web server:

1. **Configure Supabase** (see step 2-3 below)
2. **Double-click `index.html`** to open in your browser
3. That's it! No localhost, no installation needed.

See [STATIC_FILE_GUIDE.md](STATIC_FILE_GUIDE.md) for detailed instructions on using the app as static files.

### 🖥️ Traditional Setup (Optional)

If you prefer to use a local web server (optional):

1. **Clone or download this repository**

2. **Set up Supabase** (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
   - Create a Supabase project
   - Run the database migrations
   - Get your API credentials

3. **Configure the application**
   - Open `js/config.js`
   - Replace the placeholder values with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

4. **Open the application**

   **Option A: Direct file access (Recommended)**
   - Simply double-click `index.html`
   - No server needed!

   **Option B: Local web server**
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8000
   ```
   Then navigate to `http://localhost:8000`

5. **Create your first admin user** (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md#step-5-create-your-first-admin-user))

## 📁 Project Structure

```
├── index.html              # Main page
├── auth.html               # Login/register page
├── admin.html              # Admin dashboard
├── styles.css              # Custom styles
├── script.js               # Main application logic
├── js/
│   ├── config.js           # Supabase configuration
│   ├── database.js         # Database service layer
│   ├── admin.js            # Admin service functions
│   ├── auth-ui.js          # Authentication UI logic
│   ├── main-ui.js          # Main page UI logic
│   └── admin-ui.js         # Admin dashboard UI logic
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Database schema
│       ├── 002_rls_policies.sql      # Security policies
│       └── 003_seed_data.sql         # Initial data
├── data/
│   └── novels.json         # Fallback local data
├── SUPABASE_SETUP.md       # Supabase setup guide
├── MIGRATION_GUIDE.md      # Data migration guide
└── README.md               # This file
```

## 🗃️ Database Schema

### Main Tables
- **users**: User accounts with roles (reader/admin)
- **novels**: Novel information (title, author, editor, chapters, etc.)
- **tags**: Genre/category tags
- **novel_tags**: Many-to-many relationship between novels and tags
- **ratings**: User ratings for novels (1-5 stars)
- **comments**: User comments on novels
- **reviews**: Detailed user reviews
- **nominations**: User votes for favorite novels
- **reports**: Content violation reports

### Views
- **novels_with_stats**: Aggregated view with ratings, nominations, and tags

## 🔐 Security

- **Row Level Security (RLS)**: All tables have RLS policies
- **Authentication**: Supabase Auth with email/password
- **Role-Based Access**: Admin vs. Reader permissions
- **Input Validation**: Client-side and database-level validation
- **XSS Protection**: Proper escaping of user-generated content

## 📖 Usage Guide

### For Readers

1. **Browse Novels**: Visit the homepage to see all approved novels
2. **Search**: Use the search bar to find novels by title
3. **Register**: Click "Đăng nhập" → "Đăng ký" to create an account
4. **Rate & Review**: Login to rate novels and write reviews
5. **Nominate**: Vote for your favorite novels

### For Admins

1. **Access Admin Dashboard**: Login with admin account, click "Quản trị"
2. **Manage Users**: View all users, ban/unban accounts
3. **Approve Novels**: Review and approve submitted novels
4. **Moderate Content**: Review reports and take action
5. **View Statistics**: Monitor platform growth and activity

## 🔧 Configuration

### Supabase Settings

Edit `js/config.js`:
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-anon-key';

const CONFIG = {
    PAGINATION_LIMIT: 100,
    MAX_COMMENT_LENGTH: 1000,
    MAX_REVIEW_LENGTH: 5000,
    // ... more settings
};
```

### Styling

The application uses Tailwind CSS with custom styles in `styles.css`. Main color scheme:
- Primary: `#059669` (Green 600)
- Background: Gradient from `#f0fdf4` to `#f0fdfa`
- Accents: Various shades of green, mint, and teal

## 🚢 Deployment

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel or Netlify
3. Set build command: (none needed for static site)
4. Set publish directory: `.` (root)
5. Add environment variables if needed
6. Deploy!

### Update Supabase Settings

After deployment:
1. Go to Supabase Dashboard → Authentication → Settings
2. Add your production URL to "Site URL"
3. Add redirect URLs for authentication

## 📊 Data Migration

To migrate existing data from `data/novels.json` to Supabase:

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed instructions.

## 🐛 Troubleshooting

### Novels not loading
- Check browser console for errors
- Verify Supabase credentials in `js/config.js`
- Check if Supabase project is active
- Verify internet connection
- Check that database has data (use Supabase dashboard)
- **Note**: There is no fallback to local JSON - Supabase is required

### Authentication not working
- Verify Supabase Auth is enabled
- Check redirect URLs in Supabase settings
- Clear browser cache and cookies

### Admin dashboard not accessible
- Ensure your user has `role = 'admin'` in the users table
- Check that you're logged in
- Verify RLS policies are set up correctly

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Supabase**: For the amazing backend-as-a-service platform
- **Tailwind CSS**: For the utility-first CSS framework
- **Vietnamese Novel Community**: For inspiration and feedback

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. Check browser console for error messages
4. Review Supabase logs in the dashboard

## 🗺️ Roadmap

- [ ] Novel detail pages with full content
- [ ] Advanced search with filters
- [ ] User profiles with reading history
- [ ] Reading progress tracking
- [ ] Bookmarks and favorites
- [ ] Email notifications
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

## 📈 Version History

### v2.0.0 (Current)
- ✅ Supabase integration
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Rating and nomination system
- ✅ Responsive design improvements

### v1.0.0
- ✅ Basic novel listing
- ✅ Local JSON database
- ✅ Search functionality
- ✅ Responsive layout

---

Made with ❤️ for the Vietnamese novel reading community

