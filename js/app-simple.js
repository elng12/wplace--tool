// Wplace Pixel Art Converter - 简化版本
// 无ES模块依赖，直接可用

console.log('🎨 Wplace 像素画转换器 - 简化版本加载中...');

// 全局变量
let currentImage = null;
let processedImage = null;
let isProcessing = false;
let batchQueue = [];
let batchResults = [];
let i18nManager = null;

// 当前语言翻译数据
const translations = {
    en: {},
    zh: {}
};

// 当前语言
let currentLanguage = 'en';

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
    console.log('📤 handleFileUpload被调用');
    console.log('   传入参数类型:', typeof files);
    console.log('   传入参数:', files);
    
    // 如果传入的是单个文件，转换为数组
    if (!Array.isArray(files)) {
        console.log('   转换为数组');
        files = [files];
    }
    console.log('   文件数量:', files.length);
    
    // 验证所有文件
    console.log('🔍 开始验证文件');
    const validFiles = [];
    for (const file of files) {
        console.log(`   验证文件: ${file.name}`);
        console.log(`     类型: ${file.type}`);
        console.log(`     大小: ${file.size} bytes`);
        
        if (!file.type.startsWith('image/')) {
            console.warn(`     ⚠️ 跳过非图片文件: ${file.name}`);
            showToast(`跳过非图片文件: ${file.name}`, 'warning');
            continue;
        }
        
        if (file.size > 4 * 1024 * 1024) { // 4MB
            console.warn(`     ⚠️ 文件过大，跳过: ${file.name} (超过4MB)`);
            showToast(`文件过大，跳过: ${file.name} (超过4MB)`, 'warning');
            continue;
        }
        
        console.log(`     ✅ 文件验证通过: ${file.name}`);
        validFiles.push(file);
    }
    
    console.log(`📊 有效文件数量: ${validFiles.length}`);
    
    if (validFiles.length === 0) {
        console.error('❌ 没有找到有效的图片文件');
        showToast('没有找到有效的图片文件', 'error');
        return;
    }
    
    // 如果是多个文件，启动批量处理
    if (validFiles.length > 1) {
        console.log('📦 检测到多个文件，启动批量处理');
        startBatchProcessing(validFiles);
        return;
    }
    
    // 单个文件处理
    const file = validFiles[0];
    console.log('📄 处理单个文件:', file.name);
    
    setProgress(10, '读取图片...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('📖 FileReader.onload触发');
        console.log('   结果类型:', typeof e.target.result);
        console.log('   结果长度:', e.target.result ? e.target.result.length : 'null');
        
        const img = new Image();
        console.log('🏋️ 创建Image对象');
        
        img.onload = function() {
            console.log('🌆 Image.onload触发');
            console.log('   图片尺寸:', img.width, 'x', img.height);
            
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
            console.log('✅ 图片上传处理完成');
        };
        
        img.onerror = function(err) {
            console.error('❌ Image加载失败:', err);
            showToast('图片加载失败', 'error');
            setProgress(0, '');
        };
        
        console.log('🔗 设置Image.src');
        img.src = e.target.result;
    };
    
    reader.onerror = function(err) {
        console.error('❌ FileReader读取失败:', err);
        showToast('文件读取失败', 'error');
        setProgress(0, '');
    };
    
    console.log('📖 开始读取文件:', file.name, 'size:', file.size, 'type:', file.type);
    reader.readAsDataURL(file);
    console.log('📖 readAsDataURL已调用');
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
    console.log('📍 当前页面URL:', window.location.href);
    console.log('📍 当前页面文件:', window.location.pathname);
    
    // 绑定上传区域点击事件
    const uploadArea = $('uploadArea');
    const fileInput = $('fileInput');
    console.log('🔍 查找uploadArea元素:', uploadArea ? '找到' : '未找到', uploadArea);
    console.log('🔍 查找fileInput元素:', fileInput ? '找到' : '未找到', fileInput);
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            console.log('🖱️ uploadArea被点击');
            fileInput.click();
            console.log('📂 触发fileInput点击');
        });
        
        fileInput.addEventListener('change', (e) => {
            console.log('📁 fileInput change事件触发');
            const files = Array.from(e.target.files);
            console.log('📁 选择的文件数量:', files.length);
            console.log('📁 文件详情:', files.map(f => ({name: f.name, type: f.type, size: f.size})));
            if (files.length > 0) {
                console.log('📤 准备处理文件上传');
                handleFileUpload(files);
            } else {
                console.log('⚠️ 没有选择文件');
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
        console.error('   uploadArea:', uploadArea);
        console.error('   fileInput:', fileInput);
        console.error('   页面所有ID元素:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
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

// 国际化相关功能
function loadTranslations() {
    // 直接使用内嵌翻译数据，避免CORS问题
    translations.en = {
        "title": "Wplace Paint Tool: The Ultimate Pixel Toolkit to Dominate the Canvas",
        "subtitle": "Designed for creative players on wplace.live, this ultimate toolkit lets you dominate the canvas with ease. Our core feature converts any image to pixel art, automatically matching the official color palette to bring your vision to life. It also includes efficient scripts and professional planning tools to fully enhance your gameplay. Join now, unlock vast resources, and start creating stunning artwork.",
        "nav.home": "Home",
        "nav.blog": "Blog",
        "nav.about": "About", 
        "nav.privacy": "Privacy",
        "nav.terms": "Terms",
        "upload.main": "Click to upload or drag image here",
        "upload.sub": "Supports PNG, JPG formats (max 4MB)",
        "pixel.size": "Pixel Size",
        "pixel.desc": "Real-time preview as you adjust the slider",
        "advanced.title": "Advanced Settings",
        "advanced.dithering": "Enable Floyd-Steinberg Dithering",
        "advanced.scaling": "Image Scaling Method:",
        "advanced.grid": "Show Pixel Grid",
        "scaling.nearest": "Nearest Neighbor",
        "scaling.bilinear": "Bilinear", 
        "scaling.lanczos": "Lanczos",
        "preview.title": "Wplace Pixel Art Result",
        "preview.prompt": "Please upload an image to start",
        "btn.download": "Download",
        "used.colors.title": "Colors Used in This Image",
        "used.colors.total": "Total",
        "used.colors.free": "Free",
        "used.colors.premium": "Premium",
        "palette.title": "Wplace 64-Color Palette",
        "palette.free": "Free (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Official Wplace color palette",
        "loading": "Processing...",
        "features.special.title": "What Makes Our Wplace Image Converter Special?",
        "features.title": "Why Choose Wplace Pixel Art Converter?",
        "features.subtitle": "The ultimate tool to create Wplace-compatible pixel art",
        "features.free.title": "100% Free Converter",
        "features.free.desc": "Wplace Pixel Art Converter is completely free. No hidden costs, no subscriptions. Convert unlimited images instantly.",
        "features.privacy.title": "Privacy Protected", 
        "features.privacy.desc": "All processing happens in your browser. Your images never leave your device with Wplace Pixel Art Converter.",
        "features.easy.title": "Simple & Fast",
        "features.easy.desc": "Intuitive interface makes pixel art creation easy for everyone. No technical skills required.",
        "features.unlimited.title": "Any Image Size",
        "features.unlimited.desc": "Upload images of any size. Wplace Pixel Art Converter handles everything efficiently.",
        
        // Features section (detailed)
        "features.subtitle.desc": "Transform any image into stunning pixel art designed for Wplace",
        "features.free.detailed.title": "Completely Free Tool",
        "features.free.detailed.desc": "Our Wplace pixel art creator costs nothing to use. No subscriptions, no hidden fees, no limits on conversions. Create as much pixel art as you want.",
        "features.privacy.detailed.desc": "Everything happens locally in your browser. Your images stay on your device - we never upload, store, or access your content.",
        "features.easy.detailed.title": "Effortless Conversion",
        "features.easy.detailed.desc": "No complex settings or technical knowledge needed. Just upload your image and watch it transform into beautiful pixel art instantly.",
        "features.unlimited.detailed.title": "Any Size Welcome",
        "features.unlimited.detailed.desc": "From tiny icons to massive artworks - our converter processes images of any dimension. No file size restrictions or quality compromises.",
        
        // How to use section
        "howto.title": "How to Use Wplace Paint Tool",
        "howto.subtitle": "Convert images to pixel art in 4 simple steps",
        "howto.step1.title": "Upload Your Image",
        "howto.step1.desc": "Click the upload area or drag and drop your PNG, JPG, or SVG file. Our converter supports all common image formats.",
        "howto.step2.title": "Adjust Pixel Size",
        "howto.step2.desc": "Use the slider to control the pixel size. Smaller values create more detailed art, larger values produce chunky, abstract pixel art.",
        "howto.step3.title": "Convert to Pixel Art",
        "howto.step3.desc": "Watch your image transform into stunning pixel art using our advanced converter technology. Preview updates in real-time.",
        "howto.step4.title": "Download Your Creation",
        "howto.step4.desc": "Choose between small pixel perfect or large scale versions. Your pixel art is ready to use on Wplace!",
        
        // FAQ section
        "faq.title": "Frequently Asked Questions",
        "faq.subtitle": "Everything you need to know about our Wplace Paint Tool",
        "faq.q1": "What makes this Wplace Tool different from other pixel art converters?",
        "faq.a1": "Our Wplace Tool is specifically designed for the Wplace community and uses the official 64-color palette from wplace.org. Unlike generic pixel art converters, this tool ensures perfect color compatibility with the Wplace platform. The Wplace Tool features advanced algorithms that automatically match your images to the exact colors available on Wplace, eliminating guesswork and ensuring your artwork will display correctly when uploaded to the platform.",
        "faq.q2": "Is the Wplace Tool completely free to use?",
        "faq.a2": "Yes, our Wplace Tool is completely free with no hidden costs, subscriptions, or usage limits. We believe every Wplace player should have access to professional-quality pixel art conversion tools. The Wplace Tool processes everything locally in your browser, which means we don't have server costs to maintain, allowing us to offer this service at no charge. You can convert unlimited images and download them without any watermarks or restrictions.",
        "faq.q3": "How does the Wplace Tool ensure my privacy and data security?",
        "faq.a3": "Privacy is a core feature of our Wplace Tool. All image processing happens entirely within your browser using client-side JavaScript technology. Your images never leave your device - they are not uploaded to our servers, stored in databases, or transmitted anywhere. The Wplace Tool works offline once loaded, and we cannot access, view, or collect any of your images. This local processing approach ensures complete privacy while delivering fast, secure pixel art conversion for Wplace players.",
        "faq.q4": "What image formats and sizes does the Wplace Tool support?",
        "faq.a4": "The Wplace Tool accepts all standard image formats including PNG, JPG, JPEG, and supports images of virtually any size. Whether you're working with small icons or large artwork, our tool can handle it efficiently. The Wplace Tool automatically optimizes processing based on your image size and selected pixel density. For best results with the Wplace Tool, we recommend using high-quality source images, as the tool will preserve and enhance the details that matter most for pixel art creation.",
        "faq.q5": "Can I adjust the pixel size and quality settings in the Wplace Tool?",
        "faq.a5": "Absolutely! The Wplace Tool offers comprehensive customization options. You can adjust pixel sizes from 1 to 32, with smaller values creating more detailed artwork and larger values producing bold, abstract designs. The tool includes advanced features like Floyd-Steinberg dithering for smoother color transitions, multiple scaling algorithms (Nearest Neighbor, Bilinear, and Lanczos), and grid overlay options. These professional-grade features make our Wplace Tool suitable for both beginners and experienced digital artists working on Wplace projects.",
        "faq.q6": "How do I use my converted pixel art on the actual Wplace platform?",
        "faq.a6": "After creating your pixel art with our Wplace Tool, simply download the converted image and use it as a reference when placing pixels on wplace.org. The tool shows you exactly which colors from the official Wplace palette to use, and you can enable the grid overlay to see precise pixel placement coordinates. Many Wplace players use our Wplace Tool to plan their artwork before starting, as it eliminates trial and error and helps coordinate team projects. The color-matched output ensures your vision translates perfectly to the collaborative canvas.",
        
        // 导航和控制
        "nav.converter": "Converter",
        "controls.quality": "Quality",
        "controls.brightness": "Brightness", 
        "controls.contrast": "Contrast",
        "controls.saturation": "Saturation",
        "controls.color_palette": "Color Palette:",
        "lang.english": "English",
        
        // 用户评价
        "testimonials.title": "What Users Say About Wplace Paint Tool",
        "testimonials.subtitle": "Real feedback from creators using Wplace Paint Tool",
        "testimonials.user1.name": "Alex_Pixels",
        "testimonials.user1.role": "Wplace Veteran Player",
        "testimonials.user1.quote": "This Wplace Tool has completely transformed how I approach pixel art on the platform. Before discovering this converter, I spent hours manually converting images with color mismatches. Now I can upload any image and instantly see how it will look with the official palette.",
        "testimonials.user2.name": "DigitalDave", 
        "testimonials.user2.role": "Wplace Strategist",
        "testimonials.user2.quote": "This wplace tool has become my secret weapon for creating strategic artwork on the platform. The speed and accuracy allow me to quickly test different design concepts before committing pixels on the actual canvas.",
        "testimonials.user3.name": "Luna_Creative",
        "testimonials.user3.role": "Art Community Moderator",
        "testimonials.user3.quote": "I recommend this wplace tool to every new player joining our community. The learning curve for pixel art can be steep, but this wplace tool makes it accessible to everyone. The real-time preview feature helps users understand how their artwork will appear before placing pixels.",
        
        // 统计数据
        "stats.images": "Images converted with our wplace tool",
        "stats.users": "Active users of the wplace tool",
        "stats.satisfaction": "Satisfaction rate with our wplace tool",
        
        // 页脚
        "footer.title": "About Wplace Paint Tool",
        "footer.nav.converter": "Wplace Color Converter",
        "footer.disclaimer.title": "Independent Fan Site",
        "footer.disclaimer.text": "This website is an independent, fan-run project built to serve the community's pixel art needs. We are not connected with, sponsored by, or approved by the official Wplace platform. Made by fans for fans, this Wplace Tool aims to make pixel creation easier and more enjoyable.",
        "footer.copyright": "© 2025 Wplace Paint Tool - Help Wplace Player Paint Easily - Free to use, no ownership claimed on generated artwork"
    };
    
    translations.zh = {
        "title": "Wplace 像素画工具：终极像素工具包，轻松征服画布",
        "subtitle": "专为 wplace.live 上的创意玩家设计，这个终极工具包让您轻松征服画布。我们的核心功能将任何图像转换为像素艺术，自动匹配官方调色板，将您的创意变为现实。还包括高效脚本和专业规划工具，全面增强您的游戏体验。立即加入，解锁丰富资源，开始创作令人惊艳的艺术作品。",
        "nav.home": "首页",
        "nav.blog": "博客",
        "nav.about": "关于",
        "nav.privacy": "隐私政策", 
        "nav.terms": "服务条款",
        "upload.main": "点击上传或拖拽图片至此",
        "upload.sub": "支持 PNG, JPG 格式（最大 4MB）",
        "pixel.size": "像素尺寸",
        "pixel.desc": "调整滑块时实时预览",
        "advanced.title": "高级设置",
        "advanced.dithering": "启用 Floyd-Steinberg 抖动算法",
        "advanced.scaling": "图像缩放方式：",
        "advanced.grid": "显示像素网格",
        "scaling.nearest": "最近邻插值",
        "scaling.bilinear": "双线性插值",
        "scaling.lanczos": "Lanczos 算法",
        "preview.title": "Wplace 像素画预览",
        "preview.prompt": "请上传一张图片开始",
        "btn.download": "下载",
        "used.colors.title": "此图像使用的颜色",
        "used.colors.total": "总计",
        "used.colors.free": "免费",
        "used.colors.premium": "付费",
        "palette.title": "Wplace 64 色调色板",
        "palette.free": "免费 (32)",
        "palette.premium": "付费 (32)",
        "palette.info": "官方 Wplace 调色板",
        "loading": "处理中...",
        "features.special.title": "为什么我们的 Wplace 图像转换器与众不同？",
        "features.title": "为什么选择 Wplace 像素艺术转换器？",
        "features.subtitle": "创建 Wplace 兼容像素艺术的终极工具",
        "features.free.title": "100% 免费转换器",
        "features.free.desc": "Wplace 像素艺术转换器完全免费。无隐藏费用，无订阅。立即转换无限图像。",
        "features.privacy.title": "隐私保护",
        "features.privacy.desc": "所有处理都在您的浏览器中进行。您的图片永远不会离开您的设备。",
        "features.easy.title": "简单快速", 
        "features.easy.desc": "直观的界面让每个人都能轻松创作像素艺术。无需技术技能。",
        "features.unlimited.title": "任意图像尺寸",
        "features.unlimited.desc": "上传任意尺寸的图片。Wplace 像素艺术转换器高效处理一切。",
        
        // Features section (detailed)
        "features.subtitle.desc": "将任何图像转换为专为 Wplace 设计的惊艳像素艺术",
        "features.free.detailed.title": "完全免费工具",
        "features.free.detailed.desc": "我们的 Wplace 像素艺术创建器完全免费使用。无订阅费，无隐藏收费，无转换次数限制。创建任意数量的像素艺术。",
        "features.privacy.detailed.desc": "一切都在您的浏览器中本地进行。您的图像始终保留在您的设备上 - 我们绝不上传、存储或访问您的内容。",
        "features.easy.detailed.title": "轻松转换",
        "features.easy.detailed.desc": "无需复杂设置或技术知识。只需上传您的图像，即可观看其立即转换为美丽的像素艺术。",
        "features.unlimited.detailed.title": "任意尺寸欢迎",
        "features.unlimited.detailed.desc": "从微小图标到巨大艺术作品 - 我们的转换器处理任意尺寸的图像。无文件大小限制或质量妥协。",
        
        // How to use section
        "howto.title": "如何使用 Wplace 像素画工具",
        "howto.subtitle": "4个简单步骤将图像转换为像素艺术",
        "howto.step1.title": "上传您的图像",
        "howto.step1.desc": "点击上传区域或拖放您的 PNG、JPG 或 SVG 文件。我们的转换器支持所有常见图像格式。",
        "howto.step2.title": "调整像素大小",
        "howto.step2.desc": "使用滑块控制像素大小。较小的值创建更详细的艺术，较大的值产生块状、抽象的像素艺术。",
        "howto.step3.title": "转换为像素艺术",
        "howto.step3.desc": "观看您的图像使用我们先进的转换器技术转换为令人惊艳的像素艺术。预览实时更新。",
        "howto.step4.title": "下载您的创作",
        "howto.step4.desc": "在小像素完美版或大尺寸版本之间选择。您的像素艺术已准备好在 Wplace 上使用！",
        
        // FAQ section
        "faq.title": "常见问题",
        "faq.subtitle": "关于我们的 Wplace 像素画工具的一切信息",
        "faq.q1": "我们的 Wplace 工具与其他像素艺术转换器有何不同？",
        "faq.a1": "我们的 Wplace 工具专为 Wplace 社区设计，使用来自 wplace.org 的官方 64 色调色板。与通用像素艺术转换器不同，此工具确保与 Wplace 平台的完美色彩兼容性。Wplace 工具具有先进的算法，可自动将您的图像与 Wplace 上可用的确切颜色匹配，消除猜测，确保您的作品在上传到平台时正确显示。",
        "faq.q2": "Wplace 工具是否完全免费使用？",
        "faq.a2": "是的，我们的 Wplace 工具完全免费，没有隐藏费用、订阅或使用限制。我们相信每个 Wplace 玩家都应该能够使用专业品质的像素艺术转换工具。Wplace 工具在您的浏览器中本地处理所有内容，这意味着我们没有服务器成本需要维护，因此可以免费提供此服务。您可以转换无限图像并下载它们，无任何水印或限制。",
        "faq.q3": "Wplace 工具如何确保我的隐私和数据安全？",
        "faq.a3": "隐私是我们 Wplace 工具的核心功能。所有图像处理完全在您的浏览器中使用客户端 JavaScript 技术进行。您的图像永远不会离开您的设备 - 它们不会上传到我们的服务器、存储在数据库中或传输到任何地方。Wplace 工具一旦加载就可以离线工作，我们无法访问、查看或收集您的任何图像。这种本地处理方法确保完全隐私，同时为 Wplace 玩家提供快速、安全的像素艺术转换。",
        "faq.q4": "Wplace 工具支持哪些图像格式和尺寸？",
        "faq.a4": "Wplace 工具接受所有标准图像格式，包括 PNG、JPG、JPEG，并支持几乎任何尺寸的图像。无论您是处理小图标还是大型艺术作品，我们的工具都能高效处理。Wplace 工具根据您的图像大小和所选像素密度自动优化处理。为了在 Wplace 工具中获得最佳效果，我们建议使用高质量的源图像，因为该工具将保留和增强对像素艺术创作最重要的细节。",
        "faq.q5": "我可以在 Wplace 工具中调整像素大小和质量设置吗？",
        "faq.a5": "当然可以！Wplace 工具提供全面的自定义选项。您可以调整像素大小从 1 到 32，较小的值创建更详细的艺术作品，较大的值产生大胆、抽象的设计。该工具包括高级功能，如用于更平滑色彩过渡的 Floyd-Steinberg 抖动、多种缩放算法（最近邻、双线性和 Lanczos）以及网格覆盖选项。这些专业级功能使我们的 Wplace 工具既适合初学者，也适合从事 Wplace 项目的经验丰富的数字艺术家。",
        "faq.q6": "如何在实际的 Wplace 平台上使用我转换的像素艺术？",
        "faq.a6": "使用我们的 Wplace 工具创建像素艺术后，只需下载转换后的图像，并在 wplace.org 上放置像素时将其用作参考。该工具准确显示要使用的官方 Wplace 调色板中的哪些颜色，您可以启用网格覆盖以查看精确的像素放置坐标。许多 Wplace 玩家使用我们的 Wplace 工具在开始之前规划他们的艺术作品，因为它消除了试错，并有助于协调团队项目。色彩匹配的输出确保您的愿景完美转化到协作画布上。",
        
        // 导航和控制
        "nav.converter": "转换器",
        "controls.quality": "质量",
        "controls.brightness": "亮度",
        "controls.contrast": "对比度", 
        "controls.saturation": "饱和度",
        "controls.color_palette": "调色板：",
        "lang.english": "英语",
        
        // 用户评价
        "testimonials.title": "用户对 Wplace 像素画工具的评价",
        "testimonials.subtitle": "使用 Wplace 像素画工具的创作者的真实反馈",
        "testimonials.user1.name": "像素亚历克斯",
        "testimonials.user1.role": "Wplace 资深玩家",
        "testimonials.user1.quote": "这个 Wplace 工具完全改变了我在平台上处理像素艺术的方式。在发现这个转换器之前，我花费数小时手动转换图像，经常出现颜色不匹配的问题。现在我可以上传任何图像，立即看到它在官方调色板下的效果。",
        "testimonials.user2.name": "数字戴夫",
        "testimonials.user2.role": "Wplace 策略师", 
        "testimonials.user2.quote": "这个 wplace 工具已成为我在平台上创建战略性艺术作品的秘密武器。速度和准确性让我能够在实际画布上投入像素之前快速测试不同的设计概念。",
        "testimonials.user3.name": "创意露娜",
        "testimonials.user3.role": "艺术社区版主",
        "testimonials.user3.quote": "我向每一个加入我们社区的新玩家推荐这个 wplace 工具。像素艺术的学习曲线可能很陡峭，但这个 wplace 工具让每个人都能轻松上手。实时预览功能帮助用户在放置像素之前了解他们的艺术作品将如何显示。",
        
        // 统计数据
        "stats.images": "使用我们 wplace 工具转换的图像",
        "stats.users": "wplace 工具的活跃用户",
        "stats.satisfaction": "我们 wplace 工具的满意度",
        
        // 页脚
        "footer.title": "关于 Wplace 像素画工具", 
        "footer.nav.converter": "Wplace 颜色转换器",
        "footer.disclaimer.title": "独立粉丝网站",
        "footer.disclaimer.text": "本网站是一个独立的、由粉丝运营的项目，旨在服务社区的像素艺术需求。我们与官方 Wplace 平台没有关联、赞助或认可。由粉丝为粉丝制作，这个 Wplace 工具旨在让像素创作变得更容易、更有趣。",
        "footer.copyright": "© 2025 Wplace 像素画工具 - 帮助 Wplace 玩家轻松绘画 - 免费使用，对生成的艺术品不声明所有权"
    };
    
    console.log('✅ 翻译数据加载完成');
    console.log(`📚 英文翻译条目数: ${Object.keys(translations.en).length}`);
    console.log(`📚 中文翻译条目数: ${Object.keys(translations.zh).length}`);
}

function translateText(key) {
    return translations[currentLanguage][key] || key;
}

function updatePageTranslations() {
    console.log('🔄 开始更新页面翻译，当前语言:', currentLanguage);
    
    // 更新所有带有 data-lang 属性的元素
    const elements = document.querySelectorAll('[data-lang]');
    console.log(`📊 找到 ${elements.length} 个需要翻译的元素`);
    
    let translatedCount = 0;
    let featuresCount = 0;
    let howtoCount = 0;
    let faqCount = 0;
    
    elements.forEach((element, index) => {
        const key = element.getAttribute('data-lang');
        const translation = translateText(key);
        const originalText = element.textContent || element.placeholder || element.value;
        
        // 统计不同区域的元素
        if (key.startsWith('features.')) featuresCount++;
        if (key.startsWith('howto.')) howtoCount++;
        if (key.startsWith('faq.')) faqCount++;
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.type === 'button' || element.type === 'submit') {
                element.value = translation;
            } else {
                element.placeholder = translation;
            }
        } else if (element.tagName === 'OPTION') {
            element.textContent = translation;
        } else {
            element.textContent = translation;
        }
        
        // 详细检查翻译结果
        if (translation !== key) {
            translatedCount++;
            
            // 检查实际DOM内容是否已更新
            const currentContent = element.textContent || element.placeholder || element.value;
            const isActuallyUpdated = currentContent === translation;
            
            console.log(`${isActuallyUpdated ? '✅' : '⚠️'} [${index + 1}] ${key}:`);
            console.log(`   原文: "${originalText.substring(0, 50)}..."`);
            console.log(`   译文: "${translation.substring(0, 50)}..."`);
            console.log(`   DOM现状: "${currentContent.substring(0, 50)}..."`);
            console.log(`   实际更新: ${isActuallyUpdated ? '是' : '否'}`);
            console.log(`   元素类型: ${element.tagName}, 类名: ${element.className}`);
            
            if (!isActuallyUpdated) {
                console.log(`   ❌ DOM内容未实际更新！`);
            }
        } else {
            console.log(`❌ [${index + 1}] ${key}: 翻译缺失 (${element.tagName})`);
        }
    });
    
    console.log(`📈 翻译统计:`);
    console.log(`   总元素: ${elements.length}`);
    console.log(`   成功翻译: ${translatedCount}`);
    console.log(`   Features区: ${featuresCount}`);
    console.log(`   Howto区: ${howtoCount}`);
    console.log(`   FAQ区: ${faqCount}`);
    
    // 更新文档语言属性
    document.documentElement.lang = currentLanguage;
    console.log(`🌐 页面语言已切换到: ${currentLanguage}`);
}

function initializeLanguageSelector() {
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        // 加载用户语言偏好
        const savedLanguage = localStorage.getItem('wplace-language') || 'en';
        
        console.log(`🔍 语言偏好检查:`);
        console.log(`   localStorage中的语言: "${savedLanguage}"`);
        console.log(`   当前currentLanguage: "${currentLanguage}"`);
        console.log(`   选择器当前值: "${languageSelector.value}"`);
        
        if (savedLanguage === 'zh' || savedLanguage === 'zh-CN') {
            currentLanguage = 'zh';
            languageSelector.value = 'zh';
        } else {
            currentLanguage = 'en';
            languageSelector.value = 'en';
        }
        
        console.log(`   设置后currentLanguage: "${currentLanguage}"`);
        console.log(`   设置后选择器值: "${languageSelector.value}"`);
        
        // 监听语言切换
        languageSelector.addEventListener('change', (e) => {
            console.log('🔄 语言选择器变更:', e.target.value);
            currentLanguage = e.target.value;
            localStorage.setItem('wplace-language', currentLanguage);
            console.log('🚀 调用 updatePageTranslations...');
            updatePageTranslations();
            showToast(currentLanguage === 'zh' ? '语言已切换到中文' : 'Language switched to English', 'success');
        });
        
        console.log('✅ 语言选择器已初始化');
    }
}

// 等待DOM加载完成
function initApplication() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📋 DOM已加载，开始初始化...');
            
            // 先加载翻译数据
            console.log('1️⃣ 加载翻译数据...');
            loadTranslations();
            
            // 初始化语言选择器
            console.log('2️⃣ 初始化语言选择器...');
            initializeI18n();
            
            // 初始化翻译 (已在initializeI18n中完成)
            
            // 初始化应用
            console.log('4️⃣ 初始化应用功能...');
            initApp();
        });
    } else {
        console.log('📋 DOM已就绪，直接初始化...');
        
        // 先加载翻译数据
        console.log('1️⃣ 加载翻译数据...');
        loadTranslations();
        
        // 初始化语言选择器
        console.log('2️⃣ 初始化语言选择器...');
        initializeI18n();
        
        // 初始化翻译 (已在initializeI18n中完成)
        
        // 初始化应用
        console.log('4️⃣ 初始化应用功能...');
        initApp();
    }
}

