/**
 * UI控制模块
 * 管理用户界面控件的逻辑和交互
 */

import { CONFIG, NOTIFICATION_TYPES, getPerformanceSettings } from '../config.js';
import { globalErrorHandler } from '../core/errorHandler.js';

/**
 * 防抖函数工具
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 通知系统
 */
export class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        // 创建通知容器
        this.container = document.getElementById('notificationContainer') || this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
        return container;
    }

    show(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
        const id = options.id || Date.now().toString();
        const duration = options.duration || CONFIG.NOTIFICATION_TIMEOUT;
        const actions = options.actions || [];

        // 移除相同ID的通知
        if (this.notifications.has(id)) {
            this.remove(id);
        }

        const notification = this.createElement(message, type, id, actions);
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // 入场动画
        requestAnimationFrame(() => {
            notification.classList.add('translate-x-0', 'opacity-100');
            notification.classList.remove('translate-x-full', 'opacity-0');
        });

        // 自动移除
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }

        return id;
    }

    createElement(message, type, id, actions) {
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = `
            transform transition-all duration-300 ease-in-out
            translate-x-full opacity-0
            max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto
            ring-1 ring-black ring-opacity-5 overflow-hidden
            error-notification
        `.trim();

        const bgColor = {
            [NOTIFICATION_TYPES.SUCCESS]: 'bg-green-50 border-green-200',
            [NOTIFICATION_TYPES.ERROR]: 'bg-red-50 border-red-200', 
            [NOTIFICATION_TYPES.WARNING]: 'bg-yellow-50 border-yellow-200',
            [NOTIFICATION_TYPES.INFO]: 'bg-blue-50 border-blue-200'
        }[type] || 'bg-gray-50 border-gray-200';

        const iconColor = {
            [NOTIFICATION_TYPES.SUCCESS]: 'text-green-500',
            [NOTIFICATION_TYPES.ERROR]: 'text-red-500',
            [NOTIFICATION_TYPES.WARNING]: 'text-yellow-500',
            [NOTIFICATION_TYPES.INFO]: 'text-blue-500'
        }[type] || 'text-gray-500';

        const icon = {
            [NOTIFICATION_TYPES.SUCCESS]: '✓',
            [NOTIFICATION_TYPES.ERROR]: '✗',
            [NOTIFICATION_TYPES.WARNING]: '⚠',
            [NOTIFICATION_TYPES.INFO]: 'ℹ'
        }[type] || 'ℹ';

        notification.innerHTML = `
            <div class="flex items-start p-4 ${bgColor}">
                <div class="flex-shrink-0">
                    <span class="${iconColor} text-lg font-bold">${icon}</span>
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                    <p class="text-sm font-medium text-gray-900">${message}</p>
                    ${actions.length > 0 ? `
                        <div class="mt-3 flex space-x-3">
                            ${actions.map(action => `
                                <button onclick="window.notificationActions.${action.handler}('${id}')" 
                                        class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button onclick="window.notificationSystem.remove('${id}')" 
                            class="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-600">
                        <span class="sr-only">关闭</span>
                        <span class="text-lg">×</span>
                    </button>
                </div>
            </div>
        `;

        return notification;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        // 离场动画
        notification.classList.add('translate-x-full', 'opacity-0');
        notification.classList.remove('translate-x-0', 'opacity-100');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    clear() {
        this.notifications.forEach((_, id) => this.remove(id));
    }

    showError(error, context = {}) {
        const errorInfo = globalErrorHandler.handleError(error, context);
        
        const actions = [];
        if (errorInfo.suggestions.length > 0) {
            actions.push({
                label: '查看建议',
                handler: `showSuggestions`
            });
        }

        return this.show(errorInfo.message, errorInfo.type, {
            duration: 5000,
            actions: actions,
            id: `error-${Date.now()}`
        });
    }
}

/**
 * 像素尺寸控制器
 */
export class PixelSizeController {
    constructor(sliderId, displayId, onChangeCallback) {
        this.slider = document.getElementById(sliderId);
        this.display = document.getElementById(displayId);
        this.onChangeCallback = onChangeCallback;
        this.currentPixelSize = CONFIG.DEFAULT_PIXEL_SIZE;
        
        this.init();
    }

    init() {
        if (!this.slider || !this.display) {
            console.warn('像素尺寸控制器初始化失败: 未找到必需元素');
            return;
        }

        this.slider.value = this.currentPixelSize;
        this.updateDisplay(this.currentPixelSize);

        // 创建防抖的变更处理器
        const debouncedHandler = debounce((pixelSize) => {
            this.handlePixelSizeChange(pixelSize);
        }, CONFIG.DEBOUNCE_DELAY);

        // 监听滑块变化
        this.slider.addEventListener('input', (e) => {
            const pixelSize = parseInt(e.target.value);
            this.updateDisplay(pixelSize);
            
            // 立即更新显示，延迟处理
            debouncedHandler(pixelSize);
        });

        // 监听滑块最终值（用户停止拖动时）
        this.slider.addEventListener('change', (e) => {
            const pixelSize = parseInt(e.target.value);
            this.handlePixelSizeChange(pixelSize, true); // 强制处理
        });
    }

    handlePixelSizeChange(pixelSize, force = false) {
        if (!force && pixelSize === this.currentPixelSize) return;

        this.currentPixelSize = pixelSize;
        
        // 获取性能设置
        const perfSettings = getPerformanceSettings(pixelSize);
        
        // 更新UI状态
        this.updateUIForPerformanceLevel(perfSettings);
        
        // 执行回调
        if (this.onChangeCallback) {
            this.onChangeCallback(pixelSize, perfSettings);
        }
    }

    updateDisplay(pixelSize) {
        if (this.display) {
            this.display.textContent = `${pixelSize}px`;
        }

        // 更新滑块样式以反映性能级别
        const perfLevel = getPerformanceSettings(pixelSize).level;
        this.slider.className = this.slider.className.replace(/perf-\w+/, '') + ` perf-${perfLevel}`;
    }

    updateUIForPerformanceLevel(perfSettings) {
        // 根据性能级别更新UI提示
        const hints = {
            'ultra-high': '超高精度模式 - 处理可能较慢',
            'high': '高精度模式 - 可能使用后台处理',
            'medium': '中等精度模式',
            'normal': '标准模式 - 快速处理'
        };

        const hint = hints[perfSettings.level];
        if (hint) {
            // 更新提示文本
            const hintElement = document.getElementById('pixelSizeHint');
            if (hintElement) {
                hintElement.textContent = hint;
            }
        }
    }

    setValue(pixelSize) {
        if (this.slider) {
            this.slider.value = pixelSize;
            this.updateDisplay(pixelSize);
            this.handlePixelSizeChange(pixelSize, true);
        }
    }

    getValue() {
        return this.currentPixelSize;
    }
}

/**
 * 高级设置控制器
 */
export class AdvancedSettingsController {
    constructor() {
        this.settings = {
            enableDithering: false,
            scalingMethod: 'nearest',
            showGrid: false
        };
        
        this.init();
    }

    init() {
        // 抖动设置
        const ditheringCheckbox = document.getElementById('enableDithering');
        if (ditheringCheckbox) {
            ditheringCheckbox.addEventListener('change', (e) => {
                this.settings.enableDithering = e.target.checked;
                this.onSettingsChange();
            });
        }

        // 缩放方法选择
        const scalingSelect = document.getElementById('scalingMethod');
        if (scalingSelect) {
            scalingSelect.addEventListener('change', (e) => {
                this.settings.scalingMethod = e.target.value;
                this.onSettingsChange();
            });
        }

        // 网格显示
        const gridCheckbox = document.getElementById('showGrid');
        if (gridCheckbox) {
            gridCheckbox.addEventListener('change', (e) => {
                this.settings.showGrid = e.target.checked;
                this.onGridToggle(e.target.checked);
            });
        }

        // 高级设置面板切换
        const toggleButton = document.getElementById('toggleAdvancedSettings');
        const panel = document.getElementById('advancedSettingsPanel');
        
        if (toggleButton && panel) {
            toggleButton.addEventListener('click', () => {
                const isHidden = panel.classList.contains('hidden');
                panel.classList.toggle('hidden', !isHidden);
                toggleButton.textContent = isHidden ? '收起高级设置' : '展开高级设置';
            });
        }
    }

    onSettingsChange() {
        // 分发设置变更事件
        const event = new CustomEvent('advancedSettingsChange', {
            detail: { ...this.settings }
        });
        document.dispatchEvent(event);
    }

    onGridToggle(enabled) {
        // 分发网格切换事件
        const event = new CustomEvent('gridToggle', {
            detail: { enabled }
        });
        document.dispatchEvent(event);
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        this.updateUI();
    }

    updateUI() {
        const ditheringCheckbox = document.getElementById('enableDithering');
        if (ditheringCheckbox) {
            ditheringCheckbox.checked = this.settings.enableDithering;
        }

        const scalingSelect = document.getElementById('scalingMethod');
        if (scalingSelect) {
            scalingSelect.value = this.settings.scalingMethod;
        }

        const gridCheckbox = document.getElementById('showGrid');
        if (gridCheckbox) {
            gridCheckbox.checked = this.settings.showGrid;
        }
    }
}

/**
 * 缩放控制器
 */
export class ZoomController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.zoomLevel = 1;
        this.minZoom = 0.1;
        this.maxZoom = 10;
        this.zoomStep = 0.1;
        
        this.init();
    }

    init() {
        if (!this.container) return;

        // 缩放按钮
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const zoomResetBtn = document.getElementById('zoomReset');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }

        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => this.resetZoom());
        }

        // 鼠标滚轮缩放
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            this.zoom(this.zoomLevel + delta * this.zoomStep);
        });

        this.updateZoomDisplay();
    }

    zoomIn() {
        this.zoom(this.zoomLevel + this.zoomStep);
    }

    zoomOut() {
        this.zoom(this.zoomLevel - this.zoomStep);
    }

    resetZoom() {
        this.zoom(1);
    }

    zoom(newZoomLevel) {
        const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoomLevel));
        
        if (clampedZoom !== this.zoomLevel) {
            this.zoomLevel = clampedZoom;
            this.applyZoom();
            this.updateZoomDisplay();
            
            // 分发缩放事件
            const event = new CustomEvent('zoomChange', {
                detail: { zoomLevel: this.zoomLevel }
            });
            this.container.dispatchEvent(event);
        }
    }

    applyZoom() {
        const previewImage = this.container.querySelector('#previewImage');
        if (previewImage) {
            previewImage.style.transform = `scale(${this.zoomLevel})`;
        }
    }

    updateZoomDisplay() {
        const zoomDisplay = document.getElementById('zoomLevel');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }

        // 更新按钮状态
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');

        if (zoomInBtn) {
            zoomInBtn.disabled = this.zoomLevel >= this.maxZoom;
        }

        if (zoomOutBtn) {
            zoomOutBtn.disabled = this.zoomLevel <= this.minZoom;
        }
    }

    getZoomLevel() {
        return this.zoomLevel;
    }
}

