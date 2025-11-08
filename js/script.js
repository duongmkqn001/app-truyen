// ===== DATA LOADING =====
let novelsData = [];
let rankingsData = [];

// Show error message in UI
function showErrorMessage(message, details = '') {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const errorHTML = `
        <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="ml-3 flex-1">
                    <h3 class="text-lg font-semibold text-red-800">
                        ${message}
                    </h3>
                    ${details ? `<p class="mt-2 text-sm text-red-700">${details}</p>` : ''}
                    <div class="mt-4">
                        <button onclick="location.reload()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                            🔄 Thử lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Find the table container and replace it with error message
    const tableContainer = mainContent.querySelector('.overflow-x-auto');
    if (tableContainer) {
        tableContainer.innerHTML = errorHTML;
    }

    // Also show error in rankings if available
    const rankingsContainer = document.getElementById('rankingsContainer');
    if (rankingsContainer) {
        rankingsContainer.innerHTML = `
            <div class="text-center p-4 text-red-600">
                <p class="text-sm font-semibold">Không thể tải dữ liệu</p>
            </div>
        `;
    }
}

// Load data from Supabase (ONLY data source)
async function loadData() {
    try {
        // Check if Supabase is configured
        if (!window.supabaseClient) {
            console.error('Supabase is not configured!');
            showErrorMessage(
                '⚠️ Chưa cấu hình Supabase',
                'Vui lòng cấu hình Supabase URL và API Key trong file js/config.js để sử dụng ứng dụng.'
            );
            return;
        }

        // Check if database service is available
        if (!window.db || !window.db.novels) {
            console.error('Database service not available!');
            showErrorMessage(
                '⚠️ Lỗi hệ thống',
                'Không thể tải dịch vụ cơ sở dữ liệu. Vui lòng kiểm tra file js/database.js.'
            );
            return;
        }

        // Load novels from Supabase
        const result = await db.novels.getAll();

        if (result.success && result.data) {
            novelsData = result.data;

            // Get top rated novels for rankings
            const rankingsResult = await db.novels.getMostNominated(6);
            if (rankingsResult.success) {
                rankingsData = rankingsResult.data;
            }

            // Render data
            renderNovelsTable();
            renderRankings();

            // Initialize search after data is loaded
            initializeSearch();
        } else {
            console.error('Failed to load from Supabase:', result.error);
            showErrorMessage(
                '❌ Không thể tải dữ liệu từ Supabase',
                result.error || 'Vui lòng kiểm tra kết nối internet và cấu hình Supabase của bạn.'
            );
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showErrorMessage(
            '❌ Lỗi khi tải dữ liệu',
            `Chi tiết: ${error.message || 'Lỗi không xác định'}. Vui lòng kiểm tra console để biết thêm thông tin.`
        );
    }
}

// Render novels table
function renderNovelsTable() {
    const tbody = document.querySelector('#novelTable tbody');
    if (!tbody) return;

    if (novelsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center">
                    <div class="text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p class="mt-4 text-lg font-semibold">Chưa có truyện nào</p>
                        <p class="mt-2 text-sm">Dữ liệu sẽ được hiển thị khi có truyện trong cơ sở dữ liệu.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = novelsData.map(novel => {
        // Supabase data structure
        const title = novel.title;
        const author = novel.author_name;
        const editor = novel.editor_name;
        const chapters = novel.chapter_count;
        const status = novel.status || 'ongoing';
        const lastUpdate = novel.updated_at
            ? new Date(novel.updated_at).toLocaleDateString('vi-VN')
            : '';
        const novelId = novel.id;

        // Handle tags from Supabase - Limit to 3 tags to prevent horizontal scrolling
        let genresHTML = '';
        if (novel.tag_names && novel.tag_names.length > 0) {
            const tagColors = novel.tag_colors || [];
            const maxTagsToShow = 3;
            const tagsToDisplay = novel.tag_names.slice(0, maxTagsToShow);
            const remainingCount = novel.tag_names.length - maxTagsToShow;

            genresHTML = tagsToDisplay.map((tag, index) => {
                const color = tagColors[index] || 'blue';
                return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800">${tag}</span>`;
            }).join(' ');

            // Add "+X more" indicator if there are more tags
            if (remainingCount > 0) {
                genresHTML += ` <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">+${remainingCount}</span>`;
            }
        } else {
            genresHTML = '<span class="text-xs text-gray-400">Chưa có thể loại</span>';
        }

        // Status display and color
        let statusDisplay = '';
        let statusColor = 'blue';

        if (status === 'completed') {
            statusDisplay = 'Hoàn thành';
            statusColor = 'green';
        } else if (status === 'ongoing') {
            statusDisplay = 'Đang tiến hành';
            statusColor = 'blue';
        } else if (status === 'hiatus') {
            statusDisplay = 'Tạm dừng';
            statusColor = 'yellow';
        } else {
            statusDisplay = status;
        }

        // Create author link
        const authorLink = author
            ? `<a href="author.html?author=${encodeURIComponent(author)}" class="text-sm text-green-600 hover:text-green-800 hover:underline font-medium" onclick="event.stopPropagation()">${author}</a>`
            : '<span class="text-sm text-gray-400">Chưa có</span>';

        return `
            <tr class="hover:bg-green-50 transition-colors cursor-pointer novel-row" data-novel-id="${novelId}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-700">${authorLink}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-700">${editor}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${genresHTML}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${chapters}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-${statusColor}-600 font-semibold">${statusDisplay}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${lastUpdate}
                </td>
            </tr>
        `;
    }).join('');
}

