/**
 * 优化的国际化系统 - Wplace Paint Tool
 * 轻量级、高效的翻译管理系统
 */

'use strict';

'use strict';

class OptimizedI18nSystem {
    constructor() {
        this.currentLang = 'en';
        this.supportedLangs = ['en', 'zh', 'ko', 'ja', 'es', 'fr', 'de', 'pt', 'tr', 'gn', 'mi'];
        this.translations = new Map();
        this.loadingPromises = new Map();
        this.isFileProtocol = window.location.protocol === 'file:';
        this.updateDebounceTimer = null;
        this.lastUpdateHash = null;

        // 获取保存的语言偏好，如果没有保存则默认使用英语
        const savedLang = localStorage.getItem('preferredLanguage');
        // 只有用户明确选择了语言才使用，否则默认英语
        this.currentLang = savedLang && this.supportedLangs.includes(savedLang) ? savedLang : 'en';
        console.debug('🧭 I18N ctor: savedLang=', savedLang, 'chosen=', this.currentLang, 'isFileProtocol=', this.isFileProtocol);
    }


    // 检测浏览器语言（仅在需要时使用）
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        return this.supportedLangs.includes(langCode) ? langCode : 'en';
    }

    // 重置语言偏好到默认英语（调试用）
    resetToEnglish() {
        console.debug('🔄 重置语言偏好到英语');
        localStorage.removeItem('preferredLanguage');
        this.currentLang = 'en';
        this.updatePage();
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = 'en';
        }
    }

    // 异步加载翻译文件
    async loadTranslations(lang) {
        // 如果已经加载，直接返回
        if (this.translations.has(lang)) {
            return this.translations.get(lang);
        }

        // 如果正在加载，返回现有的Promise
        if (this.loadingPromises.has(lang)) {
            return await this.loadingPromises.get(lang);
        }

        // 开始新的加载过程
        console.debug('🧭 loadTranslations: start lang=', lang, 'cache=', this.translations.has(lang), 'loading=', this.loadingPromises.has(lang));
        const loadingPromise = this._fetchTranslations(lang);
        this.loadingPromises.set(lang, loadingPromise);

        try {
            const translations = await loadingPromise;
            console.debug('✅ loadTranslations: loaded lang=', lang, 'keys=', Object.keys(translations || {}).length);
            this.translations.set(lang, translations);
            this.loadingPromises.delete(lang);
            return translations;
        } catch (error) {
            this.loadingPromises.delete(lang);
            console.error(`❌ 加载翻译文件失败 ${lang}:`, error);

            // 如果不是英语，尝试加载英语作为回退
            if (lang !== 'en') {
                return await this.loadTranslations('en');
            }

            // 如果英语也失败了，返回空对象
            return {};
        }
    }

    // 实际的文件获取逻辑（在 file:// 下优先使用内联对象，其次再尝试本地 JSON）
    async _fetchTranslations(lang) {
        // 根据当前页面路径动态确定lang目录的相对路径
        const isInSubdir = window.location.pathname.includes('/blog/') || 
                          window.location.pathname.includes('/icons/') ||
                          window.location.pathname.includes('blog/') ||
                          window.location.pathname.includes('icons/');
        const basePath = isInSubdir ? '../lang' : 'lang';
        const url = `${basePath}/${lang}.json`;
        console.debug(`💾 尝试加载翻译文件: ${url}`, '(isFileProtocol=', this.isFileProtocol, ')');

        // 1) file:// 下优先读取我们注入的 window.__INLINE_I18N__
        if (this.isFileProtocol && window.__INLINE_I18N__) {
            // 如果存在懒加载优化器，先尝试加载语言
            if (window.lazyTranslationOptimizer && !window.__INLINE_I18N__[lang]) {
                console.debug(`🔄 通过懒加载优化器加载: ${lang}`);
                await window.lazyTranslationOptimizer.loadLanguage(lang);
            }
            
            if (window.__INLINE_I18N__[lang]) {
                const data = window.__INLINE_I18N__[lang];
                console.debug(`✅ 使用内联词库: ${lang} (${Object.keys(data).length} 条)`);
                return data;
            }
        }

        try {
            const response = await fetch(url, { cache: 'no-cache' });
            console.debug('📡 fetch done:', { ok: response.ok, status: response.status, url: response.url });
            // 某些浏览器在 file:// 下返回 status=0/ok=false，但依然可读 body
            const text = await response.text();
            console.debug('📦 response text length=', text.length);
            const data = JSON.parse(text);
            console.debug(`✅ 翻译文件已加载: ${lang}.json (${Object.keys(data).length} 条)`);
            return data;
        } catch (err) {
            // 2) 兜底再查一次内联对象（防止极端时序问题）
            if (this.isFileProtocol && window.__INLINE_I18N__ && window.__INLINE_I18N__[lang]) {
                const data = window.__INLINE_I18N__[lang];
                console.debug(`✅ 使用内联词库(兜底): ${lang} (${Object.keys(data).length} 条)`);
                return data;
            }

            // 3) 再尝试从 <script type="application/json" data-i18n-source="xx"> 读取
            if (this.isFileProtocol) {
                // 只有在没有内联翻译时才显示错误信息
                if (!window.__INLINE_I18N__ || !window.__INLINE_I18N__[lang]) {
                    console.warn('⚠️ file:// 加载翻译失败，且无内联翻译数据', err);
                }
                try {
                    const inline = document.querySelector(`script[type="application/json"][data-i18n-source="${lang}"]`);
                    if (inline && inline.textContent) {
                        const data = JSON.parse(inline.textContent);
                        console.debug(`✅ 使用内联翻译(JSON脚本): ${lang} (${Object.keys(data).length} 条)`);
                        return data;
                    }
                } catch (_) {}
                // 4) 最终回退到极简翻译
                return this.getBasicFallbackTranslations(lang);
            }

            // 非 file 协议，直接抛错以便上层使用英语等回退
            throw new Error(`加载 ${url} 失败: ${err?.message || err}`);
        }
    }

    // 基本回退翻译（用于文件协议或紧急情况）
    getBasicFallbackTranslations(lang) {
        const basic = {
            // Branding & Nav
            "brand.name": "Wplace Paint Tool",
            "nav.home": "Home",
            "nav.converter": "Converter",
            "nav.blog": "Blog",
            "nav.about": "About",
            "nav.privacy": "Privacy",
            "nav.terms": "Terms",

            // Hero
            "hero.title": "Wplace Paint Tool: The Ultimate Pixel Toolkit to Dominate the Canvas",
            "hero.description": "Designed for creative players on wplace.live, this ultimate toolkit lets you dominate the canvas with ease.",

            // Upload
            "upload.main": "Click to upload or drag image here",
            "upload.sub": "Supports PNG, JPG formats (max 4MB)",
            "upload.batch": "Supports multiple file batch processing",

            // Pixel & Advanced
            "pixel.size": "Pixel Size",
            "pixel.desc": "Real-time preview as you adjust the slider",
            "advanced.title": "Advanced Settings",
            "advanced.dithering": "Enable Floyd-Steinberg Dithering",
            "advanced.scaling": "Image Scaling Method:",
            "advanced.grid": "Show Pixel Grid",

            // Controls
            "controls.quality": "Quality",
            "controls.brightness": "Brightness",
            "controls.contrast": "Contrast",
            "controls.saturation": "Saturation",

            // Scaling options
            "scaling.nearest": "Nearest Neighbor",
            "scaling.bilinear": "Bilinear",
            "scaling.lanczos": "Lanczos",

            // Preview & Buttons
            "preview.title": "Wplace Pixel Art Result",
            "preview.prompt": "Please upload an image to start",
            "btn.process": "Process",
            "btn.reset": "Reset",
            "btn.download.grid": "Grid",
            "btn.download": "Download",

            // Used colors & Palette
            "used.colors.title": "Colors Used in This Image",
            "used.colors.total": "Total",
            "used.colors.free": "Free",
            "used.colors.premium": "Premium",
            "palette.title": "Wplace 64-Color Palette",
            "palette.free": "Free (32)",
            "palette.premium": "Premium (32)",
            "palette.info": "Official Wplace color palette",

            // Features (headings only)
            "features.special.title": "What Makes Our Wplace Image Converter Special?",
            "features.subtitle.desc": "Transform any image into stunning pixel art designed for Wplace",
            "features.free.detailed.title": "Completely Free Tool",
            "features.free.detailed.desc": "Our Wplace pixel art creator costs nothing to use. No subscriptions, no hidden fees, no limits on conversions.",
            "features.privacy.title": "Privacy Protected",
            "features.privacy.detailed.desc": "Everything happens locally in your browser. Your images stay on your device - we never upload, store, or access your content.",
            "features.easy.detailed.title": "Effortless Conversion",
            "features.easy.detailed.desc": "No complex settings or technical knowledge needed. Just upload your image and watch it transform instantly.",
            "features.unlimited.detailed.title": "Any Size Welcome",
            "features.unlimited.detailed.desc": "From tiny icons to massive artworks - our converter processes images of any dimension.",

            // How To
            "howto.title": "How to Use Wplace Paint Tool",
            "howto.subtitle": "Convert images to pixel art in 4 simple steps",
            "howto.step1.title": "Upload Your Image",
            "howto.step1.desc": "Click the upload area or drag and drop your PNG, JPG, or SVG file.",
            "howto.step2.title": "Adjust Pixel Size",
            "howto.step2.desc": "Use the slider to control the pixel size.",
            "howto.step3.title": "Convert to Pixel Art",
            "howto.step3.desc": "Watch your image transform using our advanced converter.",
            "howto.step4.title": "Download Your Creation",
            "howto.step4.desc": "Choose between small pixel perfect or large scale versions.",

            // FAQ
            "faq.title": "Frequently Asked Questions",
            "faq.subtitle": "Everything you need to know about our Wplace Paint Tool",

            // Stats
            "stats.images": "Images converted with our wplace tool",
            "stats.users": "Active users of the wplace tool",
            "stats.satisfaction": "Satisfaction rate with our wplace tool",

            // Footer
            "footer.title": "About Wplace Paint Tool",
            "footer.independent.title": "Independent Fan Site",
            "footer.independent.desc": "This website is an independent, fan-run project built to serve the community's pixel art needs.",
            "footer.copyright": "© 2025 Wplace Paint Tool - Help Wplace Player Paint Easily - Free to use, no ownership claimed on generated artwork\nClient-side processing protects your privacy",

            // Misc
            "loading": "Processing..."
        };

        if (lang === 'zh') {
            return {
                ...basic,
                // Branding & Nav
                "brand.name": "Wplace画图工具",
                "nav.home": "首页",
                "nav.converter": "转换器",
                "nav.blog": "博客",
                "nav.about": "关于",
                "nav.privacy": "隐私政策",
                "nav.terms": "服务条款",

                // Hero
                "hero.title": "Wplace 画图工具：终极像素工具包，轻松征服画布",
                "hero.description": "专为 wplace.live 上的创意玩家设计，这个终极工具包让您轻松征服画布。",

                // Upload
                "upload.main": "点击上传或拖拽图片至此",
                "upload.sub": "支持 PNG, JPG 格式（最大 4MB）",
                "upload.batch": "支持多文件批量处理",

                // Pixel & Advanced
                "pixel.size": "像素尺寸",
                "pixel.desc": "调整滑块时自动转换",
                "advanced.title": "高级设置",
                "advanced.dithering": "启用 Floyd-Steinberg 抖动算法",
                "advanced.scaling": "图像缩放方式：",
                "advanced.grid": "显示像素网格",

                // Controls
                "controls.quality": "质量",
                "controls.brightness": "亮度",
                "controls.contrast": "对比度",
                "controls.saturation": "饱和度",

                // Scaling options
                "scaling.nearest": "最近邻插值",
                "scaling.bilinear": "双线性插值",
                "scaling.lanczos": "Lanczos 算法",

                // Preview & Buttons
                "preview.title": "Wplace 像素画预览",
                "preview.prompt": "请上传一张图片开始",
                "btn.process": "处理",
                "btn.reset": "重置",
                "btn.download.grid": "网格",
                "btn.download": "下载",

                // Used colors & Palette
                "used.colors.title": "此图像使用的颜色",
                "used.colors.total": "总计",
                "used.colors.free": "免费",
                "used.colors.premium": "付费",
                "palette.title": "Wplace 64 色调色板",
                "palette.free": "免费 (32)",
                "palette.premium": "付费 (32)",
                "palette.info": "官方 Wplace 调色板",

                // Features (headings only)
                "features.special.title": "我们的特色",
                "features.subtitle.desc": "将任何图像转换为适配 Wplace 的像素艺术",
                "features.free.detailed.title": "完全免费工具",
                "features.free.detailed.desc": "我们的像素艺术创建器完全免费。无订阅、无隐藏费用、无次数限制。",
                "features.privacy.title": "隐私保护",
                "features.privacy.detailed.desc": "一切本地进行。您的图像留在设备上——我们从不上传/存储/访问。",
                "features.easy.detailed.title": "轻松转换",
                "features.easy.detailed.desc": "无需复杂设置或技术知识。上传即可即时转换。",
                "features.unlimited.detailed.title": "任意尺寸欢迎",
                "features.unlimited.detailed.desc": "从小图标到大作品——任意尺寸均可处理。",

                // How To
                "howto.title": "如何使用 Wplace 画图工具",
                "howto.subtitle": "4 个简单步骤将图像转换为像素艺术",
                "howto.step1.title": "上传图片",
                "howto.step1.desc": "点击上传区域或拖拽 PNG/JPG/SVG 文件。",
                "howto.step2.title": "调整像素大小",
                "howto.step2.desc": "使用滑块控制像素大小。",
                "howto.step3.title": "转换为像素艺术",
                "howto.step3.desc": "使用高级算法实时预览转换效果。",
                "howto.step4.title": "下载您的作品",
                "howto.step4.desc": "选择像素完美或大尺寸版本。",

                // FAQ
                "faq.title": "常见问题",
                "faq.subtitle": "关于我们的 Wplace 画图工具你需要知道的一切",

                // Stats
                "stats.images": "使用我们的 wplace 工具转换的图像",
                "stats.users": "wplace 工具的活跃用户",
                "stats.satisfaction": "我们的 wplace 工具满意度",

                // Footer
                "footer.title": "关于 Wplace 画图工具",
                "footer.independent.title": "独立粉丝网站",
                "footer.independent.desc": "这是一个独立的粉丝项目，服务社区像素艺术需求。与官方 Wplace 无关。",
                "footer.copyright": "© 2025 Wplace 画图工具 - 帮助 Wplace 玩家轻松绘制 - 免费使用，对生成的艺术品不声明所有权\n客户端处理保护您的隐私",

                // Misc
                "loading": "处理中..."
            };
        }

        return basic;
    }

    // 获取翻译
    t(key, fallback = null) {
        const currentTranslations = this.translations.get(this.currentLang);
        if (currentTranslations && currentTranslations[key]) {
            return currentTranslations[key];
        }

        // 尝试英语回退
        const englishTranslations = this.translations.get('en');
        if (englishTranslations && englishTranslations[key]) {
            return englishTranslations[key];
        }

        // 返回回退值或键名
        return fallback || key;
    }

    // 切换语言（异步）
    async setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`⚠️ 不支持的语言: ${lang}`);
            return false;
        }

        console.debug(`🔄 切换语言到: ${lang}`);

        try {
            // 预加载目标语言
            console.debug('🧭 setLanguage: preloading', lang);
            await this.loadTranslations(lang);
            console.debug('🧭 setLanguage: preload done', lang, 'keys=', this.translations.get(lang) ? Object.keys(this.translations.get(lang)).length : 0);

            this.currentLang = lang;
            localStorage.setItem('preferredLanguage', lang);
            this.updatePage();

            // 预加载英语（如果不是英语）
            if (lang !== 'en') {
                this.loadTranslations('en').catch(() => {
                    // 静默失败，不影响用户体验
                });
            }

            return true;
        } catch (error) {
            console.error(`❌ 切换语言失败:`, error);
            return false;
        }
    }

    // 防抖更新页面翻译
    updatePage() {
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }

        this.updateDebounceTimer = setTimeout(() => {
            this._performUpdate();
        }, 100);
    }

    // 实际执行更新
    _performUpdate() {
        const elements = document.querySelectorAll('[data-lang]');
        let translatedCount = 0;

        // 计算更新哈希以避免重复更新 - 包含内容签名确保准确性
        const contentSignature = Array.from(elements).slice(0, 5).map(el => 
            el.getAttribute('data-lang') + ':' + (el.textContent || '').substring(0, 20)
        ).join('|');
        const updateHash = `${this.currentLang}_${elements.length}_${contentSignature}`;
        if (this.lastUpdateHash === updateHash) {
            console.debug('⚡ 跳过重复翻译更新');
            return;
        }

        elements.forEach(el => {
            const key = el.getAttribute('data-lang');
            const translation = this.t(key);

            // 始终应用翻译，即使翻译和键相同
            if (translation) {
                // 如果翻译中包含 HTML 标签或换行，使用 innerHTML
                if (/[<>&]/.test(translation) || translation.includes('\n')) {
                    // 安全处理换行符，防止XSS
                    const tempDiv = document.createElement('div');
                    tempDiv.textContent = translation;
                    el.innerHTML = tempDiv.innerHTML.replace(/\n/g, '<br>');
                } else {
                    el.textContent = translation;
                }
                translatedCount++;
            }
        });

        // 强制翻译一些没有 data-lang 属性的重要文本
        this.forceTranslateCommonTexts();

        // 更新语言选择器
        const selector = document.getElementById('languageSelector');
        if (selector && selector.value !== this.currentLang) {
            selector.value = this.currentLang;
            console.debug(`🔄 语言选择器已同步到: ${this.currentLang}`);
        }

        // 更新文档语言属性
        document.documentElement.lang = this.currentLang;

        this.lastUpdateHash = updateHash;
        console.debug(`✅ 页面翻译完成: ${translatedCount}/${elements.length} 个元素`);
    }

    // 强制翻译一些常见的固定文本（优化版本）
    forceTranslateCommonTexts() {
        if (this.currentLang === 'en') return;

        const translations = this.translations.get(this.currentLang);
        if (!translations) return;

        // 常见的需要强制翻译的文本映射
        const forceTranslateMap = {
            'en': {
                'Frequently Asked Questions': 'faq.title',
                'What Users Say About Wplace Paint Tool': 'testimonials.title',
                'What Users Say About Wplace Paint Tool': 'testimonials.title',
                'Real feedback from creators using Wplace Paint Tool': 'testimonials.subtitle',
                'Independent Fan Site': 'footer.independent.title',
                'Everything you need to know about our Wplace Paint Tool': 'faq.subtitle'
            }
        };

        const textMap = forceTranslateMap['en'] || {};
        let forceCount = 0;

        // 批量处理文本节点，减少DOM遍历次数
        Object.keys(textMap).forEach(englishText => {
            const translationKey = textMap[englishText];
            const translation = translations[translationKey];
            
            if (translation && translation !== englishText) {
                // 使用xpath查询提高效率
                const xpath = `//text()[normalize-space(.)='${englishText}']`;
                const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                
                for (let i = 0; i < result.snapshotLength; i++) {
                    const textNode = result.snapshotItem(i);
                    if (textNode && textNode.textContent.trim() === englishText) {
                        textNode.textContent = translation;
                        forceCount++;
                    }
                }
            }
        });

        if (forceCount > 0) {
            console.debug(`✅ 强制翻译完成: ${forceCount} 个文本`);
        }
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 获取支持的语言列表
    getSupportedLanguages() {
        return [...this.supportedLangs];
    }

    // 初始化系统
    async init() {
        console.debug('🌍 优化版翻译系统初始化 - Wplace Paint Tool');
        console.debug('🌍 当前语言:', this.currentLang);
        console.debug('🌍 支持语言:', this.supportedLangs.join(', '));
        console.debug('🌍 运行环境:', this.isFileProtocol ? 'File协议' : 'HTTP服务器');

        try {
            // 预加载当前语言
            console.debug('🧭 init: preloading currentLang=', this.currentLang);
            await this.loadTranslations(this.currentLang);
            console.debug('🧭 init: preload done for', this.currentLang, 'hasKeys=', this.translations.get(this.currentLang) ? Object.keys(this.translations.get(this.currentLang)).length : 0);

            // 绑定语言选择器
            this.bindLanguageSelector();

            // 绑定移动菜单
            this.bindMobileMenu();

            // 初始化页面翻译
            this.updatePage();

            console.debug('✅ 翻译系统初始化完成');
        } catch (error) {
            console.error('❌ 翻译系统初始化失败:', error);
            // 即使失败也尝试更新页面
            this.updatePage();
        }
    }

    // 绑定语言选择器
    bindLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (selector) {
            // 确保选择器显示当前语言
            selector.value = this.currentLang;
            console.debug(`🔄 语言选择器设置为: ${this.currentLang}`);

            // 移除旧的事件监听器（如果存在）
            selector.removeEventListener('change', this._languageChangeHandler);

            // 创建新的事件处理器
            this._languageChangeHandler = async (e) => {
                console.debug(`🔄 用户选择语言: ${e.target.value}`);
                const success = await this.setLanguage(e.target.value);
                if (!success) {
                    // 如果切换失败，回滚选择器
                    e.target.value = this.currentLang;
                }
            };

            selector.addEventListener('change', this._languageChangeHandler);
            console.debug('✅ 语言选择器已绑定，当前值:', selector.value);
        } else {
            console.warn('⚠️ 找不到语言选择器 #languageSelector');
        }
    }

    // 绑定移动菜单
    bindMobileMenu() {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            console.debug('✅ 移动菜单已绑定');
        }
    }

    // 销毁系统（清理资源）
    destroy() {
        // 清理事件监听器
        const selector = document.getElementById('languageSelector');
        if (selector && this._languageChangeHandler) {
            selector.removeEventListener('change', this._languageChangeHandler);
        }

        // 清理内存
        this.translations.clear();
        this.loadingPromises.clear();

        console.debug('🧹 翻译系统已销毁');
    }
}

// 创建全局实例
let optimizedI18n = null;

// 初始化函数
async function initOptimizedI18n() {
    if (!optimizedI18n) {
        optimizedI18n = new OptimizedI18nSystem();
    }

    await optimizedI18n.init();

    // 导出全局函数
    window.t = optimizedI18n.t.bind(optimizedI18n);
    window.i18n = optimizedI18n;

    return optimizedI18n;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizedI18n);
} else {
    initOptimizedI18n();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OptimizedI18nSystem, initOptimizedI18n };
}