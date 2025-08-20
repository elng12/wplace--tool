/**
 * 智能缓存管理模块
 * 提供多层缓存机制，避免重复计算，提升性能
 */

import { CONFIG } from '../config.js';

/**
 * LRU缓存实现
 */
class LRUCache {
    constructor(maxSize, maxMemory = Infinity) {
        this.maxSize = maxSize;
        this.maxMemory = maxMemory;
        this.cache = new Map();
        this.currentMemory = 0;
    }

    get(key) {
        if (this.cache.has(key)) {
            // 移到末尾（最近使用）
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value.data;
        }
        return null;
    }

    set(key, data, memorySize = 0) {
        // 检查内存限制
        if (memorySize > 0 && this.currentMemory + memorySize > this.maxMemory) {
            this.evictByMemory(memorySize);
        }

        // 如果已存在，先删除旧的
        if (this.cache.has(key)) {
            const oldValue = this.cache.get(key);
            this.currentMemory -= oldValue.memorySize || 0;
            this.cache.delete(key);
        }

        // 检查大小限制
        while (this.cache.size >= this.maxSize) {
            this.evictLeastRecent();
        }

        // 添加新项
        this.cache.set(key, {
            data: data,
            memorySize: memorySize,
            timestamp: Date.now()
        });

        this.currentMemory += memorySize;
    }

    has(key) {
        return this.cache.has(key);
    }

    delete(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.currentMemory -= value.memorySize || 0;
            this.cache.delete(key);
            return true;
        }
        return false;
    }

    clear() {
        this.cache.clear();
        this.currentMemory = 0;
    }

    evictLeastRecent() {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
            this.delete(firstKey);
        }
    }

    evictByMemory(requiredMemory) {
        // 驱逐最久未使用的项直到有足够内存
        while (this.currentMemory + requiredMemory > this.maxMemory && this.cache.size > 0) {
            this.evictLeastRecent();
        }
    }

    size() {
        return this.cache.size;
    }

    getMemoryUsage() {
        return this.currentMemory;
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            memoryUsage: this.currentMemory,
            maxMemory: this.maxMemory,
            utilizationPercent: (this.cache.size / this.maxSize) * 100
        };
    }
}

/**
 * 图像处理结果缓存管理器
 */
export class ProcessingResultCache {
    constructor() {
        this.imageHashCache = new LRUCache(50, 20 * 1024 * 1024); // 20MB用于图像哈希
        this.pixelizedResultCache = new LRUCache(20, 100 * 1024 * 1024); // 100MB用于处理结果
        this.thumbnailCache = new LRUCache(100, 10 * 1024 * 1024); // 10MB用于缩略图
        
        this.hitCount = 0;
        this.missCount = 0;
        
        // 定期清理过期缓存
        this.startPeriodicCleanup();
    }

    /**
     * 生成图像数据的哈希
     */
    generateImageHash(imageData, pixelSize, settings) {
        const key = `${imageData.width}x${imageData.height}`;
        const settingsHash = this.hashObject({
            pixelSize: pixelSize,
            enableDithering: settings.enableDithering || false,
            scalingMethod: settings.scalingMethod || 'nearest'
        });
        
        // 对图像数据进行简单采样哈希
        const sampleData = this.sampleImageData(imageData);
        const dataHash = this.hashArray(sampleData);
        
        return `${key}_${settingsHash}_${dataHash}`;
    }

    /**
     * 采样图像数据（用于哈希计算）
     */
    sampleImageData(imageData, sampleCount = 100) {
        const data = imageData.data;
        const step = Math.max(1, Math.floor(data.length / (sampleCount * 4)));
        const samples = [];
        
        for (let i = 0; i < data.length; i += step * 4) {
            // 取RGB值，忽略Alpha
            samples.push(data[i], data[i + 1], data[i + 2]);
        }
        
        return samples;
    }

