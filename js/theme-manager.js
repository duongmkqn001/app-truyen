// =====================================================
// THEME MANAGER - Color Theme Customization System
// =====================================================
// Supports: Mint Green (default), Blue Pastel, Pink Pastel
// Storage: localStorage (persists across sessions)
// =====================================================

const THEMES = {
    mint: {
        name: 'Mint Green',
        icon: '🌿',
        colors: {
            // Primary colors
            primary50: '#f0fdf4',
            primary100: '#dcfce7',
            primary200: '#bbf7d0',
            primary300: '#86efac',
            primary400: '#4ade80',
            primary500: '#22c55e',
            primary600: '#16a34a',
            primary700: '#15803d',
            primary800: '#166534',
            primary900: '#14532d',
            
            // Accent colors (teal/mint)
            accent50: '#f0fdfa',
            accent100: '#ccfbf1',
            accent200: '#99f6e4',
            accent300: '#5eead4',
            
            // Background gradient
            bgGradientStart: '#f0fdf4',
            bgGradientMid: '#ecfdf5',
            bgGradientEnd: '#f0fdfa',
            
            // UI elements
            cardBorder: '#d1fae5',
            scrollbarTrack: '#f0fdf4',
            scrollbarThumb: '#86efac',
            scrollbarThumbHover: '#4ade80',
            
            // Specific hex values
            primaryHex: '#10b981',
            primaryDarkHex: '#059669'
        }
    },
    
    blue: {
        name: 'Blue Pastel',
        icon: '💙',
        colors: {
            // Primary colors (blue pastel)
            primary50: '#eff6ff',
            primary100: '#dbeafe',
            primary200: '#bfdbfe',
            primary300: '#93c5fd',
            primary400: '#60a5fa',
            primary500: '#3b82f6',
            primary600: '#2563eb',
            primary700: '#1d4ed8',
            primary800: '#1e40af',
            primary900: '#1e3a8a',
            
            // Accent colors (light blue)
            accent50: '#f0f9ff',
            accent100: '#e0f2fe',
            accent200: '#bae6fd',
            accent300: '#7dd3fc',
            
            // Background gradient
            bgGradientStart: '#eff6ff',
            bgGradientMid: '#dbeafe',
            bgGradientEnd: '#f0f9ff',
            
            // UI elements
            cardBorder: '#bfdbfe',
            scrollbarTrack: '#eff6ff',
            scrollbarThumb: '#93c5fd',
            scrollbarThumbHover: '#60a5fa',
            
            // Specific hex values
            primaryHex: '#3b82f6',
            primaryDarkHex: '#2563eb'
        }
    },
    
    pink: {
        name: 'Pink Pastel',
        icon: '💗',
        colors: {
            // Primary colors (pink pastel)
            primary50: '#fdf2f8',
            primary100: '#fce7f3',
            primary200: '#fbcfe8',
            primary300: '#f9a8d4',
            primary400: '#f472b6',
            primary500: '#ec4899',
            primary600: '#db2777',
            primary700: '#be185d',
            primary800: '#9d174d',
            primary900: '#831843',
            
            // Accent colors (rose)
            accent50: '#fff1f2',
            accent100: '#ffe4e6',
            accent200: '#fecdd3',
            accent300: '#fda4af',
            
            // Background gradient
            bgGradientStart: '#fdf2f8',
            bgGradientMid: '#fce7f3',
            bgGradientEnd: '#fff1f2',
            
            // UI elements
            cardBorder: '#fbcfe8',
            scrollbarTrack: '#fdf2f8',
            scrollbarThumb: '#f9a8d4',
            scrollbarThumbHover: '#f472b6',
            
            // Specific hex values
            primaryHex: '#ec4899',
            primaryDarkHex: '#db2777'
        }
    }
};

// =====================================================
// THEME MANAGER CLASS
// =====================================================

class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }
    
    // Load theme from localStorage or default to 'mint'
    loadTheme() {
        const saved = localStorage.getItem('app-theme');
        return saved && THEMES[saved] ? saved : 'mint';
    }
    
    // Save theme to localStorage
    saveTheme(themeName) {
        localStorage.setItem('app-theme', themeName);
    }
    
    // Initialize theme system
    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeSelector();
    }
    
    // Apply theme by setting CSS variables
    applyTheme(themeName) {
        if (!THEMES[themeName]) {
            console.error(`Theme "${themeName}" not found`);
            return;
        }
        
        const theme = THEMES[themeName];
        const root = document.documentElement;
        
        // Set CSS custom properties
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
        
        // Update body background gradient
        document.body.style.background = `linear-gradient(to bottom right, ${theme.colors.bgGradientStart}, ${theme.colors.bgGradientMid}, ${theme.colors.bgGradientEnd})`;
        
        // Update current theme
        this.currentTheme = themeName;
        this.saveTheme(themeName);
        
        // Dispatch custom event for other components to react
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }
    
    // Create theme selector UI
    createThemeSelector() {
        // Check if selector already exists
        if (document.getElementById('themeSelectorContainer')) {
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'themeSelectorContainer';
        container.className = 'fixed bottom-4 right-4 z-50';
        
        container.innerHTML = `
            <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 p-3" style="border-color: var(--color-cardBorder, #d1fae5);">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-semibold text-gray-700">🎨 Chủ đề:</span>
                </div>
                <div class="flex gap-2">
                    ${Object.entries(THEMES).map(([key, theme]) => `
                        <button
                            type="button"
                            class="theme-btn px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 hover:scale-105 active:scale-95 touch-manipulation"
                            data-theme="${key}"
                            title="${theme.name}"
                        >
                            <span class="text-lg">${theme.icon}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Add event listeners
        container.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const themeName = e.currentTarget.dataset.theme;
                this.applyTheme(themeName);
                this.updateThemeButtons();
            });
        });
        
        // Initial button state
        this.updateThemeButtons();
    }
    
    // Update theme button states
    updateThemeButtons() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            const themeName = btn.dataset.theme;
            const theme = THEMES[themeName];
            
            if (themeName === this.currentTheme) {
                // Active state
                btn.style.backgroundColor = theme.colors.primary500;
                btn.style.borderColor = theme.colors.primary600;
                btn.style.color = 'white';
                btn.classList.add('shadow-lg');
            } else {
                // Inactive state
                btn.style.backgroundColor = 'white';
                btn.style.borderColor = '#e5e7eb';
                btn.style.color = '#6b7280';
                btn.classList.remove('shadow-lg');
            }
        });
    }
    
    // Get current theme colors
    getColors() {
        return THEMES[this.currentTheme].colors;
    }
    
    // Get Tailwind class name for current theme
    getTailwindClass(shade) {
        // Map theme to Tailwind color name
        const colorMap = {
            mint: 'green',
            blue: 'blue',
            pink: 'pink'
        };
        
        const colorName = colorMap[this.currentTheme] || 'green';
        return `${colorName}-${shade}`;
    }
}

// =====================================================
// GLOBAL INSTANCE
// =====================================================

// Create global theme manager instance
window.themeManager = new ThemeManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, THEMES };
}

