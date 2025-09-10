/**
 * 自动生成内联翻译脚本
 * 读取所有 lang/*.json 文件并生成 inline-translations.js
 */

const fs = require('fs');
const path = require('path');

const LANG_DIR = './lang';
const OUTPUT_FILE = './js/inline-translations.js';

function generateInlineTranslations() {
    console.log('🚀 开始生成内联翻译文件...');
    
    // 读取语言目录
    const langFiles = fs.readdirSync(LANG_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    
    console.log('📋 发现语言文件:', langFiles);
    
    // 生成JavaScript内容
    let jsContent = `/**
 * 内联翻译数据 - 为本地 file:// 环境提供无 CORS 错误的翻译支持
 * 自动生成于 ${new Date().toISOString()}，请勿手动编辑
 */

// 初始化内联翻译对象
window.__INLINE_I18N__ = window.__INLINE_I18N__ || {};

`;

    // 为每种语言生成数据
    for (const lang of langFiles) {
        try {
            const langFilePath = path.join(LANG_DIR, `${lang}.json`);
            const langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
            
            // HTML中实际使用的所有翻译键 (392个)
            const htmlUsedKeys = [
                // NAV section
                'nav.about', 'nav.back_to_blog', 'nav.blog', 'nav.converter', 'nav.home', 'nav.privacy', 'nav.terms',
                
                // HERO section  
                'hero.description', 'hero.subtitle', 'hero.title',
                
                // UPLOAD section
                'upload.batch', 'upload.main', 'upload.sub',
                
                // BTN section
                'btn.download', 'btn.download.grid', 'btn.process', 'btn.reset',
                
                // PREVIEW section
                'preview.prompt', 'preview.title',
                
                // PALETTE section
                'palette.free', 'palette.info', 'palette.premium', 'palette.subtitle', 'palette.title',
                
                // CONTROLS section
                'controls.brightness', 'controls.color_palette', 'controls.contrast', 'controls.quality', 'controls.saturation',
                
                // FEATURES section
                'features.accurate.desc', 'features.accurate.title', 'features.easy.detailed.desc', 'features.easy.detailed.title',
                'features.fast.desc', 'features.fast.title', 'features.free.desc', 'features.free.detailed.desc', 'features.free.detailed.title',
                'features.free.title', 'features.privacy.desc', 'features.privacy.detailed.desc', 'features.privacy.title',
                'features.special.title', 'features.subtitle', 'features.subtitle.desc', 'features.title', 'features.unlimited.detailed.desc',
                'features.unlimited.detailed.title',
                
                // HOWTO section
                'howto.step1.desc', 'howto.step1.title', 'howto.step2.desc', 'howto.step2.title', 'howto.step3.desc', 'howto.step3.title',
                'howto.step4.desc', 'howto.step4.title', 'howto.subtitle', 'howto.title',
                
                // FAQ section
                'faq.a1', 'faq.a2', 'faq.a3', 'faq.a4', 'faq.a5', 'faq.a6', 'faq.q1', 'faq.q2', 'faq.q3', 'faq.q4', 'faq.q5',
                'faq.q6', 'faq.subtitle', 'faq.title',
                
                // TESTIMONIALS section
                'testimonials.subtitle', 'testimonials.title', 'testimonials.user1.name', 'testimonials.user1.quote', 'testimonials.user1.role',
                'testimonials.user2.name', 'testimonials.user2.quote', 'testimonials.user2.role', 'testimonials.user3.name',
                'testimonials.user3.quote', 'testimonials.user3.role', 'testimonials.user4.name', 'testimonials.user4.quote', 'testimonials.user4.role',
                
                // STATS section
                'stats.images', 'stats.satisfaction', 'stats.users',
                
                // FOOTER section
                'footer.copyright', 'footer.disclaimer.text', 'footer.disclaimer.title', 'footer.independent.desc', 'footer.independent.title',
                'footer.main', 'footer.privacy', 'footer.title',
                
                // PRIVACY section
                'privacy.changes.desc', 'privacy.changes.title', 'privacy.children.desc', 'privacy.children.title', 'privacy.client.desc',
                'privacy.client.title', 'privacy.contact.desc', 'privacy.contact.title', 'privacy.highlights.anonymous.desc',
                'privacy.highlights.anonymous.title', 'privacy.highlights.title', 'privacy.highlights.tracking.desc', 'privacy.highlights.tracking.title',
                'privacy.highlights.transparent.desc', 'privacy.highlights.transparent.title', 'privacy.highlights.zero.desc', 'privacy.highlights.zero.title',
                'privacy.lastupdated', 'privacy.nodata.desc', 'privacy.nodata.title', 'privacy.noreg.desc', 'privacy.noreg.title',
                'privacy.notcollect.desc', 'privacy.notcollect.item1', 'privacy.notcollect.item2', 'privacy.notcollect.item3', 'privacy.notcollect.item4',
                'privacy.notcollect.item5', 'privacy.notcollect.item6', 'privacy.notcollect.item7', 'privacy.notcollect.item8', 'privacy.notcollect.title',
                'privacy.opensource.desc', 'privacy.opensource.title', 'privacy.promise.data', 'privacy.promise.images', 'privacy.promise.local',
                'privacy.promise.subtitle', 'privacy.promise.title', 'privacy.protect.title', 'privacy.rights.desc', 'privacy.rights.item1',
                'privacy.rights.item2', 'privacy.rights.item3', 'privacy.rights.item4', 'privacy.rights.title', 'privacy.security.desc',
                'privacy.security.title', 'privacy.storage.desc', 'privacy.storage.item1', 'privacy.storage.item2', 'privacy.storage.item3',
                'privacy.storage.note', 'privacy.storage.title', 'privacy.subtitle', 'privacy.tech.desc', 'privacy.tech.item1',
                'privacy.tech.item2', 'privacy.tech.item3', 'privacy.tech.note', 'privacy.tech.title', 'privacy.thirdparty.desc',
                'privacy.thirdparty.item1', 'privacy.thirdparty.item2', 'privacy.thirdparty.note', 'privacy.thirdparty.title', 'privacy.title',
                
                // TERMS section
                'terms.acceptance.desc', 'terms.acceptance.title', 'terms.changes.desc', 'terms.changes.title', 'terms.contact.desc',
                'terms.contact.email.label', 'terms.contact.title', 'terms.disclaimer.desc', 'terms.disclaimer.item1', 'terms.disclaimer.item2',
                'terms.disclaimer.item3', 'terms.disclaimer.item4', 'terms.disclaimer.item5', 'terms.disclaimer.title', 'terms.governing.desc',
                'terms.governing.title', 'terms.ip.content.desc', 'terms.ip.content.title', 'terms.ip.generated.desc', 'terms.ip.generated.title',
                'terms.ip.service.desc', 'terms.ip.service.title', 'terms.ip.title', 'terms.lastupdated', 'terms.liability.desc',
                'terms.liability.item1', 'terms.liability.item2', 'terms.liability.item3', 'terms.liability.item4', 'terms.liability.title',
                'terms.modifications.desc', 'terms.modifications.title', 'terms.permitted.desc', 'terms.permitted.item1', 'terms.permitted.item2',
                'terms.permitted.item3', 'terms.permitted.item4', 'terms.permitted.item5', 'terms.permitted.title', 'terms.privacy.desc',
                'terms.privacy.link', 'terms.privacy.title', 'terms.prohibited.desc', 'terms.prohibited.item1', 'terms.prohibited.item2',
                'terms.prohibited.item3', 'terms.prohibited.item4', 'terms.prohibited.item5', 'terms.prohibited.item6', 'terms.prohibited.title',
                'terms.service.desc', 'terms.service.item1', 'terms.service.item2', 'terms.service.item3', 'terms.service.item4',
                'terms.service.item5', 'terms.service.title', 'terms.subtitle', 'terms.summary.commercial.desc', 'terms.summary.commercial.title',
                'terms.summary.free.desc', 'terms.summary.free.title', 'terms.summary.ownership.desc', 'terms.summary.ownership.title',
                'terms.summary.privacy.desc', 'terms.summary.privacy.title', 'terms.summary.title', 'terms.termination.desc',
                'terms.termination.title', 'terms.title',
                
                // BLOG section
                'blog.article1.desc', 'blog.article1.title', 'blog.article2.desc', 'blog.article2.title', 'blog.article3.desc',
                'blog.article3.title', 'blog.article4.desc', 'blog.article4.title', 'blog.beginner.advanced.desc', 'blog.beginner.advanced.dithering',
                'blog.beginner.advanced.grid', 'blog.beginner.advanced.scaling', 'blog.beginner.advanced.title', 'blog.beginner.closing',
                'blog.beginner.download.desc', 'blog.beginner.download.title', 'blog.beginner.intro', 'blog.beginner.palette.desc',
                'blog.beginner.palette.title', 'blog.beginner.pixel_size.desc', 'blog.beginner.pixel_size.experiment', 'blog.beginner.pixel_size.large',
                'blog.beginner.pixel_size.small', 'blog.beginner.pixel_size.title', 'blog.beginner.tips.community', 'blog.beginner.tips.experiment',
                'blog.beginner.tips.grid', 'blog.beginner.tips.resolution', 'blog.beginner.tips.title', 'blog.beginner.title',
                'blog.beginner.troubleshooting.connection', 'blog.beginner.troubleshooting.desc', 'blog.beginner.troubleshooting.format',
                'blog.beginner.troubleshooting.processing', 'blog.beginner.troubleshooting.title', 'blog.beginner.upload.desc',
                'blog.beginner.upload.formats', 'blog.beginner.upload.size', 'blog.beginner.upload.title', 'blog.dithering.balancing.desc',
                'blog.dithering.balancing.title', 'blog.dithering.closing', 'blog.dithering.floyd_steinberg.application',
                'blog.dithering.floyd_steinberg.benefits', 'blog.dithering.floyd_steinberg.desc', 'blog.dithering.floyd_steinberg.how_it_works',
                'blog.dithering.floyd_steinberg.title', 'blog.dithering.intro', 'blog.dithering.other_techniques.desc',
                'blog.dithering.other_techniques.ordered', 'blog.dithering.other_techniques.random', 'blog.dithering.other_techniques.title',
                'blog.dithering.tips.consider_palette', 'blog.dithering.tips.preview', 'blog.dithering.tips.subtle', 'blog.dithering.tips.title',
                'blog.dithering.title', 'blog.dithering.what_is.desc', 'blog.dithering.what_is.title', 'blog.minread',
                'blog.palette.advanced.desc', 'blog.palette.advanced.hue_shifting', 'blog.palette.advanced.limited', 'blog.palette.advanced.ramps',
                'blog.palette.advanced.title', 'blog.palette.closing', 'blog.palette.customizing.contextual', 'blog.palette.customizing.desc',
                'blog.palette.customizing.precomputation', 'blog.palette.customizing.title', 'blog.palette.harmony.analogous',
                'blog.palette.harmony.complementary', 'blog.palette.harmony.desc', 'blog.palette.harmony.monochromatic', 'blog.palette.harmony.title',
                'blog.palette.intro', 'blog.palette.tips.less_is_more', 'blog.palette.tips.study_masters', 'blog.palette.tips.test_canvas',
                'blog.palette.tips.title', 'blog.palette.title', 'blog.palette.understanding.desc', 'blog.palette.understanding.premium',
                'blog.palette.understanding.relationships', 'blog.palette.understanding.title', 'blog.readmore', 'blog.resampling.bilinear.cons',
                'blog.resampling.bilinear.desc', 'blog.resampling.bilinear.pros', 'blog.resampling.bilinear.title', 'blog.resampling.bilinear.when_to_use',
                'blog.resampling.choosing.desc', 'blog.resampling.choosing.title', 'blog.resampling.closing', 'blog.resampling.intro',
                'blog.resampling.lanczos.cons', 'blog.resampling.lanczos.desc', 'blog.resampling.lanczos.pros', 'blog.resampling.lanczos.title',
                'blog.resampling.lanczos.when_to_use', 'blog.resampling.nearest.cons', 'blog.resampling.nearest.desc', 'blog.resampling.nearest.pros',
                'blog.resampling.nearest.title', 'blog.resampling.nearest.when_to_use', 'blog.resampling.title', 'blog.resampling.understanding.desc',
                'blog.resampling.understanding.title', 'blog.subtitle', 'blog.title',
                
                // BRAND section
                'brand.name',
                
                // OTHER section  
                'about.contact.desc', 'about.contact.email', 'about.contact.title', 'about.mission.community.desc', 'about.mission.community.title',
                'about.mission.empowerment.desc', 'about.mission.empowerment.title', 'about.mission.innovation.desc', 'about.mission.innovation.title',
                'about.mission.privacy.desc', 'about.mission.privacy.title', 'about.mission.title', 'about.special.accuracy.desc',
                'about.special.accuracy.title', 'about.special.fast.desc', 'about.special.fast.title', 'about.special.global.desc',
                'about.special.global.title', 'about.special.title', 'about.story.p1', 'about.story.p2', 'about.story.title',
                'about.subtitle', 'about.title', 'advanced.dithering', 'advanced.grid', 'advanced.scaling', 'advanced.title',
                'loading', 'pixel.desc', 'pixel.size', 'scaling.bilinear', 'scaling.lanczos', 'scaling.nearest',
                'tools.analyzer.desc', 'tools.analyzer.title', 'tools.converter.desc', 'tools.converter.title', 'tools.generator.desc',
                'tools.generator.title', 'tools.palette.desc', 'tools.palette.title', 'tools.title', 'used.colors.free',
                'used.colors.premium', 'used.colors.title', 'used.colors.total'
            ];
            
            const essentialData = {};
            htmlUsedKeys.forEach(key => {
                if (langData[key]) {
                    essentialData[key] = langData[key];
                }
            });
            
            jsContent += `// ${lang.toUpperCase()} 翻译数据
window.__INLINE_I18N__.${lang} = ${JSON.stringify(essentialData, null, 2)};

`;
            
            console.log(`✅ 处理 ${lang}: ${Object.keys(essentialData).length} 个键`);
        } catch (error) {
            console.error(`❌ 处理 ${lang} 时出错:`, error.message);
        }
    }
    
    jsContent += `
// 日志输出
window.logger?.log('🚀 内联翻译数据已加载，支持语言:', Object.keys(window.__INLINE_I18N__));
window.logger?.log('📊 内联翻译统计:', Object.fromEntries(
    Object.entries(window.__INLINE_I18N__).map(([lang, data]) => [lang, Object.keys(data).length])
));`;

    // 写入文件
    fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
    console.log(`✅ 内联翻译文件已生成: ${OUTPUT_FILE}`);
    console.log(`📁 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
}

// 如果直接运行此脚本
if (require.main === module) {
    generateInlineTranslations();
}

module.exports = { generateInlineTranslations };