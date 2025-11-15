// =====================================================
// ADMIN UI LOGIC
// =====================================================

// Check admin access
async function checkAdminAccess() {
    const isAdmin = await db.auth.isAdmin();
    if (!isAdmin) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Show/hide loading
function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

// Show message toast
function showMessage(message, isError = false) {
    const toast = document.getElementById('messageToast');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = message;
    toast.className = `fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 border-l-4 z-50 ${
        isError ? 'border-red-500' : 'border-green-500'
    }`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Tab switching
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active', 'bg-green-50', 'text-green-700', 'border-b-2', 'border-green-600'));

            // Add active class to clicked button
            button.classList.add('active', 'bg-green-50', 'text-green-700', 'border-b-2', 'border-green-600');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.add('hidden'));

            // Show corresponding content
            const tabId = button.id.replace('tab', 'content');
            document.getElementById(tabId).classList.remove('hidden');

            // Load data for the tab
            loadTabData(tabId);
        });
    });
}

// Load data for specific tab
async function loadTabData(tabId) {
    switch(tabId) {
        case 'contentPendingNovels':
            await loadPendingNovels();
            break;
        case 'contentRoleUpgradeRequests':
            await loadRoleUpgradeRequests();
            break;
        case 'contentUsers':
            await loadUsers();
            break;
        case 'contentNovels':
            await loadNovels();
            break;
        case 'contentReports':
            await loadReports();
            break;
    }
}

// Load statistics
async function loadStats() {
    const result = await admin.stats.getDashboard();
    
    if (result.success) {
        const stats = result.data;
        const statsSection = document.getElementById('statsSection');
        
        statsSection.innerHTML = `
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">Tổng người dùng</p>
                        <p class="text-3xl font-bold text-green-600">${stats.totalUsers}</p>
                    </div>
                    <div class="text-4xl">👥</div>
                </div>
            </div>
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">Tổng truyện</p>
                        <p class="text-3xl font-bold text-blue-600">${stats.totalNovels}</p>
                    </div>
                    <div class="text-4xl">📚</div>
                </div>
            </div>
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">Tổng bình luận</p>
                        <p class="text-3xl font-bold text-purple-600">${stats.totalComments}</p>
                    </div>
                    <div class="text-4xl">💬</div>
                </div>
            </div>
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">Tổng đánh giá</p>
                        <p class="text-3xl font-bold text-orange-600">${stats.totalRatings}</p>
                    </div>
                    <div class="text-4xl">⭐</div>
                </div>
            </div>
        `;
    }
}

// DEPRECATED: Users are now auto-approved as 'reader' role
// No longer need pending member approval
// async function loadPendingMembers() { ... }

