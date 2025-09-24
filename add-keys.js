const fs = require('fs');

// 读取英文翻译文件
const en = JSON.parse(fs.readFileSync('./lang/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('./lang/zh.json', 'utf8'));

// 需要添加到英文文件的键值（仅限实际使用的）
const keysToAdd = {
  // SEO相关 - 可能用于动态更新页面标题
  "title": "Wplace Paint Tool & Color Converter - Ultimate Pixel Art Toolkit for Wplace Players",
  "subtitle": "Easily create pixel art for Wplace with the Wplace Paint Tool! Our pixel art maker and converter transform any image into a Wplace-compatible pixel grid. The built-in generator automatically matches the official color palette, ensuring perfect results every time.",
  
  // Grid信息显示 - HTML中确实使用
  "grid.horizontal": "H",
  "grid.vertical": "V", 
  "grid.total": "Total"
};

// 添加键值到英文文件
Object.entries(keysToAdd).forEach(([key, value]) => {
  en[key] = value;
});

// 按键名排序
const sortedEn = {};
Object.keys(en).sort().forEach(key => {
  sortedEn[key] = en[key];
});

// 保存更新后的英文文件
fs.writeFileSync('./lang/en.json', JSON.stringify(sortedEn, null, 2) + '\n');

window.logger?.log('✅ 英文基准文件已更新');
window.logger?.log('📊 添加的键值数:', Object.keys(keysToAdd).length);
window.logger?.log('📊 新的总键值数:', Object.keys(sortedEn).length);