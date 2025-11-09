// =====================================================
// PROFILE PAGE LOGIC
// =====================================================

let currentUser = null;
let userProfile = null;

// Initialize page
async function init() {
    await initAuth();
    if (currentUser && userProfile) {
        displayProfileInfo();
        await loadRequestHistory();
        await loadMyNovels();
        setupEventListeners();
    }
}

// Initialize authentication
async function initAuth() {
    currentUser = await db.auth.getCurrentUser();
    const userMenu = document.getElementById('userMenu');
    
    if (!currentUser) {
        userMenu.innerHTML = `
            <a href="login.html" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Đăng nhập
            </a>
        `;
        
        // Redirect to login if not authenticated
        showToast('Vui lòng đăng nhập để xem trang này', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=profile.html';
        }, 2000);
        return;
    }
    
    userProfile = await db.auth.getUserProfile(currentUser.id);
    
    userMenu.innerHTML = `
        <div class="flex items-center gap-3">
            <a href="profile.html" class="text-green-600 font-semibold">👤 ${userProfile?.username || currentUser.email}</a>
            ${UIComponents.createRoleBadge(userProfile?.role || 'reader')}
            ${['admin', 'super_admin', 'sub_admin'].includes(userProfile?.role) ? '<a href="admin.html" class="text-blue-600 hover:underline">Quản trị</a>' : ''}
            <button onclick="logout()" class="text-red-600 hover:underline">Đăng xuất</button>
        </div>
    `;
}

// Display profile information
function displayProfileInfo() {
    document.getElementById('profileUsername').textContent = userProfile.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    // Display role badge
    const roleElement = document.getElementById('profileRole');
    roleElement.innerHTML = UIComponents.createRoleBadge(userProfile.role);
    
    // Display status
    const statusElement = document.getElementById('profileStatus');
    if (userProfile.is_banned) {
        statusElement.innerHTML = '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">🚫 Bị cấm</span>';
    } else {
        statusElement.innerHTML = '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">✅ Hoạt động</span>';
    }
    
    // Display created date
    const createdDate = new Date(userProfile.created_at);
    document.getElementById('profileCreatedAt').textContent = createdDate.toLocaleDateString('vi-VN');
    
    // Hide role upgrade section if user is admin or banned
    if (userProfile.role === 'admin' || userProfile.is_banned) {
        document.getElementById('roleUpgradeSection').style.display = 'none';
    }

    // Show "My Novels" section for translators and admins
    if (['translator', 'admin', 'super_admin', 'sub_admin'].includes(userProfile.role)) {
        document.getElementById('myNovelsSection').classList.remove('hidden');
    }

    // Filter available roles based on current role
    filterAvailableRoles();
}

// Filter available roles based on current role
function filterAvailableRoles() {
    const select = document.getElementById('requestedRole');
    const currentRole = userProfile.role;

    // Define role hierarchy
    const roleHierarchy = {
        'reader': ['translator'],
        'translator': ['admin'],
        'admin': [],
        'super_admin': [],
        'sub_admin': []
    };

    const availableRoles = roleHierarchy[currentRole] || [];

    // Clear and populate select options
    select.innerHTML = '<option value="">-- Chọn vai trò --</option>';

    if (availableRoles.includes('translator')) {
        select.innerHTML += '<option value="translator">Dịch giả (Translator)</option>';
    }
    if (availableRoles.includes('admin')) {
        select.innerHTML += '<option value="admin">Quản trị viên (Admin)</option>';
    }

    if (availableRoles.length === 0) {
        select.innerHTML = '<option value="">Bạn đã đạt vai trò cao nhất</option>';
        select.disabled = true;
    }
}

