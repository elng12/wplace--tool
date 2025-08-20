// Wplace Pixel Art Converter - Final Integrated Version
// 整合了所有优化模块的最终版本

import { CONFIG } from './config.js';
import { WplaceError, ErrorHandler } from './core/errorHandler.js';
import { ImageProcessor } from './core/imageProcessor.js';
import { MemoryManager } from './core/memoryManager.js';
import { smartCacheManager } from './core/cacheManager.js';
import { WorkerManager } from './core/workerManager.js';
import { PerformanceMonitor } from './core/performanceMonitor.js';
import { AccessibilityManager } from './accessibility/accessibilityManager.js';
import { MobileOptimizer } from './mobile/mobileOptimizer.js';
import { InteractionEnhancer } from './interaction/interactionEnhancer.js';
import { VisualDesignManager, initializeVisualDesign } from './visual/visualDesignManager.js';
import { InternationalizationManager, initializeInternationalization } from './i18n/internationalizationManager.js';

import { validateFile, validateImageDimensions, validateProcessingOptions } from './utils/validators.js';
import { UIControls } from './ui/controls.js';

class WplacePixelArtConverter {
    constructor() {
        this.isInitialized = false;
        this.currentImage = null;
        this.processedImage = null;
        this.isProcessing = false;
        
        // 核心管理器
        this.errorHandler = new ErrorHandler();
        this.memoryManager = new MemoryManager();
        this.cacheManager = smartCacheManager;
        this.workerManager = new WorkerManager();
        this.performanceMonitor = new PerformanceMonitor();
        
        // UX 增强管理器
        this.accessibilityManager = null;
        this.mobileOptimizer = null;
        this.interactionEnhancer = null;
        this.visualDesignManager = null;
        this.i18nManager = null;
        
        // 处理器和工具
        this.imageProcessor = null;
        this.uiControls = null;
        
        // 绑定方法上下文
        this.handleImageUpload = this.handleImageUpload.bind(this);
        this.handleProcessImage = this.handleProcessImage.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    async initialize() {
        try {
            this.performanceMonitor.startMeasurement('app-initialization');
            
            // 1. 初始化视觉设计系统
            this.visualDesignManager = initializeVisualDesign();
            
            // 2. 初始化国际化
            this.i18nManager = initializeInternationalization();
            
            // 3. 初始化核心处理器
            this.imageProcessor = new ImageProcessor(this.memoryManager, this.cacheManager);
            
            // 4. 初始化 UI 控件
            this.uiControls = new UIControls();
            this.setupUIControls();
            
            // 5. 初始化 UX 增强功能
            await this.initializeUXEnhancements();
            
            // 6. 设置事件监听器
            this.setupEventListeners();
            
            // 7. 初始化拖放功能
            this.setupDragAndDrop();

            // 8. 创建调色板
            this.createPalette();
            
            // 9. 显示成功消息
            this.visualDesignManager.createToast(
                this.i18nManager.t('appTitle') + ' 已准备就绪',
                'success'
            );
            
            this.isInitialized = true;
            this.performanceMonitor.endMeasurement('app-initialization');
            
            console.log('🎨 Wplace Pixel Art Converter 初始化完成');
            console.log('📊 性能监控已启用');
            console.log('♿ 无障碍功能已启用');
            console.log('📱 移动端优化已启用');
            console.log('🎯 交互增强已启用');
            console.log('🎨 视觉设计系统已启用');
            console.log('🌍 国际化支持已启用');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'APP_INITIALIZATION_FAILED');
            throw error;
        }
    }

    async initializeUXEnhancements() {
        // 检测设备能力
        const deviceCapabilities = await this.detectDeviceCapabilities();
        
        // 根据设备能力初始化相应的增强功能
        if (deviceCapabilities.supportsAccessibility) {
            this.accessibilityManager = new AccessibilityManager();
        }
        
        if (deviceCapabilities.isMobile) {
            this.mobileOptimizer = new MobileOptimizer();
        }
        
        this.interactionEnhancer = new InteractionEnhancer();
    }

