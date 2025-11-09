// =====================================================
// REUSABLE UI COMPONENTS
// =====================================================

// =====================================================
// ROLE BADGE COMPONENT
// =====================================================

function createRoleBadge(role) {
    const roleConfig = {
        'pending_approval': {
            label: 'Chờ duyệt',
            color: 'gray',
            icon: '⏳'
        },
        'reader': {
            label: 'Thành viên',
            color: 'blue',
            icon: '📖'
        },
        'translator': {
            label: 'Dịch giả',
            color: 'purple',
            icon: '✍️'
        },
        'admin': {
            label: 'Quản trị',
            color: 'red',
            icon: '👑'
        },
        'super_admin': {
            label: 'Quản trị cấp cao',
            color: 'red',
            icon: '⭐'
        },
        'sub_admin': {
            label: 'Quản trị viên',
            color: 'indigo',
            icon: '🛡️'
        }
    };

    const config = roleConfig[role] || roleConfig['reader'];

    return `
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800">
            <span class="mr-1">${config.icon}</span>
            ${config.label}
        </span>
    `;
}

// =====================================================
// STAR RATING WIDGET
// =====================================================

function createStarRating(rating, maxStars = 5, interactive = false, novelId = null) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        if (interactive) {
            starsHTML += `<span class="star-interactive cursor-pointer text-yellow-400 hover:text-yellow-500 text-2xl" data-rating="${i + 1}" data-novel-id="${novelId}">★</span>`;
        } else {
            starsHTML += '<span class="text-yellow-400 text-xl">★</span>';
        }
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<span class="text-yellow-400 text-xl">⯨</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        if (interactive) {
            starsHTML += `<span class="star-interactive cursor-pointer text-gray-300 hover:text-yellow-500 text-2xl" data-rating="${fullStars + (hasHalfStar ? 1 : 0) + i + 1}" data-novel-id="${novelId}">☆</span>`;
        } else {
            starsHTML += '<span class="text-gray-300 text-xl">☆</span>';
        }
    }

    return `
        <div class="flex items-center gap-1 ${interactive ? 'star-rating-widget' : ''}">
            ${starsHTML}
            ${!interactive ? `<span class="ml-2 text-sm text-gray-600">(${rating.toFixed(1)})</span>` : ''}
        </div>
    `;
}

// Initialize star rating interactivity
function initStarRating() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('star-interactive')) {
            const rating = parseInt(e.target.dataset.rating);
            const novelId = e.target.dataset.novelId;
            
            if (!novelId || !rating) return;

            // Submit rating
            const result = await db.ratings.upsert(novelId, rating);
            
            if (result.success) {
                // Update UI
                const widget = e.target.closest('.star-rating-widget');
                if (widget) {
                    widget.innerHTML = createStarRating(rating, 5, true, novelId);
                }
                
                // Show success message
                showToast('Đã gửi đánh giá!', 'success');
            } else {
                showToast(result.error || 'Không thể gửi đánh giá', 'error');
            }
        }
    });
}

// =====================================================
// LIKE/DISLIKE BUTTONS
// =====================================================

function createLikeDislikeButtons(targetType, targetId, likeCount = 0, dislikeCount = 0, userVote = null) {
    const likeActive = userVote === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
    const dislikeActive = userVote === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';

    return `
        <div class="flex items-center gap-2">
            <button 
                class="like-btn flex items-center gap-1 px-3 py-1 rounded-lg ${likeActive} hover:bg-green-200 transition-colors"
                data-target-type="${targetType}"
                data-target-id="${targetId}"
                data-action="like"
            >
                <span>👍</span>
                <span class="text-sm font-semibold">${likeCount}</span>
            </button>
            <button 
                class="dislike-btn flex items-center gap-1 px-3 py-1 rounded-lg ${dislikeActive} hover:bg-red-200 transition-colors"
                data-target-type="${targetType}"
                data-target-id="${targetId}"
                data-action="dislike"
            >
                <span>👎</span>
                <span class="text-sm font-semibold">${dislikeCount}</span>
            </button>
        </div>
    `;
}

// Initialize like/dislike buttons
function initLikeDislikeButtons() {
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.like-btn, .dislike-btn');
        if (!btn) return;

        const targetType = btn.dataset.targetType;
        const targetId = btn.dataset.targetId;
        const isLike = btn.dataset.action === 'like';

        if (!targetType || !targetId) return;

        // Toggle like/dislike
        const result = await db.likes.toggle(targetType, targetId, isLike);

        if (result.success) {
            // Reload the comment/review to update counts
            // This would be handled by the parent component
            showToast(
                result.action === 'removed' ? 'Đã xóa đánh giá' : 
                result.action === 'changed' ? 'Đã thay đổi đánh giá' : 
                'Đã gửi đánh giá',
                'success'
            );
            
            // Trigger custom event for parent to refresh
            document.dispatchEvent(new CustomEvent('likeUpdated', { 
                detail: { targetType, targetId } 
            }));
        } else {
            showToast(result.error || 'Không thể gửi đánh giá', 'error');
        }
    });
}

// =====================================================
// REPORT BUTTON
// =====================================================

