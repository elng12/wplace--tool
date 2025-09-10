#!/usr/bin/env node

/**
 * 维护和监控系统 - 确保长期稳定运行
 * 自动化测试、监控、部署检查
 */

const fs = require('fs');
const path = require('path');

class MaintenanceMonitoringSystem {
    constructor() {
        this.config = {
            projectName: 'Wplace Paint Tool',
            version: '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            baseUrl: 'https://wplace.vercel.app'
        };
        
        this.stats = {
            checksCreated: 0,
            scriptsGenerated: 0,
            monitorsSetup: 0
        };
        
        console.log('🔧 维护和监控系统初始化...');
    }

    // 1. 创建自动化测试套件
    createAutomatedTestSuite() {
        console.log('🧪 创建自动化测试套件...');

        // 创建测试目录
        if (!fs.existsSync('./tests')) {
            fs.mkdirSync('./tests', { recursive: true });
        }

        // 功能测试
        const functionalTests = `/**
 * Wplace Paint Tool - 功能测试套件
 * 确保核心功能正常工作
 */

class FunctionalTestSuite {
    constructor() {
        this.testResults = [];
        this.errors = [];
    }

    // 测试图像上传功能
    async testImageUpload() {
        console.log('🧪 测试图像上传功能...');
        
        try {
            // 创建测试图像
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, 100, 100);

            // 转换为文件对象
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            const file = new File([blob], 'test.png', { type: 'image/png' });
            
            // 测试文件处理
            if (typeof handleFileUpload === 'function') {
                handleFileUpload([file]);
                this.addResult('图像上传', true, '功能正常');
            } else {
                this.addResult('图像上传', false, 'handleFileUpload函数不存在');
            }
        } catch (error) {
            this.addResult('图像上传', false, error.message);
        }
    }

    // 测试像素艺术转换
    async testPixelArtConversion() {
        console.log('🧪 测试像素艺术转换...');
        
        try {
            if (typeof processImageToPixelArt === 'function') {
                const testCanvas = document.createElement('canvas');
                testCanvas.width = 50;
                testCanvas.height = 50;
                
                const result = await processImageToPixelArt(testCanvas, {
                    pixelSize: 5,
                    dithering: false,
                    scalingMethod: 'nearest'
                });
                
                if (result && result.width && result.height) {
                    this.addResult('像素艺术转换', true, '转换成功');
                } else {
                    this.addResult('像素艺术转换', false, '转换结果无效');
                }
            } else {
                this.addResult('像素艺术转换', false, 'processImageToPixelArt函数不存在');
            }
        } catch (error) {
            this.addResult('像素艺术转换', false, error.message);
        }
    }

    // 测试翻译系统
    async testTranslationSystem() {
        console.log('🧪 测试翻译系统...');
        
        try {
            if (window.optimizedI18n || window.lazyTranslationLoader) {
                const i18n = window.optimizedI18n || window.lazyTranslationLoader;
                
                // 测试获取翻译
                const translation = i18n.getTranslation('nav.home', 'en');
                
                if (translation && translation !== 'nav.home') {
                    this.addResult('翻译系统', true, '翻译功能正常');
                } else {
                    this.addResult('翻译系统', false, '翻译获取失败');
                }
            } else {
                this.addResult('翻译系统', false, '翻译系统未初始化');
            }
        } catch (error) {
            this.addResult('翻译系统', false, error.message);
        }
    }

    // 测试性能监控
    testPerformanceMonitoring() {
        console.log('🧪 测试性能监控...');
        
        try {
            if (window.performanceMonitor) {
                const report = window.performanceMonitor.generateReport();
                
                if (report && report.timestamp) {
                    this.addResult('性能监控', true, '监控系统正常');
                } else {
                    this.addResult('性能监控', false, '监控报告生成失败');
                }
            } else {
                this.addResult('性能监控', false, '性能监控系统未找到');
            }
        } catch (error) {
            this.addResult('性能监控', false, error.message);
        }
    }

    // 测试错误处理
    testErrorHandling() {
        console.log('🧪 测试错误处理...');
        
        try {
            if (window.errorHandler) {
                // 模拟错误
                window.errorHandler.reportError(new Error('测试错误'));
                
                const errorHistory = window.errorHandler.getErrorHistory();
                if (errorHistory.length > 0) {
                    this.addResult('错误处理', true, '错误捕获正常');
                } else {
                    this.addResult('错误处理', false, '错误未被捕获');
                }
            } else {
                this.addResult('错误处理', false, '错误处理系统未找到');
            }
        } catch (error) {
            this.addResult('错误处理', false, error.message);
        }
    }

    // 添加测试结果
    addResult(testName, passed, message) {
        this.testResults.push({
            test: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        const icon = passed ? '✅' : '❌';
        console.log(\`\${icon} \${testName}: \${message}\`);
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始功能测试...');
        
        await this.testImageUpload();
        await this.testPixelArtConversion();
        await this.testTranslationSystem();
        this.testPerformanceMonitoring();
        this.testErrorHandling();
        
        return this.generateReport();
    }

    // 生成测试报告
    generateReport() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        const success = (passed / total * 100).toFixed(1);
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: total,
                passed: passed,
                failed: total - passed,
                successRate: \`\${success}%\`
            },
            results: this.testResults,
            status: passed === total ? 'PASS' : 'FAIL'
        };
        
        console.log('📊 测试报告:');
        console.log(\`   总计: \${total} 个测试\`);
        console.log(\`   通过: \${passed} 个\`);
        console.log(\`   失败: \${total - passed} 个\`);
        console.log(\`   成功率: \${success}%\`);
        
        return report;
    }
}

// 自动测试启动器
window.addEventListener('load', () => {
    setTimeout(async () => {
        if (localStorage.getItem('autoTest') === 'true') {
            const testSuite = new FunctionalTestSuite();
            const report = await testSuite.runAllTests();
            
            // 保存测试报告
            localStorage.setItem('lastTestReport', JSON.stringify(report));
            
            // 如果测试失败，显示警告
            if (report.status === 'FAIL') {
                console.warn('⚠️ 自动化测试发现问题，请检查功能');
            }
        }
    }, 3000);
});

// 导出测试套件
window.FunctionalTestSuite = FunctionalTestSuite;`;

        fs.writeFileSync('./tests/functional-tests.js', functionalTests, 'utf8');
        console.log('✅ 创建功能测试套件');
        this.stats.scriptsGenerated++;
    }

