import { CONFIG } from '../config.js';
import { WplaceError } from '../core/errorHandler.js';

export class VisualDesignManager {
    constructor() {
        this.themes = new Map();
        this.currentTheme = 'light';
        this.animations = new Map();
        this.isAnimationEnabled = true;
        this.customProperties = new Map();
        this.mediaQueries = new Map();
        
        this.initializeThemes();
        this.initializeAnimations();
        this.setupMediaQueries();
        this.loadUserPreferences();
    }

    initializeThemes() {
        // Light theme
        this.themes.set('light', {
            name: 'Light',
            colors: {
                primary: '#2196F3',
                primaryDark: '#1976D2',
                primaryLight: '#BBDEFB',
                secondary: '#FF9800',
                secondaryDark: '#F57C00',
                secondaryLight: '#FFE0B2',
                background: '#FFFFFF',
                backgroundSecondary: '#F5F5F5',
                backgroundTertiary: '#EEEEEE',
                surface: '#FFFFFF',
                surfaceVariant: '#F8F9FA',
                text: '#212121',
                textSecondary: '#757575',
                textDisabled: '#BDBDBD',
                border: '#E0E0E0',
                borderLight: '#F0F0F0',
                shadow: 'rgba(0, 0, 0, 0.1)',
                shadowStrong: 'rgba(0, 0, 0, 0.2)',
                success: '#4CAF50',
                warning: '#FF9800',
                error: '#F44336',
                info: '#2196F3'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                secondary: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)'
            }
        });

