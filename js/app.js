// Wplace Paint Tool - Core Application Logic

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Wplace Paint Tool loaded successfully');
    
    // Create basic elements if they don't exist
    createMissingElements();
    
    // Initialize app state
    window.appState = {
        uploadedImage: null,
        currentPixelSize: 12,
        pixelizedData: null,
        enableDithering: false,
        scalingMethod: 'nearest',
        showGrid: false,
        usedColors: new Set(),
        zoomLevel: 1,
        panX: 0,
        panY: 0,
        isDragging: false
    };
    
    // Initialize palette display
    displayPalette();
    
    // Bind events
    bindEvents();
});

// Create missing elements dynamically
function createMissingElements() {
    const container = document.querySelector('body > *:last-child');
    if (!container) return;
    
    // Create missing elements with IDs that the HTML expects
    const missingElements = [
        'uploadArea', 'fileInput', 'pixelSize', 'pixelSizeValue', 
        'previewContainer', 'paletteDisplay', 'downloadBtn', 'loadingIndicator',
        'enableDithering', 'scalingMethod', 'showGrid', 'colorTooltip', 'colorInfo',
        'zoomControls', 'zoomIn', 'zoomOut', 'zoomReset', 'usedColorsPanel',
        'usedColorsGrid', 'usedColorsTotal', 'usedColorsFree', 'usedColorsPremium'
    ];
    
    missingElements.forEach(id => {
        if (!document.getElementById(id)) {
            const el = document.createElement('div');
            el.id = id;
            el.style.display = 'none';
            document.body.appendChild(el);
        }
    });
}

// Bind event listeners
function bindEvents() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const pixelSize = document.getElementById('pixelSize');
    const downloadBtn = document.getElementById('downloadBtn');
    const enableDithering = document.getElementById('enableDithering');
    const scalingMethod = document.getElementById('scalingMethod');
    const showGrid = document.getElementById('showGrid');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput?.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (pixelSize) {
        pixelSize.addEventListener('input', handlePixelSizeChange);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownload);
    }
    
    // Advanced settings event listeners
    if (enableDithering) {
        enableDithering.addEventListener('change', handleDitheringChange);
    }
    
    if (scalingMethod) {
        scalingMethod.addEventListener('change', handleScalingMethodChange);
    }
    
    if (showGrid) {
        showGrid.addEventListener('change', handleGridToggle);
    }
    
    // Zoom and pan controls
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');
    
    if (zoomIn) {
        zoomIn.addEventListener('click', () => changeZoom(1.2));
    }
    
    if (zoomOut) {
        zoomOut.addEventListener('click', () => changeZoom(0.8));
    }
    
    if (zoomReset) {
        zoomReset.addEventListener('click', resetZoom);
    }
}

// Handle drag and drop
function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Process uploaded file
function processFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload PNG, JPG, or SVG files.');
        return;
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File too large. Please upload an image smaller than 50MB.');
        return;
    }
    
    showLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            window.appState.uploadedImage = img;
            // Use requestAnimationFrame for smooth UI updates
            requestAnimationFrame(() => {
                processImage(img);
                showLoading(false);
            });
        };
        img.onerror = () => {
            showError('Failed to load image. Please try another file.');
            showLoading(false);
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        showError('Failed to read file. Please try again.');
        showLoading(false);
    };
    reader.readAsDataURL(file);
}

// Process image into pixel art
function processImage(img) {
    try {
        showLoading(true, 'Processing image...');
        
        // Apply advanced scaling if needed
        const scaledCanvas = scaleImage(img, window.appState.scalingMethod);
        const ctx = scaledCanvas.getContext('2d');
        
        // 获取完整的原始图像数据
        const imageData = ctx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
        const pixelSize = window.appState.currentPixelSize;
        
        // Use worker for heavy processing or break into chunks for large images
        const shouldUseChunking = imageData.width * imageData.height > 1000000; // 1M pixels
        
        if (shouldUseChunking) {
            processImageInChunks(imageData, pixelSize);
        } else {
            // 调用增强的像素化函数
            const pixelizedCanvas = enhancedPixelizeImageData(imageData, pixelSize);
            
            // 添加网格覆盖（如果启用）
            const finalCanvas = addGridOverlay(pixelizedCanvas, pixelSize);
            
            // 显示结果
            displayResult(finalCanvas);
            
            // 启用下载按钮
            enableDownloadButton();
            showLoading(false);
        }
    } catch (error) {
        console.error('Error processing image:', error);
        showError('Error processing image: ' + error.message);
        showLoading(false);
    }
}

