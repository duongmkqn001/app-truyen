// ===== AUTHOR PAGE SCRIPT =====
// This script handles the author-specific page functionality

let novelsData = [];
let rankingsData = [];
let authorName = '';
let selectedTags = []; // Array of selected tag IDs for filtering
let availableTags = []; // All unique tags from this author's novels

// Get author name from URL parameter
function getAuthorFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('author') || '';
}

// Show error message in UI
function showErrorMessage(message, details = '') {
    const tbody = document.querySelector('#novelTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-12 text-center">
                <div class="text-red-600">
                    <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="mt-4 text-lg font-semibold">${message}</p>
                    ${details ? `<p class="mt-2 text-sm text-gray-600">${details}</p>` : ''}
                </div>
            </td>
        </tr>
    `;
}

// Load data from Supabase filtered by author
async function loadData() {
    try {
        // Get author name from URL
        authorName = getAuthorFromURL();
        
        if (!authorName) {
            showErrorMessage(
                '⚠️ Không tìm thấy tác giả',
                'Vui lòng truy cập trang này từ liên kết tác giả hợp lệ.'
            );
            return;
        }
        
        // Update page title
        document.getElementById('authorNameTitle').textContent = authorName;
        document.title = `Tác giả: ${authorName} - App Truyện`;
        
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

        // Load novels from Supabase filtered by author
        const { data, error } = await window.supabaseClient
            .from('novels_with_stats')
            .select('*')
            .eq('is_approved', true)
            .eq('author_name', authorName)
            .order('created_at', { ascending: false });

        if (error) throw error;

        novelsData = data || [];

        // Get top rated novels for rankings (all novels, not just this author)
        const rankingsResult = await db.novels.getMostNominated(6);
        if (rankingsResult.success) {
            rankingsData = rankingsResult.data;
        }

        // Extract all unique tags from novels
        extractAvailableTags();

        // Update novel count
        document.getElementById('novelCount').textContent = novelsData.length;

        // Render data
        renderNovelsTable();
        renderRankings();
        renderAvailableTags();

        // Initialize search and filters after data is loaded
        initializeSearch();
        initializeTagFilter();

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
                <td colspan="6" class="px-6 py-12 text-center">
                    <div class="text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p class="mt-4 text-lg font-semibold">Tác giả này chưa có truyện nào</p>
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
        const editor = novel.editor_name;
        const chapters = novel.chapter_count;
        const status = novel.status || 'ongoing';
        const lastUpdate = novel.updated_at
            ? new Date(novel.updated_at).toLocaleDateString('vi-VN')
            : '';
        const novelId = novel.id;

        // Parse tags
        let tags = [];
        try {
            tags = novel.tags || [];
        } catch (e) {
            console.error('Error parsing tags:', e);
        }

        // Generate tags HTML
        const genresHTML = tags.length > 0
            ? tags.slice(0, 3).map(tag => {
                const tagColor = tag.color || '#10b981';
                return `<span class="inline-block px-2 py-1 text-xs rounded-full text-white mr-1 mb-1" style="background-color: ${tagColor};">${tag.name}</span>`;
            }).join('')
            : '<span class="text-gray-400 text-xs">Chưa có</span>';

        // Status display
        const statusMap = {
            'ongoing': { text: 'Đang tiến hành', color: 'blue' },
            'completed': { text: 'Hoàn thành', color: 'green' },
            'hiatus': { text: 'Tạm ngưng', color: 'yellow' },
            'dropped': { text: 'Đã bỏ', color: 'red' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'gray' };
        const statusDisplay = statusInfo.text;
        const statusColor = statusInfo.color;

        return `
            <tr class="hover:bg-green-50 transition-colors cursor-pointer novel-row" data-novel-id="${novelId}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${title}</div>
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

        // Medal colors for top 3
        let rankClass = '';
        let rankIcon = rank;
        if (rank === 1) {
            rankClass = 'text-yellow-500 font-bold text-lg';
            rankIcon = '🥇';
        } else if (rank === 2) {
            rankClass = 'text-gray-400 font-bold text-lg';
            rankIcon = '🥈';
        } else if (rank === 3) {
            rankClass = 'text-orange-600 font-bold text-lg';
            rankIcon = '🥉';
        } else {
            rankClass = 'text-gray-600 font-semibold';
        }

        return `
                <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer" onclick="openNovelModal('${item.id}')">
                    <div class="${rankClass} w-8 text-center flex-shrink-0">
                        ${rankIcon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-xs font-semibold text-gray-900 truncate">${title}</h3>
                        <p class="text-xs text-gray-600">⭐ ${rating} (${votes})</p>
                    </div>
                </div>
            `;
    }).join('');
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const novelTable = document.getElementById('novelTable');

    if (!searchInput || !novelTable) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const rows = novelTable.querySelectorAll('tbody tr.novel-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const novelId = row.dataset.novelId;
            const novel = novelsData.find(n => n.id === novelId);
            const title = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';

            // Check both search term and tag filter
            const matchesSearch = !searchTerm || title.includes(searchTerm);

            // Check tag filter
            let matchesTags = true;
            if (selectedTags.length > 0 && novel) {
                const novelTagIds = (novel.tags || []).map(t => t.id);
                matchesTags = selectedTags.every(tagId => novelTagIds.includes(tagId));
            }

            if (matchesSearch && matchesTags) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update count
        const countElement = document.getElementById('novelCount');
        if (countElement) {
            if (searchTerm || selectedTags.length > 0) {
                countElement.textContent = `${visibleCount}/${novelsData.length}`;
            } else {
                countElement.textContent = novelsData.length;
            }
        }
    });
}

// ===== TAG FILTERING FUNCTIONALITY =====

