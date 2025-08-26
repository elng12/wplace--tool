/**
 * 无障碍性管理模块
 * 提供完整的无障碍功能支持，包括屏幕阅读器、键盘导航、ARIA标签等
 */

import { CONFIG } from '../config.js';

/**
 * 屏幕阅读器支持管理器
 */
export class ScreenReaderManager {
    constructor() {
        this.announceQueue = [];
        this.isAnnouncing = false;
        this.liveRegion = null;
        this.statusRegion = null;
        this.progressRegion = null;
        
        this.initializeLiveRegions();
        this.setupAriaLiveRegions();
    }

    /**
     * 初始化实时区域
     */
    initializeLiveRegions() {
        // 创建主要的实时通知区域
        this.liveRegion = this.createLiveRegion('main-announcements', 'polite');
        
        // 创建状态更新区域
        this.statusRegion = this.createLiveRegion('status-updates', 'polite');
        
        // 创建进度更新区域
        this.progressRegion = this.createLiveRegion('progress-updates', 'polite');
        
        // 创建错误通知区域（紧急）
        this.errorRegion = this.createLiveRegion('error-notifications', 'assertive');
    }

    /**
     * 创建实时区域元素
     */
    createLiveRegion(id, politeness) {
        const region = document.createElement('div');
        region.id = id;
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only'; // 只对屏幕阅读器可见
        region.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        
        document.body.appendChild(region);
        return region;
    }

    /**
     * 设置ARIA实时区域
     */
    setupAriaLiveRegions() {
        // 为现有元素添加适当的ARIA属性
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.setAttribute('aria-live', 'polite');
            progressContainer.setAttribute('aria-atomic', 'false');
        }

        // 通知容器
        const notificationContainer = document.getElementById('notificationContainer');
        if (notificationContainer) {
            notificationContainer.setAttribute('role', 'alert');
            notificationContainer.setAttribute('aria-live', 'assertive');
        }
    }

    /**
     * 通知屏幕阅读器
     */
    announce(message, priority = 'polite', delay = 100) {
        if (!message) return;

        const announcement = {
            message: message,
            priority: priority,
            timestamp: Date.now()
        };

        this.announceQueue.push(announcement);
        
        // 延迟处理以避免过于频繁的更新
        setTimeout(() => {
            this.processAnnouncements();
        }, delay);
    }

    /**
     * 处理待通知队列
     */
    processAnnouncements() {
        if (this.isAnnouncing || this.announceQueue.length === 0) return;

        this.isAnnouncing = true;
        const announcement = this.announceQueue.shift();
        
        const targetRegion = announcement.priority === 'assertive' 
            ? this.errorRegion 
            : this.liveRegion;

        // 清空区域并设置新消息
        targetRegion.textContent = '';
        
        // 使用requestAnimationFrame确保屏幕阅读器能检测到变化
        requestAnimationFrame(() => {
            targetRegion.textContent = announcement.message;
            
            // 3秒后清空消息，为下一个消息做准备
            setTimeout(() => {
                targetRegion.textContent = '';
                this.isAnnouncing = false;
                
                // 处理队列中的下一个消息
                if (this.announceQueue.length > 0) {
                    setTimeout(() => this.processAnnouncements(), 500);
                }
            }, 3000);
        });
    }

    /**
     * 更新状态信息
     */
    updateStatus(message) {
        if (this.statusRegion) {
            this.statusRegion.textContent = message;
        }
    }

    /**
     * 更新进度信息
     */
    updateProgress(percentage, description) {
        if (this.progressRegion) {
            const message = description 
                ? `${description}: ${percentage}%` 
                : `进度: ${percentage}%`;
            this.progressRegion.textContent = message;
        }
    }

    /**
     * 通知错误
     */
    announceError(errorMessage) {
        this.announce(`错误: ${errorMessage}`, 'assertive');
    }

    /**
     * 通知成功
     */
    announceSuccess(message) {
        this.announce(`成功: ${message}`, 'polite');
    }

    /**
     * 描述图像处理结果
     */
    describeProcessingResult(result) {
        if (!result || !result.pixelData) return;

        const { totalPixels, usedColors } = result.pixelData;
        const message = `图像处理完成。生成了 ${totalPixels} 个像素块，使用了 ${usedColors.length} 种颜色。`;
        
        this.announce(message, 'polite');
    }

    /**
     * 清理资源
     */
    cleanup() {
        [this.liveRegion, this.statusRegion, this.progressRegion, this.errorRegion]
            .forEach(region => {
                if (region && region.parentNode) {
                    region.parentNode.removeChild(region);
                }
            });
        
        this.announceQueue = [];
    }
}