// Render rankings sidebar
function renderRankings() {
    const rankingsContainer = document.getElementById('rankingsContainer');
    if (!rankingsContainer) return;

    if (rankingsData.length === 0) {
        rankingsContainer.innerHTML = `
            <div class="text-center p-4 text-gray-500">
                <p class="text-sm">Chưa có bảng xếp hạng</p>
            </div>
        `;
        return;
    }

    rankingsContainer.innerHTML = rankingsData.map((item, index) => {
        const rank = index + 1;
        const title = item.title;

        // Supabase data structure
        const rating = item.avg_rating
            ? parseFloat(item.avg_rating).toFixed(1)
            : '0.0';
        const votes = item.nomination_count || item.rating_count || 0;

        if (rank <= 3) {
            // Top 3 with special styling
            const gradients = {
                1: 'from-yellow-50 to-amber-50 border-yellow-200',
                2: 'from-gray-50 to-slate-50 border-gray-200',
                3: 'from-orange-50 to-amber-50 border-orange-200'
            };
            const badgeColors = {
                1: 'bg-yellow-400',
                2: 'bg-gray-400',
                3: 'bg-orange-400'
            };

            return `
                <div class="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r ${gradients[rank]} border">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full ${badgeColors[rank]} flex items-center justify-center font-bold text-white">
                        ${rank}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-semibold text-gray-900 truncate">${title}</h3>
                        <p class="text-xs text-gray-600">⭐ ${rating} (${votes.toLocaleString()} votes)</p>
                    </div>
                </div>
            `;
        } else {
            // Ranks 4-6 with simpler styling
            return `
                <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">
                        ${rank}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-xs font-semibold text-gray-900 truncate">${title}</h3>
                        <p class="text-xs text-gray-600">⭐ ${rating} (${votes})</p>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const novelTable = document.getElementById('novelTable');

    if (!searchInput || !novelTable) return;

    searchInput.addEventListener('keyup', function() {
        const filter = searchInput.value.toLowerCase();
        const tableRows = novelTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        for (let i = 0; i < tableRows.length; i++) {
            const row = tableRows[i];
            const novelNameCell = row.getElementsByTagName('td')[0];

            if (novelNameCell) {
                const novelName = novelNameCell.textContent.toLowerCase() || novelNameCell.innerText.toLowerCase();

                if (novelName.includes(filter)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        }
    });
}

// ===== MOBILE MENU FUNCTIONALITY =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const leftSidebar = document.getElementById('leftSidebar');
const closeMobileMenu = document.getElementById('closeMobileMenu');

// Create backdrop element
const backdrop = document.createElement('div');
backdrop.className = 'mobile-menu-backdrop';
document.body.appendChild(backdrop);

// Open mobile menu
function openMobileMenu() {
    leftSidebar.classList.add('mobile-menu-open');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
}

// Close mobile menu
function closeMobileMenuFunc() {
    leftSidebar.classList.remove('mobile-menu-open');
    backdrop.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Event listeners
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}

if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileMenuFunc);
}

if (backdrop) {
    backdrop.addEventListener('click', closeMobileMenuFunc);
}

// Close menu when clicking on a navigation link (mobile)
const navLinks = leftSidebar.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Only close on mobile
        if (window.innerWidth < 1024) {
            closeMobileMenuFunc();
        }
    });
});

// ===== NOVEL ROW CLICK HANDLER =====
// Open novel modal when clicking on a row
document.addEventListener('click', (e) => {
    const row = e.target.closest('.novel-row');
    if (row) {
        const novelId = row.dataset.novelId;
        if (novelId && window.NovelModal) {
            window.NovelModal.open(novelId);
        }
    }
});

// ===== INITIALIZE APP =====
// Load data when page loads
document.addEventListener('DOMContentLoaded', loadData);

