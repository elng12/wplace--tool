#!/usr/bin/env node

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
        console.log(`🔍 检查: ${name}`);
        
        try {
            const result = checkFunction();
            if (result.passed) {
                console.log(`   ✅ 通过: ${result.message}`);
                this.checksPassed++;
            } else {
                console.log(`   ❌ 失败: ${result.message}`);
                if (result.critical) {
                    this.criticalIssues.push(`${name}: ${result.message}`);
                }
            }
            return result;
        } catch (error) {
            console.log(`   ❌ 错误: ${error.message}`);
            this.criticalIssues.push(`${name}: ${error.message}`);
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
                    message: `缺少构建文件: ${missingFiles.join(', ')}`,
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
                        oversizedFiles.push(`${file} (${(size/1024).toFixed(1)}KB)`);
                    }
                }
            });
            
            if (oversizedFiles.length > 0) {
                return {
                    passed: false,
                    message: `文件过大: ${oversizedFiles.join(', ')}`,
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
                    const files = execSync(`find . -name "${pattern}" -not -path "./node_modules/*"`, { encoding: 'utf8' });
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
                    message: `发现敏感文件: ${foundSensitive.join(', ')}`,
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
                    { name: 'description', pattern: /<meta\s+name="description"/ },
                    { name: 'canonical', pattern: /<link\s+rel="canonical"/ },
                    { name: 'schema', pattern: /<script\s+type="application\/ld\+json">/ }
                ];
                
                seoElements.forEach(({ name, pattern }) => {
                    if (!pattern.test(content)) {
                        issues.push(`${file}缺少${name}`);
                    }
                });
            });
            
            if (issues.length > 0) {
                return {
                    passed: false,
                    message: `SEO问题: ${issues.join(', ')}`,
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
                    execSync(`${tool} --version`, { stdio: 'pipe' });
                } catch (error) {
                    missingTools.push(tool);
                }
            });
            
            if (missingTools.length > 0) {
                return {
                    passed: false,
                    message: `缺少工具: ${missingTools.join(', ')}`,
                    critical: true
                };
            }
            
            return { passed: true, message: '环境检查通过' };
        });
    }

    generateDeploymentReport() {
        const successRate = (this.checksPassed / this.checksTotal * 100).toFixed(1);
        const canDeploy = this.criticalIssues.length === 0;
        
        console.log('\n📊 部署检查报告:');
        console.log(`   总检查项: ${this.checksTotal}`);
        console.log(`   通过项目: ${this.checksPassed}`);
        console.log(`   成功率: ${successRate}%`);
        
        if (this.criticalIssues.length > 0) {
            console.log('\n🚨 关键问题 (必须修复):');
            this.criticalIssues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
        }
        
        console.log(`\n部署状态: ${canDeploy ? '✅ 可以部署' : '❌ 需要修复关键问题'}`);
        
        if (canDeploy) {
            console.log('\n🚀 部署建议:');
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

module.exports = DeploymentChecker;