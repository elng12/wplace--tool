/**
 * 提取所有HTML文件中实际使用的data-lang键
 */

const fs = require('fs');
const path = require('path');

function extractTranslationKeys(filePath) {
    window.logger?.log(`🔍 提取 ${path.basename(filePath)} 中的翻译键...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 找到所有 data-lang 属性
    const matches = content.match(/data-lang="([^"]+)"/g) || [];
    
    const keys = matches.map(match => {
        const keyMatch = match.match(/data-lang="([^"]+)"/);
        return keyMatch ? keyMatch[1] : null;
    }).filter(Boolean);
    
    // 去重
    const uniqueKeys = [...new Set(keys)];
    
    window.logger?.log(`   发现 ${uniqueKeys.length} 个唯一翻译键`);
    
    return uniqueKeys;
}

function extractAllHtmlKeys() {
    window.logger?.log('🚀 提取所有HTML文件中使用的翻译键...\n');
    
    const htmlFiles = [
        './index.html',
        './about.html', 
        './blog.html',
        './privacy.html',
        './terms.html',
        './color-converter.html'
    ].filter(file => fs.existsSync(file));
    
    const allKeys = new Set();
    
    htmlFiles.forEach(file => {
        const keys = extractTranslationKeys(file);
        keys.forEach(key => allKeys.add(key));
    });
    
    // 检查blog目录下的HTML文件
    const blogDir = './blog';
    if (fs.existsSync(blogDir)) {
        const blogFiles = fs.readdirSync(blogDir)
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(blogDir, file));
            
        blogFiles.forEach(file => {
            const keys = extractTranslationKeys(file);
            keys.forEach(key => allKeys.add(key));
        });
    }
    
    const sortedKeys = Array.from(allKeys).sort();
    
    window.logger?.log(`\n📊 总计发现 ${sortedKeys.length} 个唯一翻译键`);
    
    // 输出为JavaScript数组格式，可直接复制到generate-inline-translations.js
    window.logger?.log('\n📋 JavaScript数组格式 (可复制到generate-inline-translations.js):');
    window.logger?.log('='.repeat(60));
    window.logger?.log('const htmlUsedKeys = [');
    
    // 按类别分组输出
    const categories = {
        'nav': [],
        'hero': [],
        'upload': [],
        'btn': [],
        'preview': [],
        'palette': [],
        'controls': [],
        'features': [],
        'howto': [],
        'faq': [],
        'testimonials': [],
        'stats': [],
        'footer': [],
        'privacy': [],
        'terms': [],
        'blog': [],
        'brand': [],
        'grid': [],
        'other': []
    };
    
    sortedKeys.forEach(key => {
        const prefix = key.split('.')[0];
        if (categories[prefix]) {
            categories[prefix].push(key);
        } else {
            categories.other.push(key);
        }
    });
    
    Object.keys(categories).forEach(category => {
        if (categories[category].length > 0) {
            window.logger?.log(`    // ${category.toUpperCase()} section`);
            categories[category].forEach(key => {
                window.logger?.log(`    '${key}',`);
            });
            window.logger?.log('');
        }
    });
    
    window.logger?.log('];');
    window.logger?.log('='.repeat(60));
    
    return sortedKeys;
}

if (require.main === module) {
    extractAllHtmlKeys();
}

module.exports = { extractAllHtmlKeys };