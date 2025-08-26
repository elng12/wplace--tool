/**
 * 交互体验提升模块
 * 提供拖拽优化、实时预览、手势支持等增强交互功能
 */

import { CONFIG } from '../config.js';
import { performanceMonitor } from '../core/performanceMonitor.js';
import { resourceManager } from '../core/memoryManager.js';

/**
 * 拖拽上传增强管理器
 */
export class EnhancedDragDropManager {
    constructor() {
        this.isDragOver = false;
        this.dragCounter = 0;
        this.supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        this.maxFileSize = CONFIG.MAX_FILE_SIZE || 4 * 1024 * 1024;
        
        this.setupDragDropHandlers();
        this.createDragVisualFeedback();
    }

    /**
     * 设置拖拽处理器
     */
    setupDragDropHandlers() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        // 防止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, this.preventDefaults, false);
        });

        // 全局拖拽检测
        document.addEventListener('dragenter', (e) => {
            this.dragCounter++;
            if (this.hasValidFiles(e)) {
                this.showGlobalDragOverlay();
            }
        });

        document.addEventListener('dragleave', (e) => {
            this.dragCounter--;
            if (this.dragCounter === 0) {
                this.hideGlobalDragOverlay();
            }
        });

        document.addEventListener('drop', (e) => {
            this.dragCounter = 0;
            this.hideGlobalDragOverlay();
        });

        // 上传区域特定处理
        this.setupUploadAreaHandlers(uploadArea);
    }

    /**
     * 设置上传区域处理器
     */
    setupUploadAreaHandlers(uploadArea) {
        uploadArea.addEventListener('dragenter', (e) => {
            if (this.hasValidFiles(e)) {
                uploadArea.classList.add('drag-over');
                this.showDropZonePreview(e);
            }
        });

        uploadArea.addEventListener('dragover', (e) => {
            if (this.hasValidFiles(e)) {
                e.dataTransfer.dropEffect = 'copy';
                this.updateDropZonePreview(e);
            } else {
                e.dataTransfer.dropEffect = 'none';
            }
        });

        uploadArea.addEventListener('dragleave', (e) => {
            // 检查是否真的离开了上传区域
            if (!uploadArea.contains(e.relatedTarget)) {
                uploadArea.classList.remove('drag-over');
                this.hideDropZonePreview();
            }
        });

        uploadArea.addEventListener('drop', (e) => {
            uploadArea.classList.remove('drag-over');
            this.hideDropZonePreview();
            
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(file => this.isValidFile(file));
            
            if (validFiles.length > 0) {
                this.handleFileDrop(validFiles[0]); // 只处理第一个有效文件
                performanceMonitor.recordUserAction('file_drag_drop', {
                    fileCount: files.length,
                    validFiles: validFiles.length
                });
            } else {
                this.showInvalidFileError(files);
            }
        });
    }

    /**
     * 防止默认行为
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * 检查是否有有效文件
     */
    hasValidFiles(e) {
        if (!e.dataTransfer) return false;
        
        const items = Array.from(e.dataTransfer.items);
        return items.some(item => 
            item.kind === 'file' && this.supportedTypes.includes(item.type)
        );
    }

    /**
     * 验证文件
     */
    isValidFile(file) {
        return this.supportedTypes.includes(file.type) && file.size <= this.maxFileSize;
    }

    /**
     * 显示全局拖拽覆盖层
     */
    showGlobalDragOverlay() {
        let overlay = document.getElementById('global-drag-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-drag-overlay';
            overlay.className = 'fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-40';
            overlay.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                    <div class="text-4xl mb-2">📁</div>
                    <div class="text-lg font-semibold text-gray-800">将图像文件拖放到此处</div>
                    <div class="text-sm text-gray-600">支持 PNG, JPG, GIF, WebP 格式</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.remove('hidden');
    }

    /**
     * 隐藏全局拖拽覆盖层
     */
    hideGlobalDragOverlay() {
        const overlay = document.getElementById('global-drag-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * 显示放置区域预览
     */
    showDropZonePreview(e) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        let preview = uploadArea.querySelector('.drop-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'drop-preview absolute inset-0 bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center';
            preview.innerHTML = `
                <div class="text-center">
                    <div class="text-3xl mb-2">⬇️</div>
                    <div class="text-blue-600 font-semibold">释放以上传图像</div>
                </div>
            `;
            uploadArea.style.position = 'relative';
            uploadArea.appendChild(preview);
        }

        preview.classList.remove('hidden');
    }

    /**
     * 更新放置区域预览
     */
    updateDropZonePreview(e) {
        // 可以在这里添加鼠标位置相关的视觉反馈
    }

    /**
     * 隐藏放置区域预览
     */
    hideDropZonePreview() {
        const preview = document.querySelector('.drop-preview');
        if (preview) {
            preview.classList.add('hidden');
        }
    }

    /**
     * 处理文件拖放
     */
    async handleFileDrop(file) {
        try {
            // 显示文件信息预览
            this.showFilePreview(file);
            
            // 触发文件处理
            if (window.wplaceApp && window.wplaceApp.processFile) {
                await window.wplaceApp.processFile(file);
            }
        } catch (error) {
            console.error('文件处理失败:', error);
            this.showErrorMessage('文件处理失败，请重试');
        }
    }

    /**
     * 显示文件预览
     */
    showFilePreview(file) {
        const preview = document.createElement('div');
        preview.className = 'fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        preview.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        📁
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">${file.name}</div>
                    <div class="text-sm text-gray-500">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
        `;

        document.body.appendChild(preview);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (preview.parentNode) {
                preview.parentNode.removeChild(preview);
            }
        }, 3000);
    }

    /**
     * 显示无效文件错误
     */
    showInvalidFileError(files) {
        const errorMessages = [];
        
        files.forEach(file => {
            if (!this.supportedTypes.includes(file.type)) {
                errorMessages.push(`${file.name}: 不支持的文件格式`);
            } else if (file.size > this.maxFileSize) {
                errorMessages.push(`${file.name}: 文件过大 (${this.formatFileSize(file.size)})`);
            }
        });

        this.showErrorMessage(errorMessages.join('\n'));
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        if (window.wplaceApp?.notificationSystem) {
            window.wplaceApp.notificationSystem.show(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * 创建拖拽视觉反馈样式
     */
    createDragVisualFeedback() {
        const style = document.createElement('style');
        style.id = 'drag-drop-styles';
        style.textContent = `
            .drag-over {
                border-color: #3b82f6 !important;
                background-color: #eff6ff !important;
                transform: scale(1.02);
                box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3) !important;
            }

            .drop-preview {
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }

            #global-drag-overlay {
                backdrop-filter: blur(2px);
                animation: fadeIn 0.2s ease-out;
            }

            #global-drag-overlay.hidden {
                animation: fadeOut 0.2s ease-out forwards;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
    }
}

