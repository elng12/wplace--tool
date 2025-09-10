/**
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
        console.log(`${icon} ${testName}: ${message}`);
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
                successRate: `${success}%`
            },
            results: this.testResults,
            status: passed === total ? 'PASS' : 'FAIL'
        };
        
        console.log('📊 测试报告:');
        console.log(`   总计: ${total} 个测试`);
        console.log(`   通过: ${passed} 个`);
        console.log(`   失败: ${total - passed} 个`);
        console.log(`   成功率: ${success}%`);
        
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
window.FunctionalTestSuite = FunctionalTestSuite;