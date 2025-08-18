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
        pixelizedData: null
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
        'previewContainer', 'paletteDisplay', 'downloadBtn', 'loadingIndicator'
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
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG or JPG image');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            window.appState.uploadedImage = img;
            processImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Process image into pixel art
function processImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 使用原始图像尺寸，不要预先缩放
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    // 获取完整的原始图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelSize = window.appState.currentPixelSize;
    
    // 调用像素化函数
    const pixelizedCanvas = pixelizeImageData(imageData, pixelSize);
    
    // 显示结果
    displayResult(pixelizedCanvas);
    
    // 启用下载按钮
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('hidden');
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
    
    container.innerHTML = '';
    canvas.className = 'max-w-full h-auto mx-auto border';
    container.appendChild(canvas);
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

// Handle download
function handleDownload() {
    if (!window.appState.pixelizedData) return;
    
    const link = document.createElement('a');
    link.download = `wplace-pixel-art-${Date.now()}.png`;
    link.href = window.appState.pixelizedData.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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
