// Puppeteer 自动化测试脚本
// 测试 localhost:8000 的图片上传功能

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testImageUpload() {
    console.log('🚀 启动 Puppeteer 自动化测试...');
    
    let browser;
    try {
        // 启动浏览器
        browser = await puppeteer.launch({ 
            headless: false, // 显示浏览器界面
            slowMo: 500,     // 减慢操作速度以便观察
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // 监听控制台输出
        page.on('console', msg => {
            console.log('🖥️  浏览器控制台:', msg.text());
        });
        
        // 监听错误
        page.on('error', err => {
            console.error('❌ 页面错误:', err.message);
        });
        
        console.log('📂 导航到 localhost:8000...');
        await page.goto('http://localhost:8000', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('⏳ 等待页面完全加载...');
        await page.waitForSelector('#uploadArea', { timeout: 10000 });
        await page.waitForSelector('#preview-canvas', { timeout: 10000 });
        
        // 截图 - 初始状态
        console.log('📸 截图：初始状态');
        await page.screenshot({ 
            path: 'test-screenshot-1-initial.png',
            fullPage: true 
        });
        
        // 检查初始canvas状态
        const initialCanvasState = await page.evaluate(() => {
            const canvas = document.getElementById('preview-canvas');
            return {
                display: canvas.style.display,
                computedDisplay: getComputedStyle(canvas).display,
                visibility: canvas.style.visibility,
                classList: [...canvas.classList],
                width: canvas.width,
                height: canvas.height
            };
        });
        
        console.log('🔍 初始canvas状态:', initialCanvasState);
        
        // 准备上传文件
        const validTestPath = path.join(__dirname, 'valid-test.png');
        console.log('📁 准备上传文件:', validTestPath);
        
        // 确保文件存在
        if (!fs.existsSync(validTestPath)) {
            throw new Error('测试文件不存在: ' + validTestPath);
        }
        
        // 点击上传区域
        console.log('🖱️  点击上传区域...');
        await page.click('#uploadArea');
        
        // 上传文件
        console.log('📤 上传文件...');
        const fileInput = await page.$('#fileInput');
        await fileInput.uploadFile(validTestPath);
        
        // 等待文件处理
        console.log('⏳ 等待文件处理...');
        await page.waitForTimeout(2000);
        
        // 等待canvas显示
        console.log('⏳ 等待canvas显示...');
        try {
            await page.waitForFunction(() => {
                const canvas = document.getElementById('preview-canvas');
                const computedStyle = getComputedStyle(canvas);
                return computedStyle.display !== 'none' && canvas.width > 0;
            }, { timeout: 10000 });
            console.log('✅ Canvas已显示');
        } catch (error) {
            console.log('⚠️  Canvas显示检测超时，继续检查状态...');
        }
        
        // 截图 - 上传后状态
        console.log('📸 截图：上传后状态');
        await page.screenshot({ 
            path: 'test-screenshot-2-after-upload.png',
            fullPage: true 
        });
        
        // 检查上传后的canvas状态
        const uploadedCanvasState = await page.evaluate(() => {
            const canvas = document.getElementById('preview-canvas');
            const uploadPrompt = document.getElementById('upload-prompt');
            const processBtn = document.getElementById('process-btn');
            
            return {
                canvas: {
                    display: canvas.style.display,
                    computedDisplay: getComputedStyle(canvas).display,
                    visibility: canvas.style.visibility,
                    classList: [...canvas.classList],
                    width: canvas.width,
                    height: canvas.height,
                    offsetWidth: canvas.offsetWidth,
                    offsetHeight: canvas.offsetHeight
                },
                uploadPrompt: {
                    display: uploadPrompt ? uploadPrompt.style.display : 'not found',
                    computedDisplay: uploadPrompt ? getComputedStyle(uploadPrompt).display : 'not found',
                    classList: uploadPrompt ? [...uploadPrompt.classList] : []
                },
                processBtn: {
                    disabled: processBtn ? processBtn.disabled : 'not found',
                    classList: processBtn ? [...processBtn.classList] : []
                }
            };
        });
        
        console.log('🔍 上传后状态:', JSON.stringify(uploadedCanvasState, null, 2));
        
        // 检查Process按钮是否可用
        const processButton = await page.$('#process-btn');
        if (processButton) {
            const isDisabled = await page.evaluate(btn => btn.disabled, processButton);
            console.log('🔘 Process按钮状态:', isDisabled ? '禁用' : '可用');
            
            if (!isDisabled) {
                console.log('🖱️  点击Process按钮...');
                await processButton.click();
                
                // 等待处理完成
                console.log('⏳ 等待图片处理...');
                await page.waitForTimeout(3000);
                
                // 截图 - 处理后状态
                console.log('📸 截图：处理后状态');
                await page.screenshot({ 
                    path: 'test-screenshot-3-after-process.png',
                    fullPage: true 
                });
                
                // 检查输出canvas
                const outputCanvasState = await page.evaluate(() => {
                    const outputCanvas = document.getElementById('output-canvas');
                    const downloadBtn = document.getElementById('download-btn');
                    
                    return {
                        outputCanvas: outputCanvas ? {
                            display: outputCanvas.style.display,
                            computedDisplay: getComputedStyle(outputCanvas).display,
                            width: outputCanvas.width,
                            height: outputCanvas.height
                        } : 'not found',
                        downloadBtn: downloadBtn ? {
                            disabled: downloadBtn.disabled,
                            classList: [...downloadBtn.classList]
                        } : 'not found'
                    };
                });
                
                console.log('🔍 处理后状态:', JSON.stringify(outputCanvasState, null, 2));
            }
        }
        
        // 生成测试报告
        const testReport = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:8000',
            testFile: 'valid-test.png',
            results: {
                pageLoaded: true,
                canvasInitialState: initialCanvasState,
                canvasAfterUpload: uploadedCanvasState,
                screenshots: [
                    'test-screenshot-1-initial.png',
                    'test-screenshot-2-after-upload.png', 
                    'test-screenshot-3-after-process.png'
                ]
            }
        };
        
        fs.writeFileSync('puppeteer-test-report.json', JSON.stringify(testReport, null, 2));
        console.log('📋 测试报告已保存到 puppeteer-test-report.json');
        
        console.log('✅ 自动化测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
        
        if (browser) {
            const page = (await browser.pages())[0];
            if (page) {
                await page.screenshot({ 
                    path: 'test-error-screenshot.png',
                    fullPage: true 
                });
                console.log('📸 错误截图已保存');
            }
        }
        
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 检查Puppeteer是否已安装
try {
    require.resolve('puppeteer');
    console.log('✅ 检测到Puppeteer，开始测试...');
    testImageUpload();
} catch (error) {
    console.log('❌ Puppeteer未安装');
    console.log('💡 安装命令: npm install puppeteer');
    console.log('⚠️  如果不想安装Puppeteer，请使用手动测试方式');
}