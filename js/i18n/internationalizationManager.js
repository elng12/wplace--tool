import { CONFIG } from '../config.js';
import { WplaceError } from '../core/errorHandler.js';

export class InternationalizationManager {
    constructor() {
        this.currentLanguage = 'zh';
        this.supportedLanguages = new Map();
        this.translations = new Map();
        this.dateFormatters = new Map();
        this.numberFormatters = new Map();
        this.direction = 'ltr';
        this.fallbackLanguage = 'en';
        
        this.initializeSupportedLanguages();
        this.initializeFormatters();
        this.initialize();
    }

    async initialize() {
        await this.initializeTranslations();
        this.loadUserLanguagePreference();
    }

    initializeSupportedLanguages() {
        // 支持的语言配置
        this.supportedLanguages.set('zh', {
            name: '中文',
            nativeName: '中文',
            direction: 'ltr',
            dateFormat: 'YYYY年MM月DD日',
            timeFormat: 'HH:mm:ss',
            currency: 'CNY',
            region: 'CN'
        });

        this.supportedLanguages.set('en', {
            name: 'English',
            nativeName: 'English',
            direction: 'ltr',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: 'h:mm:ss A',
            currency: 'USD',
            region: 'US'
        });

        this.supportedLanguages.set('pt', {
            name: 'Portuguese',
            nativeName: 'Português',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'EUR',
            region: 'PT'
        });

        this.supportedLanguages.set('fr', {
            name: 'French',
            nativeName: 'Français',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'EUR',
            region: 'FR'
        });

        this.supportedLanguages.set('de', {
            name: 'German',
            nativeName: 'Deutsch',
            direction: 'ltr',
            dateFormat: 'DD.MM.YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'EUR',
            region: 'DE'
        });

        this.supportedLanguages.set('es', {
            name: 'Spanish',
            nativeName: 'Español',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'EUR',
            region: 'ES'
        });

        this.supportedLanguages.set('ja', {
            name: 'Japanese',
            nativeName: '日本語',
            direction: 'ltr',
            dateFormat: 'YYYY年MM月DD日',
            timeFormat: 'HH:mm:ss',
            currency: 'JPY',
            region: 'JP'
        });

        this.supportedLanguages.set('th', {
            name: 'Thai',
            nativeName: 'ไทย',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'THB',
            region: 'TH'
        });

        this.supportedLanguages.set('mi', {
            name: 'Māori',
            nativeName: 'Te Reo Māori',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'NZD',
            region: 'NZ'
        });

        this.supportedLanguages.set('tr', {
            name: 'Turkish',
            nativeName: 'Türkçe',
            direction: 'ltr',
            dateFormat: 'DD.MM.YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'TRY',
            region: 'TR'
        });

        this.supportedLanguages.set('gn', {
            name: 'Guaraní',
            nativeName: 'Guaraní',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'PYG',
            region: 'PY'
        });

        this.supportedLanguages.set('vi', {
            name: 'Vietnamese',
            nativeName: 'Tiếng Việt',
            direction: 'ltr',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'VND',
            region: 'VN'
        });

        this.supportedLanguages.set('pl', {
            name: 'Polish',
            nativeName: 'Polski',
            direction: 'ltr',
            dateFormat: 'DD.MM.YYYY',
            timeFormat: 'HH:mm:ss',
            currency: 'PLN',
            region: 'PL'
        });
    }