    // 2. 创建性能监控系统
    createPerformanceMonitoring() {
        console.log('📊 创建性能监控系统...');

        const performanceMonitor = `/**
 * 生产环境性能监控系统
 * 实时监控和报警
 */

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
        
        console.log('📊 生产性能监控已启动');
        this.isMonitoring = true;
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            this.metrics.pageLoads++;
            this.updateAverageLoadTime(loadTime);
            
            if (loadTime > this.thresholds.loadTime) {
                this.addAlert('SLOW_LOAD', \`页面加载时间过长: \${loadTime}ms\`);
            }
        });
    }

    monitorMemoryUsage() {
        setInterval(() => {
            if (performance.memory) {
                const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                this.metrics.memoryUsage = memoryMB;
                
                if (memoryMB > this.thresholds.memoryLimit) {
                    this.addAlert('HIGH_MEMORY', \`内存使用过高: \${memoryMB.toFixed(1)}MB\`);
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
                this.addAlert('HIGH_ERROR_RATE', \`错误率过高: \${(errorRate * 100).toFixed(1)}%\`);
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
        console.warn(\`\${icon} [\${type}] \${message}\`);
        
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
        console.log('状态:', report.status);
        console.log('指标:', report.metrics);
        console.log('警报:', report.alerts);
        console.log('建议:', report.recommendations);
        console.groupEnd();
        return report;
    }
}

// 自动启动监控
window.addEventListener('DOMContentLoaded', () => {
    window.productionMonitor = new ProductionPerformanceMonitor();
});

// 导出监控器
window.ProductionPerformanceMonitor = ProductionPerformanceMonitor;`;

        fs.writeFileSync('./js/production-performance-monitor.js', performanceMonitor, 'utf8');
        console.log('✅ 创建生产性能监控系统');
        this.stats.scriptsGenerated++;
    }

