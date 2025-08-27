/**
 * 暴力翻译修复脚本 - 最后的解决方案
 * 直接强制替换所有可能的英文硬编码文本
 */

console.log('💪 暴力翻译修复脚本启动...');

// 超级完整的中英文映射表
const brutalTranslations = {
    // 主标题 - 确保所有变体都被覆盖
    'What Users Say About Wplace Paint Tool': '用户对 Wplace 绘画工具的评价',
    'What Users Say About Wplace Pixel Art Converter': '用户对 Wplace 像素艺术转换器的评价',
    'Frequently Asked Questions': '常见问题',
    'What Makes Our Wplace Image Converter Special?': '是什么让我们的 Wplace 图像转换器与众不同？',
    'How to Use Wplace Paint Tool': '如何使用 Wplace 绘画工具',
    'About Wplace Paint Tool': '关于 Wplace 绘画工具',
    
    // 副标题
    'Real feedback from creators using Wplace Paint Tool': '来自创作者的真实反馈，他们使用 Wplace 绘画工具',
    'Everything you need to know about our Wplace Paint Tool': '关于我们 Wplace 绘画工具的一切你需要知道的',
    'Transform any image into stunning pixel art designed for Wplace': '将任何图像转换为为 Wplace 设计的惊艳像素艺术',
    'Convert images to pixel art in 4 simple steps': '通过4个简单步骤将图像转换为像素艺术',
    
    // 功能特性标题
    'Completely Free Tool': '完全免费的工具',
    'Privacy Protected': '隐私保护',
    'Effortless Conversion': '轻松转换',
    'Any Size Welcome': '支持任何尺寸',
    
    // 页脚内容
    'Independent Fan Site': '独立粉丝网站',
    
    // 使用指南步骤
    'Upload Your Image': '上传您的图片',
    'Adjust Pixel Size': '调整像素大小',
    'Convert to Pixel Art': '转换为像素艺术',
    'Download Your Creation': '下载您的作品',
    
    // 用户证言（用户名）
    'Alex_Pixels': '像素亚历克斯',
    'Maya_Artist': '艺术家玛雅',
    'RocketBuilder': '火箭建造者',
    'PixelSarah': '像素莎拉',
    'DigitalDave': '数字戴夫',
    'Luna_Creative': '创意露娜',
    
    // 用户角色
    'Wplace Veteran Player': 'Wplace 老玩家',
    'Digital Art Enthusiast': '数字艺术爱好者',
    'Community Leader': '社区领袖',
    'Creative Designer': '创意设计师',
    'Wplace Strategist': 'Wplace 策略师',
    'Art Community Moderator': '艺术社区管理员',
    
    // 统计数据
    'Images converted with our wplace tool': '使用我们工具转换的图片',
    'Active users of the wplace tool': '工具活跃用户',
    'Satisfaction rate with our wplace tool': '工具满意度',
    
    // 可能的长文本
    'This Wplace Tool has completely transformed how I approach pixel art on the platform.': '这个 Wplace 工具完全改变了我在平台上处理像素艺术的方式。',
    'I\'ve tried many pixel art converters, but this Wplace Tool is by far the most accurate and user-friendly.': '我试过很多像素艺术转换器，但这个 Wplace 工具是迄今为止最准确和用户友好的。',
    'Our entire team relies on this Wplace Tool for coordinating large-scale community art projects.': '我们的整个团队都依靠这个 Wplace 工具来协调大型社区艺术项目。',
    
    // 一些可能被遗漏的文本
    'What Players Say': '玩家评价',
    'User Reviews': '用户评价',
    'Testimonials': '用户证言',
    'FAQ': '常见问题',
    'Help': '帮助',
    'Support': '支持'
};

// 暴力替换函数 - 禁用以避免DOM污染
function brutalReplace() {
    console.log('🔥 暴力替换已禁用 - 使用正常i18n系统');
    
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    if (currentLang === 'en') {
        console.log('📝 英文模式，跳过暴力替换');
        return;
    }
    
    console.log('⚠️ 暴力替换已禁用，依赖正常翻译系统');
    return 0; // 直接返回，不执行任何替换
    
    let totalReplacements = 0;
    
    // 方法1: 递归遍历所有文本节点
    function replaceTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let originalText = text;
            
            Object.keys(brutalTranslations).forEach(english => {
                const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                text = text.replace(regex, brutalTranslations[english]);
            });
            
            if (text !== originalText) {
                node.textContent = text;
                totalReplacements++;
                console.log(`🔄 文本节点替换: "${originalText.trim()}" → "${text.trim()}"`);
            }
        } else {
            for (let child of node.childNodes) {
                replaceTextNodes(child);
            }
        }
    }
    
    // 方法2: 直接替换元素的textContent
    function replaceElementText() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
            
            if (element.children.length === 0 && element.textContent.trim()) {
                const originalText = element.textContent.trim();
                if (brutalTranslations[originalText]) {
                    element.textContent = brutalTranslations[originalText];
                    totalReplacements++;
                    console.log(`✅ 元素替换: "${originalText}" → "${brutalTranslations[originalText]}"`);
                }
            }
        });
    }
    
    // 方法3: 针对data-lang属性的元素进行特殊处理
    function replaceDataLangElements() {
        const dataLangElements = document.querySelectorAll('[data-lang]');
        dataLangElements.forEach(element => {
            const originalText = element.textContent.trim();
            if (brutalTranslations[originalText]) {
                element.textContent = brutalTranslations[originalText];
                totalReplacements++;
                console.log(`🎯 data-lang替换: "${originalText}" → "${brutalTranslations[originalText]}"`);
            }
        });
    }
    
    // 方法4: innerHTML 替换（最后的手段）
    function replaceInHTML() {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
        elements.forEach(element => {
            let html = element.innerHTML;
            let originalHtml = html;
            
            Object.keys(brutalTranslations).forEach(english => {
                const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                html = html.replace(regex, brutalTranslations[english]);
            });
            
            if (html !== originalHtml) {
                element.innerHTML = html;
                totalReplacements++;
                console.log(`🔧 HTML替换在元素: ${element.tagName}`);
            }
        });
    }
    
    // 按顺序执行所有替换方法
    replaceTextNodes(document.body);
    replaceElementText();
    replaceDataLangElements();
    replaceInHTML();
    
    console.log(`💥 暴力替换完成！总共替换了 ${totalReplacements} 处文本`);
    return totalReplacements;
}

// 立即执行一次
setTimeout(() => {
    console.log('⏰ 3秒后自动执行暴力替换...');
    brutalReplace();
}, 3000);

// 监听语言切换
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'languageSelector') {
        const lang = e.target.value;
        console.log(`🌍 语言切换到 ${lang}，准备暴力替换...`);
        
        if (lang === 'zh') {
            setTimeout(() => {
                console.log('🇨🇳 执行中文暴力替换...');
                brutalReplace();
            }, 2000);
        }
    }
});

// 页面完全加载后再执行一次（仅限中文用户）
window.addEventListener('load', function() {
    setTimeout(() => {
        const currentLang = localStorage.getItem('preferredLanguage');
        if (currentLang === 'zh') {
            console.log('🔄 页面加载完成，执行中文用户的暴力替换...');
            brutalReplace();
        } else {
            console.log('🔄 页面加载完成，非中文用户跳过暴力替换...');
        }
    }, 5000);
});

// 导出全局函数供手动调用
window.brutalReplace = brutalReplace;

console.log('💪 暴力翻译修复脚本就绪！');