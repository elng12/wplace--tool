/**
 * 多语言系统 - 修复版，支持 file:// 协议
 * 内置翻译数据，无需依赖外部文件加载
 */

// 内置翻译数据（解决CORS问题）
const BUILT_IN_TRANSLATIONS = {
  "en": {
    "title": "Wplace Pixel Art Converter | Transform Images to Pixel Art",
    "subtitle": "The ultimate Wplace Pixel Art Converter that transforms any image into stunning pixel art in seconds.",
    "nav.home": "Home",
    "nav.converter": "Converter", 
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.privacy": "Privacy",
    "nav.terms": "Terms",
    "upload.main": "Click to upload or drag image here",
    "upload.sub": "Supports PNG, JPG formats (no size limit)",
    "pixel.size": "Pixel Size",
    "pixel.desc": "Auto-converts as you adjust the slider",
    "advanced.title": "Advanced Settings",
    "preview.title": "Wplace Pixel Paint Result",
    "preview.prompt": "Please upload an image to start",
    "btn.download": "Download",
    "ui.advanced.dithering": "Enable Floyd-Steinberg Dithering",
    "ui.advanced.grid": "Show Pixel Grid",
    "ui.advanced.scaling": "Image Scaling Method:",
    "ui.scaling.nearest": "Nearest Neighbor",
    "ui.scaling.bilinear": "Bilinear",
    "ui.scaling.lanczos": "Lanczos",
    "ui.controls.loading": "Processing...",
    "colors.title": "Colors Used in This Image",
    "colors.total": "Total",
    "colors.free": "Free",
    "colors.premium": "Premium",
    "palette.title": "Wplace 64-Color Palette",
    "palette.free": "Free (32)",
    "palette.premium": "Premium (32)",
    "palette.info": "Official Wplace color palette",
    "features.title": "What Makes Our Wplace Tool Special?",
    "features.free.title": "100% Free Converter",
    "features.free.desc": "Wplace Pixel Art Converter is completely free. No hidden costs, no subscriptions.",
    "features.privacy.title": "Privacy Protected",
    "features.privacy.desc": "All processing happens in your browser. Your images never leave your device.",
    "features.easy.title": "Simple & Fast",
    "features.easy.desc": "Intuitive interface makes pixel art creation easy for everyone. No technical skills required.",
    "features.unlimited.title": "Any Image Size",
    "features.unlimited.desc": "Upload images of any size. Our tool handles everything efficiently.",
    "howto.title": "How to Use Wplace Pixel Art Converter",
    "howto.subtitle": "Create stunning pixel art in 4 simple steps",
    "howTo.step1.title": "Adjust Pixel Size",
    "howTo.step1.description": "Use the slider to control pixel size. Smaller values create detailed art, larger values create chunky pixel art.",
    "howTo.step2.title": "Convert to Pixel Art",
    "howTo.step2.description": "Watch your image transform into stunning pixel art using our advanced technology.",
    "howTo.step4.description": "Choose between pixel perfect or large scale versions. Your Wplace pixel art is ready!",
    "faq.answer6": "The converted pixel art can be used directly on the Wplace platform.",
    "testimonials.quote6": "This tool makes my creative process easy and enjoyable.",
    "footer.main": "© 2025 Wplace Tool - Free to use, no ownership claims on generated artwork",
    "footer.privacy": "Client-side processing protects your privacy",
    "progress.highPerformance": "High Performance Mode"
  },
  "zh": {
    "title": "Wplace 工具：终极像素艺术工具和图像工具",
    "subtitle": "轻松为 Wplace 创建像素艺术。我们的生成器将任何图像转换为与 Wplace 兼容的像素网格，自动匹配官方调色板。",
    "nav.home": "首页",
    "nav.converter": "转换器",
    "nav.blog": "博客",
    "nav.about": "关于",
    "nav.privacy": "隐私政策",
    "nav.terms": "服务条款",
    "upload.main": "点击上传或拖拽图片至此",
    "upload.sub": "支持 PNG, JPG 格式（无大小限制）",
    "pixel.size": "像素尺寸",
    "pixel.desc": "调整滑块时自动转换",
    "advanced.title": "高级设置",
    "preview.title": "Wplace 像素画结果",
    "preview.prompt": "请上传一张图片开始",
    "btn.download": "下载",
    "ui.advanced.dithering": "启用 Floyd-Steinberg 抖动",
    "ui.advanced.grid": "显示像素网格",
    "ui.advanced.scaling": "图像缩放方式：",
    "ui.scaling.nearest": "最近邻",
    "ui.scaling.bilinear": "双线性",
    "ui.scaling.lanczos": "Lanczos",
    "ui.controls.loading": "处理中...",
    "colors.title": "此图像使用的颜色",
    "colors.total": "总计",
    "colors.free": "免费",
    "colors.premium": "高级",
    "palette.title": "Wplace 64色调色板",
    "palette.free": "免费 (32)",
    "palette.premium": "高级 (32)",
    "palette.info": "官方 Wplace 调色板",
    "features.title": "是什么让我们的 Wplace 工具与众不同？",
    "features.free.title": "100% 免费转换器",
    "features.free.desc": "Wplace 像素艺术转换器完全免费。无隐藏费用，无订阅。",
    "features.privacy.title": "隐私保护",
    "features.privacy.desc": "所有处理都在您的浏览器中进行。您的图片永远不会离开您的设备。",
    "features.easy.title": "简单快速",
    "features.easy.desc": "直观的界面让每个人都能轻松创作像素艺术。无需技术技能。",
    "features.unlimited.title": "任意图像尺寸",
    "features.unlimited.desc": "上传任何尺寸的图片。我们的工具能高效处理一切。",
    "howto.title": "如何使用 Wplace 像素艺术转换器",
    "howto.subtitle": "4 个简单步骤创作惊艳像素艺术",
    "howTo.step1.title": "调整像素大小",
    "howTo.step1.description": "使用滑块控制像素大小。较小的值创建更详细的艺术，较大的值产生块状、抽象的像素艺术。",
    "howTo.step2.title": "转换为像素艺术",
    "howTo.step2.description": "使用我们的先进技术，观看您的图像转换成令人惊叹的像素艺术。",
    "howTo.step4.description": "选择像素完美版本或放大版本。您的 Wplace 像素艺术已准备就绪！",
    "faq.answer6": "转换后的像素艺术可以直接在 Wplace 平台上使用。",
    "testimonials.quote6": "这个工具让我的创作过程变得轻松愉快。",
    "footer.main": "© 2025 Wplace 工具 - 免费使用，不对生成的艺术作品主张所有权",
    "footer.privacy": "客户端处理保护您的隐私",
    "progress.highPerformance": "高性能模式"
  }
};