        // Dark theme
        this.themes.set('dark', {
            name: 'Dark',
            colors: {
                primary: '#64B5F6',
                primaryDark: '#42A5F5',
                primaryLight: '#90CAF9',
                secondary: '#FFB74D',
                secondaryDark: '#FFA726',
                secondaryLight: '#FFCC80',
                background: '#121212',
                backgroundSecondary: '#1E1E1E',
                backgroundTertiary: '#2D2D2D',
                surface: '#1E1E1E',
                surfaceVariant: '#2D2D2D',
                text: '#FFFFFF',
                textSecondary: '#CCCCCC',
                textDisabled: '#666666',
                border: '#333333',
                borderLight: '#404040',
                shadow: 'rgba(0, 0, 0, 0.3)',
                shadowStrong: 'rgba(0, 0, 0, 0.5)',
                success: '#66BB6A',
                warning: '#FFB74D',
                error: '#EF5350',
                info: '#64B5F6'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)',
                secondary: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
                background: 'linear-gradient(180deg, #121212 0%, #1E1E1E 100%)'
            }
        });

        // Auto theme (system preference)
        this.themes.set('auto', {
            name: 'Auto',
            colors: null // Will be determined by system preference
        });
    }

    initializeAnimations() {
        this.animations.set('fadeIn', {
            name: 'Fade In',
            keyframes: [
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            options: { duration: 300, easing: 'ease-out' }
        });

        this.animations.set('slideUp', {
            name: 'Slide Up',
            keyframes: [
                { transform: 'translateY(100%)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ],
            options: { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
        });

        this.animations.set('scaleIn', {
            name: 'Scale In',
            keyframes: [
                { transform: 'scale(0.8)', opacity: 0 },
                { transform: 'scale(1)', opacity: 1 }
            ],
            options: { duration: 250, easing: 'ease-out' }
        });

        this.animations.set('bounce', {
            name: 'Bounce',
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' },
                { transform: 'scale(1)' }
            ],
            options: { duration: 300, easing: 'ease-in-out' }
        });

        this.animations.set('shake', {
            name: 'Shake',
            keyframes: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-3px)' },
                { transform: 'translateX(3px)' },
                { transform: 'translateX(0)' }
            ],
            options: { duration: 500, easing: 'ease-in-out' }
        });

        this.animations.set('pulse', {
            name: 'Pulse',
            keyframes: [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(1.02)', opacity: 0.8 },
                { transform: 'scale(1)', opacity: 1 }
            ],
            options: { duration: 1000, easing: 'ease-in-out', iterations: Infinity }
        });

        this.animations.set('loading', {
            name: 'Loading Spinner',
            keyframes: [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ],
            options: { duration: 1000, easing: 'linear', iterations: Infinity }
        });
    }

    setupMediaQueries() {
        this.mediaQueries.set('mobile', '(max-width: 768px)');
        this.mediaQueries.set('tablet', '(min-width: 769px) and (max-width: 1024px)');
        this.mediaQueries.set('desktop', '(min-width: 1025px)');
        this.mediaQueries.set('darkMode', '(prefers-color-scheme: dark)');
        this.mediaQueries.set('reducedMotion', '(prefers-reduced-motion: reduce)');
        this.mediaQueries.set('highContrast', '(prefers-contrast: high)');
    }

    loadUserPreferences() {
        try {
            const savedTheme = localStorage.getItem('wplace-theme');
            const savedAnimations = localStorage.getItem('wplace-animations');
            
            if (savedTheme && this.themes.has(savedTheme)) {
                this.currentTheme = savedTheme;
            }
            
            if (savedAnimations !== null) {
                this.isAnimationEnabled = savedAnimations === 'true';
            }

            // Check for reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.isAnimationEnabled = false;
            }

            this.applyTheme(this.currentTheme);
        } catch (error) {
            console.warn('无法加载用户偏好设置:', error);
        }
    }

    applyTheme(themeName) {
        try {
            let theme;
            
            if (themeName === 'auto') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                theme = this.themes.get(isDark ? 'dark' : 'light');
            } else {
                theme = this.themes.get(themeName);
            }

            if (!theme) {
                throw new WplaceError('主题不存在', 'THEME_NOT_FOUND');
            }

            const root = document.documentElement;
            
            // Apply color variables
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
            });

            // Apply gradient variables
            Object.entries(theme.gradients).forEach(([key, value]) => {
                root.style.setProperty(`--gradient-${key}`, value);
            });

            // Update theme class
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${themeName}`);

            this.currentTheme = themeName;
            localStorage.setItem('wplace-theme', themeName);

            // Trigger theme change event
            this.dispatchThemeChangeEvent(themeName);

        } catch (error) {
            console.error('应用主题失败:', error);
            throw new WplaceError('应用主题失败', 'THEME_APPLICATION_FAILED');
        }
    }

    createThemeToggle() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        toggleContainer.innerHTML = `
            <button class="theme-toggle-btn" title="切换主题">
                <span class="theme-icon">🌙</span>
            </button>
            <div class="theme-menu hidden">
                <div class="theme-option" data-theme="light">
                    <span class="theme-icon">☀️</span>
                    <span class="theme-name">浅色</span>
                </div>
                <div class="theme-option" data-theme="dark">
                    <span class="theme-icon">🌙</span>
                    <span class="theme-name">深色</span>
                </div>
                <div class="theme-option" data-theme="auto">
                    <span class="theme-icon">🌗</span>
                    <span class="theme-name">自动</span>
                </div>
            </div>
        `;

        // Add event listeners
        const toggleBtn = toggleContainer.querySelector('.theme-toggle-btn');
        const themeMenu = toggleContainer.querySelector('.theme-menu');
        const themeOptions = toggleContainer.querySelectorAll('.theme-option');

        toggleBtn.addEventListener('click', () => {
            themeMenu.classList.toggle('hidden');
        });

        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const themeName = option.dataset.theme;
                this.applyTheme(themeName);
                themeMenu.classList.add('hidden');
                this.updateThemeToggleIcon(toggleBtn, themeName);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggleContainer.contains(e.target)) {
                themeMenu.classList.add('hidden');
            }
        });

        this.updateThemeToggleIcon(toggleBtn, this.currentTheme);
        return toggleContainer;
    }

    updateThemeToggleIcon(button, themeName) {
        const icon = button.querySelector('.theme-icon');
        const icons = {
            light: '☀️',
            dark: '🌙',
            auto: '🌗'
        };
        icon.textContent = icons[themeName] || '🌗';
    }

    animate(element, animationName, options = {}) {
        if (!this.isAnimationEnabled) {
            return Promise.resolve();
        }

        const animation = this.animations.get(animationName);
        if (!animation) {
            console.warn(`动画 ${animationName} 不存在`);
            return Promise.resolve();
        }

        const animationOptions = { ...animation.options, ...options };
        
        return new Promise((resolve) => {
            const animationInstance = element.animate(animation.keyframes, animationOptions);
            animationInstance.onfinish = () => resolve();
            animationInstance.oncancel = () => resolve();
        });
    }

    createLoadingSpinner(size = '24px') {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.width = size;
        spinner.style.height = size;
        
        if (this.isAnimationEnabled) {
            this.animate(spinner, 'loading');
        }
        
        return spinner;
    }

    createToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Animate in
        this.animate(toast, 'slideUp');

        // Auto remove
        const removeToast = () => {
            this.animate(toast, 'fadeOut').then(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        };

        const timeoutId = setTimeout(removeToast, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeoutId);
            removeToast();
        });

        return toast;
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    addCustomTheme(name, themeData) {
        try {
            this.themes.set(name, themeData);
            localStorage.setItem(`wplace-custom-theme-${name}`, JSON.stringify(themeData));
        } catch (error) {
            throw new WplaceError('添加自定义主题失败', 'CUSTOM_THEME_FAILED');
        }
    }

    removeCustomTheme(name) {
        if (['light', 'dark', 'auto'].includes(name)) {
            throw new WplaceError('无法删除内置主题', 'CANNOT_DELETE_BUILTIN_THEME');
        }
        
        this.themes.delete(name);
        localStorage.removeItem(`wplace-custom-theme-${name}`);
    }

    setAnimationEnabled(enabled) {
        this.isAnimationEnabled = enabled;
        localStorage.setItem('wplace-animations', enabled.toString());
        
        // Update body class for CSS animations
        if (enabled) {
            document.body.classList.remove('animations-disabled');
        } else {
            document.body.classList.add('animations-disabled');
        }
    }

    createStyleSheet() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            /* Theme variables will be set dynamically */
            :root {
                --transition-fast: 150ms ease-out;
                --transition-normal: 300ms ease-out;
                --transition-slow: 500ms ease-out;
                --border-radius: 8px;
                --border-radius-large: 12px;
                --shadow-small: 0 2px 4px var(--color-shadow);
                --shadow-medium: 0 4px 8px var(--color-shadow);
                --shadow-large: 0 8px 16px var(--color-shadowStrong);
            }

            .theme-toggle-container {
                position: relative;
                display: inline-block;
            }

            .theme-toggle-btn {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius);
                padding: 8px 12px;
                cursor: pointer;
                transition: all var(--transition-fast);
                box-shadow: var(--shadow-small);
            }

            .theme-toggle-btn:hover {
                background: var(--color-surfaceVariant);
                box-shadow: var(--shadow-medium);
            }

            .theme-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-large);
                min-width: 120px;
                z-index: 1000;
                margin-top: 4px;
            }

            .theme-menu.hidden {
                display: none;
            }

            .theme-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background var(--transition-fast);
                color: var(--color-text);
            }

            .theme-option:hover {
                background: var(--color-backgroundSecondary);
            }

            .theme-option:first-child {
                border-radius: var(--border-radius) var(--border-radius) 0 0;
            }

            .theme-option:last-child {
                border-radius: 0 0 var(--border-radius) var(--border-radius);
            }

            .loading-spinner {
                border: 2px solid var(--color-borderLight);
                border-top: 2px solid var(--color-primary);
                border-radius: 50%;
                display: inline-block;
            }

            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .toast {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-large);
                min-width: 300px;
                color: white;
            }

            .toast-success { background: var(--color-success); }
            .toast-warning { background: var(--color-warning); }
            .toast-error { background: var(--color-error); }
            .toast-info { background: var(--color-info); }

            .toast-message {
                flex: 1;
            }

            .toast-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
                line-height: 1;
                opacity: 0.8;
            }

            .toast-close:hover {
                opacity: 1;
            }

            /* Animation support */
            .animations-disabled * {
                animation-duration: 0ms !important;
                transition-duration: 0ms !important;
            }

            /* Responsive design helpers */
            @media (max-width: 768px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }
                
                .toast {
                    min-width: auto;
                }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .theme-toggle-btn,
                .theme-menu,
                .toast {
                    border-width: 2px;
                }
            }
        `;
        
        return styleSheet;
    }

    dispatchThemeChangeEvent(themeName) {
        const event = new CustomEvent('themechange', {
            detail: { theme: themeName, colors: this.themes.get(themeName)?.colors }
        });
        window.dispatchEvent(event);
    }

    getCurrentTheme() {
        return {
            name: this.currentTheme,
            data: this.themes.get(this.currentTheme)
        };
    }

    getAvailableThemes() {
        return Array.from(this.themes.keys());
    }

    isAnimationEnabled() {
        return this.isAnimationEnabled;
    }
}

// Utility function for easy theme management
export function initializeVisualDesign() {
    const visualManager = new VisualDesignManager();
    
    // Add styles to document
    const styleSheet = visualManager.createStyleSheet();
    document.head.appendChild(styleSheet);
    
    // Add theme toggle if there's a suitable container
    const headerContainer = document.querySelector('.header-controls') || 
                           document.querySelector('.controls') || 
                           document.querySelector('header');
    
    if (headerContainer) {
        const themeToggle = visualManager.createThemeToggle();
        headerContainer.appendChild(themeToggle);
    }
    
    return visualManager;
}