// Load user's uploaded novels
async function loadMyNovels() {
    const container = document.getElementById('myNovelsContainer');

    // Only load if user is translator or admin
    if (!['translator', 'admin', 'super_admin', 'sub_admin'].includes(userProfile.role)) {
        return;
    }

    const result = await db.novels.getByCreator(currentUser.id);

    if (!result.success || result.data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p class="mb-3">Bạn chưa tải lên truyện nào</p>
                <a href="upload.html" class="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Tải lên truyện đầu tiên
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="space-y-4">
            ${result.data.map(novel => {
                const statusBadge = getNovelStatusBadge(novel.is_approved, novel.approval_status);
                const createdDate = new Date(novel.created_at).toLocaleDateString('vi-VN');

                return `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-start gap-4">
                            ${novel.cover_image_url ? `
                                <img src="${novel.cover_image_url}"
                                     alt="${novel.title}"
                                     class="w-20 h-28 object-cover rounded-lg flex-shrink-0">
                            ` : `
                                <div class="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span class="text-gray-400 text-2xl">📚</span>
                                </div>
                            `}

                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2 mb-2">
                                    <h3 class="font-bold text-gray-900 text-lg">${novel.title}</h3>
                                    ${statusBadge}
                                </div>

                                <div class="text-sm text-gray-600 space-y-1 mb-3">
                                    <p><strong>Tác giả:</strong> ${novel.author_name}</p>
                                    ${novel.editor_name ? `<p><strong>Editor/Dịch giả:</strong> ${novel.editor_name}</p>` : ''}
                                    <p><strong>Số chương:</strong> ${novel.chapter_count || 0}${novel.extra_chapters ? ` + ${novel.extra_chapters} ngoại truyện` : ''}</p>
                                    <p><strong>Ngày tải lên:</strong> ${createdDate}</p>
                                    <p><strong>Đánh giá:</strong> ⭐ ${novel.avg_rating ? novel.avg_rating.toFixed(1) : '0.0'} (${novel.rating_count || 0} lượt)</p>
                                </div>

                                <div class="flex gap-2">
                                    <a href="upload.html?edit=${novel.id}"
                                       class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                        ✏️ Chỉnh sửa
                                    </a>
                                    ${novel.novel_url ? `
                                        <a href="${novel.novel_url}" target="_blank"
                                           class="text-green-600 hover:text-green-800 text-sm font-semibold">
                                            📖 Xem truyện
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Get novel status badge
function getNovelStatusBadge(isApproved, approvalStatus) {
    if (isApproved) {
        return '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold whitespace-nowrap">✅ Đã duyệt</span>';
    } else if (approvalStatus === 'pending') {
        return '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold whitespace-nowrap">⏳ Chờ duyệt</span>';
    } else if (approvalStatus === 'rejected') {
        return '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold whitespace-nowrap">❌ Bị từ chối</span>';
    }
    return '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold whitespace-nowrap">⏳ Chờ duyệt</span>';
}

// Load request history
async function loadRequestHistory() {
    const container = document.getElementById('requestsContainer');
    
    const result = await db.roleUpgradeRequests.getUserRequests();
    
    if (!result.success || result.data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                Bạn chưa có yêu cầu nâng cấp nào
            </div>
        `;
        return;
    }
    
    container.innerHTML = result.data.map(request => {
        const statusBadge = getStatusBadge(request.status);
        const createdDate = new Date(request.created_at).toLocaleDateString('vi-VN');

        return `
            <div class="border-b border-gray-200 py-4 last:border-b-0">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <span class="font-semibold text-gray-800">
                            ${getRoleName(request.from_role)} → ${getRoleName(request.to_role)}
                        </span>
                        ${statusBadge}
                    </div>
                    <span class="text-sm text-gray-500">${createdDate}</span>
                </div>

                ${request.request_message ? `
                    <p class="text-sm text-gray-600 mb-2">
                        <strong>Lý do:</strong> ${request.request_message}
                    </p>
                ` : ''}

                ${request.website_url ? `
                    <p class="text-sm text-gray-600 mb-2">
                        <strong>🔗 Website/Wattpad:</strong>
                        <a href="${request.website_url}" target="_blank" class="text-blue-600 hover:underline">
                            ${request.website_url}
                        </a>
                    </p>
                ` : ''}

                ${request.proof_image_url ? `
                    <p class="text-sm text-gray-600 mb-2">
                        <strong>📷 Ảnh chứng minh:</strong>
                        <a href="${request.proof_image_url}" target="_blank" class="text-blue-600 hover:underline">
                            Xem ảnh
                        </a>
                    </p>
                ` : ''}

                ${request.admin_notes ? `
                    <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                        <strong>Ghi chú từ quản trị viên:</strong> ${request.admin_notes}
                    </p>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">⏳ Đang chờ</span>',
        'approved': '<span class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">✅ Đã duyệt</span>',
        'rejected': '<span class="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">❌ Từ chối</span>'
    };
    return badges[status] || '';
}

// Get role name in Vietnamese
function getRoleName(role) {
    const names = {
        'reader': 'Độc giả',
        'translator': 'Dịch giả',
        'admin': 'Quản trị viên',
        'super_admin': 'Quản trị viên cấp cao',
        'sub_admin': 'Quản trị viên phụ'
    };
    return names[role] || role;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('submitRequestBtn').addEventListener('click', submitRequest);

    // Show/hide verification fields based on selected role
    document.getElementById('requestedRole').addEventListener('change', function() {
        const verificationFields = document.getElementById('verificationFields');
        if (this.value === 'translator') {
            verificationFields.classList.remove('hidden');
        } else {
            verificationFields.classList.add('hidden');
        }
    });
}

// Submit role upgrade request
async function submitRequest() {
    const requestedRole = document.getElementById('requestedRole').value;
    const requestMessage = document.getElementById('requestMessage').value.trim();
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    const proofImageUrl = document.getElementById('proofImageUrl').value.trim();

    if (!requestedRole) {
        showToast('Vui lòng chọn vai trò muốn nâng cấp', 'error');
        return;
    }

    if (!requestMessage) {
        showToast('Vui lòng nhập lý do yêu cầu nâng cấp', 'error');
        return;
    }

    // Validate verification fields for translator requests
    if (requestedRole === 'translator') {
        if (!websiteUrl) {
            showToast('Vui lòng nhập link website/Wattpad của bạn', 'error');
            return;
        }

        if (!proofImageUrl) {
            showToast('Vui lòng nhập link ảnh chứng minh', 'error');
            return;
        }

        // Basic URL validation
        try {
            new URL(websiteUrl);
            new URL(proofImageUrl);
        } catch (e) {
            showToast('Link không hợp lệ. Vui lòng kiểm tra lại.', 'error');
            return;
        }
    }

    const btn = document.getElementById('submitRequestBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang gửi...';

    const result = await db.roleUpgradeRequests.create(
        requestedRole,
        requestMessage,
        requestedRole === 'translator' ? websiteUrl : null,
        requestedRole === 'translator' ? proofImageUrl : null
    );

    if (result.success) {
        showToast('Đã gửi yêu cầu nâng cấp thành công!', 'success');
        document.getElementById('requestedRole').value = '';
        document.getElementById('requestMessage').value = '';
        document.getElementById('websiteUrl').value = '';
        document.getElementById('proofImageUrl').value = '';
        document.getElementById('verificationFields').classList.add('hidden');
        await loadRequestHistory();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = originalText;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all ${
        type === 'error' ? 'bg-red-600' : 'bg-green-600'
    } text-white`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Logout function
async function logout() {
    const result = await db.auth.signOut();
    if (result.success) {
        window.location.href = 'index.html';
    }
}

// =====================================================
// EDIT USERNAME FUNCTIONALITY
// =====================================================

function initEditUsername() {
    const editBtn = document.getElementById('editUsernameBtn');
    const modal = document.getElementById('editUsernameModal');
    const closeBtn = document.getElementById('closeEditUsernameModal');
    const cancelBtn = document.getElementById('cancelEditUsername');
    const form = document.getElementById('editUsernameForm');
    const input = document.getElementById('newUsername');

    // Open modal
    editBtn.addEventListener('click', () => {
        input.value = userProfile.username;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        input.focus();
    });

    // Close modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        input.value = '';
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'editUsernameModal') closeModal();
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUsername = input.value.trim();

        if (!newUsername || newUsername.length < 3 || newUsername.length > 50) {
            showToast('Tên người dùng phải có từ 3-50 ký tự', 'error');
            return;
        }

        if (newUsername === userProfile.username) {
            showToast('Tên người dùng mới giống tên cũ', 'error');
            return;
        }

        // Update username
        const result = await db.auth.updateUsername(currentUser.id, newUsername);

        if (result.success) {
            userProfile.username = newUsername;
            document.getElementById('profileUsername').textContent = newUsername;
            showToast('Đã cập nhật tên người dùng thành công!', 'success');
            closeModal();

            // Refresh user menu
            await initAuth();
        } else {
            showToast('Lỗi: ' + result.error, 'error');
        }
    });
}

// =====================================================
// HEADER SCROLL EFFECT
// =====================================================

function initHeaderScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(10px)';
        } else {
            nav.classList.remove('scrolled');
            nav.style.backgroundColor = 'white';
            nav.style.backdropFilter = 'none';
        }
    });
}

// Initialize on page load
async function initPage() {
    await init();
    if (currentUser && userProfile) {
        initEditUsername();
    }
    initHeaderScroll();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

