/**
 * 图像处理优化系统 - 提供高性能的图像处理功能
 */


'use strict';
class ImageOptimizer {
    constructor() {
        this.workerPool = [];
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.queue = [];
        this.processing = false;
        
        this.initWorkerPool();
        window.logger?.log(`🚀 图像优化器初始化完成，工作线程池大小: ${this.maxWorkers}`);
    }

    initWorkerPool() {
        // 创建Web Worker代码
        const workerCode = `
            // Web Worker for image processing
            self.onmessage = function(e) {
                const { imageData, pixelSize, method } = e.data;
                
                try {
                    const result = processImage(imageData, pixelSize, method);
                    self.postMessage({ success: true, result });
                } catch (error) {
                    self.postMessage({ success: false, error: error.message });
                }
            };
            
            function processImage(imageData, pixelSize, method) {
                const { data, width, height } = imageData;
                const newWidth = Math.floor(width / pixelSize);
                const newHeight = Math.floor(height / pixelSize);
                const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
                
                for (let y = 0; y < newHeight; y++) {
                    for (let x = 0; x < newWidth; x++) {
                        const sourceX = x * pixelSize;
                        const sourceY = y * pixelSize;
                        const targetIndex = (y * newWidth + x) * 4;
                        
                        // 采样像素颜色
                        const color = samplePixel(data, width, height, sourceX, sourceY, pixelSize, method);
                        
                        newData[targetIndex] = color.r;
                        newData[targetIndex + 1] = color.g;
                        newData[targetIndex + 2] = color.b;
                        newData[targetIndex + 3] = color.a;
                    }
                }
                
                return { data: newData, width: newWidth, height: newHeight };
            }
            
            function samplePixel(data, width, height, x, y, pixelSize, method) {
                if (method === 'nearest') {
                    const index = (y * width + x) * 4;
                    return {
                        r: data[index],
                        g: data[index + 1],
                        b: data[index + 2],
                        a: data[index + 3]
                    };
                } else if (method === 'average') {
                    let r = 0, g = 0, b = 0, a = 0, count = 0;
                    
                    for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                            const index = ((y + dy) * width + (x + dx)) * 4;
                            r += data[index];
                            g += data[index + 1];
                            b += data[index + 2];
                            a += data[index + 3];
                            count++;
                        }
                    }
                    
                    return {
                        r: Math.round(r / count),
                        g: Math.round(g / count),
                        b: Math.round(b / count),
                        a: Math.round(a / count)
                    };
                }
            }
        `;

        // 创建Blob URL并初始化Worker池
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.workerUrl = URL.createObjectURL(blob);
    }

    async processImageAsync(imageData, pixelSize, method = 'average') {
        return new Promise((resolve, reject) => {
            this.queue.push({
                imageData,
                pixelSize,
                method,
                resolve,
                reject
            });
            
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0 && this.workerPool.length < this.maxWorkers) {
            const task = this.queue.shift();
            const worker = new Worker(this.workerUrl);
            
            worker.onmessage = (e) => {
                const { success, result, error } = e.data;
                
                if (success) {
                    task.resolve(result);
                } else {
                    task.reject(new Error(error));
                }
                
                // 清理worker
                worker.terminate();
                const index = this.workerPool.indexOf(worker);
                if (index > -1) {
                    this.workerPool.splice(index, 1);
                }
                
                // 继续处理队列
                this.processQueue();
            };
            
            worker.onerror = (error) => {
                task.reject(error);
                worker.terminate();
                const index = this.workerPool.indexOf(worker);
                if (index > -1) {
                    this.workerPool.splice(index, 1);
                }
                this.processQueue();
            };
            
            this.workerPool.push(worker);
            worker.postMessage({
                imageData: task.imageData,
                pixelSize: task.pixelSize,
                method: task.method
            });
        }
        
        this.processing = false;
    }

    // 同步处理小图像
    processImageSync(imageData, pixelSize, method = 'average') {
        const { data, width, height } = imageData;
        const newWidth = Math.floor(width / pixelSize);
        const newHeight = Math.floor(height / pixelSize);
        const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
        
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const sourceX = x * pixelSize;
                const sourceY = y * pixelSize;
                const targetIndex = (y * newWidth + x) * 4;
                
                const color = this.samplePixel(data, width, height, sourceX, sourceY, pixelSize, method);
                
                newData[targetIndex] = color.r;
                newData[targetIndex + 1] = color.g;
                newData[targetIndex + 2] = color.b;
                newData[targetIndex + 3] = color.a;
            }
        }
        
