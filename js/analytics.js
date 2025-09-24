/**
 * 高级分析系统
 * 收集用户行为数据和应用性能指标
 */

'use strict';

class AdvancedAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null; // 未同意前不创建本地ID
        this.events = [];
        this.pageLoadTime = Date.now();
        this.interactions = new Map();
        this.performanceMetrics = new Map();
        this.isEnabled = this.checkPrivacyConsent();
        this.initialized = false;
        
        this.init();
    }
    
    init() {
        window.logger?.log('📊 初始化分析系统...');
        
        if (!this.isEnabled) {
            window.logger?.log('🔒 用户未同意数据收集，分析功能已禁用');
            return;
        }
        
        // 同意后再获取/生成匿名用户ID
        if (!this.userId) {
            this.userId = this.getUserId();
        }

        this.setupEventListeners();
        this.trackPageView();
        this.setupPerformanceTracking();
        this.setupUserBehaviorTracking();
        this.startSessionTracking();
        
        window.logger?.log('✅ 分析系统初始化完成');
        window.logger?.log(`📍 会话ID: ${this.sessionId}`);
        this.initialized = true;
    }
    
    // 生成会话ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 获取用户ID（匿名）- 未同意不创建
    getUserId() {
        try {
            const existing = localStorage.getItem('analytics_user_id');
            if (existing) return existing;
            if (this.isEnabled) {
                const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('analytics_user_id', userId);
                return userId;
            }
            return null;
        } catch (e) {
            return null;
        }
    }
    
    // 检查隐私同意
    checkPrivacyConsent() {
        // 默认禁用：仅在显式同意('true')后启用
        return localStorage.getItem('analytics_consent') === 'true';
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('page_visibility', {
                hidden: document.hidden,
                timestamp: Date.now()
            });
        });
        
        // 页面卸载
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // 错误监控
        window.addEventListener('error', (event) => {
            this.trackError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });
        
        // Promise错误监控
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise_rejection',
                reason: event.reason,
                promise: 'Promise rejection'
            });
        });
    }
    
    // 跟踪页面访问
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        this.trackEvent('page_view', pageData);
    }
    
    // 性能跟踪
    setupPerformanceTracking() {
        // Web Vitals
        this.trackWebVitals();
        
        // 资源加载时间
        this.trackResourceTiming();
        
        // 导航时间
        this.trackNavigationTiming();
    }
    
    // Web Vitals 跟踪
    trackWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.performanceMetrics.set('lcp', entry.startTime);
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.performanceMetrics.set('fid', entry.processingStart - entry.startTime);
            }
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.performanceMetrics.set('cls', clsValue);
                }
            }
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // 资源加载时间跟踪
    trackResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const resourceMetrics = resources.map(resource => ({
                name: resource.name,
                type: resource.initiatorType,
                size: resource.transferSize,
                duration: resource.duration,
                startTime: resource.startTime
            }));
            
            this.trackEvent('resource_timing', { resources: resourceMetrics });
        });
    }
    
    // 导航时间跟踪
    trackNavigationTiming() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                // 修复负数时间计算问题
                const domContentLoaded = navigation.domContentLoadedEventEnd > 0 && navigation.domContentLoadedEventStart > 0 ?
                    navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0;
                const loadComplete = navigation.loadEventEnd > 0 && navigation.loadEventStart > 0 ?
                    navigation.loadEventEnd - navigation.loadEventStart : 0;
                const domInteractive = navigation.domInteractive > 0 && navigation.fetchStart > 0 ?
                    navigation.domInteractive - navigation.fetchStart : 0;
                const totalLoadTime = navigation.loadEventEnd > 0 && navigation.fetchStart > 0 ?
                    navigation.loadEventEnd - navigation.fetchStart : Date.now() - navigation.fetchStart;
                
                this.trackEvent('navigation_timing', {
                    domContentLoaded: Math.max(0, domContentLoaded),
                    loadComplete: Math.max(0, loadComplete),  
                    domInteractive: Math.max(0, domInteractive),
                    totalLoadTime: Math.max(0, totalLoadTime)
                });
            }
        });
    }
    
    // 用户行为跟踪
    setupUserBehaviorTracking() {
        // 点击跟踪
        document.addEventListener('click', (event) => {
            this.trackClick(event);
        });
        
        // 滚动跟踪
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
            }, 150);
        });
        
        // 表单交互跟踪
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.trackFormInteraction(event);
            }
        });
        
        // 鼠标移动跟踪（热力图数据）
        this.setupHeatmapTracking();
    }
    
    // 点击事件跟踪
    trackClick(event) {
        const element = event.target;
        const clickData = {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            text: element.textContent?.substring(0, 50),
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        // 特殊元素跟踪
        if (element.closest('button')) {
            clickData.type = 'button';
            clickData.buttonText = element.closest('button').textContent?.substring(0, 30);
        } else if (element.closest('a')) {
            clickData.type = 'link';
            clickData.href = element.closest('a').href;
        }
        
        this.trackEvent('click', clickData);
    }
    
    // 滚动跟踪
    trackScroll() {
        const scrollData = {
            scrollTop: window.pageYOffset,
            scrollLeft: window.pageXOffset,
            documentHeight: document.documentElement.scrollHeight,
            windowHeight: window.innerHeight,
            scrollPercentage: Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
            timestamp: Date.now()
        };
        
        this.trackEvent('scroll', scrollData);
    }
    
    // 表单交互跟踪
    trackFormInteraction(event) {
        const interactionData = {
            elementType: event.target.tagName.toLowerCase(),
            inputType: event.target.type,
            name: event.target.name,
            id: event.target.id,
            value: event.target.type === 'password' ? '[PROTECTED]' : event.target.value?.substring(0, 20),
            timestamp: Date.now()
        };
        
        this.trackEvent('form_interaction', interactionData);
    }
    
    // 热力图跟踪
    setupHeatmapTracking() {
        let mouseMoveTimeout;
        const mouseMoveData = [];
        
        document.addEventListener('mousemove', (event) => {
            // 采样：每100ms记录一次
            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(() => {
                mouseMoveData.push({
                    x: event.clientX,
                    y: event.clientY,
                    timestamp: Date.now()
                });
                
                // 限制数据量，只保留最近的50个点
                if (mouseMoveData.length > 50) {
                    mouseMoveData.shift();
                }
            }, 100);
        });
        
        // 定期发送热力图数据
        setInterval(() => {
            if (mouseMoveData.length > 0) {
                this.trackEvent('heatmap', {
                    points: [...mouseMoveData],
                    url: window.location.href
                });
                mouseMoveData.length = 0; // 清空数据
            }
        }, 30000); // 每30秒发送一次
    }
    
    // 跟踪自定义事件
    trackEvent(eventName, eventData = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            eventName,
            eventData,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.events.push(event);
        
        // 本地存储（实际应用中应该发送到服务器）
        this.storeEvent(event);
        
        window.logger?.log(`📊 [Analytics] ${eventName}:`, eventData);
    }
    
    // 错误跟踪
    trackError(errorData) {
        this.trackEvent('error', {
            ...errorData,
            url: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }
    
    // 存储事件
    storeEvent(event) {
        try {
            const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            existingEvents.push(event);
            
            // 限制存储的事件数量
            if (existingEvents.length > 1000) {
                existingEvents.splice(0, 500); // 删除前500个事件
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(existingEvents));
        } catch (error) {
            window.logger?.error('存储分析事件失败:', error);
        }
    }
    
    // 开始会话跟踪
    startSessionTracking() {
        this.sessionStartTime = Date.now();
        
        // 定期记录会话活跃度
        setInterval(() => {
            this.trackEvent('session_heartbeat', {
                sessionDuration: Date.now() - this.sessionStartTime,
                isVisible: !document.hidden
            });
        }, 60000); // 每分钟记录一次
    }
    
    // 结束会话
    endSession() {
        const sessionData = {
            sessionId: this.sessionId,
            duration: Date.now() - this.sessionStartTime,
            eventCount: this.events.length,
            url: window.location.href,
            timestamp: Date.now()
        };
        
        this.trackEvent('session_end', sessionData);
        
        // 发送所有未发送的事件（实际应用中）
        this.flushEvents();
    }
    
    // 发送事件到服务器（模拟）
    flushEvents() {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        
        if (events.length > 0) {
            window.logger?.log(`📊 [Analytics] 准备发送 ${events.length} 个分析事件`);
            
            // 实际应用中应该发送到分析服务器
            // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(events) });
            
            // 清空本地存储
            localStorage.removeItem('analytics_events');
        }
    }
    
    // 获取性能指标
    getPerformanceMetrics() {
        return Object.fromEntries(this.performanceMetrics);
    }
    
    // 获取会话统计
    getSessionStats() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            duration: Date.now() - this.sessionStartTime,
            eventCount: this.events.length,
            performanceMetrics: this.getPerformanceMetrics()
        };
    }
    
    // 设置用户属性
    setUserProperty(key, value) {
        this.trackEvent('user_property', { [key]: value });
    }
    
    // 跟踪转化事件
    trackConversion(conversionName, value = 0, currency = 'USD') {
        this.trackEvent('conversion', {
            conversionName,
            value,
            currency,
            timestamp: Date.now()
        });
    }
    
    // 跟踪页面停留时间
    trackTimeOnPage() {
        return Date.now() - this.pageLoadTime;
    }
    
    // 隐私控制
    enableAnalytics() {
        localStorage.setItem('analytics_consent', 'true');
        this.isEnabled = true;
        if (!this.userId) {
            this.userId = this.getUserId();
        }
        if (!this.initialized) {
            this.init();
        }
        window.logger?.log('✅ 分析功能已启用');
    }
    
    disableAnalytics() {
        localStorage.setItem('analytics_consent', 'false');
        this.isEnabled = false;
        localStorage.removeItem('analytics_events');
        window.logger?.log('🔒 分析功能已禁用');
    }
}

// 创建全局分析实例
const Analytics = new AdvancedAnalytics();

// 导出到全局
window.Analytics = Analytics;

// 便捷方法
window.trackEvent = (name, data) => Analytics.trackEvent(name, data);
window.trackConversion = (name, value, currency) => Analytics.trackConversion(name, value, currency);

window.logger?.log('📊 高级分析系统已加载');
