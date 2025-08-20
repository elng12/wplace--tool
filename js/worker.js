// Web Worker for heavy image processing tasks
// This worker handles pixelization in a separate thread to prevent UI blocking

// Import necessary functions (will be injected)
let getWplacePalette, hexToRgb, findNearestPaletteColor, getAverageColorFromRegion;

// Initialize worker with provided functions
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'init':
            initializeWorker(data);
            break;
        case 'pixelize':
            handlePixelization(data);
            break;
        case 'dither':
            handleDithering(data);
            break;
        default:
            console.warn('Unknown message type:', type);
    }
};

// Initialize worker with utility functions
function initializeWorker(data) {
    // Store utility functions
    getWplacePalette = data.getWplacePalette;
    hexToRgb = data.hexToRgb;
    findNearestPaletteColor = data.findNearestPaletteColor;
    getAverageColorFromRegion = data.getAverageColorFromRegion;
    
    self.postMessage({ type: 'initialized' });
}

// Handle pixelization task
function handlePixelization(data) {
    const { imageData, pixelSize, settings } = data;
    
    try {
        const result = pixelizeImageData(imageData, pixelSize, settings);
        self.postMessage({
            type: 'pixelizeComplete',
            result: result,
            pixelSize: pixelSize
        });
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error.message,
            pixelSize: pixelSize
        });
    }
}

// Main pixelization logic
function pixelizeImageData(imageData, pixelSize, settings) {
    const startTime = performance.now();
    
    // Validation
    const validation = validatePixelSize(imageData, pixelSize);
    if (!validation.isValid) {
        throw new Error(`Invalid pixel size ${pixelSize} for image dimensions`);
    }
    
    // Apply dithering if enabled
    let processedImageData = imageData;
    if (settings.enableDithering && validation.performanceLevel !== 'ultra-high') {
        processedImageData = applyFloydSteinbergDither(imageData, getWplacePalette());
    }
    
    // Create pixel data
    const pixelData = createPixelData(processedImageData, validation);
    
    // Calculate performance metrics
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return {
        pixelData: pixelData,
        validation: validation,
        processingTime: processingTime,
        timestamp: Date.now()
    };
}

// Create pixel data array
function createPixelData(imageData, validation) {
    const { effectiveCols, effectiveRows, adjustedPixelSize } = validation;
    const pixelData = [];
    const usedColors = new Set();
    
    // Process pixels in chunks for better memory management
    const chunkSize = Math.ceil(effectiveRows / 4); // Process in 4 chunks
    
    for (let chunk = 0; chunk < 4; chunk++) {
        const startRow = chunk * chunkSize;
        const endRow = Math.min(startRow + chunkSize, effectiveRows);
        
        for (let row = startRow; row < endRow; row++) {
            for (let col = 0; col < effectiveCols; col++) {
                const x = col * adjustedPixelSize;
                const y = row * adjustedPixelSize;
                
                if (x >= imageData.width || y >= imageData.height) continue;
                
                const avgColor = getAverageColorFromRegion(imageData, x, y, adjustedPixelSize, adjustedPixelSize);
                const nearestColor = findNearestPaletteColor(avgColor);
                
                pixelData.push({
                    x: x,
                    y: y,
                    color: nearestColor.color,
                    size: adjustedPixelSize
                });
                
                usedColors.add(nearestColor.color);
            }
        }
        
        // Send progress update
        const progress = ((chunk + 1) / 4) * 100;
        self.postMessage({
            type: 'progress',
            progress: progress,
            pixelSize: validation.originalPixelSize
        });
    }
    
    return {
        pixels: pixelData,
        usedColors: Array.from(usedColors),
        totalPixels: pixelData.length
    };
}

// Validate pixel size (simplified version for worker)
function validatePixelSize(imageData, pixelSize) {
    const cols = Math.floor(imageData.width / pixelSize);
    const rows = Math.floor(imageData.height / pixelSize);
    
    return {
        isValid: cols >= 1 && rows >= 1,
        effectiveCols: Math.max(1, cols),
        effectiveRows: Math.max(1, rows),
        adjustedPixelSize: pixelSize,
        originalPixelSize: pixelSize,
        performanceLevel: pixelSize <= 2 ? 'ultra-high' : pixelSize <= 4 ? 'high' : 'normal'
    };
}

// Simplified Floyd-Steinberg dithering for worker
function applyFloydSteinbergDither(imageData, palette) {
    // Create a copy of the image data
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Convert palette to RGB array for faster access
    const paletteRGB = palette.map(color => {
        if (color.isTransparent) return null;
        const rgb = hexToRgb(color.color);
        return [rgb.r, rgb.g, rgb.b];
    }).filter(rgb => rgb !== null);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            const oldPixel = [data[idx], data[idx + 1], data[idx + 2]];
            const newPixel = findClosestColor(oldPixel, paletteRGB);
            
            data[idx] = newPixel[0];
            data[idx + 1] = newPixel[1];
            data[idx + 2] = newPixel[2];
            
            // Calculate quantization error
            const quantError = [
                oldPixel[0] - newPixel[0],
                oldPixel[1] - newPixel[1],
                oldPixel[2] - newPixel[2]
            ];
            
            // Distribute error to neighboring pixels
            distributeError(data, x, y, quantError, width, height);
        }
    }
    
    return {
        data: data,
        width: width,
        height: height
    };
}

// Find closest color in palette
function findClosestColor(pixel, palette) {
    let minDistance = Infinity;
    let closestColor = pixel;
    
    for (const color of palette) {
        const distance = Math.sqrt(
            Math.pow(pixel[0] - color[0], 2) +
            Math.pow(pixel[1] - color[1], 2) +
            Math.pow(pixel[2] - color[2], 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    
    return closestColor;
}

// Distribute quantization error
function distributeError(data, x, y, error, width, height) {
    const positions = [
        [x + 1, y, 7/16],
        [x - 1, y + 1, 3/16],
        [x, y + 1, 5/16],
        [x + 1, y + 1, 1/16]
    ];
    
    positions.forEach(([nx, ny, factor]) => {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            data[idx] = Math.max(0, Math.min(255, data[idx] + error[0] * factor));
            data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + error[1] * factor));
            data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + error[2] * factor));
        }
    });
}

// Handle dithering task
function handleDithering(data) {
    const { imageData, palette } = data;
    
    try {
        const result = applyFloydSteinbergDither(imageData, palette);
        self.postMessage({
            type: 'ditherComplete',
            result: result
        });
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error.message
        });
    }
}