// 启动应用
initApplication();

// 使全局可访问用于调试
window.wplaceApp = {
    currentImage,
    processedImage,
    isProcessing,
    handleFileUpload,
    processImage,
    downloadImage,
    resetApp,
    // 翻译相关函数
    updatePageTranslations,
    translateText,
    loadTranslations,
    initializeLanguageSelector
};

// 暴露翻译数据和语言状态
window.translations = translations;
window.getCurrentLanguage = () => currentLanguage;

// 添加诊断函数
window.diagnoseProblem = function() {
    console.log('🩺 ===== 多语言问题诊断 =====');
    
    // 1. 检查当前语言状态
    console.log('📍 语言状态:');
    console.log(`   currentLanguage: "${currentLanguage}"`);
    console.log(`   localStorage: "${localStorage.getItem('wplace-language')}"`);
    const selector = document.getElementById('languageSelector');
    console.log(`   选择器值: "${selector ? selector.value : '未找到'}"`);
    
    // 2. 检查翻译数据
    console.log('📚 翻译数据:');
    console.log(`   英文条目数: ${Object.keys(translations.en || {}).length}`);
    console.log(`   中文条目数: ${Object.keys(translations.zh || {}).length}`);
    
    // 3. 检查特定元素的翻译状态
    console.log('🔍 检查下半部分元素:');
    const testElements = [
        'features.special.title',
        'features.subtitle.desc', 
        'howto.title',
        'howto.subtitle',
        'faq.title'
    ];
    
    testElements.forEach(key => {
        const element = document.querySelector(`[data-lang="${key}"]`);
        if (element) {
            const expectedTranslation = translateText(key);
            const actualContent = element.textContent;
            console.log(`   ${key}:`);
            console.log(`     元素存在: 是`);
            console.log(`     期望翻译: "${expectedTranslation.substring(0, 40)}..."`);
            console.log(`     实际内容: "${actualContent.substring(0, 40)}..."`);
            console.log(`     是否匹配: ${actualContent === expectedTranslation ? '是' : '否'}`);
        } else {
            console.log(`   ${key}: 元素未找到`);
        }
    });
    
    // 4. 手动尝试翻译一个元素
    const testElement = document.querySelector('[data-lang="features.special.title"]');
    if (testElement) {
        console.log('🧪 手动测试翻译:');
        const originalContent = testElement.textContent;
        console.log(`   原始内容: "${originalContent}"`);
        
        testElement.textContent = '测试中文内容';
        console.log(`   设置测试内容后: "${testElement.textContent}"`);
        
        testElement.textContent = translateText('features.special.title');
        console.log(`   设置翻译后: "${testElement.textContent}"`);
    }
    
    console.log('🩺 ===== 诊断完成 =====');
};

