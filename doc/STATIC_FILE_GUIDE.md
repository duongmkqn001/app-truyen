# Static File Usage Guide

## 📄 Running as Static HTML Files

This application is designed to work as **static HTML files** that can be opened directly in a web browser without requiring a local web server (localhost).

## ✅ What This Means

You can:
- ✅ Open `index.html` directly in your browser (double-click the file)
- ✅ Use the `file://` protocol (e.g., `file:///C:/Users/YourName/Desktop/app%20truyen/index.html`)
- ✅ Share the files via USB drive, cloud storage, or email
- ✅ Run the application offline (after initial CDN resource loading)
- ✅ No need for Python, Node.js, or any web server

## 🌐 Requirements

### Internet Connection Required For:
1. **CDN Resources** (first load only):
   - Tailwind CSS: `https://cdn.tailwindcss.com`
   - Supabase Client: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

2. **Supabase Database** (always):
   - All data is loaded from Supabase cloud database
   - Authentication requires Supabase connection
   - No local data fallback

### Browser Requirements:
- Modern browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Cookies/LocalStorage enabled (for authentication)

## 🚀 How to Use

### Step 1: Configure Supabase

Before opening the files, you **must** configure Supabase:

1. Open `js/config.js` in a text editor
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
3. Save the file

### Step 2: Open in Browser

**Method 1: Double-click**
- Simply double-click `index.html`
- Your default browser will open the file

**Method 2: Drag and drop**
- Drag `index.html` into an open browser window

**Method 3: File menu**
- Open your browser
- Go to File → Open File
- Select `index.html`

### Step 3: Navigate the Application

