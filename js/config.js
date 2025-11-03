// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

// TODO: Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings:
// https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'https://chumufdfkeiybeojrwmr.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodW11ZmRma2VpeWJlb2pyd21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDQ4NjYsImV4cCI6MjA3NzcyMDg2Nn0.7Xf4FCnrMjzP9pVxyyx-8Kz6PbsWwGdqtjC49ZGFdhA'; // Your anon/public key

// Initialize Supabase client
// Check if Supabase library is loaded
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase library not loaded! Make sure to include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    throw new Error('Supabase library not loaded');
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase client initialized successfully');

// =====================================================
// CONFIGURATION CONSTANTS
// =====================================================

const CONFIG = {
    // Pagination
    NOVELS_PER_PAGE: 20,
    COMMENTS_PER_PAGE: 10,
    
    // Rating limits
    MIN_RATING: 1.0,
    MAX_RATING: 5.0,
    
    // Content limits
    MAX_COMMENT_LENGTH: 500,
    MAX_REVIEW_LENGTH: 2000,
    MAX_REPORT_REASON_LENGTH: 500,
    
    // User roles
    ROLES: {
        READER: 'reader',
        ADMIN: 'admin'
    },
    
    // Novel status
    STATUS: {
        COMPLETED: 'Hoàn thành',
        ONGOING: 'Đang ra',
        DROPPED: 'Tạm ngưng'
    },
    
    // Report types
    REPORT_TYPES: {
        COMMENT: 'comment',
        REVIEW: 'review',
        NOVEL: 'novel'
    },
    
    // Report status
    REPORT_STATUS: {
        PENDING: 'pending',
        RESOLVED: 'resolved',
        DISMISSED: 'dismissed'
    }
};

// Export for use in other modules
window.CONFIG = CONFIG;
window.supabaseClient = supabase;