// Load pending novels
async function loadPendingNovels() {
    showLoading();
    const result = await db.novels.getPending();
    hideLoading();

    const table = document.getElementById('pendingNovelsTable');

    if (!result.success || result.data.length === 0) {
        table.innerHTML = '<p class="text-gray-500 text-center py-8">Không có truyện chờ duyệt.</p>';
        return;
    }

    table.innerHTML = `
        <table class="min-w-full divide-y divide-green-100">
            <thead class="bg-green-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ảnh bìa</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thông tin truyện</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Người tải lên</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày tải</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-green-50">
                ${result.data.map(novel => `
                    <tr class="hover:bg-green-50">
                        <td class="px-6 py-4">
                            ${novel.cover_image_url
                                ? `<img src="${novel.cover_image_url}" alt="${novel.title}" class="w-16 h-24 object-cover rounded shadow-sm cursor-pointer" onclick="viewNovelDetail('${novel.id}')" onerror="this.src='https://via.placeholder.com/64x96?text=No+Image'">`
                                : `<div class="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">Không có ảnh</div>`
                            }
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-semibold text-gray-900 mb-1">${novel.title}</div>
                            <div class="text-sm text-gray-600 mb-1">
                                <span class="font-medium">Tác giả:</span> ${novel.author_name}
                                ${novel.editor_name ? ` | <span class="font-medium">Editor:</span> ${novel.editor_name}` : ''}
                            </div>
                            <div class="text-sm text-gray-600 mb-1">
                                <span class="font-medium">Chương:</span> ${novel.chapter_count || 0}
                                ${novel.extra_chapters ? ` + ${novel.extra_chapters} ngoại truyện` : ''}
                                | <span class="font-medium">Tình trạng:</span> ${novel.status || 'Đang ra'}
                            </div>
                            ${novel.tag_names && novel.tag_names.length > 0 ? `
                                <div class="flex flex-wrap gap-1 mt-2">
                                    ${novel.tag_names.map((tag, idx) => `
                                        <span class="px-2 py-0.5 text-xs rounded-full bg-${novel.tag_colors?.[idx] || 'gray'}-100 text-${novel.tag_colors?.[idx] || 'gray'}-700">
                                            ${tag}
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                            <button onclick="viewNovelDetail('${novel.id}')" class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
                                📖 Xem chi tiết đầy đủ
                            </button>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${novel.creator_username || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${new Date(novel.created_at).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <button onclick="approveNovel('${novel.id}')" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg mr-2 mb-1 block w-full">
                                ✓ Duyệt
                            </button>
                            <button onclick="rejectNovel('${novel.id}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg block w-full">
                                ✗ Từ chối
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load translator requests
async function loadRoleUpgradeRequests() {
    showLoading();
    const result = await db.roleUpgradeRequests.getPendingRequests();
    hideLoading();

    console.log('Role upgrade requests result:', result);

    const table = document.getElementById('roleUpgradeRequestsTable');

    if (!result.success) {
        table.innerHTML = `<p class="text-red-500 text-center py-8">Lỗi: ${result.error || 'Không thể tải yêu cầu'}</p>`;
        return;
    }

    if (result.data.length === 0) {
        table.innerHTML = '<p class="text-gray-500 text-center py-8">Không có yêu cầu nâng cấp vai trò.</p>';
        return;
    }

    table.innerHTML = `
        <table class="min-w-full divide-y divide-green-100">
            <thead class="bg-green-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Người dùng</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Từ vai trò</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Lên vai trò</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Lý do & Xác minh</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày yêu cầu</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-green-50">
                ${result.data.map(request => {
                    // Handle nested users object from join
                    const username = request.users?.username || 'N/A';
                    return `
                    <tr class="hover:bg-green-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="font-medium text-gray-900">${username}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            ${UIComponents.createRoleBadge(request.from_role)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            ${UIComponents.createRoleBadge(request.to_role)}
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-700 max-w-md">
                                <div class="mb-1">${request.request_message || 'Không có lý do'}</div>
                                ${request.website_url ? `
                                    <div class="mt-1">
                                        <a href="${request.website_url}" target="_blank" class="text-blue-600 hover:underline text-xs">
                                            🔗 Website/Wattpad
                                        </a>
                                    </div>
                                ` : ''}
                                ${request.proof_image_url ? `
                                    <div class="mt-1">
                                        <a href="${request.proof_image_url}" target="_blank" class="text-blue-600 hover:underline text-xs">
                                            📷 Xem ảnh chứng minh
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${new Date(request.created_at).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <button onclick="approveRoleUpgradeRequest('${request.id}')" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg mr-2">
                                ✓ Duyệt
                            </button>
                            <button onclick="rejectRoleUpgradeRequest('${request.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                                ✗ Từ chối
                            </button>
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

// Load users
async function loadUsers() {
    showLoading();
    const result = await db.auth.getAllUsers();
    hideLoading();
    
    if (result.success) {
        const usersTable = document.getElementById('usersTable');
        
        if (result.data.length === 0) {
            usersTable.innerHTML = '<p class="text-gray-500 text-center py-8">Không có người dùng nào.</p>';
            return;
        }
        
        usersTable.innerHTML = `
            <table class="min-w-full divide-y divide-green-100">
                <thead class="bg-green-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tên</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vai trò</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày tạo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-green-50">
                    ${result.data.map(user => `
                        <tr class="hover:bg-green-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }">${user.role}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                    user.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }">${user.is_banned ? 'Bị khóa' : 'Hoạt động'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                ${new Date(user.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                ${user.is_banned 
                                    ? `<button onclick="unbanUser('${user.id}')" class="text-green-600 hover:text-green-800 font-semibold">Mở khóa</button>`
                                    : `<button onclick="banUser('${user.id}')" class="text-red-600 hover:text-red-800 font-semibold">Khóa</button>`
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        showMessage('Lỗi khi tải danh sách người dùng', true);
    }
}

// Load novels
async function loadNovels() {
    showLoading();
    const result = await admin.novels.getAll();
    hideLoading();
    
    if (result.success) {
        const novelsTable = document.getElementById('novelsTable');
        
        if (result.data.length === 0) {
            novelsTable.innerHTML = '<p class="text-gray-500 text-center py-8">Không có truyện nào.</p>';
            return;
        }
        
        novelsTable.innerHTML = `
            <table class="min-w-full divide-y divide-green-100">
                <thead class="bg-green-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tên truyện</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tác giả</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Duyệt</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-green-50">
                    ${result.data.map(novel => `
                        <tr class="hover:bg-green-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${novel.title}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${novel.author_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                    novel.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }">${novel.status}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                    novel.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }">${novel.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                ${!novel.is_approved
                                    ? `<button onclick="approveNovel('${novel.id}')" class="text-green-600 hover:text-green-800 font-semibold">Duyệt</button>`
                                    : ''
                                }
                                <button onclick="editNovel('${novel.id}')" class="text-blue-600 hover:text-blue-800 font-semibold">Sửa</button>
                                <button onclick="deleteNovel('${novel.id}')" class="text-red-600 hover:text-red-800 font-semibold">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        showMessage('Lỗi khi tải danh sách truyện', true);
    }
}

// Global functions for button actions
window.banUser = async (userId) => {
    if (!confirm('Bạn có chắc muốn khóa người dùng này?')) return;
    showLoading();
    const result = await admin.users.ban(userId);
    hideLoading();
    if (result.success) {
        showMessage('Đã khóa người dùng');
        loadUsers();
    } else {
        showMessage('Lỗi khi khóa người dùng', true);
    }
};

window.unbanUser = async (userId) => {
    showLoading();
    const result = await admin.users.unban(userId);
    hideLoading();
    if (result.success) {
        showMessage('Đã mở khóa người dùng');
        loadUsers();
    } else {
        showMessage('Lỗi khi mở khóa người dùng', true);
    }
};

window.approveNovel = async (novelId) => {
    showLoading();
    const result = await admin.novels.approve(novelId);
    hideLoading();
    if (result.success) {
        showMessage('Đã duyệt truyện');
        loadNovels();
    } else {
        showMessage('Lỗi khi duyệt truyện', true);
    }
};

window.deleteNovel = async (novelId) => {
    if (!confirm('Bạn có chắc muốn xóa truyện này?')) return;
    showLoading();
    const result = await admin.novels.delete(novelId);
    hideLoading();
    if (result.success) {
        showMessage('Đã xóa truyện');
        loadNovels();
    } else {
        showMessage('Lỗi khi xóa truyện', true);
    }
};

// DEPRECATED: Users are now auto-approved as 'reader' role
// No longer need pending member approval functionality

// Approve novel
window.approveNovel = async (novelId) => {
    showLoading();
    const result = await db.novels.approve(novelId);
    hideLoading();
    if (result.success) {
        showMessage('Đã duyệt truyện');
        loadPendingNovels();
    } else {
        showMessage(result.error || 'Lỗi khi duyệt truyện', true);
    }
};

// Reject novel
window.rejectNovel = async (novelId) => {
    const reason = prompt('Lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled

    showLoading();
    const result = await db.novels.reject(novelId, reason);
    hideLoading();
    if (result.success) {
        showMessage('Đã từ chối truyện');
        loadPendingNovels();
    } else {
        showMessage(result.error || 'Lỗi khi từ chối truyện', true);
    }
};

// Approve role upgrade request
window.approveRoleUpgradeRequest = async (requestId) => {
    const notes = prompt('Ghi chú cho người dùng (tùy chọn):');
    if (notes === null) return; // User cancelled

    showLoading();
    const result = await db.roleUpgradeRequests.approve(requestId, notes || '');
    hideLoading();
    if (result.success) {
        showMessage('Đã duyệt yêu cầu nâng cấp vai trò');
        loadRoleUpgradeRequests();
    } else {
        showMessage(result.error || 'Lỗi khi duyệt yêu cầu', true);
    }
};

// Reject role upgrade request
window.rejectRoleUpgradeRequest = async (requestId) => {
    const notes = prompt('Lý do từ chối:');
    if (!notes) {
        alert('Vui lòng nhập lý do từ chối');
        return;
    }

    showLoading();
    const result = await db.roleUpgradeRequests.reject(requestId, notes);
    hideLoading();
    if (result.success) {
        showMessage('Đã từ chối yêu cầu nâng cấp vai trò');
        loadRoleUpgradeRequests();
    } else {
        showMessage(result.error || 'Lỗi khi từ chối yêu cầu', true);
    }
};

// Refresh buttons
document.getElementById('refreshPendingNovels').addEventListener('click', loadPendingNovels);
document.getElementById('refreshRoleUpgradeRequests').addEventListener('click', loadRoleUpgradeRequests);
document.getElementById('refreshUsers').addEventListener('click', loadUsers);
document.getElementById('refreshNovels').addEventListener('click', loadNovels);

// =====================================================
// EDIT NOVEL FUNCTIONALITY
// =====================================================

let allTags = [];

async function editNovel(novelId) {
    try {
        // Load novel data
        const novelResult = await db.novels.getById(novelId);
        if (!novelResult.success) {
            showMessage('Không thể tải thông tin truyện', true);
            return;
        }

        const novel = novelResult.data;

        // Load all tags
        const tagsResult = await db.tags.getAll();
        if (tagsResult.success) {
            allTags = tagsResult.data;
        }

        // Populate form
        document.getElementById('editNovelId').value = novel.id;
        document.getElementById('editTitle').value = novel.title || '';
        document.getElementById('editAuthor').value = novel.author_name || '';
        document.getElementById('editEditor').value = novel.editor_name || '';
        document.getElementById('editChapterCount').value = novel.chapter_count || 0;
        document.getElementById('editExtraChapters').value = novel.extra_chapters || 0;
        document.getElementById('editStatus').value = novel.status || 'Đang ra';
        document.getElementById('editCoverImage').value = novel.cover_image_url || '';
        document.getElementById('editNovelUrl').value = novel.novel_url || '';
        document.getElementById('editSummary').value = novel.summary || '';

        // Render tags - handle both old format (tag_ids array) and new format (tags JSON array)
        let selectedTags = [];
        if (novel.tags && Array.isArray(novel.tags)) {
            // New format: tags is a JSON array of tag objects
            selectedTags = novel.tags;
        } else if (novel.tag_ids && Array.isArray(novel.tag_ids)) {
            // Fallback: construct tag objects from tag_ids, tag_names, and tag_colors arrays
            selectedTags = novel.tag_ids.map((id, index) => ({
                id: id,
                name: novel.tag_names?.[index] || '',
                color: novel.tag_colors?.[index] || '#10b981'
            }));
        }

        console.log('Novel tags for editing:', selectedTags);
        renderEditTags(selectedTags);

        // Initialize tag search
        initEditTagSearch();

        // Clear search input
        const searchInput = document.getElementById('editTagSearch');
        if (searchInput) searchInput.value = '';

        // Show modal
        document.getElementById('editNovelModal').classList.remove('hidden');

    } catch (error) {
        console.error('Error loading novel for edit:', error);
        showMessage('Lỗi khi tải thông tin truyện', true);
    }
}

function renderEditTags(selectedTags, searchQuery = '') {
    const container = document.getElementById('editTagsContainer');

    // Get selected tag IDs
    const selectedTagIds = selectedTags.map(t => t.id);

    // Filter tags based on search query
    const filteredTags = searchQuery
        ? allTags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : allTags;

    if (filteredTags.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">Không tìm thấy thể loại nào</p>';
        return;
    }

    container.innerHTML = filteredTags.map(tag => {
        const isSelected = selectedTagIds.includes(tag.id);
        return `
            <label class="inline-flex items-center mr-4 mb-2 cursor-pointer">
                <input type="checkbox"
                       class="edit-tag-checkbox mr-2 rounded"
                       value="${tag.id}"
                       data-tag-name="${tag.name}"
                       ${isSelected ? 'checked' : ''}>
                <span class="px-3 py-1 rounded-full text-sm" style="background-color: ${tag.color}20; color: ${tag.color};">
                    ${tag.name}
                </span>
            </label>
        `;
    }).join('');
}

// Add tag search functionality
function initEditTagSearch() {
    const searchInput = document.getElementById('editTagSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchQuery = e.target.value.trim();

        // Get currently selected tags
        const selectedTagIds = Array.from(document.querySelectorAll('.edit-tag-checkbox:checked'))
            .map(cb => cb.value);

        const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));

        // Re-render tags with search filter
        renderEditTags(selectedTags, searchQuery);
    });
}

function closeEditModal() {
    document.getElementById('editNovelModal').classList.add('hidden');
    document.getElementById('editNovelForm').reset();
}

// Handle edit form submission
document.getElementById('editNovelForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const novelId = document.getElementById('editNovelId').value;

    // Get selected tags
    const selectedTagIds = Array.from(document.querySelectorAll('.edit-tag-checkbox:checked'))
        .map(cb => cb.value);

    const updateData = {
        title: document.getElementById('editTitle').value,
        author_name: document.getElementById('editAuthor').value,
        editor_name: document.getElementById('editEditor').value || null,
        chapter_count: parseInt(document.getElementById('editChapterCount').value) || 0,
        extra_chapters: parseInt(document.getElementById('editExtraChapters').value) || 0,
        status: document.getElementById('editStatus').value,
        cover_image_url: document.getElementById('editCoverImage').value || null,
        novel_url: document.getElementById('editNovelUrl').value || null,
        summary: document.getElementById('editSummary').value || null,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : null
    };

    try {
        const result = await db.novels.update(novelId, updateData);

        if (result.success) {
            showMessage('Cập nhật truyện thành công!', false);
            closeEditModal();
            loadNovels(); // Refresh the novels list
        } else {
            showMessage(result.error || 'Không thể cập nhật truyện', true);
        }
    } catch (error) {
        console.error('Error updating novel:', error);
        showMessage('Lỗi khi cập nhật truyện', true);
    }
});

// Make editNovel function global
window.editNovel = editNovel;
window.closeEditModal = closeEditModal;

// =====================================================
// NOVEL DETAIL MODAL
// =====================================================

async function viewNovelDetail(novelId) {
    showLoading();
    const result = await db.novels.getById(novelId);
    hideLoading();

    if (!result.success || !result.data) {
        showMessage('Không thể tải thông tin truyện', true);
        return;
    }

    const novel = result.data;

    // Create modal HTML
    const modalHTML = `
        <div id="novelDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="closeNovelDetailModal(event)">
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold mb-2">${novel.title}</h2>
                            <p class="text-green-100">Chi tiết truyện chờ duyệt</p>
                        </div>
                        <button onclick="closeNovelDetailModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6">
                    <!-- Cover Image and Basic Info -->
                    <div class="flex gap-6 mb-6">
                        <div class="flex-shrink-0">
                            ${novel.cover_image_url
                                ? `<img src="${novel.cover_image_url}" alt="${novel.title}" class="w-48 h-72 object-cover rounded-lg shadow-lg" onerror="this.src='https://via.placeholder.com/192x288?text=No+Image'">`
                                : `<div class="w-48 h-72 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">Không có ảnh bìa</div>`
                            }
                        </div>
                        <div class="flex-1">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Tác giả</label>
                                    <p class="text-gray-900">${novel.author_name}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Editor/Dịch giả</label>
                                    <p class="text-gray-900">${novel.editor_name || 'Không có'}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Số chương</label>
                                    <p class="text-gray-900">${novel.chapter_count || 0} chương</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Ngoại truyện</label>
                                    <p class="text-gray-900">${novel.extra_chapters || 0} chương</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Tình trạng</label>
                                    <p class="text-gray-900">${novel.status || 'Đang ra'}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Người tải lên</label>
                                    <p class="text-gray-900">${novel.creator_username || 'N/A'}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Ngày tải lên</label>
                                    <p class="text-gray-900">${new Date(novel.created_at).toLocaleString('vi-VN')}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-semibold text-gray-600">Link truyện</label>
                                    ${novel.novel_url
                                        ? `<a href="${novel.novel_url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline break-all">Xem truyện</a>`
                                        : `<p class="text-gray-500">Không có</p>`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tags -->
                    ${novel.tag_names && novel.tag_names.length > 0 ? `
                        <div class="mb-6">
                            <label class="text-sm font-semibold text-gray-600 block mb-2">Thể loại</label>
                            <div class="flex flex-wrap gap-2">
                                ${novel.tag_names.map((tag, idx) => `
                                    <span class="px-3 py-1 rounded-full bg-${novel.tag_colors?.[idx] || 'gray'}-100 text-${novel.tag_colors?.[idx] || 'gray'}-700 font-medium">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Summary -->
                    <div class="mb-6">
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Tóm tắt</label>
                        <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            ${novel.summary
                                ? `<p class="text-gray-700 whitespace-pre-wrap">${novel.summary}</p>`
                                : `<p class="text-gray-400 italic">Không có tóm tắt</p>`
                            }
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-3 pt-4 border-t border-gray-200">
                        <button onclick="approveNovelFromModal('${novel.id}')" class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                            ✓ Duyệt truyện
                        </button>
                        <button onclick="rejectNovelFromModal('${novel.id}')" class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                            ✗ Từ chối
                        </button>
                        <button onclick="closeNovelDetailModal()" class="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeNovelDetailModal(event) {
    // Only close if clicking the backdrop or close button
    if (event && event.target.id !== 'novelDetailModal') return;

    const modal = document.getElementById('novelDetailModal');
    if (modal) {
        modal.remove();
    }
}

async function approveNovelFromModal(novelId) {
    await approveNovel(novelId);
    closeNovelDetailModal();
}

async function rejectNovelFromModal(novelId) {
    await rejectNovel(novelId);
    closeNovelDetailModal();
}

// Make functions globally available
window.viewNovelDetail = viewNovelDetail;
window.closeNovelDetailModal = closeNovelDetailModal;
window.approveNovelFromModal = approveNovelFromModal;
window.rejectNovelFromModal = rejectNovelFromModal;

// Initialize
(async () => {
    const hasAccess = await checkAdminAccess();
    if (hasAccess) {
        initTabSwitching();
        loadStats();
        loadPendingNovels(); // Load first tab by default
    }
})();

