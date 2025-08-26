/**
 * 高性能图像处理核心模块
 * 优化的像素化算法和处理策略
 */

import { CONFIG } from '../config.js';
import { 
    getAverageColorFromRegion, 
    getAverageColorFromRegionWithSampling,
    findNearestPaletteColor,
    initializePaletteRGBCache,
    getWplacePalette
} from '../utils/colorUtils.js';
import { validateImageData, validatePixelSize } from '../utils/validators.js';
import { MemoryError, ImageProcessingError } from './errorHandler.js';

/**
 * 高性能图像处理器类
 */
export class HighPerformanceImageProcessor {
    constructor() {
        this.processingStrategy = null;
        this.memoryPool = new ImageDataMemoryPool();
        this.tileCache = new Map();
        this.lastProcessingMetrics = null;
        
        // 初始化调色板缓存
        initializePaletteRGBCache();
    }

    /**
     * 主要像素化处理接口
     */
    async pixelizeImage(imageData, pixelSize, settings = {}) {
        const startTime = performance.now();
        
        try {
            // 验证输入
            validateImageData(imageData);
            validatePixelSize(pixelSize, imageData);

            // 选择处理策略
            this.processingStrategy = this.selectProcessingStrategy(imageData, pixelSize, settings);
            
            // 执行处理
            const result = await this.executeProcessingStrategy(imageData, pixelSize, settings);
            
            // 记录性能指标
            const endTime = performance.now();
            this.lastProcessingMetrics = {
                processingTime: endTime - startTime,
                strategy: this.processingStrategy.name,
                imageSize: `${imageData.width}x${imageData.height}`,
                pixelSize: pixelSize,
                memoryUsed: this.estimateMemoryUsage(imageData),
                pixelsProcessed: result.pixelData.totalPixels
            };

            return result;

        } catch (error) {
            // 清理资源
            this.cleanup();
            throw error;
        }
    }

    /**
     * 选择最优处理策略
     */
    selectProcessingStrategy(imageData, pixelSize, settings) {
        const imageSize = imageData.width * imageData.height;
        const processedCols = Math.floor(imageData.width / pixelSize);
        const processedRows = Math.floor(imageData.height / pixelSize);
        const processedPixels = processedCols * processedRows;

        // 基于图像大小和复杂度选择策略
        if (imageSize > 4000000) { // > 4MP
            return new MegaPixelStrategy();
        } else if (processedPixels > 50000 || pixelSize <= 2) {
            return new HighPrecisionStrategy();
        } else if (imageSize > 1000000) { // > 1MP
            return new TiledProcessingStrategy();
        } else if (processedPixels > 10000) {
            return new BatchProcessingStrategy();
        } else {
            return new StandardProcessingStrategy();
        }
    }

    /**
     * 执行选定的处理策略
     */
    async executeProcessingStrategy(imageData, pixelSize, settings) {
        return await this.processingStrategy.process(imageData, pixelSize, settings, {
            memoryPool: this.memoryPool,
            cache: this.tileCache,
            onProgress: settings.onProgress
        });
    }

    /**
     * 估算内存使用量
     */
    estimateMemoryUsage(imageData) {
        const imageMemory = imageData.width * imageData.height * 4; // RGBA
        const processingMemory = imageMemory * 0.5; // 处理过程中的临时数据
        const cacheMemory = Math.min(imageMemory * 0.2, 10 * 1024 * 1024); // 缓存，最大10MB
        
        return imageMemory + processingMemory + cacheMemory;
    }

    /**
     * 获取最后的处理指标
     */
    getLastProcessingMetrics() {
        return this.lastProcessingMetrics;
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.memoryPool.cleanup();
        this.tileCache.clear();
        this.processingStrategy = null;
    }

    getPalette() {
        return getWplacePalette();
    }
}

/**
 * ImageData内存池管理
 */
class ImageDataMemoryPool {
    constructor() {
        this.pool = new Map(); // size -> ImageData[]
        this.maxPoolSize = 10;
        this.totalAllocated = 0;
        this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB limit
    }