/**
 * 实时预览管理器
 */
export class RealTimePreviewManager {
    constructor() {
        this.previewCanvas = null;
        this.previewContext = null;
        this.isPreviewEnabled = true;
        this.previewQuality = 'medium'; // low, medium, high
        this.lastPreviewTime = 0;
        this.previewThrottle = 100; // ms
        
        this.initializePreview();
        this.setupPreviewControls();
    }

    /**
     * 初始化预览
     */
    initializePreview() {
        this.previewCanvas = document.getElementById('previewCanvas');
        if (this.previewCanvas) {
            this.previewContext = this.previewCanvas.getContext('2d');
            this.setupCanvasOptimizations();
        }

        // 创建预览控制器
        this.createPreviewControls();
    }

    /**
     * 设置Canvas优化
     */
    setupCanvasOptimizations() {
        if (!this.previewContext) return;

        // 优化Canvas渲染
        this.previewContext.imageSmoothingEnabled = false;
        this.previewContext.imageSmoothingQuality = 'high';
        
        // 设置CSS优化
        this.previewCanvas.style.imageRendering = 'pixelated';
        this.previewCanvas.style.imageRendering = '-moz-crisp-edges';
    }

    /**
     * 创建预览控制器
     */
    createPreviewControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'preview-controls flex items-center gap-2 text-sm';
        controlsContainer.innerHTML = `
            <label class="flex items-center gap-2">
                <input type="checkbox" id="enableRealTimePreview" checked>
                <span>实时预览</span>
            </label>
            <select id="previewQuality" class="text-xs border rounded px-2 py-1">
                <option value="low">低质量</option>
                <option value="medium" selected>中等质量</option>
                <option value="high">高质量</option>
            </select>
        `;