// Extract all unique tags from the author's novels
function extractAvailableTags() {
    const tagMap = new Map();

    novelsData.forEach(novel => {
        if (novel.tags && Array.isArray(novel.tags)) {
            novel.tags.forEach(tag => {
                if (!tagMap.has(tag.id)) {
                    tagMap.set(tag.id, {
                        id: tag.id,
                        name: tag.name,
                        color: tag.color || '#10b981',
                        count: 1
                    });
                } else {
                    tagMap.get(tag.id).count++;
                }
            });
        }
    });

    // Convert to array and sort by count (most common first)
    availableTags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
}

// Render available tags for filtering
function renderAvailableTags() {
    const container = document.getElementById('availableTagsContainer');
    if (!container) return;

    if (availableTags.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm">Không có thể loại nào</div>';
        return;
    }

    container.innerHTML = availableTags.map(tag => {
        const isSelected = selectedTags.includes(tag.id);
        const opacity = isSelected ? 'opacity-50' : 'opacity-100 hover:opacity-80';

        return `
            <button
                class="tag-filter-btn ${opacity} transition-all px-4 py-2 md:px-3 md:py-1.5 rounded-full text-base md:text-sm font-medium text-white shadow-md hover:shadow-lg active:scale-95 touch-manipulation"
                style="background-color: ${tag.color};"
                data-tag-id="${tag.id}"
                data-tag-name="${tag.name}"
                data-tag-color="${tag.color}"
                ${isSelected ? 'disabled' : ''}>
                ${tag.name} (${tag.count})
            </button>
        `;
    }).join('');
}

// Render selected tags
function renderSelectedTags() {
    const container = document.getElementById('selectedTagsContainer');
    const list = document.getElementById('selectedTagsList');
    const clearBtn = document.getElementById('clearTagFilter');

    if (!container || !list || !clearBtn) return;

    if (selectedTags.length === 0) {
        container.classList.add('hidden');
        clearBtn.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    clearBtn.classList.remove('hidden');

    const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

    list.innerHTML = selectedTagObjects.map(tag => `
        <div class="flex items-center gap-2 px-4 py-2 md:px-3 md:py-1.5 rounded-full text-base md:text-sm font-medium text-white shadow-md"
             style="background-color: ${tag.color};">
            <span>${tag.name}</span>
            <button class="remove-tag-btn hover:bg-white/20 active:bg-white/30 rounded-full p-1 md:p-0.5 transition-colors touch-manipulation"
                    data-tag-id="${tag.id}">
                ✕
            </button>
        </div>
    `).join('');
}

// Filter novels by selected tags
function filterNovelsByTags() {
    const tbody = document.querySelector('#novelTable tbody');
    const searchInput = document.getElementById('searchInput');
    if (!tbody) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const rows = tbody.querySelectorAll('tr.novel-row');
    let visibleCount = 0;

    rows.forEach(row => {
        const novelId = row.dataset.novelId;
        const novel = novelsData.find(n => n.id === novelId);
        const title = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';

        if (!novel) {
            row.style.display = 'none';
            return;
        }

        // Check search term
        const matchesSearch = !searchTerm || title.includes(searchTerm);

        // Check tag filter
        let matchesTags = true;
        if (selectedTags.length > 0) {
            const novelTagIds = (novel.tags || []).map(t => t.id);
            matchesTags = selectedTags.every(tagId => novelTagIds.includes(tagId));
        }

        if (matchesSearch && matchesTags) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Update novel count
    const countElement = document.getElementById('novelCount');
    if (countElement) {
        if (searchTerm || selectedTags.length > 0) {
            countElement.textContent = `${visibleCount}/${novelsData.length}`;
        } else {
            countElement.textContent = novelsData.length;
        }
    }
}

// Initialize tag filter event handlers
function initializeTagFilter() {
    const container = document.getElementById('availableTagsContainer');
    const clearBtn = document.getElementById('clearTagFilter');
    const selectedList = document.getElementById('selectedTagsList');

    if (!container) return;

    // Handle tag selection
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filter-btn');
        if (!btn) return;

        const tagId = btn.dataset.tagId;
        if (!tagId || selectedTags.includes(tagId)) return;

        selectedTags.push(tagId);
        renderAvailableTags();
        renderSelectedTags();
        filterNovelsByTags();
    });

    // Handle tag removal
    if (selectedList) {
        selectedList.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-tag-btn');
            if (!btn) return;

            const tagId = btn.dataset.tagId;
            selectedTags = selectedTags.filter(id => id !== tagId);

            renderAvailableTags();
            renderSelectedTags();
            filterNovelsByTags();
        });
    }

    // Handle clear all
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            selectedTags = [];
            renderAvailableTags();
            renderSelectedTags();
            filterNovelsByTags();
        });
    }
}

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

// ===== TABLE HEADER SCROLL EFFECT =====
function initTableHeaderScroll() {
    const tableContainer = document.querySelector('.table-container');
    const tableHeader = document.querySelector('#novelTable thead');

    if (!tableContainer || !tableHeader) return;

    // Listen to scroll on the table container
    tableContainer.addEventListener('scroll', () => {
        if (tableContainer.scrollTop > 10) {
            tableHeader.classList.add('scrolled');
        } else {
            tableHeader.classList.remove('scrolled');
        }
    });

    // Also listen to window scroll
    window.addEventListener('scroll', () => {
        const rect = tableContainer.getBoundingClientRect();
        // If table is scrolled past the top of viewport
        if (rect.top < 0) {
            tableHeader.classList.add('scrolled');
        } else {
            tableHeader.classList.remove('scrolled');
        }
    });
}

// ===== INITIALIZE APP =====
// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTableHeaderScroll();
});

