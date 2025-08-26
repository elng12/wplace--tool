/**
 * 性能监控模块
 * 实时监控处理时间、内存使用和系统性能
 */

import { CONFIG } from '../config.js';

/**
 * 性能指标收集器
 */
export class PerformanceMetrics {
    constructor() {
        this.metrics = new Map();
        this.timings = new Map();
        this.counters = new Map();
        this.histograms = new Map();
        this.startTime = Date.now();
        
        // 系统信息
        this.systemInfo = this.collectSystemInfo();
        
        // 开始监控
        this.startContinuousMonitoring();
    }

    /**
     * 收集系统信息
     */
    collectSystemInfo() {
        const info = {
            userAgent: navigator.userAgent,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            connection: this.getConnectionInfo(),
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            devicePixelRatio: window.devicePixelRatio || 1,
            timestamp: Date.now()
        };

        // 检测WebGL支持
        info.webglSupport = this.detectWebGLSupport();
        
        // 检测Worker支持
        info.workerSupport = typeof Worker !== 'undefined';
        
        return info;
    }

    /**
     * 获取网络连接信息
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        return null;
    }

    /**
     * 检测WebGL支持
     */
    detectWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /**
     * 开始计时
     */
    startTiming(name) {
        this.timings.set(name, {
            startTime: performance.now(),
            startMemory: this.getCurrentMemoryUsage()
        });
    }

    /**
     * 结束计时
     */
    endTiming(name) {
        const timing = this.timings.get(name);
        if (!timing) {
            console.warn(`计时器 ${name} 不存在`);
            return null;
        }

        const endTime = performance.now();
        const endMemory = this.getCurrentMemoryUsage();
        
        const result = {
            name: name,
            duration: endTime - timing.startTime,
            memoryDelta: endMemory.usedJSHeapSize - timing.startMemory.usedJSHeapSize,
            timestamp: Date.now()
        };

        this.timings.delete(name);
        this.recordMetric('processing_time', name, result.duration);
        
        return result;
    }