        // 插入到预览区域
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.insertBefore(controlsContainer, previewContainer.firstChild);
        }
    }

    /**
     * 设置预览控制
     */
    setupPreviewControls() {
        document.addEventListener('change', (e) => {
            if (e.target.id === 'enableRealTimePreview') {
                this.isPreviewEnabled = e.target.checked;
                performanceMonitor.recordUserAction('toggle_realtime_preview', {
                    enabled: this.isPreviewEnabled
                });
            } else if (e.target.id === 'previewQuality') {
                this.previewQuality = e.target.value;
                this.updatePreviewSettings();
                performanceMonitor.recordUserAction('change_preview_quality', {
                    quality: this.previewQuality
                });
            }
        });
    }

    /**
     * 更新预览设置
     */
    updatePreviewSettings() {
        const qualitySettings = {
            low: { throttle: 200, skipFrames: 2 },
            medium: { throttle: 100, skipFrames: 1 },
            high: { throttle: 50, skipFrames: 0 }
        };

        const settings = qualitySettings[this.previewQuality];
        this.previewThrottle = settings.throttle;
    }

    /**
     * 更新实时预览
     */
    updatePreview(imageData, pixelSize, settings = {}) {
        if (!this.isPreviewEnabled || !this.previewCanvas) return;

        // 节流控制
        const now = Date.now();
        if (now - this.lastPreviewTime < this.previewThrottle) return;
        this.lastPreviewTime = now;

        // 异步更新预览
        requestAnimationFrame(() => {
            this.renderPreview(imageData, pixelSize, settings);
        });
    }

    /**
     * 渲染预览
     */
    async renderPreview(imageData, pixelSize, settings) {
        if (!this.previewContext) return;

        try {
            // 根据质量设置调整渲染
            const scaleFactor = this.getScaleFactor();
            const sampleStep = this.getSampleStep();

            // 快速预览渲染
            const result = await this.generateQuickPreview(
                imageData, 
                pixelSize, 
                scaleFactor, 
                sampleStep
            );

            this.displayPreview(result);
            
        } catch (error) {
            console.warn('预览渲染失败:', error);
        }
    }

    /**
     * 获取缩放因子
     */
    getScaleFactor() {
        const qualityFactors = {
            low: 0.5,
            medium: 0.75,
            high: 1.0
        };
        
        return qualityFactors[this.previewQuality] || 0.75;
    }

    /**
     * 获取采样步长
     */
    getSampleStep() {
        const qualitySteps = {
            low: 3,
            medium: 2,
            high: 1
        };
        
        return qualitySteps[this.previewQuality] || 2;
    }

    /**
     * 生成快速预览
     */
    async generateQuickPreview(imageData, pixelSize, scaleFactor, sampleStep) {
        // 使用Web Worker或简化算法生成快速预览
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this.generateSimplifiedPreview(
                    imageData, 
                    pixelSize, 
                    scaleFactor, 
                    sampleStep
                );
                resolve(result);
            }, 0);
        });
    }

    /**
     * 生成简化预览
     */
    generateSimplifiedPreview(imageData, pixelSize, scaleFactor, sampleStep) {
        const canvas = resourceManager.getCanvas(
            Math.floor(imageData.width * scaleFactor),
            Math.floor(imageData.height * scaleFactor)
        );
        
        const ctx = canvas.getContext('2d');
        
        // 简化的像素化预览
        this.drawSimplifiedPixels(ctx, imageData, pixelSize, scaleFactor, sampleStep);
        
        const result = {
            canvas: canvas,
            width: canvas.width,
            height: canvas.height
        };
        
        return result;
    }

    /**
     * 绘制简化像素
     */
    drawSimplifiedPixels(ctx, imageData, pixelSize, scaleFactor, sampleStep) {
        const cols = Math.floor(imageData.width / pixelSize);
        const rows = Math.floor(imageData.height / pixelSize);
        
        const scaledPixelSize = pixelSize * scaleFactor;
        
        for (let row = 0; row < rows; row += sampleStep) {
            for (let col = 0; col < cols; col += sampleStep) {
                const x = col * pixelSize;
                const y = row * pixelSize;
                
                // 获取区域平均颜色（简化版）
                const color = this.getAverageColorFast(imageData, x, y, pixelSize);
                
                // 绘制像素块
                ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                ctx.fillRect(
                    col * scaledPixelSize,
                    row * scaledPixelSize,
                    scaledPixelSize * sampleStep,
                    scaledPixelSize * sampleStep
                );
            }
        }
    }

    /**
     * 快速获取平均颜色
     */
    getAverageColorFast(imageData, startX, startY, size) {
        const data = imageData.data;
        const width = imageData.width;
        
        // 只采样中心点（最快）
        const centerX = startX + Math.floor(size / 2);
        const centerY = startY + Math.floor(size / 2);
        const index = (centerY * width + centerX) * 4;
        
        return {
            r: data[index] || 0,
            g: data[index + 1] || 0,
            b: data[index + 2] || 0
        };
    }

    /**
     * 显示预览
     */
    displayPreview(result) {
        if (!this.previewCanvas || !result) return;

        // 调整预览Canvas大小
        this.previewCanvas.width = result.width;
        this.previewCanvas.height = result.height;

        // 绘制预览结果
        this.previewContext.clearRect(0, 0, result.width, result.height);
        this.previewContext.drawImage(result.canvas, 0, 0);

        // 释放临时Canvas
        resourceManager.returnCanvas(result.canvas);
    }

    /**
     * 启用/禁用预览
     */
    setPreviewEnabled(enabled) {
        this.isPreviewEnabled = enabled;
        const checkbox = document.getElementById('enableRealTimePreview');
        if (checkbox) {
            checkbox.checked = enabled;
        }
    }

    /**
     * 设置预览质量
     */
    setPreviewQuality(quality) {
        if (['low', 'medium', 'high'].includes(quality)) {
            this.previewQuality = quality;
            this.updatePreviewSettings();
            
            const select = document.getElementById('previewQuality');
            if (select) {
                select.value = quality;
            }
        }
    }
}