// Simple pixelization
function pixelizeImageData(imageData, pixelSize) {
    const cols = Math.floor(imageData.width / pixelSize);
    const rows = Math.floor(imageData.height / pixelSize);
    
    // 如果图像太小或像素尺寸太大，则返回空白画布
    if (cols === 0 || rows === 0) {
        console.warn(`图像尺寸过小，无法使用像素尺寸 ${pixelSize} 进行处理`);
        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = 100;
        emptyCanvas.height = 100;
        return emptyCanvas;
    }
    
    // 创建用于输出的画布
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCanvas.width = cols * pixelSize;
    outputCanvas.height = rows * pixelSize;
    
    // 遍历每个像素块
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * pixelSize;
            const y = row * pixelSize;
            
            // 从原始 imageData 中计算平均颜色
            const avgColor = getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);
            const nearestColor = findNearestPaletteColor(avgColor);
            
            // 在输出画布上绘制色块
            outputCtx.fillStyle = nearestColor.color;
            outputCtx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    window.appState.pixelizedData = outputCanvas;
    return outputCanvas;
}

// 从 imageData 的指定区域获取平均颜色
function getAverageColorFromRegion(imageData, startX, startY, width, height) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    let r = 0, g = 0, b = 0, count = 0;
    
    const endX = Math.min(startX + width, imageData.width);
    const endY = Math.min(startY + height, imageData.height);
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            // 计算像素在 data 数组中的索引
            const index = (y * imageWidth + x) * 4;
            const alpha = data[index + 3];
            
            // 只计算不完全透明的像素
            if (alpha > 0) {
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                count++;
            }
        }
    }
    
    if (count === 0) {
        return { r: 0, g: 0, b: 0 }; // 如果区域完全透明，则返回黑色
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

// Get average color from image data (保留用于兼容性)
function getAverageColor(imageData) {
    const data = imageData.data;
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
    }
    
    if (count === 0) {
        return { r: 0, g: 0, b: 0 };
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

// Find nearest palette color
function findNearestPaletteColor(color) {
    const palette = getWplacePalette();
    let minDistance = Infinity;
    let nearest = palette[0]; // 默认是黑色
    
    for (const paletteColor of palette) {
        if (paletteColor.isTransparent) continue;
        
        const rgb = hexToRgb(paletteColor.color);
        if (!rgb) continue; // 防止 hexToRgb 返回 null
        
        // 使用加权的欧几里得距离以更好地模拟人眼感知
        const distance = Math.sqrt(
            Math.pow(color.r - rgb.r, 2) * 2 +
            Math.pow(color.g - rgb.g, 2) * 4 +
            Math.pow(color.b - rgb.b, 2) * 3
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = paletteColor;
        }
    }
    
    return nearest;
}

// Display result
function displayResult(canvas) {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    
    // Clear container but keep UI elements
    const imageArea = container.querySelector('.flex-1.flex.items-center.justify-center.p-4');
    if (imageArea) {
        // Remove old canvas if exists
        const existingCanvas = imageArea.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Remove prompt text
        const promptText = imageArea.querySelector('p');
        if (promptText) {
            promptText.remove();
        }
        
        // Add canvas with interactive features
        canvas.className = 'max-w-full h-auto cursor-move';
        canvas.style.transform = `scale(${window.appState.zoomLevel}) translate(${window.appState.panX}px, ${window.appState.panY}px)`;
        canvas.style.transformOrigin = 'center center';
        
        // Add mouse events for color info and panning
        addCanvasInteractivity(canvas);
        
        imageArea.appendChild(canvas);
        
        // Show zoom controls
        const zoomControls = document.getElementById('zoomControls');
        if (zoomControls) {
            zoomControls.classList.remove('hidden');
        }
        
        // Display used colors panel
        displayUsedColors();
    }
}

// Handle pixel size change
function handlePixelSizeChange() {
    const pixelSize = document.getElementById('pixelSize');
    const pixelSizeValue = document.getElementById('pixelSizeValue');
    
    if (pixelSize && pixelSizeValue) {
        window.appState.currentPixelSize = parseInt(pixelSize.value);
        pixelSizeValue.textContent = window.appState.currentPixelSize;
        
        // Re-process if image exists
        if (window.appState.uploadedImage) {
            processImage(window.appState.uploadedImage);
        }
    }
}

// Handle download (replaced by advanced version below)

// Display Wplace palette
function displayPalette() {
    const paletteDisplay = document.getElementById('paletteDisplay');
    if (!paletteDisplay) return;
    
    const palette = getWplacePalette();
    paletteDisplay.innerHTML = '';
    
    palette.forEach((color, index) => {
        if (color.isTransparent) return;
        
        const colorBtn = document.createElement('button');
        colorBtn.className = 'w-8 h-8 border border-gray-300 rounded hover:scale-110 transition-transform';
        colorBtn.style.backgroundColor = color.color;
        colorBtn.title = color.name;
        
        if (color.isPremium) {
            colorBtn.innerHTML = '🔒';
            colorBtn.style.fontSize = '10px';
        }
        
        paletteDisplay.appendChild(colorBtn);
    });
}

// Get Wplace 64-color palette
function getWplacePalette() {
    return [
        { name: 'Black', color: '#000000', isPremium: false },
        { name: 'Dark Gray', color: '#3c3c3c', isPremium: false },
        { name: 'Gray', color: '#787878', isPremium: false },
        { name: 'Light Gray', color: '#d2d2d2', isPremium: false },
        { name: 'White', color: '#ffffff', isPremium: false },
        { name: 'Deep Red', color: '#600018', isPremium: false },
        { name: 'Red', color: '#ed1c24', isPremium: false },
        { name: 'Orange', color: '#ff7f27', isPremium: false },
        { name: 'Gold', color: '#f6aa09', isPremium: false },
        { name: 'Yellow', color: '#f9dd3b', isPremium: false },
        { name: 'Light Yellow', color: '#fffabc', isPremium: false },
        { name: 'Dark Green', color: '#0eb968', isPremium: false },
        { name: 'Green', color: '#13e67b', isPremium: false },
        { name: 'Light Green', color: '#87ff5e', isPremium: false },
        { name: 'Dark Teal', color: '#0c816e', isPremium: false },
        { name: 'Teal', color: '#10aea6', isPremium: false },
        { name: 'Light Teal', color: '#13e1be', isPremium: false },
        { name: 'Dark Blue', color: '#28509e', isPremium: false },
        { name: 'Blue', color: '#4093e4', isPremium: false },
        { name: 'Cyan', color: '#60f7f2', isPremium: false },
        { name: 'Indigo', color: '#6b50f6', isPremium: false },
        { name: 'Light Indigo', color: '#99b1fb', isPremium: false },
        { name: 'Dark Purple', color: '#780c99', isPremium: false },
        { name: 'Purple', color: '#aa38b9', isPremium: false },
        { name: 'Light Purple', color: '#e09ff9', isPremium: false },
        { name: 'Dark Pink', color: '#cb007a', isPremium: false },
        { name: 'Pink', color: '#ec1f80', isPremium: false },
        { name: 'Light Pink', color: '#f38da9', isPremium: false },
        { name: 'Dark Brown', color: '#684634', isPremium: false },
        { name: 'Brown', color: '#95682a', isPremium: false },
        { name: 'Beige', color: '#f8b277', isPremium: false },
        { name: 'Medium Gray', color: '#aaaaaa', isPremium: true },
        { name: 'Dark Red', color: '#a50e1e', isPremium: true },
        { name: 'Light Red', color: '#fa8072', isPremium: true },
        { name: 'Dark Orange', color: '#e45c1a', isPremium: true },
        { name: 'Light Tan', color: '#d6b594', isPremium: true },
        { name: 'Dark Goldenrod', color: '#9c8431', isPremium: true },
        { name: 'Goldenrod', color: '#c5ad31', isPremium: true },
        { name: 'Light Goldenrod', color: '#e8d45f', isPremium: true },
        { name: 'Dark Olive', color: '#4a6b3a', isPremium: true },
        { name: 'Olive', color: '#5a944a', isPremium: true },
        { name: 'Light Olive', color: '#84c573', isPremium: true },
        { name: 'Dark Cyan', color: '#0f799f', isPremium: true },
        { name: 'Light Cyan', color: '#bbfaf2', isPremium: true },
        { name: 'Light Blue', color: '#7dc7ff', isPremium: true },
        { name: 'Dark Indigo', color: '#4d31b8', isPremium: true },
        { name: 'Dark Slate Blue', color: '#4a4284', isPremium: true },
        { name: 'Slate Blue', color: '#7a71c4', isPremium: true },
        { name: 'Light Slate Blue', color: '#b5aef1', isPremium: true },
        { name: 'Light Brown', color: '#dba463', isPremium: true },
        { name: 'Dark Beige', color: '#d18051', isPremium: true },
        { name: 'Light Beige', color: '#ffc5a5', isPremium: true },
        { name: 'Dark Peach', color: '#9b5249', isPremium: true },
        { name: 'Peach', color: '#d18078', isPremium: true },
        { name: 'Light Peach', color: '#fab6a4', isPremium: true },
        { name: 'Dark Tan', color: '#7b6352', isPremium: true },
        { name: 'Tan', color: '#9c846b', isPremium: true },
        { name: 'Dark Slate', color: '#333941', isPremium: true },
        { name: 'Slate', color: '#6d758d', isPremium: true },
        { name: 'Light Slate', color: '#b3b9d1', isPremium: true },
        { name: 'Dark Stone', color: '#6d643f', isPremium: true },
        { name: 'Stone', color: '#948c6b', isPremium: true },
        { name: 'Light Stone', color: '#cdc59e', isPremium: true },
        { name: 'Transparent', color: 'transparent', isTransparent: true, isPremium: false }
    ];
}

// Utility: Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Advanced Settings Event Handlers
function handleDitheringChange(e) {
    window.appState.enableDithering = e.target.checked;
    if (window.appState.uploadedImage) {
        processImage(window.appState.uploadedImage);
    }
}

function handleScalingMethodChange(e) {
    window.appState.scalingMethod = e.target.value;
    if (window.appState.uploadedImage) {
        processImage(window.appState.uploadedImage);
    }
}

function handleGridToggle(e) {
    window.appState.showGrid = e.target.checked;
    if (window.appState.pixelizedData) {
        displayResult(window.appState.pixelizedData);
    }
}

// Floyd-Steinberg Dithering Algorithm
function applyFloydSteinbergDither(imageData, palette) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            const oldR = data[index];
            const oldG = data[index + 1];
            const oldB = data[index + 2];
            const alpha = data[index + 3];
            
            if (alpha === 0) continue; // Skip transparent pixels
            
            // Find nearest palette color
            const nearest = findNearestPaletteColor({ r: oldR, g: oldG, b: oldB });
            const nearestRgb = hexToRgb(nearest.color);
            
            // Set the new color
            data[index] = nearestRgb.r;
            data[index + 1] = nearestRgb.g;
            data[index + 2] = nearestRgb.b;
            
            // Calculate quantization error
            const errorR = oldR - nearestRgb.r;
            const errorG = oldG - nearestRgb.g;
            const errorB = oldB - nearestRgb.b;
            
            // Distribute error to neighboring pixels
            distributeError(data, width, height, x + 1, y, errorR, errorG, errorB, 7/16);
            distributeError(data, width, height, x - 1, y + 1, errorR, errorG, errorB, 3/16);
            distributeError(data, width, height, x, y + 1, errorR, errorG, errorB, 5/16);
            distributeError(data, width, height, x + 1, y + 1, errorR, errorG, errorB, 1/16);
        }
    }
    
    return imageData;
}