        return { data: newData, width: newWidth, height: newHeight };
    }

    samplePixel(data, width, height, x, y, pixelSize, method) {
        if (method === 'nearest') {
            const index = (y * width + x) * 4;
            return {
                r: data[index],
                g: data[index + 1],
                b: data[index + 2],
                a: data[index + 3]
            };
        } else if (method === 'average') {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            
            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    r += data[index];
                    g += data[index + 1];
                    b += data[index + 2];
                    a += data[index + 3];
                    count++;
                }
            }
            
            return {
                r: Math.round(r / count),
                g: Math.round(g / count),
                b: Math.round(b / count),
                a: Math.round(a / count)
            };
        }
    }

    // 智能选择处理方法
    async processImage(imageData, pixelSize, method = 'average') {
        const pixelCount = imageData.width * imageData.height;
        const threshold = 500000; // 50万像素
        
        if (pixelCount > threshold) {
            window.logger?.log(`🔄 使用异步处理 (${pixelCount} 像素);`);
            return await this.processImageAsync(imageData, pixelSize, method);
        } else {
            window.logger?.log(`⚡ 使用同步处理 (${pixelCount} 像素);`);
            return this.processImageSync(imageData, pixelSize, method);
        }
    }

    // 图像压缩优化
    compressImage(canvas, quality = 0.8, maxSize = 2048) {
        const { width, height } = canvas;
        let newWidth = width;
        let newHeight = height;
        
        // 如果图像过大，按比例缩放
        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            newWidth = Math.floor(width * ratio);
            newHeight = Math.floor(height * ratio);
        }
        
        if (newWidth !== width || newHeight !== height) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;
            
            tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
            return tempCanvas;
        }
        
        return canvas;
    }

    
    // Performance optimizations for Core Web Vitals
    processWithProgressiveLoading(imageData, pixelSize, method = 'average') {
        return new Promise((resolve, reject) => {
            // 使用 requestIdleCallback 在空闲时处理
            const processChunk = (deadline) => {
                const startTime = performance.now();
                
                // 分块处理图像数据
                const chunkSize = Math.min(1000, deadline.timeRemaining() * 100);
                
                if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                    // 处理一个块
                    try {
                        const result = this.processImageSync(imageData, pixelSize, method);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    // 继续在下一个空闲期处理
                    requestIdleCallback(processChunk, { timeout: 1000 });
                }
            };
            
            requestIdleCallback(processChunk, { timeout: 1000 });
        });
    }

    // 智能处理策略 - 根据性能自动选择
    async smartProcess(imageData, pixelSize, method = 'average') {
        const pixelCount = imageData.width * imageData.height;
        const deviceMemory = navigator.deviceMemory || 4;
        const connectionSpeed = navigator.connection?.effectiveType || '4g';
        
        // 性能评分
        let performanceScore = deviceMemory * 2;
        if (connectionSpeed === 'slow-2g') performanceScore *= 0.3;
        else if (connectionSpeed === '2g') performanceScore *= 0.5;
        else if (connectionSpeed === '3g') performanceScore *= 0.7;
        
        const threshold = performanceScore > 6 ? 1000000 : 500000;
        
        if (pixelCount > threshold) {
            window.logger?.log('🚀 使用Web Worker处理大图像');
            return await this.processImageAsync(imageData, pixelSize, method);
        } else {
            window.logger?.log('⚡ 使用渐进式处理');
            return await this.processWithProgressiveLoading(imageData, pixelSize, method);
        }
    }

    cleanup() {
        // 清理Worker池
        this.workerPool.forEach(worker => worker.terminate());
        this.workerPool = [];
        
        // 清理Blob URL
        if (this.workerUrl) {
            URL.revokeObjectURL(this.workerUrl);
        }
        
        window.logger?.log('🧹 图像优化器已清理');
    }
}

// 全局实例
window.imageOptimizer = new ImageOptimizer();

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    window.imageOptimizer?.cleanup();
});