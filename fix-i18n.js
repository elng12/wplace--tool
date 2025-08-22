/**
 * 修复多语言系统的脚本
 * 在控制台运行此脚本来诊断和修复多语言问题
 */

(function() {
    console.log('🔧 开始诊断多语言系统...\n');
    
    // 1. 检查当前状态
    console.log('📊 当前状态:');
    const savedLang = localStorage.getItem('wplace-language');
    console.log(`  - LocalStorage 中保存的语言: ${savedLang || '无'}`);
    
    if (window.i18n) {
        console.log(`  - i18n 当前语言: ${window.i18n.currentLang}`);
        console.log(`  - 已加载的翻译: ${Object.keys(window.i18n.translations).join(', ')}`);
    } else {
        console.error('  ❌ i18n 对象未找到！');
    }
    
    // 2. 检查DOM中的data-lang元素
    const dataLangElements = document.querySelectorAll('[data-lang]');
    console.log(`\n📝 找到 ${dataLangElements.length} 个需要翻译的元素`);
    
    // 检查前5个元素的状态
    console.log('  前5个元素的状态:');
    for (let i = 0; i < Math.min(5, dataLangElements.length); i++) {
        const elem = dataLangElements[i];
        const key = elem.getAttribute('data-lang');
        const currentText = elem.textContent.trim();
        console.log(`    [${i+1}] key="${key}", text="${currentText.substring(0, 30)}..."`);
    }
    
    // 3. 检查支持的语言
    console.log('\n🌐 支持的语言:');
    if (window.i18n && window.i18n.translations) {
        const langs = Object.keys(window.i18n.translations);
        langs.forEach(lang => {
            const keysCount = Object.keys(window.i18n.translations[lang]).length;
            console.log(`  - ${lang}: ${keysCount} 个翻译键`);
        });
    }
    
    // 4. 检查无效的语言设置
    console.log('\n⚠️ 检查问题:');
    if (savedLang && window.i18n && !window.i18n.translations[savedLang]) {
        console.error(`  ❌ LocalStorage 中保存了不支持的语言: ${savedLang}`);
        console.log('  🔧 建议: 运行 fixLanguage() 来修复');
    }
    
    // 5. 提供修复函数
    window.fixLanguage = function() {
        console.log('\n🔧 执行修复...');
        
        // 清除无效的语言设置
        const saved = localStorage.getItem('wplace-language');
        if (saved && window.i18n && !window.i18n.translations[saved]) {
            console.log(`  - 清除无效语言设置: ${saved}`);
            localStorage.removeItem('wplace-language');
        }
        
        // 重置为英文
        if (window.i18n) {
            console.log('  - 重置为英文');
            window.i18n.currentLang = 'en';
            window.i18n.updateDOM();
            window.i18n.saveLanguage();
            console.log('  ✅ 修复完成！页面已更新为英文');
        }
    };
    
    // 6. 提供测试函数
    window.testI18n = async function(lang) {
        console.log(`\n🧪 测试语言: ${lang}`);
        if (window.i18n) {
            await window.i18n.loadLanguage(lang);
            console.log(`  ✅ 已切换到: ${window.i18n.currentLang}`);
        }
    };
    
    console.log('\n💡 提示:');
    console.log('  - 运行 fixLanguage() 来修复语言问题');
    console.log('  - 运行 testI18n("zh") 来测试中文');
    console.log('  - 运行 testI18n("en") 来测试英文');
    
})();