#!/usr/bin/env node
/**
 * 批量清理JavaScript文件中的console.log语句
 * 使用新的日志系统替换
 */

const fs = require('fs');
const path = require('path');

// 替换规则
const replacements = [
    {
        pattern: /console\.log\(['"]([^'"]+)['"]\);?/g,
        replacement: (match, message) => `window.logger?.debug('${message}');`
    },
    {
        pattern: /console\.log\((.+)\);?/g,
        replacement: (match, args) => `window.logger?.debug(${args});`
    },
    {
        pattern: /console\.debug\((.+)\);?/g,
        replacement: (match, args) => `window.logger?.debug(${args});`
    },
    {
        pattern: /console\.info\((.+)\);?/g,
        replacement: (match, args) => `window.logger?.info(${args});`
    },
    {
        pattern: /console\.warn\((.+)\);?/g,
        replacement: (match, args) => `window.logger?.warn(${args});`
    },
    {
        pattern: /console\.error\((.+)\);?/g,
        replacement: (match, args) => `window.logger?.error(${args});`
    }
];

// 需要处理的文件
const filesToProcess = [
    'js/accessibility.js',
    'js/app-simple.js',
    'js/i18n.js',
    'js/performance-monitor.js',
    'js/analytics.js'
];

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modifiedContent = content;
        
        // 应用所有替换规则
        replacements.forEach(({ pattern, replacement }) => {
            modifiedContent = modifiedContent.replace(pattern, replacement);
        });
        
        // 如果内容有变化，保存文件
        if (modifiedContent !== content) {
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
            window.logger?.log(`✅ 已处理文件: ${filePath}`);
        } else {
            window.logger?.log(`ℹ️  文件无需修改: ${filePath}`);
        }
    } catch (error) {
        window.logger?.error(`❌ 处理文件 ${filePath} 时出错:`, error.message);
    }
}

function main() {
    window.logger?.log('🧹 开始清理JavaScript调试代码...\n');
    
    filesToProcess.forEach(file => {
        const fullPath = path.resolve(file);
        if (fs.existsSync(fullPath)) {
            processFile(fullPath);
        } else {
            window.logger?.warn(`⚠️  文件不存在: ${fullPath}`);
        }
    });
    
    window.logger?.log('\n✅ 调试代码清理完成');
}

if (require.main === module) {
    main();
}

module.exports = { processFile, replacements };