    // 3. 创建代码质量检查工具
    createCodeQualityChecks() {
        console.log('🔍 创建代码质量检查工具...');

        const qualityChecker = `#!/usr/bin/env node

/**
 * 代码质量检查工具
 * 部署前自动检查
 */

const fs = require('fs');
const path = require('path');

class CodeQualityChecker {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.stats = {
            filesChecked: 0,
            issuesFound: 0,
            warningsFound: 0
        };
    }

    // 检查所有文件
    async runAllChecks() {
        console.log('🔍 开始代码质量检查...');
        
        this.checkJavaScriptFiles();
        this.checkHTMLFiles();
        this.checkCSSFiles();
        this.checkTranslationFiles();
        this.checkDependencies();
        
        return this.generateReport();
    }

    // 检查JavaScript文件
    checkJavaScriptFiles() {
        console.log('📝 检查JavaScript文件...');
        
        const jsFiles = this.findFiles('.', '.js', ['node_modules', '.git', 'tests']);
        
        jsFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            this.stats.filesChecked++;
            
            // 检查常见问题
            this.checkConsoleStatements(file, content);
            this.checkTodoComments(file, content);
            this.checkHardcodedUrls(file, content);
            this.checkUnusedVariables(file, content);
            this.checkSecurityIssues(file, content);
        });
    }

    // 检查console语句
    checkConsoleStatements(file, content) {
        const consoleRegex = /console\\.(log|warn|error|debug)\\(/g;
        const matches = content.match(consoleRegex);
        
        if (matches && !content.includes('window.logger')) {
            this.addIssue('CONSOLE_STATEMENTS', file, 
                \`发现 \${matches.length} 个console语句，应使用logger系统\`);
        }
    }

    // 检查TODO注释
    checkTodoComments(file, content) {
        const todoRegex = /\\/\\/(.*)(TODO|FIXME|BUG|HACK)(.*)/gi;
        const matches = content.match(todoRegex);
        
        if (matches) {
            matches.forEach(match => {
                this.addWarning('TODO_COMMENT', file, \`待处理注释: \${match.trim()}\`);
            });
        }
    }

    // 检查硬编码URL
    checkHardcodedUrls(file, content) {
        const urlRegex = /https?:\\/\\/[^'"\`\\s]+/g;
        const matches = content.match(urlRegex);
        
        if (matches) {
            matches.forEach(url => {
                if (!url.includes('wplace.vercel.app') && !url.includes('localhost')) {
                    this.addWarning('HARDCODED_URL', file, \`硬编码URL: \${url}\`);
                }
            });
        }
    }

    // 检查未使用变量（简单检查）
    checkUnusedVariables(file, content) {
        const varRegex = /(?:let|const|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=/g;
        let match;
        
        while ((match = varRegex.exec(content)) !== null) {
            const varName = match[1];
            const usage = new RegExp(\`\\\\b\${varName}\\\\b\`, 'g');
            const usageCount = (content.match(usage) || []).length;
            
            if (usageCount === 1) { // 只出现在声明处
                this.addWarning('UNUSED_VARIABLE', file, \`可能未使用的变量: \${varName}\`);
            }
        }
    }

    // 检查安全问题
    checkSecurityIssues(file, content) {
        const securityPatterns = [
            { pattern: /eval\\(/g, issue: 'EVAL_USAGE', message: '使用eval()存在安全风险' },
            { pattern: /innerHTML\\s*=\\s*[^'"]/, issue: 'INNER_HTML', message: '动态innerHTML可能导致XSS' },
            { pattern: /document\\.write\\(/g, issue: 'DOCUMENT_WRITE', message: 'document.write存在安全风险' }
        ];
        
        securityPatterns.forEach(({ pattern, issue, message }) => {
            if (pattern.test(content)) {
                this.addIssue(issue, file, message);
            }
        });
    }

    // 检查HTML文件
    checkHTMLFiles() {
        console.log('📄 检查HTML文件...');
        
        const htmlFiles = this.findFiles('.', '.html', ['node_modules', '.git']);
        
        htmlFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            this.stats.filesChecked++;
            
            this.checkMissingMetaTags(file, content);
            this.checkAccessibility(file, content);
            this.checkSEOElements(file, content);
        });
    }

    // 检查缺失的meta标签
    checkMissingMetaTags(file, content) {
        const requiredMeta = [
            { tag: 'description', pattern: /<meta\\s+name="description"/ },
            { tag: 'viewport', pattern: /<meta\\s+name="viewport"/ },
            { tag: 'charset', pattern: /<meta\\s+charset=/ }
        ];
        
        requiredMeta.forEach(({ tag, pattern }) => {
            if (!pattern.test(content)) {
                this.addIssue('MISSING_META', file, \`缺失meta标签: \${tag}\`);
            }
        });
    }

    // 检查可访问性
    checkAccessibility(file, content) {
        // 检查图片alt属性
        const imgRegex = /<img[^>]*>/g;
        const images = content.match(imgRegex) || [];
        
        images.forEach(img => {
            if (!img.includes('alt=')) {
                this.addWarning('MISSING_ALT', file, '图片缺少alt属性');
            }
        });
        
        // 检查表单标签
        const inputRegex = /<input[^>]*>/g;
        const inputs = content.match(inputRegex) || [];
        
        inputs.forEach(input => {
            if (!input.includes('aria-label') && !content.includes('<label')) {
                this.addWarning('MISSING_LABEL', file, '表单元素缺少标签');
            }
        });
    }

    // 检查SEO元素
    checkSEOElements(file, content) {
        if (!content.includes('<title>')) {
            this.addIssue('MISSING_TITLE', file, '缺少title标签');
        }
        
        if (!content.includes('rel="canonical"')) {
            this.addWarning('MISSING_CANONICAL', file, '缺少canonical链接');
        }
    }

    // 检查翻译文件
    checkTranslationFiles() {
        console.log('🌍 检查翻译文件...');
        
        const langDir = './lang';
        if (!fs.existsSync(langDir)) return;
        
        const langFiles = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
        
        if (langFiles.length === 0) {
            this.addIssue('NO_TRANSLATIONS', 'lang/', '没有找到翻译文件');
            return;
        }
        
        // 检查翻译文件一致性
        let baseKeys = null;
        
        langFiles.forEach(file => {
            const filePath = path.join(langDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            this.stats.filesChecked++;
            
            try {
                const translations = JSON.parse(content);
                const keys = Object.keys(translations);
                
                if (!baseKeys) {
                    baseKeys = keys;
                } else {
                    const missingKeys = baseKeys.filter(key => !keys.includes(key));
                    const extraKeys = keys.filter(key => !baseKeys.includes(key));
                    
                    if (missingKeys.length > 0) {
                        this.addIssue('MISSING_TRANSLATION_KEYS', file, 
                            \`缺失翻译键: \${missingKeys.slice(0, 5).join(', ')}\`);
                    }
                    
                    if (extraKeys.length > 0) {
                        this.addWarning('EXTRA_TRANSLATION_KEYS', file, 
                            \`多余翻译键: \${extraKeys.slice(0, 5).join(', ')}\`);
                    }
                }
            } catch (error) {
                this.addIssue('INVALID_JSON', file, \`JSON格式错误: \${error.message}\`);
            }
        });
    }

    // 检查依赖
    checkDependencies() {
        console.log('📦 检查依赖...');
        
        if (fs.existsSync('./package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            this.stats.filesChecked++;
            
            // 检查是否有未使用的依赖
            const dependencies = Object.keys(packageJson.dependencies || {});
            const devDependencies = Object.keys(packageJson.devDependencies || {});
            
            // 简单检查：在代码中搜索依赖使用
            const allFiles = this.findFiles('.', '.js', ['node_modules', '.git']);
            const usedDeps = new Set();
            
            allFiles.forEach(file => {
                const content = fs.readFileSync(file, 'utf8');
                [...dependencies, ...devDependencies].forEach(dep => {
                    if (content.includes(dep)) {
                        usedDeps.add(dep);
                    }
                });
            });
            
            const unusedDeps = [...dependencies, ...devDependencies]
                .filter(dep => !usedDeps.has(dep));
            
            if (unusedDeps.length > 0) {
                this.addWarning('UNUSED_DEPENDENCIES', 'package.json', 
                    \`可能未使用的依赖: \${unusedDeps.join(', ')}\`);
            }
        }
    }

    // 工具方法
    findFiles(dir, ext, exclude = []) {
        const files = [];
        
        function scan(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !exclude.some(ex => fullPath.includes(ex))) {
                    scan(fullPath);
                } else if (stat.isFile() && item.endsWith(ext)) {
                    files.push(fullPath);
                }
            });
        }
        
        scan(dir);
        return files;
    }

    addIssue(type, file, message) {
        this.issues.push({ type, file, message });
        this.stats.issuesFound++;
    }

    addWarning(type, file, message) {
        this.warnings.push({ type, file, message });
        this.stats.warningsFound++;
    }

    generateReport() {
        console.log('\\n📊 代码质量检查报告:');
        console.log(\`   文件检查: \${this.stats.filesChecked} 个\`);
        console.log(\`   问题发现: \${this.stats.issuesFound} 个\`);
        console.log(\`   警告发现: \${this.stats.warningsFound} 个\`);
        
        if (this.issues.length > 0) {
            console.log('\\n❌ 发现问题:');
            this.issues.forEach(issue => {
                console.log(\`   [\${issue.type}] \${issue.file}: \${issue.message}\`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log('\\n⚠️ 警告信息:');
            this.warnings.forEach(warning => {
                console.log(\`   [\${warning.type}] \${warning.file}: \${warning.message}\`);
            });
        }
        
        const status = this.issues.length === 0 ? 'PASS' : 'FAIL';
        console.log(\`\\n状态: \${status}\`);
        
        return {
            status,
            stats: this.stats,
            issues: this.issues,
            warnings: this.warnings,
            timestamp: new Date().toISOString()
        };
    }
}

// 执行检查
if (require.main === module) {
    const checker = new CodeQualityChecker();
    checker.runAllChecks().then(report => {
        process.exit(report.status === 'PASS' ? 0 : 1);
    });
}

module.exports = CodeQualityChecker;`;

        fs.writeFileSync('./scripts/code-quality-checker.js', qualityChecker, 'utf8');
        console.log('✅ 创建代码质量检查工具');
        this.stats.scriptsGenerated++;
    }

