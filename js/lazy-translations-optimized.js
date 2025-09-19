/**
 * 懒加载翻译系统 - Core Web Vitals 优化版本
 * 只加载必要的语言，显著减少初始加载时间
 */

'use strict';

class LazyTranslationLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.currentLang = 'en';
        this.fallbackTranslations = this.getMinimalTranslations();
    }

    // 最小必要翻译 - 立即可用
    getMinimalTranslations() {
        return {
            en: {
                "nav.home": "Home",
                "nav.converter": "Converter", 
                "nav.about": "About",
                "upload.main": "Click to upload or drag images here",
                "btn.process": "Process",
                "btn.download": "Download",
                "loading": "Processing..."
            },
            zh: {
                "nav.home": "首页",
                "nav.converter": "转换器",
                "nav.about": "关于",
                "upload.main": "点击上传或拖拽图片至此",
                "btn.process": "处理", 
                "btn.download": "下载",
                "loading": "处理中..."
            }
        };
    }

    // 异步加载完整翻译
    async loadLanguage(lang) {
        if (this.cache.has(lang)) {
            return this.cache.get(lang);
        }

        if (this.loadingPromises.has(lang)) {
            return await this.loadingPromises.get(lang);
        }

        const loadPromise = this.fetchLanguageData(lang);
        this.loadingPromises.set(lang, loadPromise);

        try {
            const data = await loadPromise;
            this.cache.set(lang, data);
            this.loadingPromises.delete(lang);
            return data;
        } catch (error) {
            this.loadingPromises.delete(lang);
            window.logger?.warn(`懒加载翻译失败: ${lang}`, error);
            return this.fallbackTranslations[lang] || this.fallbackTranslations.en;
        }
    }

    async fetchLanguageData(lang) {
        // 动态导入完整翻译数据
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    }

    // 获取翻译 - 立即返回，后台加载
    getTranslation(key, lang = this.currentLang) {
        // 1. 检查缓存
        if (this.cache.has(lang) && this.cache.get(lang)[key]) {
            return this.cache.get(lang)[key];
        }

        // 2. 检查最小翻译
        if (this.fallbackTranslations[lang] && this.fallbackTranslations[lang][key]) {
            // 后台异步加载完整翻译
            this.loadLanguage(lang).then(() => {
                // 加载完成后更新页面
                this.updatePageTranslations();
            });
            return this.fallbackTranslations[lang][key];
        }

        // 3. 英语后备
        if (lang !== 'en' && this.fallbackTranslations.en[key]) {
            return this.fallbackTranslations.en[key];
        }

        // 4. 返回键名
        return key;
    }

    updatePageTranslations() {
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(el => {
            const key = el.getAttribute('data-lang');
            const translation = this.getTranslation(key);
            if (translation !== key) {
                el.textContent = translation;
            }
        });
    }

    async setLanguage(lang) {
        this.currentLang = lang;
        // 预加载新语言
        await this.loadLanguage(lang);
        this.updatePageTranslations();
    }
}

// 全局实例
window.lazyTranslationLoader = new LazyTranslationLoader();

// 向后兼容
window.__INLINE_I18N__ = window.lazyTranslationLoader.fallbackTranslations;

window.logger?.log('⚡ 懒加载翻译系统已初始化 - Core Web Vitals 优化版本');