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
                    ${novel.extra_chapters && novel.extra_chapters > 0 ? `
                    <div>
                        <h3 class="text-sm font-semibold text-gray-500 mb-1">Ngoại truyện</h3>
                        <p class="text-lg text-gray-900">${novel.extra_chapters} chương</p>
                    </div>
                    ` : ''}
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

                <!-- Report Novel Info Button -->
                <div class="pt-4 border-t">
                    <button
                        class="report-btn text-sm text-red-600 hover:text-red-800 hover:underline"
                        data-target-type="novel_info"
                        data-target-id="${novel.id}"
                    >
                        🚩 Báo cáo thông tin sai/thiếu
                    </button>
                </div>
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

    // Get bookmark button HTML
    const bookmarkButtonHTML = await UIComponents.createBookmarkButton(currentNovel.id, {
        size: 'lg',
        showText: true,
        className: 'flex-1'
    });

    return `
        <div class="flex gap-3 flex-wrap">
            <button id="nominateBtn" class="${nominateButtonClass}" data-nominated="${hasNominated}">
                ${nominateButtonText}
            </button>
            ${bookmarkButtonHTML}
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

    // Filter top-level comments (no parent)
    const topLevelComments = comments.filter(c => !c.parent_comment_id);

    content.innerHTML = `
        <div class="space-y-4">
            ${topLevelComments.map(comment => renderComment(comment)).join('')}
        </div>
    `;

    // Load replies for all top-level comments
    await loadAllReplies();
}

function renderComment(comment, isReply = false) {
    // Check if comment is anonymous
    const displayName = comment.is_anonymous ? 'Ẩn danh' : (comment.users?.username || comment.username || 'Ẩn danh');

    return `
        <div class="bg-gray-50 rounded-lg p-4 ${isReply ? 'ml-8 mt-2' : ''}" data-comment-id="${comment.id}">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900">${displayName}</span>
                    ${!comment.is_anonymous && comment.user_role ? UIComponents.createRoleBadge(comment.user_role) : ''}
                </div>
                <span class="text-xs text-gray-500">${new Date(comment.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <p class="text-gray-700 mb-3">${comment.content}</p>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    ${UIComponents.createLikeDislikeButtons('comment', comment.id, comment.like_count || 0, comment.dislike_count || 0)}
                    ${!isReply ? `<button onclick="toggleReplyForm('${comment.id}')" class="text-sm text-blue-600 hover:text-blue-800 font-medium">💬 Trả lời</button>` : ''}
                </div>
                ${UIComponents.createReportButton('comment', comment.id)}
            </div>

            <!-- Reply form (hidden by default) -->
            <div id="replyForm-${comment.id}" class="hidden mt-3 pt-3 border-t border-gray-200">
                <textarea
                    id="replyInput-${comment.id}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                    rows="2"
                    placeholder="Viết câu trả lời..."
                    maxlength="500"
                ></textarea>
                <div class="flex justify-between items-center mt-2">
                    <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" id="replyAnonymous-${comment.id}" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                        <span>Ẩn danh</span>
                    </label>
                    <div class="flex gap-2">
                        <button onclick="cancelReply('${comment.id}')" class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">Hủy</button>
                        <button onclick="submitReply('${comment.id}')" class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg">Gửi</button>
                    </div>
                </div>
            </div>

            <!-- Replies container -->
            <div id="replies-${comment.id}" class="mt-2"></div>

            <!-- Show/Hide replies button (will be populated if there are replies) -->
            <div id="toggleReplies-${comment.id}"></div>
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
                <div class="flex items-center gap-4">
                    <span class="text-xs text-gray-500">Tối đa 500 ký tự</span>
                    <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" id="commentAnonymous" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                        <span>Ẩn danh</span>
                    </label>
                </div>
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
    // Check if review is anonymous
    const displayName = review.is_anonymous ? 'Ẩn danh' : (review.users?.username || review.username || 'Ẩn danh');

    return `
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900">${displayName}</span>
                    ${!review.is_anonymous && review.user_role ? UIComponents.createRoleBadge(review.user_role) : ''}
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
                <div class="flex items-center gap-4">
                    <span class="text-xs text-gray-500">Tối đa 2000 ký tự</span>
                    <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" id="reviewAnonymous" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                        <span>Ẩn danh</span>
                    </label>
                </div>
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
                result = await db.nominations.delete(currentNovel.id);
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
            const isAnonymous = document.getElementById('commentAnonymous')?.checked || false;
            if (!content || !currentNovel) return;

            const result = await db.comments.create(currentNovel.id, content, isAnonymous);

            if (result.success) {
                showToast('Đã gửi bình luận!', 'success');
                document.getElementById('commentInput').value = '';
                if (document.getElementById('commentAnonymous')) {
                    document.getElementById('commentAnonymous').checked = false;
                }
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

            const content = document.getElementById('reviewContent').value.trim();
            const isAnonymous = document.getElementById('reviewAnonymous')?.checked || false;
            if (!content || !currentNovel) return;

            const result = await db.reviews.upsert(currentNovel.id, content, isAnonymous);

            if (result.success) {
                showToast('Đã gửi đánh giá!', 'success');
                document.getElementById('reviewTitle').value = '';
                document.getElementById('reviewContent').value = '';
                if (document.getElementById('reviewAnonymous')) {
                    document.getElementById('reviewAnonymous').checked = false;
                }
                await loadReviews();
            } else {
                showToast(result.error || 'Không thể gửi đánh giá', 'error');
            }
        }
    });
}

// =====================================================
// THREADED COMMENT REPLY FUNCTIONS
// =====================================================

// Toggle reply form visibility
window.toggleReplyForm = function(commentId) {
    const replyForm = document.getElementById(`replyForm-${commentId}`);
    if (replyForm) {
        replyForm.classList.toggle('hidden');
        // Focus on textarea when showing
        if (!replyForm.classList.contains('hidden')) {
            document.getElementById(`replyInput-${commentId}`)?.focus();
        }
    }
};

// Cancel reply
window.cancelReply = function(commentId) {
    const replyForm = document.getElementById(`replyForm-${commentId}`);
    const replyInput = document.getElementById(`replyInput-${commentId}`);
    const replyAnonymous = document.getElementById(`replyAnonymous-${commentId}`);

    if (replyForm) replyForm.classList.add('hidden');
    if (replyInput) replyInput.value = '';
    if (replyAnonymous) replyAnonymous.checked = false;
};

// Submit reply
window.submitReply = async function(parentCommentId) {
    const content = document.getElementById(`replyInput-${parentCommentId}`)?.value.trim();
    const isAnonymous = document.getElementById(`replyAnonymous-${parentCommentId}`)?.checked || false;

    if (!content || !currentNovel) return;

    const result = await db.comments.create(currentNovel.id, content, isAnonymous, parentCommentId);

    if (result.success) {
        showToast('Đã gửi trả lời!', 'success');
        cancelReply(parentCommentId);
        await loadReplies(parentCommentId);
    } else {
        showToast(result.error || 'Không thể gửi trả lời', 'error');
    }
};

// Load replies for a comment
async function loadReplies(commentId) {
    const result = await db.comments.getReplies(commentId);
    const repliesContainer = document.getElementById(`replies-${commentId}`);
    const toggleButton = document.getElementById(`toggleReplies-${commentId}`);

    if (!result.success || !repliesContainer) return;

    const replies = result.data || [];

    if (replies.length === 0) {
        repliesContainer.innerHTML = '';
        if (toggleButton) toggleButton.innerHTML = '';
        return;
    }

    // Render replies (initially hidden)
    repliesContainer.innerHTML = `
        <div id="repliesContent-${commentId}" class="hidden">
            ${replies.map(reply => renderComment(reply, true)).join('')}
        </div>
    `;

    // Add toggle button
    if (toggleButton) {
        toggleButton.innerHTML = `
            <button onclick="toggleReplies('${commentId}')" class="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
                <span id="toggleText-${commentId}">▶ Xem ${replies.length} câu trả lời</span>
            </button>
        `;
    }
}

// Toggle replies visibility
window.toggleReplies = function(commentId) {
    const repliesContent = document.getElementById(`repliesContent-${commentId}`);
    const toggleText = document.getElementById(`toggleText-${commentId}`);

    if (!repliesContent || !toggleText) return;

    const isHidden = repliesContent.classList.contains('hidden');
    const replyCount = repliesContent.querySelectorAll('[data-comment-id]').length;

    if (isHidden) {
        repliesContent.classList.remove('hidden');
        toggleText.textContent = `▼ Ẩn ${replyCount} câu trả lời`;
    } else {
        repliesContent.classList.add('hidden');
        toggleText.textContent = `▶ Xem ${replyCount} câu trả lời`;
    }
};

// Load all replies when comments are loaded
async function loadAllReplies() {
    const commentElements = document.querySelectorAll('[data-comment-id]');
    for (const element of commentElements) {
        const commentId = element.dataset.commentId;
        if (commentId && !element.classList.contains('ml-8')) { // Only for top-level comments
            await loadReplies(commentId);
        }
    }
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

// Also export as global functions for backward compatibility
window.openNovelModal = openNovelModal;
window.closeNovelModal = closeNovelModal;

