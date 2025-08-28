/**
 * 快速修复缺失翻译键的脚本
 */

const fs = require('fs');
const path = require('path');

const langDir = './lang';
const missingKeys = {
  'grid.horizontal': {
    'de': 'H',
    'es': 'H', 
    'fr': 'H',
    'gn': 'H',
    'ja': 'H',
    'ko': 'H',
    'mi': 'H',
    'pt': 'H',
    'tr': 'H'
  },
  'grid.vertical': {
    'de': 'V',
    'es': 'V',
    'fr': 'V', 
    'gn': 'V',
    'ja': 'V',
    'ko': 'V',
    'mi': 'V',
    'pt': 'V',
    'tr': 'V'
  },
  'grid.total': {
    'de': 'Gesamt',
    'es': 'Total',
    'fr': 'Total',
    'gn': 'Opaite',
    'ja': '合計',
    'ko': '총합',
    'mi': 'Katoa',
    'pt': 'Total',
    'tr': 'Toplam'
  }
};

function addMissingKeys() {
  console.log('🔧 修复缺失的翻译键...\n');
  
  const languages = ['de', 'es', 'fr', 'gn', 'ja', 'ko', 'mi', 'pt', 'tr'];
  
  languages.forEach(lang => {
    const filePath = path.join(langDir, `${lang}.json`);
    
    try {
      console.log(`📝 修复 ${lang}.json...`);
      
      // 读取现有数据
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 添加缺失的键
      let addedCount = 0;
      Object.keys(missingKeys).forEach(key => {
        if (!data[key]) {
          data[key] = missingKeys[key][lang];
          addedCount++;
        }
      });
      
      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`   ✅ 添加了 ${addedCount} 个键`);
      
    } catch (error) {
      console.error(`   ❌ 处理 ${lang}.json 时出错:`, error.message);
    }
  });
  
  console.log('\n🎉 修复完成！');
}

addMissingKeys();