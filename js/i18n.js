// Universal Internationalization System for Wplace Tool
// Loads translations from external JSON files and applies them to HTML elements

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.isLoaded = false;
        
        // Get saved language preference
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        this.currentLanguage = savedLang;
    }

    async loadTranslations(language) {
        if (this.translations[language]) {
            return this.translations[language];
        }

        try {
            const response = await fetch(`lang/${language}.json`);
            
            if (!response.ok) {
                console.warn(`Failed to load translations for ${language}, using fallback`);
                return {};
            }
            
            const translations = await response.json();
            this.translations[language] = translations;
            return translations;
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            return {};
        }
    }

    translateText(key, lang = this.currentLanguage) {
        if (!this.translations[lang]) {
            return key;
        }
        
        return this.translations[lang][key] || key;
    }

    async translatePage(language = this.currentLanguage) {
        // Load translations if not already loaded
        await this.loadTranslations(language);
        
        this.currentLanguage = language;
        const elements = document.querySelectorAll('[data-lang]');
        
        elements.forEach((el) => {
            const key = el.getAttribute('data-lang');
            const translation = this.translateText(key, language);
            
            if (translation && translation !== key) {
                // Handle elements that contain HTML (like line breaks)
                if (el.innerHTML.includes('<br>') || translation.includes('\n')) {
                    el.innerHTML = translation.replace(/\n/g, '<br>');
                } else {
                    el.textContent = translation;
                }
            }
        });
        
        localStorage.setItem('preferredLanguage', language);
        
        // Update language selector if present
        const selector = document.getElementById('languageSelector');
        if (selector && selector.value !== language) {
            selector.value = language;
        }
        
        this.isLoaded = true;
    }

    async initialize() {
        // Set up language selector if present
        const languageSelector = document.getElementById('languageSelector');
        
        if (languageSelector) {
            languageSelector.value = this.currentLanguage;
            
            languageSelector.addEventListener('change', async (e) => {
                await this.translatePage(e.target.value);
            });
        }
        
        // Set up mobile menu toggle if present
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Load initial translations
        console.log(`🎯 DEBUG: About to load initial translations for: ${this.currentLanguage}`);
        await this.translatePage(this.currentLanguage);
        
        console.log('🎯 DEBUG: I18n system initialized successfully');
    }
}

// Global instance
let globalI18n = null;

// Initialize when DOM is loaded
function initializeI18n() {
    if (!globalI18n) {
        globalI18n = new I18nManager();
    }
    
    globalI18n.initialize();
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
    initializeI18n();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nManager, initializeI18n };
}