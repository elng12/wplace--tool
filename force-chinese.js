/**
 * 专门用于中文的强制翻译脚本
 */

console.log('🇨🇳 中文强制翻译系统加载中...');

// 中文翻译映射（更完整）
const chineseTranslations = {
    // 主要标题
    'What Users Say About Wplace Pixel Art Converter': '用户对 Wplace 像素艺术转换器的评价',
    'What Users Say About Wplace Paint Tool': '用户对 Wplace 像素艺术转换器的评价',
    'Frequently Asked Questions': '常见问题',
    'What Makes Our Wplace Image Converter Special?': '是什么让我们的 Wplace 图像转换器与众不同？',
    'How to Use Wplace Paint Tool': '如何使用 Wplace 绘画工具',
    'About Wplace Paint Tool': '关于 Wplace 绘画工具',
    
    // 副标题和描述
    'Real feedback from creators using Wplace Paint Tool': '来自创作者的真实反馈，他们使用 Wplace 像素画工具',
    'Everything you need to know about our Wplace Paint Tool': '关于我们 Wplace 画图工具的一切你需要知道的',
    'Transform any image into stunning pixel art designed for Wplace': '将任何图像转换为为 Wplace 设计的惊艳像素艺术',
    'Convert images to pixel art in 4 simple steps': '通过4个简单步骤将图像转换为像素艺术',
    
    // 功能特性
    'Completely Free Tool': '完全免费的工具',
    'Privacy Protected': '隐私保护',
    'Effortless Conversion': '轻松转换',
    'Any Size Welcome': '支持任何尺寸',
    
    // Footer
    'Independent Fan Site': '独立粉丝网站',
    
    // 步骤标题
    'Upload Your Image': '上传您的图片',
    'Adjust Pixel Size': '调整像素大小',
    'Convert to Pixel Art': '转换为像素艺术',
    'Download Your Creation': '下载您的作品',
    
    // 统计数据
    'Images converted with our wplace tool': '使用我们工具转换的图片',
    'Active users of the wplace tool': '工具活跃用户',
    'Satisfaction rate with our wplace tool': '工具满意度'
};

function forceChineseTranslation() {
    console.log('🔄 开始强制中文翻译...');
    
    let replacementCount = 0;
    
    // 遍历所有元素
    const allElements = document.getElementsByTagName('*');
    
    for (let element of allElements) {
        // 跳过script和style元素
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
            continue;
        }
        
        // 检查并替换textContent
        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
            const text = element.textContent.trim();
            if (chineseTranslations[text]) {
                element.textContent = chineseTranslations[text];
                replacementCount++;
                console.log(`✅ 文本替换: "${text}" → "${chineseTranslations[text]}"`);
            }
        }
        
        // 检查data-lang属性的回退文本
        if (element.hasAttribute('data-lang')) {
            const text = element.textContent.trim();
            if (chineseTranslations[text]) {
                element.textContent = chineseTranslations[text];
                replacementCount++;
                console.log(`✅ data-lang回退替换: "${text}" → "${chineseTranslations[text]}"`);
            }
        }
    }
    
    console.log(`🎉 中文强制翻译完成，共替换 ${replacementCount} 处文本`);
    return replacementCount;
}

// 智能触发函数
function smartChineseTranslation() {
    const currentLang = localStorage.getItem('preferredLanguage');
    
    // 只有在用户明确选择了中文时才进行强制翻译
    if (currentLang === 'zh') {
        console.log('🇨🇳 检测到用户选择中文模式，执行强制翻译');
        return forceChineseTranslation();
    } else {
        console.log('🌍 用户未选择中文模式，跳过强制翻译');
        return 0;
    }
}

// 页面加载后自动执行
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('⏰ 自动执行中文强制翻译检查...');
        smartChineseTranslation();
    }, 3000);
});

// 监听语言切换
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'languageSelector') {
        const selectedLang = e.target.value;
        console.log('🌍 语言选择器变化:', selectedLang);
        
        if (selectedLang === 'zh') {
            setTimeout(() => {
                console.log('🇨🇳 切换到中文，执行强制翻译...');
                forceChineseTranslation();
            }, 1500);
        }
    }
});

// 导出全局函数
window.forceChineseTranslation = forceChineseTranslation;
window.smartChineseTranslation = smartChineseTranslation;

console.log('✅ 中文强制翻译系统就绪');