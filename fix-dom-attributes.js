/**
 * DOM属性修复脚本
 * 修复data-lang属性（brutal-translate.js已删除）
 */

console.log('🔧 DOM属性修复脚本启动...');

// 中英文键名映射表
const keyMapping = {
  // FAQ 相关
  '常见问题.title': 'faq.title',
  '常见问题.subtitle': 'faq.subtitle',
  '常见问题.q1': 'faq.q1',
  '常见问题.q2': 'faq.q2',
  '常见问题.q3': 'faq.q3',
  '常见问题.q4': 'faq.q4',
  '常见问题.q5': 'faq.q5',
  '常见问题.q6': 'faq.q6',
  '常见问题.a1': 'faq.a1',
  '常见问题.a2': 'faq.a2',
  '常见问题.a3': 'faq.a3',
  '常见问题.a4': 'faq.a4',
  '常见问题.a5': 'faq.a5',
  '常见问题.a6': 'faq.a6',
  
  // 证言相关
  '用户证言.title': 'testimonials.title',
  '用户证言.subtitle': 'testimonials.subtitle',
  '用户证言.user1.name': 'testimonials.user1.name',
  '用户证言.user1.role': 'testimonials.user1.role',
  '用户证言.user1.quote': 'testimonials.user1.quote',
  '用户证言.user2.name': 'testimonials.user2.name',
  '用户证言.user2.role': 'testimonials.user2.role',
  '用户证言.user2.quote': 'testimonials.user2.quote',
  '用户证言.user3.name': 'testimonials.user3.name',
  '用户证言.user3.role': 'testimonials.user3.role',
  '用户证言.user3.quote': 'testimonials.user3.quote',
  '用户证言.user4.name': 'testimonials.user4.name',
  '用户证言.user4.role': 'testimonials.user4.role',
  '用户证言.user4.quote': 'testimonials.user4.quote',
  
  // 其他可能被污染的键
  '功能特性.title': 'features.special.title',
  '使用方法.title': 'howto.title'
};

function fixDOMAttributes() {
  console.log('🔧 开始修复DOM属性...');
  
  let fixedCount = 0;
  
  // 查找所有带有data-lang属性的元素
  const elements = document.querySelectorAll('[data-lang]');
  
  elements.forEach(element => {
    const currentDataLang = element.getAttribute('data-lang');
    
    // 检查是否需要修复
    if (keyMapping[currentDataLang]) {
      const correctKey = keyMapping[currentDataLang];
      element.setAttribute('data-lang', correctKey);
      fixedCount++;
      console.log(`✅ 修复属性: "${currentDataLang}" → "${correctKey}"`);
    }
  });
  
  console.log(`🎉 DOM属性修复完成！共修复 ${fixedCount} 个属性`);
  return fixedCount;
}

// 页面加载完成后自动执行修复
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixDOMAttributes);
} else {
  setTimeout(fixDOMAttributes, 1000);
}

// 导出函数供手动调用
window.fixDOMAttributes = fixDOMAttributes;

console.log('✅ DOM属性修复脚本就绪');