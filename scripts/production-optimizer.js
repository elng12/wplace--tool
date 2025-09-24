#!/usr/bin/env node

/**
 * 生产环境优化脚本 - 十年全栈工程师的系统性修复
 * 1. 替换console语句为生产环境友好的logger
 * 2. 修复翻译键问题
 * 3. 优化性能和SEO
 */

const fs = require('fs');
const path = require('path');

class ProductionOptimizer {
    constructor() {
        this.jsFiles = [];
        this.langFiles = [];
        this.stats = {
            consoleFixed: 0,
            translationFixed: 0,
            filesProcessed: 0
        };
        console.log('🚀 启动生产环境优化器...');
    }

    // 扫描所有需要处理的文件
    scanFiles() {
        console.log('🔍 扫描项目文件...');
        
        // 扫描JS文件 (排除自动生成的文件)
        this.scanDirectory('./js', '.js', (file) => {
            if (!file.includes('inline-translations.js')) {
                this.jsFiles.push(file);
            }
        });
        
        // 扫描主目录下的JS文件
        const rootJSFiles = fs.readdirSync('.').filter(f => 
            f.endsWith('.js') && 
            !f.includes('node_modules') &&
            !f.includes('production-optimizer.js')
        );
        rootJSFiles.forEach(file => this.jsFiles.push(`./${file}`));

        // 扫描翻译文件
        this.scanDirectory('./lang', '.json', (file) => {
            this.langFiles.push(file);
        });

        console.log(`📊 发现 ${this.jsFiles.length} 个JS文件, ${this.langFiles.length} 个翻译文件`);
    }

