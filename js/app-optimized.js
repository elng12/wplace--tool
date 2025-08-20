/**
 * Wplace Pixel Art Converter - 优化版本
 * 统一架构，性能优化，完善错误处理
 */

// 导入配置和工具
import { 
    CONFIG, 
    WPLACE_PALETTE, 
    TOAST_TYPES, 
    Utils, 
    ErrorHandler, 
    PerformanceMonitor 
} from './app-config.js';

// 导入安全模块
import { 
    SecurityManager,
    InputSanitizer 
} from './security-enhanced.js';

/**
 * 通知系统 - 改进的Toast实现
 */
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.queue = [];
        this.isProcessing = false;
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = TOAST_TYPES.INFO, duration = CONFIG.NOTIFICATION_TIMEOUT) {
        const toast = {
            message: String(message),
            type,
            duration,
            id: Utils.generateId()
        };
        
        this.queue.push(toast);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        const toast = this.queue.shift();
        await this.displayToast(toast);
        
        // 处理下一个
        setTimeout(() => this.processQueue(), 200);
    }
    
    displayToast(toast) {
        return new Promise(resolve => {
            const element = this.createElement(toast);
            this.container.appendChild(element);
            
            // 入场动画
            requestAnimationFrame(() => {
                element.classList.add('translate-y-0', 'opacity-100');
                element.classList.remove('translate-y-2', 'opacity-0');
            });
            
            // 自动移除
            setTimeout(() => {
                this.removeToast(element);
                resolve();
            }, toast.duration);
        });
    }
    
    createElement(toast) {
        const colors = {
            [TOAST_TYPES.SUCCESS]: 'bg-green-600',
            [TOAST_TYPES.ERROR]: 'bg-red-600',
            [TOAST_TYPES.WARNING]: 'bg-yellow-600',
            [TOAST_TYPES.INFO]: 'bg-blue-600'
        };
        
        const element = document.createElement('div');
        element.className = `
            transform transition-all duration-300 translate-y-2 opacity-0
            ${colors[toast.type] || colors[TOAST_TYPES.INFO]}
            text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center
            flex items-center space-x-2
        `.trim();
        
        // 添加图标
        const icon = this.getIcon(toast.type);
        element.innerHTML = `
            <span class="flex-shrink-0">${icon}</span>
            <span class="flex-1">${toast.message}</span>
            <button class="flex-shrink-0 ml-2 hover:opacity-75" onclick="this.parentElement.remove()">
                <span class="sr-only">关闭</span>
                <span class="text-lg leading-none">×</span>
            </button>
        `;
        
        return element;
    }
    
    getIcon(type) {
        const icons = {
            [TOAST_TYPES.SUCCESS]: '✓',
            [TOAST_TYPES.ERROR]: '✗',
            [TOAST_TYPES.WARNING]: '⚠',
            [TOAST_TYPES.INFO]: 'ℹ'
        };
        return icons[type] || icons[TOAST_TYPES.INFO];
    }
    
    removeToast(element) {
        element.classList.add('translate-y-2', 'opacity-0');
        element.classList.remove('translate-y-0', 'opacity-100');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
}

/**
 * 图像处理核心类
 */
class ImageProcessor {
    constructor() {
        this.cache = new Map();
        this.isProcessing = false;
    }
    
    // 图像调整
    applyAdjustments(imageData, options) {
        const { brightness = 0, contrast = 0, saturation = 0 } = options;
        const data = imageData.data;
        
        const brightnessAdjust = brightness / 100;
        const contrastAdjust = (contrast + 100) / 100;
        const saturationAdjust = saturation / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // 亮度调整
            r += brightnessAdjust * 255;
            g += brightnessAdjust * 255;
            b += brightnessAdjust * 255;
            
            // 对比度调整
            r = ((r / 255 - 0.5) * contrastAdjust + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrastAdjust + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrastAdjust + 0.5) * 255;
            
            // 饱和度调整
            if (saturationAdjust !== 0) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                r = gray + (r - gray) * (1 + saturationAdjust);
                g = gray + (g - gray) * (1 + saturationAdjust);
                b = gray + (b - gray) * (1 + saturationAdjust);
            }
            