    // 4. 创建部署前检查清单
    createDeploymentChecklist() {
        console.log('🚀 创建部署前检查清单...');

        const deploymentChecker = `#!/usr/bin/env node

/**
 * 部署前检查清单
 * 确保部署安全和质量
 */

const fs = require('fs');
const { execSync } = require('child_process');

class DeploymentChecker {
    constructor() {
        this.checksPassed = 0;
        this.checksTotal = 0;
        this.criticalIssues = [];
    }

    async runPreDeploymentChecks() {
        console.log('🚀 开始部署前检查...');
        
        this.checkBuildStatus();
        this.checkCodeQuality();
        this.checkPerformance();
        this.checkSecurity();
        this.checkTranslations();
        this.checkSEO();
        this.checkEnvironment();
        
        return this.generateDeploymentReport();
    }

    runCheck(name, checkFunction) {
        this.checksTotal++;
        console.log(\`🔍 检查: \${name}\`);
        
        try {
            const result = checkFunction();
            if (result.passed) {
                console.log(\`   ✅ 通过: \${result.message}\`);
                this.checksPassed++;
            } else {
                console.log(\`   ❌ 失败: \${result.message}\`);
                if (result.critical) {
                    this.criticalIssues.push(\`\${name}: \${result.message}\`);
                }
            }
            return result;
        } catch (error) {
            console.log(\`   ❌ 错误: \${error.message}\`);
            this.criticalIssues.push(\`\${name}: \${error.message}\`);
            return { passed: false, message: error.message, critical: true };
        }
    }

    checkBuildStatus() {
        this.runCheck('构建状态', () => {
            // 检查构建输出文件是否存在
            const buildFiles = [
                'css/main.css',
                'js/inline-translations.js',
                'js/lazy-translations-optimized.js'
            ];
            
            const missingFiles = buildFiles.filter(file => !fs.existsSync(file));
            
            if (missingFiles.length > 0) {
                return {
                    passed: false,
                    message: \`缺少构建文件: \${missingFiles.join(', ')}\`,
                    critical: true
                };
            }
            
            return { passed: true, message: '所有构建文件存在' };
        });
    }

    checkCodeQuality() {
        this.runCheck('代码质量', () => {
            try {
                // 运行代码质量检查
                execSync('node scripts/code-quality-checker.js', { stdio: 'pipe' });
                return { passed: true, message: '代码质量检查通过' };
            } catch (error) {
                return {
                    passed: false,
                    message: '代码质量检查失败',
                    critical: true
                };
            }
        });
    }

    checkPerformance() {
        this.runCheck('性能优化', () => {
            // 检查关键文件大小
            const sizeChecks = [
                { file: 'css/main.css', limit: 50 * 1024 },      // 50KB
                { file: 'js/app-simple.js', limit: 100 * 1024 }, // 100KB
                { file: 'js/inline-translations.js', limit: 500 * 1024 } // 500KB
            ];
            
            const oversizedFiles = [];
            
            sizeChecks.forEach(({ file, limit }) => {
                if (fs.existsSync(file)) {
                    const size = fs.statSync(file).size;
                    if (size > limit) {
                        oversizedFiles.push(\`\${file} (\${(size/1024).toFixed(1)}KB)\`);
                    }
                }
            });
            
            if (oversizedFiles.length > 0) {
                return {
                    passed: false,
                    message: \`文件过大: \${oversizedFiles.join(', ')}\`,
                    critical: false
                };
            }
            
            return { passed: true, message: '文件大小合理' };
        });
    }

    checkSecurity() {
        this.runCheck('安全检查', () => {
            // 检查敏感文件
            const sensitiveFiles = [
                '.env', '.env.local', 'config.json', 'secrets.json',
                'private.key', '*.pem', 'database.sqlite'
            ];
            
            const foundSensitive = [];
            
            sensitiveFiles.forEach(pattern => {
                try {
                    const files = execSync(\`find . -name "\${pattern}" -not -path "./node_modules/*"\`, { encoding: 'utf8' });
                    if (files.trim()) {
                        foundSensitive.push(files.trim());
                    }
                } catch (error) {
                    // 忽略find命令错误
                }
            });
            
            if (foundSensitive.length > 0) {
                return {
                    passed: false,
                    message: \`发现敏感文件: \${foundSensitive.join(', ')}\`,
                    critical: true
                };
            }
            
            return { passed: true, message: '未发现敏感文件' };
        });
    }

    checkTranslations() {
        this.runCheck('翻译完整性', () => {
            try {
                execSync('npm run lint:i18n', { stdio: 'pipe' });
                return { passed: true, message: '翻译验证通过' };
            } catch (error) {
                return {
                    passed: false,
                    message: '翻译验证失败',
                    critical: false
                };
            }
        });
    }

    checkSEO() {
        this.runCheck('SEO元素', () => {
            const htmlFiles = ['index.html', 'about.html', 'blog.html'];
            const issues = [];
            
            htmlFiles.forEach(file => {
                if (!fs.existsSync(file)) return;
                
                const content = fs.readFileSync(file, 'utf8');
                
                // 检查关键SEO元素
                const seoElements = [
                    { name: 'title', pattern: /<title>/ },
                    { name: 'description', pattern: /<meta\\s+name="description"/ },
                    { name: 'canonical', pattern: /<link\\s+rel="canonical"/ },
                    { name: 'schema', pattern: /<script\\s+type="application\\/ld\\+json">/ }
                ];
                
                seoElements.forEach(({ name, pattern }) => {
                    if (!pattern.test(content)) {
                        issues.push(\`\${file}缺少\${name}\`);
                    }
                });
            });
            
            if (issues.length > 0) {
                return {
                    passed: false,
                    message: \`SEO问题: \${issues.join(', ')}\`,
                    critical: false
                };
            }
            
            return { passed: true, message: 'SEO元素完整' };
        });
    }

    checkEnvironment() {
        this.runCheck('环境检查', () => {
            // 检查必要的工具
            const requiredTools = ['node', 'npm'];
            const missingTools = [];
            
            requiredTools.forEach(tool => {
                try {
                    execSync(\`\${tool} --version\`, { stdio: 'pipe' });
                } catch (error) {
                    missingTools.push(tool);
                }
            });
            
            if (missingTools.length > 0) {
                return {
                    passed: false,
                    message: \`缺少工具: \${missingTools.join(', ')}\`,
                    critical: true
                };
            }
            
            return { passed: true, message: '环境检查通过' };
        });
    }

    generateDeploymentReport() {
        const successRate = (this.checksPassed / this.checksTotal * 100).toFixed(1);
        const canDeploy = this.criticalIssues.length === 0;
        
        console.log('\\n📊 部署检查报告:');
        console.log(\`   总检查项: \${this.checksTotal}\`);
        console.log(\`   通过项目: \${this.checksPassed}\`);
        console.log(\`   成功率: \${successRate}%\`);
        
        if (this.criticalIssues.length > 0) {
            console.log('\\n🚨 关键问题 (必须修复):');
            this.criticalIssues.forEach(issue => {
                console.log(\`   - \${issue}\`);
            });
        }
        
        console.log(\`\\n部署状态: \${canDeploy ? '✅ 可以部署' : '❌ 需要修复关键问题'}\`);
        
        if (canDeploy) {
            console.log('\\n🚀 部署建议:');
            console.log('   1. 备份当前版本');
            console.log('   2. 更新版本号');
            console.log('   3. 创建部署标签');
            console.log('   4. 监控部署后性能');
        }
        
        return {
            canDeploy,
            successRate: parseFloat(successRate),
            totalChecks: this.checksTotal,
            passedChecks: this.checksPassed,
            criticalIssues: this.criticalIssues,
            timestamp: new Date().toISOString()
        };
    }
}

// 执行部署检查
if (require.main === module) {
    const checker = new DeploymentChecker();
    checker.runPreDeploymentChecks().then(report => {
        process.exit(report.canDeploy ? 0 : 1);
    });
}

module.exports = DeploymentChecker;`;

        fs.writeFileSync('./scripts/deployment-checker.js', deploymentChecker, 'utf8');
        console.log('✅ 创建部署前检查清单');
        this.stats.scriptsGenerated++;
    }

