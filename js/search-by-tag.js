// =====================================================
// TAG-BASED SEARCH PAGE
// =====================================================

let allTags = [];
let includeTags = []; // Tags to include (OR logic)
let excludeTags = []; // Tags to exclude (blacklist)
let currentPage = 1;
const itemsPerPage = 12;
let allResults = [];
let hasSearched = false;
let showAllTags = false; // Track if all tags are shown or hidden
let tagSearchQuery = ''; // Track search query

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    await loadTags();
    initEventListeners();
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
            ${['admin', 'super_admin', 'sub_admin'].includes(profile?.role) ? '<a href="admin.html" class="text-blue-600 hover:underline">Quản trị</a>' : ''}
            <button onclick="logout()" class="text-red-600 hover:underline">Đăng xuất</button>
        </div>
    `;
}

async function logout() {
    await db.auth.signOut();
    window.location.href = 'index.html';
}

// =====================================================
// LOAD TAGS
// =====================================================

async function loadTags() {
    const result = await db.tags.getAll();
    
    if (result.success) {
        allTags = result.data;
        displayAllTags();
    } else {
        UIComponents.showToast('Không thể tải danh sách thể loại', 'error');
    }
}

function displayAllTags() {
    const container = document.getElementById('allTagsContainer');

    if (allTags.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">Chưa có thể loại nào</p>';
        return;
    }

    // Filter tags based on search query
    let filteredTags = allTags;
    if (tagSearchQuery.trim()) {
        const query = tagSearchQuery.toLowerCase();
        filteredTags = allTags.filter(tag =>
            tag.name.toLowerCase().includes(query)
        );
    }

    // Organize tags by category using the category mapping
    const tagsByCategory = window.TagCategories.organizeTagsByCategory(filteredTags);
    const categoryOrder = window.TagCategories.getCategoryOrder();

    // Render tags organized by category
    let html = '';
    let categoryIndex = 0;

    // Render categories in the specified order
    categoryOrder.forEach(category => {
        if (!tagsByCategory[category] || tagsByCategory[category].length === 0) {
            return; // Skip empty categories
        }

        const categoryTags = tagsByCategory[category];
        const isHidden = !showAllTags && categoryIndex > 0; // Hide all except first category by default

        html += `
            <div class="mb-4 ${isHidden ? 'hidden tag-category-hidden' : 'tag-category-visible'}">
                <h3 class="text-sm font-bold text-gray-700 mb-2 pb-1 border-b border-gray-300">
                    ${category} <span class="text-xs font-normal text-gray-500">(${categoryTags.length})</span>
                </h3>
                <div class="flex flex-wrap gap-2">
                    ${categoryTags.map(tag => {
                        const isIncluded = includeTags.includes(tag.id);
                        const isExcluded = excludeTags.includes(tag.id);

                        let classes = 'tag-btn px-4 py-2.5 md:px-3 md:py-1.5 rounded-lg md:rounded-md text-base md:text-sm font-medium border-2 md:border transition-all cursor-pointer touch-manipulation';

                        if (isIncluded) {
                            classes += ' bg-green-600 text-white border-green-600 shadow-md';
                        } else if (isExcluded) {
                            classes += ' bg-red-600 text-white border-red-600 shadow-md';
                        } else {
                            classes += ' bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 active:scale-95';
                        }

                        return `
                            <button
                                type="button"
                                class="${classes}"
                                data-tag-id="${tag.id}"
                                data-tag-name="${tag.name}"
                                onclick="handleTagClick(${tag.id}, '${tag.name}')"
                                oncontextmenu="handleTagRightClick(event, ${tag.id}, '${tag.name}')"
                                ontouchstart="handleTagTouchStart(event, ${tag.id}, '${tag.name}')"
                                ontouchend="handleTagTouchEnd(event)"
                                ontouchcancel="handleTagTouchCancel(event)"
                                title="Nhấn: Chọn | Giữ lâu: Loại trừ"
                            >
                                ${tag.name}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        categoryIndex++;
    });

    if (filteredTags.length === 0) {
        html = '<p class="text-gray-500 text-sm">Không tìm thấy thể loại nào phù hợp</p>';
    }

    container.innerHTML = html;
}

// =====================================================
// TAG SELECTION
// =====================================================

// Track long press for mobile
let longPressTimer = null;
let isLongPress = false;

function handleTagClick(tagId, tagName) {
    // Ignore if this was a long press
    if (isLongPress) {
        isLongPress = false;
        return;
    }

    // Left click: Add to include list or remove if already included
    if (includeTags.includes(tagId)) {
        // Remove from include
        includeTags = includeTags.filter(id => id !== tagId);
    } else if (excludeTags.includes(tagId)) {
        // Move from exclude to include
        excludeTags = excludeTags.filter(id => id !== tagId);
        includeTags.push(tagId);
    } else {
        // Add to include
        includeTags.push(tagId);
    }

    updateTagDisplays();
}

function handleTagRightClick(event, tagId, tagName) {
    event.preventDefault();

    // Right click: Add to exclude list or remove if already excluded
    if (excludeTags.includes(tagId)) {
        // Remove from exclude
        excludeTags = excludeTags.filter(id => id !== tagId);
    } else if (includeTags.includes(tagId)) {
        // Move from include to exclude
        includeTags = includeTags.filter(id => id !== tagId);
        excludeTags.push(tagId);
    } else {
        // Add to exclude
        excludeTags.push(tagId);
    }

    updateTagDisplays();
}

// Mobile-friendly long press handler
function handleTagTouchStart(event, tagId, tagName) {
    isLongPress = false;
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        // Trigger exclude action (same as right-click)
        handleTagRightClick(event, tagId, tagName);
    }, 500); // 500ms long press
}

function handleTagTouchEnd(event) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function handleTagTouchCancel(event) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    isLongPress = false;
}

function removeIncludeTag(tagId) {
    includeTags = includeTags.filter(id => id !== tagId);
    updateTagDisplays();
}

function removeExcludeTag(tagId) {
    excludeTags = excludeTags.filter(id => id !== tagId);
    updateTagDisplays();
}

function updateTagDisplays() {
    displayAllTags();
    displayIncludeTags();
    displayExcludeTags();
}

function displayIncludeTags() {
    const container = document.getElementById('includeTagsContainer');
    const placeholder = document.getElementById('includeTagsPlaceholder');

    if (includeTags.length === 0) {
        container.innerHTML = '';
        if (placeholder) placeholder.classList.remove('hidden');
        return;
    }

    if (placeholder) placeholder.classList.add('hidden');

    const selectedTags = allTags.filter(tag => includeTags.includes(tag.id));

    container.innerHTML = selectedTags.map(tag => `
        <span class="inline-flex items-center gap-2 px-4 py-2 md:px-3 md:py-1.5 bg-green-600 text-white rounded-full text-base md:text-sm font-medium shadow-md">
            ${tag.name}
            <button type="button" onclick="removeIncludeTag(${tag.id})" class="hover:bg-green-700 active:bg-green-800 rounded-full p-1 md:p-0.5 transition-colors touch-manipulation">
                ✕
            </button>
        </span>
    `).join('');
}

function displayExcludeTags() {
    const container = document.getElementById('excludeTagsContainer');
    const placeholder = document.getElementById('excludeTagsPlaceholder');

    if (excludeTags.length === 0) {
        container.innerHTML = '';
        if (placeholder) placeholder.classList.remove('hidden');
        return;
    }

    if (placeholder) placeholder.classList.add('hidden');

    const selectedTags = allTags.filter(tag => excludeTags.includes(tag.id));

    container.innerHTML = selectedTags.map(tag => `
        <span class="inline-flex items-center gap-2 px-4 py-2 md:px-3 md:py-1.5 bg-red-600 text-white rounded-full text-base md:text-sm font-medium shadow-md">
            ${tag.name}
            <button type="button" onclick="removeExcludeTag(${tag.id})" class="hover:bg-red-700 active:bg-red-800 rounded-full p-1 md:p-0.5 transition-colors touch-manipulation">
                ✕
            </button>
        </span>
    `).join('');
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function initEventListeners() {
    const form = document.getElementById('searchForm');

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1;
        hasSearched = true;
        performSearch();
    });

    // Form reset
    form.addEventListener('reset', () => {
        includeTags = [];
        excludeTags = [];
        hasSearched = false;
        tagSearchQuery = '';
        document.getElementById('tagSearchInput').value = '';
        setTimeout(() => {
            updateTagDisplays();
            document.getElementById('searchResults').innerHTML = '';
            document.getElementById('resultsCount').textContent = '';
            document.getElementById('pagination').innerHTML = '';
            document.getElementById('noResults').classList.add('hidden');
            document.getElementById('initialState').classList.remove('hidden');
        }, 0);
    });

    // Clear buttons
    document.getElementById('clearIncludeTags').addEventListener('click', () => {
        includeTags = [];
        updateTagDisplays();
    });

    document.getElementById('clearExcludeTags').addEventListener('click', () => {
        excludeTags = [];
        updateTagDisplays();
    });

    // Tag search input
    const tagSearchInput = document.getElementById('tagSearchInput');
    tagSearchInput.addEventListener('input', (e) => {
        tagSearchQuery = e.target.value;
        displayAllTags();
    });

    // Show all tags button
    const showAllBtn = document.getElementById('showAllTagsBtn');
    const hideAllBtn = document.getElementById('hideAllTagsBtn');

    showAllBtn.addEventListener('click', () => {
        showAllTags = true;
        showAllBtn.classList.add('hidden');
        hideAllBtn.classList.remove('hidden');
        displayAllTags();
    });

    hideAllBtn.addEventListener('click', () => {
        showAllTags = false;
        hideAllBtn.classList.add('hidden');
        showAllBtn.classList.remove('hidden');
        displayAllTags();
    });
}

// =====================================================
// SEARCH
// =====================================================

async function performSearch() {
    showLoading();
    document.getElementById('initialState').classList.add('hidden');
    
    const title = document.getElementById('searchTitle').value.trim();
    const author = document.getElementById('searchAuthor').value.trim();
    const status = document.getElementById('searchStatus').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Get all approved novels
    const result = await db.novels.getAll();
    
    if (!result.success) {
        hideLoading();
        UIComponents.showToast('Không thể tải dữ liệu', 'error');
        return;
    }
    
    // Filter results
    let filtered = result.data.filter(novel => {
        const novelTags = (novel.tags || []).map(t => t.id);
        
        // Exclude tags (blacklist) - if novel has any excluded tag, filter it out
        if (excludeTags.length > 0) {
            const hasExcludedTag = excludeTags.some(tagId => novelTags.includes(tagId));
            if (hasExcludedTag) {
                return false;
            }
        }
        
        // Include tags - if specified, novel must have at least one included tag
        if (includeTags.length > 0) {
            const hasIncludedTag = includeTags.some(tagId => novelTags.includes(tagId));
            if (!hasIncludedTag) {
                return false;
            }
        }
        
        // Title filter (optional)
        if (title && !novel.title.toLowerCase().includes(title.toLowerCase())) {
            return false;
        }
        
        // Author filter (optional)
        if (author && !novel.author_name.toLowerCase().includes(author.toLowerCase())) {
            return false;
        }
        
        // Status filter
        if (status && novel.status !== status) {
            return false;
        }
        
        return true;
    });
    
    // Sort results
    filtered = sortResults(filtered, sortBy);
    
    allResults = filtered;
    displayResults();
    hideLoading();
}

function sortResults(results, sortBy) {
    const sorted = [...results];
    
    switch (sortBy) {
        case 'created_at_desc':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'created_at_asc':
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'title_asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
            break;
        case 'title_desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
            break;
        case 'rating_desc':
            sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
            break;
        case 'rating_asc':
            sorted.sort((a, b) => (a.avg_rating || 0) - (b.avg_rating || 0));
            break;
    }
    
    return sorted;
}

// =====================================================
// DISPLAY RESULTS
// =====================================================

function displayResults() {
    const resultsContainer = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');

    if (allResults.length === 0) {
        resultsContainer.innerHTML = '';
        resultsCount.textContent = '';
        noResults.classList.remove('hidden');
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    noResults.classList.add('hidden');

    // Calculate pagination
    const totalPages = Math.ceil(allResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageResults = allResults.slice(startIndex, endIndex);

    // Display count
    resultsCount.textContent = `Tìm thấy ${allResults.length} truyện (Trang ${currentPage}/${totalPages})`;

    // Display results
    resultsContainer.innerHTML = pageResults.map(novel => createNovelCard(novel)).join('');

    // Display pagination
    displayPagination(totalPages);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createNovelCard(novel) {
    const tags = novel.tags || [];
    const rating = novel.avg_rating || 0;

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden" onclick="openNovelModal('${novel.id}')">
            <div class="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                ${novel.cover_image_url
                    ? `<img src="${novel.cover_image_url}" alt="${novel.title}" class="w-full h-full object-cover">`
                    : `<span class="text-6xl">📖</span>`
                }
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg text-gray-800 mb-2 line-clamp-2">${novel.title}</h3>
                <p class="text-sm text-gray-600 mb-2">✍️ ${novel.author_name}</p>
                ${novel.editor_name ? `<p class="text-sm text-gray-600 mb-2">🌐 ${novel.editor_name}</p>` : ''}

                <div class="flex items-center gap-2 mb-2">
                    <span class="text-yellow-500">${'⭐'.repeat(Math.floor(rating))}</span>
                    <span class="text-sm text-gray-600">${rating.toFixed(1)}</span>
                </div>

                <div class="flex flex-wrap gap-1 mb-2">
                    ${tags.slice(0, 3).map(tag => `
                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${tag.color}20; color: ${tag.color};">
                            ${tag.name}
                        </span>
                    `).join('')}
                    ${tags.length > 3 ? `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+${tags.length - 3}</span>` : ''}
                </div>

                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span>${novel.status}</span>
                    <span>${novel.chapter_count || 0} chương</span>
                </div>
            </div>
        </div>
    `;
}

function displayPagination(totalPages) {
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let buttons = [];

    // Previous button
    buttons.push(`
        <button
            onclick="changePage(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}
            class="px-4 py-2 border border-gray-300 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}"
        >
            ← Trước
        </button>
    `);

    // Page numbers
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        buttons.push(`
            <button
                onclick="changePage(${i})"
                class="px-4 py-2 border rounded-lg ${
                    i === currentPage
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }"
            >
                ${i}
            </button>
        `);
    }

    // Next button
    buttons.push(`
        <button
            onclick="changePage(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}
            class="px-4 py-2 border border-gray-300 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}"
        >
            Sau →
        </button>
    `);

    container.innerHTML = buttons.join('');
}

function changePage(page) {
    currentPage = page;
    displayResults();
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

