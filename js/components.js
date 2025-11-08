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

function showToast(message, type = 'info') {
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-0 opacity-100`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
    showToast
};