    // 5. 更新package.json脚本
    updatePackageScripts() {
        console.log('📦 更新package.json脚本...');

        const packagePath = './package.json';
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        // 添加维护和监控脚本
        packageData.scripts = {
            ...packageData.scripts,
            
            // 测试脚本
            'test:functional': 'echo "请在浏览器中运行功能测试" && echo "localStorage.setItem(\'autoTest\', \'true\'); location.reload();"',
            'test:quality': 'node scripts/code-quality-checker.js',
            'test:all': 'npm run test:quality',
            
            // 监控脚本
            'monitor:performance': 'echo "性能监控已在生产环境自动启动"',
            'monitor:report': 'echo "window.productionMonitor?.getDetailedReport()" | clipboard',
            
            // 部署脚本
            'predeploy': 'node scripts/deployment-checker.js',
            'deploy:check': 'npm run predeploy',
            'deploy:build': 'npm run deploy:check && npm run build:optimized',
            
            // 维护脚本
            'maintenance:full': 'npm run optimize:prod && npm run test:quality && npm run deploy:check',
            'maintenance:quick': 'npm run test:quality',
            
            // 开发脚本
            'dev:monitor': 'npm run dev && echo "开发环境监控已启动"',
            'dev:test': 'npm run dev && npm run test:functional'
        };

        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');
        console.log('✅ 更新package.json脚本');
        this.stats.scriptsGenerated++;
    }

