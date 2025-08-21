#!/usr/bin/env node

/**
 * 多语言系统检查工具
 * 用于诊断和修复多语言配置问题
 */

const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, 'lang');
const languages = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'pt-BR', 'pt', 'he', 'ru', 'th', 'tr', 'vi', 'pl', 'mi', 'gn'];

console.log('🔍 开始检查多语言系统...\n');

// 1. 检查所有语言文件是否存在
console.log('📁 语言文件检查:');
const existingLangs = [];
const missingLangs = [];

languages.forEach(lang => {
    const filePath = path.join(langDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        existingLangs.push(lang);
        console.log(`  ✅ ${lang}.json 存在`);
    } else {
        missingLangs.push(lang);
        console.log(`  ❌ ${lang}.json 缺失`);
    }
});

// 2. 加载英文作为基准
let enKeys = [];
let enTranslations = {};
try {
    const enContent = fs.readFileSync(path.join(langDir, 'en.json'), 'utf8');
    enTranslations = JSON.parse(enContent);
    enKeys = Object.keys(enTranslations);
    console.log(`\n📊 英文基准: ${enKeys.length} 个翻译键`);
} catch (error) {
    console.error('\n❌ 无法加载英文基准文件:', error.message);
    process.exit(1);
}

// 3. 检查每个语言文件的键名一致性
console.log('\n🔑 键名一致性检查:');
const keyReport = {};

existingLangs.forEach(lang => {
    if (lang === 'en') return;
    
    try {
        const content = fs.readFileSync(path.join(langDir, `${lang}.json`), 'utf8');
        const translations = JSON.parse(content);
        const langKeys = Object.keys(translations);
        
        const missingKeys = enKeys.filter(key => !translations.hasOwnProperty(key));
        const extraKeys = langKeys.filter(key => !enTranslations.hasOwnProperty(key));
        
        keyReport[lang] = {
            total: langKeys.length,
            missing: missingKeys,
            extra: extraKeys
        };
        
        if (missingKeys.length === 0 && extraKeys.length === 0) {
            console.log(`  ✅ ${lang}: 完全一致 (${langKeys.length} 个键)`);
        } else {
            console.log(`  ⚠️  ${lang}: ${langKeys.length} 个键`);
            if (missingKeys.length > 0) {
                console.log(`      缺失 ${missingKeys.length} 个键: ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}`);
            }
            if (extraKeys.length > 0) {
                console.log(`      多余 ${extraKeys.length} 个键: ${extraKeys.slice(0, 3).join(', ')}${extraKeys.length > 3 ? '...' : ''}`);
            }
        }
    } catch (error) {
        console.log(`  ❌ ${lang}: 文件读取或解析错误 - ${error.message}`);
        keyReport[lang] = { error: error.message };
    }
});

// 4. 生成修复建议
console.log('\n🔧 修复建议:');

let hasIssues = false;

// 检查缺失的语言文件
if (missingLangs.length > 0) {
    hasIssues = true;
    console.log(`\n  1. 创建缺失的语言文件:`);
    missingLangs.forEach(lang => {
        console.log(`     cp lang/en.json lang/${lang}.json`);
    });
}

// 检查键名不一致的文件
const inconsistentLangs = Object.keys(keyReport).filter(lang => 
    keyReport[lang].missing && keyReport[lang].missing.length > 0
);

if (inconsistentLangs.length > 0) {
    hasIssues = true;
    console.log(`\n  2. 修复键名不一致的文件:`);
    console.log(`     运行 node fix-keys.js 来自动补充缺失的键`);
}

if (!hasIssues) {
    console.log('  ✅ 所有语言文件配置正确，无需修复！');
}

// 5. 生成修复脚本
if (hasIssues) {
    console.log('\n📝 生成自动修复脚本 fix-keys.js...');
    
    const fixScript = `#!/usr/bin/env node

/**
 * 自动修复多语言键名不一致问题
 */

const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, 'lang');

// 加载英文基准
const enContent = fs.readFileSync(path.join(langDir, 'en.json'), 'utf8');
const enTranslations = JSON.parse(enContent);

const languages = ${JSON.stringify(existingLangs.filter(l => l !== 'en'))};

console.log('🔧 开始修复键名不一致问题...\\n');

languages.forEach(lang => {
    const filePath = path.join(langDir, \`\${lang}.json\`);
    
    try {
        let translations = {};
        
        // 尝试读取现有文件
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            translations = JSON.parse(content);
        }
        
        // 补充缺失的键（使用英文作为默认值）
        let addedCount = 0;
        Object.keys(enTranslations).forEach(key => {
            if (!translations.hasOwnProperty(key)) {
                translations[key] = enTranslations[key];
                addedCount++;
            }
        });
        
        // 保存更新后的文件
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
        
        if (addedCount > 0) {
            console.log(\`  ✅ \${lang}.json: 添加了 \${addedCount} 个缺失的键\`);
        } else {
            console.log(\`  ✅ \${lang}.json: 已经完整\`);
        }
    } catch (error) {
        console.error(\`  ❌ \${lang}.json: 处理失败 - \${error.message}\`);
    }
});

console.log('\\n✅ 修复完成！');
`;

    fs.writeFileSync(path.join(__dirname, 'fix-keys.js'), fixScript, 'utf8');
    console.log('  ✅ fix-keys.js 已生成');
}

// 6. 总结
console.log('\n📈 总结:');
console.log(`  - 支持的语言: ${existingLangs.length} 个`);
console.log(`  - 基准翻译键: ${enKeys.length} 个`);
if (hasIssues) {
    console.log(`  - 需要修复: 是`);
    console.log(`\n  💡 运行 'node fix-keys.js' 来自动修复问题`);
} else {
    console.log(`  - 状态: ✅ 一切正常`);
}