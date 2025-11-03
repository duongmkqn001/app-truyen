// =====================================================
// NOVEL DETAIL MODAL
// Shows detailed information, comments, reviews, ratings
// =====================================================

let currentNovel = null;
let currentTab = 'info';

// =====================================================
// CREATE MODAL HTML
// =====================================================

function createNovelModal() {
    return `
        <div id="novelModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 id="modalNovelTitle" class="text-2xl font-bold text-gray-900"></h2>
                    <button id="closeNovelModal" class="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-gray-200 px-6">
                    <button class="modal-tab px-6 py-3 font-semibold text-gray-600 hover:text-green-600 border-b-2 border-transparent" data-tab="info">
                        📖 Thông tin
                    </button>
                    <button class="modal-tab px-6 py-3 font-semibold text-gray-600 hover:text-green-600 border-b-2 border-transparent" data-tab="comments">
                        💬 Bình luận
                    </button>
                    <button class="modal-tab px-6 py-3 font-semibold text-gray-600 hover:text-green-600 border-b-2 border-transparent" data-tab="reviews">
                        ⭐ Đánh giá
                    </button>
                </div>

                <!-- Content -->
                <div id="modalContent" class="p-6 max-h-[60vh] overflow-y-auto">
                    <!-- Dynamic content will be loaded here -->
                </div>

                <!-- Footer Actions (for logged-in users) -->
                <div id="modalFooter" class="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <!-- Dynamic actions will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// OPEN MODAL
// =====================================================

async function openNovelModal(novelId) {
    // Fetch novel details
    const result = await db.novels.getById(novelId);
    
    if (!result.success || !result.data) {
        showToast('Không thể tải thông tin truyện', 'error');
        return;
    }

    currentNovel = result.data;
    
    // Show modal
    const modal = document.getElementById('novelModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Set title
    document.getElementById('modalNovelTitle').textContent = currentNovel.title;

    // Load info tab by default
    switchTab('info');
}

// =====================================================
// CLOSE MODAL
// =====================================================

function closeNovelModal() {
    const modal = document.getElementById('novelModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentNovel = null;
    currentTab = 'info';
}

// =====================================================
// SWITCH TAB
// =====================================================

async function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.modal-tab').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('text-green-600', 'border-green-600');
            btn.classList.remove('text-gray-600', 'border-transparent');
        } else {
            btn.classList.remove('text-green-600', 'border-green-600');
            btn.classList.add('text-gray-600', 'border-transparent');
        }
    });

    // Load tab content
    const content = document.getElementById('modalContent');
    const footer = document.getElementById('modalFooter');

    switch (tabName) {
        case 'info':
            content.innerHTML = await renderInfoTab();
            footer.innerHTML = await renderInfoFooter();
            break;
        case 'comments':
            content.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div></div>';
            footer.innerHTML = renderCommentFooter();
            await loadComments();
            break;
        case 'reviews':
            content.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div></div>';
            footer.innerHTML = renderReviewFooter();
            await loadReviews();
            break;
    }
}

// =====================================================
// RENDER INFO TAB
// =====================================================

async function renderInfoTab() {
    const novel = currentNovel;
    
    // Get user's rating if logged in
    let userRating = 0;
    const user = await db.auth.getCurrentUser();
    if (user) {
        const ratingResult = await db.ratings.getUserRating(novel.id, user.id);
        if (ratingResult.success && ratingResult.data) {
            userRating = ratingResult.data.rating;
        }
    }

    const tagsHTML = novel.tag_names && novel.tag_names.length > 0
        ? novel.tag_names.map((tag, i) => {
            const color = novel.tag_colors?.[i] || 'blue';
            return `<span class="px-3 py-1 rounded-full text-sm font-semibold bg-${color}-100 text-${color}-800">${tag}</span>`;
        }).join(' ')
        : '<span class="text-gray-400">Chưa có thể loại</span>';

    const statusColors = {
        'Hoàn thành': 'green',
        'Đang ra': 'blue',
        'Tạm ngưng': 'yellow'
    };
    const statusColor = statusColors[novel.status] || 'gray';

    return `
        <div class="grid md:grid-cols-3 gap-6">
            <!-- Cover Image -->
            <div class="md:col-span-1">
                ${novel.cover_image_url 
                    ? `<img src="${novel.cover_image_url}" alt="${novel.title}" class="w-full rounded-lg shadow-lg">`
                    : `<div class="w-full aspect-[2/3] bg-gradient-to-br from-green-100 to-teal-100 rounded-lg shadow-lg flex items-center justify-center">
                        <span class="text-6xl">📚</span>
                       </div>`
                }
            </div>

            <!-- Details -->
            <div class="md:col-span-2 space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-1">Tác giả</h3>
                    <p class="text-lg text-gray-900">${novel.author_name}</p>
                </div>

                ${novel.editor_name ? `
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-1">Dịch giả / Biên tập</h3>
                    <p class="text-lg text-gray-900">${novel.editor_name}</p>
                </div>
                ` : ''}

                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-1">Thể loại</h3>
                    <div class="flex flex-wrap gap-2">${tagsHTML}</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-500 mb-1">Số chương</h3>
                        <p class="text-lg text-gray-900">${novel.chapter_count || 0}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-500 mb-1">Trạng thái</h3>
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-${statusColor}-100 text-${statusColor}-800">
                            ${novel.status}
                        </span>
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-1">Đánh giá</h3>
                    <div class="flex items-center gap-4">
                        ${UIComponents.createStarRating(novel.avg_rating || 0, 5, false)}
                        <span class="text-sm text-gray-600">(${novel.rating_count || 0} lượt đánh giá)</span>
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-1">Đề cử</h3>
                    <p class="text-lg text-gray-900">🔥 ${novel.nomination_count || 0} lượt đề cử</p>
                </div>

                ${novel.summary ? `
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-1">Tóm tắt</h3>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${novel.summary}</p>
                </div>
                ` : ''}

                ${user ? `
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 mb-2">Đánh giá của bạn</h3>
                    ${UIComponents.createStarRating(userRating, 5, true, novel.id)}
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// =====================================================
// RENDER INFO FOOTER
// =====================================================

async function renderInfoFooter() {
    if (!currentNovel) return '';

    // Check if user has nominated this novel
    let hasNominated = false;
    const user = await db.auth.getCurrentUser();
    if (user) {
        const nominationResult = await db.nominations.hasNominated(currentNovel.id);
        hasNominated = nominationResult.data || false;
    }

    const nominateButtonClass = hasNominated
        ? 'flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105'
        : 'flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105';

    const nominateButtonText = hasNominated ? '✓ Đã đề cử' : '🔥 Đề cử truyện này';

    return `
        <div class="flex gap-3">
            <button id="nominateBtn" class="${nominateButtonClass}" data-nominated="${hasNominated}">
                ${nominateButtonText}
            </button>
            ${currentNovel.novel_url ? `
            <a href="${currentNovel.novel_url}" target="_blank" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
                📖 Đọc truyện
            </a>
            ` : ''}
        </div>
    `;
}

// =====================================================
// LOAD COMMENTS
// =====================================================

async function loadComments() {
    const result = await db.comments.getByNovel(currentNovel.id);
    const content = document.getElementById('modalContent');

    if (!result.success) {
        content.innerHTML = '<p class="text-center text-gray-500 py-8">Không thể tải bình luận</p>';
        return;
    }

    const comments = result.data || [];

    if (comments.length === 0) {
        content.innerHTML = '<p class="text-center text-gray-500 py-8">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
        return;
    }

    content.innerHTML = `
        <div class="space-y-4">
            ${comments.map(comment => renderComment(comment)).join('')}
        </div>
    `;
}

function renderComment(comment) {
    const user = db.auth.getCurrentUser();
    
    return `
        <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900">${comment.username || 'Ẩn danh'}</span>
                    ${comment.user_role ? UIComponents.createRoleBadge(comment.user_role) : ''}
                </div>
                <span class="text-xs text-gray-500">${new Date(comment.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <p class="text-gray-700 mb-3">${comment.content}</p>
            <div class="flex items-center justify-between">
                ${UIComponents.createLikeDislikeButtons('comment', comment.id, comment.like_count || 0, comment.dislike_count || 0)}
                ${UIComponents.createReportButton('comment', comment.id)}
            </div>
        </div>
    `;
}

// =====================================================
// RENDER COMMENT FOOTER
// =====================================================

function renderCommentFooter() {
    return `
        <form id="commentForm" class="space-y-3">
            <textarea
                id="commentInput"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Viết bình luận của bạn..."
                maxlength="500"
                required
            ></textarea>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Tối đa 500 ký tự</span>
                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Gửi bình luận
                </button>
            </div>
        </form>
    `;
}

// =====================================================
// LOAD REVIEWS
// =====================================================

async function loadReviews() {
    const result = await db.reviews.getByNovel(currentNovel.id);
    const content = document.getElementById('modalContent');

    if (!result.success) {
        content.innerHTML = '<p class="text-center text-gray-500 py-8">Không thể tải đánh giá</p>';
        return;
    }

    const reviews = result.data || [];

    if (reviews.length === 0) {
        content.innerHTML = '<p class="text-center text-gray-500 py-8">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>';
        return;
    }

    content.innerHTML = `
        <div class="space-y-6">
            ${reviews.map(review => renderReview(review)).join('')}
        </div>
    `;
}

function renderReview(review) {
    return `
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900">${review.username || 'Ẩn danh'}</span>
                    ${review.user_role ? UIComponents.createRoleBadge(review.user_role) : ''}
                    ${review.rating ? `<span class="ml-2">${UIComponents.createStarRating(review.rating, 5, false)}</span>` : ''}
                </div>
                <span class="text-xs text-gray-500">${new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
            </div>

            ${review.title ? `<h4 class="font-semibold text-lg text-gray-900 mb-2">${review.title}</h4>` : ''}

            <p class="text-gray-700 leading-relaxed mb-4">${review.content}</p>

            <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                ${UIComponents.createLikeDislikeButtons('review', review.id, review.like_count || 0, review.dislike_count || 0)}
                ${UIComponents.createReportButton('review', review.id)}
            </div>
        </div>
    `;
}

// =====================================================
// RENDER REVIEW FOOTER
// =====================================================

function renderReviewFooter() {
    return `
        <form id="reviewForm" class="space-y-3">
            <input
                type="text"
                id="reviewTitle"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tiêu đề đánh giá (tùy chọn)"
                maxlength="100"
            />
            <textarea
                id="reviewContent"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Viết đánh giá chi tiết của bạn..."
                maxlength="2000"
                required
            ></textarea>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Tối đa 2000 ký tự</span>
                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Gửi đánh giá
                </button>
            </div>
        </form>
    `;
}

// =====================================================
// EVENT HANDLERS
// =====================================================

function initModalEventHandlers() {
    // Nominate button - Toggle nomination
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'nominateBtn' || e.target.closest('#nominateBtn')) {
            if (!currentNovel) return;

            const button = e.target.closest('#nominateBtn');
            const hasNominated = button.dataset.nominated === 'true';

            let result;
            if (hasNominated) {
                // Remove nomination
                result = await db.nominations.remove(currentNovel.id);
                if (result.success) {
                    showToast('Đã hủy đề cử truyện', 'success');
                }
            } else {
                // Add nomination
                result = await db.nominations.create(currentNovel.id);
                if (result.success) {
                    showToast('Đã đề cử truyện thành công!', 'success');
                }
            }

            if (result.success) {
                // Refresh novel data to update nomination count and button state
                openNovelModal(currentNovel.id);
            } else {
                showToast(result.error || 'Không thể thực hiện thao tác', 'error');
            }
        }
    });

    // Comment form
    document.addEventListener('submit', async (e) => {
        if (e.target.id === 'commentForm') {
            e.preventDefault();

            const content = document.getElementById('commentInput').value.trim();
            if (!content || !currentNovel) return;

            const result = await db.comments.create(currentNovel.id, content);

            if (result.success) {
                showToast('Đã gửi bình luận!', 'success');
                document.getElementById('commentInput').value = '';
                await loadComments();
            } else {
                showToast(result.error || 'Không thể gửi bình luận', 'error');
            }
        }
    });

    // Review form
    document.addEventListener('submit', async (e) => {
        if (e.target.id === 'reviewForm') {
            e.preventDefault();

            const title = document.getElementById('reviewTitle').value.trim();
            const content = document.getElementById('reviewContent').value.trim();
            if (!content || !currentNovel) return;

            const result = await db.reviews.create(currentNovel.id, content, title);

            if (result.success) {
                showToast('Đã gửi đánh giá!', 'success');
                document.getElementById('reviewTitle').value = '';
                document.getElementById('reviewContent').value = '';
                await loadReviews();
            } else {
                showToast(result.error || 'Không thể gửi đánh giá', 'error');
            }
        }
    });
}

// Initialize modal
document.addEventListener('DOMContentLoaded', () => {
    // Add modal to page
    if (!document.getElementById('novelModal')) {
        document.body.insertAdjacentHTML('beforeend', createNovelModal());
    }

    // Close button
    document.getElementById('closeNovelModal').addEventListener('click', closeNovelModal);

    // Tab switching
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Close on outside click
    document.getElementById('novelModal').addEventListener('click', (e) => {
        if (e.target.id === 'novelModal') closeNovelModal();
    });

    // Initialize event handlers
    initModalEventHandlers();
});

// Export functions
window.NovelModal = {
    open: openNovelModal,
    close: closeNovelModal
};

