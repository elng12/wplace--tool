const fs = require('fs');

// 读取翻译文件
const en = JSON.parse(fs.readFileSync('./lang/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('./lang/zh.json', 'utf8'));

const enKeys = new Set(Object.keys(en));
const extraInZh = Object.keys(zh).filter(key => !enKeys.has(key));

console.log('🔍 分析多余键值的用途:');
console.log('多余键值数量:', extraInZh.length);

// 按用途分类
const seoKeys = extraInZh.filter(k => k === 'title' || k === 'subtitle');
const uiKeys = extraInZh.filter(k => k.includes('hero.wplace') || k.includes('upload.label') || k.includes('pixel.slider'));
const shareKeys = extraInZh.filter(k => k.startsWith('share.'));
const gridKeys = extraInZh.filter(k => k.startsWith('grid.'));
const testimonialKeys = extraInZh.filter(k => k.startsWith('testimonials.'));
const aboutKeys = extraInZh.filter(k => k.startsWith('about.') || k.startsWith('blog.') || k.startsWith('footer.'));

console.log('');
console.log('📊 分类统计:');
console.log('SEO相关 (' + seoKeys.length + '):', seoKeys);
console.log('UI扩展 (' + uiKeys.length + '):', uiKeys);
console.log('分享功能 (' + shareKeys.length + '):', shareKeys);
console.log('网格信息 (' + gridKeys.length + '):', gridKeys);  
console.log('证言内容 (' + testimonialKeys.length + '):', testimonialKeys.length > 3 ? testimonialKeys.slice(0,3).concat(['...']) : testimonialKeys);
console.log('页面内容 (' + aboutKeys.length + '):', aboutKeys.length > 3 ? aboutKeys.slice(0,3).concat(['...']) : aboutKeys);

// 建议保留的键值
const shouldKeep = [...seoKeys, ...gridKeys.filter(k => ['grid.horizontal', 'grid.vertical', 'grid.total'].includes(k))];
console.log('');
console.log('🎯 建议保留的键值:', shouldKeep);