    /**
     * 简单哈希函数
     */
    hashArray(arr) {
        let hash = 0;
        for (let i = 0; i < arr.length; i++) {
            const char = arr[i];
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * 对象哈希
     */
    hashObject(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        return this.hashArray(Array.from(str).map(c => c.charCodeAt(0)));
    }

    /**
     * 获取缓存的处理结果
     */
    getProcessingResult(imageData, pixelSize, settings) {
        const hash = this.generateImageHash(imageData, pixelSize, settings);
        const result = this.pixelizedResultCache.get(hash);
        
        if (result) {
            this.hitCount++;
            return result;
        } else {
            this.missCount++;
            return null;
        }
    }

    /**
     * 缓存处理结果
     */
    cacheProcessingResult(imageData, pixelSize, settings, result) {
        const hash = this.generateImageHash(imageData, pixelSize, settings);
        
        // 估算结果的内存使用
        const memorySize = this.estimateResultMemorySize(result);
        
        this.pixelizedResultCache.set(hash, result, memorySize);
        
        // 同时缓存图像哈希信息
        this.imageHashCache.set(hash, {
            width: imageData.width,
            height: imageData.height,
            pixelSize: pixelSize,
            timestamp: Date.now()
        }, 1024); // 假设每个哈希信息占用1KB
    }

    /**
     * 估算处理结果的内存使用
     */
    estimateResultMemorySize(result) {
        if (!result || !result.pixelData) return 0;
        
        const pixelCount = result.pixelData.totalPixels || 0;
        const colorCount = result.pixelData.usedColors?.length || 0;
        
        // 每个像素大约占用64字节（估算）
        const pixelMemory = pixelCount * 64;
        // 每个颜色大约占用32字节
        const colorMemory = colorCount * 32;
        // 其他数据
        const metadataMemory = 1024;
        
        return pixelMemory + colorMemory + metadataMemory;
    }

    /**
     * 缓存缩略图
     */
    cacheThumbnail(imageData, thumbnailCanvas) {
        const key = `thumb_${imageData.width}x${imageData.height}`;
        const thumbnailData = thumbnailCanvas.toDataURL('image/jpeg', 0.7);
        
        this.thumbnailCache.set(key, thumbnailData, thumbnailData.length);
    }

    /**
     * 获取缓存的缩略图
     */
    getThumbnail(imageData) {
        const key = `thumb_${imageData.width}x${imageData.height}`;
        return this.thumbnailCache.get(key);
    }

    /**
     * 开始定期清理
     */
    startPeriodicCleanup() {
        setInterval(() => {
            this.performPeriodicCleanup();
        }, 5 * 60 * 1000); // 每5分钟清理一次
    }

    /**
     * 执行定期清理
     */
    performPeriodicCleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30分钟过期
        
        // 清理过期的图像哈希
        for (const [key, value] of this.imageHashCache.cache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.imageHashCache.delete(key);
                // 同时清理对应的处理结果
                this.pixelizedResultCache.delete(key);
            }
        }

        console.log('缓存定期清理完成:', this.getCacheStats());
    }

    /**
     * 获取缓存统计信息
     */
    getCacheStats() {
        return {
            imageHash: this.imageHashCache.getStats(),
            pixelizedResult: this.pixelizedResultCache.getStats(),
            thumbnail: this.thumbnailCache.getStats(),
            hitRate: this.hitCount + this.missCount > 0 
                ? (this.hitCount / (this.hitCount + this.missCount) * 100).toFixed(2) + '%'
                : '0%',
            totalHits: this.hitCount,
            totalMisses: this.missCount
        };
    }

    /**
     * 预热缓存 - 预加载常用设置的结果
     */
    preloadCache(imageData, commonSettings = []) {
        const preloadPromises = commonSettings.map(async (settings) => {
            const hash = this.generateImageHash(imageData, settings.pixelSize, settings);
            
            // 如果缓存中没有，创建一个预处理任务
            if (!this.pixelizedResultCache.has(hash)) {
                // 这里可以添加后台预处理逻辑
                console.log(`预热缓存: ${hash}`);
            }
        });

        return Promise.all(preloadPromises);
    }

    /**
     * 清理所有缓存
     */
    clearAll() {
        this.imageHashCache.clear();
        this.pixelizedResultCache.clear();
        this.thumbnailCache.clear();
        this.hitCount = 0;
        this.missCount = 0;
    }

