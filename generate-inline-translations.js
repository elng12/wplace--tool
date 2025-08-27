/**
 * 自动生成内联翻译脚本
 * 读取所有 lang/*.json 文件并生成 inline-translations.js
 */

const fs = require('fs');
const path = require('path');

const LANG_DIR = './lang';
const OUTPUT_FILE = './js/inline-translations.js';

function generateInlineTranslations() {
    console.log('🚀 开始生成内联翻译文件...');
    
    // 读取语言目录
    const langFiles = fs.readdirSync(LANG_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    
    console.log('📋 发现语言文件:', langFiles);
    
    // 生成JavaScript内容
    let jsContent = `/**
 * 内联翻译数据 - 为本地 file:// 环境提供无 CORS 错误的翻译支持
 * 自动生成于 ${new Date().toISOString()}，请勿手动编辑
 */

// 初始化内联翻译对象
window.__INLINE_I18N__ = window.__INLINE_I18N__ || {};

`;

    // 为每种语言生成数据
    for (const lang of langFiles) {
        try {
            const langFilePath = path.join(LANG_DIR, `${lang}.json`);
            const langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
            
            // 选择重要的翻译键（避免文件过大）
            const essentialKeys = [
                'title', 'nav.home', 'nav.converter', 'nav.blog', 'nav.about', 'nav.privacy', 'nav.terms',
                'hero.title', 'hero.description', 'upload.main', 'upload.sub', 'pixel.size',
                'advanced.title', 'advanced.dithering', 'advanced.scaling', 'advanced.grid',
                'scaling.nearest', 'scaling.bilinear', 'scaling.lanczos',
                'preview.title', 'btn.download', 'btn.process', 'btn.reset', 'loading',
                'palette.title', 'used.colors.title', 'footer.copyright',
                'features.special.title', 'features.subtitle.desc'
            ];
            
            const essentialData = {};
            essentialKeys.forEach(key => {
                if (langData[key]) {
                    essentialData[key] = langData[key];
                }
            });
            
            jsContent += `// ${lang.toUpperCase()} 翻译数据
window.__INLINE_I18N__.${lang} = ${JSON.stringify(essentialData, null, 2)};

`;
            
            console.log(`✅ 处理 ${lang}: ${Object.keys(essentialData).length} 个键`);
        } catch (error) {
            console.error(`❌ 处理 ${lang} 时出错:`, error.message);
        }
    }
    
    jsContent += `
// 日志输出
console.log('🚀 内联翻译数据已加载，支持语言:', Object.keys(window.__INLINE_I18N__));
console.log('📊 内联翻译统计:', Object.fromEntries(
    Object.entries(window.__INLINE_I18N__).map(([lang, data]) => [lang, Object.keys(data).length])
));`;

    // 写入文件
    fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
    console.log(`✅ 内联翻译文件已生成: ${OUTPUT_FILE}`);
    console.log(`📁 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
}

// 如果直接运行此脚本
if (require.main === module) {
    generateInlineTranslations();
}

module.exports = { generateInlineTranslations };