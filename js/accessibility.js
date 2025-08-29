/**
 * 无障碍访问（Accessibility）增强系统
 * 提供完整的可访问性支持，符合WCAG 2.1 AA标准
 */

class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            largeText: false,
            reduceMotion: false,
            screenReader: false,
            keyboardNavigation: true
        };
        
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.announcements = [];
        
        this.init();
    }
    
    init() {
        console.log('♿ 初始化无障碍访问系统...');
        
        // 检测用户系统偏好
        this.detectSystemPreferences();
        
        // 设置键盘导航
        this.setupKeyboardNavigation();
        
        // 设置屏幕阅读器支持
        this.setupScreenReaderSupport();
        
        // 设置焦点管理
        this.setupFocusManagement();
        
        // 创建无障碍控制面板
        this.createAccessibilityPanel();
        
        // 增强现有元素
        this.enhanceExistingElements();
        
        // 监听动态内容变化
        this.setupMutationObserver();
        
        console.log('✅ 无障碍访问系统初始化完成');
    }
    
    // 检测系统偏好
    detectSystemPreferences() {
        // 检测高对比度偏好
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.highContrast = true;
            this.applyHighContrast();
        }
        
        // 检测减少动画偏好
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reduceMotion = true;
            this.reduceMotion();
        }
        
        // 检测大字体偏好
        if (window.matchMedia('(prefers-font-size: large)').matches) {
            this.settings.largeText = true;
            this.applyLargeText();
        }
        
        console.log('🔍 系统偏好检测完成:', this.settings);
    }
    
    // 设置键盘导航
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Tab键焦点环增强
        document.addEventListener('focusin', (e) => {
            this.enhanceFocusRing(e.target);
        });
        
        // 跳转链接（Skip Links）
        this.createSkipLinks();
    }
    
    // 处理键盘导航
    handleKeyboardNavigation(event) {
        const { key, ctrlKey, altKey, shiftKey } = event;
        
        // Alt + A: 打开无障碍面板
        if (altKey && key.toLowerCase() === 'a') {
            event.preventDefault();
            this.toggleAccessibilityPanel();
            return;
        }
        
        // Alt + H: 回到顶部
        if (altKey && key.toLowerCase() === 'h') {
            event.preventDefault();
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            this.announce('已滚动到页面顶部');
            return;
        }
        
        // Alt + M: 跳转到主内容
        if (altKey && key.toLowerCase() === 'm') {
            event.preventDefault();
            const main = document.querySelector('main') || document.getElementById('main-content');
            if (main) {
                main.focus();
                this.announce('已跳转到主内容区域');
            }
            return;
        }
        
        // Alt + N: 跳转到导航
        if (altKey && key.toLowerCase() === 'n') {
            event.preventDefault();
            const nav = document.querySelector('nav') || document.getElementById('navigation');
            if (nav) {
                nav.focus();
                this.announce('已跳转到导航区域');
            }
            return;
        }
        
        // Escape: 关闭模态框或面板
        if (key === 'Escape') {
            this.closeModalOrPanel();
            return;
        }
        
        // 方向键导航（在特定区域内）
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            this.handleArrowKeyNavigation(event);
        }
    }
    
    // 创建跳转链接
    createSkipLinks() {
        const skipLinks = document.createElement('nav');
        skipLinks.className = 'skip-links';
        skipLinks.setAttribute('aria-label', '跳转链接');
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">跳转到主内容</a>
            <a href="#navigation" class="skip-link">跳转到导航</a>
            <a href="#footer" class="skip-link">跳转到页脚</a>
        `;
        
        // 确保body存在后再插入
        if (document.body && document.body.firstChild) {
            document.body.insertBefore(skipLinks, document.body.firstChild);
        } else if (document.body) {
            document.body.appendChild(skipLinks);
        } else {
            console.warn('⚠️ 无法创建跳转链接：document.body 不存在');
            return;
        }
        
        // 样式
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -40px;
                left: 6px;
                z-index: 10000;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                z-index: 10000;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 设置屏幕阅读器支持
    setupScreenReaderSupport() {
        // 创建ARIA实时区域
        this.createAriaLiveRegion();
        
        // 增强现有元素的ARIA属性
        this.enhanceAriaAttributes();
        
        // 设置页面结构语义化
        this.enhanceSemanticStructure();
    }
    
    // 创建ARIA实时区域
    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        // 确保DOM已加载后再添加元素
        if (document.body) {
            document.body.appendChild(liveRegion);
        } else {
            // 如果body还不存在，等待DOM加载完成
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    document.body.appendChild(liveRegion);
                }
            });
        }
        
        this.liveRegion = liveRegion;
    }
    
    // 屏幕阅读器播报
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;
        
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;
        
        // 记录播报历史
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
        
        console.log(`📢 [Screen Reader] ${message}`);
    }
    
    // 增强ARIA属性
    enhanceAriaAttributes() {
        // 为所有按钮添加适当的ARIA标签
        document.querySelectorAll('button').forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                const icon = button.querySelector('svg, i');
                if (icon) {
                    button.setAttribute('aria-label', '按钮');
                }
            }
        });
        
        // 为表单控件添加标签关联
        document.querySelectorAll('input, select, textarea').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
        
        // 为图片添加alt属性
        document.querySelectorAll('img').forEach(img => {
            if (!img.getAttribute('alt')) {
                img.setAttribute('alt', '图像');
            }
        });
        
        // 标记装饰性图标
        document.querySelectorAll('svg, i.icon').forEach(icon => {
            if (!icon.getAttribute('aria-hidden') && !icon.getAttribute('aria-label')) {
                icon.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    // 增强语义化结构
    enhanceSemanticStructure() {
        // 为主要区域添加landmark角色
        const main = document.querySelector('main');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
        
        // 为导航添加角色
        document.querySelectorAll('nav').forEach(nav => {
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', '导航菜单');
            }
        });
        
        // 为标题添加层级结构
        this.validateHeadingStructure();
    }
    
    // 验证标题层级结构
    validateHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let expectedLevel = 1;
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (index === 0 && level !== 1) {
                console.warn('⚠️ 页面应该从h1标题开始');
            }
            
            if (level > expectedLevel + 1) {
                console.warn(`⚠️ 标题层级跳跃: ${heading.textContent}`);
            }
            
            expectedLevel = Math.max(expectedLevel, level);
        });
    }
    
    // 设置焦点管理
    setupFocusManagement() {
        // 焦点陷阱（用于模态框）
        this.setupFocusTrap();
        
        // 焦点指示器增强
        this.enhanceFocusIndicators();
        
        // 管理焦点顺序
        // this.manageFocusOrder(); // 这是一个未实现的功能，暂时禁用以避免错误
    }
    
    // 设置焦点陷阱
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.ui-modal-overlay.show');
                if (modal) {
                    this.trapFocusInModal(e, modal);
                }
            }
        });
    }
    
    // 在模态框中陷阱焦点
    trapFocusInModal(event, modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    // 增强焦点指示器
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            /* 高可见性焦点环 */
            *:focus {
                outline: 3px solid #005fcc;
                outline-offset: 2px;
            }
            
            /* 高对比度模式下的焦点环 */
            @media (prefers-contrast: high) {
                *:focus {
                    outline: 4px solid #000;
                    background: #ff0;
                }
            }
            
            /* 减少动画时禁用焦点动画 */
            @media (prefers-reduced-motion: reduce) {
                *:focus {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 增强焦点环
    enhanceFocusRing(element) {
        element.style.outline = '3px solid #005fcc';
        element.style.outlineOffset = '2px';
    }
    
    // 创建无障碍控制面板
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel hidden';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'a11y-panel-title');
        panel.setAttribute('aria-hidden', 'true');
        
        panel.innerHTML = `
            <div class="panel-content">
                <div class="panel-header">
                    <h2 id="a11y-panel-title">无障碍设置</h2>
                    <button id="close-a11y-panel" aria-label="关闭无障碍面板">×</button>
                </div>
                <div class="panel-body">
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="high-contrast-toggle" ${this.settings.highContrast ? 'checked' : ''}>
                            <span>高对比度模式</span>
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="large-text-toggle" ${this.settings.largeText ? 'checked' : ''}>
                            <span>大字体模式</span>
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="reduce-motion-toggle" ${this.settings.reduceMotion ? 'checked' : ''}>
                            <span>减少动画效果</span>
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="screen-reader-toggle" ${this.settings.screenReader ? 'checked' : ''}>
                            <span>屏幕阅读器优化</span>
                        </label>
                    </div>
                </div>
                <div class="panel-footer">
                    <button id="reset-a11y-settings">重置设置</button>
                    <p class="help-text">按 Alt+A 打开此面板，Esc 关闭</p>
                </div>
            </div>
        `;
        
        // 样式
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #005fcc;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10001;
                min-width: 300px;
                max-width: 500px;
            }
            
            .accessibility-panel.hidden {
                display: none;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .panel-header h2 {
                margin: 0;
                font-size: 18px;
            }
            
            .panel-header button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
            }
            
            .panel-body {
                padding: 16px;
            }
            
            .setting-group {
                margin-bottom: 16px;
            }
            
            .setting-group label {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 16px;
            }
            
            .setting-group input {
                margin-right: 12px;
                width: 18px;
                height: 18px;
            }
            
            .panel-footer {
                padding: 16px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
            }
            
            .panel-footer button {
                background: #005fcc;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-bottom: 8px;
            }
            
            .help-text {
                font-size: 12px;
                color: #666;
                margin: 8px 0 0 0;
            }
            
            /* 高对比度样式 */
            .high-contrast .accessibility-panel {
                background: #fff;
                border: 4px solid #000;
                color: #000;
            }
            
            .high-contrast .panel-footer button {
                background: #000;
                color: #fff;
                border: 2px solid #000;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(panel);
        this.setupPanelEventListeners();
        
        // 创建触发按钮
        this.createAccessibilityTrigger();
    }
    
    // 创建无障碍触发按钮
    createAccessibilityTrigger() {
        const trigger = document.createElement('button');
        trigger.id = 'accessibility-trigger';
        trigger.innerHTML = '♿';
        trigger.setAttribute('aria-label', '打开无障碍设置面板 (Alt+A)');
        trigger.title = '无障碍设置 (Alt+A)';
        
        trigger.style.cssText = `
            position: fixed;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            background: #005fcc;
            color: white;
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;
        
        trigger.addEventListener('click', () => this.toggleAccessibilityPanel());
        document.body.appendChild(trigger);
    }
    
    // 设置面板事件监听
    setupPanelEventListeners() {
        const panel = document.getElementById('accessibility-panel');
        
        // 关闭按钮
        document.getElementById('close-a11y-panel').addEventListener('click', () => {
            this.hideAccessibilityPanel();
        });
        
        // 设置切换
        document.getElementById('high-contrast-toggle').addEventListener('change', (e) => {
            this.toggleHighContrast(e.target.checked);
        });
        
        document.getElementById('large-text-toggle').addEventListener('change', (e) => {
            this.toggleLargeText(e.target.checked);
        });
        
        document.getElementById('reduce-motion-toggle').addEventListener('change', (e) => {
            this.toggleReduceMotion(e.target.checked);
        });
        
        document.getElementById('screen-reader-toggle').addEventListener('change', (e) => {
            this.toggleScreenReaderMode(e.target.checked);
        });
        
        // 重置按钮
        document.getElementById('reset-a11y-settings').addEventListener('click', () => {
            this.resetSettings();
        });
    }
    
    // 切换无障碍面板
    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        const isHidden = panel.classList.contains('hidden');
        
        if (isHidden) {
            this.showAccessibilityPanel();
        } else {
            this.hideAccessibilityPanel();
        }
    }
    
    // 显示无障碍面板
    showAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.classList.remove('hidden');
        panel.setAttribute('aria-hidden', 'false');
        
        // 焦点到第一个控件
        const firstInput = panel.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
        
        this.announce('无障碍设置面板已打开');
    }
    
    // 隐藏无障碍面板
    hideAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.classList.add('hidden');
        panel.setAttribute('aria-hidden', 'true');
        
        this.announce('无障碍设置面板已关闭');
    }
    
    // 切换高对比度
    toggleHighContrast(enabled) {
        this.settings.highContrast = enabled;
        
        if (enabled) {
            this.applyHighContrast();
        } else {
            this.removeHighContrast();
        }
        
        this.announce(`高对比度模式已${enabled ? '开启' : '关闭'}`);
        this.saveSettings();
    }
    
    // 应用高对比度
    applyHighContrast() {
        document.documentElement.classList.add('high-contrast');
        
        const style = document.createElement('style');
        style.id = 'high-contrast-style';
        style.textContent = `
            .high-contrast * {
                background: #fff !important;
                color: #000 !important;
                border-color: #000 !important;
            }
            
            .high-contrast button, .high-contrast input, .high-contrast select {
                background: #fff !important;
                color: #000 !important;
                border: 2px solid #000 !important;
            }
            
            .high-contrast a {
                color: #0000ff !important;
                text-decoration: underline !important;
            }
            
            .high-contrast a:visited {
                color: #800080 !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 移除高对比度
    removeHighContrast() {
        document.documentElement.classList.remove('high-contrast');
        const style = document.getElementById('high-contrast-style');
        if (style) {
            style.remove();
        }
    }
    
    // 切换大字体
    toggleLargeText(enabled) {
        this.settings.largeText = enabled;
        
        if (enabled) {
            this.applyLargeText();
        } else {
            this.removeLargeText();
        }
        
        this.announce(`大字体模式已${enabled ? '开启' : '关闭'}`);
        this.saveSettings();
    }
    
    // 应用大字体
    applyLargeText() {
        const style = document.createElement('style');
        style.id = 'large-text-style';
        style.textContent = `
            * {
                font-size: 120% !important;
                line-height: 1.6 !important;
            }
            
            h1 { font-size: 150% !important; }
            h2 { font-size: 140% !important; }
            h3 { font-size: 130% !important; }
        `;
        
        document.head.appendChild(style);
    }
    
    // 移除大字体
    removeLargeText() {
        const style = document.getElementById('large-text-style');
        if (style) {
            style.remove();
        }
    }
    
    // 切换减少动画
    toggleReduceMotion(enabled) {
        this.settings.reduceMotion = enabled;
        
        if (enabled) {
            this.reduceMotion();
        } else {
            this.enableMotion();
        }
        
        this.announce(`动画效果已${enabled ? '减少' : '恢复'}`);
        this.saveSettings();
    }
    
    // 减少动画
    reduceMotion() {
        const style = document.createElement('style');
        style.id = 'reduce-motion-style';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 启用动画
    enableMotion() {
        const style = document.getElementById('reduce-motion-style');
        if (style) {
            style.remove();
        }
    }
    
    // 切换屏幕阅读器模式
    toggleScreenReaderMode(enabled) {
        this.settings.screenReader = enabled;
        
        if (enabled) {
            this.enableScreenReaderOptimizations();
        } else {
            this.disableScreenReaderOptimizations();
        }
        
        this.announce(`屏幕阅读器优化已${enabled ? '开启' : '关闭'}`);
        this.saveSettings();
    }
    
    // 启用屏幕阅读器优化
    enableScreenReaderOptimizations() {
        // 隐藏装饰性元素
        document.querySelectorAll('.decoration, .bg-pattern').forEach(el => {
            el.setAttribute('aria-hidden', 'true');
        });
        
        // 为重要操作添加描述
        document.querySelectorAll('button, a').forEach(el => {
            if (!el.getAttribute('aria-describedby')) {
                const description = this.generateElementDescription(el);
                if (description) {
                    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
                    const descEl = document.createElement('span');
                    descEl.id = descId;
                    descEl.textContent = description;
                    descEl.style.display = 'none';
                    el.parentNode.insertBefore(descEl, el.nextSibling);
                    el.setAttribute('aria-describedby', descId);
                }
            }
        });
    }
    
    // 生成元素描述
    generateElementDescription(element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        
        if (tagName === 'button') {
            if (className.includes('download')) return '下载按钮';
            if (className.includes('upload')) return '上传按钮';
            if (className.includes('process')) return '处理按钮';
            if (className.includes('reset')) return '重置按钮';
        }
        
        return null;
    }
    
    // 重置设置
    resetSettings() {
        this.settings = {
            highContrast: false,
            largeText: false,
            reduceMotion: false,
            screenReader: false,
            keyboardNavigation: true
        };
        
        // 移除所有样式
        this.removeHighContrast();
        this.removeLargeText();
        this.enableMotion();
        this.disableScreenReaderOptimizations();
        
        // 重置界面
        document.getElementById('high-contrast-toggle').checked = false;
        document.getElementById('large-text-toggle').checked = false;
        document.getElementById('reduce-motion-toggle').checked = false;
        document.getElementById('screen-reader-toggle').checked = false;
        
        this.announce('无障碍设置已重置');
        this.saveSettings();
    }
    
    // 保存设置
    saveSettings() {
        try {
            localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存无障碍设置失败:', error);
        }
    }
    
    // 加载设置
    loadSettings() {
        try {
            const saved = localStorage.getItem('accessibility-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                this.applyLoadedSettings();
            }
        } catch (error) {
            console.error('加载无障碍设置失败:', error);
        }
    }
    
    // 应用加载的设置
    applyLoadedSettings() {
        if (this.settings.highContrast) this.applyHighContrast();
        if (this.settings.largeText) this.applyLargeText();
        if (this.settings.reduceMotion) this.reduceMotion();
        if (this.settings.screenReader) this.enableScreenReaderOptimizations();
    }
    
    // 增强现有元素
    enhanceExistingElements() {
        // 为所有图片添加加载状态
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', () => {
                img.setAttribute('aria-label', img.alt + ' (已加载)');
            });
            
            img.addEventListener('error', () => {
                img.setAttribute('aria-label', img.alt + ' (加载失败)');
            });
        });
        
        // 为表单添加验证反馈
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('invalid', (e) => {
                this.announce(`输入错误: ${e.target.validationMessage}`);
            });
        });
        
        // 为按钮添加状态反馈
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.disabled) {
                    this.announce('此按钮当前不可用');
                }
            });
        });
    }
    
    // 设置内容变化监听
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            this.enhanceNewElement(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 增强新添加的元素
    enhanceNewElement(element) {
        // 为新按钮添加ARIA标签
        const buttons = element.querySelectorAll ? element.querySelectorAll('button') : [];
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                button.setAttribute('aria-label', '按钮');
            }
        });
        
        // 为新图片添加alt属性
        const images = element.querySelectorAll ? element.querySelectorAll('img') : [];
        images.forEach(img => {
            if (!img.getAttribute('alt')) {
                img.setAttribute('alt', '图像');
            }
        });
    }
    
    // 关闭模态框或面板
    closeModalOrPanel() {
        // 关闭无障碍面板
        const a11yPanel = document.getElementById('accessibility-panel');
        if (a11yPanel && !a11yPanel.classList.contains('hidden')) {
            this.hideAccessibilityPanel();
            return;
        }
        
        // 关闭其他模态框
        const modal = document.querySelector('.ui-modal-overlay.show');
        if (modal) {
            modal.querySelector('button').click(); // 触发关闭
            this.announce('对话框已关闭');
        }
    }
    
    // 处理方向键导航
    handleArrowKeyNavigation(event) {
        const { key, target } = event;
        
        // 在网格布局中导航（如调色板）
        if (target.closest('#paletteDisplay')) {
            this.navigatePalette(event);
            return;
        }
        
        // 在菜单中导航
        if (target.closest('nav')) {
            this.navigateMenu(event);
            return;
        }
    }
    
    // 调色板导航
    navigatePalette(event) {
        const palette = document.getElementById('paletteDisplay');
        const colors = palette.querySelectorAll('.color-item');
        const currentIndex = Array.from(colors).indexOf(document.activeElement);
        
        if (currentIndex === -1) return;
        
        const cols = 8; // 调色板列数
        let newIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : colors.length - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < colors.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                newIndex = currentIndex >= cols ? currentIndex - cols : currentIndex + (Math.ceil(colors.length / cols) - 1) * cols;
                if (newIndex >= colors.length) newIndex = colors.length - 1;
                break;
            case 'ArrowDown':
                newIndex = currentIndex + cols < colors.length ? currentIndex + cols : currentIndex % cols;
                break;
        }
        
        if (newIndex !== undefined && colors[newIndex]) {
            event.preventDefault();
            colors[newIndex].focus();
            this.announce(`颜色 ${newIndex + 1}`);
        }
    }
    
    // 获取无障碍信息
    getAccessibilityInfo() {
        return {
            settings: this.settings,
            announcements: this.announcements.slice(-10), // 最近10条播报
            focusableElements: this.focusableElements.length,
            ariaLiveRegion: !!this.liveRegion
        };
    }
}

// 创建全局实例
const AccessibilityManager_instance = new AccessibilityManager();

// 导出到全局
window.AccessibilityManager = AccessibilityManager_instance;

// 便捷方法
window.announce = (message, priority = 'polite') => {
    AccessibilityManager_instance.announce(message, priority);
};

console.log('♿ 无障碍访问系统已加载');