// Wplace Pixel Art Converter - 简化版本
// 无ES模块依赖，直接可用

console.log('🎨 Wplace 像素画转换器 - 简化版本加载中...');

// 全局变量
let currentImage = null;
let processedImage = null;
let isProcessing = false;
let batchQueue = [];
let batchResults = [];

// Wplace 64色调色板 (基于官方调色板)
const WPLACE_PALETTE = [
    // 免费颜色 (0-31)
    '#FFFFFF', '#E4E4E4', '#888888', '#222222', '#FFA7D1', '#E50000',
    '#E59500', '#A06A42', '#E5D900', '#94E044', '#02BE01', '#00D3DD',
    '#0083C7', '#0000EA', '#CF6EE4', '#820080', '#000000', '#434343',
    '#6D001A', '#BF4F36', '#FF6A00', '#FFD635', '#FFF8B8', '#006A4E',
    '#8BBE6A', '#C2FFAE', '#94B3FF', '#76428A', '#AC3232', '#D0743C',
    '#FF8717', '#FFAAA5',
    
    // 付费颜色 (32-63) 
    '#FFE135', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#CCFF90',
    '#00A368', '#00CCC0', '#009EAA', '#51E9F4', '#3690EA', '#6A5CFF',
    '#B44AC0', '#FF3881', '#FF99AA', '#FFAEB9', '#FF5650', '#FF9A00',
    '#D2B48C', '#FFFA00', '#CDEB8B', '#6EFF00', '#B4E6E0', '#00BFFF',
    '#4690E7', '#B19CD9', '#FF007F', '#FFCC99', '#FFA500', '#E5C29F',
    '#FFFF7F', '#CDEB8B'
];

// 工具函数
function $(id) {
    return document.getElementById(id);
}

function showElement(id) {
    const el = $(id);
    if (el) el.classList.remove('hidden');
}

function hideElement(id) {
    const el = $(id);
    if (el) el.classList.add('hidden');
}