function createReportButton(targetType, targetId) {
    return `
        <button 
            class="report-btn text-sm text-gray-500 hover:text-red-600 transition-colors"
            data-target-type="${targetType}"
            data-target-id="${targetId}"
            title="Báo cáo vi phạm"
        >
            🚩 Báo cáo
        </button>
    `;
}

// =====================================================
// REPORT MODAL
// =====================================================

function createReportModal() {
    return `
        <div id="reportModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-[60]">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-900">Báo cáo vi phạm</h3>
                    <button id="closeReportModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                <form id="reportForm">
                    <input type="hidden" id="reportTargetType" name="targetType">
                    <input type="hidden" id="reportTargetId" name="targetId">
                    
                    <div class="mb-4">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Lý do báo cáo</label>
                        <select id="reportReason" name="reason" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                            <option value="">-- Chọn lý do --</option>
                            <option value="spam">Spam</option>
                            <option value="harassment">Quấy rối</option>
                            <option value="inappropriate">Nội dung không phù hợp</option>
                            <option value="copyright">Vi phạm bản quyền</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Chi tiết (tùy chọn)</label>
                        <textarea 
                            id="reportDetails" 
                            name="details" 
                            rows="4" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Mô tả chi tiết về vi phạm..."
                            maxlength="500"
                        ></textarea>
                        <p class="text-xs text-gray-500 mt-1">Tối đa 500 ký tự</p>
                    </div>
                    
                    <div class="flex gap-3">
                        <button 
                            type="submit" 
                            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Gửi báo cáo
                        </button>
                        <button 
                            type="button" 
                            id="cancelReport"
                            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Initialize report functionality
function initReportSystem() {
    // Add report modal to page if not exists
    if (!document.getElementById('reportModal')) {
        document.body.insertAdjacentHTML('beforeend', createReportModal());
    }

    const modal = document.getElementById('reportModal');
    const form = document.getElementById('reportForm');
    const closeBtn = document.getElementById('closeReportModal');
    const cancelBtn = document.getElementById('cancelReport');

    // Open modal on report button click
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.report-btn');
        if (!btn) return;

        const targetType = btn.dataset.targetType;
        const targetId = btn.dataset.targetId;

        document.getElementById('reportTargetType').value = targetType;
        document.getElementById('reportTargetId').value = targetId;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // Close modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        form.reset();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Submit report
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const targetType = formData.get('targetType');
        const targetId = formData.get('targetId');
        const reason = formData.get('reason');
        const details = formData.get('details');

        const result = await db.reports.create(targetType, targetId, reason, details);

        if (result.success) {
            showToast('Đã gửi báo cáo. Cảm ơn bạn!', 'success');
            closeModal();
        } else {
            showToast(result.error || 'Không thể gửi báo cáo', 'error');
        }
    });
}

// =====================================================
// TOAST NOTIFICATION
// =====================================================

function showToast(message, type = 'info', duration = 3000) {
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-3`;
    toast.style.minWidth = '300px';
    toast.innerHTML = `
        <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white bg-opacity-20 rounded-full font-bold">
            ${icons[type]}
        </div>
        <div class="flex-1 font-medium">${message}</div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Animate out
    setTimeout(() => {
        toast.style.transform = 'translateY(8px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// =====================================================
// BOOKMARK/READING LIST BUTTON
// =====================================================

async function createBookmarkButton(novelId, options = {}) {
    const {
        size = 'md', // 'sm', 'md', 'lg'
        showText = true,
        className = ''
    } = options;

    // Check if novel is in reading list
    const result = await db.readingList.isInList(novelId);
    const inList = result.success ? result.inList : false;

    const sizeClasses = {
        sm: 'p-1.5 text-sm',
        md: 'p-2 text-base',
        lg: 'p-3 text-lg'
    };

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const buttonId = `bookmark-btn-${novelId}`;

    if (inList) {
        // Already in reading list - show filled bookmark
        return `
            <button
                id="${buttonId}"
                onclick="toggleBookmark('${novelId}')"
                class="bookmark-btn bookmark-btn-transition ${sizeClasses[size]} bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${className}"
                title="Xóa khỏi danh sách đọc">
                <div class="flex items-center gap-1">
                    <svg class="${iconSizeClasses[size]} transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                    ${showText ? '<span class="text-sm font-medium">Đã lưu</span>' : ''}
                </div>
            </button>
        `;
    } else {
        // Not in reading list - show outline bookmark
        return `
            <button
                id="${buttonId}"
                onclick="toggleBookmark('${novelId}')"
                class="bookmark-btn bookmark-btn-transition ${sizeClasses[size]} bg-gray-100 hover:bg-yellow-500 hover:text-white text-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${className}"
                title="Thêm vào danh sách đọc">
                <div class="flex items-center gap-1">
                    <svg class="${iconSizeClasses[size]} transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    ${showText ? '<span class="text-sm font-medium">Lưu</span>' : ''}
                </div>
            </button>
        `;
    }
}

// Toggle bookmark status
async function toggleBookmark(novelId) {
    const user = await db.auth.getCurrentUser();
    if (!user) {
        showToast('Vui lòng đăng nhập để sử dụng danh sách đọc', 'warning', 2500);
        setTimeout(() => {
            window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname);
        }, 1500);
        return;
    }

    const buttonId = `bookmark-btn-${novelId}`;
    const button = document.getElementById(buttonId);

    // Prevent multiple clicks - add loading state
    if (button && button.disabled) return;
    if (button) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'wait';
    }

    // Check current status
    const checkResult = await db.readingList.isInList(novelId);
    if (!checkResult.success) {
        showToast('Lỗi: ' + checkResult.error, 'error', 3500);
        if (button) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
        return;
    }

    const inList = checkResult.inList;

    if (inList) {
        // Remove from reading list
        const result = await db.readingList.remove(novelId);
        if (result.success) {
            showToast('📖 Đã xóa khỏi danh sách đọc', 'success', 2500);
            // Update button with animation
            await updateBookmarkButton(novelId, true);
        } else {
            showToast('Lỗi: ' + result.error, 'error', 3500);
        }
    } else {
        // Add to reading list
        const result = await db.readingList.add(novelId);
        if (result.success) {
            showToast('📚 Đã thêm vào danh sách đọc', 'success', 2500);
            // Update button with animation
            await updateBookmarkButton(novelId, true);
        } else {
            showToast('Lỗi: ' + result.error, 'error', 3500);
        }
    }

    // Re-enable button
    if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Update bookmark button appearance
async function updateBookmarkButton(novelId, animate = false) {
    const buttonId = `bookmark-btn-${novelId}`;
    const button = document.getElementById(buttonId);
    if (!button) return;

    // Check current status
    const result = await db.readingList.isInList(novelId);
    const inList = result.success ? result.inList : false;

    // Add animation class if requested
    if (animate) {
        // Pulse animation
        button.style.animation = 'bookmarkPulse 0.5s ease-in-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 500);
    }

    if (inList) {
        // Update to filled bookmark with smooth transition
        button.style.transition = 'all 0.3s ease-in-out';
        button.className = button.className.replace('bg-gray-100', 'bg-yellow-500');
        button.className = button.className.replace('hover:bg-yellow-500', 'hover:bg-yellow-600');
        button.className = button.className.replace('text-gray-700', 'text-white');
        button.title = 'Xóa khỏi danh sách đọc';
        button.innerHTML = `
            <div class="flex items-center gap-1">
                <svg class="w-5 h-5 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
                <span class="text-sm font-medium">Đã lưu</span>
            </div>
        `;
    } else {
        // Update to outline bookmark with smooth transition
        button.style.transition = 'all 0.3s ease-in-out';
        button.className = button.className.replace('bg-yellow-500', 'bg-gray-100');
        button.className = button.className.replace('hover:bg-yellow-600', 'hover:bg-yellow-500');
        button.className = button.className.replace('text-white', 'text-gray-700');
        button.title = 'Thêm vào danh sách đọc';
        button.innerHTML = `
            <div class="flex items-center gap-1">
                <svg class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span class="text-sm font-medium">Lưu</span>
            </div>
        `;
    }
}

// =====================================================
// USER MENU COMPONENT
// =====================================================

async function renderUserMenu() {
    const user = await db.auth.getCurrentUser();
    const userMenuElements = document.querySelectorAll('#userMenu');

    if (!user) {
        userMenuElements.forEach(el => {
            el.innerHTML = `
                <a href="login.html" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Đăng nhập
                </a>
            `;
        });
        return;
    }

    const profile = await db.auth.getUserProfile(user.id);

    const menuHTML = `
        <div class="flex items-center gap-3">
            <a href="my-reading-list.html" class="text-gray-700 hover:text-green-600 transition-colors" title="Danh sách đọc của tôi">
                📖
            </a>
            <a href="profile.html" class="text-gray-700 hover:text-green-600 transition-colors">
                👤 ${profile?.username || user.email}
            </a>
            ${createRoleBadge(profile?.role || 'reader')}
            ${['admin', 'super_admin', 'sub_admin'].includes(profile?.role) ? '<a href="admin.html" class="text-blue-600 hover:underline">Quản trị</a>' : ''}
            <button onclick="logoutUser()" class="text-red-600 hover:underline transition-colors">Đăng xuất</button>
        </div>
    `;

    userMenuElements.forEach(el => {
        el.innerHTML = menuHTML;
    });
}

// Global logout function
async function logoutUser() {
    await db.auth.signOut();
    window.location.href = 'index.html';
}

// =====================================================
// INITIALIZE ALL COMPONENTS
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    initStarRating();
    initLikeDislikeButtons();
    initReportSystem();
});

// Export functions for use in other modules
window.UIComponents = {
    createRoleBadge,
    createStarRating,
    createLikeDislikeButtons,
    createReportButton,
    createBookmarkButton,
    showToast
};

// Export bookmark functions globally
window.toggleBookmark = toggleBookmark;
window.updateBookmarkButton = updateBookmarkButton;

// Export user menu functions globally
window.renderUserMenu = renderUserMenu;
window.logoutUser = logoutUser;

