// =====================================================
// RANKING PAGE
// =====================================================

let currentPeriod = 'all';
let currentType = 'rating';

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    initPeriodButtons();
    initRankingTabs();
    loadRanking();
});

// =====================================================
// AUTHENTICATION
// =====================================================

async function initAuth() {
    const user = await db.auth.getCurrentUser();
    const userMenu = document.getElementById('userMenu');

    if (!user) {
        userMenu.innerHTML = `
            <a href="login.html" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Đăng nhập
            </a>
        `;
        return;
    }

    const profile = await db.auth.getUserProfile(user.id);

    userMenu.innerHTML = `
        <div class="flex items-center gap-3">
            <a href="profile.html" class="text-gray-700 hover:text-green-600">👤 ${profile?.username || user.email}</a>
            ${UIComponents.createRoleBadge(profile?.role || 'reader')}
            ${profile?.role === 'admin' ? '<a href="admin.html" class="text-blue-600 hover:underline">Quản trị</a>' : ''}
            ${profile?.role === 'admin' ? '<a href="admin-users.html" class="text-purple-600 hover:underline">Người dùng</a>' : ''}
            <button onclick="logout()" class="text-red-600 hover:underline">Đăng xuất</button>
        </div>
    `;
}

async function logout() {
    await db.auth.signOut();
    window.location.href = 'index.html';
}

// =====================================================
// PERIOD BUTTONS
// =====================================================

function initPeriodButtons() {
    const buttons = document.querySelectorAll('.period-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update current period
            currentPeriod = btn.dataset.period;
            
            // Reload ranking
            loadRanking();
        });
    });
}

// =====================================================
// RANKING TABS
// =====================================================

function initRankingTabs() {
    const tabs = document.querySelectorAll('.ranking-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update current type
            currentType = tab.dataset.type;
            
            // Reload ranking
            loadRanking();
        });
    });
}

// =====================================================
// LOAD RANKING
// =====================================================

async function loadRanking() {
    showLoading();
    
    // Get all approved novels
    const result = await db.novels.getAll();
    
    if (!result.success) {
        hideLoading();
        UIComponents.showToast('Không thể tải dữ liệu', 'error');
        return;
    }
    
    // Filter by period
    let filtered = filterByPeriod(result.data, currentPeriod);
    
    // Sort by type
    let sorted = sortByType(filtered, currentType);
    
    // Display ranking
    displayRanking(sorted);
    
    hideLoading();
}

function filterByPeriod(novels, period) {
    if (period === 'all') {
        return novels;
    }
    
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case 'quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'week':
            const dayOfWeek = now.getDay();
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            return novels;
    }
    
    return novels.filter(novel => new Date(novel.created_at) >= startDate);
}

function sortByType(novels, type) {
    const sorted = [...novels];
    
    switch (type) {
        case 'rating':
            sorted.sort((a, b) => {
                const ratingDiff = (b.avg_rating || 0) - (a.avg_rating || 0);
                if (ratingDiff !== 0) return ratingDiff;
                // If same rating, sort by rating count
                return (b.rating_count || 0) - (a.rating_count || 0);
            });
            break;
        case 'views':
            // Since we don't have views tracking, use rating_count as proxy
            sorted.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
            break;
        case 'nominations':
            sorted.sort((a, b) => (b.nomination_count || 0) - (a.nomination_count || 0));
            break;
        case 'newest':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }
    
    return sorted;
}

// =====================================================
// DISPLAY RANKING
// =====================================================

function displayRanking(novels) {
    const container = document.getElementById('rankingContent');
    const noResults = document.getElementById('noResults');
    
    if (novels.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Take top 50
    const topNovels = novels.slice(0, 50);
    
    container.innerHTML = `
        <div class="space-y-4">
            ${topNovels.map((novel, index) => createRankingItem(novel, index + 1)).join('')}
        </div>
    `;
}

function createRankingItem(novel, rank) {
    const tags = novel.tags || [];
    const rating = novel.avg_rating || 0;
    const ratingCount = novel.rating_count || 0;
    const nominationCount = novel.nomination_count || 0;
    
    let rankClass = 'rank-other';
    let rankIcon = rank;
    
    if (rank === 1) {
        rankClass = 'rank-1';
        rankIcon = '🥇';
    } else if (rank === 2) {
        rankClass = 'rank-2';
        rankIcon = '🥈';
    } else if (rank === 3) {
        rankClass = 'rank-3';
        rankIcon = '🥉';
    }
    
    return `
        <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onclick="openNovelModal('${novel.id}')">
            <!-- Rank -->
            <div class="rank-medal ${rankClass}">
                ${rankIcon}
            </div>
            
            <!-- Cover Image -->
            <div class="w-16 h-20 flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 rounded overflow-hidden">
                ${novel.cover_image_url 
                    ? `<img src="${novel.cover_image_url}" alt="${novel.title}" class="w-full h-full object-cover">` 
                    : `<div class="w-full h-full flex items-center justify-center text-2xl">📖</div>`
                }
            </div>
            
            <!-- Novel Info -->
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg text-gray-800 mb-1 truncate">${novel.title}</h3>
                <p class="text-sm text-gray-600 mb-2">✍️ ${novel.author_name}</p>
                
                <div class="flex flex-wrap gap-2 items-center">
                    ${tags.slice(0, 3).map(tag => `
                        <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">${tag.name}</span>
                    `).join('')}
                    ${tags.length > 3 ? `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+${tags.length - 3}</span>` : ''}
                </div>
            </div>
            
            <!-- Stats -->
            <div class="flex flex-col items-end gap-2 text-sm">
                ${currentType === 'rating' ? `
                    <div class="flex items-center gap-2">
                        <span class="text-yellow-500 text-lg">${'⭐'.repeat(Math.floor(rating))}</span>
                        <span class="font-bold text-gray-800">${rating.toFixed(1)}</span>
                    </div>
                    <span class="text-gray-500">${ratingCount} đánh giá</span>
                ` : ''}
                
                ${currentType === 'views' ? `
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">👁️</span>
                        <span class="font-bold text-gray-800">${ratingCount}</span>
                    </div>
                    <span class="text-gray-500">lượt xem</span>
                ` : ''}
                
                ${currentType === 'nominations' ? `
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">🎯</span>
                        <span class="font-bold text-gray-800">${nominationCount}</span>
                    </div>
                    <span class="text-gray-500">đề cử</span>
                ` : ''}
                
                ${currentType === 'newest' ? `
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">🆕</span>
                    </div>
                    <span class="text-gray-500">${formatDate(novel.created_at)}</span>
                ` : ''}
                
                <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">${novel.status}</span>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Hôm nay';
    } else if (diffDays === 1) {
        return 'Hôm qua';
    } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} tuần trước`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} tháng trước`;
    } else {
        return date.toLocaleDateString('vi-VN');
    }
}

// =====================================================
// LOADING OVERLAY
// =====================================================

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