    async detectDeviceCapabilities() {
        return {
            isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
            supportsAccessibility: 'speechSynthesis' in window,
            supportsWebGL: this.checkWebGLSupport(),
            supportsWorkers: typeof Worker !== 'undefined',
            supportsTouch: 'ontouchstart' in window,
            memorySize: this.estimateMemorySize()
        };
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }

    estimateMemorySize() {
        if (navigator.deviceMemory) {
            return navigator.deviceMemory * 1024 * 1024 * 1024; // GB to bytes
        }
        return 2 * 1024 * 1024 * 1024; // 默认 2GB
    }

    setupUIControls() {
        const controlsConfig = {
            uploadButton: '#upload-btn',
            fileInput: '#file-input',
            processButton: '#process-btn',
            downloadButton: '#download-btn',
            resetButton: '#reset-btn',
            progressBar: '#progress-bar',
            previewCanvas: '#preview-canvas',
            outputCanvas: '#output-canvas',
            sizeSlider: '#size-slider',
            qualitySlider: '#quality-slider',
            brightnessSlider: '#brightness-slider',
            contrastSlider: '#contrast-slider',
            saturationSlider: '#saturation-slider'
        };
        
        this.uiControls.initialize(controlsConfig);
    }

    setupEventListeners() {
        // 核心事件
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
        });
        
        // 上传区域点击事件
        document.getElementById('uploadArea')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
        });
        
        document.getElementById('file-input')?.addEventListener('change', this.handleImageUpload);
        document.getElementById('process-btn')?.addEventListener('click', this.handleProcessImage);
        document.getElementById('download-btn')?.addEventListener('click', this.handleDownload);
        document.getElementById('reset-btn')?.addEventListener('click', this.handleReset);
        
        // 主题和语言变更事件
        window.addEventListener('themechange', this.handleThemeChange.bind(this));
        window.addEventListener('languagechange', this.handleLanguageChange.bind(this));
        
        // 窗口事件
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // 键盘快捷键
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('uploadArea') || document.getElementById('drop-zone') || document.body;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find(file => file.type.startsWith('image/'));
            
            if (imageFile) {
                this.processFileUpload(imageFile);
            }
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        await this.processFileUpload(file);
    }

    async processFileUpload(file) {
        try {
            this.performanceMonitor.startMeasurement('file-upload');
            
            // 验证文件
            const validation = validateFile(file);
            if (!validation.valid) {
                throw new WplaceError(validation.error, 'FILE_VALIDATION_FAILED');
            }
            
            // 显示加载状态
            this.uiControls.showLoading(true);
            this.updateProgress(10, this.i18nManager.t('uploadProgress'));
            
            // 读取文件
            const imageData = await this.readImageFile(file);
            this.updateProgress(30, this.i18nManager.t('processing'));
            
            // 验证图片尺寸
            const dimensionValidation = validateImageDimensions(
                imageData.width, 
                imageData.height
            );
            if (!dimensionValidation.valid) {
                throw new WplaceError(dimensionValidation.error, 'DIMENSION_VALIDATION_FAILED');
            }
            
            this.currentImage = imageData;
            this.updateProgress(50, this.i18nManager.t('processing'));
            
            // 显示预览
            this.displayImagePreview(imageData);
            this.updateProgress(70, this.i18nManager.t('processing'));
            
            // 启用处理按钮
            this.uiControls.setButtonEnabled('process', true);
            this.updateProgress(100, this.i18nManager.t('uploadSuccess'));
            
            // 无障碍反馈
            if (this.accessibilityManager) {
                this.accessibilityManager.announceToScreenReader(
                    `${this.i18nManager.t('uploadSuccess')}: ${file.name}`
                );
            }
            
            this.performanceMonitor.endMeasurement('file-upload');
            
        } catch (error) {
            this.handleProcessingError(error);
        } finally {
            this.uiControls.showLoading(false);
        }
    }

    async readImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = this.memoryManager.getCanvas(img.width, img.height);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    resolve({
                        canvas,
                        width: img.width,
                        height: img.height,
                        originalFile: file
                    });
                };
                img.onerror = () => reject(new WplaceError('图片加载失败', 'IMAGE_LOAD_FAILED'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new WplaceError('文件读取失败', 'FILE_READ_FAILED'));
            reader.readAsDataURL(file);
        });
    }

    displayImagePreview(imageData) {
        const previewCanvas = document.getElementById('preview-canvas');
        const uploadPrompt = document.getElementById('upload-prompt');
        
        if (!previewCanvas) return;
        
        // 隐藏提示文字，显示预览画布
        if (uploadPrompt) uploadPrompt.classList.add('hidden');
        previewCanvas.classList.remove('hidden');
        
        previewCanvas.width = imageData.width;
        previewCanvas.height = imageData.height;
        
        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(imageData.canvas, 0, 0);
        
        // 显示图片信息
        this.displayImageInfo(imageData);
    }

    displayImageInfo(imageData) {
        const infoContainer = document.getElementById('image-info');
        if (!infoContainer) return;
        
        const fileSize = this.i18nManager.formatFileSize(
            imageData.originalFile ? imageData.originalFile.size : 0
        );
        
        infoContainer.innerHTML = `
            <div class="info-item">
                <strong>${this.i18nManager.t('fileName')}:</strong><br>
                ${imageData.originalFile?.name || 'Unknown'}
            </div>
            <div class="info-item">
                <strong>${this.i18nManager.t('dimensions')}:</strong><br>
                ${imageData.width} x ${imageData.height} ${this.i18nManager.t('pixels')}
            </div>
            <div class="info-item">
                <strong>${this.i18nManager.t('fileSize')}:</strong><br>
                ${fileSize}
            </div>
        `;
        
        infoContainer.classList.remove('hidden');
    }

    async handleProcessImage() {
        if (!this.currentImage || this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.performanceMonitor.startMeasurement('image-processing');
            
            // 获取处理参数
            const options = this.getProcessingOptions();
            
            // 验证处理选项
            const optionValidation = validateProcessingOptions(options);
            if (!optionValidation.valid) {
                throw new WplaceError(optionValidation.error, 'OPTION_VALIDATION_FAILED');
            }
            
            this.uiControls.showLoading(true);
            this.updateProgress(10, this.i18nManager.t('processingProgress'));
            
            // 使用缓存检查
            const cacheKey = this.cacheManager.generateImageHash(this.currentImage.canvas);
            const cached = this.cacheManager.get(cacheKey);
            
            if (cached && cached.options === JSON.stringify(options)) {
                this.processedImage = cached.result;
                this.updateProgress(100, this.i18nManager.t('processingComplete'));
            } else {
                // 执行图片处理
                this.processedImage = await this.imageProcessor.processImage(
                    this.currentImage.canvas,
                    options,
                    (progress, status) => {
                        this.updateProgress(10 + progress * 0.8, status);
                    }
                );
                
                // 缓存结果
                this.cacheManager.set(cacheKey, {
                    result: this.processedImage,
                    options: JSON.stringify(options)
                });
            }
            
            // 显示处理结果
            this.displayProcessedImage();
            this.updateProgress(100, this.i18nManager.t('processingComplete'));
            
            // 启用下载按钮
            this.uiControls.setButtonEnabled('download', true);
            
            // 性能统计
            const processingTime = this.performanceMonitor.endMeasurement('image-processing');
            console.log(`处理完成，耗时: ${processingTime.toFixed(2)}ms`);
            
            // 无障碍反馈
            if (this.accessibilityManager) {
                this.accessibilityManager.announceToScreenReader(
                    this.i18nManager.t('processingComplete')
                );
            }
            
            // 显示成功消息
            this.visualDesignManager.createToast(
                this.i18nManager.t('processingComplete'),
                'success'
            );
            
        } catch (error) {
            this.handleProcessingError(error);
        } finally {
            this.isProcessing = false;
            this.uiControls.showLoading(false);
        }
    }

    getProcessingOptions() {
        return {
            outputSize: parseInt(document.getElementById('size-slider')?.value || '500'),
            quality: parseInt(document.getElementById('quality-slider')?.value || '80'),
            brightness: parseInt(document.getElementById('brightness-slider')?.value || '0'),
            contrast: parseInt(document.getElementById('contrast-slider')?.value || '0'),
            saturation: parseInt(document.getElementById('saturation-slider')?.value || '0'),
            dithering: document.getElementById('dithering-checkbox')?.checked || false,
            colorPalette: document.getElementById('palette-select')?.value || 'place'
        };
    }

    displayProcessedImage() {
        const outputCanvas = document.getElementById('output-canvas');
        const previewCanvas = document.getElementById('preview-canvas');
        
        if (!outputCanvas || !this.processedImage) return;
        
        // 隐藏预览画布，显示输出画布
        if (previewCanvas) previewCanvas.classList.add('hidden');
        outputCanvas.classList.remove('hidden');
        
        outputCanvas.width = this.processedImage.width;
        outputCanvas.height = this.processedImage.height;
        
        const ctx = outputCanvas.getContext('2d');
        ctx.drawImage(this.processedImage, 0, 0);
        
        // 添加淡入动画
        if (this.visualDesignManager) {
            this.visualDesignManager.animate(outputCanvas, 'fadeIn');
        }
    }

    handleDownload() {
        if (!this.processedImage) return;
        
        try {
            const canvas = this.processedImage;
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wplace-pixel-art-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // 显示成功消息
                this.visualDesignManager.createToast(
                    this.i18nManager.t('downloadReady'),
                    'success'
                );
            });
        } catch (error) {
            this.handleProcessingError(error);
        }
    }

    handleReset() {
        this.currentImage = null;
        this.processedImage = null;
        
        // 清理画布
        const previewCanvas = document.getElementById('preview-canvas');
        const outputCanvas = document.getElementById('output-canvas');
        
        if (previewCanvas) {
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        }
        
        if (outputCanvas) {
            const ctx = outputCanvas.getContext('2d');
            ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        }
        
        // 重置 UI 状态
        this.uiControls.setButtonEnabled('process', false);
        this.uiControls.setButtonEnabled('download', false);
        this.updateProgress(0, '');
        
        // 清理文件输入
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
        // 清理图片信息
        const infoContainer = document.getElementById('image-info');
        if (infoContainer) infoContainer.innerHTML = '';
        
        // 内存清理
        this.memoryManager.cleanup();
        
        // 显示重置消息
        this.visualDesignManager.createToast('已重置', 'info');
    }

    updateProgress(value, text = '') {
        const progressContainer = document.getElementById('progress-bar');
        const progressIndicator = document.getElementById('progress-indicator');
        const progressText = document.getElementById('progress-text');
        
        if (progressContainer && value > 0) {
            progressContainer.classList.remove('hidden');
        }
        
        if (progressIndicator) {
            progressIndicator.style.width = `${value}%`;
        }
        
        if (progressText) {
            progressText.textContent = text || `${Math.round(value)}%`;
        }
        
        // 完成后隐藏进度条
        if (value >= 100) {
            setTimeout(() => {
                if (progressContainer) {
                    progressContainer.classList.add('hidden');
                }
            }, 2000);
        }
    }

    handleProcessingError(error) {
        console.error('处理错误:', error);
        
        this.errorHandler.handleError(error);
        
        // 显示错误消息
        let errorMessage = this.i18nManager.t('processingFailed');
        if (error instanceof WplaceError) {
            errorMessage = error.userMessage || errorMessage;
        }
        
        this.visualDesignManager.createToast(errorMessage, 'error');
        
        // 无障碍反馈
        if (this.accessibilityManager) {
            this.accessibilityManager.announceToScreenReader(`错误: ${errorMessage}`);
        }
    }

    handleThemeChange(event) {
        console.log('主题已更改:', event.detail.theme);
        
        // 根据主题更新特定元素
        if (event.detail.theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    handleLanguageChange(event) {
        console.log('语言已更改:', event.detail.language);
        
        // 更新 RTL 支持
        if (event.detail.direction === 'rtl') {
            document.body.classList.add('rtl-layout');
        } else {
            document.body.classList.remove('rtl-layout');
        }
    }

    handleResize() {
        // 移动端优化处理
        if (this.mobileOptimizer) {
            this.mobileOptimizer.handleResize();
        }
    }

    handleBeforeUnload(event) {
        if (this.isProcessing) {
            event.preventDefault();
            event.returnValue = '图片正在处理中，确定要离开吗？';
        }
        
        // 清理资源
        this.cleanup();
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'o':
                case 'O':
                    event.preventDefault();
                    document.getElementById('file-input')?.click();
                    break;
                case 's':
                case 'S':
                    event.preventDefault();
                    if (this.processedImage) {
                        this.handleDownload();
                    }
                    break;
                case 'r':
                case 'R':
                    event.preventDefault();
                    this.handleReset();
                    break;
            }
        }
        
        // ESC 键取消处理
        if (event.key === 'Escape' && this.isProcessing) {
            this.cancelProcessing();
        }
    }

    cancelProcessing() {
        if (this.workerManager) {
            this.workerManager.terminateAll();
        }
        this.isProcessing = false;
        this.uiControls.showLoading(false);
        this.updateProgress(0, '处理已取消');
    }

    cleanup() {
        // 清理所有资源
        if (this.memoryManager) {
            this.memoryManager.cleanup();
        }
        
        if (this.cacheManager) {
            this.cacheManager.clear();
        }
        
        if (this.workerManager) {
            this.workerManager.cleanup();
        }
        
        if (this.performanceMonitor) {
            const stats = this.performanceMonitor.getStats();
            console.log('性能统计:', stats);
        }
    }

    // 获取应用状态信息
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            processing: this.isProcessing,
            hasImage: !!this.currentImage,
            hasProcessedImage: !!this.processedImage,
            currentLanguage: this.i18nManager?.getCurrentLanguage(),
            currentTheme: this.visualDesignManager?.getCurrentTheme(),
            memoryUsage: this.memoryManager?.getMemoryUsage(),
            cacheStats: this.cacheManager?.getStats(),
            performanceStats: this.performanceMonitor?.getStats()
        };
    }

    createPalette() {
        const paletteContainer = document.getElementById('paletteDisplay');
        if (!paletteContainer) return;

        // 清空现有内容
        paletteContainer.innerHTML = '';

        const palette = this.imageProcessor.getPalette(); // Assuming imageProcessor can provide the palette

        palette.forEach(color => {
            if (color.isTransparent) return;

            const colorEl = document.createElement('button');
            colorEl.className = 'w-6 h-6 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500';
            colorEl.style.backgroundColor = color.color;
            colorEl.title = `${color.name} (${color.color})`;
            colorEl.dataset.color = color.color;

            if (color.isPremium) {
                const lockIcon = document.createElement('span');
                lockIcon.className = 'text-white text-xs absolute top-0.5 right-0.5';
                lockIcon.textContent = '🔒';
                colorEl.classList.add('relative');
                colorEl.appendChild(lockIcon);
            }

            paletteContainer.appendChild(colorEl);
        });
    }
}

// 应用启动
let app;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        app = new WplacePixelArtConverter();
        await app.initialize();
        
        // 使应用全局可访问
        window.wplaceApp = app;
        
    } catch (error) {
        console.error('应用初始化失败:', error);
        
        // 显示基本错误信息
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3>应用初始化失败</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; border: none; background: white; color: #f44336; border-radius: 4px; cursor: pointer;">重试</button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// 导出应用类供测试使用
export { WplacePixelArtConverter };