// Wplace Paint Tool - 简化版本
// 无ES模块依赖，直接可用

console.log('🎨 Wplace Paint Tool - 简化版本加载中...');

// 全局变量
let currentImage = null;
let processedImage = null;
let isProcessing = false;
let batchQueue = [];
let batchResults = [];
// 翻译功能由统一的i18n.js处理

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

        // 使用格式检测器分析文件
        if (typeof FormatDetector !== 'undefined') {
            const analysis = FormatDetector.analyzeFile(file);
            console.log(`     📊 格式分析:`, analysis);

            if (!analysis.isSupported) {
                console.warn(`     ⚠️ 不支持的格式: ${file.name}`);
                showToast(`不支持的格式: ${file.name}`, 'warning');
                continue;
            }

            // 显示建议
            analysis.recommendations.forEach(rec => {
                if (rec.type === 'warning') {
                    showToast(`${file.name}: ${rec.message}`, 'warning');
                } else if (rec.type === 'info') {
                    console.info(`💡 ${file.name}: ${rec.message}`);
                }
            });
        } else {
            // 回退到基本验证
            if (!file.type.startsWith('image/')) {
                console.warn(`     ⚠️ 跳过非图片文件: ${file.name}`);
                showToast(`跳过非图片文件: ${file.name}`, 'warning');
                continue;
            }
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

        // 开始性能监控
        if (window.performanceMonitor) {
            window.performanceMonitor.startMeasure('imageLoad');
        }

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
            
            // 确保全局变量设置成功
            window.currentImage = currentImage;
            console.log('📝 设置 currentImage:', currentImage ? 'success' : 'failed');

            // 显示预览
            const previewCanvas = $('preview-canvas');

            if (previewCanvas) {
                previewCanvas.width = img.width;
                previewCanvas.height = img.height;
                const previewCtx = previewCanvas.getContext('2d');
                previewCtx.drawImage(img, 0, 0);

                showElement('preview-canvas');
                hideElement('upload-prompt');
                // 若网格已开启，贴合预览画布
                const showGridCheckbox = document.getElementById('showGrid');
                if (showGridCheckbox?.checked) {
                    showGridOnCanvas(previewCanvas);
                }

                console.log('✅ 图片预览已显示，尺寸:', img.width, 'x', img.height);

                // 确保UI状态正确更新
                setTimeout(() => {
                    // 强制更新UI状态
                    const uploadPrompt = document.getElementById('upload-prompt');
                    if (uploadPrompt) {
                        uploadPrompt.style.display = 'none';
                        uploadPrompt.classList.add('hidden');
                    }
                    
                    // 确保预览画布显示
                    if (previewCanvas) {
                        previewCanvas.style.display = 'block';
                        previewCanvas.classList.remove('hidden');
                    }
                    
                    console.log('🎯 UI状态强制更新完成');
                }, 100);

                // 结束图片加载性能监控
                if (window.performanceMonitor) {
                    window.performanceMonitor.endMeasure('imageLoad');

                    // 获取优化建议
                    const imageSize = img.width * img.height;
                    const currentPixelSize = parseInt(document.getElementById('size-slider')?.value || 8);
                    const suggestions = window.performanceMonitor.getOptimizationSuggestions(imageSize, currentPixelSize);

                    suggestions.forEach(suggestion => {
                        window.performanceMonitor.showRecommendation(suggestion);
                    });
                }

                // 智能分析和推荐
                if (typeof SmartPresets !== 'undefined') {
                    try {
                        const imageData = ctx.getImageData(0, 0, img.width, img.height);
                        SmartPresets.analyzeImage(imageData).then(analysis => {
                            const recommendation = SmartPresets.recommendPreset(analysis);
                            SmartPresets.showRecommendation(recommendation);
                            console.log('🧠 智能分析完成:', analysis);
                            console.log('💡 推荐预设:', recommendation.preset.name);
                        }).catch(error => {
                            console.warn('⚠️ 智能分析失败:', error);
                        });
                    } catch (error) {
                        console.warn('⚠️ 智能分析失败:', error);
                    }
                }
            } else {
                console.error('❌ 找不到预览画布元素 preview-canvas');
            }

            // 图片信息显示已移除

            // 启用处理按钮
            const processBtn = $('process-btn');
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
                console.log('✅ Process 按钮已启用');
            } else {
                console.error('❌ 未找到 Process 按钮元素');
            }

            setProgress(100, '上传完成');
            
            // 详细的状态检查和日志
            console.log('🔍 最终状态检查:');
            console.log('   currentImage:', !!currentImage);
            console.log('   previewCanvas显示:', previewCanvas && !previewCanvas.classList.contains('hidden'));
            console.log('   uploadPrompt隐藏:', document.getElementById('upload-prompt')?.classList.contains('hidden'));
            console.log('   processBtn启用:', !document.getElementById('process-btn')?.disabled);
            
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
                // 若网格已开启，贴合输出画布
                const showGridCheckbox = document.getElementById('showGrid');
                if (showGridCheckbox?.checked) {
                    showGridOnCanvas(outputCanvas);
                }
            }

            // 启用下载按钮
            const downloadBtn = $('download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('hidden');
            }
            // 同时启用“下载含网格”
            const downloadWithGridBtn = $('downloadWithGridBtn');
            if (downloadWithGridBtn) {
                downloadWithGridBtn.disabled = false;
                downloadWithGridBtn.classList.remove('hidden');
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

// 下载图片（可选包含网格）
function downloadImage(withGrid = false) {
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

    if (withGrid) {
        // 在导出的画布上叠加网格
        const colorHex = document.getElementById('gridColor')?.value || '#000000';
        const opacity = Math.min(100, Math.max(0, parseInt(document.getElementById('gridOpacity')?.value || '30')));
        const thickness = Math.min(3, Math.max(1, parseInt(document.getElementById('gridThickness')?.value || '1')));
        const alpha = (opacity / 100).toFixed(2);
        const size = Math.max(1, pixelSize);

        // 颜色转换
        const hex = colorHex.replace('#','');
        const hexToRgb = (h) => {
            if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
            const n = parseInt(h,16); return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
        };
        const { r, g, b } = hexToRgb(hex);
        ctx.save();
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        // 竖线
        for (let x=0; x<=canvas.width; x+=size) {
            ctx.moveTo(x+0.5, 0); ctx.lineTo(x+0.5, canvas.height);
        }
        // 横线
        for (let y=0; y<=canvas.height; y+=size) {
            ctx.moveTo(0, y+0.5); ctx.lineTo(canvas.width, y+0.5);
        }
        ctx.stroke();
        ctx.restore();
    }

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = withGrid ? `wplace-pixel-art-grid-${Date.now()}.png` : `wplace-pixel-art-${Date.now()}.png`;
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
                    // 若网格已开启，贴合输出画布
                    const showGridCheckbox = document.getElementById('showGrid');
                    if (showGridCheckbox?.checked) {
                        showGridOnCanvas(outputCanvas);
                    }
                }

                // 更新处理结果
                processedImage = result;

                // 启用下载按钮
                const downloadBtn = $('download-btn');
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('hidden');
                }
                const downloadWithGridBtn = $('downloadWithGridBtn');
                if (downloadWithGridBtn) {
                    downloadWithGridBtn.disabled = false;
                    downloadWithGridBtn.classList.remove('hidden');
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

// 智能预设功能已移除，简化代码
function initializeSmartPresets() {
    // 功能已移除
}

// 初始化应用
function initApp() {
    console.log('🚀 初始化应用...');
    console.log('📍 当前页面URL:', window.location.href);
    console.log('📍 当前页面文件:', window.location.pathname);

    // 智能预设功能已移除

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

    // 绑定“下载含网格”按钮
    const downloadWithGridBtn = $('downloadWithGridBtn');
    if (downloadWithGridBtn) {
        downloadWithGridBtn.addEventListener('click', () => downloadImage(true));
        downloadWithGridBtn.disabled = true;
        downloadWithGridBtn.classList.add('hidden');
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

// 移除所有翻译相关函数，完全依赖i18n.js系统
console.log('📋 使用统一的i18n.js翻译系统');
console.log('✅ app-simple.js已简化，翻译功能由i18n.js处理');

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM已加载，初始化应用...');
    console.log('📋 [app-simple] 当前页面所有data-lang元素数量:', document.querySelectorAll('[data-lang]').length);
    console.log('📋 [app-simple] window.t函数可用:', typeof window.t !== 'undefined');

    initApp();
});

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

// 在画布上显示网格（始终依据可见画布实时更新尺寸与位置）
function showGridOnCanvas(canvas) {
    if (!canvas) return;

    const isHidden = canvas.classList?.contains('hidden') || getComputedStyle(canvas).display === 'none';
    if (isHidden) return;

    // 提升像素感
    canvas.style.imageRendering = 'pixelated';
    canvas.style.border = '1px solid #ccc';

    // 复用或创建覆盖层
    let gridOverlay = canvas.parentNode.querySelector('.grid-overlay');
    if (!gridOverlay) {
        gridOverlay = document.createElement('div');
        gridOverlay.className = 'grid-overlay';
        gridOverlay.style.position = 'absolute';
        gridOverlay.style.pointerEvents = 'none';
        gridOverlay.style.zIndex = '10';
        canvas.parentNode.appendChild(gridOverlay);
    }

    // 读取样式参数
    const colorInput = document.getElementById('gridColor');
    const opacityInput = document.getElementById('gridOpacity');
    const thicknessInput = document.getElementById('gridThickness');
    const colorHex = colorInput?.value || '#000000';
    const opacity = Math.min(100, Math.max(0, parseInt(opacityInput?.value || '30')));
    const thickness = Math.min(3, Math.max(1, parseInt(thicknessInput?.value || '1')));
    const alpha = (opacity / 100).toFixed(2);

    // 将十六进制转换为 rgb
    function hexToRgb(hex) {
        const h = hex.replace('#','');
        const bigint = parseInt(h, 16);
        if (h.length === 3) {
            const r = parseInt(h[0]+h[0],16), g = parseInt(h[1]+h[1],16), b = parseInt(h[2]+h[2],16);
            return {r,g,b};
        }
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }
    const { r, g, b } = hexToRgb(colorHex);

    // 构造背景（使用非重复渐变 + background-size 形成网格）
    const line = `rgba(${r},${g},${b},${alpha}) ${thickness}px, transparent ${thickness}px`;
    gridOverlay.style.backgroundImage = `linear-gradient(0deg, ${line}), linear-gradient(90deg, ${line})`;

    // 使用边界矩形精确贴合（兼容 flex 居中）
    const parentRect = canvas.parentNode.getBoundingClientRect();
    const rect = canvas.getBoundingClientRect();
    gridOverlay.style.top = (rect.top - parentRect.top) + 'px';
    gridOverlay.style.left = (rect.left - parentRect.left) + 'px';
    gridOverlay.style.width = rect.width + 'px';
    gridOverlay.style.height = rect.height + 'px';

    // 网格间距与像素尺寸联动
    const pixelSizeVal = parseInt(document.getElementById('size-slider')?.value || '8');
    const gridSize = Math.max(1, pixelSizeVal);
    gridOverlay.style.backgroundSize = gridSize + 'px ' + gridSize + 'px';

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

// 绑定网格显示复选框事件
document.addEventListener('DOMContentLoaded', function() {
    const showGridCheckbox = document.getElementById('showGrid');
    const sizeSlider = document.getElementById('size-slider');
    const gridColor = document.getElementById('gridColor');
    const gridOpacity = document.getElementById('gridOpacity');
    const gridThickness = document.getElementById('gridThickness');

    if (showGridCheckbox) {
        showGridCheckbox.addEventListener('change', function() {
            togglePixelGrid(this.checked);
        });
    }

    // 像素尺寸变化时，动态刷新网格
    const refreshIfShown = () => {
        if (showGridCheckbox && showGridCheckbox.checked) {
            const previewCanvas = document.getElementById('preview-canvas');
            const outputCanvas = document.getElementById('output-canvas');
            showGridOnCanvas(previewCanvas);
            showGridOnCanvas(outputCanvas);
        }
    };
    if (sizeSlider) sizeSlider.addEventListener('input', refreshIfShown);
    if (gridColor) gridColor.addEventListener('input', refreshIfShown);
    if (gridOpacity) gridOpacity.addEventListener('input', refreshIfShown);
    if (gridThickness) gridThickness.addEventListener('input', refreshIfShown);

    // 窗口尺寸变化时，保持网格贴合
    window.addEventListener('resize', function() {
        if (showGridCheckbox && showGridCheckbox.checked) {
            const previewCanvas = document.getElementById('preview-canvas');
            const outputCanvas = document.getElementById('output-canvas');
            showGridOnCanvas(previewCanvas);
            showGridOnCanvas(outputCanvas);
        }
    });
});

console.log('📱 简化版本加载完成！');