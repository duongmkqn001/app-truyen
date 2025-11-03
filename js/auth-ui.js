// =====================================================
// AUTHENTICATION UI LOGIC
// =====================================================

// DOM Elements
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');

// Tab Switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('bg-white', 'text-green-700', 'shadow-sm');
    loginTab.classList.remove('text-gray-600');
    registerTab.classList.remove('bg-white', 'text-green-700', 'shadow-sm');
    registerTab.classList.add('text-gray-600');
    
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    hideMessage();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('bg-white', 'text-green-700', 'shadow-sm');
    registerTab.classList.remove('text-gray-600');
    loginTab.classList.remove('bg-white', 'text-green-700', 'shadow-sm');
    loginTab.classList.add('text-gray-600');
    
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    hideMessage();
});

// Message Display
function showMessage(message, isError = false) {
    const messageDiv = authMessage.querySelector('div');
    messageDiv.textContent = message;
    messageDiv.className = `p-3 rounded-lg text-sm ${
        isError 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
    }`;
    authMessage.classList.remove('hidden');
}

function hideMessage() {
    authMessage.classList.add('hidden');
}

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Disable submit button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng nhập...';
    
    try {
        const result = await db.auth.signIn(email, password);
        
        if (result.success) {
            // Check if user is banned
            const profile = await db.auth.getUserProfile(result.user.id);
            
            if (profile && profile.is_banned) {
                showMessage('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', true);
                await db.auth.signOut();
                return;
            }
            
            showMessage('Đăng nhập thành công! Đang chuyển hướng...');
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.', true);
        }
    } catch (error) {
        showMessage('Có lỗi xảy ra. Vui lòng thử lại.', true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng nhập';
    }
});

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        showMessage('Mật khẩu xác nhận không khớp!', true);
        return;
    }
    
    // Validate username
    if (username.length < 3) {
        showMessage('Tên người dùng phải có ít nhất 3 ký tự!', true);
        return;
    }
    
    // Disable submit button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng ký...';
    
    try {
        const result = await db.auth.signUp(email, password, username);
        
        if (result.success) {
            showMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            
            // Clear form
            registerForm.reset();
            
            // Switch to login tab after 3 seconds
            setTimeout(() => {
                loginTab.click();
            }, 3000);
        } else {
            showMessage(result.error || 'Đăng ký thất bại. Email có thể đã được sử dụng.', true);
        }
    } catch (error) {
        showMessage('Có lỗi xảy ra. Vui lòng thử lại.', true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng ký';
    }
});

// Check if already logged in
(async () => {
    const user = await db.auth.getCurrentUser();
    if (user) {
        showMessage('Bạn đã đăng nhập. Đang chuyển hướng...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
})();