    // 6. 创建维护文档
    createMaintenanceDocumentation() {
        console.log('📚 创建维护文档...');

        const maintenanceGuide = `# Wplace Paint Tool - 维护指南

## 🔧 日常维护

### 每日检查
\`\`\`bash
# 快速质量检查
npm run maintenance:quick

# 查看性能报告
npm run monitor:report
\`\`\`

### 每周维护
\`\`\`bash
# 完整维护检查
npm run maintenance:full

# 更新依赖
npm audit
npm update
\`\`\`

## 🚀 部署流程

### 1. 部署前检查
\`\`\`bash
# 运行所有检查
npm run deploy:check

# 构建优化版本
npm run deploy:build
\`\`\`

### 2. 部署清单
- [ ] 代码质量检查通过
- [ ] 功能测试通过
- [ ] 性能指标达标
- [ ] SEO元素完整
- [ ] 翻译文件同步
- [ ] 安全检查通过

### 3. 部署后验证
- [ ] 网站可正常访问
- [ ] 核心功能工作正常
- [ ] 性能监控正常
- [ ] 错误率在正常范围

## 📊 监控和报警

### 性能监控
- **LCP**: < 2.5秒
- **FID**: < 100ms
- **CLS**: < 0.1
- **内存使用**: < 100MB
- **错误率**: < 5%

### 监控命令
\`\`\`bash
# 查看详细性能报告
window.productionMonitor.getDetailedReport()

# 查看错误历史
window.errorHandler.getErrorHistory()

# 运行功能测试
localStorage.setItem('autoTest', 'true'); location.reload();
\`\`\`

## 🐛 故障排除

### 常见问题

#### 1. 翻译缺失
\`\`\`bash
npm run lint:i18n
npm run build:i18n
\`\`\`

#### 2. 性能问题
- 检查文件大小: \`npm run test:quality\`
- 查看性能报告: \`window.productionMonitor.getDetailedReport()\`
- 清理浏览器缓存

#### 3. 构建失败
\`\`\`bash
npm run clean
npm run build:all
\`\`\`

#### 4. Console错误
- 检查logger系统是否正常加载
- 查看错误处理器报告
- 检查网络连接

### 紧急处理

#### 网站无法访问
1. 检查服务器状态
2. 验证DNS配置
3. 检查SSL证书
4. 回滚到上一个版本

#### 功能异常
1. 查看浏览器控制台错误
2. 检查网络请求
3. 验证JavaScript加载
4. 检查翻译文件

## 🔄 定期任务

### 月度任务
- [ ] 依赖安全审计
- [ ] 性能基准测试
- [ ] SEO排名检查
- [ ] 用户反馈收集

### 季度任务
- [ ] 代码重构计划
- [ ] 新功能规划
- [ ] 技术栈升级评估
- [ ] 备份策略验证

## 📈 性能优化

### 持续优化
1. **监控指标**: 定期查看Core Web Vitals
2. **代码审查**: 每次更新前运行质量检查
3. **依赖管理**: 定期更新和清理依赖
4. **缓存优化**: 监控缓存命中率

### 优化建议
- 压缩图像资源
- 使用CDN加速
- 启用浏览器缓存
- 优化JavaScript加载

## 🛡️ 安全维护

### 安全检查清单
- [ ] 依赖漏洞扫描
- [ ] 敏感文件检查
- [ ] HTTPS配置验证
- [ ] CSP策略更新

### 应急响应
1. 立即评估影响范围
2. 隔离受影响系统
3. 修复安全漏洞
4. 通知相关人员
5. 部署修复版本

## 📞 联系信息

### 维护团队
- **技术负责人**: [联系方式]
- **部署负责人**: [联系方式]
- **安全负责人**: [联系方式]

### 紧急联系
- **24/7值班**: [联系方式]
- **托管商支持**: [联系方式]

---

📝 **注意**: 此文档应定期更新，确保与实际维护流程保持同步。`;

        fs.writeFileSync('./docs/MAINTENANCE.md', maintenanceGuide, 'utf8');
        console.log('✅ 创建维护文档');
        
        // 确保docs目录存在
        if (!fs.existsSync('./docs')) {
            fs.mkdirSync('./docs', { recursive: true });
        }
        
        this.stats.scriptsGenerated++;
    }

