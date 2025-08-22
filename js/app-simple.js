// Wplace Pixel Art Converter - 简化版本
// 无ES模块依赖，直接可用

console.log('🎨 Wplace 像素画转换器 - 简化版本加载中...');

// 全局变量
let currentImage = null;
let processedImage = null;
let isProcessing = false;
let batchQueue = [];
let batchResults = [];

// 多语言全局变量
let currentLanguage = 'zh';
let translations = {};

// 内置翻译数据 - 避免CORS问题
const BUILTIN_TRANSLATIONS = {
    'zh': {
        "title": "PixelCraft 像素艺术生成器 | 将图像转换为像素艺术",
        "subtitle": "专业的像素艺术生成工具，几秒钟内将任何图像转换为惊艳的像素艺术。我们的免费在线工具自动匹配兼容 Wplace 的 64 色调色板，为您提供专业效果。",
        "nav.home": "首页",
        "nav.blog": "博客", 
        "nav.about": "关于",
        "nav.privacy": "隐私政策",
        "nav.terms": "服务条款",
        "upload.main": "点击上传或拖拽图片至此",
        "upload.sub": "支持 PNG, JPG 格式（最大 4MB）",
        "pixel.size": "像素尺寸",
        "pixel.desc": "调整滑块时自动转换",
        "advanced.title": "高级设置",
        "advanced.dithering": "启用 Floyd-Steinberg 抖动算法",
        "advanced.scaling": "图像缩放方式：",
        "advanced.grid": "显示像素网格",
        "scaling.nearest": "最近邻插值",
        "scaling.bilinear": "双线性插值",
        "scaling.lanczos": "Lanczos 算法",
        "preview.title": "Wplace 像素画预览",
        "preview.prompt": "请上传一张图片开始",
        "btn.download": "下载",
        "loading": "处理中...",
        "used.colors.title": "此图像使用的颜色",
        "used.colors.total": "总计",
        "used.colors.free": "免费",
        "used.colors.premium": "付费",
        "palette.title": "64 色调色板",
        "palette.free": "免费 (32)",
        "palette.premium": "付费 (32)",
        "palette.info": "兼容 Wplace 调色板",
        "features.special.title": "什么让我们的 Wplace 图像转换器特别？",
        "howto.step1.title": "调整像素大小",
        "howto.step1.desc": "使用滑块控制像素大小。较小的值创建更详细的艺术，较大的值产生块状的抽象像素艺术。",
        "howto.step2.title": "转换为像素艺术",
        "howto.step2.desc": "观看您的图像使用我们的先进转换器技术转换为令人惊艳的像素艺术。实时预览更新。",
        "features.unlimited.desc": "上传任意尺寸的图片。Wplace 像素艺术转换器高效处理一切。",
        "howto.step4.desc": "选择像素完美或大尺寸版本。您的 Wplace 像素艺术已准备就绪！",
        "faq.a6": "是的！使用 Wplace 像素艺术转换器创作的艺术品您可以自由用于个人或商业项目。我们对您的创作不主张任何所有权。",
        "testimonials.q6": "清晰的预览和一键下载为我提供了干净的参考。我只需打开 Wplace 然后绘画——无需猜测。",
        "footer.main": "© 2025 Wplace 像素艺术转换器 - 免费使用，对生成的艺术品不主张所有权",
        "footer.privacy": "客户端处理保护您的隐私",
        "progress.highPerformance": "使用高性能模式处理",
        "progress.nearlyFinished": "即将完成",
        "progress.almostThere": "马上就好",
        "language.switched": "语言已切换"
    },
    
    'en': {
        "title": "Wplace Paint Tool: The Ultimate Pixel Toolkit to Dominate the Canvas",
        "subtitle": "Designed for creative players on wplace.live, this ultimate toolkit lets you dominate the canvas with ease.",
        "nav.home": "Home",
        "nav.blog": "Blog",
        "nav.about": "About",
        "nav.privacy": "Privacy Policy",
        "nav.terms": "Terms of Service",
        "upload.main": "Click to upload or drag image here",
        "upload.sub": "Supports PNG, JPG formats (Max 4MB)",
        "pixel.size": "Pixel Size",
        "pixel.desc": "Auto-converts as you adjust slider",
        "advanced.title": "Advanced Settings",
        "advanced.dithering": "Enable Floyd-Steinberg Dithering",
        "advanced.scaling": "Image Scaling Method:",
        "advanced.grid": "Show Pixel Grid",
        "scaling.nearest": "Nearest Neighbor",
        "scaling.bilinear": "Bilinear",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Wplace Pixel Paint Preview",
        "preview.prompt": "Please upload an image to start",
        "btn.download": "Download",
        "loading": "Processing...",
        "used.colors.title": "Colors Used in This Image",
        "used.colors.total": "Total",
        "used.colors.free": "Free",
        "used.colors.premium": "Premium",
        "palette.title": "64-Color Palette",
        "palette.free": "Free (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Wplace Compatible Palette",
        "features.unlimited.desc": "Upload any size image. Our Wplace pixel art converter handles everything efficiently.",
        "howto.step4.desc": "Choose pixel-perfect or large-scale version. Your Wplace pixel art is ready!",
        "faq.a6": "Yes! Artwork created with our Wplace pixel art converter is yours to use freely for personal or commercial projects. We claim no ownership of your creations.",
        "testimonials.q6": "Clean previews and one-click downloads give me perfect references. I just open Wplace and paint - no guesswork needed.",
        "footer.main": "© 2025 Wplace Pixel Art Converter - Free to use, no ownership claimed on generated artwork",
        "footer.privacy": "Client-side processing protects your privacy",
        "progress.highPerformance": "Processing with high-performance mode",
        "features.special.title": "What Makes Our Wplace Tool Special?",
        "howto.step1.title": "Adjust Pixel Size",
        "howto.step1.desc": "Use the slider to control the pixel size. Smaller values create more detailed art, larger values produce chunky, abstract pixel art.",
        "howto.step2.title": "Convert to Pixel Art",
        "howto.step2.desc": "Watch your image transform into stunning pixel art using our advanced converter technology. Preview updates in real-time.",
        "language.switched": "Language switched"
    },
    
    'fr': {
        "title": "Convertisseur Art Pixel Wplace | Convertir Images en Art Pixel",
        "subtitle": "Le convertisseur d'art pixel Wplace ultime qui transforme n'importe quelle image en art pixel époustouflant en quelques secondes.",
        "nav.home": "Accueil",
        "nav.blog": "Blog",
        "nav.about": "À propos",
        "nav.privacy": "Confidentialité",
        "nav.terms": "Conditions",
        "upload.main": "Cliquez pour télécharger ou glissez l'image ici",
        "upload.sub": "Supporte PNG, JPG (Max 4MB)",
        "pixel.size": "Taille Pixel",
        "pixel.desc": "Conversion automatique en ajustant le curseur",
        "advanced.title": "Paramètres Avancés",
        "advanced.dithering": "Activer le tramage Floyd-Steinberg",
        "advanced.scaling": "Méthode de mise à l'échelle:",
        "advanced.grid": "Afficher la grille de pixels",
        "scaling.nearest": "Plus proche voisin",
        "scaling.bilinear": "Bilinéaire",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Aperçu Wplace Pixel Paint",
        "preview.prompt": "Veuillez télécharger une image pour commencer",
        "btn.download": "Télécharger",
        "loading": "Traitement...",
        "used.colors.title": "Couleurs utilisées dans cette image",
        "used.colors.total": "Total",
        "used.colors.free": "Gratuit",
        "used.colors.premium": "Premium",
        "palette.title": "Palette 64 couleurs Wplace",
        "palette.free": "Gratuit (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Palette officielle Wplace",
        "features.unlimited.desc": "Téléchargez une image de n'importe quelle taille. Notre convertisseur d'art pixel Wplace gère tout efficacement.",
        "howto.step4.desc": "Choisissez une version pixel-parfaite ou grande échelle. Votre art pixel Wplace est prêt!",
        "faq.a6": "Oui! Les œuvres d'art créées avec notre convertisseur d'art pixel Wplace sont les vôtres à utiliser librement pour des projets personnels ou commerciaux. Nous ne revendiquons aucune propriété sur vos créations.",
        "testimonials.q6": "Des aperçus clairs et des téléchargements en un clic me donnent des références parfaites. J'ouvre juste Wplace et je peins - pas de devinettes nécessaires.",
        "footer.main": "© 2025 Convertisseur Art Pixel Wplace - Libre d'utilisation, aucune propriété revendiquée sur les œuvres générées",
        "footer.privacy": "Le traitement côté client protège votre vie privée",
        "progress.highPerformance": "Traitement en mode haute performance",
        "features.special.title": "Qu'est-ce qui rend notre outil Wplace spécial?",
        "howto.step1.title": "Ajuster la taille des pixels",
        "howto.step2.title": "Convertir en art pixel",
        "language.switched": "Langue changée"
    },
    
    'es': {
        "title": "Convertidor Arte Pixel Wplace | Convertir Imágenes a Arte Pixel",
        "subtitle": "El convertidor de arte pixel Wplace definitivo que transforma cualquier imagen en arte pixel impresionante en segundos.",
        "nav.home": "Inicio",
        "nav.blog": "Blog",
        "nav.about": "Acerca de",
        "nav.privacy": "Privacidad",
        "nav.terms": "Términos",
        "upload.main": "Haz clic para subir o arrastra la imagen aquí",
        "upload.sub": "Soporta PNG, JPG (Máx 4MB)",
        "pixel.size": "Tamaño Pixel",
        "pixel.desc": "Auto-convierte al ajustar el deslizador",
        "advanced.title": "Configuración Avanzada",
        "advanced.dithering": "Habilitar difuminado Floyd-Steinberg",
        "advanced.scaling": "Método de escalado de imagen:",
        "advanced.grid": "Mostrar cuadrícula de píxeles",
        "scaling.nearest": "Vecino más cercano",
        "scaling.bilinear": "Bilineal",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Vista previa Wplace Pixel Paint",
        "preview.prompt": "Por favor sube una imagen para comenzar",
        "btn.download": "Descargar",
        "loading": "Procesando...",
        "used.colors.title": "Colores usados en esta imagen",
        "used.colors.total": "Total",
        "used.colors.free": "Gratis",
        "used.colors.premium": "Premium",
        "palette.title": "Paleta 64 colores Wplace",
        "palette.free": "Gratis (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Paleta oficial Wplace",
        "features.unlimited.desc": "Sube una imagen de cualquier tamaño. Nuestro convertidor de arte pixel Wplace maneja todo eficientemente.",
        "howto.step4.desc": "Elige versión pixel-perfecta o gran escala. ¡Tu arte pixel Wplace está listo!",
        "faq.a6": "¡Sí! Las obras de arte creadas con nuestro convertidor de arte pixel Wplace son tuyas para usar libremente en proyectos personales o comerciales. No reclamamos ninguna propiedad sobre tus creaciones.",
        "testimonials.q6": "Las vistas previas claras y descargas de un clic me dan referencias perfectas. Solo abro Wplace y pinto - no necesito adivinar.",
        "footer.main": "© 2025 Convertidor Arte Pixel Wplace - Libre de usar, no se reclama propiedad sobre las obras generadas",
        "footer.privacy": "El procesamiento del lado del cliente protege tu privacidad",
        "progress.highPerformance": "Procesando con modo de alto rendimiento",
        "features.special.title": "¿Qué hace especial nuestra herramienta Wplace?",
        "howto.step1.title": "Ajustar tamaño de píxel",
        "howto.step2.title": "Convertir a arte píxel",
        "language.switched": "Idioma cambiado"
    },
    
    'de': {
        "title": "Wplace Pixel Art Konverter | Bilder zu Pixel Art konvertieren",
        "subtitle": "Der ultimative Wplace Pixel Art Konverter, der jedes Bild in Sekunden in beeindruckende Pixel Art verwandelt.",
        "nav.home": "Startseite",
        "nav.blog": "Blog",
        "nav.about": "Über uns",
        "nav.privacy": "Datenschutz",
        "nav.terms": "Nutzungsbedingungen",
        "upload.main": "Klicken Sie zum Hochladen oder ziehen Sie das Bild hierher",
        "upload.sub": "Unterstützt PNG, JPG-Formate (Max 4MB)",
        "pixel.size": "Pixelgröße",
        "pixel.desc": "Automatische Konvertierung beim Anpassen des Schiebereglers",
        "advanced.title": "Erweiterte Einstellungen",
        "advanced.dithering": "Floyd-Steinberg-Dithering aktivieren",
        "advanced.scaling": "Bildskalierungsmethode:",
        "advanced.grid": "Pixelraster anzeigen",
        "scaling.nearest": "Nächster Nachbar",
        "scaling.bilinear": "Bilinear",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Wplace Pixel Paint Ergebnis",
        "preview.prompt": "Bitte laden Sie ein Bild hoch, um zu beginnen",
        "btn.download": "Herunterladen",
        "loading": "Verarbeitung...",
        "used.colors.title": "In diesem Bild verwendete Farben",
        "used.colors.total": "Gesamt",
        "used.colors.free": "Kostenlos",
        "used.colors.premium": "Premium",
        "palette.title": "Wplace 64-Farben-Palette",
        "palette.free": "Kostenlos (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Offizielle Wplace-Farbpalette",
        "features.unlimited.desc": "Laden Sie ein Bild beliebiger Größe hoch. Unser Wplace Pixel Art Konverter bewältigt alles effizient.",
        "howto.step4.desc": "Wählen Sie die pixel-perfekte oder großformatige Version. Ihre Wplace Pixel Art ist bereit!",
        "faq.a6": "Ja! Mit unserem Wplace Pixel Art Konverter erstellte Kunstwerke gehören Ihnen zur freien Nutzung für persönliche oder kommerzielle Projekte. Wir beanspruchen kein Eigentum an Ihren Kreationen.",
        "testimonials.q6": "Klare Vorschauen und Ein-Klick-Downloads geben mir perfekte Referenzen. Ich öffne einfach Wplace und male - kein Rätselraten nötig.",
        "footer.main": "© 2025 Wplace Pixel Art Konverter - Kostenlos zu verwenden, kein Eigentumsanspruch auf generierte Kunstwerke",
        "footer.privacy": "Client-seitige Verarbeitung schützt Ihre Privatsphäre",
        "progress.highPerformance": "Verarbeitung im Hochleistungsmodus",
        "features.special.title": "Was macht unser Wplace-Tool besonders?",
        "howto.step1.title": "Pixelgröße anpassen",
        "howto.step2.title": "In Pixel Art konvertieren",
        "language.switched": "Sprache gewechselt"
    },
    
    'ja': {
        "title": "Wplace ピクセルアート変換器 | 画像をピクセルアートに変換",
        "subtitle": "あらゆる画像を数秒で素晴らしいピクセルアートに変換する究極のWplaceピクセルアート変換器。",
        "nav.home": "ホーム",
        "nav.blog": "ブログ",
        "nav.about": "概要",
        "nav.privacy": "プライバシー",
        "nav.terms": "利用規約",
        "upload.main": "クリックしてアップロードするか、画像をここにドラッグ",
        "upload.sub": "PNG、JPGフォーマットをサポート（最大4MB）",
        "pixel.size": "ピクセルサイズ",
        "pixel.desc": "スライダーを調整すると自動変換",
        "advanced.title": "詳細設定",
        "advanced.dithering": "Floyd-Steinbergディザリングを有効にする",
        "advanced.scaling": "画像スケーリング方法：",
        "advanced.grid": "ピクセルグリッドを表示",
        "scaling.nearest": "最近傍補間",
        "scaling.bilinear": "バイリニア",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Wplaceピクセルペイント結果",
        "preview.prompt": "開始するには画像をアップロードしてください",
        "btn.download": "ダウンロード",
        "loading": "処理中...",
        "used.colors.title": "この画像で使用された色",
        "used.colors.total": "合計",
        "used.colors.free": "無料",
        "used.colors.premium": "プレミアム",
        "palette.title": "Wplace 64色パレット",
        "palette.free": "無料 (32)",
        "palette.premium": "プレミアム (32)",
        "palette.info": "公式Wplaceカラーパレット",
        "features.unlimited.desc": "任意のサイズの画像をアップロード。Wplaceピクセルアートコンバーターがすべてを効率的に処理します。",
        "howto.step4.desc": "ピクセルパーフェクトまたは大型スケール版を選択。Wplaceピクセルアートの準備完了！",
        "faq.a6": "はい！Wplaceピクセルアートコンバーターで作成したアートワークは、個人または商業プロジェクトで自由にご利用いただけます。お客様の作品の所有権を主張することはありません。",
        "testimonials.q6": "クリアなプレビューとワンクリックダウンロードで完璧な参考資料を提供。Wplaceを開いてペイントするだけ - 推測の必要はありません。",
        "footer.main": "© 2025 Wplaceピクセルアートコンバーター - 無料でご利用いただけ、生成されたアートワークの所有権は主張しません",
        "footer.privacy": "クライアントサイド処理でプライバシーを保護",
        "progress.highPerformance": "高性能モードで処理中",
        "features.special.title": "Wplaceツールの特別な点は何ですか？",
        "howto.step1.title": "ピクセルサイズを調整",
        "howto.step1.desc": "スライダーを使用してピクセルサイズを制御します。小さい値はより詳細なアートを作成し、大きい値は塊状で抽象的なピクセルアートを生成します。",
        "howto.step2.title": "ピクセルアートに変換",
        "howto.step2.desc": "私たちの高度なコンバーター技術を使用して、画像が素晴らしいピクセルアートに変換される様子をご覧ください。プレビューはリアルタイムで更新されます。",
        "language.switched": "言語が切り替わりました"
    },
    
    'pt': {
        "title": "Conversor de Arte Pixel Wplace | Converter Imagens em Arte Pixel",
        "subtitle": "O conversor de arte pixel Wplace definitivo que transforma qualquer imagem em arte pixel impressionante em segundos.",
        "nav.home": "Início",
        "nav.blog": "Blog",
        "nav.about": "Sobre",
        "nav.privacy": "Privacidade",
        "nav.terms": "Termos",
        "upload.main": "Clique para enviar ou arraste a imagem aqui",
        "upload.sub": "Suporta PNG, JPG (Máx 4MB)",
        "pixel.size": "Tamanho do Pixel",
        "pixel.desc": "Converte automaticamente ao ajustar o controle deslizante",
        "advanced.title": "Configurações Avançadas",
        "advanced.dithering": "Ativar pontilhamento Floyd-Steinberg",
        "advanced.scaling": "Método de redimensionamento de imagem:",
        "advanced.grid": "Mostrar grade de pixels",
        "scaling.nearest": "Vizinho mais próximo",
        "scaling.bilinear": "Bilinear",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Visualização Wplace Pixel Paint",
        "preview.prompt": "Por favor, envie uma imagem para começar",
        "btn.download": "Baixar",
        "loading": "Processando...",
        "used.colors.title": "Cores usadas nesta imagem",
        "used.colors.total": "Total",
        "used.colors.free": "Grátis",
        "used.colors.premium": "Premium",
        "palette.title": "Paleta de 64 cores Wplace",
        "palette.free": "Grátis (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Paleta oficial Wplace",
        "features.unlimited.desc": "Carregue uma imagem de qualquer tamanho. Nosso conversor de arte pixel Wplace lida com tudo eficientemente.",
        "howto.step4.desc": "Escolha a versão pixel-perfeita ou em grande escala. Sua arte pixel Wplace está pronta!",
        "faq.a6": "Sim! As obras de arte criadas com nosso conversor de arte pixel Wplace são suas para usar livremente em projetos pessoais ou comerciais. Não reivindicamos propriedade sobre suas criações.",
        "testimonials.q6": "Visualizações claras e downloads com um clique me dão referências perfeitas. Apenas abro o Wplace e pinto - sem necessidade de adivinhar.",
        "footer.main": "© 2025 Conversor de Arte Pixel Wplace - Livre para usar, nenhuma propriedade reivindicada sobre as obras geradas",
        "footer.privacy": "Processamento do lado do cliente protege sua privacidade",
        "progress.highPerformance": "Processando com modo de alta performance",
        "features.special.title": "O que torna nossa ferramenta Wplace especial?",
        "howto.step1.title": "Ajustar tamanho do pixel",
        "howto.step2.title": "Converter para arte pixel",
        "language.switched": "Idioma alterado"
    },
    
    'th': {
        "title": "เครื่องมือแปลงภาพเป็นพิกเซลอาร์ต Wplace | แปลงภาพเป็นพิกเซลอาร์ต",
        "subtitle": "เครื่องมือแปลงพิกเซลอาร์ต Wplace ที่สมบูรณ์แบบที่สามารถแปลงภาพใดๆ เป็นพิกเซลอาร์ตที่น่าทึ่งในไม่กี่วินาที",
        "nav.home": "หน้าแรก",
        "nav.blog": "บล็อก",
        "nav.about": "เกี่ยวกับ",
        "nav.privacy": "ความเป็นส่วนตัว",
        "nav.terms": "เงื่อนไข",
        "upload.main": "คลิกเพื่ออัปโหลดหรือลากภาพมาที่นี่",
        "upload.sub": "รองรับ PNG, JPG (สูงสุด 4MB)",
        "pixel.size": "ขนาดพิกเซล",
        "pixel.desc": "แปลงอัตโนมัติเมื่อปรับแถบเลื่อน",
        "advanced.title": "การตั้งค่าขั้นสูง",
        "advanced.dithering": "เปิดใช้งาน Floyd-Steinberg Dithering",
        "advanced.scaling": "วิธีการปรับขนาดภาพ:",
        "advanced.grid": "แสดงกริดพิกเซล",
        "scaling.nearest": "เพื่อนบ้านที่ใกล้ที่สุด",
        "scaling.bilinear": "ไบลิเนียร์",
        "scaling.lanczos": "Lanczos",
        "preview.title": "ตัวอย่าง Wplace Pixel Paint",
        "preview.prompt": "กรุณาอัปโหลดภาพเพื่อเริ่มต้น",
        "btn.download": "ดาวน์โหลด",
        "loading": "กำลังประมวลผล...",
        "used.colors.title": "สีที่ใช้ในภาพนี้",
        "used.colors.total": "รวม",
        "used.colors.free": "ฟรี",
        "used.colors.premium": "พรีเมียม",
        "palette.title": "พาเลต 64 สี Wplace",
        "palette.free": "ฟรี (32)",
        "palette.premium": "พรีเมียม (32)",
        "palette.info": "พาเลตสีอย่างเป็นทางการ Wplace",
        "features.unlimited.desc": "อัปโหลดภาพขนาดใดก็ได้ เครื่องมือแปลงพิกเซลอาร์ต Wplace ของเราจัดการทุกอย่างอย่างมีประสิทธิภาพ",
        "howto.step4.desc": "เลือกเวอร์ชันพิกเซลที่สมบูรณ์แบบหรือขนาดใหญ่ พิกเซลอาร์ต Wplace ของคุณพร้อมแล้ว!",
        "faq.a6": "ใช่! งานศิลปะที่สร้างด้วยเครื่องมือแปลงพิกเซลอาร์ต Wplace ของเราเป็นของคุณที่จะใช้ได้อย่างอิสระสำหรับโครงการส่วนตัวหรือเชิงพาณิชย์ เราไม่อ้างสิทธิ์ในงานสร้างสรรค์ของคุณ",
        "testimonials.q6": "การแสดงตัวอย่างที่ชัดเจนและการดาวน์โหลดด้วยคลิกเดียวให้ข้อมูลอ้างอิงที่สมบูรณ์แบบแก่ฉัน ฉันแค่เปิด Wplace และระบายสี - ไม่จำเป็นต้องเดา",
        "footer.main": "© 2025 เครื่องมือแปลงพิกเซลอาร์ต Wplace - ใช้งานฟรี ไม่อ้างสิทธิ์ในงานศิลปะที่สร้างขึ้น",
        "footer.privacy": "การประมวลผลฝั่งไคลเอ็นต์ปกป้องความเป็นส่วนตัวของคุณ",
        "progress.highPerformance": "กำลังประมวลผลด้วยโหมดประสิทธิภาพสูง",
        "features.special.title": "อะไรที่ทำให้เครื่องมือ Wplace ของเราพิเศษ?",
        "howto.step1.title": "ปรับขนาดพิกเซล",
        "howto.step2.title": "แปลงเป็นพิกเซลอาร์ต",
        "language.switched": "เปลี่ยนภาษาแล้ว"
    },
    
    'mi': {
        "title": "Wplace Pixel Art Tawhiri | Huringa Whakaahua ki Pixel Art",
        "subtitle": "Te tawhiri pixel art Wplace mutunga rawa e huringa ai tetahi whakaahua ki te pixel art atahua i roto i nga hekona.",
        "nav.home": "Kāinga",
        "nav.blog": "Purongo",
        "nav.about": "Mō",
        "nav.privacy": "Taupua",
        "nav.terms": "Ritenga",
        "upload.main": "Pāwhiri hei tikiake rānei whakakino te whakaahua ki konei",
        "upload.sub": "Tautoko PNG, JPG (Mutunga 4MB)",
        "pixel.size": "Rahi Pixel",
        "pixel.desc": "Huringa aunoa i a koe ka whakakā i te whakakino",
        "advanced.title": "Tautuhinga Matatau",
        "advanced.dithering": "Whakangāwari Floyd-Steinberg Dithering",
        "advanced.scaling": "Tikanga Whakanui Whakaahua:",
        "advanced.grid": "Whakaatu Grid Pixel",
        "scaling.nearest": "Hoa Tata",
        "scaling.bilinear": "Bilinear",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Whakaatu Wplace Pixel Paint",
        "preview.prompt": "Tēnā koa tikiake he whakaahua kia tīmata",
        "btn.download": "Tikiake",
        "loading": "E mahi ana...",
        "used.colors.title": "Ngā tae i whakamahia i tēnei whakaahua",
        "used.colors.total": "Tapeke",
        "used.colors.free": "Kore utu",
        "used.colors.premium": "Premium",
        "palette.title": "Wplace 64-tae Palette",
        "palette.free": "Kore utu (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Wplace Palette ōkawa",
        "features.unlimited.desc": "Tikiake he whakaahua rahi katoa. Tō mātou Wplace pixel art tawhiri e whakahaere ana i ngā mea katoa haumāmā.",
        "howto.step4.desc": "Whiriwhiri i te pixel-tika rānei i te putanga nui rānei. Tō Wplace pixel art kua reri!",
        "faq.a6": "Ae! Ko ngā toi i hangaia e tō mātou Wplace pixel art tawhiri he mea māu hei whakamahi kore utu mō ngā kaupapa whaiaro rānei rānei rawa. Kāore mātou e whakatau tiketike ki ō hanga.",
        "testimonials.q6": "He mārama ngā arokite me ngā tango-pāwhiri kotahi hei whakawhanui tohutoro pai ki a au. Me whakatuwhera noa a Wplace me te peita - kāore he mate whakaaroa.",
        "footer.main": "© 2025 Wplace Pixel Art Tawhiri - Kore utu hei whakamahi, kāore he tiketike i whakaarotia ki ngā toi i whakaputa",
        "footer.privacy": "Te whakatutuki-kiritaki ka tiaki i tō taupua",
        "progress.highPerformance": "E whakahaere ana i te āhua mahi teitei",
        "features.special.title": "He aha a mātou taputapu Wplace rerekē?",
        "howto.step1.title": "Whakakore Pixel Rahi",
        "howto.step2.title": "Huringa ki Pixel Toi",
        "language.switched": "Reo huringa"
    },
    
    'tr': {
        "title": "Wplace Piksel Sanatı Dönüştürücü | Resimleri Piksel Sanatına Dönüştür",
        "subtitle": "Herhangi bir resmi saniyeler içinde çarpıcı piksel sanatına dönüştüren nihai Wplace piksel sanatı dönüştürücü.",
        "nav.home": "Ana Sayfa",
        "nav.blog": "Blog",
        "nav.about": "Hakkında",
        "nav.privacy": "Gizlilik",
        "nav.terms": "Şartlar",
        "upload.main": "Yüklemek için tıklayın veya resmi buraya sürükleyin",
        "upload.sub": "PNG, JPG destekler (Maks 4MB)",
        "pixel.size": "Piksel Boyutu",
        "pixel.desc": "Kaydırıcıyı ayarlarken otomatik dönüştürür",
        "advanced.title": "Gelişmiş Ayarlar",
        "advanced.dithering": "Floyd-Steinberg Titreşimi etkinleştir",
        "advanced.scaling": "Resim Ölçekleme Yöntemi:",
        "advanced.grid": "Piksel Izgarasını Göster",
        "scaling.nearest": "En Yakın Komşu",
        "scaling.bilinear": "Bilinear",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Wplace Piksel Boyama Önizlemesi",
        "preview.prompt": "Başlamak için lütfen bir resim yükleyin",
        "btn.download": "İndir",
        "loading": "İşleniyor...",
        "used.colors.title": "Bu resimde kullanılan renkler",
        "used.colors.total": "Toplam",
        "used.colors.free": "Ücretsiz",
        "used.colors.premium": "Premium",
        "palette.title": "Wplace 64-Renk Paleti",
        "palette.free": "Ücretsiz (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Resmi Wplace Renk Paleti",
        "features.unlimited.desc": "Herhangi bir boyutta resim yükleyin. Wplace piksel sanat dönüştürücümüz her şeyi verimli bir şekilde işler.",
        "howto.step4.desc": "Piksel-mükemmel veya büyük ölçekli sürümü seçin. Wplace piksel sanatınız hazır!",
        "faq.a6": "Evet! Wplace piksel sanat dönüştürücümüz ile oluşturulan sanat eserleri kişisel veya ticari projeler için özgürce kullanmanıza aittir. Yaratımlarınızda hiçbir mülkiyet hakkı iddia etmiyoruz.",
        "testimonials.q6": "Temiz önizlemeler ve tek tıkla indirmeler bana mükemmel referanslar veriyor. Sadece Wplace'i açıp boyuyorum - tahmine gerek yok.",
        "footer.main": "© 2025 Wplace Piksel Sanat Dönüştürücü - Kullanmak ücretsiz, üretilen sanat eserlerinde mülkiyet hakkı iddia edilmez",
        "footer.privacy": "İstemci tarafı işleme gizliliğinizi korur",
        "progress.highPerformance": "Yüksek performans moduyla işleniyor",
        "features.special.title": "Wplace aracımızı özel yapan nedir?",
        "howto.step1.title": "Piksel boyutunu ayarla",
        "howto.step2.title": "Piksel sanatına dönüştür",
        "language.switched": "Dil değiştirildi"
    },
    
    'gn': {
        "title": "Wplace Pixel Art Moambue | Moambue ta'anga Pixel Art-pe",
        "subtitle": "Wplace pixel art moambue ipyahuvéva omoambuéva oimeraẽ ta'anga pixel art porãitépe aravo'i mboyve.",
        "nav.home": "Ñepyrũ",
        "nav.blog": "Blog",
        "nav.about": "Rehegua",
        "nav.privacy": "Ñemiguáva",
        "nav.terms": "Ñemboguata",
        "upload.main": "Ejesareko ehupi térã embojere ta'anga ko'ápe",
        "upload.sub": "Oipytyvõ PNG, JPG (Máx 4MB)",
        "pixel.size": "Pixel Tuichakue",
        "pixel.desc": "Oñemoambue ijeheguiete reñembopyahu jave slider",
        "advanced.title": "Ñemboheko Aranduvéva",
        "advanced.dithering": "Emyendy Floyd-Steinberg Dithering",
        "advanced.scaling": "Ta'anga Ñembotuicha Mba'éichapa:",
        "advanced.grid": "Ehechauka Pixel Grid",
        "scaling.nearest": "Tovaicha Oîva",
        "scaling.bilinear": "Bilinear",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Wplace Pixel Paint Jehechauka",
        "preview.prompt": "Ikatúpiko embojepy peteĩ ta'anga eñepyrũ hag̃ua",
        "btn.download": "Emboguejy",
        "loading": "Oñembosako'i...",
        "used.colors.title": "Sa'y ojepuru ko ta'ángape",
        "used.colors.total": "Opavave",
        "used.colors.free": "Reiguáva",
        "used.colors.premium": "Premium",
        "palette.title": "Wplace 64-sa'y Paleta",
        "palette.free": "Reiguáva (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Wplace Sa'y Paleta Oficial",
        "features.unlimited.desc": "Embojepy peteĩ ta'anga oimeraẽva tuichakue. Ore Wplace pixel art moambue omba'apo katupyry katua.",
        "howto.step4.desc": "Eiporavo pixel-porã térã tuichakue versión. Nde Wplace pixel art oĩmbáma!",
        "faq.a6": "Héehe! Umi tembiapo ojejapo ore Wplace pixel art moambuére ndehegua ojepuru hag̃ua libre proyectos personales térã comerciales. Ndoreivindicakuái mbaevérã nde rembiapo rehe.",
        "testimonials.q6": "Jehecha porã ha mboguejy peteĩ jekutúpe ome'ẽ chéve referencia porã. Aipe'a Wplace ha amboesarai - natekotevẽi aikuaase'ỹ.",
        "footer.main": "© 2025 Wplace Pixel Art Moambue - Reiguáva ojepuru hag̃ua, natekotevẽi ñemandaje umi tembiapo ojejapo rehe",
        "footer.privacy": "Ñembosako'i ñemuhára rekove oñangareko nde ñemiguávare",
        "progress.highPerformance": "Oñembosako'i katupyry yvate rógape",
        "features.special.title": "Mba'épa ojapo ore Wplace rembipuru iporeve?",
        "howto.step1.title": "Emoambue Pixel Tuichakue",
        "howto.step2.title": "Emoambue Pixel Art-pe",
        "language.switched": "Ñe'ẽ oñemoambue"
    },
    
    'vi': {
        "title": "Bộ Chuyển Đổi Pixel Art Wplace | Chuyển Đổi Hình Ảnh Thành Pixel Art",
        "subtitle": "Bộ chuyển đổi pixel art Wplace tối ưu biến đổi bất kỳ hình ảnh nào thành pixel art tuyệt đẹp trong vài giây.",
        "nav.home": "Trang Chủ",
        "nav.blog": "Blog",
        "nav.about": "Giới Thiệu",
        "nav.privacy": "Quyền Riêng Tư",
        "nav.terms": "Điều Khoản",
        "upload.main": "Nhấp để tải lên hoặc kéo hình ảnh vào đây",
        "upload.sub": "Hỗ trợ PNG, JPG (Tối đa 4MB)",
        "pixel.size": "Kích Thước Pixel",
        "pixel.desc": "Tự động chuyển đổi khi bạn điều chỉnh thanh trượt",
        "advanced.title": "Cài Đặt Nâng Cao",
        "advanced.dithering": "Bật Floyd-Steinberg Dithering",
        "advanced.scaling": "Phương Pháp Chia Tỷ Lệ Hình Ảnh:",
        "advanced.grid": "Hiển Thị Lưới Pixel",
        "scaling.nearest": "Láng Giềng Gần Nhất",
        "scaling.bilinear": "Song Tuyến",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Xem Trước Wplace Pixel Paint",
        "preview.prompt": "Vui lòng tải lên một hình ảnh để bắt đầu",
        "btn.download": "Tải Xuống",
        "loading": "Đang xử lý...",
        "used.colors.title": "Màu được sử dụng trong hình ảnh này",
        "used.colors.total": "Tổng",
        "used.colors.free": "Miễn Phí",
        "used.colors.premium": "Cao Cấp",
        "palette.title": "Bảng Màu 64 Màu Wplace",
        "palette.free": "Miễn Phí (32)",
        "palette.premium": "Cao Cấp (32)",
        "palette.info": "Bảng Màu Chính Thức Wplace",
        "features.unlimited.desc": "Tải lên hình ảnh có kích thước bất kỳ. Bộ chuyển đổi pixel art Wplace của chúng tôi xử lý mọi thứ một cách hiệu quả.",
        "howto.step4.desc": "Chọn phiên bản pixel-hoàn hảo hoặc quy mô lớn. Pixel art Wplace của bạn đã sẵn sàng!",
        "faq.a6": "Có! Các tác phẩm nghệ thuật được tạo bằng bộ chuyển đổi pixel art Wplace của chúng tôi là của bạn để sử dụng tự do cho các dự án cá nhân hoặc thương mại. Chúng tôi không tuyên bố quyền sở hữu đối với các sáng tạo của bạn.",
        "testimonials.q6": "Xem trước rõ ràng và tải xuống một cú nhấp chuột cho tôi những tham chiếu hoàn hảo. Tôi chỉ cần mở Wplace và vẽ - không cần đoán.",
        "footer.main": "© 2025 Bộ Chuyển Đổi Pixel Art Wplace - Miễn phí sử dụng, không tuyên bố quyền sở hữu đối với tác phẩm nghệ thuật được tạo ra",
        "footer.privacy": "Xử lý phía máy khách bảo vệ quyền riêng tư của bạn",
        "progress.highPerformance": "Đang xử lý với chế độ hiệu suất cao",
        "features.special.title": "Điều gì làm cho công cụ Wplace của chúng tôi đặc biệt?",
        "howto.step1.title": "Chuyển đổi kích thước pixel",
        "howto.step2.title": "Chuyển đổi thành pixel art",
        "language.switched": "Đã chuyển đổi ngôn ngữ"
    },
    
    'pl': {
        "title": "Konwerter Pixel Art Wplace | Konwertuj Obrazy na Pixel Art",
        "subtitle": "Najlepszy konwerter pixel art Wplace, który przekształca dowolny obraz w oszałamiający pixel art w kilka sekund.",
        "nav.home": "Strona Główna",
        "nav.blog": "Blog",
        "nav.about": "O Nas",
        "nav.privacy": "Prywatność",
        "nav.terms": "Warunki",
        "upload.main": "Kliknij, aby przesłać lub przeciągnij obraz tutaj",
        "upload.sub": "Obsługuje PNG, JPG (Maks 4MB)",
        "pixel.size": "Rozmiar Piksela",
        "pixel.desc": "Automatycznie konwertuje podczas dostosowywania suwaka",
        "advanced.title": "Ustawienia Zaawansowane",
        "advanced.dithering": "Włącz dithering Floyd-Steinberg",
        "advanced.scaling": "Metoda Skalowania Obrazu:",
        "advanced.grid": "Pokaż Siatkę Pikseli",
        "scaling.nearest": "Najbliższy Sąsiad",
        "scaling.bilinear": "Dwuliniowy",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Podgląd Wplace Pixel Paint",
        "preview.prompt": "Proszę przesłać obraz, aby rozpocząć",
        "btn.download": "Pobierz",
        "loading": "Przetwarzanie...",
        "used.colors.title": "Kolory użyte w tym obrazie",
        "used.colors.total": "Łącznie",
        "used.colors.free": "Darmowe",
        "used.colors.premium": "Premium",
        "palette.title": "Paleta 64 Kolorów Wplace",
        "palette.free": "Darmowe (32)",
        "palette.premium": "Premium (32)",
        "palette.info": "Oficjalna Paleta Kolorów Wplace",
        "features.unlimited.desc": "Prześlij obraz dowolnego rozmiaru. Nasz konwerter pixel art Wplace obsługuje wszystko wydajnie.",
        "howto.step4.desc": "Wybierz wersję pixel-perfekcyjną lub wieloskalową. Twoja pixel art Wplace jest gotowa!",
        "faq.a6": "Tak! Dzieła sztuki stworzone za pomocą naszego konwertera pixel art Wplace należą do Ciebie i możesz je swobodnie używać w projektach osobistych lub komercyjnych. Nie rościmy sobie żadnych praw do Twoich kreacji.",
        "testimonials.q6": "Przejrzyste podglądy i pobieranie jednym kliknięciem dają mi doskonałe referencje. Po prostu otwieram Wplace i maluję - nie ma potrzeby zgadywania.",
        "footer.main": "© 2025 Konwerter Pixel Art Wplace - Darmowy do użytku, żadne prawa własności nie są roszczone do wygenerowanych dzieł sztuki",
        "footer.privacy": "Przetwarzanie po stronie klienta chroni Twoją prywatność",
        "progress.highPerformance": "Przetwarzanie w trybie wysokiej wydajności",
        "features.special.title": "Co czyni nasze narzędzie Wplace wyjątkowym?",
        "howto.step1.title": "Dostosuj rozmiar pikseli",
        "howto.step2.title": "Przekonwertuj na pixel art",
        "language.switched": "Język został zmieniony"
    },
    
    'ru': {
        "title": "Wplace Конвертер Пиксель Арта | Превратите изображения в пиксель арт",
        "subtitle": "Идеальный конвертер Wplace пиксель арта, который превращает любое изображение в потрясающий пиксель арт за секунды. Наш бесплатный онлайн инструмент автоматически подбирает официальную 64-цветную палитру Wplace.",
        "nav.home": "Главная",
        "nav.blog": "Блог",
        "nav.about": "О нас",
        "nav.privacy": "Конфиденциальность",
        "nav.terms": "Условия",
        "upload.main": "Нажмите для загрузки или перетащите изображение сюда",
        "upload.sub": "Поддерживает форматы PNG, JPG (макс. 4МБ)",
        "pixel.size": "Размер пикселя",
        "pixel.desc": "Автоматическое преобразование при настройке ползунка",
        "advanced.title": "Расширенные настройки",
        "advanced.dithering": "Включить дизеринг Флойда-Штейнберга",
        "advanced.scaling": "Метод масштабирования изображения:",
        "advanced.grid": "Показать пиксельную сетку",
        "scaling.nearest": "Ближайший сосед",
        "scaling.bilinear": "Билинейный",
        "scaling.lanczos": "Lanczos",
        "preview.title": "Результат Wplace Pixel Paint",
        "preview.prompt": "Пожалуйста, загрузите изображение для начала",
        "btn.download": "Скачать",
        "loading": "Обработка...",
        "used.colors.title": "Цвета, использованные в этом изображении",
        "used.colors.total": "Всего",
        "used.colors.free": "Бесплатные",
        "used.colors.premium": "Премиум",
        "palette.title": "64-цветная палитра Wplace",
        "palette.free": "Бесплатные (32)",
        "palette.premium": "Премиум (32)",
        "palette.info": "Официальная палитра Wplace",
        "features.unlimited.desc": "Загрузите изображение любого размера. Наш конвертер пиксель арта Wplace обрабатывает все эффективно.",
        "howto.step4.desc": "Выберите пиксель-идеальную или крупномасштабную версию. Ваш пиксель арт Wplace готов!",
        "faq.a6": "Да! Произведения искусства, созданные с помощью нашего конвертера пиксель арта Wplace, принадлежат вам для свободного использования в личных или коммерческих проектах. Мы не претендуем на права собственности на ваши творения.",
        "testimonials.q6": "Четкие превью и загрузки одним кликом дают мне идеальные справочные материалы. Я просто открываю Wplace и рисую - никаких догадок не требуется.",
        "footer.main": "© 2025 Конвертер Пиксель Арта Wplace - Бесплатен для использования, никаких прав собственности на созданные произведения искусства не заявляется",
        "footer.privacy": "Клиентская обработка защищает вашу конфиденциальность",
        "progress.highPerformance": "Обработка в режиме высокой производительности",
        "features.special.title": "Что делает наш инструмент Wplace особенным?",
        "howto.step1.title": "Настройка размера пикселя",
        "howto.step2.title": "Преобразование в пиксель арт",
        "language.switched": "Язык изменен"
    }
};

