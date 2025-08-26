import { CONFIG } from '../config.js';
import { WplaceError } from '../core/errorHandler.js';

export class InternationalizationManager {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.supportedLanguages = new Map();
        this.translations = new Map();
        this.dateFormatters = new Map();
        this.numberFormatters = new Map();
        this.direction = 'ltr';
        this.fallbackLanguage = 'en-US';
        
        this.initializeSupportedLanguages();
        this.initializeTranslations();
        this.initializeFormatters();
        this.loadUserLanguagePreference();
    }

    initializeSupportedLanguages() {
        // 支持的语言配置
        this.supportedLanguages.set('zh-CN', {
            name: '简体中文',
            nativeName: '简体中文',
            direction: 'ltr',
            dateFormat: 'YYYY年MM月DD日',
            timeFormat: 'HH:mm:ss',
            currency: 'CNY',
            region: 'CN'
        });

        this.supportedLanguages.set('zh-TW', {
            name: '繁體中文',
            nativeName: '繁體中文',
            direction: 'ltr',
            dateFormat: 'YYYY年MM月DD日',
            timeFormat: 'HH:mm:ss',
            currency: 'TWD',
            region: 'TW'
        });

        this.supportedLanguages.set('en-US', {
            name: 'English',
            nativeName: 'English',
            direction: 'ltr',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: 'h:mm:ss A',
            currency: 'USD',
            region: 'US'
        });

        this.supportedLanguages.set('ja-JP', {
            name: 'Japanese',
            nativeName: '日本語',
            direction: 'ltr',
            dateFormat: 'YYYY年MM月DD日',
            timeFormat: 'HH:mm:ss',
            currency: 'JPY',
            region: 'JP'
        });

        this.supportedLanguages.set('ko-KR', {
            name: 'Korean',
            nativeName: '한국어',
            direction: 'ltr',
            dateFormat: 'YYYY년 MM월 DD일',
            timeFormat: 'HH:mm:ss',
            currency: 'KRW',
            region: 'KR'
        });

        this.supportedLanguages.set('ar-SA', {
            name: 'Arabic',
            nativeName: 'العربية',
            direction: 'rtl',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'SAR',
            region: 'SA'
        });
    }

    initializeTranslations() {
        // 简体中文翻译
        this.translations.set('zh-CN', {
            // 应用标题和基本信息
            appTitle: 'Wplace 像素画转换器',
            appDescription: '将图片转换为像素画风格的r/place画布',
            
            // 界面控件
            uploadImage: '上传图片',
            dragDropHint: '拖拽图片到这里或点击上传',
            selectFile: '选择文件',
            processing: '处理中...',
            download: '下载',
            reset: '重置',
            settings: '设置',
            about: '关于',
            help: '帮助',
            
            // 处理选项
            processOptions: '处理选项',
            outputSize: '输出尺寸',
            colorPalette: '调色板',
            quality: '质量',
            dithering: '抖动',
            brightness: '亮度',
            contrast: '对比度',
            saturation: '饱和度',
            
            // 文件相关
            fileName: '文件名',
            fileSize: '文件大小',
            fileType: '文件类型',
            dimensions: '尺寸',
            
            // 错误消息
            fileNotSupported: '不支持的文件格式',
            fileTooLarge: '文件过大',
            processingFailed: '处理失败',
            networkError: '网络错误',
            unknownError: '未知错误',
            
            // 成功消息
            uploadSuccess: '上传成功',
            processingComplete: '处理完成',
            downloadReady: '下载准备完成',
            
            // 主题相关
            lightTheme: '浅色主题',
            darkTheme: '深色主题',
            autoTheme: '跟随系统',
            
            // 语言选择
            language: '语言',
            selectLanguage: '选择语言',
            
            // 进度相关
            uploadProgress: '上传进度',
            processingProgress: '处理进度',
            
            // 快捷键
            shortcuts: '快捷键',
            keyboardShortcuts: '键盘快捷键',
            
            // 设备相关
            mobileOptimized: '移动端优化',
            touchSupport: '触摸支持',
            
            // 可访问性
            accessibility: '无障碍功能',
            screenReaderSupport: '屏幕阅读器支持',
            keyboardNavigation: '键盘导航',
            
            // 单位
            bytes: '字节',
            kb: 'KB',
            mb: 'MB',
            pixels: '像素',
            percent: '%',
            
            // 时间
            seconds: '秒',
            minutes: '分钟',
            hours: '小时',
            
            // 常用动作
            ok: '确定',
            cancel: '取消',
            yes: '是',
            no: '否',
            retry: '重试',
            skip: '跳过',
            next: '下一步',
            previous: '上一步',
            save: '保存',
            load: '加载',
            copy: '复制',
            paste: '粘贴',
            cut: '剪切',
            undo: '撤销',
            redo: '重做'
        });

        // 英文翻译
        this.translations.set('en-US', {
            appTitle: 'Wplace Pixel Art Converter',
            appDescription: 'Convert images to pixel art style for r/place canvas',
            
            uploadImage: 'Upload Image',
            dragDropHint: 'Drag and drop image here or click to upload',
            selectFile: 'Select File',
            processing: 'Processing...',
            download: 'Download',
            reset: 'Reset',
            settings: 'Settings',
            about: 'About',
            help: 'Help',
            
            processOptions: 'Process Options',
            outputSize: 'Output Size',
            colorPalette: 'Color Palette',
            quality: 'Quality',
            dithering: 'Dithering',
            brightness: 'Brightness',
            contrast: 'Contrast',
            saturation: 'Saturation',
            
            fileName: 'File Name',
            fileSize: 'File Size',
            fileType: 'File Type',
            dimensions: 'Dimensions',
            
            fileNotSupported: 'File format not supported',
            fileTooLarge: 'File too large',
            processingFailed: 'Processing failed',
            networkError: 'Network error',
            unknownError: 'Unknown error',
            
            uploadSuccess: 'Upload successful',
            processingComplete: 'Processing complete',
            downloadReady: 'Download ready',
            
            lightTheme: 'Light Theme',
            darkTheme: 'Dark Theme',
            autoTheme: 'Follow System',
            
            language: 'Language',
            selectLanguage: 'Select Language',
            
            uploadProgress: 'Upload Progress',
            processingProgress: 'Processing Progress',
            
            shortcuts: 'Shortcuts',
            keyboardShortcuts: 'Keyboard Shortcuts',
            
            mobileOptimized: 'Mobile Optimized',
            touchSupport: 'Touch Support',
            
            accessibility: 'Accessibility',
            screenReaderSupport: 'Screen Reader Support',
            keyboardNavigation: 'Keyboard Navigation',
            
            bytes: 'Bytes',
            kb: 'KB',
            mb: 'MB',
            pixels: 'Pixels',
            percent: '%',
            
            seconds: 'Seconds',
            minutes: 'Minutes',
            hours: 'Hours',
            
            ok: 'OK',
            cancel: 'Cancel',
            yes: 'Yes',
            no: 'No',
            retry: 'Retry',
            skip: 'Skip',
            next: 'Next',
            previous: 'Previous',
            save: 'Save',
            load: 'Load',
            copy: 'Copy',
            paste: 'Paste',
            cut: 'Cut',
            undo: 'Undo',
            redo: 'Redo'
        });

        // 日文翻译
        this.translations.set('ja-JP', {
            appTitle: 'Wplace ピクセルアート変換器',
            appDescription: 'r/place キャンバス用のピクセルアートスタイルに画像を変換',
            
            uploadImage: '画像をアップロード',
            dragDropHint: '画像をここにドラッグ＆ドロップまたはクリックしてアップロード',
            selectFile: 'ファイルを選択',
            processing: '処理中...',
            download: 'ダウンロード',
            reset: 'リセット',
            settings: '設定',
            about: 'について',
            help: 'ヘルプ',
            
            processOptions: '処理オプション',
            outputSize: '出力サイズ',
            colorPalette: 'カラーパレット',
            quality: '品質',
            dithering: 'ディザリング',
            brightness: '明度',
            contrast: 'コントラスト',
            saturation: '彩度',
            
            fileName: 'ファイル名',
            fileSize: 'ファイルサイズ',
            fileType: 'ファイルタイプ',
            dimensions: 'サイズ',
            
            fileNotSupported: 'サポートされていないファイル形式',
            fileTooLarge: 'ファイルが大きすぎます',
            processingFailed: '処理に失敗しました',
            networkError: 'ネットワークエラー',
            unknownError: '不明なエラー',
            
            uploadSuccess: 'アップロード成功',
            processingComplete: '処理完了',
            downloadReady: 'ダウンロード準備完了',
            
            lightTheme: 'ライトテーマ',
            darkTheme: 'ダークテーマ',
            autoTheme: 'システムに従う',
            
            language: '言語',
            selectLanguage: '言語を選択',
            
            uploadProgress: 'アップロード進行状況',
            processingProgress: '処理進行状況',
            
            shortcuts: 'ショートカット',
            keyboardShortcuts: 'キーボードショートカット',
            
            mobileOptimized: 'モバイル最適化',
            touchSupport: 'タッチサポート',
            
            accessibility: 'アクセシビリティ',
            screenReaderSupport: 'スクリーンリーダーサポート',
            keyboardNavigation: 'キーボードナビゲーション'
        });

        // 阿拉伯语翻译
        this.translations.set('ar-SA', {
            appTitle: 'محول فن البيكسل Wplace',
            appDescription: 'تحويل الصور إلى نمط فن البيكسل للوحة r/place',
            
            uploadImage: 'رفع صورة',
            dragDropHint: 'اسحب وأفلت الصورة هنا أو انقر للرفع',
            selectFile: 'اختر ملف',
            processing: 'جاري المعالجة...',
            download: 'تحميل',
            reset: 'إعادة تعيين',
            settings: 'الإعدادات',
            about: 'حول',
            help: 'مساعدة',
            
            processOptions: 'خيارات المعالجة',
            outputSize: 'حجم الإخراج',
            colorPalette: 'لوحة الألوان',
            quality: 'الجودة',
            dithering: 'التشويش',
            brightness: 'السطوع',
            contrast: 'التباين',
            saturation: 'التشبع',
            
            fileName: 'اسم الملف',
            fileSize: 'حجم الملف',
            fileType: 'نوع الملف',
            dimensions: 'الأبعاد',
            
            fileNotSupported: 'تنسيق الملف غير مدعوم',
            fileTooLarge: 'الملف كبير جداً',
            processingFailed: 'فشلت المعالجة',
            networkError: 'خطأ في الشبكة',
            unknownError: 'خطأ غير معروف',
            
            uploadSuccess: 'تم الرفع بنجاح',
            processingComplete: 'اكتملت المعالجة',
            downloadReady: 'التحميل جاهز',
            
            lightTheme: 'المظهر الفاتح',
            darkTheme: 'المظهر الداكن',
            autoTheme: 'تابع النظام',
            
            language: 'اللغة',
            selectLanguage: 'اختر اللغة'
        });
    }

    initializeFormatters() {
        // 初始化日期和数字格式化器
        this.supportedLanguages.forEach((config, language) => {
            try {
                this.dateFormatters.set(language, new Intl.DateTimeFormat(language, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }));

                this.numberFormatters.set(language, new Intl.NumberFormat(language, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }));
            } catch (error) {
                console.warn(`无法为语言 ${language} 创建格式化器:`, error);
            }
        });
    }

    loadUserLanguagePreference() {
        try {
            const savedLanguage = localStorage.getItem('wplace-language');
            const browserLanguage = navigator.language || navigator.languages[0];
            
            let preferredLanguage = this.currentLanguage;
            
            if (savedLanguage && this.supportedLanguages.has(savedLanguage)) {
                preferredLanguage = savedLanguage;
            } else if (this.supportedLanguages.has(browserLanguage)) {
                preferredLanguage = browserLanguage;
            } else {
                // 尝试匹配语言族
                const languageFamily = browserLanguage.split('-')[0];
                for (const [lang] of this.supportedLanguages) {
                    if (lang.startsWith(languageFamily)) {
                        preferredLanguage = lang;
                        break;
                    }
                }
            }
            
            this.setLanguage(preferredLanguage);
        } catch (error) {
            console.warn('无法加载语言偏好设置:', error);
        }
    }

    setLanguage(languageCode) {
        if (!this.supportedLanguages.has(languageCode)) {
            throw new WplaceError(`不支持的语言: ${languageCode}`, 'UNSUPPORTED_LANGUAGE');
        }

        this.currentLanguage = languageCode;
        const languageConfig = this.supportedLanguages.get(languageCode);
        this.direction = languageConfig.direction;

        // 更新HTML文档属性
        document.documentElement.lang = languageCode;
        document.documentElement.dir = this.direction;

        // 保存用户偏好
        localStorage.setItem('wplace-language', languageCode);

        // 触发语言变更事件
        this.dispatchLanguageChangeEvent(languageCode);

        // 更新页面内容
        this.updatePageContent();
    }

    translate(key, params = {}) {
        const translations = this.translations.get(this.currentLanguage) || 
                           this.translations.get(this.fallbackLanguage) || {};
        
        let translation = translations[key] || key;

        // 参数替换
        Object.keys(params).forEach(paramKey => {
            const placeholder = `{${paramKey}}`;
            translation = translation.replace(new RegExp(placeholder, 'g'), params[paramKey]);
        });

        return translation;
    }

    // 简写方法
    t(key, params = {}) {
        return this.translate(key, params);
    }

    formatDate(date, options = {}) {
        const formatter = this.dateFormatters.get(this.currentLanguage) || 
                         this.dateFormatters.get(this.fallbackLanguage);
        
        if (!formatter) {
            return date.toLocaleDateString();
        }

        return formatter.format(date);
    }

    formatNumber(number, options = {}) {
        const formatter = this.numberFormatters.get(this.currentLanguage) || 
                         this.numberFormatters.get(this.fallbackLanguage);
        
        if (!formatter) {
            return number.toString();
        }

        return formatter.format(number);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return `0 ${this.t('bytes')}`;
        
        const k = 1024;
        const sizes = ['bytes', 'kb', 'mb'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        
        return `${this.formatNumber(size)} ${this.t(sizes[i])}`;
    }

    formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)} ${this.t('seconds')}`;
        } else if (seconds < 3600) {
            return `${Math.round(seconds / 60)} ${this.t('minutes')}`;
        } else {
            return `${Math.round(seconds / 3600)} ${this.t('hours')}`;
        }
    }

    updatePageContent() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'button' || element.type === 'submit') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // 更新带有 data-i18n-title 属性的元素标题
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });

        // 更新带有 data-i18n-aria-label 属性的元素
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.translate(key));
        });
    }

    createLanguageSelector() {
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'language-selector-container';

        const currentLanguage = this.supportedLanguages.get(this.currentLanguage);
        selectorContainer.innerHTML = `
            <button class="language-selector-btn" title="${this.t('selectLanguage')}">
                <span class="language-code">${this.currentLanguage}</span>
                <span class="language-name">${currentLanguage.nativeName}</span>
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="language-menu hidden">
                ${Array.from(this.supportedLanguages.entries()).map(([code, config]) => `
                    <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                         data-language="${code}">
                        <span class="language-code">${code}</span>
                        <span class="language-name">${config.nativeName}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加事件监听器
        const selectorBtn = selectorContainer.querySelector('.language-selector-btn');
        const languageMenu = selectorContainer.querySelector('.language-menu');
        const languageOptions = selectorContainer.querySelectorAll('.language-option');

        selectorBtn.addEventListener('click', () => {
            languageMenu.classList.toggle('hidden');
        });

        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const languageCode = option.dataset.language;
                this.setLanguage(languageCode);
                languageMenu.classList.add('hidden');
                this.updateLanguageSelectorDisplay(selectorContainer);
            });
        });

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!selectorContainer.contains(e.target)) {
                languageMenu.classList.add('hidden');
            }
        });

        return selectorContainer;
    }

    updateLanguageSelectorDisplay(container) {
        const currentLanguage = this.supportedLanguages.get(this.currentLanguage);
        const selectorBtn = container.querySelector('.language-selector-btn');
        
        selectorBtn.querySelector('.language-code').textContent = this.currentLanguage;
        selectorBtn.querySelector('.language-name').textContent = currentLanguage.nativeName;

        // 更新选中状态
        container.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.language === this.currentLanguage);
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getCurrentLanguageConfig() {
        return this.supportedLanguages.get(this.currentLanguage);
    }

    getSupportedLanguages() {
        return Array.from(this.supportedLanguages.entries()).map(([code, config]) => ({
            code,
            ...config
        }));
    }

    isRTL() {
        return this.direction === 'rtl';
    }

    dispatchLanguageChangeEvent(languageCode) {
        const event = new CustomEvent('languagechange', {
            detail: { 
                language: languageCode,
                config: this.supportedLanguages.get(languageCode),
                direction: this.direction
            }
        });
        window.dispatchEvent(event);
    }

    createStyleSheet() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .language-selector-container {
                position: relative;
                display: inline-block;
            }

            .language-selector-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius);
                padding: 8px 12px;
                cursor: pointer;
                transition: all var(--transition-fast);
                box-shadow: var(--shadow-small);
                color: var(--color-text);
                min-width: 120px;
            }

            .language-selector-btn:hover {
                background: var(--color-surfaceVariant);
                box-shadow: var(--shadow-medium);
            }

            .language-code {
                font-size: 12px;
                opacity: 0.8;
                text-transform: uppercase;
            }

            .language-name {
                flex: 1;
                text-align: left;
            }

            .dropdown-arrow {
                font-size: 10px;
                opacity: 0.6;
                transition: transform var(--transition-fast);
            }

            .language-selector-container:hover .dropdown-arrow {
                transform: rotate(180deg);
            }

            .language-menu {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-large);
                z-index: 1000;
                margin-top: 4px;
                max-height: 200px;
                overflow-y: auto;
            }

            .language-menu.hidden {
                display: none;
            }

            .language-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background var(--transition-fast);
                color: var(--color-text);
            }

            .language-option:hover {
                background: var(--color-backgroundSecondary);
            }

            .language-option.active {
                background: var(--color-primaryLight);
                color: var(--color-primary);
            }

            .language-option:first-child {
                border-radius: var(--border-radius) var(--border-radius) 0 0;
            }

            .language-option:last-child {
                border-radius: 0 0 var(--border-radius) var(--border-radius);
            }

            /* RTL 支持 */
            [dir="rtl"] .language-selector-btn {
                text-align: right;
            }

            [dir="rtl"] .language-name {
                text-align: right;
            }

            [dir="rtl"] .language-menu {
                left: auto;
                right: 0;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .language-selector-btn {
                    min-width: 100px;
                    padding: 6px 10px;
                }
                
                .language-option {
                    padding: 10px 12px;
                }
            }
        `;
        
        return styleSheet;
    }
}

// 实用函数
export function initializeInternationalization() {
    const i18nManager = new InternationalizationManager();
    
    // 添加样式表到文档
    const styleSheet = i18nManager.createStyleSheet();
    document.head.appendChild(styleSheet);
    
    // 如果有合适的容器，添加语言选择器
    const headerContainer = document.querySelector('.header-controls') || 
                           document.querySelector('.controls') || 
                           document.querySelector('header');
    
    if (headerContainer) {
        const languageSelector = i18nManager.createLanguageSelector();
        headerContainer.appendChild(languageSelector);
    }
    
    // 使 i18n 管理器全局可访问
    window.i18n = i18nManager;
    
    return i18nManager;
}