    /**
     * 获取缓存大小建议
     */
    getSizeRecommendations() {
        const stats = this.getCacheStats();
        const recommendations = [];

        if (stats.pixelizedResult.utilizationPercent > 90) {
            recommendations.push({
                type: 'warning',
                message: '处理结果缓存使用率过高，考虑增加缓存大小或清理旧缓存'
            });
        }

        if (parseFloat(stats.hitRate) < 30) {
            recommendations.push({
                type: 'info',
                message: '缓存命中率较低，可能需要调整缓存策略'
            });
        }

        return recommendations;
    }
}

/**
 * 颜色距离缓存管理器
 */
export class ColorDistanceCache {
    constructor() {
        this.cache = new LRUCache(CONFIG.COLOR_CACHE_MAX_SIZE || 2000);
        this.precomputedDistances = new Map();
        
        // 预计算常用颜色的距离
        this.precomputeCommonColors();
    }

    /**
     * 预计算常用颜色距离
     */
    precomputeCommonColors() {
        // 预计算灰度和基础颜色的距离
        const commonColors = [
            { r: 0, g: 0, b: 0 },       // 黑
            { r: 255, g: 255, b: 255 }, // 白
            { r: 128, g: 128, b: 128 }, // 灰
            { r: 255, g: 0, b: 0 },     // 红
            { r: 0, g: 255, b: 0 },     // 绿
            { r: 0, g: 0, b: 255 },     // 蓝
        ];

        for (const color1 of commonColors) {
            for (const color2 of commonColors) {
                const key = this.getDistanceKey(color1, color2);
                const distance = this.calculateDistance(color1, color2);
                this.precomputedDistances.set(key, distance);
            }
        }
    }

    /**
     * 获取距离缓存键
     */
    getDistanceKey(color1, color2) {
        return `${color1.r},${color1.g},${color1.b}-${color2.r},${color2.g},${color2.b}`;
    }

    /**
     * 获取缓存的颜色距离
     */
    getColorDistance(color1, color2) {
        const key = this.getDistanceKey(color1, color2);
        
        // 先检查预计算的距离
        if (this.precomputedDistances.has(key)) {
            return this.precomputedDistances.get(key);
        }
        
        // 检查LRU缓存
        const cachedDistance = this.cache.get(key);
        if (cachedDistance !== null) {
            return cachedDistance;
        }
        
        // 计算并缓存
        const distance = this.calculateDistance(color1, color2);
        this.cache.set(key, distance);
        
        return distance;
    }

    /**
     * 计算颜色距离（感知加权欧几里得距离）
     */
    calculateDistance(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        
        return Math.sqrt(dr * dr * 2 + dg * dg * 4 + db * db * 3);
    }

    /**
     * 获取缓存统计
     */
    getStats() {
        return {
            lruCache: this.cache.getStats(),
            precomputedEntries: this.precomputedDistances.size
        };
    }

    /**
     * 清理缓存
     */
    clear() {
        this.cache.clear();
        // 保留预计算的距离
    }
}

/**
 * 智能缓存管理器 - 统一管理所有缓存
 */
export class SmartCacheManager {
    constructor() {
        this.processingResultCache = new ProcessingResultCache();
        this.colorDistanceCache = new ColorDistanceCache();
        this.sessionCache = new Map(); // 会话级缓存
        
        this.totalCacheHits = 0;
        this.totalCacheMisses = 0;
        
        // 监听内存压力
        this.monitorMemoryPressure();
    }

    /**
     * 获取处理结果缓存
     */
    getProcessingResult(imageData, pixelSize, settings) {
        const result = this.processingResultCache.getProcessingResult(imageData, pixelSize, settings);
        
        if (result) {
            this.totalCacheHits++;
        } else {
            this.totalCacheMisses++;
        }
        
        return result;
    }

    /**
     * 缓存处理结果
     */
    cacheProcessingResult(imageData, pixelSize, settings, result) {
        this.processingResultCache.cacheProcessingResult(imageData, pixelSize, settings, result);
    }