    async initializeTranslations() {
        // 动态加载翻译文件
        const languageCodes = ['zh', 'en', 'pt', 'fr', 'de', 'es', 'ja', 'th', 'mi', 'tr', 'gn', 'vi', 'pl'];
        
        for (const code of languageCodes) {
            try {
                const response = await fetch(`./lang/${code}.json`);
                if (response.ok) {
                    const translations = await response.json();
                    this.translations.set(code, translations);
                }
            } catch (error) {
                console.warn(`无法加载语言文件 ${code}.json:`, error);
            }
        }
        
        // 如果动态加载失败，使用内置翻译
        if (!this.translations.has('zh')) {
            this.translations.set('zh', {
            "title": "Wplace 像素艺术转换器 | 将图像转换为像素艺术",
            "subtitle": "终极的 Wplace 像素艺术转换器，几秒钟内将任何图像转换为惊艳的像素艺术。我们的免费在线工具自动匹配 Wplace 官方 64 色调色板，立即为您提供专业效果。完美适用于 Wplace.live 玩家和像素艺术爱好者。",
            "nav.home": "首页",
            "nav.blog": "博客",
            "nav.about": "关于",
            "nav.privacy": "隐私政策",
            "nav.terms": "服务条款",
            "hero.wplace.text": "访问 Wplace 官方网站",
            "hero.wplace.btn.label": "访问 Wplace 官方网站",
            "upload.main": "点击上传或拖拽图片至此",
            "upload.sub": "支持 PNG, JPG 格式（最大 4MB）",
            "upload.label": "上传图片区域",
            "pixel.size": "像素尺寸",
            "pixel.slider": "像素尺寸滑块",
            "pixel.desc": "调整滑块时自动转换",
            "advanced.title": "高级设置",
            "advanced.dithering": "启用 Floyd-Steinberg 抖动算法",
            "advanced.scaling": "图像缩放方式：",
            "advanced.grid": "显示像素网格",
            "dither.enable": "启用 Floyd-Steinberg 抖动算法",
            "dither.desc": "改善颜色过渡和细节保留",
            "scaling.method": "图像缩放方式",
            "scaling.nearest": "最近邻插值",
            "scaling.bilinear": "双线性插值",
            "scaling.lanczos": "Lanczos 算法",
            "scaling.desc": "选择图像在像素化前的缩放方式",
            "preview.title": "Wplace 像素画预览",
            "preview.guide": "悬停在图像上以获取相应的调色板信息",
            "preview.prompt": "请上传一张图片开始",
            "btn.share.title": "分享到社交媒体",
            "share.twitter": "分享到 Twitter",
            "share.facebook": "分享到 Facebook",
            "share.reddit": "分享到 Reddit",
            "share.copy": "复制链接",
            "share.copied": "已复制！",
            "grid.horizontal": "水平",
            "grid.vertical": "垂直",
            "grid.total": "总计",
            "zoom.dragHint": "按住并通过鼠标或手指拖动图像以移动",
            "color.info": "悬停在像素上以查看颜色信息",
            "used.colors.title": "此图像使用的颜色",
            "used.colors.total": "总计",
            "used.colors.free": "免费",
            "used.colors.premium": "付费",
            "used.colors.desc": "这些是您生成的图像中使用的所有 Wplace 调色板颜色。付费颜色（带锁图标）需要在官方网站上购买。",
            "palette.official": "官方调色板",
            "palette.custom": "自定义调色板",
            "palette.select.free": "选择所有免费颜色",
            "palette.select.all": "全选",
            "palette.clear": "清除",
            "palette.selected": "已选择",
            "palette.colors": "种颜色",
            "palette.help": "点击以选择/取消选择颜色。带锁的颜色是付费高级颜色。",
            "palette.default": "官方 Wplace 64 色调色板",
            "palette.wplace": "官方 Wplace 64 色调色板",
            "palette.custom.title": "自定义调色板",
            "palette.title": "Wplace 64 色调色板",
            "palette.info": "官方 Wplace 调色板",
            "feedback.welcome": "欢迎玩家在以下地址分享建议",
            "loading": "处理中...",
            "btn.download": "下载",
            "btn.download.grid": "带网格下载",
            "btn.download.label": "下载按钮",
            "btn.download.grid.label": "下载带网格的图片",
            "error.file.type": "文件类型无效。请上传 PNG, JPG, 或 SVG 文件。",
            "error.image.load": "加载图片失败。请尝试另一个文件。",
            "error.convert": "转换图片时出错：",
            "features.title": "为什么选择 Wplace 像素艺术转换器？",
            "features.subtitle": "创建 Wplace 兼容像素艺术的终极工具",
            "features.special.title": "What Makes Wplace Pixel Art Converter Special?",
            "features.free.title": "100% 免费转换器",
            "features.free.desc": "Wplace 像素艺术转换器完全免费。无隐藏费用，无订阅。立即转换无限图像。",
            "features.privacy.title": "隐私保护",
            "features.privacy.desc": "所有处理都在您的浏览器中进行。您的图片永远不会离开您的设备。",
            "features.easy.title": "简单快速",
            "features.easy.desc": "直观的界面让每个人都能轻松创作像素艺术。无需技术技能。",
            "features.unlimited.title": "任意图像尺寸",
            "features.unlimited.desc": "上传任意尺寸的图片。Wplace 像素艺术转换器高效处理一切。",
            "howto.title": "如何使用 Wplace 像素艺术转换器",
            "howto.subtitle": "4 个简单步骤创作惊艳像素艺术",
            "howto.step1.title": "上传您的图片",
            "howto.step1.desc": "点击上传区域或拖放您的 PNG, JPG, 或 SVG 文件。Wplace 像素艺术转换器支持所有常见格式。",
            "howto.step2.title": "调整像素尺寸",
            "howto.step2.desc": "使用滑块控制像素尺寸。较小的值创建详细艺术，较大的值创建块状像素艺术。",
            "howto.step3.title": "转换为像素艺术",
            "howto.step3.desc": "观看您的图片使用 Wplace 像素艺术转换器的先进技术转换为惊艳像素艺术。",
            "howto.step4.title": "下载您的作品",
            "howto.step4.desc": "选择像素完美或大尺寸版本。您的 Wplace 像素艺术已准备就绪！",
            "faq.title": "常见问题",
            "faq.q1": "什么是 Wplace 像素艺术转换器？",
            "faq.a1": "Wplace 像素艺术转换器是一个免费的在线像素艺术生成器，可将任何图像转换为美丽的像素艺术。我们的 Wplace 工具使用先进的颜色映射来创造惊艳的效果。",
            "faq.q2": "Wplace 像素艺术转换器真的免费吗？",
            "faq.a2": "是的！Wplace 像素艺术转换器完全免费，没有任何限制。创作任意数量的像素艺术作品。",
            "faq.q3": "Wplace 像素艺术转换器支持哪些图片格式？",
            "faq.a3": "Wplace 像素艺术转换器支持 PNG, JPG, JPEG, 和 SVG 格式。上传任何图像并立即转换。",
            "faq.q4": "有尺寸限制吗？",
            "faq.a4": "没有！与其他工具不同，Wplace 像素艺术转换器没有图像尺寸限制。使用我们强大的 Wplace 工具处理任何尺寸的图像。",
            "faq.q5": "我的数据在 Wplace 像素艺术转换器中安全吗？",
            "faq.a5": "绝对安全！Wplace 像素艺术转换器在您的浏览器中本地处理所有内容。您的图片永远不会离开您的设备，确保完全的隐私。",
            "faq.q6": "我可以将生成的艺术用于商业用途吗？",
            "faq.a6": "是的！使用 Wplace 像素艺术转换器创作的艺术品您可以自由用于个人或商业项目。我们对您的创作不主张任何所有权。",
            "testimonials.title": "用户对 Wplace 像素艺术转换器的评价",
            "testimonials.desc": "来自创作者的真实反馈，他们使用 Wplace 像素艺术转换器将图像转换为清晰、与 Wplace 兼容的像素艺术。",
            "testimonials.q1": "“我用过的最好的转换器。抖动 + 自定义调色板让我的精灵图看起来和我计划的完全一样。”",
            "testimonials.q2": "“最近邻/双线性/Lanczos 选项是关键。我可以根据每张照片匹配缩放比例并保留细节。”",
            "testimonials.q3": "“喜欢‘已用颜色’面板——在我开始在 Wplace 中绘画之前，它能准确告诉我需要哪些付费颜色。”",
            "testimonials.q4": "“网格信息显示水平和垂直方向的精确块数。我可以在绘画前为 Wplace 完美调整画布大小。”",
            "testimonials.q5": "“从‘选择免费颜色’开始，然后添加一些付费色调——这使得在官方画板上绘画更快、更便宜。”",
            "testimonials.q6": "“清晰的预览和一键下载为我提供了干净的参考。我只需打开 Wplace 然后绘画——无需猜测。”",
            "testimonials.role.pixelArtist": "像素艺术家",
            "testimonials.role.gameDev": "游戏开发者",
            "testimonials.role.communityCreator": "社区创作者",
            "testimonials.role.wplacePlayer": "Wplace 玩家",
            "testimonials.role.paletteEnthusiast": "调色板爱好者",
            "testimonials.role.creator": "创作者",
            "about.title": "关于 Wplace 像素艺术转换器",
            "footer.nav.about": "关于",
            "footer.nav.privacy": "隐私政策",
            "footer.nav.terms": "服务条款",
            "footer.nav.blog": "博客",
            "footer.disclaimer.title": "独立粉丝网站",
            "footer.disclaimer.text": "这是一个非官方、独立的粉丝制作网站，旨在解决社区的痛点。我们与官方 Wplace 平台没有任何关联，也未获得其认可。该工具由粉丝为粉丝开发，旨在增强像素艺术创作体验。",
            "footer.main": "© 2025 Wplace 像素艺术转换器 - 免费使用，对生成的艺术品不主张所有权",
            "footer.privacy": "客户端处理保护您的隐私",
            "upload.batchProcessingHint": "支持多选批量处理",
            "settings.quality": "质量",
            "settings.brightness": "亮度",
            "settings.contrast": "对比度",
            "settings.saturation": "饱和度",
            "settings.colorPaletteLabel": "调色板：",
            "palette.standard": "标准调色板",
            "nav.converter": "转换器",
            "grid.horizontalLabel": "水平:",
            "grid.verticalLabel": "垂直:",
            "grid.totalLabel": "总计:",
            "btn.process": "处理",
            "btn.reset": "重置",
            "btn.grid": "网格",
            "toggle.grid": "网格：",
            "toggle.color": "颜色：",
            "info.fileName": "文件名：",
            "info.dimensions": "尺寸：",
            "info.fileSize": "文件大小：",
            "progress.processing": "处理中...",
            "progress.highPerformance": "使用高性能模式处理",
            "zoom.in": "放大",
            "zoom.out": "缩小",
            "zoom.reset": "重置缩放",
            "stats.imagesConverted": "使用我们的 Wplace 工具转换的图片",
            "stats.activeUsers": "Wplace 工具的活跃用户",
            "stats.satisfactionRate": "Wplace 工具的满意度",
            "footer.aboutTitle": "关于 Wplace 工具",
            "footer.nav.home": "首页",
            "footer.nav.converter": "Wplace 颜色转换器",
            "about.title": "关于 Wplace 工具 | 我们的故事与使命",
            "about.heroSubtitle": "Wplace 玩家创建精美像素艺术的终极伴侣。将任何图像转换为 Wplace 兼容的像素网格，并完美匹配颜色。",
            "about.storyTitle": "我们的故事",
            "about.storyPara1": "Wplace 工具的诞生源于 Wplace 社区成员的奉献精神，他们渴望在游戏中创作出更复杂、更精确的像素艺术。我们观察到玩家在将自己喜欢的图像适应受限的 Wplace 调色板同时保持视觉完整性方面经常面临挑战。",
            "about.storyPara2": "我们的团队设计了这个工具来解决这一需求，使任何 Wplace 玩家都能轻松地将他们的艺术概念转化为像素完美的创作，并与游戏的限制无缝集成。最初作为一个简单的转换工具，它已经发展成为一个完整的像素艺术开发套件。",
            "about.missionTitle": "我们的使命",
            "about.missionEmpowermentTitle": "通过工具赋能",
            "about.missionEmpowermentDesc": "我们致力于确保所有 Wplace 玩家，无论其技术水平如何，都能获得高质量的工具，以提升他们的创作。",
            "about.missionCommunityTitle": "社区优先",
            "about.missionCommunityDesc": "我们的工具由社区构思并致力于社区，免费提供，开源，旨在无限制地支持 Wplace 玩家群体。",
            "about.missionPrivacyTitle": "设计即隐私",
            "about.missionPrivacyDesc": "所有操作都在您的浏览器中直接执行。您的图像始终保留在您的设备上，保证绝对的隐私和强大的安全性。",
            "about.missionInnovationTitle": "持续创新",
            "about.missionInnovationDesc": "我们不断改进算法并引入新功能，这得益于社区的投入和 Wplace 玩家的动态需求。",
            "about.specialTitle": "我们有何特别之处",
            "about.specialFastTitle": "闪电般快速",
            "about.specialFastDesc": "先进的算法即时处理图像，为您提供 Wplace 像素艺术的实时预览。",
            "about.specialAccuracyTitle": "完美精度",
            "about.specialAccuracyDesc": "我们的颜色匹配算法确保与 Wplace 官方调色板最接近的匹配。",
            "about.specialGlobalTitle": "全球覆盖",
            "about.specialGlobalDesc": "支持 11 种语言，使全球 Wplace 玩家都能进行像素艺术创作。",
            "about.contactTitle": "联系我们",
            "about.contactDesc": "有建议、发现错误或想贡献？我们很乐意听取 Wplace 社区的意见！",
            "about.contactEmailBtn": "发送电子邮件",
            "blog.title": "博客 | Wplace 工具 - 学习像素艺术技巧",
            "blog.heroSubtitle": "在 Wplace 画布上释放您的创作潜力。我们的博客是您掌握像素艺术技巧、提升 Wplace 绘画技能以及通过深入指南和启发性教程充分利用我们强大工具的首选资源。",
            "blog.readTime": "{minutes} 分钟阅读",
            "blog.readMore": "阅读更多",
            "blog.article1.title": "入门：Wplace 工具的必备指南",
            "blog.article1.desc": "通过我们全面的初学者指南，踏上您的像素艺术之旅。轻松将任何图像转换为与 Wplace 兼容的精美像素艺术，涵盖从初始上传到高级调色板匹配和优化技术的所有内容。",
            "blog.article2.title": "掌握色彩：Wplace 艺术家的进阶调色板策略",
            "blog.article2.desc": "通过对色彩理论和调色板定制的专家见解，提升您的像素艺术。发现实现完美色彩和谐、创建生动构图并使您的艺术作品在 Wplace 画布上真正脱颖而出的专业策略。",
            "blog.article3.title": "像素完美缩放：图像重采样的深入探讨",
            "blog.article3.desc": "通过我们对最近邻、双线性和 Lanczos 方法的详细解释，揭开图像缩放的神秘面纱。了解它们对像素艺术的实际影响，确保您选择最佳技术以保持质量并获得清晰的结果。",
            "blog.article4.title": "增强细节：像素艺术中抖动的艺术与科学",
            "blog.article4.desc": "揭示抖动（包括 Floyd-Steinberg）的力量，以在像素艺术中实现更平滑的颜色渐变和更丰富的纹理。了解这些技术如何增强细节、减少色带，并有助于实现真实的复古美学。",
            "converter.title": "图像到像素艺术转换器 | Wplace 工具",
            "converter.heroTitle": "图像到像素艺术转换器",
            "converter.heroSubtitle": "立即将任何图像转换为 Wplace 像素艺术！我们的免费在线转换器使用 Wplace 官方 64 色调色板将照片转换为美丽的像素艺术。最好的 Wplace 像素艺术制作器和图像转换工具。",
            "converter.features.title": "为什么选择 Wplace 工具？",
            "converter.features.subtitle": "Wplace 的终极图像到像素艺术转换器",
            "converter.features.free.title": "100% 免费转换器",
            "converter.features.free.desc": "Wplace 像素艺术转换器完全免费使用。无隐藏费用，无订阅，无限制 - 转换无限图像",
            "converter.features.privacy.title": "隐私优先",
            "converter.features.privacy.desc": "所有图像转换都在您的浏览器中进行。您的图像永远不会离开您的设备 - 我们从不上传、存储或访问您的内容。",
            "converter.features.easy.title": "简单的图像转换器",
            "converter.features.easy.desc": "直观的界面使图像到像素艺术的转换对每个人都可用。无需技术技能",
            "converter.features.highQuality.title": "高质量",
            "converter.features.highQuality.desc": "使用先进的颜色匹配技术获得完美的 Wplace 兼容结果"
        });

        }
        
        // 英文翻译
        if (!this.translations.has('en')) {
            this.translations.set('en', {
            "title": "Wplace Pixel Art Converter | Transform Images to Pixel Art",
            "subtitle": "The ultimate Wplace Pixel Art Converter that transforms any image into stunning pixel art in seconds. Our free online tool automatically matches Wplace's official 64-color palette, giving you professional results instantly. Perfect for Wplace.live players and pixel art enthusiasts.",
            "nav.home": "Home",
            "nav.blog": "Blog", 
            "nav.about": "About",
            "nav.privacy": "Privacy",
            "nav.terms": "Terms",
            "hero.wplace.text": "Visit Wplace Official Site",
            "hero.wplace.btn.label": "Visit Wplace Official Site",
            "upload.main": "Click to upload or drag image here",
            "upload.sub": "Supports PNG, JPG formats (max 4MB)",
            "upload.label": "Upload image area",
            "pixel.size": "Pixel Size",
            "pixel.slider": "Pixel size slider",
            "pixel.desc": "Auto-converts as you adjust the slider",
            "advanced.title": "Advanced Settings",
            "advanced.dithering": "Enable Floyd-Steinberg Dithering",
            "advanced.scaling": "Image Scaling Method:",
            "advanced.grid": "Show Pixel Grid",
            "dither.enable": "Enable Floyd-Steinberg Dithering",
            "dither.desc": "Improves color transitions and detail preservation",
            "scaling.method": "Image Scaling Method",
            "scaling.nearest": "Nearest Neighbor",
            "scaling.bilinear": "Bilinear",
            "scaling.lanczos": "Lanczos",
            "scaling.desc": "Choose how images are resized before pixelization",
            "preview.title": "Wplace Pixel Paint Result",
            "preview.guide": "Hover over the image to get the corresponding color palette information",
            "preview.prompt": "Please upload an image to start",
            "btn.share.title": "Share to social media",
            "share.twitter": "Share to Twitter",
            "share.facebook": "Share to Facebook", 
            "share.reddit": "Share to Reddit",
            "share.copy": "Copy Link",
            "share.copied": "Copied!",
            "grid.horizontal": "Horizontal",
            "grid.vertical": "Vertical",
            "grid.total": "Total",
            "zoom.dragHint": "Hold and drag the image with mouse or finger to move",
            "color.info": "Hover over pixels to view color information",
            "used.colors.title": "Colors Used in This Image",
            "used.colors.total": "Total",
            "used.colors.free": "Free",
            "used.colors.premium": "Premium",
            "used.colors.desc": "These are all the colors from the Wplace palette used in your generated image. Premium colors (with lock icons) need to be purchased on the official website.",
            "palette.official": "Official Palette",
            "palette.custom": "Custom Palette",
            "palette.select.free": "Choose all free colors",
            "palette.select.all": "Select All",
            "palette.clear": "Clear",
            "palette.selected": "Selected",
            "palette.colors": "colors",
            "palette.help": "Click to select/deselect colors. Locked colors are premium paid colors.",
            "palette.default": "Official Wplace 64-color palette",
            "palette.wplace": "Official Wplace 64-color palette",
            "palette.custom.title": "Custom Palette",
            "palette.title": "Wplace 64-Color Palette",
            "palette.info": "Official Wplace color palette",
            "feedback.welcome": "Players are welcome to share their suggestions at",
            "loading": "Processing...",
            "btn.download": "Download",
            "btn.download.grid": "Download with Grid",
            "btn.download.label": "Download button",
            "btn.download.grid.label": "Download image with grid overlay",
            "error.file.type": "Invalid file type. Please upload PNG, JPG, or SVG files.",
            "error.image.load": "Failed to load image. Please try another file.",
            "error.convert": "Error converting image: ",
            "features.title": "Why Choose Wplace Pixel Art Converter?",
            "features.subtitle": "The ultimate tool to create Wplace-compatible pixel art",
            "features.special.title": "What Makes Wplace Pixel Art Converter Special?",
            "features.free.title": "100% Free Converter",
            "features.free.desc": "Wplace Pixel Art Converter is completely free. No hidden costs, no subscriptions. Convert unlimited images instantly.",
            "features.privacy.title": "Privacy Protected",
            "features.privacy.desc": "All processing happens in your browser. Your images never leave your device with Wplace Pixel Art Converter.",
            "features.easy.title": "Simple & Fast",
            "features.easy.desc": "Intuitive interface makes pixel art creation easy for everyone. No technical skills required.",
            "features.unlimited.title": "Any Image Size",
            "features.unlimited.desc": "Upload images of any size. Wplace Pixel Art Converter handles everything efficiently.",
            "howto.title": "How to Use Wplace Pixel Art Converter",
            "howto.subtitle": "Create stunning pixel art in 4 simple steps",
            "howto.step1.title": "Upload Your Image",
            "howto.step1.desc": "Click the upload area or drag and drop your PNG, JPG, or SVG file. Wplace Pixel Art Converter supports all common formats.",
            "howto.step2.title": "Adjust Pixel Size",
            "howto.step2.desc": "Use the slider to control pixel size. Smaller values create detailed art, larger values create chunky pixel art.",
            "howto.step3.title": "Convert to Pixel Art",
            "howto.step3.desc": "Watch your image transform into stunning pixel art using Wplace Pixel Art Converter's advanced technology.",
            "howto.step4.title": "Download Your Creation",
            "howto.step4.desc": "Choose between pixel perfect or large scale versions. Your Wplace pixel art is ready to use!",
            "faq.title": "Frequently Asked Questions",
            "faq.q1": "What is Wplace Pixel Art Converter?",
            "faq.a1": "Wplace Pixel Art Converter is a free online pixel art generator that converts any image into beautiful pixel art. Our Wplace tool uses advanced color mapping to create stunning results.",
            "faq.q2": "Is Wplace Pixel Art Converter really free?",
            "faq.a2": "Yes! Wplace Pixel Art Converter is completely free with no limitations. Create as many pixel art pieces as you want.",
            "faq.q3": "What image formats does Wplace Pixel Art Converter support?",
            "faq.a3": "Wplace Pixel Art Converter supports PNG, JPG, JPEG, and SVG formats. Upload any image and transform it instantly.",
            "faq.q4": "Are there any size limitations?",
            "faq.a4": "No! Unlike other tools, Wplace Pixel Art Converter has no image size restrictions. Process images of any dimension with our powerful Wplace tool.",
            "faq.q5": "Is my data safe with Wplace Pixel Art Converter?",
            "faq.a5": "Absolutely! Wplace Pixel Art Converter processes everything locally in your browser. Your images never leave your device, ensuring complete privacy.",
            "faq.q6": "Can I use the generated art commercially?",
            "faq.a6": "Yes! Art created with Wplace Pixel Art Converter is yours to use freely for personal or commercial projects. We claim no ownership over your creations.",
            "testimonials.title": "What Users Say About Wplace Pixel Art Converter",
            "testimonials.desc": "Real feedback from creators using Wplace Pixel Art Converter to turn images into clean, Wplace‑compatible pixel art.",
            "testimonials.q1": ""The best converter I've tried. Dithering + custom palette makes my sprites look exactly like I planned."",
            "testimonials.q2": ""Nearest/Bilinear/Lanczos options are clutch. I can match the scaling to each photo and keep details."",
            "testimonials.q3": ""Love the 'used colors' panel—tells me exactly which premium colors I'll need before I start painting in Wplace."",
            "testimonials.q4": ""Grid info shows exact blocks horizontally and vertically. I can size my canvas perfectly for Wplace before I paint."",
            "testimonials.q5": ""Start with 'Select Free Colors' then add a few premium hues—makes painting on the official board faster and cheaper."",
            "testimonials.q6": ""Crisp preview and one‑click download give me a clean reference. I just open Wplace and paint—no guesswork."",
            "testimonials.role.pixelArtist": "Pixel Artist",
            "testimonials.role.gameDev": "Game Dev",
            "testimonials.role.communityCreator": "Community Creator",
            "testimonials.role.wplacePlayer": "Wplace Player",
            "testimonials.role.paletteEnthusiast": "Palette Enthusiast",
            "testimonials.role.creator": "Creator",
            "about.title": "About Wplace Pixel Art Converter",
            "footer.nav.about": "About",
            "footer.nav.privacy": "Privacy",
            "footer.nav.terms": "Terms",
            "footer.nav.blog": "Blog",
            "footer.disclaimer.title": "Independent Fan Site",
            "footer.disclaimer.text": "This is an unofficial, independent fan-made website created to address community pain points. We are not affiliated with or endorsed by the official Wplace platform. This tool was developed by fans, for fans, to enhance the pixel art creation experience.",
            "footer.main": "© 2025 Wplace Pixel Art Converter - Free to use, no ownership claimed on generated artwork",
            "footer.privacy": "Client-side processing protects your privacy",
            "upload.batchProcessingHint": "Supports batch processing with multiple selections",
            "settings.quality": "Quality",
            "settings.brightness": "Brightness",
            "settings.contrast": "Contrast",
            "settings.saturation": "Saturation",
            "settings.colorPaletteLabel": "Color Palette:",
            "palette.standard": "Standard Palette",
            "nav.converter": "Converter",
            "grid.horizontalLabel": "H:",
            "grid.verticalLabel": "V:",
            "grid.totalLabel": "Total:",
            "btn.process": "Process",
            "btn.reset": "Reset",
            "btn.grid": "Grid",
            "toggle.grid": "Grid:",
            "toggle.color": "Color:",
            "info.fileName": "File Name:",
            "info.dimensions": "Dimensions:",
            "info.fileSize": "File Size:",
            "progress.processing": "Processing...",
            "progress.highPerformance": "Using high-performance mode",
            "zoom.in": "Zoom In",
            "zoom.out": "Zoom Out",
            "zoom.reset": "Reset Zoom",
            "stats.imagesConverted": "Images converted with our wplace tool",
            "stats.activeUsers": "Active users of the wplace tool",
            "stats.satisfactionRate": "Satisfaction rate with our wplace tool",
            "footer.aboutTitle": "About Wplace Tool",
            "footer.nav.home": "Home",
            "footer.nav.converter": "Wplace Color Converter",
            "about.title": "About Wplace Tool | Our Story & Mission",
            "about.heroSubtitle": "The ultimate companion for Wplace players to create stunning pixel art. Convert any image into Wplace-compatible pixel grids with perfect color matching.",
            "about.storyTitle": "Our Story",
            "about.storyPara1": "The Wplace Tool emerged from the dedication of Wplace community members eager to produce more intricate and precise pixel art within the game. We observed that players often faced challenges in adapting their preferred images to the restricted Wplace color palette while preserving visual integrity.",
            "about.storyPara2": "Our team engineered this utility to address that need, enabling any Wplace player to effortlessly translate their artistic concepts into pixel-perfect creations that integrate smoothly with the game's limitations. What began as a straightforward conversion tool has evolved into a complete suite for pixel art development.",
            "about.missionTitle": "Our Mission",
            "about.missionEmpowermentTitle": "Empowerment Through Tools",
            "about.missionEmpowermentDesc": "We are committed to ensuring that all Wplace players, irrespective of their technical proficiency, have access to high-caliber tools that elevate their creative endeavors.",
            "about.missionCommunityTitle": "Community First",
            "about.missionCommunityDesc": "Conceived by the community and dedicated to it, our tool is freely available, open-source, and crafted to support the Wplace player base without any restrictions.",
            "about.missionPrivacyTitle": "Privacy by Design",
            "about.missionPrivacyDesc": "Every operation is executed directly within your browser. Your images remain on your device at all times, guaranteeing absolute privacy and robust security.",
            "about.missionInnovationTitle": "Continuous Innovation",
            "about.missionInnovationDesc": "We are constantly refining our algorithms and introducing new features, driven by community input and the dynamic requirements of Wplace players.",
            "about.specialTitle": "What Makes Us Special",
            "about.specialFastTitle": "Lightning Fast",
            "about.specialFastDesc": "Advanced algorithms process images instantly, giving you real-time preview of your Wplace pixel art.",
            "about.specialAccuracyTitle": "Perfect Accuracy",
            "about.specialAccuracyDesc": "Our color matching algorithm ensures the closest possible match to Wplace's official color palette.",
            "about.specialGlobalTitle": "Global Reach",
            "about.specialGlobalDesc": "Supporting 11 languages, making pixel art creation accessible to Wplace players worldwide.",
            "about.contactTitle": "Get in Touch",
            "about.contactDesc": "Have suggestions, found a bug, or want to contribute? We'd love to hear from the Wplace community!",
            "about.contactEmailBtn": "Send Email",
            "blog.title": "Blog | Wplace Tool - Learn Pixel Art Techniques",
            "blog.heroSubtitle": "Unlock your creative potential on the Wplace canvas. Our blog is your go-to resource for mastering pixel art techniques, enhancing your Wplace painting skills, and making the most of our powerful tools through in-depth guides and inspiring tutorials.",
            "blog.readTime": "{minutes} min read",
            "blog.readMore": "Read more",
            "blog.article1.title": "Getting Started: Your Essential Guide to the Wplace Tool",
            "blog.article1.desc": "Embark on your pixel art journey with our comprehensive beginner's guide. Learn to effortlessly transform any image into stunning Wplace-compatible pixel art, covering everything from initial uploads to advanced color palette matching and optimization techniques.",
            "blog.article2.title": "Mastering Color: Advanced Palette Strategies for Wplace Artists",
            "blog.article2.desc": "Elevate your pixel art with expert insights into color theory and palette customization. Discover professional strategies to achieve perfect color harmony, create vibrant compositions, and make your artwork truly stand out on the Wplace canvas.",
            "blog.article3.title": "Pixel Perfect Scaling: A Deep Dive into Image Resampling",
            "blog.article3.desc": "Demystify image scaling with our detailed explanation of Nearest Neighbor, Bilinear, and Lanczos methods. Understand their practical implications for pixel art, ensuring you choose the optimal technique to preserve quality and achieve crisp results.",
            "blog.article4.title": "Enhancing Detail: The Art and Science of Dithering in Pixel Art",
            "blog.article4.desc": "Uncover the power of dithering, including Floyd-Steinberg, to achieve smoother color gradients and richer textures in your pixel art. Learn how these techniques can enhance detail, reduce banding, and contribute to an authentic retro aesthetic.",
            "converter.title": "Image to Pixel Art Converter | Wplace Tool",
            "converter.heroTitle": "Image to Pixel Art Converter",
            "converter.heroSubtitle": "Convert any image to Wplace pixel art instantly! Our free online converter transforms photos into beautiful pixel art using Wplace's official 64-color palette. The best Wplace pixel art maker and image converter tool.",
            "converter.features.title": "Why Choose Wplace Tool?",
            "converter.features.subtitle": "The ultimate image to pixel art converter for Wplace",
            "converter.features.free.title": "100% Free Converter",
            "converter.features.free.desc": "Wplace pixel art converter is completely free to use. No hidden costs, no subscriptions, no limitations - convert unlimited images",
            "converter.features.privacy.title": "Privacy First",
            "converter.features.privacy.desc": "All image conversion happens in your browser. Your images never leave your device - we never upload, store, or access your content.",
            "converter.features.easy.title": "Easy Image Converter",
            "converter.features.easy.desc": "Intuitive interface makes image to pixel art conversion accessible to everyone. No technical skills required",
            "converter.features.highQuality.title": "High Quality",
            "converter.features.highQuality.desc": "Perfect Wplace-compatible results with advanced color matching technology"
        });

        }
    }