/**
 * 手势支持管理器
 */
export class GestureManager {
    constructor() {
        this.gestures = new Map();
        this.isGestureActive = false;
        this.gestureStartTime = 0;
        this.gestureStartPoint = null;
        
        this.setupGestureRecognition();
        this.initializeGestures();
    }

    /**
     * 设置手势识别
     */
    setupGestureRecognition() {
        let touchStart = null;
        let touchEnd = null;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now()
                };
                this.gestureStartTime = Date.now();
                this.gestureStartPoint = touchStart;
                this.isGestureActive = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (touchStart && this.isGestureActive) {
                touchEnd = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY,
                    time: Date.now()
                };
                
                this.recognizeGesture(touchStart, touchEnd);
                this.isGestureActive = false;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (this.isGestureActive && touchStart) {
                const currentTouch = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now()
                };
                
                this.trackGestureProgress(touchStart, currentTouch);
            }
        }, { passive: true });
    }

    /**
     * 识别手势
     */
    recognizeGesture(start, end) {
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = end.time - start.time;
        const velocity = distance / duration;

        // 滑动手势
        if (distance > 50 && duration < 500) {
            const direction = this.getSwipeDirection(deltaX, deltaY);
            this.executeGesture('swipe', {
                direction: direction,
                distance: distance,
                velocity: velocity,
                start: start,
                end: end
            });
        }
        
        // 点击手势
        else if (distance < 10 && duration < 300) {
            this.executeGesture('tap', {
                position: start,
                duration: duration
            });
        }
        
        // 长按手势
        else if (distance < 20 && duration > 500) {
            this.executeGesture('longpress', {
                position: start,
                duration: duration
            });
        }
    }

    /**
     * 获取滑动方向
     */
    getSwipeDirection(deltaX, deltaY) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        if (angle >= -45 && angle < 45) return 'right';
        if (angle >= 45 && angle < 135) return 'down';
        if (angle >= 135 || angle < -135) return 'left';
        if (angle >= -135 && angle < -45) return 'up';
        
        return 'unknown';
    }

    /**
     * 跟踪手势进度
     */
    trackGestureProgress(start, current) {
        const deltaX = current.x - start.x;
        const deltaY = current.y - start.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 可以在这里添加实时手势反馈
        if (distance > 30) {
            this.showGestureIndicator(start, current);
        }
    }

    /**
     * 显示手势指示器
     */
    showGestureIndicator(start, current) {
        let indicator = document.getElementById('gesture-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'gesture-indicator';
            indicator.className = 'fixed pointer-events-none z-50';
            indicator.style.cssText = `
                width: 4px;
                background: linear-gradient(to right, #3b82f6, #1d4ed8);
                border-radius: 2px;
                transform-origin: left center;
                opacity: 0.7;
            `;
            document.body.appendChild(indicator);
        }

        // 计算线条位置和角度
        const deltaX = current.x - start.x;
        const deltaY = current.y - start.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        indicator.style.left = start.x + 'px';
        indicator.style.top = start.y + 'px';
        indicator.style.height = distance + 'px';
        indicator.style.transform = `rotate(${angle + 90}deg)`;
    }

    /**
     * 隐藏手势指示器
     */
    hideGestureIndicator() {
        const indicator = document.getElementById('gesture-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * 初始化手势动作
     */
    initializeGestures() {
        // 左滑手势：上一个颜色/设置
        this.registerGesture('swipe', 'left', () => {
            this.navigatePrevious();
        });

        // 右滑手势：下一个颜色/设置
        this.registerGesture('swipe', 'right', () => {
            this.navigateNext();
        });

        // 上滑手势：增加像素尺寸
        this.registerGesture('swipe', 'up', () => {
            this.adjustPixelSize(1);
        });

        // 下滑手势：减少像素尺寸
        this.registerGesture('swipe', 'down', () => {
            this.adjustPixelSize(-1);
        });

        // 双击手势：重置/切换
        this.registerGesture('doubletap', null, (data) => {
            this.handleDoubleTap(data);
        });

        // 长按手势：显示选项菜单
        this.registerGesture('longpress', null, (data) => {
            this.showContextMenu(data.position);
        });
    }

    /**
     * 注册手势
     */
    registerGesture(type, direction, handler) {
        const key = direction ? `${type}-${direction}` : type;
        this.gestures.set(key, handler);
    }

    /**
     * 执行手势
     */
    executeGesture(type, data) {
        const key = data.direction ? `${type}-${data.direction}` : type;
        const handler = this.gestures.get(key);
        
        if (handler) {
            handler(data);
            performanceMonitor.recordUserAction('gesture', {
                type: type,
                direction: data.direction
            });
        }

        // 隐藏手势指示器
        this.hideGestureIndicator();
    }

    /**
     * 导航到上一个
     */
    navigatePrevious() {
        const activeElement = document.activeElement;
        
        // 如果在调色板中
        if (activeElement && activeElement.classList.contains('palette-color')) {
            const colors = Array.from(document.querySelectorAll('.palette-color'));
            const currentIndex = colors.indexOf(activeElement);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : colors.length - 1;
            colors[prevIndex].focus();
            return;
        }

        // 其他情况的处理...
    }

    /**
     * 导航到下一个
     */
    navigateNext() {
        const activeElement = document.activeElement;
        
        // 如果在调色板中
        if (activeElement && activeElement.classList.contains('palette-color')) {
            const colors = Array.from(document.querySelectorAll('.palette-color'));
            const currentIndex = colors.indexOf(activeElement);
            const nextIndex = currentIndex < colors.length - 1 ? currentIndex + 1 : 0;
            colors[nextIndex].focus();
            return;
        }

        // 其他情况的处理...
    }

    /**
     * 调整像素尺寸
     */
    adjustPixelSize(delta) {
        const pixelSizeSlider = document.getElementById('pixelSize');
        if (pixelSizeSlider) {
            const current = parseInt(pixelSizeSlider.value);
            const newValue = Math.max(1, Math.min(32, current + delta));
            
            if (newValue !== current) {
                pixelSizeSlider.value = newValue;
                pixelSizeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                
                // 触觉反馈
                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }
            }
        }
    }

    /**
     * 处理双击
     */
    handleDoubleTap(data) {
        const element = document.elementFromPoint(data.position.x, data.position.y);
        
        // 在预览区域双击：重置缩放
        if (element && element.closest('#previewContainer')) {
            const zoomController = window.wplaceApp?.zoomController;
            if (zoomController) {
                zoomController.resetZoom();
            }
        }
        
        // 在调色板双击：选择并应用颜色
        else if (element && element.classList.contains('palette-color')) {
            element.click();
            
            // 触觉反馈
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }
        }
    }

    /**
     * 显示上下文菜单
     */
    showContextMenu(position) {
        const menu = document.createElement('div');
        menu.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2';
        menu.style.left = position.x + 'px';
        menu.style.top = position.y + 'px';
        
        const options = [
            { label: '重置设置', action: () => this.resetSettings() },
            { label: '导出图像', action: () => this.exportImage() },
            { label: '分享', action: () => this.shareImage() },
            { label: '帮助', action: () => this.showHelp() }
        ];
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded';
            button.textContent = option.label;
            button.onclick = () => {
                option.action();
                menu.remove();
            };
            menu.appendChild(button);
        });

        document.body.appendChild(menu);
        
        // 触觉反馈
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    /**
     * 重置设置
     */
    resetSettings() {
        if (window.wplaceApp) {
            // 重置像素尺寸
            const pixelSizeSlider = document.getElementById('pixelSize');
            if (pixelSizeSlider) {
                pixelSizeSlider.value = CONFIG.DEFAULT_PIXEL_SIZE;
                pixelSizeSlider.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 重置其他设置...
        }
    }

    /**
     * 导出图像
     */
    exportImage() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.click();
        }
    }

    /**
     * 分享图像
     */
    shareImage() {
        if (navigator.share && window.wplaceApp?.pixelizedData) {
            // Web Share API
            navigator.share({
                title: 'Wplace 像素艺术',
                text: '我用 Wplace 像素艺术转换器创建了这个作品！',
                // url: URL.createObjectURL(blob) // 需要先创建图像blob
            }).catch(console.error);
        }
    }

    /**
     * 显示帮助
     */
    showHelp() {
        if (window.wplaceApp?.keyboardNavigation) {
            window.wplaceApp.keyboardNavigation.showKeyboardHelp();
        }
    }
}