    /**
     * 获取或创建ImageData
     */
    getImageData(width, height) {
        const size = `${width}x${height}`;
        const pool = this.pool.get(size) || [];

        if (pool.length > 0) {
            const imageData = pool.pop();
            // 清理数据
            imageData.data.fill(0);
            return imageData;
        }

        // 检查内存限制
        const requiredMemory = width * height * 4;
        if (this.totalAllocated + requiredMemory > this.maxMemoryUsage) {
            this.cleanup();
            if (this.totalAllocated + requiredMemory > this.maxMemoryUsage) {
                throw new MemoryError('内存池已满，无法分配新的ImageData');
            }
        }

        // 创建新的ImageData
        const imageData = new ImageData(width, height);
        this.totalAllocated += requiredMemory;
        
        return imageData;
    }

    /**
     * 归还ImageData到池中
     */
    returnImageData(imageData) {
        const size = `${imageData.width}x${imageData.height}`;
        const pool = this.pool.get(size) || [];

        if (pool.length < this.maxPoolSize) {
            pool.push(imageData);
            this.pool.set(size, pool);
        } else {
            // 池已满，释放内存
            this.totalAllocated -= imageData.width * imageData.height * 4;
        }
    }

    /**
     * 清理内存池
     */
    cleanup() {
        this.pool.clear();
        this.totalAllocated = 0;
    }

    /**
     * 获取内存使用统计
     */
    getMemoryStats() {
        return {
            totalAllocated: this.totalAllocated,
            poolCount: Array.from(this.pool.values()).reduce((sum, pool) => sum + pool.length, 0),
            maxMemoryUsage: this.maxMemoryUsage
        };
    }
}

/**
 * 处理策略基类
 */
class ProcessingStrategy {
    constructor(name) {
        this.name = name;
    }

    async process(imageData, pixelSize, settings, context) {
        throw new Error('子类必须实现process方法');
    }

    /**
     * 通用的像素数据创建方法
     */
    createPixelData(imageData, pixelSize, settings, context) {
        const cols = Math.floor(imageData.width / pixelSize);
        const rows = Math.floor(imageData.height / pixelSize);
        const pixels = [];
        const usedColors = new Set();

        const samplingStep = this.getSamplingStep(pixelSize);
        const useAveraging = settings.useAveraging !== false;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * pixelSize;
                const y = row * pixelSize;

                let avgColor;
                if (useAveraging && pixelSize > 1) {
                    avgColor = samplingStep > 1 
                        ? getAverageColorFromRegionWithSampling(imageData, x, y, pixelSize, pixelSize, samplingStep)
                        : getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);
                } else {
                    // 直接采样中心点
                    avgColor = this.getSinglePixelColor(imageData, x + Math.floor(pixelSize/2), y + Math.floor(pixelSize/2));
                }

                const nearestColor = findNearestPaletteColor(avgColor);

                pixels.push({
                    x: x,
                    y: y,
                    color: nearestColor.color,
                    size: pixelSize
                });

                usedColors.add(nearestColor.color);
            }

            // 报告进度
            if (context.onProgress && row % Math.max(1, Math.floor(rows / 20)) === 0) {
                const progress = ((row + 1) / rows) * 100;
                context.onProgress(progress);
            }
        }

        return {
            pixels: pixels,
            usedColors: Array.from(usedColors),
            totalPixels: pixels.length
        };
    }

    /**
     * 获取采样步长
     */
    getSamplingStep(pixelSize) {
        if (pixelSize <= 2) return 1;
        if (pixelSize <= 4) return 1;
        if (pixelSize <= 8) return 2;
        return Math.max(2, Math.floor(pixelSize / 4));
    }

    /**
     * 获取单个像素颜色
     */
    getSinglePixelColor(imageData, x, y) {
        const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
        const data = imageData.data;
        
        return {
            r: data[index] || 0,
            g: data[index + 1] || 0,
            b: data[index + 2] || 0
        };
    }
}