// 其他语言的简化映射（用于语言选择器）
const LANGUAGE_NAMES = {
  'en': 'English',
  'zh': '中文',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ja': '日本語',
  'pt-BR': 'Português (Brasil)',
  'pt': 'Português',
  'he': 'עברית',
  'ru': 'Русский',
  'th': 'ไทย',
  'tr': 'Türkçe',
  'vi': 'Tiếng Việt',
  'pl': 'Polski',
  'mi': 'Māori',
  'gn': 'Guaraní'
};

// 全局翻译存储
let currentTranslations = BUILT_IN_TRANSLATIONS['en'];
let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', () => {
  const languageSelector = document.getElementById('languageSelector');
  const languageIcon = document.getElementById('languageIcon');
  const languageMenu = document.getElementById('languageMenu');
  const closeLanguageMenu = document.getElementById('closeLanguageMenu');

  // 从 localStorage 获取保存的语言
  const savedLang = localStorage.getItem('language') || 
                   localStorage.getItem('wplace-language') || 
                   navigator.language.split('-')[0] || 
                   'en';

  /**
   * 加载并应用翻译
   * @param {string} lang - 语言代码
   */
  const loadTranslations = async (lang) => {
    console.log(`🌐 加载语言: ${lang}`);
    
    // 检查是否有内置翻译
    if (BUILT_IN_TRANSLATIONS[lang]) {
      console.log(`✅ 使用内置翻译: ${lang}`);
      currentTranslations = BUILT_IN_TRANSLATIONS[lang];
      currentLanguage = lang;
      applyTranslations(currentTranslations);
      updateLanguageState(lang);
      return;
    }
    
    // 尝试从服务器加载（如果在HTTP环境下）
    if (window.location.protocol.startsWith('http')) {
      try {
        console.log(`🔄 尝试从服务器加载: ${lang}`);
        const response = await fetch(`/locales/${lang}.json`);
        if (response.ok) {
          const translations = await response.json();
          console.log(`✅ 从服务器加载成功: ${lang}`);
          currentTranslations = translations;
          currentLanguage = lang;
          applyTranslations(translations);
          updateLanguageState(lang);
          return;
        }
      } catch (error) {
        console.warn(`⚠️ 从服务器加载失败: ${error.message}`);
      }
    }
    
    // 回退到英语
    if (lang !== 'en') {
      console.log(`🔄 回退到英语`);
      currentTranslations = BUILT_IN_TRANSLATIONS['en'];
      currentLanguage = 'en';
      applyTranslations(currentTranslations);
      updateLanguageState('en');
    }
  };

  /**
   * 应用翻译到DOM
   * @param {object} translations - 翻译对象
   */
  const applyTranslations = (translations) => {
    // 更新所有带有 data-lang 或 data-i18n 的元素
    document.querySelectorAll('[data-lang], [data-i18n]').forEach(element => {
      const key = element.getAttribute('data-lang') || element.getAttribute('data-i18n');
      if (translations[key]) {
        // 跳过语言选项按钮
        if (element.classList.contains('language-option')) {
          return;
        }
        
        // 特殊处理 aria-label
        if (element.hasAttribute('data-lang-aria')) {
          element.setAttribute('aria-label', translations[key]);
        } else {
          element.textContent = translations[key];
        }
      }
    });

    // 更新页面元数据
    if (translations['title']) {
      document.title = translations['title'];
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && translations['subtitle']) {
      metaDescription.setAttribute('content', translations['subtitle']);
    }

    // 更新 Open Graph 标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && translations['title']) {
      ogTitle.setAttribute('content', translations['title']);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && translations['subtitle']) {
      ogDescription.setAttribute('content', translations['subtitle']);
    }

    // 更新 Twitter 标签
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle && translations['title']) {
      twitterTitle.setAttribute('content', translations['title']);
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription && translations['subtitle']) {
      twitterDescription.setAttribute('content', translations['subtitle']);
    }
  };

  /**
   * 更新语言状态
   * @param {string} lang - 语言代码
   */
  const updateLanguageState = (lang) => {
    // 更新 HTML lang 属性
    document.documentElement.lang = lang;
    
    // 更新选择器
    if (languageSelector) {
      languageSelector.value = lang;
    }
    
    // 保存到 localStorage（兼容两种键名）
    localStorage.setItem('language', lang);
    localStorage.setItem('wplace-language', lang);
    
    console.log(`✅ 语言已切换到: ${LANGUAGE_NAMES[lang] || lang}`);
  };

  /**
   * 设置语言
   * @param {string} lang - 语言代码
   */
  const setLanguage = (lang) => {
    loadTranslations(lang);
    
    // 关闭移动端菜单
    if (languageMenu && !languageMenu.classList.contains('hidden')) {
      languageMenu.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @returns {string} - 翻译后的文本
   */
  window.t = (key) => {
    return currentTranslations[key] || BUILT_IN_TRANSLATIONS['en'][key] || key;
  };

  // --- 事件监听器 ---

  // 桌面版语言选择器
  if (languageSelector) {
    languageSelector.addEventListener('change', (event) => {
      setLanguage(event.target.value);
    });
  }

  // 移动版语言图标
  if (languageIcon) {
    languageIcon.addEventListener('click', () => {
      if (languageMenu) {
        languageMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // 关闭移动版语言菜单
  if (closeLanguageMenu) {
    closeLanguageMenu.addEventListener('click', () => {
      if (languageMenu) {
        languageMenu.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  // 移动版语言选项按钮
  document.querySelectorAll('.language-option').forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // 点击外部关闭菜单
  if (languageMenu) {
    languageMenu.addEventListener('click', (e) => {
      if (e.target === languageMenu) {
        languageMenu.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  // --- 初始化 ---
  loadTranslations(savedLang);

  // 导出全局函数
  window.setLanguage = setLanguage;
  window.loadTranslations = loadTranslations;
  window.currentLanguage = () => currentLanguage;
  
  console.log('✅ 多语言系统已初始化（支持 file:// 协议）');
});