// Helper function to distribute dithering error
function distributeError(data, width, height, x, y, errorR, errorG, errorB, factor) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    
    const index = (y * width + x) * 4;
    if (data[index + 3] === 0) return; // Skip transparent pixels
    
    data[index] = Math.max(0, Math.min(255, data[index] + errorR * factor));
    data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + errorG * factor));
    data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + errorB * factor));
}

// Advanced Image Scaling
function scaleImage(img, scalingMethod, maxSize = 1024) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate new size while maintaining aspect ratio
    let { width, height } = img;
    if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Apply scaling method
    switch (scalingMethod) {
        case 'nearest':
            ctx.imageSmoothingEnabled = false;
            break;
        case 'bilinear':
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'low';
            break;
        case 'lanczos':
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            break;
    }
    
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
}

// Enhanced pixelization with advanced features
function enhancedPixelizeImageData(imageData, pixelSize) {
    // Apply dithering if enabled
    if (window.appState.enableDithering) {
        const palette = getWplacePalette();
        imageData = applyFloydSteinbergDither(imageData, palette);
    }
    
    const cols = Math.floor(imageData.width / pixelSize);
    const rows = Math.floor(imageData.height / pixelSize);
    
    if (cols === 0 || rows === 0) {
        console.warn(`图像尺寸过小，无法使用像素尺寸 ${pixelSize} 进行处理`);
        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = 100;
        emptyCanvas.height = 100;
        return emptyCanvas;
    }
    
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCanvas.width = cols * pixelSize;
    outputCanvas.height = rows * pixelSize;
    
    // Clear used colors for this conversion
    window.appState.usedColors.clear();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * pixelSize;
            const y = row * pixelSize;
            
            const avgColor = getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);
            const nearestColor = findNearestPaletteColor(avgColor);
            
            // Track used colors
            window.appState.usedColors.add(nearestColor.color);
            
            outputCtx.fillStyle = nearestColor.color;
            outputCtx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    window.appState.pixelizedData = outputCanvas;
    return outputCanvas;
}