/**
 * 键盘导航管理器
 */
export class KeyboardNavigationManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.trapFocus = false;
        this.focusHistory = [];
        
        this.initializeKeyboardNavigation();
        this.setupKeyboardShortcuts();
    }

    /**
     * 初始化键盘导航
     */
    initializeKeyboardNavigation() {
        // 更新可聚焦元素列表
        this.updateFocusableElements();
        
        // 监听焦点变化
        document.addEventListener('focusin', (e) => {
            this.onFocusIn(e);
        });

        document.addEventListener('focusout', (e) => {
            this.onFocusOut(e);
        });

        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // 定期更新可聚焦元素（处理动态内容）
        setInterval(() => {
            this.updateFocusableElements();
        }, 2000);
    }

    /**
     * 更新可聚焦元素列表
     */
    updateFocusableElements() {
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ];

        this.focusableElements = Array.from(
            document.querySelectorAll(selectors.join(', '))
        ).filter(el => {
            return el.offsetParent !== null && // 元素可见
                   !el.hasAttribute('aria-hidden') &&
                   window.getComputedStyle(el).visibility !== 'hidden';
        });

        // 为每个可聚焦元素添加必要的ARIA属性
        this.enhanceFocusableElements();
    }

    /**
     * 增强可聚焦元素的无障碍性
     */
    enhanceFocusableElements() {
        this.focusableElements.forEach((element, index) => {
            // 确保元素有合适的角色
            if (!element.hasAttribute('role') && !this.hasImplicitRole(element)) {
                if (element.onclick) {
                    element.setAttribute('role', 'button');
                }
            }

            // 添加键盘支持
            if (element.onclick && !element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
                
                // 为非原生交互元素添加Enter和Space键支持
                if (!['BUTTON', 'A', 'INPUT'].includes(element.tagName)) {
                    element.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            element.click();
                        }
                    });
                }
            }

            // 添加描述文本
            if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
                const description = this.generateElementDescription(element);
                if (description) {
                    element.setAttribute('aria-label', description);
                }
            }
        });
    }

    /**
     * 检查元素是否有隐式角色
     */
    hasImplicitRole(element) {
        const implicitRoles = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        return implicitRoles.includes(element.tagName);
    }

    /**
     * 生成元素描述
     */
    generateElementDescription(element) {
        // 基于元素类型和内容生成描述
        if (element.classList.contains('palette-color')) {
            const color = element.style.backgroundColor;
            return `调色板颜色: ${color}`;
        }

        if (element.classList.contains('used-color-item')) {
            return `已使用的颜色`;
        }

        if (element.id === 'pixelSize') {
            return `像素尺寸滑块，当前值: ${element.value}`;
        }

        // 使用元素的文本内容作为描述
        const text = element.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
            return text;
        }

        return null;
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'KeyO': () => this.triggerFileUpload(), // Ctrl+O 打开文件
            'KeyS': () => this.triggerDownload(),   // Ctrl+S 保存
            'KeyH': () => this.showKeyboardHelp(), // Ctrl+H 显示帮助
            'Escape': () => this.handleEscape(),   // ESC 关闭模态框
            'F1': () => this.showKeyboardHelp(),   // F1 帮助
            'KeyG': () => this.toggleGrid(),       // Ctrl+G 切换网格
            'Equal': () => this.zoomIn(),          // Ctrl+= 放大
            'Minus': () => this.zoomOut(),         // Ctrl+- 缩小
            'Digit0': () => this.resetZoom()       // Ctrl+0 重置缩放
        };

        document.addEventListener('keydown', (e) => {
            // 检查是否在输入框中
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            const key = e.code;
            const hasModifier = e.ctrlKey || e.metaKey;

            // 处理需要修饰键的快捷键
            if (hasModifier && shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
                return;
            }

            // 处理不需要修饰键的快捷键
            if (!hasModifier && ['Escape', 'F1'].includes(key) && shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }

    /**
     * 处理键盘导航
     */
    handleKeyboardNavigation(e) {
        // Tab导航增强
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }

        // 箭头键导航（用于网格和列表）
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.handleArrowNavigation(e);
        }
    }

    /**
     * 处理Tab导航
     */
    handleTabNavigation(e) {
        if (this.trapFocus) {
            // 在模态框中限制焦点
            e.preventDefault();
            this.moveFocusWithinTrap(e.shiftKey ? -1 : 1);
        }
    }

    /**
     * 处理箭头键导航
     */
    handleArrowNavigation(e) {
        const activeElement = document.activeElement;
        
        // 检查是否在调色板中
        if (activeElement && activeElement.closest('#paletteDisplay')) {
            e.preventDefault();
            this.navigatePalette(e.key, activeElement);
            return;
        }

        // 检查是否在已用颜色列表中
        if (activeElement && activeElement.closest('#usedColorsContainer')) {
            e.preventDefault();
            this.navigateUsedColors(e.key, activeElement);
            return;
        }

        // 滑块的精确控制
        if (activeElement && activeElement.type === 'range') {
            this.handleRangeNavigation(e, activeElement);
        }
    }

    /**
     * 调色板导航
     */
    navigatePalette(key, currentElement) {
        const paletteColors = Array.from(document.querySelectorAll('#paletteDisplay .palette-color'));
        const currentIndex = paletteColors.indexOf(currentElement);
        
        if (currentIndex === -1) return;

        const cols = Math.floor(Math.sqrt(paletteColors.length));
        let newIndex = currentIndex;

        switch (key) {
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : paletteColors.length - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < paletteColors.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                newIndex = currentIndex - cols;
                if (newIndex < 0) newIndex += paletteColors.length;
                break;
            case 'ArrowDown':
                newIndex = (currentIndex + cols) % paletteColors.length;
                break;
        }

        if (paletteColors[newIndex]) {
            paletteColors[newIndex].focus();
        }
    }

    /**
     * 已用颜色导航
     */
    navigateUsedColors(key, currentElement) {
        const colors = Array.from(document.querySelectorAll('#usedColorsContainer .used-color-item'));
        const currentIndex = colors.indexOf(currentElement);
        
        if (currentIndex === -1) return;

        let newIndex = currentIndex;

        switch (key) {
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : colors.length - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < colors.length - 1 ? currentIndex + 1 : 0;
                break;
        }

        if (colors[newIndex]) {
            colors[newIndex].focus();
        }
    }

    /**
     * 滑块导航增强
     */
    handleRangeNavigation(e, slider) {
        const step = parseFloat(slider.step) || 1;
        const current = parseFloat(slider.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        
        let newValue = current;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
                newValue = Math.max(min, current - step);
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                newValue = Math.min(max, current + step);
                break;
            default:
                return; // 不处理其他键
        }

        if (newValue !== current) {
            slider.value = newValue;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    /**
     * 焦点进入处理
     */
    onFocusIn(e) {
        this.focusHistory.push(e.target);
        
        // 限制历史记录大小
        if (this.focusHistory.length > 10) {
            this.focusHistory.shift();
        }

        // 更新当前焦点索引
        this.currentFocusIndex = this.focusableElements.indexOf(e.target);
    }

    /**
     * 焦点离开处理
     */
    onFocusOut(e) {
        // 可以在这里添加焦点离开的处理逻辑
    }

    /**
     * 设置焦点陷阱（用于模态框）
     */
    setFocusTrap(container) {
        this.trapFocus = true;
        this.focusableElements = Array.from(
            container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        );
        
        // 聚焦到第一个元素
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
        }
    }

    /**
     * 释放焦点陷阱
     */
    releaseFocusTrap() {
        this.trapFocus = false;
        this.updateFocusableElements();
    }

    /**
     * 在陷阱内移动焦点
     */
    moveFocusWithinTrap(direction) {
        if (this.focusableElements.length === 0) return;

        let newIndex = this.currentFocusIndex + direction;
        
        if (newIndex >= this.focusableElements.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = this.focusableElements.length - 1;
        }

        this.focusableElements[newIndex].focus();
    }

    // 快捷键处理方法
    triggerFileUpload() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    triggerDownload() {
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.click();
        }
    }

    showKeyboardHelp() {
        this.createKeyboardHelpModal();
    }

    handleEscape() {
        // 关闭任何打开的模态框
        const modals = document.querySelectorAll('.modal, .overlay');
        modals.forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                this.releaseFocusTrap();
            }
        });
    }

    toggleGrid() {
        const gridCheckbox = document.getElementById('showGrid');
        if (gridCheckbox) {
            gridCheckbox.checked = !gridCheckbox.checked;
            gridCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    zoomIn() {
        const zoomInBtn = document.getElementById('zoomIn');
        if (zoomInBtn) {
            zoomInBtn.click();
        }
    }

    zoomOut() {
        const zoomOutBtn = document.getElementById('zoomOut');
        if (zoomOutBtn) {
            zoomOutBtn.click();
        }
    }

    resetZoom() {
        const zoomResetBtn = document.getElementById('zoomReset');
        if (zoomResetBtn) {
            zoomResetBtn.click();
        }
    }

    /**
     * 创建键盘帮助模态框
     */
    createKeyboardHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'keyboard-help-title');
        
        modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 id="keyboard-help-title" class="text-xl font-bold mb-4">键盘快捷键</h2>
                <div class="space-y-2 text-sm">
                    <div><kbd>Ctrl+O</kbd> 打开文件</div>
                    <div><kbd>Ctrl+S</kbd> 保存图像</div>
                    <div><kbd>Ctrl+G</kbd> 切换网格</div>
                    <div><kbd>Ctrl+=</kbd> 放大</div>
                    <div><kbd>Ctrl+-</kbd> 缩小</div>
                    <div><kbd>Ctrl+0</kbd> 重置缩放</div>
                    <div><kbd>Tab</kbd> 下一个元素</div>
                    <div><kbd>Shift+Tab</kbd> 上一个元素</div>
                    <div><kbd>方向键</kbd> 在网格中导航</div>
                    <div><kbd>Enter/Space</kbd> 激活按钮</div>
                    <div><kbd>Esc</kbd> 关闭对话框</div>
                    <div><kbd>F1</kbd> 显示此帮助</div>
                </div>
                <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
                        onclick="this.closest('.fixed').remove()">
                    关闭
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        this.setFocusTrap(modal);
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                this.releaseFocusTrap();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
}

