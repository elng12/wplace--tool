const fs = require('fs');
const path = require('path');

// 读取更新后的英文基准文件
const en = JSON.parse(fs.readFileSync('./lang/en.json', 'utf8'));
const enKeys = new Set(Object.keys(en));

window.logger?.log('📊 英文基准文件键值数:', enKeys.size);

// 需要清理的语言文件
const langFiles = ['de.json', 'es.json', 'fr.json', 'gn.json', 'ja.json', 'ko.json', 'mi.json', 'pt.json', 'tr.json', 'zh.json'];

langFiles.forEach(filename => {
    const filePath = `./lang/${filename}`;
    if (fs.existsSync(filePath)) {
        const originalData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const originalKeys = Object.keys(originalData);
        
        // 只保留英文基准文件中存在的键值
        const cleanedData = {};
        Object.keys(originalData).forEach(key => {
            if (enKeys.has(key)) {
                cleanedData[key] = originalData[key];
            }
        });
        
        // 按键名排序
        const sortedData = {};
        Object.keys(cleanedData).sort().forEach(key => {
            sortedData[key] = cleanedData[key];
        });
        
        // 保存清理后的文件
        fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2) + '\n');
        
        const removedCount = originalKeys.length - Object.keys(cleanedData).length;
        window.logger?.log(`✅ ${filename}: 清理完成 (移除 ${removedCount} 个多余键值, 保留 ${Object.keys(cleanedData);.length} 个)`);
    }
});

window.logger?.log('\n🎯 翻译文件清理完成！');