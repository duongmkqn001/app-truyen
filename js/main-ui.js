// =====================================================
// MAIN UI LOGIC - Authentication State & User Interface
// =====================================================

let currentUser = null;
let userProfile = null;

// Initialize authentication state
async function initAuth() {
    try {
        console.log('Initializing auth...');

        // Check if database service is available
        if (!window.db || !window.db.auth) {
            console.warn('Database service not yet available, retrying in 100ms...');
            setTimeout(initAuth, 100);
            return;
        }

        currentUser = await db.auth.getCurrentUser();
        console.log('Current user:', currentUser);

        if (currentUser) {
            userProfile = await db.auth.getUserProfile(currentUser.id);
            console.log('User profile:', userProfile);
            updateAuthUI(true);
        } else {
            console.log('No user logged in');
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

    console.log('Updating auth UI:', { isLoggedIn, userProfile, notLoggedIn, loggedIn });

    if (!notLoggedIn || !loggedIn) {
        console.warn('Auth UI elements not found');
        return;
    }

    if (isLoggedIn && userProfile) {
        console.log('Showing logged in UI for:', userProfile.username);
        notLoggedIn.classList.add('hidden');
        loggedIn.classList.remove('hidden');

        if (usernameSpan) {
            usernameSpan.textContent = userProfile.username;
        }

        // Show admin link if user is admin (any admin type)
        if (adminLink) {
            if (['admin', 'super_admin', 'sub_admin'].includes(userProfile.role) && !userProfile.is_banned) {
                adminLink.classList.remove('hidden');
            } else {
                adminLink.classList.add('hidden');
            }
        }
    } else {
        console.log('Showing not logged in UI');
        notLoggedIn.classList.remove('hidden');
        loggedIn.classList.add('hidden');
    }
}

// Logout handler
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            console.log('Logging out...');
            const result = await db.auth.signOut();
            if (result.success) {
                currentUser = null;
                userProfile = null;
                updateAuthUI(false);
                // Reload page to clear any user-specific data
                window.location.reload();
            }
        });
    }
}

// Listen for auth state changes
function setupAuthListener() {
    if (window.supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            if (event === 'SIGNED_IN') {
                initAuth();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                userProfile = null;
                updateAuthUI(false);
            }
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing auth...');
        initAuth();
        setupLogoutHandler();
        setupAuthListener();
    });
} else {
    console.log('DOM already loaded, initializing auth...');
    initAuth();
    setupLogoutHandler();
    setupAuthListener();
}