/**
 * 快速动作管理器
 */
export class QuickActionsManager {
    constructor() {
        this.actions = new Map();
        this.shortcuts = new Map();
        
        this.initializeQuickActions();
        this.createQuickActionBar();
    }

    /**
     * 初始化快速动作
     */
    initializeQuickActions() {
        // 注册快速动作
        this.registerAction('undo', '撤销', '↶', () => this.undo());
        this.registerAction('redo', '重做', '↷', () => this.redo());
        this.registerAction('reset', '重置', '⟲', () => this.reset());
        this.registerAction('share', '分享', '⤴', () => this.share());
        this.registerAction('favorite', '收藏', '⭐', () => this.favorite());
        this.registerAction('fullscreen', '全屏', '⛶', () => this.toggleFullscreen());
        
        // 注册键盘快捷键
        this.shortcuts.set('KeyZ', 'undo'); // Ctrl+Z
        this.shortcuts.set('KeyY', 'redo'); // Ctrl+Y
        this.shortcuts.set('KeyR', 'reset'); // Ctrl+R
        this.shortcuts.set('F11', 'fullscreen'); // F11
    }

    /**
     * 注册动作
     */
    registerAction(id, label, icon, handler) {
        this.actions.set(id, {
            id: id,
            label: label,
            icon: icon,
            handler: handler,
            enabled: true
        });
    }