// Add grid overlay to canvas
function addGridOverlay(canvas, pixelSize, gridColor = '#ffffff80') {
    if (!window.appState.showGrid) return canvas;
    
    const gridCanvas = document.createElement('canvas');
    const gridCtx = gridCanvas.getContext('2d');
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;
    
    // Draw the original image
    gridCtx.drawImage(canvas, 0, 0);
    
    // Draw grid
    gridCtx.strokeStyle = gridColor;
    gridCtx.lineWidth = 1;
    gridCtx.setLineDash([]);
    
    // Vertical lines
    for (let x = pixelSize; x < canvas.width; x += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, canvas.height);
        gridCtx.stroke();
    }
    
    // Horizontal lines
    for (let y = pixelSize; y < canvas.height; y += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(canvas.width, y);
        gridCtx.stroke();
    }
    
    return gridCanvas;
}

// Add interactive features to canvas
function addCanvasInteractivity(canvas) {
    // Mouse move for color info
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', hideColorTooltip);
    
    // Pan functionality
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleCanvasTouchStart);
    canvas.addEventListener('touchmove', handleCanvasTouchMove);
    canvas.addEventListener('touchend', handleCanvasTouchEnd);
}

// Handle canvas mouse events
function handleCanvasMouseMove(e) {
    if (!window.appState.pixelizedData) return;
    
    if (window.appState.isDragging) {
        // Handle panning
        const deltaX = e.clientX - window.appState.lastMouseX;
        const deltaY = e.clientY - window.appState.lastMouseY;
        
        window.appState.panX += deltaX / window.appState.zoomLevel;
        window.appState.panY += deltaY / window.appState.zoomLevel;
        
        updateCanvasTransform(e.target);
        
        window.appState.lastMouseX = e.clientX;
        window.appState.lastMouseY = e.clientY;
    } else {
        // Handle color info display
        showColorInfo(e);
    }
}