function setProgress(value, text) {
    const container = $('progress-bar');
    const indicator = $('progress-indicator');
    const textEl = $('progress-text');
    
    if (value > 0 && container) {
        container.classList.remove('hidden');
    }
    
    if (indicator) {
        indicator.style.width = value + '%';
    }
    
    if (textEl) {
        textEl.textContent = text || Math.round(value) + '%';
    }
    
    if (value >= 100) {
        setTimeout(() => {
            if (container) container.classList.add('hidden');
        }, 2000);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    
    // 颜色映射
    const colors = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    const bgColor = colors[type] || colors['info'];
    
    toast.className = `toast toast-${type} fixed top-4 left-1/2 transform -translate-x-1/2 z-40 ${bgColor} text-white px-4 py-2 rounded shadow-lg transition-all duration-300 max-w-md text-center`;
    toast.textContent = message;
    
    // 初始样式
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    
    document.body.appendChild(toast);
    
    // 淡入动画
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 图像调整函数
function applyImageAdjustments(data, brightness, contrast, saturation) {
    const brightnessAdjust = brightness / 100;
    const contrastAdjust = (contrast + 100) / 100;
    const saturationAdjust = saturation / 100;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // 应用亮度调整
        r += brightnessAdjust * 255;
        g += brightnessAdjust * 255;
        b += brightnessAdjust * 255;
        
        // 应用对比度调整
        r = ((r / 255 - 0.5) * contrastAdjust + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrastAdjust + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrastAdjust + 0.5) * 255;
        
        // 应用饱和度调整
        if (saturationAdjust !== 0) {
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = gray + (r - gray) * (1 + saturationAdjust);
            g = gray + (g - gray) * (1 + saturationAdjust);
            b = gray + (b - gray) * (1 + saturationAdjust);
        }
        
        // 限制颜色值范围
        data[i] = Math.max(0, Math.min(255, Math.round(r)));
        data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
        data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
}

// 颜色匹配函数
function getClosestColor(r, g, b) {
    let minDistance = Infinity;
    let closestColor = WPLACE_PALETTE[0];
    
    for (const color of WPLACE_PALETTE) {
        const hex = color.slice(1);
        const pr = parseInt(hex.slice(0, 2), 16);
        const pg = parseInt(hex.slice(2, 4), 16);
        const pb = parseInt(hex.slice(4, 6), 16);
        
        const distance = Math.sqrt(
            Math.pow(r - pr, 2) + 
            Math.pow(g - pg, 2) + 
            Math.pow(b - pb, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    
    return closestColor;
}

// 图片处理函数 - 支持高级参数
function processImageToPixelArt(canvas, options = {}) {
    const pixelSize = options.pixelSize || 8;
    const brightness = options.brightness || 0;
    const contrast = options.contrast || 0;
    const saturation = options.saturation || 0;
    const useDithering = options.dithering || false;
    
    return new Promise((resolve) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 应用图像调整
        applyImageAdjustments(data, brightness, contrast, saturation);
        
        // 创建输出画布
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d');
        
        const newWidth = Math.ceil(canvas.width / pixelSize);
        const newHeight = Math.ceil(canvas.height / pixelSize);
        
        outputCanvas.width = newWidth;
        outputCanvas.height = newHeight;
        
        // 处理每个像素块
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                
                // 计算平均颜色
                for (let dy = 0; dy < pixelSize; dy++) {
                    for (let dx = 0; dx < pixelSize; dx++) {
                        const px = x * pixelSize + dx;
                        const py = y * pixelSize + dy;
                        
                        if (px < canvas.width && py < canvas.height) {
                            const i = (py * canvas.width + px) * 4;
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
                    
                    const closestColor = getClosestColor(r, g, b);
                    outputCtx.fillStyle = closestColor;
                    outputCtx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        resolve(outputCanvas);
    });
}

// 文件上传处理 - 支持单个或批量
function handleFileUpload(files) {
    // 如果传入的是单个文件，转换为数组
    if (!Array.isArray(files)) {
        files = [files];
    }
    
    // 验证所有文件
    const validFiles = [];
    for (const file of files) {
        console.log('处理文件上传:', file.name);
        
        if (!file.type.startsWith('image/')) {
            showToast(`跳过非图片文件: ${file.name}`, 'warning');
            continue;
        }
        
        if (file.size > 4 * 1024 * 1024) { // 4MB
            showToast(`文件过大，跳过: ${file.name} (超过4MB)`, 'warning');
            continue;
        }
        
        validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
        showToast('没有找到有效的图片文件', 'error');
        return;
    }
    
    // 如果是多个文件，启动批量处理
    if (validFiles.length > 1) {
        startBatchProcessing(validFiles);
        return;
    }
    
    // 单个文件处理
    const file = validFiles[0];
    
    setProgress(10, '读取图片...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            setProgress(30, '加载图片...');
            
            // 创建画布
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            
            currentImage = canvas;
            
            // 显示预览
            const previewCanvas = $('preview-canvas');
            
            if (previewCanvas) {
                previewCanvas.width = img.width;
                previewCanvas.height = img.height;
                const previewCtx = previewCanvas.getContext('2d');
                previewCtx.drawImage(img, 0, 0);
                
                showElement('preview-canvas');
                hideElement('upload-prompt');
                
                console.log('✅ 图片预览已显示，尺寸:', img.width, 'x', img.height);
            } else {
                console.error('❌ 找不到预览画布元素 preview-canvas');
            }
            
            // 图片信息显示已移除
            
            // 启用处理按钮
            const processBtn = $('process-btn');
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
            
            setProgress(100, '上传完成');
            showToast('图片上传成功！', 'success');
            
        };
        img.onerror = function() {
            showToast('图片加载失败', 'error');
            setProgress(0, '');
        };
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showToast('文件读取失败', 'error');
        setProgress(0, '');
    };
    
    reader.readAsDataURL(file);
}

// 处理图片
function processImage() {
    if (!currentImage || isProcessing) return;
    
    isProcessing = true;
    console.log('开始处理图片...');
    
    const processBtn = $('process-btn');
    if (processBtn) {
        processBtn.disabled = true;
        processBtn.textContent = 'Processing...';
    }
    
    setProgress(10, '初始化处理...');
    
    // 获取参数
    const options = getProcessingOptions();
    
    setProgress(30, '处理像素化...');
    
    // 异步处理避免阻塞UI
    setTimeout(() => {
        processImageToPixelArt(currentImage, options).then(result => {
            processedImage = result;
            
            setProgress(80, '生成预览...');
            
            // 显示结果
            const outputCanvas = $('output-canvas');
            if (outputCanvas) {
                const pixelSize = options.pixelSize || 8;
                outputCanvas.width = result.width * pixelSize;
                outputCanvas.height = result.height * pixelSize;
                
                const ctx = outputCanvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(result, 0, 0, outputCanvas.width, outputCanvas.height);
                
                hideElement('preview-canvas');
                showElement('output-canvas');
            }
            
            // 启用下载按钮
            const downloadBtn = $('download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('hidden');
            }
            
            setProgress(100, '处理完成');
            showToast('图片处理完成！', 'success');
            
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
            
            isProcessing = false;
            
        }).catch(error => {
            console.error('处理失败:', error);
            showToast('处理失败: ' + error.message, 'error');
            setProgress(0, '');
            
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
            
            isProcessing = false;
        });
    }, 100);
}

// 获取处理参数
function getProcessingOptions() {
    return {
        pixelSize: parseInt($('size-slider')?.value || '8'),
        quality: parseInt($('quality-slider')?.value || '80'),
        brightness: parseInt($('brightness-slider')?.value || '0'),
        contrast: parseInt($('contrast-slider')?.value || '0'),
        saturation: parseInt($('saturation-slider')?.value || '0'),
        dithering: $('dithering-checkbox')?.checked || false
    };
}

// 下载图片
function downloadImage() {
    if (!processedImage) return;
    
    const options = getProcessingOptions();
    const pixelSize = options.pixelSize;
    
    // 创建高分辨率版本
    const canvas = document.createElement('canvas');
    canvas.width = processedImage.width * pixelSize;
    canvas.height = processedImage.height * pixelSize;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(processedImage, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wplace-pixel-art-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('下载完成！', 'success');
    });
}

// 防抖预览函数
let previewTimeout;
function debouncePreview() {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
        if (currentImage) {
            const options = getProcessingOptions();
            processImageToPixelArt(currentImage, options).then(result => {
                const outputCanvas = $('output-canvas');
                if (outputCanvas) {
                    const pixelSize = options.pixelSize || 8;
                    outputCanvas.width = result.width * pixelSize;
                    outputCanvas.height = result.height * pixelSize;
                    
                    const ctx = outputCanvas.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(result, 0, 0, outputCanvas.width, outputCanvas.height);
                    
                    hideElement('preview-canvas');
                    showElement('output-canvas');
                }
                
                // 更新处理结果
                processedImage = result;
                
                // 启用下载按钮
                const downloadBtn = $('download-btn');
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('hidden');
                }
            });
        }
    }, 300); // 300ms防抖延迟
}

// 批量处理功能
function startBatchProcessing(files) {
    batchQueue = files;
    batchResults = [];
    
    console.log(`开始批量处理 ${files.length} 个文件`);
    showToast(`开始批量处理 ${files.length} 个文件`, 'info');
    
    // 创建批量处理UI
    createBatchProcessingUI();
    
    // 开始处理
    processBatchQueue();
}

function createBatchProcessingUI() {
    // 创建批量处理面板
    const existingPanel = $('batch-processing-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'batch-processing-panel';
    panel.className = 'fixed top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4';
    panel.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-gray-800">批量处理</h3>
            <button id="batch-close-btn" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div class="space-y-2">
            <div class="text-sm text-gray-600">
                总计: <span id="batch-total">0</span> 个文件
            </div>
            <div class="text-sm text-gray-600">
                已处理: <span id="batch-completed">0</span> 个
            </div>
            <div class="text-sm text-gray-600">
                当前: <span id="batch-current">-</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div id="batch-progress" class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
            </div>
            <div id="batch-file-list" class="max-h-40 overflow-y-auto text-xs space-y-1"></div>
        </div>
        <div class="mt-3 flex space-x-2">
            <button id="batch-download-all-btn" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50" disabled>
                下载全部
            </button>
            <button id="batch-cancel-btn" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                取消
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // 绑定事件
    $('batch-close-btn').addEventListener('click', closeBatchProcessing);
    $('batch-cancel-btn').addEventListener('click', cancelBatchProcessing);
    $('batch-download-all-btn').addEventListener('click', downloadAllBatchResults);
    
    // 初始化UI
    $('batch-total').textContent = batchQueue.length;
    updateBatchFileList();
}

function updateBatchFileList() {
    const listContainer = $('batch-file-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    batchQueue.forEach((file, index) => {
        const fileItem = document.createElement('div');
        const result = batchResults.find(r => r.originalIndex === index);
        let status = '等待中...';
        let statusClass = 'text-gray-500';
        
        if (result) {
            if (result.success) {
                status = '✓ 完成';
                statusClass = 'text-green-600';
            } else {
                status = '✗ 失败';
                statusClass = 'text-red-600';
            }
        } else if (index === batchQueue.findIndex(f => f === getCurrentProcessingFile())) {
            status = '处理中...';
            statusClass = 'text-blue-600';
        }
        
        fileItem.className = `flex justify-between items-center p-1 ${statusClass}`;
        fileItem.innerHTML = `
            <span class="truncate flex-1">${file.name}</span>
            <span class="text-xs">${status}</span>
        `;
        
        listContainer.appendChild(fileItem);
    });
}

function getCurrentProcessingFile() {
    const completedCount = batchResults.length;
    return batchQueue[completedCount];
}

async function processBatchQueue() {
    if (batchQueue.length === 0) {
        finishBatchProcessing();
        return;
    }
    
    const totalFiles = batchQueue.length;
    
    for (let i = 0; i < totalFiles; i++) {
        const file = batchQueue[i];
        updateBatchProgress(i, totalFiles, file.name);
        
        try {
            const result = await processSingleFileForBatch(file, i);
            batchResults.push(result);
            
            updateBatchFileList();
            $('batch-completed').textContent = batchResults.length;
            
        } catch (error) {
            console.error(`批量处理失败 - ${file.name}:`, error);
            batchResults.push({
                originalIndex: i,
                filename: file.name,
                success: false,
                error: error.message
            });
        }
        
        // 小延迟避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    finishBatchProcessing();
}

async function processSingleFileForBatch(file, index) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                // 创建画布
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0);
                
                // 获取处理参数
                const options = getProcessingOptions();
                
                // 处理图片
                processImageToPixelArt(canvas, options).then(result => {
                    resolve({
                        originalIndex: index,
                        filename: file.name,
                        success: true,
                        canvas: result,
                        processedCanvas: createScaledCanvas(result, options.pixelSize || 8)
                    });
                }).catch(error => {
                    reject(error);
                });
            };
            
            img.onerror = () => reject(new Error(`图片加载失败: ${file.name}`));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error(`文件读取失败: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

function createScaledCanvas(sourceCanvas, pixelSize) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = sourceCanvas.width * pixelSize;
    scaledCanvas.height = sourceCanvas.height * pixelSize;
    
    const ctx = scaledCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    
    return scaledCanvas;
}

function updateBatchProgress(current, total, filename) {
    const percentage = Math.round((current / total) * 100);
    
    const progressBar = $('batch-progress');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    const currentLabel = $('batch-current');
    if (currentLabel) {
        currentLabel.textContent = filename;
    }
}

function finishBatchProcessing() {
    const successCount = batchResults.filter(r => r.success).length;
    const totalCount = batchQueue.length;
    
    updateBatchProgress(totalCount, totalCount, '完成');
    
    showToast(`批量处理完成！成功: ${successCount}/${totalCount}`, 
               successCount === totalCount ? 'success' : 'warning');
    
    // 启用下载按钮
    const downloadBtn = $('batch-download-all-btn');
    if (downloadBtn) {
        downloadBtn.disabled = successCount === 0;
    }
    
    console.log(`批量处理完成 - 成功: ${successCount}, 失败: ${totalCount - successCount}`);
}

function downloadAllBatchResults() {
    const successfulResults = batchResults.filter(r => r.success);
    
    if (successfulResults.length === 0) {
        showToast('没有可下载的处理结果', 'error');
        return;
    }
    
    // 创建ZIP文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    
    // 依次下载所有文件
    successfulResults.forEach((result, index) => {
        setTimeout(() => {
            const filename = result.filename.replace(/\.[^/.]+$/, '') + '_pixelart.png';
            
            result.processedCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }, index * 500); // 500ms间隔避免同时下载
    });
    
    showToast(`开始下载 ${successfulResults.length} 个文件`, 'success');
}

function cancelBatchProcessing() {
    // 停止处理
    batchQueue = [];
    closeBatchProcessing();
    showToast('批量处理已取消', 'info');
}

function closeBatchProcessing() {
    const panel = $('batch-processing-panel');
    if (panel) {
        panel.remove();
    }
    
    // 清理状态
    batchQueue = [];
    batchResults = [];
}

// 重置
function resetApp() {
    currentImage = null;
    processedImage = null;
    
    const previewCanvas = $('preview-canvas');
    const outputCanvas = $('output-canvas');
    const fileInput = $('file-input');
    const processBtn = $('process-btn');
    const downloadBtn = $('download-btn');
    if (previewCanvas) {
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        hideElement('preview-canvas');
    }
    
    if (outputCanvas) {
        const ctx = outputCanvas.getContext('2d');
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        hideElement('output-canvas');
    }
    
    if (fileInput) fileInput.value = '';
    if (processBtn) {
        processBtn.disabled = true;
        processBtn.textContent = 'Process';
    }
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('hidden');
    }
    
    showElement('upload-prompt');
    setProgress(0, '');
    showToast('已重置', 'info');
}

// 初始化调色板显示
function initializePaletteDisplay() {
    const paletteContainer = $('paletteDisplay');
    if (!paletteContainer) {
        console.error('❌ 找不到调色板容器 paletteDisplay');
        return;
    }
    
    console.log('🎨 正在初始化调色板，颜色数量:', WPLACE_PALETTE.length);
    paletteContainer.innerHTML = '';
    
    // 标记哪些颜色是免费/付费的
    const freeColors = WPLACE_PALETTE.slice(0, 32); // 前32个是免费的
    const premiumColors = WPLACE_PALETTE.slice(32); // 后32个是付费的
    
    WPLACE_PALETTE.forEach((color, index) => {
        const colorDiv = document.createElement('button');
        colorDiv.className = 'relative w-6 h-6 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:scale-110 transition-transform';
        colorDiv.style.backgroundColor = color;
        colorDiv.style.minWidth = '24px';
        colorDiv.style.minHeight = '24px';
        colorDiv.title = `${color} ${index < 32 ? '(Free)' : '(Premium)'}`;
        
        // 如果是付费颜色，添加锁图标
        if (index >= 32) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'absolute top-0 right-0 text-white text-xs leading-none';
            lockIcon.innerHTML = '🔒';
            lockIcon.style.fontSize = '8px';
            lockIcon.style.textShadow = '0 0 2px black';
            colorDiv.appendChild(lockIcon);
        }
        
        // 添加点击事件（可以扩展为颜色选择功能）
        colorDiv.addEventListener('click', () => {
            console.log('选择颜色:', color, index < 32 ? '(Free)' : '(Premium)');
        });
        
        paletteContainer.appendChild(colorDiv);
    });
    
    console.log('✅ 调色板显示已初始化，共', WPLACE_PALETTE.length, '个颜色');
    console.log('调色板容器子元素数量:', paletteContainer.children.length);
}

// 初始化应用
function initApp() {
    console.log('🚀 初始化应用...');
    
    // 绑定上传区域点击事件
    const uploadArea = $('uploadArea');
    const fileInput = $('file-input');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                handleFileUpload(files);
            }
        });
        
        // 拖放支持
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                handleFileUpload(imageFiles);
            } else {
                showToast('没有找到图片文件', 'error');
            }
        });
        
        console.log('✅ 上传功能已绑定');
    } else {
        console.error('❌ 找不到上传元素');
    }
    
    // 绑定按钮事件
    const processBtn = $('process-btn');
    if (processBtn) {
        processBtn.addEventListener('click', processImage);
        processBtn.disabled = true;
    }
    
    const downloadBtn = $('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadImage);
        downloadBtn.disabled = true;
        downloadBtn.classList.add('hidden');
    }
    
    const resetBtn = $('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetApp);
    }
    
    // 绑定滑块事件
    const sizeSlider = $('size-slider');
    const sizeValue = $('size-value');
    if (sizeSlider && sizeValue) {
        sizeSlider.addEventListener('input', () => {
            sizeValue.textContent = sizeSlider.value;
            
            // 如果有图片已上传，实时预览像素化效果
            if (currentImage) {
                debouncePreview();
            }
        });
    }
    
    // 绑定其他滑块的显示更新和实时预览
    const sliders = [
        { id: 'quality-slider', valueId: 'quality-value', suffix: '%' },
        { id: 'brightness-slider', valueId: 'brightness-value', suffix: '' },
        { id: 'contrast-slider', valueId: 'contrast-value', suffix: '' },
        { id: 'saturation-slider', valueId: 'saturation-value', suffix: '' }
    ];
    
    sliders.forEach(({ id, valueId, suffix }) => {
        const slider = $(id);
        const valueDisplay = $(valueId);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value + suffix;
                
                // 如果有图片已上传，实时预览效果
                if (currentImage) {
                    debouncePreview();
                }
            });
        }
    });
    
    // 为抖动复选框添加预览更新
    const ditheringCheckbox = $('dithering-checkbox');
    if (ditheringCheckbox) {
        ditheringCheckbox.addEventListener('change', () => {
            if (currentImage) {
                debouncePreview();
            }
        });
    }
    
    // 绑定Advanced Settings展开/收起
    const advancedSettingsButton = $('advancedSettingsButton');
    const advancedSettingsContent = $('advancedSettingsContent');
    const advancedSettingsIcon = $('advancedSettingsIcon');
    
    if (advancedSettingsButton && advancedSettingsContent) {
        advancedSettingsButton.addEventListener('click', () => {
            const isHidden = advancedSettingsContent.classList.contains('hidden');
            
            if (isHidden) {
                // 展开
                advancedSettingsContent.classList.remove('hidden');
                if (advancedSettingsIcon) {
                    advancedSettingsIcon.style.transform = 'rotate(180deg)';
                }
            } else {
                // 收起
                advancedSettingsContent.classList.add('hidden');
                if (advancedSettingsIcon) {
                    advancedSettingsIcon.style.transform = 'rotate(0deg)';
                }
            }
        });
        
        console.log('✅ Advanced Settings 功能已绑定');
    }
    
    // 初始化调色板显示
    initializePaletteDisplay();
    
    console.log('✅ 应用初始化完成！');
    showToast('Wplace 像素画转换器已准备就绪！', 'success');
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 使全局可访问用于调试
window.wplaceApp = {
    currentImage,
    processedImage,
    isProcessing,
    handleFileUpload,
    processImage,
    downloadImage,
    resetApp
};

console.log('📱 简化版本加载完成！');