// 翻译页面内容
function translatePage(lang) {
    console.log(`🌐 正在翻译页面到: ${lang}`);
    currentLanguage = lang;
    
    const elements = document.querySelectorAll('[data-lang]');
    let translatedCount = 0;
    
    elements.forEach(el => {
        const key = el.getAttribute('data-lang');
        const translation = translateText(key);
        if (translation) {
            el.textContent = translation;
            translatedCount++;
        }
    });
    
    console.log(`✅ 翻译完成: ${translatedCount}个元素`);
    
    // 保存语言选择
    localStorage.setItem('preferredLanguage', lang);
}

// 初始化国际化系统
function initializeI18n() {
    console.log('🌐 初始化国际化系统...');
    
    const languageSelector = document.getElementById('languageSelector');
    if (!languageSelector) {
        console.warn('⚠️ 找不到语言选择器');
        return;
    }
    
    // 获取保存的语言偏好
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    languageSelector.value = savedLang;
    
    // 初始翻译
    translatePage(savedLang);
    
    // 添加语言切换事件监听器
    languageSelector.addEventListener('change', function() {
        translatePage(this.value);
    });
    
    // 添加网格切换功能
    initializeGridToggle();
    
    console.log('✅ 国际化系统初始化完成');
}

// 初始化网格切换功能
function initializeGridToggle() {
    // 处理高级设置中的网格复选框
    const showGridCheckbox = document.getElementById('showGrid');
    if (showGridCheckbox) {
        showGridCheckbox.addEventListener('change', function() {
            togglePixelGrid(this.checked);
        });
    }
    
    // 处理预览区域的网格切换开关
    const gridToggle = document.getElementById('gridToggle');
    if (gridToggle) {
        gridToggle.addEventListener('change', function() {
            togglePixelGrid(this.checked);
            // 同步高级设置中的复选框
            if (showGridCheckbox) {
                showGridCheckbox.checked = this.checked;
            }
        });
    }
}

