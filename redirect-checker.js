// 客户端重定向检测脚本
(function() {
    'use strict';
    
    // 检测页面加载时的重定向
    function checkRedirects() {
        const results = {
            currentUrl: window.location.href,
            referrer: document.referrer,
            protocol: window.location.protocol,
            redirectChain: [],
            timestamp: new Date().toISOString()
        };
        
        // 检查是否发生了重定向
        if (document.referrer && document.referrer !== window.location.href) {
            results.redirectDetected = true;
            results.redirectFrom = document.referrer;
        }
        
        // 检查协议重定向
        if (window.location.protocol === 'https:' && document.referrer.startsWith('http:')) {
            results.httpsRedirect = true;
        }
        
        // 检查JavaScript重定向
        const originalReplace = history.replaceState;
        const originalPush = history.pushState;
        
        history.replaceState = function(...args) {
            results.redirectChain.push({
                type: 'replaceState',
                args: args,
                timestamp: Date.now()
            });
            return originalReplace.apply(this, args);
        };
        
        history.pushState = function(...args) {
            results.redirectChain.push({
                type: 'pushState', 
                args: args,
                timestamp: Date.now()
            });
            return originalPush.apply(this, args);
        };
        
        // 监听页面卸载
        window.addEventListener('beforeunload', function() {
            if (results.redirectChain.length > 0) {
                console.warn('检测到JavaScript重定向:', results.redirectChain);
            }
        });
        
        return results;
    }
    
    // 测试各种重定向类型
    function testRedirectTypes() {
        const tests = [];
        
        // 测试meta refresh
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) {
            tests.push({
                type: 'meta-refresh',
                content: metaRefresh.getAttribute('content'),
                status: 'detected'
            });
        }
        
        // 测试JavaScript重定向
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            const content = script.textContent || script.innerHTML;
            if (content.includes('window.location') || content.includes('location.href') || content.includes('location.replace')) {
                tests.push({
                    type: 'javascript-redirect',
                    script: content.substring(0, 200) + '...',
                    status: 'potential'
                });
            }
        });
        
        return tests;
    }
    
    // 生成诊断报告
    function generateReport() {
        const redirectInfo = checkRedirects();
        const redirectTests = testRedirectTypes();
        
        const report = {
            ...redirectInfo,
            tests: redirectTests,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // 显示报告
        console.group('🔍 重定向诊断报告');
        console.log('当前URL:', report.currentUrl);
        console.log('来源页面:', report.referrer);
        console.log('协议:', report.protocol);
        console.log('重定向检测:', report.redirectDetected ? '是' : '否');
        console.log('HTTPS重定向:', report.httpsRedirect ? '是' : '否');
        console.log('重定向链:', report.redirectChain);
        console.log('测试结果:', report.tests);
        console.groupEnd();
        
        return report;
    }
    
    // 页面加载完成后执行检测
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generateReport);
    } else {
        generateReport();
    }
    
    // 导出到全局作用域供调试使用
    window.redirectChecker = {
        check: generateReport,
        testTypes: testRedirectTypes
    };
})();