function handleCanvasMouseDown(e) {
    if (e.button === 0) { // Left click
        window.appState.isDragging = true;
        window.appState.lastMouseX = e.clientX;
        window.appState.lastMouseY = e.clientY;
        e.target.style.cursor = 'grabbing';
    }
}

function handleCanvasMouseUp(e) {
    window.appState.isDragging = false;
    e.target.style.cursor = 'move';
}

function handleCanvasWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    changeZoom(zoomFactor);
}

// Touch event handlers
function handleCanvasTouchStart(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        window.appState.isDragging = true;
        window.appState.lastMouseX = touch.clientX;
        window.appState.lastMouseY = touch.clientY;
    }
}

function handleCanvasTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && window.appState.isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - window.appState.lastMouseX;
        const deltaY = touch.clientY - window.appState.lastMouseY;
        
        window.appState.panX += deltaX / window.appState.zoomLevel;
        window.appState.panY += deltaY / window.appState.zoomLevel;
        
        updateCanvasTransform(e.target);
        
        window.appState.lastMouseX = touch.clientX;
        window.appState.lastMouseY = touch.clientY;
    }
}

function handleCanvasTouchEnd(e) {
    window.appState.isDragging = false;
}

// Zoom functions
function changeZoom(factor) {
    window.appState.zoomLevel = Math.max(0.1, Math.min(5, window.appState.zoomLevel * factor));
    const canvas = document.querySelector('#previewContainer canvas');
    if (canvas) {
        updateCanvasTransform(canvas);
    }
}