// 切换像素网格显示
function togglePixelGrid(enabled) {
    console.log(`🔲 切换网格显示: ${enabled ? '开启' : '关闭'}`);
    
    const previewCanvas = document.getElementById('preview-canvas');
    const outputCanvas = document.getElementById('output-canvas');
    
    if (enabled) {
        // 显示网格
        showGridOnCanvas(previewCanvas);
        showGridOnCanvas(outputCanvas);
    } else {
        // 隐藏网格
        hideGridOnCanvas(previewCanvas);
        hideGridOnCanvas(outputCanvas);
    }
}

// 在画布上显示网格
function showGridOnCanvas(canvas) {
    if (!canvas || canvas.style.display === 'none') return;
    
    // 添加网格样式
    canvas.style.imageRendering = 'pixelated';
    canvas.style.border = '1px solid #ccc';
    
    // 创建网格覆盖层
    let gridOverlay = canvas.parentNode.querySelector('.grid-overlay');
    if (!gridOverlay) {
        gridOverlay = document.createElement('div');
        gridOverlay.className = 'grid-overlay';
        gridOverlay.style.position = 'absolute';
        gridOverlay.style.top = canvas.offsetTop + 'px';
        gridOverlay.style.left = canvas.offsetLeft + 'px';
        gridOverlay.style.width = canvas.offsetWidth + 'px';
        gridOverlay.style.height = canvas.offsetHeight + 'px';
        gridOverlay.style.pointerEvents = 'none';
        gridOverlay.style.zIndex = '10';
        gridOverlay.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)';
        gridOverlay.style.backgroundSize = '8px 8px';
        canvas.parentNode.appendChild(gridOverlay);
    }
    gridOverlay.style.display = 'block';
}

// 隐藏画布上的网格
function hideGridOnCanvas(canvas) {
    if (!canvas) return;
    
    const gridOverlay = canvas.parentNode.querySelector('.grid-overlay');
    if (gridOverlay) {
        gridOverlay.style.display = 'none';
    }
}

console.log('📱 简化版本加载完成！');