// Wplace 64色调色板 (基于官方调色板)
const WPLACE_PALETTE = [
    // 免费颜色 (0-31)
    '#FFFFFF', '#E4E4E4', '#888888', '#222222', '#FFA7D1', '#E50000',
    '#E59500', '#A06A42', '#E5D900', '#94E044', '#02BE01', '#00D3DD',
    '#0083C7', '#0000EA', '#CF6EE4', '#820080', '#000000', '#434343',
    '#6D001A', '#BF4F36', '#FF6A00', '#FFD635', '#FFF8B8', '#006A4E',
    '#8BBE6A', '#C2FFAE', '#94B3FF', '#76428A', '#AC3232', '#D0743C',
    '#FF8717', '#FFAAA5',
    
    // 付费颜色 (32-63) 
    '#FFE135', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#CCFF90',
    '#00A368', '#00CCC0', '#009EAA', '#51E9F4', '#3690EA', '#6A5CFF',
    '#B44AC0', '#FF3881', '#FF99AA', '#FFAEB9', '#FF5650', '#FF9A00',
    '#D2B48C', '#FFFA00', '#CDEB8B', '#6EFF00', '#B4E6E0', '#00BFFF',
    '#4690E7', '#B19CD9', '#FF007F', '#FFCC99', '#FFA500', '#E5C29F',
    '#FFFF7F', '#CDEB8B'
];

