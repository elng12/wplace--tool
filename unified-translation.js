/**
 * 统一翻译系统 - 替代多个分散的翻译脚本
 * 整合了DOM修复、强制翻译、语言检测等功能
 */

console.log('🚀 统一翻译系统启动...');

class UnifiedTranslationSystem {
  constructor() {
    this.initialized = false;
    this.domFixMapping = {
      // DOM属性修复映射
      '常见问题.title': 'faq.title',
      '常见问题.subtitle': 'faq.subtitle',
      '用户证言.title': 'testimonials.title',
      '用户证言.subtitle': 'testimonials.subtitle',
      '功能特性.title': 'features.special.title',
      '使用方法.title': 'howto.title'
    };
    
    this.emergencyTranslations = {
      // 紧急翻译 - 仅在正常系统失效时使用
      'Frequently Asked Questions': '常见问题',
      'What Users Say About Wplace Paint Tool': '用户对 Wplace 绘画工具的评价',
      'Independent Fan Site': '独立粉丝网站'
    };
  }

  async init() {
    if (this.initialized) return;
    
    console.log('🔧 初始化统一翻译系统...');
    
    // 1. DOM属性修复
    this.fixDOMAttributes();
    
    // 2. 等待主翻译系统加载
    await this.waitForMainI18n();
    
    // 3. 检查并补充缺失翻译
    this.checkAndFillGaps();
    
    this.initialized = true;
    console.log('✅ 统一翻译系统初始化完成');
  }

  fixDOMAttributes() {
    console.log('🔧 修复DOM属性...');
    
    let fixedCount = 0;
    const elements = document.querySelectorAll('[data-lang]');
    
    elements.forEach(element => {
      const currentDataLang = element.getAttribute('data-lang');
      
      if (this.domFixMapping[currentDataLang]) {
        const correctKey = this.domFixMapping[currentDataLang];
        element.setAttribute('data-lang', correctKey);
        fixedCount++;
        console.log(`✅ 修复属性: "${currentDataLang}" → "${correctKey}"`);
      }
    });
    
    console.log(`🎉 DOM属性修复完成！共修复 ${fixedCount} 个属性`);
  }

  async waitForMainI18n(maxWait = 5000) {
    console.log('⏳ 等待主翻译系统...');
    
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      if (window.i18n && window.i18n.translate) {
        console.log('✅ 主翻译系统已就绪');
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('⚠️ 主翻译系统超时，启用紧急模式');
    return false;
  }

  checkAndFillGaps() {
    console.log('🔍 检查翻译缺口...');
    
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    if (currentLang === 'en') {
      console.log('📝 英文模式，跳过缺口填充');
      return;
    }

    let filledCount = 0;
    
    // 检查关键元素是否正确翻译
    const criticalElements = document.querySelectorAll('[data-lang="faq.title"], [data-lang="testimonials.title"], [data-lang="features.special.title"]');
    
    criticalElements.forEach(element => {
      const text = element.textContent.trim();
      const dataLang = element.getAttribute('data-lang');
      
      // 如果显示的是英文但当前不是英文模式，尝试修复
      if (this.emergencyTranslations[text] && currentLang !== 'en') {
        element.textContent = this.emergencyTranslations[text];
        filledCount++;
        console.log(`🚑 紧急翻译: "${text}" → "${this.emergencyTranslations[text]}"`);
      }
    });

    if (filledCount > 0) {
      console.log(`🎯 填充了 ${filledCount} 个翻译缺口`);
    } else {
      console.log('✅ 未发现翻译缺口');
    }
  }

  // 语言切换监听
  onLanguageChange(newLang) {
    console.log(`🌍 语言切换到: ${newLang}`);
    
    // 短暂延迟后检查翻译完整性
    setTimeout(() => {
      this.checkAndFillGaps();
    }, 1000);
  }

  // 公开方法供外部调用
  forceCheck() {
    console.log('🔄 强制检查翻译状态...');
    this.checkAndFillGaps();
  }
}

// 创建全局实例
window.unifiedTranslation = new UnifiedTranslationSystem();

// 页面加载后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.unifiedTranslation.init(), 1000);
  });
} else {
  setTimeout(() => window.unifiedTranslation.init(), 1000);
}

// 监听语言切换
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'languageSelector') {
    const newLang = e.target.value;
    window.unifiedTranslation.onLanguageChange(newLang);
  }
});

console.log('✅ 统一翻译系统就绪');