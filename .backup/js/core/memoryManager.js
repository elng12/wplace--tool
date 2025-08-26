/**
 * 内存管理和资源管理模块
 * 提供Canvas、ImageData等资源的高效管理
 */

import { CONFIG } from '../config.js';
import { MemoryError } from './errorHandler.js';

/**
 * Canvas资源管理器
 */
export class CanvasResourceManager {
    constructor() {
        this.canvasPool = new Map(); // size -> Canvas[]
        this.activeCanvases = new Set();
        this.maxPoolSize = 20;
        this.totalMemoryUsage = 0;
        this.maxMemoryLimit = 100 * 1024 * 1024; // 100MB
        
        // 监听页面卸载事件
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    /**
     * 获取或创建Canvas
     */
    getCanvas(width, height) {
        const size = `${width}x${height}`;
        const pool = this.canvasPool.get(size) || [];
        
        if (pool.length > 0) {
            const canvas = pool.pop();
            this.activeCanvases.add(canvas);
            
            // 清理canvas内容
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            return canvas;
        }

        // 检查内存限制
        const requiredMemory = width * height * 4; // RGBA
        if (this.totalMemoryUsage + requiredMemory > this.maxMemoryLimit) {
            this.performGarbageCollection();
            
            if (this.totalMemoryUsage + requiredMemory > this.maxMemoryLimit) {
                throw new MemoryError('Canvas内存使用超过限制', {
                    currentUsage: this.totalMemoryUsage,
                    requiredMemory: requiredMemory,
                    maxLimit: this.maxMemoryLimit
                });
            }
        }

        // 创建新Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        this.activeCanvases.add(canvas);
        this.totalMemoryUsage += requiredMemory;
        
        return canvas;
    }

    /**
     * 归还Canvas到池中
     */
    returnCanvas(canvas) {
        if (!this.activeCanvases.has(canvas)) {
            return; // 不是从池中获取的canvas
        }
        
        this.activeCanvases.delete(canvas);
        
        const size = `${canvas.width}x${canvas.height}`;
        const pool = this.canvasPool.get(size) || [];
        
        if (pool.length < this.maxPoolSize) {
            pool.push(canvas);
            this.canvasPool.set(size, pool);
        } else {
            // 池已满，释放canvas
            this.releaseCanvas(canvas);
        }
    }

    /**
     * 释放Canvas资源
     */
    releaseCanvas(canvas) {
        const memoryUsage = canvas.width * canvas.height * 4;
        this.totalMemoryUsage -= memoryUsage;
        
        // 清理canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        
        this.activeCanvases.delete(canvas);
    }

    /**
     * 垃圾回收 - 清理最少使用的资源
     */
    performGarbageCollection() {
        // 清理池中的canvas，保留每个尺寸最多3个
        for (const [size, pool] of this.canvasPool.entries()) {
            while (pool.length > 3) {
                const canvas = pool.pop();
                this.releaseCanvas(canvas);
            }
        }

        console.log(`Canvas垃圾回收完成，释放内存: ${this.getMemoryStats().totalMemoryUsage / 1024 / 1024}MB`);
    }

    /**
     * 获取内存使用统计
     */
    getMemoryStats() {
        const poolCount = Array.from(this.canvasPool.values())
            .reduce((sum, pool) => sum + pool.length, 0);
            
        return {
            totalMemoryUsage: this.totalMemoryUsage,
            activeCanvases: this.activeCanvases.size,
            pooledCanvases: poolCount,
            poolSizes: Object.fromEntries(
                Array.from(this.canvasPool.entries())
                    .map(([size, pool]) => [size, pool.length])
            )
        };
    }

    /**
     * 完全清理所有资源
     */
    cleanup() {
        // 释放所有活动canvas
        for (const canvas of this.activeCanvases) {
            this.releaseCanvas(canvas);
        }

        // 释放池中的canvas
        for (const [size, pool] of this.canvasPool.entries()) {
            pool.forEach(canvas => this.releaseCanvas(canvas));
        }

        this.canvasPool.clear();
        this.activeCanvases.clear();
        this.totalMemoryUsage = 0;
    }

    /**
     * 检查是否需要执行垃圾回收
     */
    shouldPerformGC() {
        return this.totalMemoryUsage > this.maxMemoryLimit * 0.8; // 80%阈值
    }
}

/**
 * ImageData内存管理器（增强版）
 */
export class ImageDataManager {
    constructor() {
        this.dataPool = new Map(); // size -> ImageData[]
        this.activeData = new WeakSet();
        this.maxPoolSize = 15;
        this.totalAllocated = 0;
        this.maxMemoryUsage = 200 * 1024 * 1024; // 200MB
        this.allocationHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * 获取或创建ImageData
     */
    getImageData(width, height) {
        const size = `${width}x${height}`;
        const pool = this.dataPool.get(size) || [];

        if (pool.length > 0) {
            const imageData = pool.pop();
            this.activeData.add(imageData);
            
            // 清理数据
            imageData.data.fill(0);
            
            this.recordAllocation(width, height, 'reused');
            return imageData;
        }

        // 检查内存限制
        const requiredMemory = width * height * 4;
        if (this.totalAllocated + requiredMemory > this.maxMemoryUsage) {
            this.performMemoryOptimization();
            
            if (this.totalAllocated + requiredMemory > this.maxMemoryUsage) {
                throw new MemoryError('ImageData内存使用超过限制', {
                    currentUsage: this.totalAllocated,
                    requiredMemory: requiredMemory,
                    maxLimit: this.maxMemoryUsage
                });
            }
        }

        // 创建新的ImageData
        const imageData = new ImageData(width, height);
        this.activeData.add(imageData);
        this.totalAllocated += requiredMemory;
        
        this.recordAllocation(width, height, 'created');
        return imageData;
    }

    /**
     * 创建ImageData副本
     */
    cloneImageData(originalImageData) {
        const clone = this.getImageData(originalImageData.width, originalImageData.height);
        clone.data.set(originalImageData.data);
        return clone;
    }

    /**
     * 归还ImageData到池中
     */
    returnImageData(imageData) {
        if (!this.activeData.has(imageData)) {
            return; // 不是从池中获取的数据
        }

        const size = `${imageData.width}x${imageData.height}`;
        const pool = this.dataPool.get(size) || [];

        if (pool.length < this.maxPoolSize) {
            pool.push(imageData);
            this.dataPool.set(size, pool);
        } else {
            // 池已满，释放内存
            this.totalAllocated -= imageData.width * imageData.height * 4;
        }
        
        this.recordAllocation(imageData.width, imageData.height, 'returned');
    }

    /**
     * 内存优化
     */
    performMemoryOptimization() {
        let freedMemory = 0;
        
        // 清理池中的数据，保留每个尺寸最多5个
        for (const [size, pool] of this.dataPool.entries()) {
            while (pool.length > 5) {
                const imageData = pool.pop();
                freedMemory += imageData.width * imageData.height * 4;
                this.totalAllocated -= imageData.width * imageData.height * 4;
            }
        }

        console.log(`ImageData内存优化完成，释放内存: ${freedMemory / 1024 / 1024}MB`);
    }

    /**
     * 记录分配历史
     */
    recordAllocation(width, height, action) {
        const record = {
            timestamp: Date.now(),
            size: `${width}x${height}`,
            memory: width * height * 4,
            action: action
        };

        this.allocationHistory.push(record);
        
        if (this.allocationHistory.length > this.maxHistorySize) {
            this.allocationHistory.shift();
        }
    }

    /**
     * 获取内存统计
     */
    getMemoryStats() {
        const poolStats = {};
        let totalPooled = 0;
        
        for (const [size, pool] of this.dataPool.entries()) {
            poolStats[size] = pool.length;
            totalPooled += pool.length;
        }

        return {
            totalAllocated: this.totalAllocated,
            totalPooled: totalPooled,
            poolStats: poolStats,
            recentAllocations: this.allocationHistory.slice(-10)
        };
    }

    /**
     * 清理所有资源
     */
    cleanup() {
        this.dataPool.clear();
        this.totalAllocated = 0;
        this.allocationHistory.length = 0;
    }
}

/**
 * 通用资源管理器
 */
export class ResourceManager {
    constructor() {
        this.canvasManager = new CanvasResourceManager();
        this.imageDataManager = new ImageDataManager();
        this.cleanupInterval = null;
        this.monitoringEnabled = false;
        
        this.startPeriodicCleanup();
    }

