/**
 * 生产环境性能监控系统
 * 实时监控和报警
 */

'use strict';

class ProductionPerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoads: 0,
            errors: 0,
            avgLoadTime: 0,
            avgProcessingTime: 0,
            memoryUsage: 0
        };
        
        this.thresholds = {
            loadTime: 3000,        // 3秒
            processingTime: 5000,  // 5秒
            errorRate: 0.05,       // 5%
            memoryLimit: 100       // 100MB
        };
        
        this.alerts = [];
        this.isMonitoring = false;
        
        this.init();
    }

    init() {
        // 监控页面加载性能
        this.monitorPageLoad();
        
        // 监控内存使用
        this.monitorMemoryUsage();
        
        // 监控错误率
        this.monitorErrorRate();
        
        // 定期生成报告
        this.startPeriodicReporting();
        
        window.logger?.log('📊 生产性能监控已启动');
        this.isMonitoring = true;
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            this.metrics.pageLoads++;
            this.updateAverageLoadTime(loadTime);
            
            if (loadTime > this.thresholds.loadTime) {
                this.addAlert('SLOW_LOAD', `页面加载时间过长: ${loadTime}ms`);
            }
        });
    }

    monitorMemoryUsage() {
        setInterval(() => {
            if (performance.memory) {
                const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                this.metrics.memoryUsage = memoryMB;
                
                if (memoryMB > this.thresholds.memoryLimit) {
                    this.addAlert('HIGH_MEMORY', `内存使用过高: ${memoryMB.toFixed(1)}MB`);
                }
            }
        }, 30000); // 每30秒检查一次
    }

    monitorErrorRate() {
        let errorCount = 0;
        let totalActions = 0;
        
        // 监听错误
        window.addEventListener('error', () => {
            errorCount++;
            this.metrics.errors++;
            this.checkErrorRate(errorCount, totalActions);
        });
        
        // 监听用户操作
        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                totalActions++;
                this.checkErrorRate(errorCount, totalActions);
            });
        });
    }

    checkErrorRate(errors, total) {
        if (total > 10) { // 至少10个操作后才检查
            const errorRate = errors / total;
            if (errorRate > this.thresholds.errorRate) {
                this.addAlert('HIGH_ERROR_RATE', `错误率过高: ${(errorRate * 100).toFixed(1)}%`);
            }
        }
    }

    updateAverageLoadTime(newTime) {
        const total = this.metrics.avgLoadTime * (this.metrics.pageLoads - 1) + newTime;
        this.metrics.avgLoadTime = total / this.metrics.pageLoads;
    }

    addAlert(type, message) {
        const alert = {
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            severity: this.getSeverity(type)
        };
        
        this.alerts.push(alert);
        
        // 控制台输出
        const icon = alert.severity === 'critical' ? '🚨' : '⚠️';
        window.logger?.warn(`${icon} [${type}] ${message}`);
        
        // 发送到监控服务（如果配置了）
        this.sendToMonitoringService(alert);
        
        // 限制警报数量
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-50);
        }
    }

    getSeverity(type) {
        const criticalTypes = ['HIGH_ERROR_RATE', 'MEMORY_LEAK'];
        return criticalTypes.includes(type) ? 'critical' : 'warning';
    }

    sendToMonitoringService(alert) {
        // 这里可以集成外部监控服务
        // 例如: Sentry, DataDog, New Relic等
        
        if (window.gtag) {
            // Google Analytics 事件
            gtag('event', 'performance_alert', {
                alert_type: alert.type,
                severity: alert.severity,
                custom_parameter: alert.message
            });
        }
    }

    startPeriodicReporting() {
        setInterval(() => {
            this.generatePerformanceReport();
        }, 300000); // 每5分钟生成一次报告
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: { ...this.metrics },
            alerts: this.alerts.slice(-10), // 最近10个警报
            status: this.getOverallStatus(),
            recommendations: this.getRecommendations()
        };
        
        // 保存到本地存储（用于调试）
        localStorage.setItem('performanceReport', JSON.stringify(report));
        
        return report;
    }

    getOverallStatus() {
        const criticalAlerts = this.alerts.filter(a => a.severity === 'critical').length;
        const recentAlerts = this.alerts.filter(a => {
            const alertTime = new Date(a.timestamp);
            const now = new Date();
            return (now - alertTime) < 300000; // 5分钟内
        }).length;
        
        if (criticalAlerts > 0 || recentAlerts > 5) {
            return 'critical';
        } else if (recentAlerts > 2) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.avgLoadTime > this.thresholds.loadTime) {
            recommendations.push('优化资源加载，考虑使用CDN');
        }
        
        if (this.metrics.memoryUsage > this.thresholds.memoryLimit * 0.8) {
            recommendations.push('监控内存泄漏，优化内存使用');
        }
        
        const errorRate = this.metrics.errors / Math.max(this.metrics.pageLoads, 1);
        if (errorRate > this.thresholds.errorRate * 0.8) {
            recommendations.push('调查和修复频繁出现的错误');
        }
        
        return recommendations;
    }

    // 手动触发报告
    getDetailedReport() {
        const report = this.generatePerformanceReport();
        console.group('📊 详细性能报告');
        window.logger?.log('状态:', report.status);
        window.logger?.log('指标:', report.metrics);
        window.logger?.log('警报:', report.alerts);
        window.logger?.log('建议:', report.recommendations);
        console.groupEnd();
        return report;
    }
}

// 自动启动监控
window.addEventListener('DOMContentLoaded', () => {
    window.productionMonitor = new ProductionPerformanceMonitor();
});

// 导出监控器
window.ProductionPerformanceMonitor = ProductionPerformanceMonitor;