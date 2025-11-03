// =====================================================
// MAIN UI LOGIC - Authentication State & User Interface
// =====================================================

let currentUser = null;
let userProfile = null;

// Initialize authentication state
async function initAuth() {
    try {
        // Check if database service is available
        if (!window.db || !window.db.auth) {
            console.warn('Database service not yet available, skipping auth initialization');
            updateAuthUI(false);
            return;
        }

        currentUser = await db.auth.getCurrentUser();

        if (currentUser) {
            userProfile = await db.auth.getUserProfile(currentUser.id);
            updateAuthUI(true);
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        updateAuthUI(false);
    }
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    const usernameSpan = document.getElementById('username');
    const adminLink = document.getElementById('adminLink');
    
    if (isLoggedIn && userProfile) {
        notLoggedIn.classList.add('hidden');
        loggedIn.classList.remove('hidden');
        usernameSpan.textContent = userProfile.username;
        
        // Show admin link if user is admin
        if (userProfile.role === 'admin' && !userProfile.is_banned) {
            adminLink.classList.remove('hidden');
        } else {
            adminLink.classList.add('hidden');
        }
    } else {
        notLoggedIn.classList.remove('hidden');
        loggedIn.classList.add('hidden');
    }
}

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    const result = await db.auth.signOut();
    if (result.success) {
        currentUser = null;
        userProfile = null;
        updateAuthUI(false);
        // Reload page to clear any user-specific data
        window.location.reload();
    }
});

// Listen for auth state changes
if (window.supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            initAuth();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            updateAuthUI(false);
        }
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