            // 限制范围
            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }
        
        return imageData;
    }
    
    // 像素化处理
    async processToPixelArt(canvas, options = {}, progressCallback) {
        const { 
            pixelSize = CONFIG.DEFAULT_PIXEL_SIZE,
            dithering = false,
            ...adjustments 
        } = options;
        
        return new Promise((resolve, reject) => {
            try {
                PerformanceMonitor.start('pixel-processing');
                
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // 应用图像调整
                if (progressCallback) progressCallback(10, '应用图像调整...');
                imageData = this.applyAdjustments(imageData, adjustments);
                
                // 创建输出画布
                if (progressCallback) progressCallback(30, '创建输出画布...');
                const outputCanvas = document.createElement('canvas');
                const newWidth = Math.ceil(canvas.width / pixelSize);
                const newHeight = Math.ceil(canvas.height / pixelSize);
                
                outputCanvas.width = newWidth;
                outputCanvas.height = newHeight;
                const outputCtx = outputCanvas.getContext('2d');
                
                // 处理像素块
                if (progressCallback) progressCallback(50, '处理像素化...');
                this.processPixelBlocks(imageData, outputCtx, canvas.width, canvas.height, pixelSize, dithering, progressCallback);
                
                if (progressCallback) progressCallback(100, '处理完成');
                PerformanceMonitor.end('pixel-processing');
                
                resolve(outputCanvas);
            } catch (error) {
                PerformanceMonitor.end('pixel-processing');
                reject(error);
            }
        });
    }
    
    processPixelBlocks(imageData, outputCtx, width, height, pixelSize, dithering, progressCallback) {
        const data = imageData.data;
        const newWidth = Math.ceil(width / pixelSize);
        const newHeight = Math.ceil(height / pixelSize);
        const totalBlocks = newWidth * newHeight;
        let processedBlocks = 0;
        
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                
                // 计算平均颜色
                for (let dy = 0; dy < pixelSize; dy++) {
                    for (let dx = 0; dx < pixelSize; dx++) {
                        const px = x * pixelSize + dx;
                        const py = y * pixelSize + dy;
                        
                        if (px < width && py < height) {
                            const i = (py * width + px) * 4;
                            r += data[i];
                            g += data[i + 1];
                            b += data[i + 2];
                            count++;
                        }
                    }
                }
                
                if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    
                    const closestColor = Utils.getClosestColor(r, g, b);
                    outputCtx.fillStyle = closestColor;
                    outputCtx.fillRect(x, y, 1, 1);
                }
                
                processedBlocks++;
                
                // 定期更新进度
                if (processedBlocks % 1000 === 0 && progressCallback) {
                    const progress = 50 + (processedBlocks / totalBlocks) * 40;
                    progressCallback(progress, `处理像素块: ${processedBlocks}/${totalBlocks}`);
                }
            }
        }
    }
}

/**
 * 进度控制器
 */
class ProgressController {
    constructor() {
        this.container = Utils.$('progress-bar');
        this.indicator = Utils.$('progress-indicator');
        this.text = Utils.$('progress-text');
    }
    
    show() {
        Utils.showElement('progress-bar');
    }
    
    hide() {
        Utils.hideElement('progress-bar');
    }
    
    update(value, text = '') {
        if (value > 0) this.show();
        
        if (this.indicator) {
            this.indicator.style.width = `${Math.max(0, Math.min(100, value))}%`;
        }
        
        if (this.text) {
            this.text.textContent = text || `${Math.round(value)}%`;
        }
        
        if (value >= 100) {
            setTimeout(() => this.hide(), 2000);
        }
    }
}

/**
 * 主应用类
 */