/**
 * 标准处理策略 - 适用于小图像
 */
class StandardProcessingStrategy extends ProcessingStrategy {
    constructor() {
        super('standard');
    }

    async process(imageData, pixelSize, settings, context) {
        const pixelData = this.createPixelData(imageData, pixelSize, settings, context);
        
        return {
            pixelData: pixelData,
            validation: {
                effectiveCols: Math.floor(imageData.width / pixelSize),
                effectiveRows: Math.floor(imageData.height / pixelSize),
                adjustedPixelSize: pixelSize
            },
            processingTime: Date.now(),
            timestamp: Date.now()
        };
    }
}

/**
 * 批处理策略 - 适用于中等大小图像
 */
class BatchProcessingStrategy extends ProcessingStrategy {
    constructor() {
        super('batch');
    }

    async process(imageData, pixelSize, settings, context) {
        const cols = Math.floor(imageData.width / pixelSize);
        const rows = Math.floor(imageData.height / pixelSize);
        const pixels = [];
        const usedColors = new Set();
        
        const batchSize = Math.max(100, Math.min(1000, Math.floor(cols * rows / 50)));
        
        for (let batchStart = 0; batchStart < rows; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, rows);
            
            // 处理批次
            const batchPixels = await this.processBatch(
                imageData, pixelSize, batchStart, batchEnd, cols, settings
            );
            
            pixels.push(...batchPixels.pixels);
            batchPixels.colors.forEach(color => usedColors.add(color));
            
            // 报告进度
            if (context.onProgress) {
                const progress = (batchEnd / rows) * 100;
                context.onProgress(progress);
            }
            
            // 让出控制权给UI
            if (batchEnd < rows) {
                await this.yieldToUI();
            }
        }

        return {
            pixelData: {
                pixels: pixels,
                usedColors: Array.from(usedColors),
                totalPixels: pixels.length
            },
            validation: {
                effectiveCols: cols,
                effectiveRows: rows,
                adjustedPixelSize: pixelSize
            },
            processingTime: Date.now(),
            timestamp: Date.now()
        };
    }

    async processBatch(imageData, pixelSize, startRow, endRow, cols, settings) {
        const pixels = [];
        const colors = new Set();
        const samplingStep = this.getSamplingStep(pixelSize);

        for (let row = startRow; row < endRow; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * pixelSize;
                const y = row * pixelSize;

                const avgColor = samplingStep > 1 
                    ? getAverageColorFromRegionWithSampling(imageData, x, y, pixelSize, pixelSize, samplingStep)
                    : getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);

                const nearestColor = findNearestPaletteColor(avgColor);

                pixels.push({
                    x: x,
                    y: y,
                    color: nearestColor.color,
                    size: pixelSize
                });

                colors.add(nearestColor.color);
            }
        }

        return { pixels, colors };
    }

    yieldToUI() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
}

/**
 * 分块处理策略 - 适用于大图像
 */
class TiledProcessingStrategy extends ProcessingStrategy {
    constructor() {
        super('tiled');
    }