    scanDirectory(dir, ext, callback) {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                this.scanDirectory(filePath, ext, callback);
            } else if (file.endsWith(ext)) {
                callback(filePath);
            }
        });
    }

    // 1. 修复Console语句 - 提升性能
    fixConsoleStatements() {
        console.log('🔧 修复Console语句...');
        
        const consoleReplacements = [
            {
                pattern: /console\.log\(([^)]+)\);?/g,
                replacement: 'window.logger?.log($1);'
            },
            {
                pattern: /console\.warn\(([^)]+)\);?/g,
                replacement: 'window.logger?.warn($1);'
            },
            {
                pattern: /console\.error\(([^)]+)\);?/g,
                replacement: 'window.logger?.error($1);'
            },
            {
                pattern: /console\.debug\(([^)]+)\);?/g,
                replacement: 'window.logger?.debug($1);'
            },
            {
                pattern: /console\.info\(([^)]+)\);?/g,
                replacement: 'window.logger?.info($1);'
            }
        ];

        this.jsFiles.forEach(filePath => {
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;

                consoleReplacements.forEach(({ pattern, replacement }) => {
                    const matches = content.match(pattern);
                    if (matches) {
                        content = content.replace(pattern, replacement);
                        this.stats.consoleFixed += matches.length;
                        modified = true;
                    }
                });

                if (modified) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`✅ 修复 ${filePath}`);
                    this.stats.filesProcessed++;
                }
            } catch (error) {
                console.error(`❌ 处理文件失败: ${filePath}`, error.message);
            }
        });
    }

    // 2. 修复翻译键问题 - 改善用户体验
    fixTranslationKeys() {
        console.log('🌍 修复翻译键问题...');
        
        // 读取英文基准翻译
        const enPath = './lang/en.json';
        if (!fs.existsSync(enPath)) {
            console.error('❌ 找不到英文翻译文件');
            return;
        }

        const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        
        // 添加缺失的键
        const missingKeys = {
            'advanced.showOriginal': 'Show Original Image',
            'error.404.title': '404 - Page Not Found',
            'error.404.message': 'The page you are looking for does not exist.',
            'error.404.home': 'Go Home',
            'error.404.back': 'Go Back',
            'error.404.popular': 'Popular Pages'
        };

        // 修复拼写错误
        const spellingFixes = {
            'blog.dithering.floyd_steingerg': 'blog.dithering.floyd_steinberg'
        };

        // 更新英文翻译
        Object.assign(enTranslations, missingKeys);
        
        // 处理拼写错误
        Object.entries(spellingFixes).forEach(([wrong, correct]) => {
            if (enTranslations[wrong]) {
                enTranslations[correct] = enTranslations[wrong];
                delete enTranslations[wrong];
            }
        });

        fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
        console.log('✅ 更新英文翻译基准');

        // 更新其他语言文件
        this.langFiles.forEach(filePath => {
            if (filePath === enPath) return;
            
            try {
                const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const langCode = path.basename(filePath, '.json');
                let modified = false;

                // 添加缺失的键 (使用英文作为后备)
                Object.entries(missingKeys).forEach(([key, value]) => {
                    if (!translations[key]) {
                        translations[key] = value; // 可以后续人工翻译
                        modified = true;
                    }
                });

                // 修复拼写错误
                Object.entries(spellingFixes).forEach(([wrong, correct]) => {
                    if (translations[wrong]) {
                        translations[correct] = translations[wrong];
                        delete translations[wrong];
                        modified = true;
                    }
                });

                if (modified) {
                    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
                    console.log(`✅ 更新 ${langCode} 翻译`);
                    this.stats.translationFixed++;
                }
            } catch (error) {
                console.error(`❌ 处理翻译文件失败: ${filePath}`, error.message);
            }
        });
    }

    // 3. 创建404错误页面
    create404Page() {
        console.log('📄 创建SEO友好的404页面...');
        
        const html404 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-lang="error.404.title">404 - Page Not Found | Wplace Paint Tool</title>
    <meta name="description" content="Page not found. Return to the best pixel art converter for Wplace with official color palette matching.">
    <link rel="canonical" href="https://wplacetool.app/404.html">
    <link rel="stylesheet" href="css/main.css">
    <style>
        .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="text-center text-white p-8">
            <h1 class="text-6xl font-bold mb-4">404</h1>
            <h2 class="text-2xl mb-6" data-lang="error.404.title">Page Not Found</h2>
            <p class="text-lg mb-8" data-lang="error.404.message">The page you are looking for does not exist.</p>
            
            <div class="space-x-4">
                <a href="/" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors" data-lang="error.404.home">
                    Go Home
                </a>
                <button onclick="history.back()" class="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors" data-lang="error.404.back">
                    Go Back
                </button>
            </div>

            <div class="mt-12">
                <h3 class="text-lg mb-4" data-lang="error.404.popular">Popular Pages</h3>
                <div class="space-y-2">
                    <a href="/" class="block text-blue-200 hover:text-white transition-colors">Pixel Art Converter</a>
                    <a href="/about.html" class="block text-blue-200 hover:text-white transition-colors">About</a>
                    <a href="/blog.html" class="block text-blue-200 hover:text-white transition-colors">Blog</a>
                </div>
            </div>
        </div>
    </div>

    <script src="js/logger.js"></script>
    <script src="js/i18n.js"></script>
    <script>
        // 初始化国际化
        if (window.OptimizedI18nSystem) {
            const i18n = new OptimizedI18nSystem();
            i18n.init();
        }
        
        // SEO和性能优化
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
    </script>
</body>
</html>`;

        fs.writeFileSync('./404.html', html404, 'utf8');
        console.log('✅ 创建SEO优化的404页面');
    }

    // 4. 优化package.json脚本
    optimizePackageScripts() {
        console.log('📦 优化构建脚本...');
        
        const packagePath = './package.json';
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        // 添加生产环境优化脚本
        packageData.scripts = {
            ...packageData.scripts,
            'optimize:prod': 'node scripts/production-optimizer.js',
            'build:optimized': 'npm run optimize:prod && npm run build:all',
            'deploy:prep': 'npm run build:optimized && npm audit fix',
            'performance:check': 'npm run build:optimized && echo "Ready for Lighthouse testing"'
        };

        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');
        console.log('✅ 优化package.json脚本');
    }

    // 执行所有优化
    async run() {
        this.scanFiles();
        this.fixConsoleStatements();
        this.fixTranslationKeys();
        this.create404Page();
        this.optimizePackageScripts();

        console.log('\n🎉 生产环境优化完成!');
        console.log('📊 统计信息:');
        console.log(`   - 修复Console语句: ${this.stats.consoleFixed} 个`);
        console.log(`   - 修复翻译文件: ${this.stats.translationFixed} 个`);
        console.log(`   - 处理文件: ${this.stats.filesProcessed} 个`);
        console.log('\n🚀 建议下一步:');
        console.log('   1. 运行 npm run build:optimized');
        console.log('   2. 测试 Lighthouse 性能分数');
        console.log('   3. 验证翻译完整性');
    }
}

// 执行优化
if (require.main === module) {
    const optimizer = new ProductionOptimizer();
    optimizer.run().catch(console.error);
}

module.exports = ProductionOptimizer;