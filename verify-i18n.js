#!/usr/bin/env node

/**
 * 完整验证多语言系统是否正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始验证多语言系统...\n');

// 1. 检查文件夹结构
console.log('📁 检查文件夹结构:');
const requiredDirs = ['lang', 'locales'];
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
        console.log(`  ✅ ${dir}/ 存在 (${files.length} 个JSON文件)`);
    } else {
        console.log(`  ❌ ${dir}/ 不存在`);
    }
});

// 2. 验证 locales 文件夹内容
console.log('\n📊 验证 locales 文件夹:');
const localesPath = path.join(__dirname, 'locales');
const expectedLangs = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'pt-BR', 'he', 'ru', 'th', 'tr', 'vi', 'pl', 'mi', 'gn'];

let allValid = true;
expectedLangs.forEach(lang => {
    const filePath = path.join(localesPath, `${lang}.json`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const keys = Object.keys(data);
        
        // 检查关键键是否存在
        const requiredKeys = ['title', 'nav.home', 'pixel.size', 'upload.main'];
        const hasAllKeys = requiredKeys.every(key => data[key]);
        
        if (hasAllKeys) {
            console.log(`  ✅ ${lang}.json - ${keys.length} 个键，包含所有必需键`);
        } else {
            console.log(`  ⚠️  ${lang}.json - ${keys.length} 个键，缺少某些必需键`);
            allValid = false;
        }
    } catch (error) {
        console.log(`  ❌ ${lang}.json - 错误: ${error.message}`);
        allValid = false;
    }
});

// 3. 检查 i18n.js 文件
console.log('\n📝 检查 i18n.js 文件:');
const i18nPath = path.join(__dirname, 'js', 'i18n.js');
if (fs.existsSync(i18nPath)) {
    const content = fs.readFileSync(i18nPath, 'utf8');
    
    // 检查关键代码
    const checks = [
        { pattern: /fetch\(`\/locales\//, desc: '使用 /locales/ 路径' },
        { pattern: /localStorage\.getItem\('language'\)/, desc: '使用 language 键保存' },
        { pattern: /data-lang.*data-i18n/, desc: '同时支持 data-lang 和 data-i18n' },
        { pattern: /window\.loadTranslations/, desc: '导出 loadTranslations 函数' },
        { pattern: /window\.setLanguage/, desc: '导出 setLanguage 函数' }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            console.log(`  ✅ ${check.desc}`);
        } else {
            console.log(`  ❌ 未找到: ${check.desc}`);
            allValid = false;
        }
    });
} else {
    console.log('  ❌ js/i18n.js 文件不存在！');
    allValid = false;
}

// 4. 检查 HTML 文件
console.log('\n📄 检查 HTML 文件:');
const htmlFiles = ['index.html', 'about.html', 'blog.html', 'privacy.html', 'terms.html'];
htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 统计 data-lang 和 data-i18n
        const dataLangCount = (content.match(/data-lang=/g) || []).length;
        const dataI18nCount = (content.match(/data-i18n=/g) || []).length;
        
        if (dataLangCount > 0) {
            console.log(`  ✅ ${file}: ${dataLangCount} 个 data-lang 属性`);
        } else if (dataI18nCount > 0) {
            console.log(`  ⚠️  ${file}: 仍有 ${dataI18nCount} 个 data-i18n (建议统一为 data-lang)`);
        } else {
            console.log(`  ℹ️  ${file}: 没有找到翻译标记`);
        }
    }
});

// 5. 总结
console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('✅ 多语言系统配置完美！');
    console.log('\n下一步:');
    console.log('1. 访问 http://localhost:8000/test-new-i18n.html 测试');
    console.log('2. 清除浏览器缓存 (Ctrl+F5)');
    console.log('3. 如有问题，运行: localStorage.clear() 在控制台');
} else {
    console.log('⚠️  发现一些问题，请检查上面的输出');
    console.log('\n建议:');
    console.log('1. 确保 locales/ 文件夹包含所有语言文件');
    console.log('2. 确保 i18n.js 已更新为新版本');
    console.log('3. 清除浏览器缓存后重试');
}

console.log('\n💡 提示: 服务器运行在 http://localhost:8000');