    /**
     * 记录指标
     */
    recordMetric(category, name, value, tags = {}) {
        const key = `${category}.${name}`;
        
        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                values: [],
                count: 0,
                sum: 0,
                min: Infinity,
                max: -Infinity,
                avg: 0,
                tags: tags
            });
        }

        const metric = this.metrics.get(key);
        metric.values.push({
            value: value,
            timestamp: Date.now()
        });
        
        // 保留最近的100个值
        if (metric.values.length > 100) {
            metric.values.shift();
        }

        metric.count++;
        metric.sum += value;
        metric.min = Math.min(metric.min, value);
        metric.max = Math.max(metric.max, value);
        metric.avg = metric.sum / metric.count;
    }

    /**
     * 增加计数器
     */
    incrementCounter(name, value = 1, tags = {}) {
        if (!this.counters.has(name)) {
            this.counters.set(name, {
                value: 0,
                tags: tags,
                lastUpdated: Date.now()
            });
        }

        const counter = this.counters.get(name);
        counter.value += value;
        counter.lastUpdated = Date.now();
    }

    /**
     * 记录直方图数据
     */
    recordHistogram(name, value, buckets = [1, 5, 10, 25, 50, 100, 250, 500, 1000]) {
        if (!this.histograms.has(name)) {
            this.histograms.set(name, {
                buckets: new Map(buckets.map(b => [b, 0])),
                count: 0,
                sum: 0
            });
        }

        const histogram = this.histograms.get(name);
        histogram.count++;
        histogram.sum += value;

        // 找到合适的桶
        for (const bucket of buckets) {
            if (value <= bucket) {
                histogram.buckets.set(bucket, histogram.buckets.get(bucket) + 1);
                break;
            }
        }
    }

    /**
     * 获取当前内存使用情况
     */
    getCurrentMemoryUsage() {
        if ('memory' in performance) {
            return performance.memory;
        }
        
        // 回退方案：估算内存使用
        return {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
        };
    }

    /**
     * 开始连续监控
     */
    startContinuousMonitoring() {
        // 每秒记录一次内存使用
        setInterval(() => {
            const memoryUsage = this.getCurrentMemoryUsage();
            if (memoryUsage.usedJSHeapSize > 0) {
                this.recordMetric('system', 'memory_usage', memoryUsage.usedJSHeapSize);
            }
        }, 1000);

        // 每5秒记录一次FPS（如果支持）
        if ('requestAnimationFrame' in window) {
            this.startFPSMonitoring();
        }

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.recordMetric('system', 'visibility_change', document.hidden ? 0 : 1);
        });
    }

    /**
     * FPS监控
     */
    startFPSMonitoring() {
        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 5000) { // 每5秒计算一次
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                this.recordMetric('system', 'fps', fps);
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    /**
     * 获取指标摘要
     */
    getMetricsSummary() {
        const summary = {
            system: this.systemInfo,
            metrics: {},
            counters: Object.fromEntries(this.counters),
            histograms: {},
            uptime: Date.now() - this.startTime
        };

        // 处理指标
        for (const [key, metric] of this.metrics.entries()) {
            summary.metrics[key] = {
                count: metric.count,
                min: metric.min,
                max: metric.max,
                avg: Math.round(metric.avg * 100) / 100,
                current: metric.values.length > 0 ? metric.values[metric.values.length - 1].value : null,
                tags: metric.tags
            };
        }

        // 处理直方图
        for (const [name, histogram] of this.histograms.entries()) {
            summary.histograms[name] = {
                count: histogram.count,
                sum: histogram.sum,
                avg: histogram.count > 0 ? histogram.sum / histogram.count : 0,
                buckets: Object.fromEntries(histogram.buckets)
            };
        }

        return summary;
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        const summary = this.getMetricsSummary();
        const report = {
            timestamp: new Date().toISOString(),
            session: {
                uptime: summary.uptime,
                uptimeFormatted: this.formatDuration(summary.uptime)
            },
            system: summary.system,
            performance: {
                imageProcessing: this.getImageProcessingStats(summary),
                memoryUsage: this.getMemoryStats(summary),
                systemHealth: this.getSystemHealthStats(summary)
            },
            recommendations: this.generateRecommendations(summary)
        };

        return report;
    }

    /**
     * 获取图像处理统计
     */
    getImageProcessingStats(summary) {
        const stats = {};
        
        // 处理时间统计
        const processingTimeMetrics = Object.entries(summary.metrics)
            .filter(([key]) => key.startsWith('processing_time.'));
            
        if (processingTimeMetrics.length > 0) {
            stats.processingTimes = {};
            processingTimeMetrics.forEach(([key, metric]) => {
                const name = key.replace('processing_time.', '');
                stats.processingTimes[name] = {
                    avg: metric.avg,
                    min: metric.min,
                    max: metric.max,
                    count: metric.count
                };
            });
        }

        return stats;
    }

    /**
     * 获取内存统计
     */
    getMemoryStats(summary) {
        const memoryMetric = summary.metrics['system.memory_usage'];
        if (!memoryMetric) return null;

        return {
            current: memoryMetric.current,
            average: memoryMetric.avg,
            peak: memoryMetric.max,
            samples: memoryMetric.count
        };
    }

    /**
     * 获取系统健康统计
     */
    getSystemHealthStats(summary) {
        const fpsMetric = summary.metrics['system.fps'];
        
        return {
            fps: fpsMetric ? {
                current: fpsMetric.current,
                average: fpsMetric.avg,
                min: fpsMetric.min
            } : null,
            workerSupport: summary.system.workerSupport,
            webglSupport: summary.system.webglSupport
        };
    }

    /**
     * 生成性能建议
     */
    generateRecommendations(summary) {
        const recommendations = [];

        // 内存使用建议
        const memoryMetric = summary.metrics['system.memory_usage'];
        if (memoryMetric && memoryMetric.avg > 100 * 1024 * 1024) { // 100MB
            recommendations.push({
                type: 'warning',
                category: 'memory',
                message: '平均内存使用较高，建议关闭其他标签页或处理较小的图像',
                details: `平均内存使用: ${Math.round(memoryMetric.avg / 1024 / 1024)}MB`
            });
        }

        // 处理时间建议
        const processingTimeMetrics = Object.entries(summary.metrics)
            .filter(([key]) => key.startsWith('processing_time.'));
            
        if (processingTimeMetrics.length > 0) {
            const avgProcessingTime = processingTimeMetrics.reduce((sum, [, metric]) => sum + metric.avg, 0) / processingTimeMetrics.length;
            
            if (avgProcessingTime > 5000) { // 5秒
                recommendations.push({
                    type: 'info',
                    category: 'performance',
                    message: '图像处理时间较长，考虑降低图像分辨率或增大像素尺寸',
                    details: `平均处理时间: ${Math.round(avgProcessingTime)}ms`
                });
            }
        }

        // FPS建议
        const fpsMetric = summary.metrics['system.fps'];
        if (fpsMetric && fpsMetric.avg < 30) {
            recommendations.push({
                type: 'warning',
                category: 'performance',
                message: '页面帧率较低，可能影响用户体验',
                details: `平均FPS: ${Math.round(fpsMetric.avg)}`
            });
        }

        // 系统兼容性建议
        if (!summary.system.workerSupport) {
            recommendations.push({
                type: 'error',
                category: 'compatibility',
                message: '浏览器不支持Web Workers，处理性能可能受影响'
            });
        }

        return recommendations;
    }

    /**
     * 格式化持续时间
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    /**
     * 导出性能数据
     */
    exportData(format = 'json') {
        const data = this.getPerformanceReport();
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            
            case 'csv':
                return this.convertToCSV(data);
            
            default:
                return data;
        }
    }

    /**
     * 转换为CSV格式
     */
    convertToCSV(data) {
        const rows = [];
        const headers = ['时间', '类型', '名称', '值', '单位'];
        rows.push(headers.join(','));

        // 添加指标数据
        Object.entries(data.performance.imageProcessing.processingTimes || {}).forEach(([name, stats]) => {
            rows.push([data.timestamp, '处理时间', name, stats.avg, 'ms'].join(','));
        });

        if (data.performance.memoryUsage) {
            rows.push([data.timestamp, '内存使用', '当前', data.performance.memoryUsage.current, 'bytes'].join(','));
            rows.push([data.timestamp, '内存使用', '平均', data.performance.memoryUsage.average, 'bytes'].join(','));
        }

        return rows.join('\n');
    }

    /**
     * 重置所有指标
     */
    reset() {
        this.metrics.clear();
        this.timings.clear();
        this.counters.clear();
        this.histograms.clear();
        this.startTime = Date.now();
    }
}

