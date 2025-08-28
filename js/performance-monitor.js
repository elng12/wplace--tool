/**
 * 性能监控系统 - 监控应用性能并提供优化建议
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: null,
            imageProcessing: [],
            translationSwitch: [],
            errors: [],
            userInteractions: []
        };
        
        this.thresholds = {
            pageLoadWarning: 3000, // 3秒
            imageProcessingWarning: 5000, // 5秒
            translationSwitchWarning: 1000, // 1秒
        };
        
        this.init();
    }

    init() {
        // 监控页面加载性能
        this.monitorPageLoad();
        
        // 监控用户交互性能
        this.monitorUserInteractions();
        
        // 定期输出性能报告
        setInterval(() => this.generateReport(), 30000); // 每30秒
        
        console.log('📊 性能监控系统已启动');
    }

    monitorPageLoad() {
        if (performance && performance.timing) {
            window.addEventListener('load', () => {
                const timing = performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                
                this.metrics.pageLoad = {
                    total: pageLoadTime,
                    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                    timestamp: Date.now()
                };
                
                if (pageLoadTime > this.thresholds.pageLoadWarning) {
                    console.warn(`⚠️ 页面加载较慢: ${pageLoadTime}ms`);
                } else {
                    console.log(`✅ 页面加载: ${pageLoadTime}ms`);
                }
            });
        }
    }

    monitorUserInteractions() {
        // 监控语言切换性能
        document.addEventListener('languageChanged', (event) => {
            const switchTime = event.detail?.duration || 0;
            this.metrics.translationSwitch.push({
                language: event.detail?.language,
                duration: switchTime,
                timestamp: Date.now()
            });
            
            if (switchTime > this.thresholds.translationSwitchWarning) {
                console.warn(`⚠️ 语言切换较慢: ${switchTime}ms`);
            }
        });

        // 监控图像处理性能
        document.addEventListener('imageProcessStart', () => {
            this.imageProcessStartTime = performance.now();
        });

        document.addEventListener('imageProcessEnd', (event) => {
            if (this.imageProcessStartTime) {
                const duration = performance.now() - this.imageProcessStartTime;
                this.metrics.imageProcessing.push({
                    duration: duration,
                    imageSize: event.detail?.imageSize,
                    pixelSize: event.detail?.pixelSize,
                    timestamp: Date.now()
                });
                
                if (duration > this.thresholds.imageProcessingWarning) {
                    console.warn(`⚠️ 图像处理较慢: ${duration.toFixed(2)}ms`);
                } else {
                    console.log(`✅ 图像处理: ${duration.toFixed(2)}ms`);
                }
                
                this.imageProcessStartTime = null;
            }
        });
    }

    recordError(error, context = '') {
        this.metrics.errors.push({
            message: error.message || String(error),
            stack: error.stack,
            context: context,
            timestamp: Date.now()
        });
    }

    recordUserInteraction(type, duration, details = {}) {
        this.metrics.userInteractions.push({
            type: type,
            duration: duration,
            details: details,
            timestamp: Date.now()
        });
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            pageLoad: this.metrics.pageLoad,
            stats: {
                imageProcessing: {
                    count: this.metrics.imageProcessing.length,
                    avgDuration: this.getAverageDuration(this.metrics.imageProcessing),
                    maxDuration: this.getMaxDuration(this.metrics.imageProcessing)
                },
                translationSwitch: {
                    count: this.metrics.translationSwitch.length,
                    avgDuration: this.getAverageDuration(this.metrics.translationSwitch)
                },
                errors: {
                    count: this.metrics.errors.length,
                    recent: this.metrics.errors.slice(-5) // 最近5个错误
                }
            }
        };

        // 只在开发环境输出详细报告
        if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
            console.group('📊 性能报告');
            console.table(report.stats);
            if (report.stats.errors.count > 0) {
                console.warn('最近错误:', report.stats.errors.recent);
            }
            console.groupEnd();
        }

        return report;
    }

    getAverageDuration(metrics) {
        if (metrics.length === 0) return 0;
        const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
        return (total / metrics.length).toFixed(2);
    }

    getMaxDuration(metrics) {
        if (metrics.length === 0) return 0;
        return Math.max(...metrics.map(m => m.duration)).toFixed(2);
    }

    // 获取性能建议
    getOptimizationSuggestions() {
        const suggestions = [];

        // 检查页面加载性能
        if (this.metrics.pageLoad && this.metrics.pageLoad.total > this.thresholds.pageLoadWarning) {
            suggestions.push('考虑优化页面加载速度：压缩资源、使用CDN、减少HTTP请求');
        }

        // 检查图像处理性能
        const avgImageProcessing = this.getAverageDuration(this.metrics.imageProcessing);
        if (avgImageProcessing > this.thresholds.imageProcessingWarning) {
            suggestions.push('图像处理可以优化：考虑使用Web Workers或分块处理大图像');
        }

        // 检查错误频率
        const recentErrors = this.metrics.errors.filter(e => 
            Date.now() - e.timestamp < 300000 // 最近5分钟
        );
        if (recentErrors.length > 3) {
            suggestions.push('错误频率较高，建议检查错误处理逻辑');
        }

        return suggestions;
    }

    // 添加缺失的startMeasure方法
    startMeasure(measureName) {
        if (!this.activeMeasures) {
            this.activeMeasures = new Map();
        }
        
        this.activeMeasures.set(measureName, {
            startTime: performance.now(),
            startTimestamp: Date.now()
        });
        
        console.log(`📊 开始测量: ${measureName}`);
    }

    // 添加缺失的endMeasure方法
    endMeasure(measureName) {
        if (!this.activeMeasures || !this.activeMeasures.has(measureName)) {
            console.warn(`⚠️ 没有找到测量: ${measureName}`);
            return null;
        }
        
        const measure = this.activeMeasures.get(measureName);
        const duration = performance.now() - measure.startTime;
        
        // 根据测量类型记录到相应的metrics中
        if (measureName.includes('imageLoad') || measureName.includes('imageProcess')) {
            this.metrics.imageProcessing.push({
                name: measureName,
                duration: duration,
                timestamp: Date.now()
            });
        }
        
        console.log(`📊 完成测量: ${measureName}, 耗时: ${duration.toFixed(2)}ms`);
        
        this.activeMeasures.delete(measureName);
        return duration;
    }
}

// 全局初始化
window.performanceMonitor = new PerformanceMonitor();

// 扩展错误处理系统
if (window.errorHandler) {
    const originalHandleError = window.errorHandler.handleError;
    window.errorHandler.handleError = function(error) {
        window.performanceMonitor.recordError(error.error || error, error.type || 'unknown');
        return originalHandleError.call(this, error);
    };
}