/**
 * ARIA增强管理器
 */
export class ARIAEnhancementManager {
    constructor() {
        this.setupARIALabels();
        this.setupLandmarks();
        this.setupFormLabels();
        this.setupProgressIndicators();
    }

    /**
     * 设置ARIA标签
     */
    setupARIALabels() {
        const labelMappings = {
            'uploadArea': '图像上传区域，点击或拖拽文件到此处',
            'size-slider': '像素尺寸滑块',
            'dithering-checkbox': '启用抖动算法',
            'scalingMethod': '缩放方法选择',
            'showGrid': '显示网格',
            'download-btn': '下载像素艺术图像',
            'downloadWithGridBtn': '下载带网格的图像',
            'zoomIn': '放大预览',
            'zoomOut': '缩小预览',
            'zoomReset': '重置缩放'
        };

        Object.entries(labelMappings).forEach(([id, label]) => {
            const element = document.getElementById(id);
            if (element && !element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', label);
            }
        });
    }

    /**
     * 设置页面地标
     */
    setupLandmarks() {
        // 主要内容区域
        const mainContent = document.querySelector('main') || 
                          document.querySelector('#main-content') ||
                          document.querySelector('.main-content');
        
        if (mainContent && !mainContent.hasAttribute('role')) {
            mainContent.setAttribute('role', 'main');
            mainContent.setAttribute('aria-label', '主要内容');
        }

        // 导航区域
        const nav = document.querySelector('nav');
        if (nav && !nav.hasAttribute('aria-label')) {
            nav.setAttribute('aria-label', '主要导航');
        }

        // 工具栏区域
        const toolbar = document.querySelector('.toolbar') ||
                       document.querySelector('#controls');
        if (toolbar) {
            toolbar.setAttribute('role', 'toolbar');
            toolbar.setAttribute('aria-label', '图像处理工具');
        }

        // 预览区域
        const previewArea = document.querySelector('#previewContainer');
        if (previewArea) {
            previewArea.setAttribute('role', 'img');
            previewArea.setAttribute('aria-label', '像素艺术预览');
        }
    }

