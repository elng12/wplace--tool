/**
 * 懒加载翻译优化器
 * 减少内存使用并提升性能
 */

window.logger?.log('🚀 懒加载翻译优化器启动...');

class LazyTranslationOptimizer {
  constructor() {
    this.loadedLanguages = new Set();
    this.languageCache = new Map();
    this.maxCacheSize = 3; // 最多缓存3种语言
    this.memoryStats = {
      initialSize: 0,
      currentSize: 0,
      savedMemory: 0
    };
    
    this.init();
  }

  init() {
    // 记录初始内存使用
    if (window.__INLINE_I18N__) {
      this.memoryStats.initialSize = JSON.stringify(window.__INLINE_I18N__).length;
      window.logger?.log(`💾 初始翻译数据: ${Math.round(this.memoryStats.initialSize / 1024);}KB`);
      
      // 只保留英语和当前语言，其他语言懒加载
      this.optimizeInitialLoad();
    }

    // 监听语言切换事件
    this.setupLanguageChangeListener();
    
    window.logger?.log('✅ 懒加载翻译优化器初始化完成');
  }

  optimizeInitialLoad() {
    if (!window.__INLINE_I18N__) return;

    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    const originalData = window.__INLINE_I18N__;
    
    // 保存完整数据到缓存
    this.fullTranslationData = { ...originalData };
    
    // 只保留英语和当前语言
    const optimizedData = {
      en: originalData.en,
      [currentLang]: originalData[currentLang]
    };

    // 如果当前语言不是英语，确保两种语言都存在
    if (currentLang !== 'en' && originalData[currentLang]) {
      window.__INLINE_I18N__ = optimizedData;
    } else {
      window.__INLINE_I18N__ = { en: originalData.en };
    }

    this.loadedLanguages.add('en');
    if (currentLang !== 'en') {
      this.loadedLanguages.add(currentLang);
    }

    const newSize = JSON.stringify(window.__INLINE_I18N__).length;
    this.memoryStats.currentSize = newSize;
    this.memoryStats.savedMemory = this.memoryStats.initialSize - newSize;

    window.logger?.log(`🎯 内存优化: ${Math.round(this.memoryStats.savedMemory / 1024);}KB 已节省 (${Math.round(this.memoryStats.savedMemory / this.memoryStats.initialSize * 100)}%)`);
  }

  async loadLanguage(langCode) {
    if (this.loadedLanguages.has(langCode)) {
      window.logger?.log(`📋 语言 ${langCode} 已在内存中`);
      return;
    }

    window.logger?.log(`🔄 懒加载语言: ${langCode}`);

    // 从完整数据中加载
    if (this.fullTranslationData && this.fullTranslationData[langCode]) {
      // 检查缓存大小，如果超出限制则清理
      if (this.loadedLanguages.size >= this.maxCacheSize) {
        this.cleanupOldLanguages(langCode);
      }

      window.__INLINE_I18N__[langCode] = this.fullTranslationData[langCode];
      this.loadedLanguages.add(langCode);
      
      window.logger?.log(`✅ 懒加载完成: ${langCode} (${Object.keys(this.fullTranslationData[langCode]);.length} 键)`);
      
      // 更新内存统计
      this.memoryStats.currentSize = JSON.stringify(window.__INLINE_I18N__).length;
      window.logger?.log(`💾 当前内存使用: ${Math.round(this.memoryStats.currentSize / 1024);}KB`);
    } else {
      window.logger?.warn(`⚠️ 语言数据不存在: ${langCode}`);
    }
  }

  cleanupOldLanguages(keepLang) {
    const currentLang = window.i18n?.currentLang || 'en';
    const essentialLangs = new Set(['en', currentLang, keepLang]);
    
    // 清理非必要语言
    for (const lang of this.loadedLanguages) {
      if (!essentialLangs.has(lang) && window.__INLINE_I18N__[lang]) {
        delete window.__INLINE_I18N__[lang];
        this.loadedLanguages.delete(lang);
        window.logger?.log(`🧹 清理语言缓存: ${lang}`);
      }
    }
  }

  setupLanguageChangeListener() {
    // 等待DOM加载完成后绑定事件
    const bindEvents = () => {
      const languageSelector = document.getElementById('languageSelector');
      if (languageSelector) {
        // 使用capture=true确保在i18n处理前先加载语言数据
        languageSelector.addEventListener('change', async (e) => {
          const newLang = e.target.value;
          window.logger?.log(`🔄 懒加载触发: ${newLang}`);
          await this.loadLanguage(newLang);
        }, true);
        
        window.logger?.log('✅ 懒加载事件监听器已绑定');
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindEvents);
    } else {
      bindEvents();
    }
  }

  // 获取内存统计
  getMemoryStats() {
    return {
      ...this.memoryStats,
      loadedLanguages: Array.from(this.loadedLanguages),
      cacheSize: this.loadedLanguages.size,
      maxCacheSize: this.maxCacheSize,
      currentSizeKB: Math.round(this.memoryStats.currentSize / 1024),
      savedSizeKB: Math.round(this.memoryStats.savedMemory / 1024),
      savingPercentage: Math.round(this.memoryStats.savedMemory / this.memoryStats.initialSize * 100)
    };
  }

  // 预加载指定语言
  async preloadLanguages(languages) {
    window.logger?.log(`🔄 预加载语言: ${languages.join(', ');}`);
    for (const lang of languages) {
      await this.loadLanguage(lang);
    }
  }
}

// 创建全局实例
window.lazyTranslationOptimizer = new LazyTranslationOptimizer();

// 导出获取统计信息的函数
window.getTranslationMemoryStats = () => {
  return window.lazyTranslationOptimizer?.getMemoryStats() || null;
};

window.logger?.log('✅ 懒加载翻译优化器就绪');