// 工具函数
function $(id) {
    return document.getElementById(id);
}

function showElement(id) {
    const el = $(id);
    if (el) el.classList.remove('hidden');
}

function hideElement(id) {
    const el = $(id);
    if (el) el.classList.add('hidden');
}

function setProgress(value, text) {
    const container = $('progress-bar');
    const indicator = $('progress-indicator');
    const textEl = $('progress-text');
    
    if (value > 0 && container) {
        container.classList.remove('hidden');
    }
    
    if (indicator) {
        indicator.style.width = value + '%';
    }
    
    if (textEl) {
        textEl.textContent = text || Math.round(value) + '%';
    }
    
    if (value >= 100) {
        setTimeout(() => {
            if (container) container.classList.add('hidden');
        }, 2000);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    
    // 颜色映射
    const colors = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    const bgColor = colors[type] || colors['info'];
    
    toast.className = `toast toast-${type} fixed top-4 left-1/2 transform -translate-x-1/2 z-40 ${bgColor} text-white px-4 py-2 rounded shadow-lg transition-all duration-300 max-w-md text-center`;
    toast.textContent = message;
    
    // 初始样式
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    
    document.body.appendChild(toast);
    
    // 淡入动画
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 图像调整函数
function applyImageAdjustments(data, brightness, contrast, saturation) {
    const brightnessAdjust = brightness / 100;
    const contrastAdjust = (contrast + 100) / 100;
    const saturationAdjust = saturation / 100;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // 应用亮度调整
        r += brightnessAdjust * 255;
        g += brightnessAdjust * 255;
        b += brightnessAdjust * 255;
        
        // 应用对比度调整
        r = ((r / 255 - 0.5) * contrastAdjust + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrastAdjust + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrastAdjust + 0.5) * 255;
        
        // 应用饱和度调整
        if (saturationAdjust !== 0) {
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = gray + (r - gray) * (1 + saturationAdjust);
            g = gray + (g - gray) * (1 + saturationAdjust);
            b = gray + (b - gray) * (1 + saturationAdjust);
        }
        
        // 限制颜色值范围
        data[i] = Math.max(0, Math.min(255, Math.round(r)));
        data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
        data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
}

// 颜色匹配函数
function getClosestColor(r, g, b) {
    let minDistance = Infinity;
    let closestColor = WPLACE_PALETTE[0];
    
    for (const color of WPLACE_PALETTE) {
        const hex = color.slice(1);
        const pr = parseInt(hex.slice(0, 2), 16);
        const pg = parseInt(hex.slice(2, 4), 16);
        const pb = parseInt(hex.slice(4, 6), 16);
        
        const distance = Math.sqrt(
            Math.pow(r - pr, 2) + 
            Math.pow(g - pg, 2) + 
            Math.pow(b - pb, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    
    return closestColor;
}

// 图片处理函数 - 支持高级参数
function processImageToPixelArt(canvas, options = {}) {
    const pixelSize = options.pixelSize || 8;
    const brightness = options.brightness || 0;
    const contrast = options.contrast || 0;
    const saturation = options.saturation || 0;
    const useDithering = options.dithering || false;
    
    return new Promise((resolve) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 应用图像调整
        applyImageAdjustments(data, brightness, contrast, saturation);
        
        // 创建输出画布
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d');
        
        const newWidth = Math.ceil(canvas.width / pixelSize);
        const newHeight = Math.ceil(canvas.height / pixelSize);
        
        outputCanvas.width = newWidth;
        outputCanvas.height = newHeight;
        
        // 处理每个像素块
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                
                // 计算平均颜色
                for (let dy = 0; dy < pixelSize; dy++) {
                    for (let dx = 0; dx < pixelSize; dx++) {
                        const px = x * pixelSize + dx;
                        const py = y * pixelSize + dy;
                        
                        if (px < canvas.width && py < canvas.height) {
                            const i = (py * canvas.width + px) * 4;
                            r += data[i];
                            g += data[i + 1];
                            b += data[i + 2];
                            count++;
                        }
                    }
                }
                
                if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    
                    const closestColor = getClosestColor(r, g, b);
                    outputCtx.fillStyle = closestColor;
                    outputCtx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        resolve(outputCanvas);
    });
}

// 文件上传处理 - 支持单个或批量
function handleFileUpload(files) {
    // 如果传入的是单个文件，转换为数组
    if (!Array.isArray(files)) {
        files = [files];
    }
    
    // 验证所有文件
    const validFiles = [];
    for (const file of files) {
        console.log('处理文件上传:', file.name);
        
        if (!file.type.startsWith('image/')) {
            showToast(`跳过非图片文件: ${file.name}`, 'warning');
            continue;
        }
        
        if (file.size > 4 * 1024 * 1024) { // 4MB
            showToast(`文件过大，跳过: ${file.name} (超过4MB)`, 'warning');
            continue;
        }
        
        validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
        showToast('没有找到有效的图片文件', 'error');
        return;
    }
    
    // 如果是多个文件，启动批量处理
    if (validFiles.length > 1) {
        startBatchProcessing(validFiles);
        return;
    }
    
    // 单个文件处理
    const file = validFiles[0];
    
    setProgress(10, '读取图片...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            setProgress(30, '加载图片...');
            
            // 创建画布
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            
            currentImage = canvas;
            
            // 显示预览
            const previewCanvas = $('preview-canvas');
            
            if (previewCanvas) {
                previewCanvas.width = img.width;
                previewCanvas.height = img.height;
                const previewCtx = previewCanvas.getContext('2d');
                previewCtx.drawImage(img, 0, 0);
                
                showElement('preview-canvas');
                hideElement('upload-prompt');
                
                console.log('✅ 图片预览已显示，尺寸:', img.width, 'x', img.height);
            } else {
                console.error('❌ 找不到预览画布元素 preview-canvas');
            }
            
            // 图片信息显示已移除
            
            // 启用处理按钮
            const processBtn = $('process-btn');
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
            
            setProgress(100, '上传完成');
            showToast('图片上传成功！', 'success');
            
            // 自动生成像素艺术预览
            setTimeout(() => {
                debouncePreview();
            }, 500); // 给上传完成动画一些时间
            
        };
        img.onerror = function() {
            showToast('图片加载失败', 'error');
            setProgress(0, '');
        };
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showToast('文件读取失败', 'error');
        setProgress(0, '');
    };
    
    reader.readAsDataURL(file);
}

// 处理图片
function processImage() {
    if (!currentImage || isProcessing) return;
    
    isProcessing = true;
    console.log('开始处理图片...');
    
    const processBtn = $('process-btn');
    if (processBtn) {
        processBtn.disabled = true;
        processBtn.textContent = 'Processing...';
    }
    
    setProgress(10, '初始化处理...');
    
    // 获取参数
    const options = getProcessingOptions();
    
    setProgress(30, '处理像素化...');
    
    // 异步处理避免阻塞UI
    setTimeout(() => {
        processImageToPixelArt(currentImage, options).then(result => {
            processedImage = result;
            
            setProgress(80, '生成预览...');
            
            // 显示结果
            const outputCanvas = $('output-canvas');
            if (outputCanvas) {
                const pixelSize = options.pixelSize || 8;
                outputCanvas.width = result.width * pixelSize;
                outputCanvas.height = result.height * pixelSize;
                
                const ctx = outputCanvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(result, 0, 0, outputCanvas.width, outputCanvas.height);
                
                hideElement('preview-canvas');
                showElement('output-canvas');
            }
            
            // 启用下载按钮
            const downloadBtn = $('download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('hidden');
            }
            
            setProgress(100, '处理完成');
            showToast('图片处理完成！', 'success');
            
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
            
            isProcessing = false;
            
        }).catch(error => {
            console.error('处理失败:', error);
            showToast('处理失败: ' + error.message, 'error');
            setProgress(0, '');
            
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
            
            isProcessing = false;
        });
    }, 100);
}

// 获取处理参数
function getProcessingOptions() {
    return {
        pixelSize: parseInt($('size-slider')?.value || '8'),
        quality: parseInt($('quality-slider')?.value || '80'),
        brightness: parseInt($('brightness-slider')?.value || '0'),
        contrast: parseInt($('contrast-slider')?.value || '0'),
        saturation: parseInt($('saturation-slider')?.value || '0'),
        dithering: $('dithering-checkbox')?.checked || false
    };
}

// 下载图片
function downloadImage() {
    if (!processedImage) return;
    
    const options = getProcessingOptions();
    const pixelSize = options.pixelSize;
    
    // 创建高分辨率版本
    const canvas = document.createElement('canvas');
    canvas.width = processedImage.width * pixelSize;
    canvas.height = processedImage.height * pixelSize;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(processedImage, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wplace-pixel-art-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('下载完成！', 'success');
    });
}

// 防抖预览函数
let previewTimeout;
function debouncePreview() {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
        if (currentImage) {
            const options = getProcessingOptions();
            processImageToPixelArt(currentImage, options).then(result => {
                const outputCanvas = $('output-canvas');
                if (outputCanvas) {
                    const pixelSize = options.pixelSize || 8;
                    outputCanvas.width = result.width * pixelSize;
                    outputCanvas.height = result.height * pixelSize;
                    
                    const ctx = outputCanvas.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(result, 0, 0, outputCanvas.width, outputCanvas.height);
                    
                    hideElement('preview-canvas');
                    showElement('output-canvas');
                }
                
                // 更新处理结果
                processedImage = result;
                
                // 启用下载按钮
                const downloadBtn = $('download-btn');
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('hidden');
                }
            });
        }
    }, 300); // 300ms防抖延迟
}

