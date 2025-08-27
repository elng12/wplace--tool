/**
 * 简化版强制翻译修复脚本
 */

console.log('🛠️ [简化翻译修复] 脚本开始加载...');

// 简化的中文翻译映射
const simpleTranslations = {
    'Frequently Asked Questions': '常见问题',
    'What Users Say About Wplace Pixel Art Converter': '用户对 Wplace 像素艺术转换器的评价',
    'What Users Say About Wplace Paint Tool': '用户对 Wplace 像素艺术转换器的评价',
    'Real feedback from creators using Wplace Paint Tool': '来自创作者的真实反馈，他们使用 Wplace 像素画工具',
    'What Makes Our Wplace Image Converter Special?': '是什么让我们的 Wplace 图像转换器与众不同？',
    'Transform any image into stunning pixel art designed for Wplace': '将任何图像转换为为 Wplace 设计的惊艳像素艺术',
    'How to Use Wplace Paint Tool': '如何使用 Wplace 绘画工具',
    'Convert images to pixel art in 4 simple steps': '通过4个简单步骤将图像转换为像素艺术',
    'About Wplace Paint Tool': '关于 Wplace 绘画工具',
    'Independent Fan Site': '独立粉丝网站',
    'Everything you need to know about our Wplace Paint Tool': '关于我们 Wplace 画图工具的一切你需要知道的'
};

// 简单的强制翻译函数
function simpleForceTranslate() {
    console.log('🔄 [简化翻译修复] 开始强制翻译...');
    
    // 获取当前语言
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    console.log('🌍 [简化翻译修复] 当前语言:', currentLang);
    
    if (currentLang === 'en') {
        console.log('📝 [简化翻译修复] 英文模式，跳过翻译');
        return;
    }
    
    let count = 0;
    
    // 方法1: 替换所有包含目标文本的元素
    Object.keys(simpleTranslations).forEach(englishText => {
        const chineseText = simpleTranslations[englishText];
        
        // 查找所有包含英文文本的元素
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            // 检查文本内容
            if (element.textContent && element.textContent.trim() === englishText) {
                element.textContent = chineseText;
                count++;
                console.log(`✅ [简化翻译修复] 替换: "${englishText}" → "${chineseText}"`);
            }
            
            // 检查innerHTML中的文本
            if (element.innerHTML && element.innerHTML.includes(englishText)) {
                element.innerHTML = element.innerHTML.replace(new RegExp(englishText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), chineseText);
                count++;
                console.log(`✅ [简化翻译修复] HTML替换: "${englishText}" → "${chineseText}"`);
            }
        });
    });
    
    console.log(`🎉 [简化翻译修复] 完成，共替换 ${count} 处文本`);
}

// 等待页面加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 [简化翻译修复] DOM加载完成');
        setTimeout(simpleForceTranslate, 3000);
    });
} else {
    console.log('📄 [简化翻译修复] DOM已就绪');
    setTimeout(simpleForceTranslate, 2000);
}

// 监听语言切换
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'languageSelector') {
        const newLang = e.target.value;
        console.log('🌍 [简化翻译修复] 语言切换到:', newLang);
        
        // 立即更新localStorage中的语言设置
        localStorage.setItem('preferredLanguage', newLang);
        
        setTimeout(simpleForceTranslate, 1000);
    }
});

// 导出全局函数
window.simpleForceTranslate = simpleForceTranslate;
window.forceTranslateText = simpleForceTranslate; // 兼容原接口

console.log('✅ [简化翻译修复] 脚本加载完成');