    /**
     * 创建快速动作栏
     */
    createQuickActionBar() {
        const actionBar = document.createElement('div');
        actionBar.id = 'quick-action-bar';
        actionBar.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 z-40';
        
        // 只显示最常用的动作
        const primaryActions = ['undo', 'redo', 'reset', 'share'];
        
        primaryActions.forEach(actionId => {
            const action = this.actions.get(actionId);
            if (action) {
                const button = this.createActionButton(action);
                actionBar.appendChild(button);
            }
        });

        // 更多动作按钮
        const moreButton = document.createElement('button');
        moreButton.className = 'w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors';
        moreButton.innerHTML = '⋯';
        moreButton.onclick = () => this.showMoreActions();
        actionBar.appendChild(moreButton);

        document.body.appendChild(actionBar);
    }

    /**
     * 创建动作按钮
     */
    createActionButton(action) {
        const button = document.createElement('button');
        button.className = 'w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50';
        button.innerHTML = action.icon;
        button.title = action.label;
        button.disabled = !action.enabled;
        button.onclick = () => {
            action.handler();
            performanceMonitor.recordUserAction('quick_action', { action: action.id });
        };
        
        return button;
    }

    /**
     * 显示更多动作
     */
    showMoreActions() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const content = document.createElement('div');
        content.className = 'bg-white rounded-lg p-6 max-w-sm w-full mx-4';
        
