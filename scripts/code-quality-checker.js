#!/usr/bin/env node

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
        const consoleRegex = /console\.(log|warn|error|debug)\(/g;
        const matches = content.match(consoleRegex);
        
        if (matches && !content.includes('window.logger')) {
            this.addIssue('CONSOLE_STATEMENTS', file, 
                `发现 ${matches.length} 个console语句，应使用logger系统`);
        }
    }

    // 检查TODO注释
    checkTodoComments(file, content) {
        const todoRegex = /\/\/(.*)(TODO|FIXME|BUG|HACK)(.*)/gi;
        const matches = content.match(todoRegex);
        
        if (matches) {
            matches.forEach(match => {
                this.addWarning('TODO_COMMENT', file, `待处理注释: ${match.trim()}`);
            });
        }
    }

    // 检查硬编码URL
    checkHardcodedUrls(file, content) {
        const urlRegex = /https?:\/\/[^'"`\s]+/g;
        const matches = content.match(urlRegex);
        
        if (matches) {
            matches.forEach(url => {
                if (!url.includes('wplace.vercel.app') && !url.includes('localhost')) {
                    this.addWarning('HARDCODED_URL', file, `硬编码URL: ${url}`);
                }
            });
        }
    }

    // 检查未使用变量（简单检查）
    checkUnusedVariables(file, content) {
        const varRegex = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
        let match;
        
        while ((match = varRegex.exec(content)) !== null) {
            const varName = match[1];
            const usage = new RegExp(`\\b${varName}\\b`, 'g');
            const usageCount = (content.match(usage) || []).length;
            
            if (usageCount === 1) { // 只出现在声明处
                this.addWarning('UNUSED_VARIABLE', file, `可能未使用的变量: ${varName}`);
            }
        }
    }

    // 检查安全问题
    checkSecurityIssues(file, content) {
        const securityPatterns = [
            { pattern: /eval\(/g, issue: 'EVAL_USAGE', message: '使用eval()存在安全风险' },
            { pattern: /innerHTML\s*=\s*[^'"]/, issue: 'INNER_HTML', message: '动态innerHTML可能导致XSS' },
            { pattern: /document\.write\(/g, issue: 'DOCUMENT_WRITE', message: 'document.write存在安全风险' }
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
            { tag: 'description', pattern: /<meta\s+name="description"/ },
            { tag: 'viewport', pattern: /<meta\s+name="viewport"/ },
            { tag: 'charset', pattern: /<meta\s+charset=/ }
        ];
        
        requiredMeta.forEach(({ tag, pattern }) => {
            if (!pattern.test(content)) {
                this.addIssue('MISSING_META', file, `缺失meta标签: ${tag}`);
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
                            `缺失翻译键: ${missingKeys.slice(0, 5).join(', ')}`);
                    }
                    
                    if (extraKeys.length > 0) {
                        this.addWarning('EXTRA_TRANSLATION_KEYS', file, 
                            `多余翻译键: ${extraKeys.slice(0, 5).join(', ')}`);
                    }
                }
            } catch (error) {
                this.addIssue('INVALID_JSON', file, `JSON格式错误: ${error.message}`);
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
                    `可能未使用的依赖: ${unusedDeps.join(', ')}`);
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
        console.log('\n📊 代码质量检查报告:');
        console.log(`   文件检查: ${this.stats.filesChecked} 个`);
        console.log(`   问题发现: ${this.stats.issuesFound} 个`);
        console.log(`   警告发现: ${this.stats.warningsFound} 个`);
        
        if (this.issues.length > 0) {
            console.log('\n❌ 发现问题:');
            this.issues.forEach(issue => {
                console.log(`   [${issue.type}] ${issue.file}: ${issue.message}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ 警告信息:');
            this.warnings.forEach(warning => {
                console.log(`   [${warning.type}] ${warning.file}: ${warning.message}`);
            });
        }
        
        const status = this.issues.length === 0 ? 'PASS' : 'FAIL';
        console.log(`\n状态: ${status}`);
        
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

module.exports = CodeQualityChecker;