    // 执行所有设置
    async run() {
        console.log('🔧 开始维护和监控系统设置...\n');

        this.createAutomatedTestSuite();
        this.createPerformanceMonitoring();
        this.createCodeQualityChecks();
        this.createDeploymentChecklist();
        this.updatePackageScripts();
        this.createMaintenanceDocumentation();

        console.log('\n🎉 维护和监控系统设置完成!');
        console.log('📊 设置统计:');
        console.log(`   - 检查脚本: ${this.stats.checksCreated} 个`);
        console.log(`   - 生成脚本: ${this.stats.scriptsGenerated} 个`);
        console.log(`   - 监控系统: ${this.stats.monitorsSetup} 个`);
        
        console.log('\n🛡️ 建立的系统:');
        console.log('   - 自动化功能测试');
        console.log('   - 生产性能监控');
        console.log('   - 代码质量检查');
        console.log('   - 部署前验证');
        console.log('   - 完整维护文档');
        
        console.log('\n📋 下一步操作:');
        console.log('   1. 运行: npm run maintenance:full');
        console.log('   2. 验证: npm run deploy:check');
        console.log('   3. 测试: npm run test:all');
        console.log('   4. 阅读: docs/MAINTENANCE.md');
    }
}

// 执行设置
if (require.main === module) {
    const system = new MaintenanceMonitoringSystem();
    system.run().catch(console.error);
}

module.exports = MaintenanceMonitoringSystem;