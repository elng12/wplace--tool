/**
 * 移动端优化模块
 * 提供响应式设计、触摸交互和移动端性能优化
 */

import { CONFIG } from '../config.js';
import { performanceMonitor } from '../core/performanceMonitor.js';

/**
 * 设备检测和适配管理器
 */
export class DeviceAdaptationManager {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.viewportInfo = this.getViewportInfo();
        this.connectionInfo = this.getConnectionInfo();
        
        this.setupDeviceAdaptation();
        this.monitorOrientationChange();
        this.optimizeForDevice();
    }

    /**
     * 检测设备类型和能力
     */
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|android|mobile|phone|tablet/.test(userAgent);
        const isTablet = /ipad|tablet|(android(?!.*mobile))/.test(userAgent);
        const isIOS = /iphone|ipad/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        return {
            isMobile: isMobile,
            isTablet: isTablet,
            isDesktop: !isMobile,
            isIOS: isIOS,
            isAndroid: isAndroid,
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            pixelRatio: window.devicePixelRatio || 1,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4, // GB
            maxTouchPoints: navigator.maxTouchPoints || 1,
            userAgent: userAgent
        };
    }

    /**
     * 获取视口信息
     */
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            orientation: screen.orientation?.angle || 0,
            orientationType: screen.orientation?.type || 'landscape-primary'
        };
    }

    /**
     * 获取网络连接信息
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType, // '4g', '3g', etc.
                downlink: connection.downlink, // Mbps
                rtt: connection.rtt, // ms
                saveData: connection.saveData
            };
        }
        return null;
    }

    /**
     * 设置设备适配
     */
    setupDeviceAdaptation() {
        // 设置视口元标签
        this.setupViewport();
        
        // 添加设备类型CSS类
        this.addDeviceClasses();
        
        // 设置触摸优化
        if (this.deviceInfo.isTouchDevice) {
            this.optimizeForTouch();
        }

        // iOS特殊处理
        if (this.deviceInfo.isIOS) {
            this.optimizeForIOS();
        }

        // Android特殊处理
        if (this.deviceInfo.isAndroid) {
            this.optimizeForAndroid();
        }
    }

    /**
     * 设置视口
     */
    setupViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }

        // 根据设备类型设置不同的视口配置
        if (this.deviceInfo.isMobile) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes, shrink-to-fit=no';
        } else {
            viewport.content = 'width=device-width, initial-scale=1.0';
        }
    }

    /**
     * 添加设备相关CSS类
     */
    addDeviceClasses() {
        const classes = [];
        
        if (this.deviceInfo.isMobile) classes.push('mobile-device');
        if (this.deviceInfo.isTablet) classes.push('tablet-device');
        if (this.deviceInfo.isDesktop) classes.push('desktop-device');
        if (this.deviceInfo.isTouchDevice) classes.push('touch-device');
        if (this.deviceInfo.isIOS) classes.push('ios-device');
        if (this.deviceInfo.isAndroid) classes.push('android-device');
        
        // 添加像素密度类
        if (this.deviceInfo.pixelRatio >= 2) classes.push('high-dpi');
        if (this.deviceInfo.pixelRatio >= 3) classes.push('ultra-high-dpi');
        
        // 添加内存信息类
        if (this.deviceInfo.memory <= 2) classes.push('low-memory');
        else if (this.deviceInfo.memory >= 8) classes.push('high-memory');

        document.documentElement.classList.add(...classes);
    }

    /**
     * 触摸优化
     */
    optimizeForTouch() {
        // 增大触摸目标
        const style = document.createElement('style');
        style.textContent = `
            .touch-device button,
            .touch-device .btn,
            .touch-device input[type="range"]::-webkit-slider-thumb,
            .touch-device .palette-color {
                min-height: 44px;
                min-width: 44px;
            }
            
            .touch-device .used-color-item {
                min-height: 36px;
                min-width: 36px;
            }

            /* 增加触摸间距 */
            .touch-device .palette-grid {
                gap: 4px;
            }

            /* 优化滑块触摸体验 */
            .touch-device input[type="range"] {
                height: 44px;
                -webkit-appearance: none;
                background: transparent;
            }

            .touch-device input[type="range"]::-webkit-slider-track {
                height: 8px;
                background: #ddd;
                border-radius: 4px;
            }

            .touch-device input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 24px;
                width: 24px;
                background: var(--primary);
                border-radius: 50%;
                cursor: pointer;
                margin-top: -8px;
            }

            /* 防止双击缩放 */
            .touch-device * {
                touch-action: manipulation;
            }

            /* 允许预览区域的缩放手势 */
            .touch-device #previewContainer {
                touch-action: pinch-zoom;
            }
        `;
        document.head.appendChild(style);

        // 禁用默认的触摸行为
        document.addEventListener('touchstart', (e) => {
            // 防止双击缩放（除了预览区域）
            if (!e.target.closest('#previewContainer')) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }

    /**
     * iOS特殊优化
     */
    optimizeForIOS() {
        // 添加iOS特定样式
        const style = document.createElement('style');
        style.textContent = `
            .ios-device {
                /* iOS Safari状态栏适配 */
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            }

            /* iOS滚动优化 */
            .ios-device .scrollable {
                -webkit-overflow-scrolling: touch;
            }

            /* iOS输入框优化 */
            .ios-device input[type="file"] {
                -webkit-appearance: none;
            }
        `;
        document.head.appendChild(style);

        // 处理iOS的viewport问题
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });
    }

    /**
     * Android特殊优化
     */
    optimizeForAndroid() {
        const style = document.createElement('style');
        style.textContent = `
            /* Android Chrome地址栏隐藏适配 */
            .android-device {
                height: 100vh;
                height: 100dvh; /* 动态视口高度 */
            }

            /* Android滑块优化 */
            .android-device input[type="range"]::-webkit-slider-thumb {
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 监控方向变化
     */
    monitorOrientationChange() {
        const handleOrientationChange = () => {
            this.viewportInfo = this.getViewportInfo();
            
            // 通知其他组件方向改变
            document.dispatchEvent(new CustomEvent('orientationChanged', {
                detail: {
                    orientation: this.viewportInfo.orientation,
                    type: this.viewportInfo.orientationType,
                    width: this.viewportInfo.width,
                    height: this.viewportInfo.height
                }
            }));

            // 重新布局
            setTimeout(() => {
                this.adjustLayoutForOrientation();
            }, 100);
        };

        // 监听方向变化
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        } else {
            window.addEventListener('orientationchange', handleOrientationChange);
        }

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.viewportInfo = this.getViewportInfo();
            this.adjustLayoutForOrientation();
        });
    }

    /**
     * 根据方向调整布局
     */
    adjustLayoutForOrientation() {
        const isLandscape = this.viewportInfo.width > this.viewportInfo.height;
        
        document.documentElement.classList.toggle('landscape', isLandscape);
        document.documentElement.classList.toggle('portrait', !isLandscape);

        // 移动端横屏优化
        if (this.deviceInfo.isMobile && isLandscape) {
            this.optimizeForLandscapeMobile();
        }
    }

    /**
     * 移动端横屏优化
     */
    optimizeForLandscapeMobile() {
        const style = document.createElement('style');
        style.id = 'landscape-mobile-styles';
        
        // 移除之前的样式
        const existing = document.getElementById('landscape-mobile-styles');
        if (existing) existing.remove();

        style.textContent = `
            @media (orientation: landscape) and (max-height: 500px) {
                .mobile-device .main-header {
                    height: 48px;
                    padding: 8px 16px;
                }

                .mobile-device .control-panel {
                    padding: 8px;
                }

                .mobile-device .preview-container {
                    max-height: calc(100vh - 120px);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 根据设备优化性能
     */
    optimizeForDevice() {
        // 低内存设备优化
        if (this.deviceInfo.memory <= 2) {
            this.applyLowMemoryOptimizations();
        }

        // 低端设备优化
        if (this.deviceInfo.hardwareConcurrency <= 2) {
            this.applyLowPerformanceOptimizations();
        }

        // 慢网络优化
        if (this.connectionInfo?.effectiveType === '2g' || 
            this.connectionInfo?.effectiveType === 'slow-2g') {
            this.applySlowNetworkOptimizations();
        }

        // 省流量模式
        if (this.connectionInfo?.saveData) {
            this.applyDataSavingOptimizations();
        }
    }

    /**
     * 低内存设备优化
     */
    applyLowMemoryOptimizations() {
        // 减少缓存大小
        if (window.wplaceApp) {
            const config = {
                maxCacheSize: 50 * 1024 * 1024, // 50MB
                maxImageSize: 2048 * 2048,
                reduceAnimations: true
            };
            
            console.log('应用低内存优化配置:', config);
        }

        document.documentElement.classList.add('low-memory-mode');
    }

    /**
     * 低性能设备优化
     */
    applyLowPerformanceOptimizations() {
        // 禁用动画
        const style = document.createElement('style');
        style.textContent = `
            .low-performance * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);

        document.documentElement.classList.add('low-performance');
    }

    /**
     * 慢网络优化
     */
    applySlowNetworkOptimizations() {
        // 禁用自动预览更新
        document.documentElement.classList.add('slow-network');
        
        // 增加防抖延迟
        if (window.wplaceApp?.pixelSizeController) {
            window.wplaceApp.pixelSizeController.debounceDelay = 1000;
        }
    }

    /**
     * 省流量优化
     */
    applyDataSavingOptimizations() {
        document.documentElement.classList.add('data-saving-mode');
        
        // 降低预览质量
        const previewCanvas = document.getElementById('previewCanvas');
        if (previewCanvas) {
            previewCanvas.style.imageRendering = 'pixelated';
        }
    }

    /**
     * 获取设备能力评分
     */
    getDeviceCapabilityScore() {
        let score = 0;
        
        // 内存评分 (0-40)
        score += Math.min(40, this.deviceInfo.memory * 5);
        
        // CPU评分 (0-30)
        score += Math.min(30, this.deviceInfo.hardwareConcurrency * 7.5);
        
        // 网络评分 (0-20)
        if (this.connectionInfo) {
            const networkScores = { '4g': 20, '3g': 15, '2g': 5, 'slow-2g': 2 };
            score += networkScores[this.connectionInfo.effectiveType] || 10;
        } else {
            score += 10; // 默认分数
        }
        
        // 设备类型评分 (0-10)
        if (this.deviceInfo.isDesktop) score += 10;
        else if (this.deviceInfo.isTablet) score += 7;
        else score += 5;
        
        return Math.min(100, score);
    }

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return {
            device: this.deviceInfo,
            viewport: this.viewportInfo,
            connection: this.connectionInfo,
            capabilityScore: this.getDeviceCapabilityScore()
        };
    }
}

/**
 * 触摸交互管理器
 */
export class TouchInteractionManager {
    constructor() {
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.isLongPress = false;
        this.longPressTimer = null;
        this.swipeThreshold = 50;
        this.longPressDelay = 500;
        
        this.setupTouchHandlers();
        this.optimizeTouchEvents();
    }

    /**
     * 设置触摸事件处理器
     */
    setupTouchHandlers() {
        // 上传区域的触摸优化
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            this.enhanceUploadAreaTouch(uploadArea);
        }

        // 预览区域的触摸手势
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            this.enhancePreviewTouch(previewContainer);
        }

        // 调色板的触摸优化
        this.enhancePaletteTouch();

        // 滑块的触摸优化
        this.enhanceSliderTouch();
    }

    /**
     * 增强上传区域触摸体验
     */
    enhanceUploadAreaTouch(uploadArea) {
        let touchFeedback = null;

        uploadArea.addEventListener('touchstart', (e) => {
            // 创建触摸反馈
            touchFeedback = this.createTouchFeedback(e.touches[0]);
            uploadArea.appendChild(touchFeedback);
            
            uploadArea.classList.add('touch-active');
        }, { passive: true });

        uploadArea.addEventListener('touchend', (e) => {
            uploadArea.classList.remove('touch-active');
            
            if (touchFeedback) {
                touchFeedback.classList.add('fade-out');
                setTimeout(() => {
                    if (touchFeedback.parentNode) {
                        touchFeedback.parentNode.removeChild(touchFeedback);
                    }
                }, 300);
            }
        }, { passive: true });

        uploadArea.addEventListener('touchcancel', () => {
            uploadArea.classList.remove('touch-active');
            if (touchFeedback) {
                touchFeedback.remove();
            }
        }, { passive: true });
    }

    /**
     * 增强预览区域触摸手势
     */
    enhancePreviewTouch(previewContainer) {
        let initialDistance = 0;
        let initialScale = 1;
        let lastTouchTime = 0;

        // 双击缩放
        previewContainer.addEventListener('touchend', (e) => {
            const now = Date.now();
            const timeDiff = now - lastTouchTime;
            
            if (timeDiff < 300 && e.touches.length === 0) {
                // 双击事件
                const zoomController = window.wplaceApp?.zoomController;
                if (zoomController) {
                    if (zoomController.getZoomLevel() === 1) {
                        zoomController.zoom(2);
                    } else {
                        zoomController.resetZoom();
                    }
                }
            }
            
            lastTouchTime = now;
        });

        // 捏合缩放
        previewContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                const zoomController = window.wplaceApp?.zoomController;
                if (zoomController) {
                    initialScale = zoomController.getZoomLevel();
                }
            }
        }, { passive: true });

        previewContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = (currentDistance / initialDistance) * initialScale;
                
                const zoomController = window.wplaceApp?.zoomController;
                if (zoomController) {
                    zoomController.zoom(scale);
                }
            }
        }, { passive: false });
    }

    /**
     * 增强调色板触摸体验
     */
    enhancePaletteTouch() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPaletteTouchHandlers();
        });

        // 监听动态添加的调色板元素
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.classList?.contains('palette-color') || 
                         node.querySelector?.('.palette-color'))) {
                        this.setupPaletteTouchHandlers();
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 设置调色板触摸处理器
     */
    setupPaletteTouchHandlers() {
        const paletteColors = document.querySelectorAll('.palette-color');
        
        paletteColors.forEach(colorElement => {
            if (colorElement.hasCustomTouchHandler) return;
            
            colorElement.addEventListener('touchstart', (e) => {
                this.touchStartTime = Date.now();
                this.touchStartPosition = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };

                // 长按显示颜色信息
                this.longPressTimer = setTimeout(() => {
                    this.isLongPress = true;
                    this.showColorInfo(colorElement, e.touches[0]);
                    
                    // 触觉反馈
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }, this.longPressDelay);

                colorElement.classList.add('touch-active');
            }, { passive: true });

            colorElement.addEventListener('touchend', (e) => {
                clearTimeout(this.longPressTimer);
                colorElement.classList.remove('touch-active');

                if (!this.isLongPress) {
                    // 短按选择颜色
                    colorElement.click();
                }
                
                this.isLongPress = false;
                this.hideColorInfo();
            }, { passive: true });

            colorElement.addEventListener('touchcancel', () => {
                clearTimeout(this.longPressTimer);
                colorElement.classList.remove('touch-active');
                this.isLongPress = false;
                this.hideColorInfo();
            }, { passive: true });

            colorElement.hasCustomTouchHandler = true;
        });
    }

    /**
     * 增强滑块触摸体验
     */
    enhanceSliderTouch() {
        const sliders = document.querySelectorAll('input[type="range"]');
        
        sliders.forEach(slider => {
            // 增强触摸目标
            slider.style.cursor = 'pointer';
            
            slider.addEventListener('touchstart', () => {
                slider.classList.add('touch-active');
            }, { passive: true });

            slider.addEventListener('touchend', () => {
                slider.classList.remove('touch-active');
            }, { passive: true });
        });
    }

    /**
     * 创建触摸反馈效果
     */
    createTouchFeedback(touch) {
        const feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        feedback.style.cssText = `
            position: absolute;
            left: ${touch.clientX - 20}px;
            top: ${touch.clientY - 20}px;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: touchFeedback 0.3s ease-out;
            z-index: 1000;
        `;

        // 添加动画样式（如果不存在）
        if (!document.getElementById('touch-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'touch-feedback-styles';
            style.textContent = `
                @keyframes touchFeedback {
                    0% {
                        transform: scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                .fade-out {
                    animation: fadeOut 0.3s ease-out forwards;
                }
                @keyframes fadeOut {
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        return feedback;
    }

    /**
     * 显示颜色信息
     */
    showColorInfo(colorElement, touch) {
        const colorInfo = document.createElement('div');
        colorInfo.id = 'touch-color-info';
        colorInfo.className = 'fixed bg-black text-white p-2 rounded text-sm z-50';
        
        const color = colorElement.style.backgroundColor || colorElement.dataset.color;
        const colorName = colorElement.title || '未知颜色';
        
        colorInfo.innerHTML = `
            <div class="font-semibold">${colorName}</div>
            <div class="text-xs opacity-75">${color}</div>
        `;

        // 定位
        colorInfo.style.left = (touch.clientX - 50) + 'px';
        colorInfo.style.top = (touch.clientY - 60) + 'px';

        document.body.appendChild(colorInfo);
    }

    /**
     * 隐藏颜色信息
     */
    hideColorInfo() {
        const colorInfo = document.getElementById('touch-color-info');
        if (colorInfo) {
            colorInfo.remove();
        }
    }

    /**
     * 计算两点间距离
     */
    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 优化触摸事件性能
     */
    optimizeTouchEvents() {
        // 使用被动监听器优化滚动性能
        const passiveOptions = { passive: true };
        
        document.addEventListener('touchstart', () => {}, passiveOptions);
        document.addEventListener('touchmove', () => {}, passiveOptions);
        document.addEventListener('touchend', () => {}, passiveOptions);

        // 防止iOS Safari的橡皮筋效果（在非滚动区域）
        document.addEventListener('touchmove', (e) => {
            if (!e.target.closest('.scrollable')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

/**
 * 响应式布局管理器
 */
export class ResponsiveLayoutManager {
    constructor() {
        this.breakpoints = {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.setupResponsiveLayout();
        this.monitorBreakpointChanges();
    }

    /**
     * 获取当前断点
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.xxl) return 'xxl';
        if (width >= this.breakpoints.xl) return 'xl';
        if (width >= this.breakpoints.lg) return 'lg';
        if (width >= this.breakpoints.md) return 'md';
        if (width >= this.breakpoints.sm) return 'sm';
        return 'xs';
    }

    /**
     * 设置响应式布局
     */
    setupResponsiveLayout() {
        this.addResponsiveStyles();
        this.adjustComponentsForBreakpoint();
    }

    /**
     * 添加响应式样式
     */
    addResponsiveStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 移动端优先的响应式样式 */
            
            /* 基础移动端样式 */
            .container {
                padding: 16px;
            }

            .grid {
                display: grid;
                gap: 16px;
            }

            /* 调色板响应式 */
            #paletteDisplay {
                grid-template-columns: repeat(8, 1fr);
                gap: 2px;
            }

            .palette-color {
                aspect-ratio: 1;
                min-height: 32px;
                min-width: 32px;
            }

            /* 控制面板响应式 */
            .control-panel {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .control-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            /* 预览区域响应式 */
            .preview-container {
                max-height: 300px;
                overflow: auto;
            }

            /* 按钮响应式 */
            .button-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .btn {
                width: 100%;
                min-height: 44px;
            }

            /* 小屏幕 (sm+) */
            @media (min-width: 640px) {
                .container {
                    padding: 24px;
                }

                #paletteDisplay {
                    grid-template-columns: repeat(12, 1fr);
                }

                .control-group {
                    flex-direction: row;
                    align-items: center;
                    gap: 16px;
                }

                .button-group {
                    flex-direction: row;
                }

                .btn {
                    width: auto;
                    min-width: 100px;
                }

                .preview-container {
                    max-height: 400px;
                }
            }

            /* 中等屏幕 (md+) */
            @media (min-width: 768px) {
                .grid {
                    grid-template-columns: 1fr 300px;
                    gap: 24px;
                }

                #paletteDisplay {
                    grid-template-columns: repeat(16, 1fr);
                }

                .control-panel {
                    order: 2;
                }

                .preview-container {
                    max-height: 500px;
                    order: 1;
                }
            }

            /* 大屏幕 (lg+) */
            @media (min-width: 1024px) {
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                #paletteDisplay {
                    grid-template-columns: repeat(16, 1fr);
                    gap: 4px;
                }

                .palette-color {
                    min-height: 36px;
                    min-width: 36px;
                }

                .preview-container {
                    max-height: 600px;
                }
            }

            /* 超大屏幕 (xl+) */
            @media (min-width: 1280px) {
                .grid {
                    grid-template-columns: 1fr 350px;
                }

                .control-panel {
                    padding: 24px;
                }
            }

            /* 横屏移动设备特殊处理 */
            @media (orientation: landscape) and (max-height: 500px) {
                .grid {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto 1fr;
                }

                .control-panel {
                    order: 1;
                    flex-direction: row;
                    flex-wrap: wrap;
                    padding: 8px;
                }

                .preview-container {
                    order: 2;
                    max-height: calc(100vh - 150px);
                }

                #paletteDisplay {
                    grid-template-columns: repeat(32, 1fr);
                    gap: 1px;
                }

                .palette-color {
                    min-height: 24px;
                    min-width: 24px;
                }
            }

            /* 高DPI显示屏优化 */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
                .palette-color,
                .used-color-item {
                    border-width: 0.5px;
                }

                .btn {
                    border-width: 0.5px;
                }
            }

            /* 深色模式适配 */
            @media (prefers-color-scheme: dark) {
                :root {
                    color-scheme: dark;
                }
            }

            /* 减少动画偏好 */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 根据断点调整组件
     */
    adjustComponentsForBreakpoint() {
        // 根据断点调整调色板布局
        this.adjustPaletteLayout();
        
        // 调整控制面板
        this.adjustControlPanel();
        
        // 调整预览区域
        this.adjustPreviewArea();
    }

    /**
     * 调整调色板布局
     */
    adjustPaletteLayout() {
        const palette = document.getElementById('paletteDisplay');
        if (!palette) return;

        const columns = {
            'xs': 8,
            'sm': 12,
            'md': 16,
            'lg': 16,
            'xl': 16,
            'xxl': 20
        };

        const cols = columns[this.currentBreakpoint] || 8;
        palette.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

    /**
     * 调整控制面板
     */
    adjustControlPanel() {
        const controlPanel = document.querySelector('.control-panel');
        if (!controlPanel) return;

        if (this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm') {
            controlPanel.classList.add('mobile-layout');
        } else {
            controlPanel.classList.remove('mobile-layout');
        }
    }

    /**
     * 调整预览区域
     */
    adjustPreviewArea() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;

        const maxHeights = {
            'xs': '250px',
            'sm': '350px',
            'md': '450px',
            'lg': '550px',
            'xl': '600px',
            'xxl': '700px'
        };

        previewContainer.style.maxHeight = maxHeights[this.currentBreakpoint] || '300px';
    }

    /**
     * 监控断点变化
     */
    monitorBreakpointChanges() {
        let resizeTimer;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                
                if (newBreakpoint !== this.currentBreakpoint) {
                    const oldBreakpoint = this.currentBreakpoint;
                    this.currentBreakpoint = newBreakpoint;
                    
                    // 通知断点变化
                    document.dispatchEvent(new CustomEvent('breakpointChanged', {
                        detail: {
                            from: oldBreakpoint,
                            to: newBreakpoint,
                            width: window.innerWidth
                        }
                    }));

                    // 重新调整布局
                    this.adjustComponentsForBreakpoint();
                }
            }, 100);
        });
    }

    /**
     * 获取当前断点信息
     */
    getBreakpointInfo() {
        return {
            current: this.currentBreakpoint,
            width: window.innerWidth,
            isMobile: ['xs', 'sm'].includes(this.currentBreakpoint),
            isTablet: this.currentBreakpoint === 'md',
            isDesktop: ['lg', 'xl', 'xxl'].includes(this.currentBreakpoint)
        };
    }
}

/**
 * 移动端性能优化管理器
 */
export class MobilePerformanceOptimizer {
    constructor() {
        this.deviceCapability = null;
        this.optimizationLevel = 'auto';
        
        this.analyzeDeviceCapability();
        this.applyOptimizations();
        this.monitorPerformance();
    }

    /**
     * 分析设备能力
     */
    analyzeDeviceCapability() {
        const deviceManager = new DeviceAdaptationManager();
        const score = deviceManager.getDeviceCapabilityScore();
        
        this.deviceCapability = {
            score: score,
            level: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
            device: deviceManager.getDeviceInfo()
        };

        console.log('设备能力评估:', this.deviceCapability);
    }

    /**
     * 应用性能优化
     */
    applyOptimizations() {
        const level = this.deviceCapability.level;
        
        switch (level) {
            case 'low':
                this.applyLowEndOptimizations();
                break;
            case 'medium':
                this.applyMidRangeOptimizations();
                break;
            case 'high':
                this.applyHighEndOptimizations();
                break;
        }
    }

    /**
     * 低端设备优化
     */
    applyLowEndOptimizations() {
        // 限制最大处理尺寸
        CONFIG.MAX_PROCESSING_SIZE = 1024 * 1024; // 1MP
        
        // 增加防抖延迟
        CONFIG.DEBOUNCE_DELAY = 500;
        
        // 禁用动画
        document.documentElement.classList.add('no-animations');
        
        // 降低预览质量
        const style = document.createElement('style');
        style.textContent = `
            .low-end-device #previewCanvas {
                image-rendering: -moz-crisp-edges;
                image-rendering: pixelated;
            }
            
            .low-end-device .palette-color {
                transition: none !important;
            }
            
            .low-end-device * {
                will-change: auto !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('应用低端设备优化');
    }

    /**
     * 中端设备优化
     */
    applyMidRangeOptimizations() {
        CONFIG.MAX_PROCESSING_SIZE = 2048 * 2048; // 4MP
        CONFIG.DEBOUNCE_DELAY = 300;
        
        // 适度的动画
        const style = document.createElement('style');
        style.textContent = `
            .mid-range-device * {
                animation-duration: 0.2s !important;
                transition-duration: 0.2s !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('应用中端设备优化');
    }

    /**
     * 高端设备优化
     */
    applyHighEndOptimizations() {
        // 启用所有功能
        CONFIG.MAX_PROCESSING_SIZE = 4096 * 4096; // 16MP
        CONFIG.DEBOUNCE_DELAY = 150;
        
        // 启用硬件加速
        const style = document.createElement('style');
        style.textContent = `
            .high-end-device #previewCanvas {
                will-change: transform;
            }
            
            .high-end-device .palette-color {
                will-change: transform;
            }
        `;
        document.head.appendChild(style);
        
        console.log('应用高端设备优化');
    }

    /**
     * 监控性能
     */
    monitorPerformance() {
        // 监控处理时间
        document.addEventListener('processingComplete', (e) => {
            const { processingTime } = e.detail;
            
            if (processingTime > 5000) { // 5秒
                this.suggestOptimizations();
            }
        });

        // 监控内存使用
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                
                if (usagePercent > 80) {
                    this.handleHighMemoryUsage();
                }
            }, 30000);
        }
    }

    /**
     * 建议优化措施
     */
    suggestOptimizations() {
        const suggestions = [
            '图像处理时间较长，建议：',
            '• 使用更小的图像尺寸',
            '• 增大像素尺寸设置',
            '• 关闭其他应用程序'
        ];

        if (window.wplaceApp?.notificationSystem) {
            window.wplaceApp.notificationSystem.show(
                suggestions.join('\n'), 
                'warning', 
                { duration: 5000 }
            );
        }
    }

    /**
     * 处理高内存使用
     */
    handleHighMemoryUsage() {
        // 强制垃圾回收
        if (window.wplaceApp?.resourceManager) {
            window.wplaceApp.resourceManager.forceGarbageCollection();
        }

        // 清理缓存
        if (window.wplaceApp?.smartCacheManager) {
            window.wplaceApp.smartCacheManager.performEmergencyCleanup();
        }

        console.warn('检测到高内存使用，已执行清理操作');
    }

    /**
     * 获取优化建议
     */
    getOptimizationRecommendations() {
        const device = this.deviceCapability.device;
        const recommendations = [];

        if (device.device.memory <= 2) {
            recommendations.push('设备内存较低，建议处理较小的图像');
        }

        if (device.connection?.effectiveType === '3g' || device.connection?.effectiveType === '2g') {
            recommendations.push('网络连接较慢，建议使用离线模式');
        }

        if (device.device.hardwareConcurrency <= 2) {
            recommendations.push('设备CPU核心数较少，处理大图像可能较慢');
        }

        return recommendations;
    }
}

// 导出管理器实例
export const deviceAdaptation = new DeviceAdaptationManager();
export const touchInteraction = new TouchInteractionManager();
export const responsiveLayout = new ResponsiveLayoutManager();
export const mobilePerformance = new MobilePerformanceOptimizer();