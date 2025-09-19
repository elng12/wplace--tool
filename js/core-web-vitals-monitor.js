/**
 * Core Web Vitals 性能监控
 * 实时监控和优化建议
 */

'use strict';

class CoreWebVitalsMonitor {
    constructor() {
        this.vitals = {};
        this.thresholds = {
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 }
        };
        this.init();
    }

    async init() {
        try {
            const { onCLS, onFID, onLCP } = await import('https://unpkg.com/web-vitals@3/dist/web-vitals.js');
            
            onLCP(this.handleLCP.bind(this));
            onFID(this.handleFID.bind(this));
            onCLS(this.handleCLS.bind(this));
            
            // 自定义性能监控
            this.monitorCustomMetrics();
        } catch (error) {
            window.logger?.log('⚠️ Web Vitals 库加载失败，使用基础监控');
            this.basicPerformanceMonitoring();
        }
    }

    handleLCP(metric) {
        this.vitals.LCP = metric;
        this.logMetric('LCP', metric.value, 'ms');
        
        if (metric.value > this.thresholds.LCP.needsImprovement) {
            this.suggestLCPOptimizations();
        }
    }

    handleFID(metric) {
        this.vitals.FID = metric;
        this.logMetric('FID', metric.value, 'ms');
        
        if (metric.value > this.thresholds.FID.needsImprovement) {
            this.suggestFIDOptimizations();
        }
    }

    handleCLS(metric) {
        this.vitals.CLS = metric;
        this.logMetric('CLS', metric.value);
        
        if (metric.value > this.thresholds.CLS.needsImprovement) {
            this.suggestCLSOptimizations();
        }
    }

    logMetric(name, value, unit = '') {
        const threshold = this.thresholds[name];
        let status = '🔴 Poor';
        
        if (value <= threshold.good) {
            status = '🟢 Good';
        } else if (value <= threshold.needsImprovement) {
            status = '🟡 Needs Improvement';
        }
        
        window.logger?.log(`📊 ${name}: ${value}${unit} ${status}`);
    }

    suggestLCPOptimizations() {
        console.group('🚀 LCP优化建议:');
        window.logger?.log('1. 优化服务器响应时间');
        window.logger?.log('2. 预加载关键资源');
        window.logger?.log('3. 压缩图像和资源');
        window.logger?.log('4. 使用CDN加速');
        console.groupEnd();
    }

    suggestFIDOptimizations() {
        console.group('⚡ FID优化建议:');
        window.logger?.log('1. 分解长任务');
        window.logger?.log('2. 使用Web Workers');
        window.logger?.log('3. 延迟加载非关键JavaScript');
        window.logger?.log('4. 减少第三方代码影响');
        console.groupEnd();
    }

    suggestCLSOptimizations() {
        console.group('📐 CLS优化建议:');
        window.logger?.log('1. 为图像和视频设置尺寸');
        window.logger?.log('2. 预留动态内容空间');
        window.logger?.log('3. 避免在现有内容上方插入内容');
        window.logger?.log('4. 使用transform动画');
        console.groupEnd();
    }

    basicPerformanceMonitoring() {
        // 基础性能监控
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            console.group('📊 基础性能指标:');
            window.logger?.log(`DOM加载: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
            window.logger?.log(`页面加载: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            window.logger?.log(`首字节时间: ${perfData.responseStart - perfData.requestStart}ms`);
            console.groupEnd();
        });
    }

    // 生成性能报告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            vitals: this.vitals,
            recommendations: this.getRecommendations(),
            deviceInfo: {
                memory: navigator.deviceMemory,
                cores: navigator.hardwareConcurrency,
                connection: navigator.connection?.effectiveType
            }
        };
        
        window.logger?.log('📋 性能报告:', report);
        return report;
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.vitals.LCP?.value > this.thresholds.LCP.good) {
            recommendations.push('优化LCP: 考虑图像压缩和预加载');
        }
        
        if (this.vitals.FID?.value > this.thresholds.FID.good) {
            recommendations.push('优化FID: 减少JavaScript执行时间');
        }
        
        if (this.vitals.CLS?.value > this.thresholds.CLS.good) {
            recommendations.push('优化CLS: 稳定页面布局');
        }
        
        return recommendations;
    }
}

// 启动监控
if (typeof window !== 'undefined') {
    window.performanceMonitor = new CoreWebVitalsMonitor();
    
    // 5秒后生成报告
    setTimeout(() => {
        window.performanceMonitor.generateReport();
    }, 5000);
}

export default CoreWebVitalsMonitor;