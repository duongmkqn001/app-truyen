// =====================================================
// ADMIN USER MANAGEMENT PAGE LOGIC
// =====================================================

let currentUser = null;
let userProfile = null;
let allUsers = [];
let allRequests = [];
let currentEditUserId = null;

// Initialize page
async function init() {
    await initAuth();
    if (currentUser && userProfile && userProfile.role === 'admin') {
        await loadData();
        setupEventListeners();
        setupTabs();
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
        
        showToast('Vui lòng đăng nhập để xem trang này', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=admin-users.html';
        }, 2000);
        return;
    }
    
    userProfile = await db.auth.getUserProfile(currentUser.id);
    
    // Check if user is admin
    if (!userProfile || userProfile.role !== 'admin') {
        showToast('Bạn không có quyền truy cập trang này', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    userMenu.innerHTML = `
        <div class="flex items-center gap-3">
            <a href="profile.html" class="text-gray-700 hover:text-green-600">👤 ${userProfile.username}</a>
            ${UIComponents.createRoleBadge(userProfile.role)}
            <button onclick="logout()" class="text-red-600 hover:underline">Đăng xuất</button>
        </div>
    `;
}

// Load all data
async function loadData() {
    await Promise.all([
        loadUsers(),
        loadRequests(),
        updateStats()
    ]);
}

// Load all users
async function loadUsers() {
    const result = await db.auth.getAllUsers(1000, 0);
    if (result.success) {
        allUsers = result.data;
        displayUsers(allUsers);
    }
}

// Load all role upgrade requests
async function loadRequests() {
    const result = await db.roleUpgradeRequests.getPendingRequests();
    if (result.success) {
        allRequests = result.data;
        displayRequests(allRequests);
    }
}

// Update statistics
async function updateStats() {
    const totalUsers = allUsers.length;
    const pendingUsers = allUsers.filter(u => u.role === 'pending_approval').length;
    const bannedUsers = allUsers.filter(u => u.is_banned).length;
    const pendingRequests = allRequests.length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('pendingUsers').textContent = pendingUsers;
    document.getElementById('bannedUsers').textContent = bannedUsers;
    document.getElementById('pendingRequests').textContent = pendingRequests;
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const createdDate = new Date(user.created_at).toLocaleDateString('vi-VN');
        const statusBadge = user.is_banned 
            ? '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">🚫 Bị cấm</span>'
            : '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">✅ Hoạt động</span>';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${user.username}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${user.email || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${UIComponents.createRoleBadge(user.role)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${createdDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex gap-2">
                        <button onclick="editUser('${user.id}')" class="text-blue-600 hover:text-blue-800 font-medium">
                            Sửa
                        </button>
                        ${user.is_banned ? `
                            <button onclick="unbanUser('${user.id}')" class="text-green-600 hover:text-green-800 font-medium">
                                Bỏ cấm
                            </button>
                        ` : `
                            <button onclick="banUser('${user.id}')" class="text-red-600 hover:text-red-800 font-medium">
                                Cấm
                            </button>
                        `}
                        <button onclick="deleteUser('${user.id}', '${user.username}')" class="text-red-600 hover:text-red-800 font-medium">
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Display requests in table
function displayRequests(requests) {
    const tbody = document.getElementById('requestsTableBody');
    
    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    Không có yêu cầu nào đang chờ duyệt
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = requests.map(request => {
        const createdDate = new Date(request.created_at).toLocaleDateString('vi-VN');
        const user = request.users;

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${user.username}</div>
                    <div class="text-sm text-gray-500">${user.email || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${UIComponents.createRoleBadge(request.from_role)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${UIComponents.createRoleBadge(request.to_role)}
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 max-w-xs">
                        <div class="mb-1 ${!request.request_message ? 'text-gray-400' : ''}" title="${request.request_message || ''}">
                            ${request.request_message || 'Không có lý do'}
                        </div>
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${createdDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex gap-2">
                        <button onclick="approveRequest('${request.id}')" class="text-green-600 hover:text-green-800 font-medium">
                            ✅ Duyệt
                        </button>
                        <button onclick="rejectRequest('${request.id}')" class="text-red-600 hover:text-red-800 font-medium">
                            ❌ Từ chối
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search and filters
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('roleFilter').addEventListener('change', filterUsers);
    document.getElementById('statusFilter').addEventListener('change', filterUsers);
    
    // Edit modal
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveUserBtn').addEventListener('click', saveUserChanges);
}

// Setup tabs
function setupTabs() {
    document.getElementById('tabAllUsers').addEventListener('click', () => switchTab('allUsers'));
    document.getElementById('tabRequests').addEventListener('click', () => switchTab('requests'));
}

// Switch tab
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    
    if (tab === 'allUsers') {
        document.getElementById('tabAllUsers').classList.add('active');
        document.getElementById('allUsersTab').classList.remove('hidden');
    } else {
        document.getElementById('tabRequests').classList.add('active');
        document.getElementById('requestsTab').classList.remove('hidden');
    }
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allUsers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm) || 
                            (user.email && user.email.toLowerCase().includes(searchTerm));
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'active' && !user.is_banned) ||
                            (statusFilter === 'banned' && user.is_banned);
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    displayUsers(filtered);
}

// Edit user
window.editUser = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    currentEditUserId = userId;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editUserModal').classList.remove('hidden');
    document.getElementById('editUserModal').classList.add('flex');
}

// Close edit modal
function closeEditModal() {
    currentEditUserId = null;
    document.getElementById('editUserModal').classList.add('hidden');
    document.getElementById('editUserModal').classList.remove('flex');
}

// Save user changes
async function saveUserChanges() {
    if (!currentEditUserId) return;
    
    const newRole = document.getElementById('editRole').value;
    const result = await db.auth.updateUserRole(currentEditUserId, newRole);
    
    if (result.success) {
        showToast('Đã cập nhật vai trò thành công', 'success');
        closeEditModal();
        await loadData();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }
}

// Ban user
window.banUser = async function(userId) {
    if (!confirm('Bạn có chắc muốn cấm người dùng này?')) return;
    
    const result = await db.auth.banUser(userId);
    if (result.success) {
        showToast('Đã cấm người dùng', 'success');
        await loadData();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }
}

// Unban user
window.unbanUser = async function(userId) {
    const result = await db.auth.unbanUser(userId);
    if (result.success) {
        showToast('Đã bỏ cấm người dùng', 'success');
        await loadData();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }
}

// Delete user
window.deleteUser = async function(userId, username) {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${username}"? Hành động này không thể hoàn tác!`)) return;
    
    const result = await db.auth.deleteUser(userId);
    if (result.success) {
        showToast('Đã xóa người dùng', 'success');
        await loadData();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }
}

// Approve request
window.approveRequest = async function(requestId) {
    const notes = prompt('Ghi chú (tùy chọn):');
    if (notes === null) return; // User cancelled
    
    const result = await db.roleUpgradeRequests.approve(requestId, notes);
    if (result.success) {
        showToast('Đã duyệt yêu cầu nâng cấp', 'success');
        await loadData();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }
}

// Reject request
window.rejectRequest = async function(requestId) {
    const notes = prompt('Lý do từ chối:');
    if (!notes) {
        showToast('Vui lòng nhập lý do từ chối', 'error');
        return;
    }
    
    const result = await db.roleUpgradeRequests.reject(requestId, notes);
    if (result.success) {
        showToast('Đã từ chối yêu cầu', 'success');
        await loadData();
    } else {
        showToast('Lỗi: ' + result.error, 'error');
    }
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

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

