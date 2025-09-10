// 浏览器控制台测试脚本
// 请在 http://localhost:8000 页面的开发者工具控制台中运行此脚本

window.logger?.log('🧪 Wplace 图片上传功能测试开始...');
window.logger?.log('====================================');

// 测试函数集合
window.wplaceTest = {
    
    // 检查页面元素状态
    checkElements() {
        window.logger?.log('\n🔍 检查页面元素状态:');
        
        const elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            previewCanvas: document.getElementById('preview-canvas'),
            outputCanvas: document.getElementById('output-canvas'),
            uploadPrompt: document.getElementById('upload-prompt'),
            processBtn: document.getElementById('process-btn'),
            downloadBtn: document.getElementById('download-btn')
        };
        
        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                const styles = getComputedStyle(element);
                window.logger?.log(`✅ ${name}:`, {
                    display: element.style.display || 'default',
                    computedDisplay: styles.display,
                    visibility: element.style.visibility || 'default',
                    classList: [...element.classList],
                    dimensions: element.tagName === 'CANVAS' ? 
                        `${element.width}x${element.height}` : 
                        `${element.offsetWidth}x${element.offsetHeight}`
                });
            } else {
                window.logger?.log(`❌ ${name}: 元素不存在`);
            }
        });
        
        return elements;
    },
    
    // 模拟文件上传（需要手动选择文件）
    simulateUpload() {
        window.logger?.log('\n📤 模拟文件上传:');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
            window.logger?.log('✅ 文件选择对话框应该已打开');
            window.logger?.log('💡 请选择 valid-test.png 文件');
            
            // 监听文件选择
            fileInput.addEventListener('change', (e) => {
                window.logger?.log('📁 文件已选择:', Array.from(e.target.files);.map(f => f.name));
                
                // 延迟检查状态
                setTimeout(() => {
                    this.checkCanvasAfterUpload();
                }, 2000);
            }, { once: true });
        } else {
            window.logger?.log('❌ 文件输入元素不存在');
        }
    },
    
    // 检查上传后的Canvas状态
    checkCanvasAfterUpload() {
        window.logger?.log('\n🖼️  检查上传后Canvas状态:');
        
        const previewCanvas = document.getElementById('preview-canvas');
        const outputCanvas = document.getElementById('output-canvas');
        const uploadPrompt = document.getElementById('upload-prompt');
        const processBtn = document.getElementById('process-btn');
        
        if (previewCanvas) {
            const styles = getComputedStyle(previewCanvas);
            const canvasState = {
                display: previewCanvas.style.display,
                computedDisplay: styles.display,
                visibility: previewCanvas.style.visibility,
                width: previewCanvas.width,
                height: previewCanvas.height,
                offsetWidth: previewCanvas.offsetWidth,
                offsetHeight: previewCanvas.offsetHeight,
                classList: [...previewCanvas.classList],
                isVisible: styles.display !== 'none' && previewCanvas.offsetWidth > 0
            };
            
            window.logger?.log('🎯 preview-canvas状态:', canvasState);
            
            if (canvasState.isVisible) {
                window.logger?.log('✅ Canvas正常显示！');
            } else {
                window.logger?.log('❌ Canvas未正确显示');
                window.logger?.log('🔧 尝试修复显示...');
                
                // 尝试修复显示
                previewCanvas.style.setProperty('display', 'block', 'important');
                previewCanvas.style.setProperty('visibility', 'visible', 'important');
                previewCanvas.classList.remove('hidden');
                
                setTimeout(() => {
                    const fixedStyles = getComputedStyle(previewCanvas);
                    window.logger?.log('🔧 修复后状态:', {
                        display: fixedStyles.display,
                        visibility: fixedStyles.visibility,
                        isVisible: previewCanvas.offsetWidth > 0
                    });
                }, 100);
            }
        }
        
        if (uploadPrompt) {
            const promptStyles = getComputedStyle(uploadPrompt);
            window.logger?.log('📝 upload-prompt状态:', {
                display: promptStyles.display,
                classList: [...uploadPrompt.classList]
            });
        }
        
        if (processBtn) {
            window.logger?.log('🔘 process-btn状态:', {
                disabled: processBtn.disabled,
                classList: [...processBtn.classList]
            });
        }
    },
    
    // 测试Process功能
    testProcess() {
        window.logger?.log('\n⚙️  测试Process功能:');
        const processBtn = document.getElementById('process-btn');
        
        if (processBtn && !processBtn.disabled) {
            window.logger?.log('🖱️  点击Process按钮...');
            processBtn.click();
            
            setTimeout(() => {
                this.checkProcessResult();
            }, 3000);
        } else {
            window.logger?.log('❌ Process按钮不可用或不存在');
        }
    },
    
    // 检查处理结果
    checkProcessResult() {
        window.logger?.log('\n🎯 检查处理结果:');
        
        const outputCanvas = document.getElementById('output-canvas');
        const downloadBtn = document.getElementById('download-btn');
        
        if (outputCanvas) {
            const styles = getComputedStyle(outputCanvas);
            window.logger?.log('🖼️  output-canvas状态:', {
                display: styles.display,
                width: outputCanvas.width,
                height: outputCanvas.height,
                isVisible: outputCanvas.offsetWidth > 0
            });
        }
        
        if (downloadBtn) {
            window.logger?.log('💾 download-btn状态:', {
                disabled: downloadBtn.disabled,
                classList: [...downloadBtn.classList]
            });
        }
    },
    
    // 完整测试流程
    runFullTest() {
        window.logger?.log('\n🚀 开始完整测试流程:');
        window.logger?.log('1. 检查页面元素...');
        this.checkElements();
        
        window.logger?.log('\n2. 准备文件上传测试...');
        window.logger?.log('💡 接下来会打开文件选择对话框');
        window.logger?.log('💡 请选择 valid-test.png 文件');
        
        setTimeout(() => {
            this.simulateUpload();
        }, 2000);
    },
    
    // 获取详细的调试信息
    getDebugInfo() {
        window.logger?.log('\n🔧 详细调试信息:');
        
        const info = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            currentImage: window.currentImage ? 'loaded' : 'not loaded',
            globalVariables: {
                wplaceApp: typeof window.wplaceApp,
                performanceMonitor: typeof window.performanceMonitor,
                UI: typeof window.UI
            },
            canvasStates: {}
        };
        
        ['preview-canvas', 'output-canvas'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const styles = getComputedStyle(canvas);
                info.canvasStates[id] = {
                    display: canvas.style.display,
                    computedDisplay: styles.display,
                    visibility: canvas.style.visibility,
                    width: canvas.width,
                    height: canvas.height,
                    offsetWidth: canvas.offsetWidth,
                    offsetHeight: canvas.offsetHeight,
                    classList: [...canvas.classList]
                };
            }
        });
        
        window.logger?.log('📊 调试信息:', info);
        return info;
    }
};

window.logger?.log('✅ 测试工具已准备完毕！');
window.logger?.log('\n📋 使用方法:');
window.logger?.log('- wplaceTest.checkElements(); - 检查页面元素');
window.logger?.log('- wplaceTest.simulateUpload(); - 模拟文件上传');
window.logger?.log('- wplaceTest.runFullTest(); - 运行完整测试');
window.logger?.log('- wplaceTest.getDebugInfo(); - 获取调试信息');
window.logger?.log('\n🎯 快速开始: 运行 wplaceTest.runFullTest();');