// 批量处理功能
function startBatchProcessing(files) {
    batchQueue = files;
    batchResults = [];
    
    console.log(`开始批量处理 ${files.length} 个文件`);
    showToast(`开始批量处理 ${files.length} 个文件`, 'info');
    
    // 创建批量处理UI
    createBatchProcessingUI();
    
    // 开始处理
    processBatchQueue();
}

function createBatchProcessingUI() {
    // 创建批量处理面板
    const existingPanel = $('batch-processing-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'batch-processing-panel';
    panel.className = 'fixed top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4';
    panel.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-gray-800">批量处理</h3>
            <button id="batch-close-btn" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div class="space-y-2">
            <div class="text-sm text-gray-600">
                总计: <span id="batch-total">0</span> 个文件
            </div>
            <div class="text-sm text-gray-600">
                已处理: <span id="batch-completed">0</span> 个
            </div>
            <div class="text-sm text-gray-600">
                当前: <span id="batch-current">-</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div id="batch-progress" class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
            </div>
            <div id="batch-file-list" class="max-h-40 overflow-y-auto text-xs space-y-1"></div>
        </div>
        <div class="mt-3 flex space-x-2">
            <button id="batch-download-all-btn" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50" disabled>
                下载全部
            </button>
            <button id="batch-cancel-btn" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                取消
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // 绑定事件
    $('batch-close-btn').addEventListener('click', closeBatchProcessing);
    $('batch-cancel-btn').addEventListener('click', cancelBatchProcessing);
    $('batch-download-all-btn').addEventListener('click', downloadAllBatchResults);
    
    // 初始化UI
    $('batch-total').textContent = batchQueue.length;
    updateBatchFileList();
}

function updateBatchFileList() {
    const listContainer = $('batch-file-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    batchQueue.forEach((file, index) => {
        const fileItem = document.createElement('div');
        const result = batchResults.find(r => r.originalIndex === index);
        let status = '等待中...';
        let statusClass = 'text-gray-500';
        
        if (result) {
            if (result.success) {
                status = '✓ 完成';
                statusClass = 'text-green-600';
            } else {
                status = '✗ 失败';
                statusClass = 'text-red-600';
            }
        } else if (index === batchQueue.findIndex(f => f === getCurrentProcessingFile())) {
            status = '处理中...';
            statusClass = 'text-blue-600';
        }
        
        fileItem.className = `flex justify-between items-center p-1 ${statusClass}`;
        fileItem.innerHTML = `
            <span class="truncate flex-1">${file.name}</span>
            <span class="text-xs">${status}</span>
        `;
        
        listContainer.appendChild(fileItem);
    });
}

