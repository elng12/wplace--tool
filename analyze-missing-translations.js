/**
 * 分析页面中哪些文本缺少翻译标记
 */

const fs = require('fs');
const path = require('path');

function analyzeHtmlTranslations(filePath) {
    window.logger?.log(`🔍 分析文件: ${path.basename(filePath)}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 找到所有可能需要翻译的文本节点
    const textPatterns = [
        // 标题标签
        /<h[1-6][^>]*>([^<]+)</g,
        // 段落标签
        /<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)</g,
        // 按钮文本
        /<button[^>]*>([^<]+)</g,
        // 链接文本
        /<a[^>]*>([^<]+)</g,
        // span 文本
        /<span[^>]*>([^<]+)</g,
        // label 文本
        /<label[^>]*>([^<]+)</g,
        // div 文本（简单文本内容）
        /<div[^>]*>([^<]{10,}?)</g
    ];
    
    // 找到所有已有翻译标记的元素
    const translatedElements = content.match(/data-lang="[^"]+"/g) || [];
    const translatedKeys = translatedElements.map(match => 
        match.match(/data-lang="([^"]+)"/)[1]
    );
    
    window.logger?.log(`📊 已标记翻译的元素数量: ${translatedElements.length}`);
    
    // 分析缺少翻译的文本
    const missingTranslations = [];
    
    textPatterns.forEach((pattern, index) => {
        const matches = [...content.matchAll(pattern)];
        
        matches.forEach(match => {
            const fullMatch = match[0];
            const textContent = match[1].trim();
            
            // 跳过太短或明显不需要翻译的内容
            if (textContent.length < 3 || 
                /^\d+$/.test(textContent) || 
                /^[\s\-_=]+$/.test(textContent) ||
                textContent.includes('data-lang') ||
                textContent.includes('<!')) {
                return;
            }
            
            // 检查是否已有翻译标记
            if (!fullMatch.includes('data-lang=')) {
                const tagName = fullMatch.match(/<(\w+)/)[1];
                missingTranslations.push({
                    tag: tagName,
                    text: textContent.substring(0, 50) + (textContent.length > 50 ? '...' : ''),
                    fullMatch: fullMatch.substring(0, 100) + '...'
                });
            }
        });
    });
    
    // 去重并按标签分组
    const uniqueMissing = [];
    const seen = new Set();
    
    missingTranslations.forEach(item => {
        const key = `${item.tag}:${item.text}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueMissing.push(item);
        }
    });
    
    // 按标签分组显示
    const grouped = {};
    uniqueMissing.forEach(item => {
        if (!grouped[item.tag]) grouped[item.tag] = [];
        grouped[item.tag].push(item);
    });
    
    window.logger?.log(`\n❌ 发现 ${uniqueMissing.length} 个可能缺少翻译的元素:\n`);
    
    Object.keys(grouped).forEach(tag => {
        window.logger?.log(`📝 ${tag.toUpperCase()} 标签 (${grouped[tag].length} 个):`);
        grouped[tag].slice(0, 5).forEach((item, i) => {
            window.logger?.log(`   ${i + 1}. "${item.text}"`);
        });
        if (grouped[tag].length > 5) {
            window.logger?.log(`   ... 还有 ${grouped[tag].length - 5} 个`);
        }
        console.log();
    });
    
    return {
        total: uniqueMissing.length,
        byTag: grouped,
        translated: translatedKeys.length
    };
}

function analyzeAllHtmlFiles() {
    window.logger?.log('🚀 开始分析HTML翻译覆盖情况...\n');
    
    const htmlFiles = [
        './index.html',
        './about.html',
        './blog.html', 
        './privacy.html',
        './terms.html'
    ].filter(file => fs.existsSync(file));
    
    let totalMissing = 0;
    let totalTranslated = 0;
    
    htmlFiles.forEach(file => {
        const result = analyzeHtmlTranslations(file);
        totalMissing += result.total;
        totalTranslated += result.translated;
        window.logger?.log('='.repeat(60) + '\n');
    });
    
    window.logger?.log('📊 总体统计:');
    window.logger?.log(`✅ 已翻译元素: ${totalTranslated}`);
    window.logger?.log(`❌ 缺少翻译元素: ${totalMissing}`);
    window.logger?.log(`📈 翻译覆盖率: ${((totalTranslated / (totalTranslated + totalMissing)) * 100).toFixed(1)}%`);
    
    window.logger?.log('\n💡 解决方案建议:');
    window.logger?.log('1. 为缺失的HTML元素添加 data-lang 属性');
    window.logger?.log('2. 在相应的翻译文件中添加对应的翻译键值');
    window.logger?.log('3. 重新生成内联翻译文件包含更多键');
    window.logger?.log('4. 检查JavaScript动态生成的内容是否调用了翻译函数');
}

if (require.main === module) {
    analyzeAllHtmlFiles();
}

module.exports = { analyzeHtmlTranslations };