export class WplacePixelArtConverter {
    constructor() {
        this.currentImage = null;
        this.processedImage = null;
        this.batchQueue = [];
        this.batchResults = [];
        this.isProcessing = false;
        
        // 核心组件
        this.notifications = new NotificationSystem();
        this.imageProcessor = new ImageProcessor();
        this.progress = new ProgressController();
        this.security = new SecurityManager();
        
        // 防抖处理器
        this.debouncedPreview = Utils.debounce(
            this.updatePreview.bind(this), 
            CONFIG.DEBOUNCE_DELAY
        );
        
        // 绑定方法上下文
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.processImage = this.processImage.bind(this);
        this.downloadImage = this.downloadImage.bind(this);
        this.resetApp = this.resetApp.bind(this);
    }
    
    async initialize() {
        try {
            PerformanceMonitor.start('app-initialization');
            
            this.setupEventListeners();
            this.setupDragDrop();
            this.initializePalette();
            this.setupParameterControls();
            
            PerformanceMonitor.end('app-initialization');
            
            this.notifications.show('Wplace 像素画转换器已准备就绪！', TOAST_TYPES.SUCCESS);
            console.log('🎨 应用初始化完成');
            
        } catch (error) {
            const errorMsg = ErrorHandler.handle(error, '应用初始化');
            this.notifications.show(errorMsg, TOAST_TYPES.ERROR);
            throw error;
        }
    }
    
    setupEventListeners() {
        // 文件上传
        const uploadArea = Utils.$('uploadArea');
        const fileInput = Utils.$('file-input');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', this.handleFileUpload);
        }
        
        // 控制按钮
        const processBtn = Utils.$('process-btn');
        const downloadBtn = Utils.$('download-btn');
        const resetBtn = Utils.$('reset-btn');
        