function getCurrentProcessingFile() {
    const completedCount = batchResults.length;
    return batchQueue[completedCount];
}

async function processBatchQueue() {
    if (batchQueue.length === 0) {
        finishBatchProcessing();
        return;
    }
    
    const totalFiles = batchQueue.length;
    
    for (let i = 0; i < totalFiles; i++) {
        const file = batchQueue[i];
        updateBatchProgress(i, totalFiles, file.name);
        
        try {
            const result = await processSingleFileForBatch(file, i);
            batchResults.push(result);
            
            updateBatchFileList();
            $('batch-completed').textContent = batchResults.length;
            
        } catch (error) {
            console.error(`批量处理失败 - ${file.name}:`, error);
            batchResults.push({
                originalIndex: i,
                filename: file.name,
                success: false,
                error: error.message
            });
        }
        
        // 小延迟避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    finishBatchProcessing();
}

async function processSingleFileForBatch(file, index) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                // 创建画布
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0);
                
                // 获取处理参数
                const options = getProcessingOptions();
                
                // 处理图片
                processImageToPixelArt(canvas, options).then(result => {
                    resolve({
                        originalIndex: index,
                        filename: file.name,
                        success: true,
                        canvas: result,
                        processedCanvas: createScaledCanvas(result, options.pixelSize || 8)
                    });
                }).catch(error => {
                    reject(error);
                });
            };
            
            img.onerror = () => reject(new Error(`图片加载失败: ${file.name}`));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error(`文件读取失败: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

function createScaledCanvas(sourceCanvas, pixelSize) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = sourceCanvas.width * pixelSize;
    scaledCanvas.height = sourceCanvas.height * pixelSize;
    
    const ctx = scaledCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    
    return scaledCanvas;
}

function updateBatchProgress(current, total, filename) {
    const percentage = Math.round((current / total) * 100);
    
    const progressBar = $('batch-progress');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    const currentLabel = $('batch-current');
    if (currentLabel) {
        currentLabel.textContent = filename;
    }
}

function finishBatchProcessing() {
    const successCount = batchResults.filter(r => r.success).length;
    const totalCount = batchQueue.length;
    
    updateBatchProgress(totalCount, totalCount, '完成');
    
    showToast(`批量处理完成！成功: ${successCount}/${totalCount}`, 
               successCount === totalCount ? 'success' : 'warning');
    
    // 启用下载按钮
    const downloadBtn = $('batch-download-all-btn');
    if (downloadBtn) {
        downloadBtn.disabled = successCount === 0;
    }
    
    console.log(`批量处理完成 - 成功: ${successCount}, 失败: ${totalCount - successCount}`);
}

function downloadAllBatchResults() {
    const successfulResults = batchResults.filter(r => r.success);
    
    if (successfulResults.length === 0) {
        showToast('没有可下载的处理结果', 'error');
        return;
    }
    
    // 创建ZIP文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    
    // 依次下载所有文件
    successfulResults.forEach((result, index) => {
        setTimeout(() => {
            const filename = result.filename.replace(/\.[^/.]+$/, '') + '_pixelart.png';
            
            result.processedCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }, index * 500); // 500ms间隔避免同时下载
    });
    
    showToast(`开始下载 ${successfulResults.length} 个文件`, 'success');
}

function cancelBatchProcessing() {
    // 停止处理
    batchQueue = [];
    closeBatchProcessing();
    showToast('批量处理已取消', 'info');
}

function closeBatchProcessing() {
    const panel = $('batch-processing-panel');
    if (panel) {
        panel.remove();
    }
    
    // 清理状态
    batchQueue = [];
    batchResults = [];
}

// 重置
function resetApp() {
    currentImage = null;
    processedImage = null;
    
    const previewCanvas = $('preview-canvas');
    const outputCanvas = $('output-canvas');
    const fileInput = $('file-input');
    const processBtn = $('process-btn');
    const downloadBtn = $('download-btn');
    if (previewCanvas) {
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        hideElement('preview-canvas');
    }
    
    if (outputCanvas) {
        const ctx = outputCanvas.getContext('2d');
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        hideElement('output-canvas');
    }
    
    if (fileInput) fileInput.value = '';
    if (processBtn) {
        processBtn.disabled = true;
        processBtn.textContent = 'Process';
    }
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('hidden');
    }
    
    showElement('upload-prompt');
    setProgress(0, '');
    showToast('已重置', 'info');
}

// 初始化调色板显示
function initializePaletteDisplay() {
    const paletteContainer = $('paletteDisplay');
    if (!paletteContainer) {
        console.error('❌ 找不到调色板容器 paletteDisplay');
        return;
    }
    
    console.log('🎨 正在初始化调色板，颜色数量:', WPLACE_PALETTE.length);
    paletteContainer.innerHTML = '';
    
    // 标记哪些颜色是免费/付费的
    const freeColors = WPLACE_PALETTE.slice(0, 32); // 前32个是免费的
    const premiumColors = WPLACE_PALETTE.slice(32); // 后32个是付费的
    
    WPLACE_PALETTE.forEach((color, index) => {
        const colorDiv = document.createElement('button');
        colorDiv.className = 'relative w-6 h-6 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:scale-110 transition-transform';
        colorDiv.style.backgroundColor = color;
        colorDiv.style.minWidth = '24px';
        colorDiv.style.minHeight = '24px';
        colorDiv.title = `${color} ${index < 32 ? '(Free)' : '(Premium)'}`;
        
        // 如果是付费颜色，添加锁图标
        if (index >= 32) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'absolute top-0 right-0 text-white text-xs leading-none';
            lockIcon.innerHTML = '🔒';
            lockIcon.style.fontSize = '8px';
            lockIcon.style.textShadow = '0 0 2px black';
            colorDiv.appendChild(lockIcon);
        }
        
        // 添加点击事件（可以扩展为颜色选择功能）
        colorDiv.addEventListener('click', () => {
            console.log('选择颜色:', color, index < 32 ? '(Free)' : '(Premium)');
        });
        
        paletteContainer.appendChild(colorDiv);
    });
    
    console.log('✅ 调色板显示已初始化，共', WPLACE_PALETTE.length, '个颜色');
    console.log('调色板容器子元素数量:', paletteContainer.children.length);
}

// 初始化应用
function initApp() {
    console.log('🚀 初始化应用...');
    
    // 绑定上传区域点击事件
    const uploadArea = $('uploadArea');
    const fileInput = $('file-input');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                handleFileUpload(files);
            }
        });
        
        // 拖放支持
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                handleFileUpload(imageFiles);
            } else {
                showToast('没有找到图片文件', 'error');
            }
        });
        
        console.log('✅ 上传功能已绑定');
    } else {
        console.error('❌ 找不到上传元素');
    }
    
    // 绑定按钮事件
    const processBtn = $('process-btn');
    if (processBtn) {
        processBtn.addEventListener('click', processImage);
        processBtn.disabled = true;
    }
    
    const downloadBtn = $('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadImage);
        downloadBtn.disabled = true;
        downloadBtn.classList.add('hidden');
    }
    
    const resetBtn = $('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetApp);
    }
    
    // 绑定滑块事件
    const sizeSlider = $('size-slider');
    const sizeValue = $('size-value');
    if (sizeSlider && sizeValue) {
        sizeSlider.addEventListener('input', () => {
            sizeValue.textContent = sizeSlider.value;
            
            // 如果有图片已上传，实时预览像素化效果
            if (currentImage) {
                debouncePreview();
            }
        });
    }
    
    // 绑定其他滑块的显示更新和实时预览
    const sliders = [
        { id: 'quality-slider', valueId: 'quality-value', suffix: '%' },
        { id: 'brightness-slider', valueId: 'brightness-value', suffix: '' },
        { id: 'contrast-slider', valueId: 'contrast-value', suffix: '' },
        { id: 'saturation-slider', valueId: 'saturation-value', suffix: '' }
    ];
    
    sliders.forEach(({ id, valueId, suffix }) => {
        const slider = $(id);
        const valueDisplay = $(valueId);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value + suffix;
                
                // 如果有图片已上传，实时预览效果
                if (currentImage) {
                    debouncePreview();
                }
            });
        }
    });
    
    // 为抖动复选框添加预览更新
    const ditheringCheckbox = $('dithering-checkbox');
    if (ditheringCheckbox) {
        ditheringCheckbox.addEventListener('change', () => {
            if (currentImage) {
                debouncePreview();
            }
        });
    }
    
    // 绑定Advanced Settings展开/收起
    const advancedSettingsButton = $('advancedSettingsButton');
    const advancedSettingsContent = $('advancedSettingsContent');
    const advancedSettingsIcon = $('advancedSettingsIcon');
    
    if (advancedSettingsButton && advancedSettingsContent) {
        advancedSettingsButton.addEventListener('click', () => {
            const isHidden = advancedSettingsContent.classList.contains('hidden');
            
            if (isHidden) {
                // 展开
                advancedSettingsContent.classList.remove('hidden');
                if (advancedSettingsIcon) {
                    advancedSettingsIcon.style.transform = 'rotate(180deg)';
                }
            } else {
                // 收起
                advancedSettingsContent.classList.add('hidden');
                if (advancedSettingsIcon) {
                    advancedSettingsIcon.style.transform = 'rotate(0deg)';
                }
            }
        });
        
        console.log('✅ Advanced Settings 功能已绑定');
    }
    
    // 初始化调色板显示
    initializePaletteDisplay();
    
    // 初始化多语言支持
    // 多语言初始化现在由 i18n.js 自动处理
    
    console.log('✅ 应用初始化完成！');
    showToast('Wplace 像素画转换器已准备就绪！', 'success');
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 使全局可访问用于调试
window.wplaceApp = {
    currentImage,
    processedImage,
    isProcessing,
    handleFileUpload,
    processImage,
    downloadImage,
    resetApp
};
// 多语言系统现在由独立的 i18n.js 文件处理
// 保持 t() 函数以兼容现有代码
function t(key, defaultValue = '') {
    if (window.i18n && typeof window.i18n.t === 'function') {
        return window.i18n.t(key, defaultValue);
    }
    return defaultValue || key;
}

// updatePageText 函数现在由 i18n.js 处理