    /**
     * 开始定期清理
     */
    startPeriodicCleanup() {
        if (this.cleanupInterval) return;
        
        this.cleanupInterval = setInterval(() => {
            this.performPeriodicMaintenance();
        }, 60000); // 每分钟执行一次
    }

    /**
     * 停止定期清理
     */
    stopPeriodicCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * 执行定期维护
     */
    performPeriodicMaintenance() {
        const canvasStats = this.canvasManager.getMemoryStats();
        const imageDataStats = this.imageDataManager.getMemoryStats();
        
        // 检查是否需要垃圾回收
        if (this.canvasManager.shouldPerformGC()) {
            this.canvasManager.performGarbageCollection();
        }

        // ImageData内存超过150MB时进行优化
        if (imageDataStats.totalAllocated > 150 * 1024 * 1024) {
            this.imageDataManager.performMemoryOptimization();
        }

        if (this.monitoringEnabled) {
            console.log('资源管理器定期维护:', {
                canvas: canvasStats,
                imageData: imageDataStats,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * 获取Canvas
     */
    getCanvas(width, height) {
        return this.canvasManager.getCanvas(width, height);
    }

    /**
     * 归还Canvas
     */
    returnCanvas(canvas) {
        this.canvasManager.returnCanvas(canvas);
    }

    /**
     * 获取ImageData
     */
    getImageData(width, height) {
        return this.imageDataManager.getImageData(width, height);
    }

    /**
     * 归还ImageData
     */
    returnImageData(imageData) {
        this.imageDataManager.returnImageData(imageData);
    }

    /**
     * 克隆ImageData
     */
    cloneImageData(imageData) {
        return this.imageDataManager.cloneImageData(imageData);
    }

    /**
     * 强制垃圾回收
     */
    forceGarbageCollection() {
        this.canvasManager.performGarbageCollection();
        this.imageDataManager.performMemoryOptimization();
    }

    /**
     * 获取综合内存统计
     */
    getMemoryStats() {
        const canvasStats = this.canvasManager.getMemoryStats();
        const imageDataStats = this.imageDataManager.getMemoryStats();
        
        return {
            canvas: canvasStats,
            imageData: imageDataStats,
            totalMemory: canvasStats.totalMemoryUsage + imageDataStats.totalAllocated,
            timestamp: Date.now()
        };
    }

    /**
     * 启用/禁用监控
     */
    setMonitoring(enabled) {
        this.monitoringEnabled = enabled;
    }

    /**
     * 获取内存使用建议
     */
    getMemoryRecommendations() {
        const stats = this.getMemoryStats();
        const recommendations = [];
        
        const totalMemoryMB = stats.totalMemory / 1024 / 1024;
        
        if (totalMemoryMB > 150) {
            recommendations.push({
                level: 'warning',
                message: `内存使用较高 (${totalMemoryMB.toFixed(1)}MB)，建议关闭其他标签页或减小图像尺寸`
            });
        }
        
        if (stats.canvas.activeCanvases > 10) {
            recommendations.push({
                level: 'info',
                message: `当前有${stats.canvas.activeCanvases}个活动Canvas，考虑及时释放不需要的资源`
            });
        }
        
        if (stats.imageData.totalPooled > 20) {
            recommendations.push({
                level: 'info',
                message: '内存池中缓存较多，系统将自动清理旧的缓存数据'
            });
        }

        return recommendations;
    }

    /**
     * 完全清理
     */
    cleanup() {
        this.stopPeriodicCleanup();
        this.canvasManager.cleanup();
        this.imageDataManager.cleanup();
    }

    /**
     * 检查内存健康状态
     */
    getMemoryHealth() {
        const stats = this.getMemoryStats();
        const totalMemoryMB = stats.totalMemory / 1024 / 1024;
        
        if (totalMemoryMB < 50) {
            return { status: 'good', message: '内存使用正常' };
        } else if (totalMemoryMB < 100) {
            return { status: 'warning', message: '内存使用中等，建议关注' };
        } else {
            return { status: 'critical', message: '内存使用较高，建议优化' };
        }
    }
}

// 导出单例实例
export const resourceManager = new ResourceManager();

// 在开发模式下启用监控
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    resourceManager.setMonitoring(true);
}