    async process(imageData, pixelSize, settings, context) {
        const tileSize = Math.min(256, Math.max(64, Math.floor(Math.sqrt(imageData.width * imageData.height) / 10)));
        const tilesX = Math.ceil(imageData.width / tileSize);
        const tilesY = Math.ceil(imageData.height / tileSize);
        
        const allPixels = [];
        const usedColors = new Set();
        let processedTiles = 0;
        const totalTiles = tilesX * tilesY;

        for (let tileY = 0; tileY < tilesY; tileY++) {
            for (let tileX = 0; tileX < tilesX; tileX++) {
                const startX = tileX * tileSize;
                const startY = tileY * tileSize;
                const endX = Math.min(startX + tileSize, imageData.width);
                const endY = Math.min(startY + tileSize, imageData.height);

                // 处理单个分块
                const tileResult = await this.processTile(
                    imageData, pixelSize, startX, startY, endX, endY, settings
                );

                allPixels.push(...tileResult.pixels);
                tileResult.colors.forEach(color => usedColors.add(color));

                processedTiles++;

                // 报告进度
                if (context.onProgress) {
                    const progress = (processedTiles / totalTiles) * 100;
                    context.onProgress(progress);
                }

                // 定期让出控制权
                if (processedTiles % 4 === 0) {
                    await this.yieldToUI();
                }
            }
        }

        return {
            pixelData: {
                pixels: allPixels,
                usedColors: Array.from(usedColors),
                totalPixels: allPixels.length
            },
            validation: {
                effectiveCols: Math.floor(imageData.width / pixelSize),
                effectiveRows: Math.floor(imageData.height / pixelSize),
                adjustedPixelSize: pixelSize
            },
            processingTime: Date.now(),
            timestamp: Date.now()
        };
    }

    async processTile(imageData, pixelSize, startX, startY, endX, endY, settings) {
        const pixels = [];
        const colors = new Set();
        const samplingStep = this.getSamplingStep(pixelSize);

        const colStart = Math.floor(startX / pixelSize);
        const colEnd = Math.floor(endX / pixelSize);
        const rowStart = Math.floor(startY / pixelSize);
        const rowEnd = Math.floor(endY / pixelSize);

        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                const x = col * pixelSize;
                const y = row * pixelSize;

                // 确保不超出图像边界
                if (x >= imageData.width || y >= imageData.height) continue;

                const avgColor = samplingStep > 1
                    ? getAverageColorFromRegionWithSampling(imageData, x, y, pixelSize, pixelSize, samplingStep)
                    : getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);

                const nearestColor = findNearestPaletteColor(avgColor);

                pixels.push({
                    x: x,
                    y: y,
                    color: nearestColor.color,
                    size: pixelSize
                });

                colors.add(nearestColor.color);
            }
        }

        return { pixels, colors };
    }

    yieldToUI() {
        return new Promise(resolve => setTimeout(resolve, 1));
    }
}

/**
 * 高精度处理策略 - 适用于小像素尺寸
 */
class HighPrecisionStrategy extends ProcessingStrategy {
    constructor() {
        super('high-precision');
    }

    async process(imageData, pixelSize, settings, context) {
        // 高精度模式使用更精确的颜色计算
        const cols = Math.floor(imageData.width / pixelSize);
        const rows = Math.floor(imageData.height / pixelSize);
        const pixels = [];
        const usedColors = new Set();
        
        // 使用精确采样，不使用采样步长
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * pixelSize;
                const y = row * pixelSize;

                // 高精度模式：总是使用完整区域平均
                const avgColor = getAverageColorFromRegion(imageData, x, y, pixelSize, pixelSize);
                const nearestColor = findNearestPaletteColor(avgColor);

                pixels.push({
                    x: x,
                    y: y,
                    color: nearestColor.color,
                    size: pixelSize
                });

                usedColors.add(nearestColor.color);
            }

            // 更频繁的进度报告
            if (context.onProgress && row % Math.max(1, Math.floor(rows / 50)) === 0) {
                const progress = ((row + 1) / rows) * 100;
                context.onProgress(progress);
            }

            // 每处理50行让出一次控制权
            if (row % 50 === 0 && row > 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return {
            pixelData: {
                pixels: pixels,
                usedColors: Array.from(usedColors),
                totalPixels: pixels.length
            },
            validation: {
                effectiveCols: cols,
                effectiveRows: rows,
                adjustedPixelSize: pixelSize
            },
            processingTime: Date.now(),
            timestamp: Date.now()
        };
    }
}

/**
 * 超大图像处理策略 - 适用于4MP以上图像
 */
class MegaPixelStrategy extends ProcessingStrategy {
    constructor() {
        super('megapixel');
    }