        content.innerHTML = `
            <h3 class="text-lg font-semibold mb-4">快速动作</h3>
            <div class="grid grid-cols-3 gap-3" id="more-actions-grid"></div>
            <button class="mt-4 w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onclick="this.closest('.fixed').remove()">关闭</button>
        `;
        
        const grid = content.querySelector('#more-actions-grid');
        
        // 显示所有动作
        this.actions.forEach(action => {
            const actionButton = document.createElement('button');
            actionButton.className = 'flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50';
            actionButton.disabled = !action.enabled;
            actionButton.innerHTML = `
                <div class="text-2xl mb-1">${action.icon}</div>
                <div class="text-xs">${action.label}</div>
            `;
            actionButton.onclick = () => {
                action.handler();
                modal.remove();
            };
            
            grid.appendChild(actionButton);
        });
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    // 快速动作实现
    undo() {
        console.log('执行撤销操作');
        // TODO: 实现撤销功能
    }

    redo() {
        console.log('执行重做操作');
        // TODO: 实现重做功能
    }

    reset() {
        if (confirm('确定要重置所有设置吗？')) {
            if (window.wplaceApp?.pixelSizeController) {
                window.wplaceApp.pixelSizeController.setValue(CONFIG.DEFAULT_PIXEL_SIZE);
            }
        }
    }

    share() {
        if (navigator.share) {
            navigator.share({
                title: 'Wplace 像素艺术转换器',
                url: window.location.href
            });
        }
    }

    favorite() {
        console.log('收藏当前设置');
        // TODO: 实现收藏功能
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
}

// 导出管理器实例
export const enhancedDragDrop = new EnhancedDragDropManager();
export const realTimePreview = new RealTimePreviewManager();
export const gestureManager = new GestureManager();
export const quickActions = new QuickActionsManager();