function resetZoom() {
    window.appState.zoomLevel = 1;
    window.appState.panX = 0;
    window.appState.panY = 0;
    const canvas = document.querySelector('#previewContainer canvas');
    if (canvas) {
        updateCanvasTransform(canvas);
    }
}

function updateCanvasTransform(canvas) {
    canvas.style.transform = `scale(${window.appState.zoomLevel}) translate(${window.appState.panX}px, ${window.appState.panY}px)`;
}

// Color info functionality
function showColorInfo(e) {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        
        const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        const hex = rgbToHex(data[0], data[1], data[2]);
        
        // Find matching palette color
        const palette = getWplacePalette();
        const paletteColor = palette.find(c => c.color.toLowerCase() === hex.toLowerCase());
        
        const tooltip = document.getElementById('colorTooltip');
        const colorInfo = document.getElementById('colorInfo');
        
        if (tooltip && colorInfo) {
            colorInfo.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 border border-white" style="background-color: ${hex}"></div>
                    <span>${hex}</span>
                    ${paletteColor ? `<span>(${paletteColor.name})</span>` : ''}
                </div>
            `;
            
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY - 30) + 'px';
            tooltip.classList.remove('hidden');
        }
    }
}

function hideColorTooltip() {
    const tooltip = document.getElementById('colorTooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

// Utility: RGB to Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Display used colors panel
function displayUsedColors() {
    const panel = document.getElementById('usedColorsPanel');
    const grid = document.getElementById('usedColorsGrid');
    const totalElement = document.getElementById('usedColorsTotal');
    const freeElement = document.getElementById('usedColorsFree');
    const premiumElement = document.getElementById('usedColorsPremium');
    
    if (!panel || !grid || !window.appState.usedColors.size) return;
    
    // Show panel
    panel.classList.remove('hidden');
    
    // Clear grid
    grid.innerHTML = '';
    
    const palette = getWplacePalette();
    let freeCount = 0;
    let premiumCount = 0;
    
    // Display used colors
    window.appState.usedColors.forEach(colorHex => {
        const paletteColor = palette.find(c => c.color.toLowerCase() === colorHex.toLowerCase());
        if (!paletteColor) return;
        
        const colorDiv = document.createElement('div');
        colorDiv.className = 'w-8 h-8 border border-gray-300 rounded relative';
        colorDiv.style.backgroundColor = colorHex;
        colorDiv.title = paletteColor.name;
        
        if (paletteColor.isPremium) {
            colorDiv.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-xs">🔒</div>';
            premiumCount++;
        } else {
            freeCount++;
        }
        
        grid.appendChild(colorDiv);
    });
    
    // Update statistics
    if (totalElement) totalElement.textContent = window.appState.usedColors.size;
    if (freeElement) freeElement.textContent = freeCount;
    if (premiumElement) premiumElement.textContent = premiumCount;
}

// Performance optimization: Process large images in chunks
function processImageInChunks(imageData, pixelSize) {
    const cols = Math.floor(imageData.width / pixelSize);
    const rows = Math.floor(imageData.height / pixelSize);
    
    if (cols === 0 || rows === 0) {
        showError('Image too small for current pixel size');
        return;
    }
    
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCanvas.width = cols * pixelSize;
    outputCanvas.height = rows * pixelSize;
    
    // Clear used colors
    window.appState.usedColors.clear();
    
    // Process in chunks to avoid blocking UI
    const chunkSize = 1000; // Process 1000 pixels at a time
    let processedPixels = 0;
    const totalPixels = cols * rows;
    
    function processNextChunk() {
        const endPixel = Math.min(processedPixels + chunkSize, totalPixels);
        
        for (let i = processedPixels; i < endPixel; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = col * pixelSize;
            const y = row * pixelSize;
            
            // Apply dithering if enabled
            let avgColor;
            if (window.appState.enableDithering) {
                // For dithering, we need to process the entire imageData first
                avgColor = getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);
            } else {
                avgColor = getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);
            }
            
            const nearestColor = findNearestPaletteColor(avgColor);
            window.appState.usedColors.add(nearestColor.color);
            
            outputCtx.fillStyle = nearestColor.color;
            outputCtx.fillRect(x, y, pixelSize, pixelSize);
        }
        
        processedPixels = endPixel;
        
        // Update progress
        const progress = Math.round((processedPixels / totalPixels) * 100);
        showLoading(true, `Processing... ${progress}%`);
        
        if (processedPixels < totalPixels) {
            // Continue processing next chunk
            requestAnimationFrame(processNextChunk);
        } else {
            // Finished processing
            window.appState.pixelizedData = outputCanvas;
            
            // Add grid overlay if enabled
            const finalCanvas = addGridOverlay(outputCanvas, pixelSize);
            
            // Display result
            displayResult(finalCanvas);
            enableDownloadButton();
            showLoading(false);
        }
    }
    
    // Start processing
    requestAnimationFrame(processNextChunk);
}

// UI Helper Functions
function showLoading(show, message = 'Loading...') {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (!loadingIndicator) return;
    
    if (show) {
        loadingIndicator.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="text-gray-700">${message}</span>
                </div>
            </div>
        `;
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        loadingIndicator.innerHTML = '';
    }
}