        if (processBtn) processBtn.addEventListener('click', this.processImage);
        if (downloadBtn) downloadBtn.addEventListener('click', this.downloadImage);
        if (resetBtn) resetBtn.addEventListener('click', this.resetApp);
    }
    
    setupDragDrop() {
        const uploadArea = Utils.$('uploadArea');
        if (!uploadArea) return;
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                this.handleFileUpload({ target: { files: imageFiles } });
            } else {
                this.notifications.show('请拖拽图片文件', TOAST_TYPES.ERROR);
            }
        });
    }
    
    setupParameterControls() {
        // 像素尺寸滑块
        const sizeSlider = Utils.$('size-slider');
        const sizeValue = Utils.$('size-value');
        
        if (sizeSlider && sizeValue) {
            sizeSlider.addEventListener('input', (e) => {
                Utils.setTextContent('size-value', e.target.value);
                if (this.currentImage) this.debouncedPreview();
            });
        }
        
        // 其他参数滑块
        const paramSliders = [
            { id: 'quality-slider', valueId: 'quality-value', suffix: '%' },
            { id: 'brightness-slider', valueId: 'brightness-value', suffix: '' },
            { id: 'contrast-slider', valueId: 'contrast-value', suffix: '' },
            { id: 'saturation-slider', valueId: 'saturation-value', suffix: '' }
        ];
        
        paramSliders.forEach(({ id, valueId, suffix }) => {
            const slider = Utils.$(id);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    Utils.setTextContent(valueId, e.target.value + suffix);
                    if (this.currentImage) this.debouncedPreview();
                });
            }
        });
        
        // 抖动复选框
        const ditheringCheckbox = Utils.$('dithering-checkbox');
        if (ditheringCheckbox) {
            ditheringCheckbox.addEventListener('change', () => {
                if (this.currentImage) this.debouncedPreview();
            });
        }
    }
    
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        // 验证文件
        const validFiles = [];
        for (const file of files) {
            const validation = Utils.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                this.notifications.show(
                    `${file.name}: ${validation.errors.join(', ')}`, 
                    TOAST_TYPES.WARNING
                );
            }
        }
        
        if (validFiles.length === 0) {
            this.notifications.show('没有有效的图片文件', TOAST_TYPES.ERROR);
            return;
        }
        
        // 批量或单个处理
        if (validFiles.length > 1) {
            this.startBatchProcessing(validFiles);
        } else {
            await this.processSingleFile(validFiles[0]);
        }
    }
    
    async processSingleFile(file) {
        try {
            // 安全检查
            await this.security.safeExecute(async () => {
                const validation = Utils.validateFile(file);
                if (!validation.valid) {
                    throw new Error(validation.errors.join(', '));
                }
            }, 'file-validation');
            
            PerformanceMonitor.start('file-upload');
            this.progress.update(10, '读取文件...');
            
            const imageData = await this.security.safeExecute(
                () => this.loadImageFile(file), 
                'file-loading'
            );
            this.currentImage = imageData.canvas;
            
            this.progress.update(50, '显示预览...');
            this.displayPreview(imageData.canvas);
            
            this.progress.update(100, '上传完成');
            
            // 启用处理按钮
            const processBtn = Utils.$('process-btn');
            if (processBtn) processBtn.disabled = false;
            
            PerformanceMonitor.end('file-upload');
            this.notifications.show('图片上传成功！', TOAST_TYPES.SUCCESS);
            
        } catch (error) {
            const errorMsg = ErrorHandler.handle(error, '文件上传');
            this.notifications.show(errorMsg, TOAST_TYPES.ERROR);
        }
    }
    
    loadImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(img, 0, 0);
                    
                    resolve({ canvas, width: img.width, height: img.height, file });
                };
                
                img.onerror = () => reject(new Error(`图片加载失败: ${file.name}`));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error(`文件读取失败: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }
    
    displayPreview(canvas) {
        const previewCanvas = Utils.$('preview-canvas');
        const uploadPrompt = Utils.$('upload-prompt');
        
        if (previewCanvas) {
            previewCanvas.width = canvas.width;
            previewCanvas.height = canvas.height;
            
            const ctx = previewCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);
            
            Utils.showElement('preview-canvas');
            Utils.hideElement('upload-prompt');
        }
    }
    
    getProcessingOptions() {
        return {
            pixelSize: parseInt(Utils.$('size-slider')?.value || CONFIG.DEFAULT_PIXEL_SIZE),
            quality: parseInt(Utils.$('quality-slider')?.value || 80),
            brightness: parseInt(Utils.$('brightness-slider')?.value || 0),
            contrast: parseInt(Utils.$('contrast-slider')?.value || 0),
            saturation: parseInt(Utils.$('saturation-slider')?.value || 0),
            dithering: Utils.$('dithering-checkbox')?.checked || false
        };
    }
    
    async processImage() {
        if (!this.currentImage || this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            const processBtn = Utils.$('process-btn');
            if (processBtn) {
                processBtn.disabled = true;
                processBtn.textContent = 'Processing...';
            }
            
            // 安全的图像处理
            const options = this.getProcessingOptions();
            
            this.processedImage = await this.security.safeExecute(
                () => this.imageProcessor.processToPixelArt(
                    this.currentImage,
                    options,
                    (progress, status) => this.progress.update(progress, status)
                ),
                'image-processing'
            );
            
            this.displayProcessedImage();
            
            // 启用下载按钮
            const downloadBtn = Utils.$('download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                Utils.showElement('download-btn');
            }
            
            this.notifications.show('图片处理完成！', TOAST_TYPES.SUCCESS);
            
        } catch (error) {
            const errorMsg = ErrorHandler.handle(error, '图片处理');
            this.notifications.show(errorMsg, TOAST_TYPES.ERROR);
        } finally {
            this.isProcessing = false;
            const processBtn = Utils.$('process-btn');
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
        }
    }
    
    displayProcessedImage() {
        const outputCanvas = Utils.$('output-canvas');
        const previewCanvas = Utils.$('preview-canvas');
        
        if (outputCanvas && this.processedImage) {
            const options = this.getProcessingOptions();
            const scaledWidth = this.processedImage.width * options.pixelSize;
            const scaledHeight = this.processedImage.height * options.pixelSize;
            
            outputCanvas.width = scaledWidth;
            outputCanvas.height = scaledHeight;
            
            const ctx = outputCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.processedImage, 0, 0, scaledWidth, scaledHeight);
            
            Utils.hideElement('preview-canvas');
            Utils.showElement('output-canvas');
        }
    }
    
    async updatePreview() {
        if (!this.currentImage || this.isProcessing) return;
        
        try {
            const options = this.getProcessingOptions();
            const result = await this.imageProcessor.processToPixelArt(this.currentImage, options);
            
            this.processedImage = result;
            this.displayProcessedImage();
            
            // 启用下载按钮
            const downloadBtn = Utils.$('download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                Utils.showElement('download-btn');
            }
        } catch (error) {
            console.warn('预览更新失败:', error);
        }
    }
    
    downloadImage() {
        if (!this.processedImage) return;
        
        try {
            const options = this.getProcessingOptions();
            const canvas = document.createElement('canvas');
            const scaledWidth = this.processedImage.width * options.pixelSize;
            const scaledHeight = this.processedImage.height * options.pixelSize;
            
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.processedImage, 0, 0, scaledWidth, scaledHeight);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wplace-pixel-art-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.notifications.show('下载完成！', TOAST_TYPES.SUCCESS);
            });
        } catch (error) {
            const errorMsg = ErrorHandler.handle(error, '图片下载');
            this.notifications.show(errorMsg, TOAST_TYPES.ERROR);
        }
    }
    
    resetApp() {
        this.currentImage = null;
        this.processedImage = null;
        
        // 清理画布
        const previewCanvas = Utils.$('preview-canvas');
        const outputCanvas = Utils.$('output-canvas');
        
        if (previewCanvas) {
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            Utils.hideElement('preview-canvas');
        }
        
        if (outputCanvas) {
            const ctx = outputCanvas.getContext('2d');
            ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
            Utils.hideElement('output-canvas');
        }
        
        // 重置UI状态
        const processBtn = Utils.$('process-btn');
        const downloadBtn = Utils.$('download-btn');
        const fileInput = Utils.$('file-input');
        
        if (processBtn) processBtn.disabled = true;
        if (downloadBtn) {
            downloadBtn.disabled = true;
            Utils.hideElement('download-btn');
        }
        if (fileInput) fileInput.value = '';
        
        Utils.showElement('upload-prompt');
        this.progress.hide();
        
        this.notifications.show('已重置', TOAST_TYPES.INFO);
    }
    
    initializePalette() {
        const paletteContainer = Utils.$('paletteDisplay');
        if (!paletteContainer) return;
        
        paletteContainer.innerHTML = '';
        
        WPLACE_PALETTE.forEach((color, index) => {
            const colorDiv = document.createElement('button');
            colorDiv.className = `
                relative w-6 h-6 rounded-sm border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                cursor-pointer hover:scale-110 transition-transform
            `.trim();
            
            colorDiv.style.backgroundColor = color;
            colorDiv.style.minWidth = '24px';
            colorDiv.style.minHeight = '24px';
            colorDiv.title = `${color} ${index < CONFIG.FREE_COLORS_COUNT ? '(Free)' : '(Premium)'}`;
            
            // 付费颜色添加锁图标
            if (index >= CONFIG.FREE_COLORS_COUNT) {
                const lockIcon = document.createElement('span');
                lockIcon.className = 'absolute top-0 right-0 text-white text-xs leading-none';
                lockIcon.innerHTML = '🔒';
                lockIcon.style.fontSize = '8px';
                lockIcon.style.textShadow = '0 0 2px black';
                colorDiv.appendChild(lockIcon);
            }
            
            paletteContainer.appendChild(colorDiv);
        });
        
        console.log('✅ 调色板已初始化，共', WPLACE_PALETTE.length, '个颜色');
    }
    
    // 批量处理 (简化版本，详细实现可以后续扩展)
    startBatchProcessing(files) {
        this.notifications.show(
            `开始批量处理 ${files.length} 个文件`, 
            TOAST_TYPES.INFO
        );
        // TODO: 实现完整的批量处理UI和逻辑
    }
}