    initializeFormatters() {
        // 初始化日期和数字格式化器
        this.supportedLanguages.forEach((config, language) => {
            try {
                this.dateFormatters.set(language, new Intl.DateTimeFormat(language, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }));

                this.numberFormatters.set(language, new Intl.NumberFormat(language, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }));
            } catch (error) {
                console.warn(`无法为语言 ${language} 创建格式化器:`, error);
            }
        });
    }

    loadUserLanguagePreference() {
        try {
            const savedLanguage = localStorage.getItem('wplace-language');
            const browserLanguage = navigator.language || navigator.languages[0];
            
            let preferredLanguage = this.currentLanguage;
            
            if (savedLanguage && this.supportedLanguages.has(savedLanguage)) {
                preferredLanguage = savedLanguage;
            } else if (this.supportedLanguages.has(browserLanguage)) {
                preferredLanguage = browserLanguage;
            } else {
                // 尝试匹配语言族
                const languageFamily = browserLanguage.split('-')[0];
                for (const [lang] of this.supportedLanguages) {
                    if (lang.startsWith(languageFamily)) {
                        preferredLanguage = lang;
                        break;
                    }
                }
            }
            
            this.setLanguage(preferredLanguage);
        } catch (error) {
            console.warn('无法加载语言偏好设置:', error);
        }
    }

    setLanguage(languageCode) {
        if (!this.supportedLanguages.has(languageCode)) {
            throw new WplaceError(`不支持的语言: ${languageCode}`, 'UNSUPPORTED_LANGUAGE');
        }

        this.currentLanguage = languageCode;
        const languageConfig = this.supportedLanguages.get(languageCode);
        this.direction = languageConfig.direction;

        // 更新HTML文档属性
        document.documentElement.lang = languageCode;
        document.documentElement.dir = this.direction;

        // 保存用户偏好
        localStorage.setItem('wplace-language', languageCode);

        // 触发语言变更事件
        this.dispatchLanguageChangeEvent(languageCode);

        // 更新页面内容
        this.updatePageContent();
    }

    translate(key, params = {}) {
        const translations = this.translations.get(this.currentLanguage) || 
                           this.translations.get(this.fallbackLanguage) || {};
        
        let translation = translations[key] || key;

        // 参数替换
        Object.keys(params).forEach(paramKey => {
            const placeholder = `{${paramKey}}`;
            translation = translation.replace(new RegExp(placeholder, 'g'), params[paramKey]);
        });

        return translation;
    }

    // 简写方法
    t(key, params = {}) {
        return this.translate(key, params);
    }

    formatDate(date, options = {}) {
        const formatter = this.dateFormatters.get(this.currentLanguage) || 
                         this.dateFormatters.get(this.fallbackLanguage);
        
        if (!formatter) {
            return date.toLocaleDateString();
        }

        return formatter.format(date);
    }

    formatNumber(number, options = {}) {
        const formatter = this.numberFormatters.get(this.currentLanguage) || 
                         this.numberFormatters.get(this.fallbackLanguage);
        
        if (!formatter) {
            return number.toString();
        }

        return formatter.format(number);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return `0 ${this.t('bytes')}`;
        
        const k = 1024;
        const sizes = ['bytes', 'kb', 'mb'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        
        return `${this.formatNumber(size)} ${this.t(sizes[i])}`;
    }

    formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)} ${this.t('seconds')}`;
        } else if (seconds < 3600) {
            return `${Math.round(seconds / 60)} ${this.t('minutes')}`;
        } else {
            return `${Math.round(seconds / 3600)} ${this.t('hours')}`;
        }
    }

    updatePageContent() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'button' || element.type === 'submit') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // 更新带有 data-i18n-title 属性的元素标题
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });

        // 更新带有 data-i18n-aria-label 属性的元素
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.translate(key));
        });
    }

    createLanguageSelector() {
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'language-selector-container';

        const currentLanguage = this.supportedLanguages.get(this.currentLanguage);
        selectorContainer.innerHTML = `
            <button class="language-selector-btn" title="${this.t('selectLanguage')}">
                <span class="language-code">${this.currentLanguage}</span>
                <span class="language-name">${currentLanguage.nativeName}</span>
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="language-menu hidden">
                ${Array.from(this.supportedLanguages.entries()).map(([code, config]) => `
                    <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                         data-language="${code}">
                        <span class="language-code">${code}</span>
                        <span class="language-name">${config.nativeName}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加事件监听器
        const selectorBtn = selectorContainer.querySelector('.language-selector-btn');
        const languageMenu = selectorContainer.querySelector('.language-menu');
        const languageOptions = selectorContainer.querySelectorAll('.language-option');

        selectorBtn.addEventListener('click', () => {
            languageMenu.classList.toggle('hidden');
        });

        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const languageCode = option.dataset.language;
                this.setLanguage(languageCode);
                languageMenu.classList.add('hidden');
                this.updateLanguageSelectorDisplay(selectorContainer);
            });
        });

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!selectorContainer.contains(e.target)) {
                languageMenu.classList.add('hidden');
            }
        });

        return selectorContainer;
    }

    updateLanguageSelectorDisplay(container) {
        const currentLanguage = this.supportedLanguages.get(this.currentLanguage);
        const selectorBtn = container.querySelector('.language-selector-btn');
        
        selectorBtn.querySelector('.language-code').textContent = this.currentLanguage;
        selectorBtn.querySelector('.language-name').textContent = currentLanguage.nativeName;

        // 更新选中状态
        container.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.language === this.currentLanguage);
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getCurrentLanguageConfig() {
        return this.supportedLanguages.get(this.currentLanguage);
    }

    getSupportedLanguages() {
        return Array.from(this.supportedLanguages.entries()).map(([code, config]) => ({
            code,
            ...config
        }));
    }

    isRTL() {
        return this.direction === 'rtl';
    }

    dispatchLanguageChangeEvent(languageCode) {
        const event = new CustomEvent('languagechange', {
            detail: { 
                language: languageCode,
                config: this.supportedLanguages.get(languageCode),
                direction: this.direction
            }
        });
        window.dispatchEvent(event);
    }

    createStyleSheet() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .language-selector-container {
                position: relative;
                display: inline-block;
            }

            .language-selector-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius);
                padding: 8px 12px;
                cursor: pointer;
                transition: all var(--transition-fast);
                box-shadow: var(--shadow-small);
                color: var(--color-text);
                min-width: 120px;
            }

            .language-selector-btn:hover {
                background: var(--color-surfaceVariant);
                box-shadow: var(--shadow-medium);
            }

            .language-code {
                font-size: 12px;
                opacity: 0.8;
                text-transform: uppercase;
            }

            .language-name {
                flex: 1;
                text-align: left;
            }

            .dropdown-arrow {
                font-size: 10px;
                opacity: 0.6;
                transition: transform var(--transition-fast);
            }

            .language-selector-container:hover .dropdown-arrow {
                transform: rotate(180deg);
            }

            .language-menu {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-large);
                z-index: 1000;
                margin-top: 4px;
                max-height: 200px;
                overflow-y: auto;
            }

            .language-menu.hidden {
                display: none;
            }

            .language-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background var(--transition-fast);
                color: var(--color-text);
            }

            .language-option:hover {
                background: var(--color-backgroundSecondary);
            }

            .language-option.active {
                background: var(--color-primaryLight);
                color: var(--color-primary);
            }

            .language-option:first-child {
                border-radius: var(--border-radius) var(--border-radius) 0 0;
            }

            .language-option:last-child {
                border-radius: 0 0 var(--border-radius) var(--border-radius);
            }

            /* RTL 支持 */
            [dir="rtl"] .language-selector-btn {
                text-align: right;
            }

            [dir="rtl"] .language-name {
                text-align: right;
            }

            [dir="rtl"] .language-menu {
                left: auto;
                right: 0;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .language-selector-btn {
                    min-width: 100px;
                    padding: 6px 10px;
                }
                
                .language-option {
                    padding: 10px 12px;
                }
            }
        `;
        
        return styleSheet;
    }
}

// 实用函数
export async function initializeInternationalization() {
    const i18nManager = new InternationalizationManager();
    
    // 等待初始化完成
    await i18nManager.initialize();
    
    // 添加样式表到文档
    const styleSheet = i18nManager.createStyleSheet();
    document.head.appendChild(styleSheet);
    
    // 如果有合适的容器，添加语言选择器
    const headerContainer = document.querySelector('.header-controls') || 
                           document.querySelector('.controls') || 
                           document.querySelector('header');
    
    if (headerContainer) {
        const languageSelector = i18nManager.createLanguageSelector();
        headerContainer.appendChild(languageSelector);
    }
    
    // 使 i18n 管理器全局可访问
    window.i18n = i18nManager;
    
    return i18nManager;
}