/**
 * 进度条控制器
 */
export class ProgressController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.progressBar = null;
        this.progressText = null;
        this.init();
    }

    init() {
        if (!this.container) {
            this.createProgressContainer();
        }
        
        this.progressBar = this.container.querySelector('.progress-bar');
        this.progressText = this.container.querySelector('.progress-text');
    }

    createProgressContainer() {
        this.container = document.createElement('div');
        this.container.id = 'progressContainer';
        this.container.className = 'hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        this.container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg min-w-64">
                <div class="text-center mb-4">
                    <div class="progress-text text-gray-700">处理中...</div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="progress-bar bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <div class="text-center mt-2 text-sm text-gray-500">
                    <span class="progress-percentage">0%</span>
                </div>
            </div>
        `;
        document.body.appendChild(this.container);
    }

    show(message = '处理中...') {
        if (this.container) {
            this.container.classList.remove('hidden');
            if (this.progressText) {
                this.progressText.textContent = message;
            }
            this.setProgress(0);
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    setProgress(percentage, message = null) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
        }

        const percentageEl = this.container?.querySelector('.progress-percentage');
        if (percentageEl) {
            percentageEl.textContent = `${Math.round(percentage)}%`;
        }

        if (message && this.progressText) {
            this.progressText.textContent = message;
        }
    }
}

export class UIControls {
    constructor() {
        this.notificationSystem = new NotificationSystem();
        this.progressController = new ProgressController();
        this.pixelSizeController = null;
        this.advancedSettingsController = new AdvancedSettingsController();
        this.zoomController = null;
    }

    initialize(config) {
        this.pixelSizeController = new PixelSizeController(
            config.sizeSlider.substring(1), 
            'size-value', // Assuming size-value is consistent
            (pixelSize, perfSettings) => {
                // This callback can be used to trigger reprocessing
                console.log(`Pixel size changed to: ${pixelSize}`, perfSettings);
            }
        );

        this.zoomController = new ZoomController(config.previewCanvas.substring(1));

        // You can add more initializations here if needed
    }

    setButtonEnabled(buttonName, enabled) {
        const btn = document.getElementById(`${buttonName}-btn`);
        if (btn) {
            btn.disabled = !enabled;
        }
    }

    showLoading(isLoading) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.classList.toggle('hidden', !isLoading);
        }
    }
}

// 全局实例
export const notificationSystem = new NotificationSystem();
export const progressController = new ProgressController();

// 挂载到window以便在HTML中使用
window.notificationSystem = notificationSystem;
window.notificationActions = {
    showSuggestions: (notificationId) => {
        notificationSystem.remove(notificationId);
        // TODO: 实现建议显示逻辑
        console.log('显示错误建议');
    }
};