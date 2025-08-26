/**
 * 优化的Worker管理和通信模块
 * 提供高效的Worker池管理和数据传输优化
 */

import { CONFIG, ERROR_CODES } from '../config.js';
import { WorkerError, createProcessingTimeoutError } from './errorHandler.js';

/**
 * Worker池管理器
 */
export class WorkerPoolManager {
    constructor() {
        this.workers = new Map(); // workerId -> WorkerInstance
        this.availableWorkers = [];
        this.busyWorkers = new Set();
        this.maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 6);
        this.workerIdCounter = 0;
        this.pendingTasks = [];
        this.taskIdCounter = 0;
        
        // Worker脚本URL
        this.workerScriptUrl = null;
        
        this.initializeWorkerPool();
    }

    /**
     * 初始化Worker池
     */
    async initializeWorkerPool() {
        try {
            // 创建Worker脚本Blob
            this.workerScriptUrl = await this.createOptimizedWorkerScript();
            
            // 创建初始Worker（懒加载）
            console.log(`Worker池初始化完成，最大Worker数: ${this.maxWorkers}`);
            
        } catch (error) {
            console.warn('Worker池初始化失败:', error);
            throw new WorkerError('Worker池初始化失败', { error: error.message });
        }
    }

    /**
     * 创建优化的Worker脚本
     */
    async createOptimizedWorkerScript() {
        const workerCode = `
            // 优化的Worker脚本
            let isInitialized = false;
            let processingFunctions = {};
            
            // 高性能图像处理函数
            function optimizedPixelizeImageData(imageData, pixelSize, settings) {
                const startTime = performance.now();
                const { width, height, data } = imageData;
                
                const cols = Math.floor(width / pixelSize);
                const rows = Math.floor(height / pixelSize);
                const pixels = [];
                const usedColors = new Set();
                
                // 预计算的调色板RGB值
                const paletteRGB = processingFunctions.paletteRGB;
                
                // 批处理优化
                const batchSize = Math.max(100, Math.min(1000, Math.floor(cols * rows / 100)));
                let processedPixels = 0;
                
                for (let batchStart = 0; batchStart < rows * cols; batchStart += batchSize) {
                    const batchEnd = Math.min(batchStart + batchSize, rows * cols);
                    
                    for (let i = batchStart; i < batchEnd; i++) {
                        const row = Math.floor(i / cols);
                        const col = i % cols;
                        
                        const x = col * pixelSize;
                        const y = row * pixelSize;
                        
                        // 优化的区域平均颜色计算
                        const avgColor = getOptimizedAverageColor(data, width, height, x, y, pixelSize);
                        const nearestColor = findNearestColorOptimized(avgColor, paletteRGB);
                        
                        pixels.push({
                            x: x,
                            y: y,
                            color: nearestColor.color,
                            size: pixelSize
                        });
                        
                        usedColors.add(nearestColor.color);
                        processedPixels++;
                    }
                    
                    // 批处理进度报告
                    if (batchEnd % (batchSize * 5) === 0) {
                        const progress = (batchEnd / (rows * cols)) * 100;
                        self.postMessage({
                            type: 'progress',
                            progress: progress,
                            processed: processedPixels
                        });
                    }
                }
                
                const endTime = performance.now();
                
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
                    processingTime: endTime - startTime,
                    timestamp: Date.now()
                };
            }
            
            // 优化的区域平均颜色计算
            function getOptimizedAverageColor(data, width, height, startX, startY, size) {
                let r = 0, g = 0, b = 0, count = 0;
                
                const endX = Math.min(startX + size, width);
                const endY = Math.min(startY + size, height);
                
                // 采样优化 - 对于大区域使用采样
                const step = size > 4 ? Math.max(1, Math.floor(size / 4)) : 1;
                
                for (let y = startY; y < endY; y += step) {
                    for (let x = startX; x < endX; x += step) {
                        const index = (y * width + x) * 4;
                        if (index < data.length && data[index + 3] > 0) { // 检查alpha
                            r += data[index];
                            g += data[index + 1];
                            b += data[index + 2];
                            count++;
                        }
                    }
                }
                
                if (count === 0) return { r: 0, g: 0, b: 0 };
                
                return {
                    r: Math.round(r / count),
                    g: Math.round(g / count),
                    b: Math.round(b / count)
                };
            }
            
            // 优化的最近颜色查找（使用预计算的距离）
            function findNearestColorOptimized(targetColor, paletteRGB) {
                let minDistance = Infinity;
                let nearestColor = paletteRGB[0];
                
                for (const paletteColor of paletteRGB) {
                    if (paletteColor.isTransparent) continue;
                    
                    // 快速欧几里得距离计算（感知加权）
                    const dr = targetColor.r - paletteColor.r;
                    const dg = targetColor.g - paletteColor.g;
                    const db = targetColor.b - paletteColor.b;
                    
                    const distance = dr * dr * 2 + dg * dg * 4 + db * db * 3;
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestColor = paletteColor;
                    }
                }
                
                return nearestColor;
            }
            
            // 消息处理
            self.onmessage = function(e) {
                const { type, taskId, data } = e.data;
                
                try {
                    switch (type) {
                        case 'init':
                            // 初始化处理函数和数据
                            processingFunctions.paletteRGB = data.paletteRGB;
                            isInitialized = true;
                            self.postMessage({ type: 'initialized', taskId });
                            break;
                            
                        case 'pixelize':
                            if (!isInitialized) {
                                throw new Error('Worker未初始化');
                            }
                            
                            const result = optimizedPixelizeImageData(
                                data.imageData, 
                                data.pixelSize, 
                                data.settings || {}
                            );
                            
                            self.postMessage({
                                type: 'pixelizeComplete',
                                taskId: taskId,
                                result: result
                            });
                            break;
                            
                        case 'terminate':
                            self.close();
                            break;
                            
                        default:
                            throw new Error('未知的消息类型: ' + type);
                    }
                } catch (error) {
                    self.postMessage({
                        type: 'error',
                        taskId: taskId,
                        error: error.message,
                        stack: error.stack
                    });
                }
            };
            
            // Worker错误处理
            self.onerror = function(error) {
                self.postMessage({
                    type: 'error',
                    error: error.message,
                    filename: error.filename,
                    lineno: error.lineno
                });
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    }

    /**
     * 获取可用的Worker
     */
    async getWorker() {
        // 如果有可用的Worker，直接返回
        if (this.availableWorkers.length > 0) {
            const workerId = this.availableWorkers.pop();
            const worker = this.workers.get(workerId);
            this.busyWorkers.add(workerId);
            return worker;
        }

        // 如果Worker数量未达到上限，创建新的Worker
        if (this.workers.size < this.maxWorkers) {
            const worker = await this.createWorker();
            this.busyWorkers.add(worker.id);
            return worker;
        }

        // 等待Worker可用
        return new Promise((resolve) => {
            this.pendingTasks.push(resolve);
        });
    }

    /**
     * 创建新的Worker实例
     */
    async createWorker() {
        const workerId = ++this.workerIdCounter;
        
        const worker = new Worker(this.workerScriptUrl);
        const workerInstance = {
            id: workerId,
            worker: worker,
            isInitialized: false,
            currentTask: null,
            createdAt: Date.now(),
            tasksCompleted: 0
        };

        // 设置消息处理
        worker.onmessage = (e) => this.handleWorkerMessage(workerId, e);
        worker.onerror = (error) => this.handleWorkerError(workerId, error);

        this.workers.set(workerId, workerInstance);

        // 初始化Worker
        await this.initializeWorker(workerInstance);

        return workerInstance;
    }

    /**
     * 初始化Worker
     */
    async initializeWorker(workerInstance) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new WorkerError('Worker初始化超时'));
            }, CONFIG.WORKER_INIT_TIMEOUT);

            const messageHandler = (e) => {
                if (e.data.type === 'initialized') {
                    clearTimeout(timeout);
                    workerInstance.worker.removeEventListener('message', messageHandler);
                    workerInstance.isInitialized = true;
                    resolve();
                }
            };

            workerInstance.worker.addEventListener('message', messageHandler);

            // 发送初始化数据
            workerInstance.worker.postMessage({
                type: 'init',
                data: {
                    paletteRGB: this.getPaletteRGBData()
                }
            });
        });
    }

    /**
     * 获取调色板RGB数据
     */
    getPaletteRGBData() {
        // 导入颜色工具模块的数据
        // 这里需要从主线程传递预处理的调色板数据
        return window.wplaceApp?.getPaletteRGBData?.() || [];
    }

    /**
     * 处理Worker消息
     */
    handleWorkerMessage(workerId, event) {
        const workerInstance = this.workers.get(workerId);
        if (!workerInstance) return;

        const { type, taskId, result, progress, error } = event.data;

        switch (type) {
            case 'pixelizeComplete':
                workerInstance.tasksCompleted++;
                this.completeTask(workerId, taskId, result);
                break;

            case 'progress':
                this.reportProgress(workerId, taskId, progress);
                break;

            case 'error':
                this.handleTaskError(workerId, taskId, error);
                break;

            case 'initialized':
                // 已在initializeWorker中处理
                break;

            default:
                console.warn('未知的Worker消息类型:', type);
        }
    }

    /**
     * 处理Worker错误
     */
    handleWorkerError(workerId, error) {
        console.error(`Worker ${workerId} 错误:`, error);
        
        const workerInstance = this.workers.get(workerId);
        if (workerInstance && workerInstance.currentTask) {
            this.handleTaskError(workerId, workerInstance.currentTask.taskId, error.message);
        }

        // 移除有问题的Worker
        this.removeWorker(workerId);
    }

    /**
     * 执行像素化任务
     */
    async executePixelizeTask(imageData, pixelSize, settings = {}) {
        const taskId = ++this.taskIdCounter;
        
        try {
            const worker = await this.getWorker();
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.handleTaskError(worker.id, taskId, 'Worker处理超时');
                    reject(createProcessingTimeoutError({ taskId, workerId: worker.id }));
                }, CONFIG.WORKER_TIMEOUT);

                // 设置当前任务
                worker.currentTask = {
                    taskId: taskId,
                    resolve: resolve,
                    reject: reject,
                    timeout: timeout,
                    onProgress: settings.onProgress
                };

                // 发送处理请求
                worker.worker.postMessage({
                    type: 'pixelize',
                    taskId: taskId,
                    data: {
                        imageData: imageData,
                        pixelSize: pixelSize,
                        settings: settings
                    }
                });
            });

        } catch (error) {
            throw new WorkerError('Worker任务执行失败', { taskId, error: error.message });
        }
    }

    /**
     * 完成任务
     */
    completeTask(workerId, taskId, result) {
        const workerInstance = this.workers.get(workerId);
        if (!workerInstance || !workerInstance.currentTask) return;

        const task = workerInstance.currentTask;
        if (task.taskId !== taskId) return;

        // 清理任务
        clearTimeout(task.timeout);
        workerInstance.currentTask = null;
        
        // 释放Worker
        this.releaseWorker(workerId);
        
        // 完成任务
        task.resolve(result);
    }

    /**
     * 报告进度
     */
    reportProgress(workerId, taskId, progress) {
        const workerInstance = this.workers.get(workerId);
        if (!workerInstance || !workerInstance.currentTask) return;

        const task = workerInstance.currentTask;
        if (task.taskId === taskId && task.onProgress) {
            task.onProgress(progress);
        }
    }

    /**
     * 处理任务错误
     */
    handleTaskError(workerId, taskId, error) {
        const workerInstance = this.workers.get(workerId);
        if (!workerInstance || !workerInstance.currentTask) return;

        const task = workerInstance.currentTask;
        if (task.taskId !== taskId) return;

        // 清理任务
        clearTimeout(task.timeout);
        workerInstance.currentTask = null;
        
        // 释放Worker
        this.releaseWorker(workerId);
        
        // 报告错误
        task.reject(new WorkerError(error, { taskId, workerId }));
    }

    /**
     * 释放Worker
     */
    releaseWorker(workerId) {
        this.busyWorkers.delete(workerId);
        this.availableWorkers.push(workerId);
        
        // 处理等待的任务
        if (this.pendingTasks.length > 0) {
            const resolve = this.pendingTasks.shift();
            const worker = this.workers.get(workerId);
            this.busyWorkers.add(workerId);
            this.availableWorkers.pop(); // 移除刚加入的workerId
            resolve(worker);
        }
    }

    /**
     * 移除Worker
     */
    removeWorker(workerId) {
        const workerInstance = this.workers.get(workerId);
        if (!workerInstance) return;

        // 终止Worker
        workerInstance.worker.terminate();
        
        // 从各种集合中移除
        this.workers.delete(workerId);
        this.busyWorkers.delete(workerId);
        
        const availableIndex = this.availableWorkers.indexOf(workerId);
        if (availableIndex !== -1) {
            this.availableWorkers.splice(availableIndex, 1);
        }
    }

    /**
     * 获取Worker池统计
     */
    getPoolStats() {
        const workers = Array.from(this.workers.values());
        
        return {
            totalWorkers: workers.length,
            availableWorkers: this.availableWorkers.length,
            busyWorkers: this.busyWorkers.size,
            pendingTasks: this.pendingTasks.length,
            maxWorkers: this.maxWorkers,
            totalTasksCompleted: workers.reduce((sum, w) => sum + w.tasksCompleted, 0),
            avgTasksPerWorker: workers.length > 0 
                ? workers.reduce((sum, w) => sum + w.tasksCompleted, 0) / workers.length 
                : 0
        };
    }

    /**
     * 清理所有Worker
     */
    cleanup() {
        // 终止所有Worker
        for (const workerInstance of this.workers.values()) {
            workerInstance.worker.terminate();
        }

        // 清理URL
        if (this.workerScriptUrl) {
            URL.revokeObjectURL(this.workerScriptUrl);
            this.workerScriptUrl = null;
        }

        // 重置状态
        this.workers.clear();
        this.availableWorkers.length = 0;
        this.busyWorkers.clear();
        this.pendingTasks.length = 0;
    }

    /**
     * 检查Worker池健康状态
     */
    getHealthStatus() {
        const stats = this.getPoolStats();
        
        if (stats.totalWorkers === 0) {
            return { status: 'critical', message: '没有可用的Worker' };
        }
        
        if (stats.pendingTasks > 5) {
            return { status: 'warning', message: '等待队列较长，处理可能较慢' };
        }
        
        if (stats.availableWorkers === 0 && stats.busyWorkers === stats.maxWorkers) {
            return { status: 'busy', message: '所有Worker都在忙碌中' };
        }
        
        return { status: 'good', message: 'Worker池运行正常' };
    }
}

// 导出单例实例
export const workerPoolManager = new WorkerPoolManager();