    /**
     * 设置表单标签
     */
    setupFormLabels() {
        // 确保所有表单控件都有适当的标签
        const formControls = document.querySelectorAll('input, select, textarea');
        
        formControls.forEach(control => {
            if (!control.hasAttribute('aria-label') && 
                !control.hasAttribute('aria-labelledby')) {
                
                // 尝试找到关联的label
                const label = document.querySelector(`label[for="${control.id}"]`);
                if (label) {
                    control.setAttribute('aria-labelledby', label.id || this.generateId());
                    if (!label.id) {
                        label.id = this.generateId();
                    }
                } else {
                    // 基于上下文生成标签
                    const contextLabel = this.generateContextualLabel(control);
                    if (contextLabel) {
                        control.setAttribute('aria-label', contextLabel);
                    }
                }
            }
        });
    }

    /**
     * 设置进度指示器
     */
    setupProgressIndicators() {
        const progressBar = document.querySelector('#progressIndicator');
        if (progressBar) {
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
            progressBar.setAttribute('aria-label', '处理进度');
        }

        // 像素尺寸滑块
        const pixelSizeSlider = document.getElementById('pixelSize');
        if (pixelSizeSlider) {
            pixelSizeSlider.setAttribute('aria-valuetext', 
                `像素尺寸: ${pixelSizeSlider.value}像素`);
            
            // 监听值变化
            pixelSizeSlider.addEventListener('input', (e) => {
                e.target.setAttribute('aria-valuetext', 
                    `像素尺寸: ${e.target.value}像素`);
            });
        }
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'aria-id-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 基于上下文生成标签
     */
    generateContextualLabel(element) {
        // 基于父元素或相邻元素的文本内容生成标签
        const parent = element.parentElement;
        if (parent) {
            const text = parent.textContent.trim();
            if (text && text.length < 50) {
                return text;
            }
        }

        // 基于元素类名生成标签
        if (element.classList.contains('pixel-size')) {
            return '像素尺寸设置';
        }

        return null;
    }

    /**
     * 更新动态内容的ARIA属性
     */
    updateDynamicContent(element, content) {
        if (element.hasAttribute('aria-live')) {
            element.textContent = content;
        }
    }

    /**
     * 为调色板颜色添加ARIA标签
     */
    enhancePaletteAccessibility() {
        const paletteColors = document.querySelectorAll('.palette-color');
        
        paletteColors.forEach((colorElement, index) => {
            const color = colorElement.style.backgroundColor || colorElement.dataset.color;
            const colorName = colorElement.title || `颜色 ${index + 1}`;
            
            colorElement.setAttribute('role', 'button');
            colorElement.setAttribute('aria-label', `选择颜色: ${colorName}`);
            colorElement.setAttribute('tabindex', '0');
            
            // 添加键盘支持
            if (!colorElement.hasKeyboardListener) {
                colorElement.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        colorElement.click();
                    }
                });
                colorElement.hasKeyboardListener = true;
            }
        });
    }

    /**
     * 为已用颜色添加ARIA标签
     */
    enhanceUsedColorsAccessibility() {
        const usedColors = document.querySelectorAll('.used-color-item');
        
        usedColors.forEach((colorElement, index) => {
            const color = colorElement.style.backgroundColor;
            const colorName = colorElement.title || `已使用颜色 ${index + 1}`;
            
            colorElement.setAttribute('role', 'button');
            colorElement.setAttribute('aria-label', colorName);
            colorElement.setAttribute('tabindex', '0');
        });
    }
}