Once opened, you can:
- Browse novels (if data exists in Supabase)
- Click "Đăng nhập" to go to authentication page
- Use the admin dashboard (if you're an admin)

## 📁 File Structure

All files use **relative paths**, so the folder structure must be maintained:

```
app truyen/
├── index.html          ← Main page (open this)
├── auth.html           ← Login/register page
├── admin.html          ← Admin dashboard
├── styles.css          ← Custom styles
├── script.js           ← Main logic
├── js/
│   ├── config.js       ← Supabase configuration (EDIT THIS!)
│   ├── database.js     ← Database service
│   ├── admin.js        ← Admin functions
│   ├── auth-ui.js      ← Auth UI logic
│   ├── main-ui.js      ← Main UI logic
│   └── admin-ui.js     ← Admin UI logic
├── data/
│   ├── novels.json     ← (NOT USED - kept for reference)
│   └── README.md       ← Info about data directory
└── supabase/
    └── migrations/     ← SQL files for database setup
```

## ⚠️ Important Notes

### 1. No Local Data
- The application **does not** use `data/novels.json`
- All data comes from Supabase cloud database
- If Supabase is not configured, you'll see an error message

### 2. Supabase Configuration is Mandatory
- You **must** configure `js/config.js` before using the app
- Without valid Supabase credentials, the app will not work
- See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for setup instructions

### 3. Browser Security
- Some browsers may show security warnings for `file://` protocol
- This is normal and safe for local files
- You may need to allow JavaScript execution

### 4. Authentication State
- Login state is stored in browser's LocalStorage
- Clearing browser data will log you out
- Each browser maintains separate login state

## 🔧 Troubleshooting

### Problem: "Chưa cấu hình Supabase" Error

**Solution:**
1. Open `js/config.js`
2. Make sure you've replaced `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY`
3. Verify the values are correct (no quotes issues, no extra spaces)
4. Refresh the page

### Problem: "Không thể tải dữ liệu từ Supabase" Error

**Solution:**
1. Check your internet connection
2. Verify Supabase project is active (not paused)
3. Check Supabase credentials are correct
4. Open browser console (F12) to see detailed error messages
5. Verify database has data (check Supabase dashboard)

### Problem: Blank Page or Styles Not Loading

**Solution:**
1. Check internet connection (CDN resources need to load)
2. Make sure all files are in the correct folder structure
3. Try a different browser
4. Check browser console for errors (F12)

### Problem: Can't Login

**Solution:**
1. Make sure you've created a user in Supabase
2. Check that Supabase Auth is enabled
3. Verify email/password are correct
4. Check browser allows cookies/LocalStorage
5. Try clearing browser cache

### Problem: Admin Dashboard Not Accessible

**Solution:**
1. Make sure your user has `role = 'admin'` in Supabase users table
2. Check that you're logged in
3. Verify RLS policies are set up correctly

## 🌍 Sharing the Application

### To Share with Others:

1. **Zip the entire folder**
   - Include all files and subfolders
   - Don't modify the folder structure

2. **Share via:**
   - Email (if file size permits)
   - Cloud storage (Google Drive, Dropbox, OneDrive)
   - USB drive
   - File sharing services

3. **Instructions for recipients:**
   - Extract the zip file
   - Open `index.html` in a browser
   - Make sure they have internet connection
   - They'll use the same Supabase database

### Security Considerations:

⚠️ **Important**: The Supabase ANON key in `js/config.js` is visible to anyone who opens the file!

- This is normal for client-side applications
- The ANON key is meant to be public
- Row Level Security (RLS) protects your data
- Never share your Supabase SERVICE key (only use ANON key)

## 📱 Mobile Devices

The application works on mobile browsers:

1. **Transfer files to mobile device:**
   - Use cloud storage app
   - Transfer via USB
   - Use file sharing app

2. **Open on mobile:**
   - Use file manager app
   - Navigate to `index.html`
   - Open with browser

3. **Responsive design:**
   - Hamburger menu on mobile
   - Touch-friendly interface
   - Optimized for small screens

## 🚀 Deployment Options

While the app works as static files, you can also deploy it:

### Option 1: Keep as Static Files
- ✅ Simple and portable
- ✅ No hosting costs
- ✅ Easy to share
- ❌ Requires manual distribution

### Option 2: Deploy to Web Hosting
- ✅ Accessible via URL
- ✅ Automatic updates
- ✅ Professional appearance
- ❌ Requires hosting service

**Recommended hosts for static sites:**
- Vercel (free)
- Netlify (free)
- GitHub Pages (free)
- Cloudflare Pages (free)

See [README.md](README.md) for deployment instructions.

## 📊 Performance

### First Load:
- Downloads CDN resources (~200KB)
- Connects to Supabase
- Loads novel data
- **Total: 1-3 seconds** (depending on internet speed)

### Subsequent Loads:
- CDN resources cached by browser
- Only loads data from Supabase
- **Total: < 1 second**

### Offline Usage:
- ❌ Not supported (requires Supabase connection)
- CDN resources may be cached
- But data loading will fail without internet

## 🔐 Privacy & Security

### What's Stored Locally:
- Authentication token (in LocalStorage)
- Browser cache (CDN resources)
- No novel data stored locally

### What's Sent to Supabase:
- Authentication requests
- Data queries
- User actions (comments, ratings, etc.)

### What's NOT Stored:
- No local database
- No cookies (except Supabase auth)
- No tracking scripts

## ✅ Advantages of Static Files

1. **Portability**: Works anywhere, no installation needed
2. **Simplicity**: Just open and use
3. **Security**: No server-side vulnerabilities
4. **Speed**: Fast loading, minimal overhead
5. **Compatibility**: Works on any modern browser
6. **Offline-ready**: CDN resources cached after first load

## ❌ Limitations

1. **Internet Required**: Must connect to Supabase
2. **No Local Data**: Can't work without Supabase
3. **Manual Updates**: Need to redistribute files for updates
4. **URL Sharing**: Can't share a simple URL (unless deployed)

## 📚 Additional Resources

- [README.md](README.md) - Main documentation
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database setup
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Data migration
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

---

**Need Help?** Check the troubleshooting section above or review the browser console (F12) for detailed error messages.

