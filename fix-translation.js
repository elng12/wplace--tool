/**
 * 紧急翻译修复脚本
 * 强制替换未翻译的文本，确保中文显示正确
 */

// 当前选择的语言（默认从localStorage获取）
let currentLanguage = localStorage.getItem('preferredLanguage') || 'zh';

// 完整的翻译映射
const forceTranslations = {
    'zh': {
        // FAQ部分
        'Frequently Asked Questions': '常见问题',
        'Everything you need to know about our Wplace Paint Tool': '关于我们 Wplace 画图工具的一切你需要知道的',
        
        // 用户评价部分
        'What Users Say About Wplace Pixel Art Converter': '用户对 Wplace 像素艺术转换器的评价',
        'What Users Say About Wplace Paint Tool': '用户对 Wplace 像素艺术转换器的评价',
        'Real feedback from creators using Wplace Paint Tool': '来自创作者的真实反馈，他们使用 Wplace 像素画工具',
        
        // 功能特性部分  
        'What Makes Our Wplace Image Converter Special?': '是什么让我们的 Wplace 图像转换器与众不同？',
        'Transform any image into stunning pixel art designed for Wplace': '将任何图像转换为为 Wplace 设计的惊艳像素艺术',
        
        // 使用指南部分
        'How to Use Wplace Paint Tool': '如何使用 Wplace 绘画工具',
        'Convert images to pixel art in 4 simple steps': '通过4个简单步骤将图像转换为像素艺术',
        
        // 步骤标题
        'Upload Your Image': '上传您的图片',
        'Adjust Pixel Size': '调整像素大小',
        'Convert to Pixel Art': '转换为像素艺术',
        'Download Your Creation': '下载您的作品',
        
        // Footer部分
        'About Wplace Paint Tool': '关于 Wplace 绘画工具',
        'Independent Fan Site': '独立粉丝网站',
        'This website is an independent, fan-run project built to serve the community\'s pixel art needs.': '本网站是一个独立的粉丝项目，旨在满足社区像素艺术需求。',
        
        // 功能特性标题
        'Completely Free Tool': '完全免费的工具',
        'Privacy Protected': '隐私保护',
        'Effortless Conversion': '轻松转换',
        'Any Size Welcome': '支持任何尺寸',
        
        // 统计数据
        'Images converted with our wplace tool': '使用我们的工具转换的图片数量',
        'Active users of the wplace tool': '活跃用户数',
        'Satisfaction rate with our wplace tool': '满意度',
        
        // 用户名和角色（常见的）
        'Alex_Pixels': '像素亚历克斯',
        'Maya_Artist': '艺术家玛雅',
        'RocketBuilder': '火箭建造者',
        'PixelSarah': '像素莎拉',
        'DigitalDave': '数字戴夫',
        'Luna_Creative': '创意露娜',
        
        'Wplace Veteran Player': 'Wplace 老玩家',
        'Digital Art Enthusiast': '数字艺术爱好者',
        'Community Leader': '社区领袖',
        'Creative Designer': '创意设计师',
        'Wplace Strategist': 'Wplace 策略师',
        'Art Community Moderator': '艺术社区管理员'
    }
};

function forceTranslateText() {
    if (currentLanguage === 'en') return; // 如果是英文就不需要强制翻译
    
    const translations = forceTranslations[currentLanguage];
    if (!translations) return;
    
    console.log('🔧 [Fix-Translation] 开始强制翻译，目标语言:', currentLanguage);
    
    let replacementCount = 0;
    
    // 遍历所有文本节点并替换
    function replaceTextInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent.trim();
            if (text && translations[text]) {
                node.textContent = translations[text];
                replacementCount++;
                console.log(`🔄 [Fix-Translation] 替换: "${text}" → "${translations[text]}"`);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 检查innerHTML中的文本（处理部分内容在innerHTML中的情况）
            let innerHTML = node.innerHTML;
            let modified = false;
            
            Object.keys(translations).forEach(englishText => {
                const regex = new RegExp(englishText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                if (regex.test(innerHTML)) {
                    innerHTML = innerHTML.replace(regex, translations[englishText]);
                    modified = true;
                    replacementCount++;
                    console.log(`🔄 [Fix-Translation] HTML替换: "${englishText}" → "${translations[englishText]}"`);
                }
            });
            
            if (modified) {
                node.innerHTML = innerHTML;
                return; // 不继续递归，避免重复处理
            }
            
            // 递归处理子节点
            for (let child of node.childNodes) {
                replaceTextInNode(child);
            }
        }
    }
    
    // 从body开始替换
    replaceTextInNode(document.body);
    
    console.log(`✅ [Fix-Translation] 强制翻译完成，共替换 ${replacementCount} 处文本`);
}

// 监听语言变化
function setupLanguageMonitoring() {
    // 监听语言选择器变化
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            currentLanguage = this.value;
            console.log('🌍 [Fix-Translation] 语言已切换到:', currentLanguage);
            
            // 延迟执行强制翻译，等待i18n系统完成
            setTimeout(() => {
                forceTranslateText();
            }, 500);
        });
    }
    
    // 监听localStorage变化
    window.addEventListener('storage', function(e) {
        if (e.key === 'preferredLanguage') {
            currentLanguage = e.newValue || 'zh';
            console.log('📦 [Fix-Translation] 检测到语言偏好变化:', currentLanguage);
            setTimeout(() => {
                forceTranslateText();
            }, 500);
        }
    });
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [Fix-Translation] 初始化强制翻译系统...');
    
    // 设置语言监听
    setupLanguageMonitoring();
    
    // 等待一段时间后执行初始翻译（给i18n系统时间）
    setTimeout(() => {
        console.log('⏰ [Fix-Translation] 执行初始强制翻译检查...');
        forceTranslateText();
    }, 2000);
    
    // 也在页面完全加载后再检查一次
    window.addEventListener('load', function() {
        setTimeout(() => {
            console.log('🔄 [Fix-Translation] 页面加载完成后的强制翻译检查...');
            forceTranslateText();
        }, 1000);
    });
});

// 提供全局方法供手动调用
window.forceTranslateText = forceTranslateText;
window.setForceLanguage = function(lang) {
    currentLanguage = lang;
    forceTranslateText();
};

console.log('🛠️ [Fix-Translation] 强制翻译脚本已加载');