/**
 * 主要的无障碍性管理器
 */
export class AccessibilityManager {
    constructor() {
        this.screenReader = new ScreenReaderManager();
        this.keyboardNavigation = new KeyboardNavigationManager();
        this.ariaEnhancements = new ARIAEnhancementManager();
        
        this.setupAccessibilityFeatures();
        this.monitorDynamicContent();
    }

    /**
     * 设置无障碍功能
     */
    setupAccessibilityFeatures() {
        // 添加跳转链接
        this.addSkipLinks();
        
        // 设置焦点管理
        this.setupFocusManagement();
        
        // 监听页面变化
        this.observeContentChanges();
    }

    /**
     * 添加跳转链接
     */
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">跳转到主要内容</a>
            <a href="#controls" class="skip-link">跳转到控制面板</a>
            <a href="#preview" class="skip-link">跳转到预览区域</a>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -200px;
                left: 0;
                z-index: 1000;
            }
            .skip-link {
                position: absolute;
                top: -200px;
                left: 6px;
                padding: 8px;
                background: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 4px;
            }
            .skip-link:focus {
                top: 6px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * 设置焦点管理
     */
    setupFocusManagement() {
        // 确保页面加载时有合适的初始焦点
        window.addEventListener('load', () => {
            const mainHeading = document.querySelector('h1');
            if (mainHeading && !mainHeading.hasAttribute('tabindex')) {
                mainHeading.setAttribute('tabindex', '-1');
                mainHeading.focus();
            }
        });
    }

    /**
     * 监听内容变化
     */
    observeContentChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewContent(node);
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

    /**
     * 增强新添加的内容
     */
    enhanceNewContent(element) {
        // 为新的调色板颜色添加无障碍支持
        if (element.classList?.contains('palette-color') || 
            element.querySelector?.('.palette-color')) {
            this.ariaEnhancements.enhancePaletteAccessibility();
        }

        // 为新的已用颜色添加无障碍支持
        if (element.classList?.contains('used-color-item') || 
            element.querySelector?.('.used-color-item')) {
            this.ariaEnhancements.enhanceUsedColorsAccessibility();
        }

        // 更新键盘导航
        this.keyboardNavigation.updateFocusableElements();
    }

    /**
     * 监控动态内容
     */
    monitorDynamicContent() {
        // 监听通知系统
        document.addEventListener('notificationShown', (e) => {
            const { message, type } = e.detail;
            if (type === 'error') {
                this.screenReader.announceError(message);
            } else if (type === 'success') {
                this.screenReader.announceSuccess(message);
            } else {
                this.screenReader.announce(message);
            }
        });

        // 监听进度更新
        document.addEventListener('progressUpdate', (e) => {
            const { percentage, description } = e.detail;
            this.screenReader.updateProgress(percentage, description);
        });

        // 监听处理完成
        document.addEventListener('processingComplete', (e) => {
            const { result } = e.detail;
            this.screenReader.describeProcessingResult(result);
        });
    }

    /**
     * 公共API方法
     */
    announce(message, priority = 'polite') {
        this.screenReader.announce(message, priority);
    }

    updateStatus(message) {
        this.screenReader.updateStatus(message);
    }

    setFocusTrap(container) {
        this.keyboardNavigation.setFocusTrap(container);
    }

    releaseFocusTrap() {
        this.keyboardNavigation.releaseFocusTrap();
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.screenReader.cleanup();
    }
}

// 导出单例实例
export const accessibilityManager = new AccessibilityManager();