    /**
     * 获取颜色距离
     */
    getColorDistance(color1, color2) {
        return this.colorDistanceCache.getColorDistance(color1, color2);
    }

    /**
     * 会话缓存操作
     */
    setSessionData(key, data, ttl = 0) {
        const expiryTime = ttl > 0 ? Date.now() + ttl : 0;
        this.sessionCache.set(key, {
            data: data,
            expiryTime: expiryTime
        });
    }

    getSessionData(key) {
        const entry = this.sessionCache.get(key);
        if (!entry) return null;
        
        // 检查是否过期
        if (entry.expiryTime > 0 && Date.now() > entry.expiryTime) {
            this.sessionCache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    /**
     * 监控内存压力
     */
    monitorMemoryPressure() {
        // 如果支持性能监控API
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = performance.memory;
                const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
                
                if (memoryUsagePercent > 80) {
                    console.warn('内存使用率过高，执行缓存清理');
                    this.performEmergencyCleanup();
                }
            }, 30000); // 每30秒检查一次
        }
    }

    /**
     * 紧急缓存清理
     */
    performEmergencyCleanup() {
        // 清理最大的缓存首先
        this.processingResultCache.pixelizedResultCache.evictByMemory(0);
        this.colorDistanceCache.clear();
        
        // 清理会话缓存
        this.sessionCache.clear();
        
        console.log('紧急缓存清理完成');
    }

    /**
     * 优化缓存配置
     */
    optimizeCacheConfiguration(memoryBudget = 200 * 1024 * 1024) { // 200MB预算
        // 根据内存预算调整各缓存的大小
        const processingBudget = memoryBudget * 0.6; // 60%给处理结果
        const thumbnailBudget = memoryBudget * 0.2;  // 20%给缩略图
        const colorBudget = memoryBudget * 0.1;      // 10%给颜色距离
        const sessionBudget = memoryBudget * 0.1;    // 10%给会话数据

        // 动态调整缓存大小（这里简化处理）
        console.log('缓存配置优化:', {
            processing: Math.round(processingBudget / 1024 / 1024) + 'MB',
            thumbnail: Math.round(thumbnailBudget / 1024 / 1024) + 'MB',
            color: Math.round(colorBudget / 1024 / 1024) + 'MB',
            session: Math.round(sessionBudget / 1024 / 1024) + 'MB'
        });
    }

    /**
     * 获取全局缓存统计
     */
    getGlobalCacheStats() {
        const processingStats = this.processingResultCache.getCacheStats();
        const colorStats = this.colorDistanceCache.getStats();
        
        const totalHits = this.totalCacheHits;
        const totalMisses = this.totalCacheMisses;
        const overallHitRate = totalHits + totalMisses > 0 
            ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(2) + '%'
            : '0%';

        return {
            processingResult: processingStats,
            colorDistance: colorStats,
            sessionCache: {
                size: this.sessionCache.size
            },
            overall: {
                hitRate: overallHitRate,
                totalHits: totalHits,
                totalMisses: totalMisses
            }
        };
    }

    /**
     * 清理所有缓存
     */
    clearAll() {
        this.processingResultCache.clearAll();
        this.colorDistanceCache.clear();
        this.sessionCache.clear();
        this.totalCacheHits = 0;
        this.totalCacheMisses = 0;
    }

    /**
     * 获取缓存性能建议
     */
    getPerformanceRecommendations() {
        const stats = this.getGlobalCacheStats();
        const recommendations = [];

        if (parseFloat(stats.overall.hitRate) < 40) {
            recommendations.push({
                type: 'warning',
                message: '总体缓存命中率较低，考虑调整缓存策略或增加缓存大小'
            });
        }

        if (stats.processingResult.pixelizedResult.utilizationPercent > 95) {
            recommendations.push({
                type: 'info',
                message: '处理结果缓存接近满载，可能需要增加内存分配'
            });
        }

        return recommendations;
    }
}

// 导出单例实例
export const smartCacheManager = new SmartCacheManager();