    async process(imageData, pixelSize, settings, context) {
        // 超大图像使用更激进的优化策略
        const cols = Math.floor(imageData.width / pixelSize);
        const rows = Math.floor(imageData.height / pixelSize);
        
        // 动态调整采样策略以减少计算量
        const adaptivePixelSize = Math.max(pixelSize, Math.floor(Math.sqrt(imageData.width * imageData.height) / 1000));
        const adaptiveCols = Math.floor(imageData.width / adaptivePixelSize);
        const adaptiveRows = Math.floor(imageData.height / adaptivePixelSize);
        
        const pixels = [];
        const usedColors = new Set();
        
        // 使用大采样步长
        const samplingStep = Math.max(2, Math.floor(adaptivePixelSize / 2));
        
        const processChunkSize = Math.max(50, Math.min(200, Math.floor(adaptiveRows / 20)));
        
        for (let chunkStart = 0; chunkStart < adaptiveRows; chunkStart += processChunkSize) {
            const chunkEnd = Math.min(chunkStart + processChunkSize, adaptiveRows);
            
            // 处理块
            const chunkResult = await this.processChunk(
                imageData, adaptivePixelSize, chunkStart, chunkEnd, adaptiveCols, samplingStep
            );
            
            pixels.push(...chunkResult.pixels);
            chunkResult.colors.forEach(color => usedColors.add(color));
            
            // 报告进度
            if (context.onProgress) {
                const progress = (chunkEnd / adaptiveRows) * 100;
                context.onProgress(progress);
            }
            
            // 给UI更多时间
            await new Promise(resolve => setTimeout(resolve, 2));
        }

        // 如果使用了适应性像素尺寸，需要重新映射到原始像素尺寸
        if (adaptivePixelSize !== pixelSize) {
            const scaledPixels = this.scalePixelsToOriginalSize(pixels, adaptivePixelSize, pixelSize);
            pixels.length = 0;
            pixels.push(...scaledPixels);
        }

        return {
            pixelData: {
                pixels: pixels,
                usedColors: Array.from(usedColors),
                totalPixels: pixels.length
            },
            validation: {
                effectiveCols: cols,
                effectiveRows: rows,
                adjustedPixelSize: pixelSize,
                adaptiveProcessing: adaptivePixelSize !== pixelSize,
                adaptivePixelSize: adaptivePixelSize
            },
            processingTime: Date.now(),
            timestamp: Date.now()
        };
    }

    async processChunk(imageData, pixelSize, startRow, endRow, cols, samplingStep) {
        const pixels = [];
        const colors = new Set();

        for (let row = startRow; row < endRow; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * pixelSize;
                const y = row * pixelSize;

                // 使用采样优化的区域平均
                const avgColor = getAverageColorFromRegionWithSampling(
                    imageData, x, y, pixelSize, pixelSize, samplingStep
                );

                const nearestColor = findNearestPaletteColor(avgColor);

                pixels.push({
                    x: x,
                    y: y,
                    color: nearestColor.color,
                    size: pixelSize
                });

                colors.add(nearestColor.color);
            }
        }

        return { pixels, colors };
    }

    scalePixelsToOriginalSize(pixels, adaptivePixelSize, originalPixelSize) {
        const scaleFactor = originalPixelSize / adaptivePixelSize;
        const scaledPixels = [];

        pixels.forEach(pixel => {
            // 为每个适应性像素生成多个原始尺寸像素
            const pixelsPerRow = Math.ceil(scaleFactor);
            const pixelsPerCol = Math.ceil(scaleFactor);

            for (let row = 0; row < pixelsPerRow; row++) {
                for (let col = 0; col < pixelsPerCol; col++) {
                    scaledPixels.push({
                        x: pixel.x + col * originalPixelSize,
                        y: pixel.y + row * originalPixelSize,
                        color: pixel.color,
                        size: originalPixelSize
                    });
                }
            }
        });

        return scaledPixels;
    }
}

// 导出单例实例
export const imageProcessor = new HighPerformanceImageProcessor();