function showError(message) {
    // Create or update error notification
    let errorDiv = document.getElementById('errorNotification');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorNotification';
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function enableDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('hidden');
    }
}

// Advanced download with options
function handleDownload() {
    if (!window.appState.pixelizedData) {
        showError('No image to download. Please process an image first.');
        return;
    }
    
    // Create download options modal
    showDownloadModal();
}

function showDownloadModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold mb-4">Download Options</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Download Size:</label>
                        <select id="downloadSize" class="w-full border border-gray-300 rounded px-3 py-2">
                            <option value="original">Original Size (Pixel Perfect)</option>
                            <option value="2x">2x Size</option>
                            <option value="4x">4x Size</option>
                            <option value="8x">8x Size</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="downloadWithGrid" class="rounded">
                            <span class="text-sm">Include pixel grid</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">File Format:</label>
                        <select id="downloadFormat" class="w-full border border-gray-300 rounded px-3 py-2">
                            <option value="png">PNG (Recommended)</option>
                            <option value="jpeg">JPEG</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button onclick="executeDownload(); this.closest('.fixed').remove()" 
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function executeDownload() {
    const sizeSelect = document.getElementById('downloadSize');
    const gridCheck = document.getElementById('downloadWithGrid');
    const formatSelect = document.getElementById('downloadFormat');
    
    const size = sizeSelect?.value || 'original';
    const includeGrid = gridCheck?.checked || false;
    const format = formatSelect?.value || 'png';
    
    let canvas = window.appState.pixelizedData;
    
    // Add grid if requested
    if (includeGrid && !window.appState.showGrid) {
        canvas = addGridOverlay(canvas, window.appState.currentPixelSize);
    }
    
    // Scale if requested
    if (size !== 'original') {
        const multiplier = parseInt(size.replace('x', ''));
        canvas = scaleCanvasForDownload(canvas, multiplier);
    }
    
    // Download
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `wplace-pixel-art-${timestamp}.${format}`;
    
    if (format === 'jpeg') {
        link.href = canvas.toDataURL('image/jpeg', 0.95);
    } else {
        link.href = canvas.toDataURL('image/png');
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function scaleCanvasForDownload(canvas, multiplier) {
    const scaledCanvas = document.createElement('canvas');
    const ctx = scaledCanvas.getContext('2d');
    
    scaledCanvas.width = canvas.width * multiplier;
    scaledCanvas.height = canvas.height * multiplier;
    
    // Use nearest neighbor for pixel art
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    
    return scaledCanvas;
}

// Memory management
function cleanupCanvas() {
    // Clean up any unused canvases to free memory
    const containers = document.querySelectorAll('#previewContainer canvas');
    containers.forEach((canvas, index) => {
        if (index > 0) { // Keep only the latest canvas
            canvas.remove();
        }
    });
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    handleDownload();
                    break;
                case 'z':
                    e.preventDefault();
                    resetZoom();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    changeZoom(1.2);
                    break;
                case '-':
                    e.preventDefault();
                    changeZoom(0.8);
                    break;
            }
        }
        
        // Number keys for quick pixel size
        if (e.key >= '1' && e.key <= '9') {
            const pixelSize = parseInt(e.key) * 4; // 4, 8, 12, 16, 20, 24, 28, 32, 36
            if (pixelSize <= 32) {
                const slider = document.getElementById('pixelSize');
                if (slider) {
                    slider.value = pixelSize;
                    handlePixelSizeChange();
                }
            }
        }
    });
}

// Initialize keyboard shortcuts when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initKeyboardShortcuts();
});