/**
 * 性能监控管理器
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new PerformanceMetrics();
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.alertThresholds = {
            memoryUsage: 200 * 1024 * 1024, // 200MB
            processingTime: 10000, // 10秒
            fps: 20
        };
        this.alerts = [];
    }

    /**
     * 开始监控
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // 定期检查性能指标
        this.monitoringInterval = setInterval(() => {
            this.checkPerformanceThresholds();
        }, 5000); // 每5秒检查一次

        console.log('性能监控已启动');
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        console.log('性能监控已停止');
    }

    /**
     * 检查性能阈值
     */
    checkPerformanceThresholds() {
        const summary = this.metrics.getMetricsSummary();
        
        // 检查内存使用
        const memoryMetric = summary.metrics['system.memory_usage'];
        if (memoryMetric && memoryMetric.current > this.alertThresholds.memoryUsage) {
            this.addAlert('memory', 'high', `内存使用过高: ${Math.round(memoryMetric.current / 1024 / 1024)}MB`);
        }

        // 检查处理时间
        const processingTimeMetrics = Object.entries(summary.metrics)
            .filter(([key]) => key.startsWith('processing_time.'));
            
        processingTimeMetrics.forEach(([key, metric]) => {
            if (metric.current > this.alertThresholds.processingTime) {
                const name = key.replace('processing_time.', '');
                this.addAlert('performance', 'slow', `${name} 处理时间过长: ${Math.round(metric.current)}ms`);
            }
        });

        // 检查FPS
        const fpsMetric = summary.metrics['system.fps'];
        if (fpsMetric && fpsMetric.current < this.alertThresholds.fps) {
            this.addAlert('performance', 'low_fps', `帧率过低: ${Math.round(fpsMetric.current)}fps`);
        }
    }

    /**
     * 添加警报
     */
    addAlert(category, level, message) {
        const alert = {
            id: Date.now().toString(),
            category: category,
            level: level,
            message: message,
            timestamp: Date.now(),
            acknowledged: false
        };

        this.alerts.push(alert);
        
        // 保留最近的50个警报
        if (this.alerts.length > 50) {
            this.alerts.shift();
        }

        // 触发警报事件
        this.dispatchAlertEvent(alert);
        
        console.warn(`性能警报 [${level}]: ${message}`);
    }

    /**
     * 分发警报事件
     */
    dispatchAlertEvent(alert) {
        const event = new CustomEvent('performanceAlert', {
            detail: alert
        });
        document.dispatchEvent(event);
    }

    /**
     * 确认警报
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            return true;
        }
        return false;
    }

    /**
     * 获取活动警报
     */
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.acknowledged);
    }

    /**
     * 记录用户操作
     */
    recordUserAction(action, details = {}) {
        this.metrics.recordMetric('user_action', action, 1, details);
        this.metrics.incrementCounter(`user_action.${action}`);
    }

    /**
     * 记录图像处理操作
     */
    recordImageProcessing(operation, duration, imageSize, pixelSize) {
        this.metrics.recordMetric('processing_time', operation, duration, {
            imageSize: imageSize,
            pixelSize: pixelSize
        });
        
        this.metrics.recordHistogram(`processing_duration.${operation}`, duration);
        this.metrics.incrementCounter(`processing_count.${operation}`);
    }

    /**
     * 获取性能仪表板数据
     */
    getDashboardData() {
        const report = this.metrics.getPerformanceReport();
        const activeAlerts = this.getActiveAlerts();
        
        return {
            ...report,
            alerts: activeAlerts,
            isMonitoring: this.isMonitoring,
            thresholds: this.alertThresholds
        };
    }

    /**
     * 更新警报阈值
     */
    updateThresholds(newThresholds) {
        Object.assign(this.alertThresholds, newThresholds);
        console.log('性能监控阈值已更新:', this.alertThresholds);
    }

    /**
     * 生成性能报告
     */
    generateReport(format = 'json') {
        return this.metrics.exportData(format);
    }
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();

// 自动启动监控（在开发环境中）
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('dev'))) {
    performanceMonitor.startMonitoring();
}