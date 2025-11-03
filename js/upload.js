// =====================================================
// UPLOAD PAGE - Manual and CSV Upload
// =====================================================

let parsedCsvData = [];
let allTags = [];
let selectedTagIds = [];

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    await loadTags();
    initTabs();
    initManualUpload();
    initCsvUpload();
    initTagPicker();
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
        
        // Redirect to login if not authenticated
        UIComponents.showToast('Vui lòng đăng nhập để tải lên truyện', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    const profile = await db.auth.getUserProfile(user.id);
    
    // Check if user is pending approval
    if (profile && profile.role === 'pending_approval') {
        UIComponents.showToast('Tài khoản của bạn đang chờ duyệt. Bạn chưa thể tải lên truyện.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }
    
    userMenu.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-gray-700">👤 ${profile?.username || user.email}</span>
            ${UIComponents.createRoleBadge(profile?.role || 'reader')}
            ${profile?.role === 'admin' ? '<a href="admin.html" class="text-blue-600 hover:underline">Admin</a>' : ''}
            <button onclick="logout()" class="text-red-600 hover:underline">Đăng xuất</button>
        </div>
    `;
}

async function logout() {
    await db.auth.signOut();
    window.location.href = 'index.html';
}

// =====================================================
// TAB SWITCHING
// =====================================================

function initTabs() {
    const manualTab = document.getElementById('manualTab');
    const csvTab = document.getElementById('csvTab');
    const manualSection = document.getElementById('manualUploadSection');
    const csvSection = document.getElementById('csvUploadSection');
    
    manualTab.addEventListener('click', () => {
        manualTab.classList.add('text-green-600', 'border-b-2', 'border-green-600');
        manualTab.classList.remove('text-gray-500');
        csvTab.classList.remove('text-green-600', 'border-b-2', 'border-green-600');
        csvTab.classList.add('text-gray-500');
        
        manualSection.classList.remove('hidden');
        csvSection.classList.add('hidden');
    });
    
    csvTab.addEventListener('click', () => {
        csvTab.classList.add('text-green-600', 'border-b-2', 'border-green-600');
        csvTab.classList.remove('text-gray-500');
        manualTab.classList.remove('text-green-600', 'border-b-2', 'border-green-600');
        manualTab.classList.add('text-gray-500');
        
        csvSection.classList.remove('hidden');
        manualSection.classList.add('hidden');
    });
}

// =====================================================
// LOAD TAGS
// =====================================================

async function loadTags() {
    const result = await db.tags.getAll();

    if (result.success) {
        allTags = result.data;
    } else {
        UIComponents.showToast('Không thể tải danh sách thể loại', 'error');
    }
}

// =====================================================
// TAG PICKER
// =====================================================

function initTagPicker() {
    const pickerBtn = document.getElementById('tagPickerBtn');
    const dropdown = document.getElementById('tagPickerDropdown');
    const searchInput = document.getElementById('tagSearchInput');

    // Toggle dropdown
    pickerBtn.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            searchInput.focus();
            renderTagPickerList();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!pickerBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Search tags
    searchInput.addEventListener('input', () => {
        renderTagPickerList(searchInput.value.toLowerCase());
    });
}

function renderTagPickerList(searchTerm = '') {
    const list = document.getElementById('tagPickerList');

    const filteredTags = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm)
    );

    if (filteredTags.length === 0) {
        list.innerHTML = '<p class="text-gray-500 text-sm p-2">Không tìm thấy thể loại</p>';
        return;
    }

    list.innerHTML = filteredTags.map(tag => {
        const isSelected = selectedTagIds.includes(tag.id);
        return `
            <button
                type="button"
                class="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center justify-between ${isSelected ? 'bg-green-50' : ''}"
                onclick="toggleTag(${tag.id}, '${tag.name}', '${tag.color}')"
            >
                <span class="text-sm" style="color: ${tag.color};">
                    ${isSelected ? '✓ ' : ''}${tag.name}
                </span>
            </button>
        `;
    }).join('');
}

function toggleTag(tagId, tagName, tagColor) {
    const index = selectedTagIds.indexOf(tagId);

    if (index > -1) {
        // Remove tag
        selectedTagIds.splice(index, 1);
    } else {
        // Add tag
        selectedTagIds.push(tagId);
    }

    updateSelectedTagsDisplay();
    renderTagPickerList(document.getElementById('tagSearchInput').value.toLowerCase());

    // Update hidden input
    document.getElementById('tagIdsInput').value = selectedTagIds.join(',');
}

function updateSelectedTagsDisplay() {
    const display = document.getElementById('selectedTagsDisplay');
    const placeholder = document.getElementById('noTagsPlaceholder');

    if (selectedTagIds.length === 0) {
        placeholder.classList.remove('hidden');
        return;
    }

    placeholder.classList.add('hidden');

    const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));

    display.innerHTML = selectedTags.map(tag => `
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style="background-color: ${tag.color}20; color: ${tag.color};">
            ${tag.name}
            <button type="button" onclick="toggleTag(${tag.id}, '${tag.name}', '${tag.color}')" class="hover:opacity-70">
                ✕
            </button>
        </span>
    `).join('') + '<span class="hidden" id="noTagsPlaceholder">Chưa chọn thể loại nào</span>';
}

// =====================================================
// MANUAL UPLOAD
// =====================================================

function initManualUpload() {
    const form = document.getElementById('manualUploadForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const novelData = {
            title: formData.get('title'),
            author_name: formData.get('author_name'),
            editor_name: formData.get('editor_name') || null,
            chapter_count: parseInt(formData.get('chapter_count')) || 0,
            summary: formData.get('summary') || null,
            novel_url: formData.get('novel_url') || null,
            cover_image_url: formData.get('cover_image_url') || null,
            status: formData.get('status'),
            tag_ids: selectedTagIds.length > 0 ? selectedTagIds : null
        };

        showLoading();
        const result = await db.novels.create(novelData);
        hideLoading();

        if (result.success) {
            UIComponents.showToast('Tải lên thành công! ' + (result.needsApproval ? 'Truyện đang chờ duyệt.' : 'Truyện đã được duyệt.'), 'success');
            form.reset();
            selectedTagIds = [];
            updateSelectedTagsDisplay();

            // Redirect to home after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            UIComponents.showToast(result.error || 'Không thể tải lên truyện', 'error');
        }
    });
}

// =====================================================
// CSV UPLOAD
// =====================================================

function initCsvUpload() {
    const downloadBtn = document.getElementById('downloadTemplateBtn');
    const fileInput = document.getElementById('csvFileInput');
    const importBtn = document.getElementById('importCsvBtn');
    const cancelBtn = document.getElementById('cancelCsvBtn');
    
    downloadBtn.addEventListener('click', downloadCsvTemplate);
    fileInput.addEventListener('change', handleCsvFileSelect);
    importBtn.addEventListener('click', importCsvData);
    cancelBtn.addEventListener('click', cancelCsvUpload);
}

function downloadCsvTemplate() {
    const headers = ['title', 'author_name', 'editor_name', 'chapter_count', 'summary', 'novel_url', 'cover_image_url', 'status', 'tags'];
    const sampleRow = [
        'Tên truyện mẫu',
        'Tác giả',
        'Người dịch',
        '100',
        'Đây là tóm tắt truyện. Có thể có dấu phẩy, dấu ngoặc kép "như thế này"',
        'https://example.com/novel',
        'https://example.com/cover.jpg',
        'Đang ra',
        'Tiên Hiệp, Huyền Huyễn, Xuyên Không'
    ];

    // Create CSV content with proper escaping
    const csvContent = [
        headers.join(','),
        sampleRow.map(field => escapeCsvField(field)).join(',')
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'truyen_template.csv';
    link.click();

    UIComponents.showToast('Đã tải xuống file mẫu CSV', 'success');
}

function escapeCsvField(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    // If field contains comma, newline, or quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

async function handleCsvFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
        UIComponents.showToast('Vui lòng chọn file CSV', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const text = await file.text();
        const parsed = parseCsv(text);
        
        if (parsed.errors.length > 0) {
            displayCsvErrors(parsed.errors);
        }
        
        if (parsed.data.length === 0) {
            UIComponents.showToast('File CSV không có dữ liệu hợp lệ', 'error');
            hideLoading();
            return;
        }
        
        parsedCsvData = parsed.data;
        displayCsvPreview(parsed.data);
        
        document.getElementById('csvPreviewSection').classList.remove('hidden');
        hideLoading();
        
    } catch (error) {
        console.error('CSV parse error:', error);
        UIComponents.showToast('Không thể đọc file CSV: ' + error.message, 'error');
        hideLoading();
    }
}

function parseCsv(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        return { data: [], errors: ['File CSV phải có ít nhất 2 dòng (header + data)'] };
    }
    
    const headers = parseCsvLine(lines[0]);
    const requiredHeaders = ['title', 'author_name', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
        return { 
            data: [], 
            errors: [`Thiếu các cột bắt buộc: ${missingHeaders.join(', ')}`] 
        };
    }
    
    const data = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        
        if (values.length !== headers.length) {
            errors.push(`Dòng ${i + 1}: Số cột không khớp (có ${values.length}, cần ${headers.length})`);
            continue;
        }
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || null;
        });
        
        // Validate required fields
        if (!row.title || !row.author_name || !row.status) {
            errors.push(`Dòng ${i + 1}: Thiếu thông tin bắt buộc (title, author_name, status)`);
            continue;
        }
        
        // Validate status
        if (!['Đang ra', 'Hoàn thành', 'Tạm ngưng'].includes(row.status)) {
            errors.push(`Dòng ${i + 1}: Trạng thái không hợp lệ "${row.status}". Phải là: Đang ra, Hoàn thành, hoặc Tạm ngưng`);
            continue;
        }

        // Convert chapter_count to number
        if (row.chapter_count) {
            row.chapter_count = parseInt(row.chapter_count) || 0;
        } else {
            row.chapter_count = 0;
        }

        // Parse and validate tags if provided
        if (row.tags) {
            const tagNames = row.tags.split(',').map(t => t.trim()).filter(t => t);

            if (tagNames.length > 0) {
                // Find tag IDs from tag names
                const tagIds = [];
                const invalidTags = [];

                for (const tagName of tagNames) {
                    const tag = allTags.find(t => t.name === tagName);
                    if (tag) {
                        tagIds.push(tag.id);
                    } else {
                        invalidTags.push(tagName);
                    }
                }

                if (invalidTags.length > 0) {
                    errors.push(`Dòng ${i + 1}: Thể loại không tồn tại: ${invalidTags.join(', ')}. Chỉ sử dụng thể loại có sẵn trong hệ thống.`);
                    continue;
                }

                row.tag_ids = tagIds;
            }
            delete row.tags; // Remove tags string, keep tag_ids array
        }

        data.push(row);
    }

    return { data, errors };
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
}

function displayCsvPreview(data) {
    const preview = document.getElementById('csvPreview');
    const maxPreview = 10;
    const displayData = data.slice(0, maxPreview);

    preview.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">#</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Tên truyện</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Tác giả</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Người dịch</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Số chương</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Trạng thái</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Thể loại</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${displayData.map((row, index) => {
                    let tagsDisplay = '-';
                    if (row.tag_ids && row.tag_ids.length > 0) {
                        const tagNames = row.tag_ids.map(id => {
                            const tag = allTags.find(t => t.id === id);
                            return tag ? tag.name : '';
                        }).filter(n => n);
                        tagsDisplay = tagNames.join(', ');
                    }

                    return `
                        <tr>
                            <td class="px-4 py-2 text-sm text-gray-500">${index + 1}</td>
                            <td class="px-4 py-2 text-sm text-gray-900">${row.title}</td>
                            <td class="px-4 py-2 text-sm text-gray-700">${row.author_name}</td>
                            <td class="px-4 py-2 text-sm text-gray-700">${row.editor_name || '-'}</td>
                            <td class="px-4 py-2 text-sm text-gray-700">${row.chapter_count}</td>
                            <td class="px-4 py-2 text-sm text-gray-700">${row.status}</td>
                            <td class="px-4 py-2 text-sm text-gray-700">${tagsDisplay}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        ${data.length > maxPreview ? `<p class="text-sm text-gray-500 p-4">... và ${data.length - maxPreview} truyện khác</p>` : ''}
        <p class="text-sm font-medium text-gray-700 p-4">Tổng cộng: ${data.length} truyện</p>
    `;
}

function displayCsvErrors(errors) {
    const errorsDiv = document.getElementById('csvErrors');
    
    if (errors.length === 0) {
        errorsDiv.classList.add('hidden');
        return;
    }
    
    errorsDiv.classList.remove('hidden');
    errorsDiv.innerHTML = `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="font-semibold text-yellow-900 mb-2">⚠️ Cảnh báo (${errors.length} lỗi)</h4>
            <ul class="text-sm text-yellow-800 space-y-1">
                ${errors.map(error => `<li>• ${error}</li>`).join('')}
            </ul>
        </div>
    `;
}

async function importCsvData() {
    if (parsedCsvData.length === 0) {
        UIComponents.showToast('Không có dữ liệu để nhập', 'error');
        return;
    }
    
    showLoading();
    const result = await db.novels.bulkCreate(parsedCsvData);
    hideLoading();
    
    if (result.success) {
        UIComponents.showToast(`Đã nhập ${result.data.length} truyện thành công!`, 'success');
        
        // Reset form
        cancelCsvUpload();
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        UIComponents.showToast(result.error || 'Không thể nhập dữ liệu', 'error');
    }
}

function cancelCsvUpload() {
    document.getElementById('csvFileInput').value = '';
    document.getElementById('csvPreviewSection').classList.add('hidden');
    document.getElementById('csvErrors').classList.add('hidden');
    parsedCsvData = [];
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

