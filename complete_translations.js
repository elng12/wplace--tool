/**
 * 自动补充完整翻译脚本
 */

const fs = require('fs');
const path = require('path');

// 读取英文基准翻译
const enTranslations = JSON.parse(fs.readFileSync('lang/en.json', 'utf8'));

// 各语言的完整翻译补充
const translations = {
  fr: {
    // FAQ完整翻译
    "faq.a1": "Le Convertisseur d'Art Pixel Wplace est un générateur d'art pixel en ligne gratuit qui transforme n'importe quelle image en un magnifique art pixel. Notre outil Wplace utilise une cartographie avancée des couleurs pour créer des résultats époustouflants.",
    "faq.a2": "Oui ! Le Convertisseur d'Art Pixel Wplace est complètement gratuit sans aucune limitation. Créez autant d'œuvres d'art pixel que vous le souhaitez.",
    "faq.a3": "Le Convertisseur d'Art Pixel Wplace prend en charge les formats PNG, JPG, JPEG et SVG. Téléchargez n'importe quelle image et transformez-la instantanément.",
    "faq.a4": "Non ! Contrairement à d'autres outils, le Convertisseur d'Art Pixel Wplace n'a pas de restrictions de taille d'image. Traitez des images de n'importe quelle dimension avec notre puissant outil Wplace.",
    "faq.a5": "Absolument ! Le Convertisseur d'Art Pixel Wplace traite tout localement dans votre navigateur. Vos images ne quittent jamais votre appareil, garantissant une confidentialité complète.",
    "faq.a6": "Oui ! L'art créé avec le Convertisseur d'Art Pixel Wplace vous appartient et peut être utilisé librement pour des projets personnels ou commerciaux. Nous ne revendiquons aucune propriété sur vos créations.",
    
    // User testimonials
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Joueur Vétéran Wplace",
    "testimonials.user1.quote": "Cet outil Wplace a complètement transformé ma façon d'aborder l'art pixel sur la plateforme. Avant de découvrir ce convertisseur, je passais des heures à convertir manuellement des images avec des problèmes de correspondance des couleurs. Maintenant, je peux télécharger n'importe quelle image et voir instantanément à quoi elle ressemblera avec la palette officielle.",
    "testimonials.user2.name": "Maya_Artiste",
    "testimonials.user2.role": "Passionnée d'Art Numérique",
    "testimonials.user2.quote": "J'ai essayé de nombreux convertisseurs d'art pixel, mais cet outil Wplace est de loin le plus précis et convivial. La fonction de correspondance automatique des couleurs garantit que mon artwork a exactement l'apparence prévue quand je le place sur la toile.",
    "testimonials.user3.name": "ConstructeurFusée",
    "testimonials.user3.role": "Leader Communautaire",
    "testimonials.user3.quote": "Toute notre équipe compte sur cet outil Wplace pour coordonner des projets artistiques communautaires à grande échelle. La précision et la fiabilité le rendent indispensable pour planifier des designs complexes. Les superpositions de grille nous aident à coordonner le placement des pixels entre plusieurs contributeurs.",
    "testimonials.user4.name": "Sarah_Pixel",
    "testimonials.user4.role": "Créatrice Designer",
    "testimonials.user4.quote": "En tant que personne qui crée des œuvres détaillées pour Wplace, cet outil wplace a révolutionné mon processus créatif. Les fonctionnalités avancées comme le tramage et les options de mise à l'échelle le rendent incroyablement polyvalent pour convertir des photographies, des logos et des œuvres originales.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Notre créateur d'art pixel Wplace ne coûte rien à utiliser. Pas d'abonnements, pas de frais cachés, pas de limites sur les conversions. Créez autant d'art pixel que vous voulez.",
    "features.privacy.detailed.desc": "Tout se passe localement dans votre navigateur. Vos images restent sur votre appareil - nous ne téléchargeons, stockons ou accédons jamais à votre contenu.",
    "features.easy.detailed.desc": "Pas de paramètres complexes ou de connaissances techniques nécessaires. Téléchargez simplement votre image et regardez-la se transformer en magnifique art pixel instantanément.",
    "features.unlimited.detailed.desc": "Des petites icônes aux œuvres massives - notre convertisseur traite des images de n'importe quelle dimension. Pas de restrictions de taille de fichier ou de compromis sur la qualité.",
    
    // How-to steps
    "howto.step1.desc": "Cliquez sur la zone de téléchargement ou faites glisser et déposez votre fichier PNG, JPG ou SVG. Le Convertisseur d'Art Pixel Wplace prend en charge tous les formats courants.",
    "howto.step2.desc": "Utilisez le curseur pour contrôler la taille des pixels. Des valeurs plus petites créent un art détaillé, des valeurs plus grandes créent un art pixel volumineux.",
    "howto.step3.desc": "Regardez votre image se transformer en art pixel époustouflant en utilisant la technologie avancée du Convertisseur d'Art Pixel Wplace.",
    "howto.step4.desc": "Choisissez entre des versions parfaites au pixel près ou à grande échelle. Votre art pixel Wplace est prêt à être utilisé !",
    
    // FAQ questions
    "faq.q1": "Qu'est-ce que le Convertisseur d'Art Pixel Wplace ?",
    "faq.q2": "Le Convertisseur d'Art Pixel Wplace est-il vraiment gratuit ?",
    "faq.q3": "Quels formats d'image le Convertisseur d'Art Pixel Wplace prend-il en charge ?",
    "faq.q4": "Y a-t-il des limitations de taille ?",
    "faq.q5": "Mes données sont-elles sécurisées avec le Convertisseur d'Art Pixel Wplace ?",
    "faq.q6": "Puis-je utiliser l'art généré commercialement ?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Outil de Peinture Wplace - Aide aux joueurs Wplace à peindre facilement - Libre d'utilisation, aucune propriété revendiquée sur les œuvres générées",
    "footer.independent.desc": "Ce site web est un projet indépendant, géré par des fans, conçu pour servir les besoins d'art pixel de la communauté. Nous ne sommes pas connectés, sponsorisés ou approuvés par la plateforme officielle Wplace. Fait par des fans pour des fans, cet outil Wplace vise à rendre la création de pixels plus facile et plus amusante.",
  },

  pt: {
    // FAQ complete translations
    "faq.a1": "O Conversor de Arte Pixel Wplace é um gerador gratuito de arte pixel online que converte qualquer imagem em bela arte pixel. Nossa ferramenta Wplace usa mapeamento avançado de cores para criar resultados impressionantes.",
    "faq.a2": "Sim! O Conversor de Arte Pixel Wplace é completamente gratuito, sem limitações. Crie quantas peças de arte pixel desejar.",
    "faq.a3": "O Conversor de Arte Pixel Wplace suporta formatos PNG, JPG, JPEG e SVG. Carregue qualquer imagem e transforme-a instantaneamente.",
    "faq.a4": "Não! Ao contrário de outras ferramentas, o Conversor de Arte Pixel Wplace não tem restrições de tamanho de imagem. Processe imagens de qualquer dimensão com nossa poderosa ferramenta Wplace.",
    "faq.a5": "Absolutamente! O Conversor de Arte Pixel Wplace processa tudo localmente em seu navegador. Suas imagens nunca saem do seu dispositivo, garantindo privacidade completa.",
    "faq.a6": "Sim! Arte criada com o Conversor de Arte Pixel Wplace é sua para usar livremente em projetos pessoais ou comerciais. Não reivindicamos propriedade sobre suas criações.",
    
    // User testimonials
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Jogador Veterano Wplace",
    "testimonials.user1.quote": "Esta Ferramenta Wplace transformou completamente como abordo arte pixel na plataforma. Antes de descobrir este conversor, eu gastava horas convertendo manualmente imagens com problemas de correspondência de cores. Agora posso carregar qualquer imagem e ver instantaneamente como ficará com a paleta oficial.",
    "testimonials.user2.name": "Maya_Artista",
    "testimonials.user2.role": "Entusiasta de Arte Digital",
    "testimonials.user2.quote": "Experimentei muitos conversores de arte pixel, mas esta Ferramenta Wplace é de longe a mais precisa e fácil de usar. O recurso de correspondência automática de cores garante que minha arte pareça exatamente como pretendido quando a coloco na tela.",
    "testimonials.user3.name": "ConstrutorFoguete",
    "testimonials.user3.role": "Líder Comunitário",
    "testimonials.user3.quote": "Toda nossa equipe depende desta Ferramenta Wplace para coordenar projetos de arte comunitária em grande escala. A precisão e confiabilidade a tornam indispensável para planejar designs complexos. As sobreposições de grade nos ajudam a coordenar o posicionamento de pixels entre múltiplos colaboradores.",
    "testimonials.user4.name": "Sarah_Pixel",
    "testimonials.user4.role": "Designer Criativa",
    "testimonials.user4.quote": "Como alguém que cria arte detalhada para Wplace, esta ferramenta wplace revolucionou meu processo criativo. As funcionalidades avançadas como pontilhamento e opções de escala tornam-na incrivelmente versátil para converter fotografias, logos e arte original.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Nosso criador de arte pixel Wplace não custa nada para usar. Sem assinaturas, sem taxas ocultas, sem limites de conversões. Crie toda a arte pixel que quiser.",
    "features.privacy.detailed.desc": "Tudo acontece localmente no seu navegador. Suas imagens permanecem no seu dispositivo - nunca carregamos, armazenamos ou acessamos seu conteúdo.",
    "features.easy.detailed.desc": "Sem configurações complexas ou conhecimento técnico necessário. Apenas carregue sua imagem e veja-a se transformar em bela arte pixel instantaneamente.",
    "features.unlimited.detailed.desc": "De pequenos ícones a obras massivas - nosso conversor processa imagens de qualquer dimensão. Sem restrições de tamanho de arquivo ou compromissos de qualidade.",
    
    // How-to steps
    "howto.step1.desc": "Clique na área de carregamento ou arraste e solte seu arquivo PNG, JPG ou SVG. O Conversor de Arte Pixel Wplace suporta todos os formatos comuns.",
    "howto.step2.desc": "Use o controle deslizante para controlar o tamanho do pixel. Valores menores criam arte detalhada, valores maiores criam arte pixel robusta.",
    "howto.step3.desc": "Veja sua imagem se transformar em impressionante arte pixel usando a tecnologia avançada do Conversor de Arte Pixel Wplace.",
    "howto.step4.desc": "Escolha entre versões perfeitas de pixel ou de grande escala. Sua arte pixel Wplace está pronta para usar!",
    
    // FAQ questions
    "faq.q1": "O que é o Conversor de Arte Pixel Wplace?",
    "faq.q2": "O Conversor de Arte Pixel Wplace é realmente gratuito?",
    "faq.q3": "Que formatos de imagem o Conversor de Arte Pixel Wplace suporta?",
    "faq.q4": "Há limitações de tamanho?",
    "faq.q5": "Meus dados estão seguros com o Conversor de Arte Pixel Wplace?",
    "faq.q6": "Posso usar a arte gerada comercialmente?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Ferramenta de Pintura Wplace - Ajuda jogadores Wplace a pintar facilmente - Livre para usar, nenhuma propriedade reivindicada sobre arte gerada",
    "footer.independent.desc": "Este site é um projeto independente, gerido por fãs, construído para servir as necessidades de arte pixel da comunidade. Não estamos conectados, patrocinados ou aprovados pela plataforma oficial Wplace. Feito por fãs para fãs, esta Ferramenta Wplace visa tornar a criação de pixels mais fácil e mais divertida.",
  },

  de: {
    // FAQ complete translations
    "faq.a1": "Der Wplace Pixel Art Converter ist ein kostenloser Online-Pixel-Art-Generator, der jedes Bild in wunderschöne Pixel Art verwandelt. Unser Wplace-Tool verwendet erweiterte Farbzuordnung, um beeindruckende Ergebnisse zu erzielen.",
    "faq.a2": "Ja! Der Wplace Pixel Art Converter ist völlig kostenlos ohne Einschränkungen. Erstellen Sie so viele Pixel Art-Stücke, wie Sie möchten.",
    "faq.a3": "Der Wplace Pixel Art Converter unterstützt PNG-, JPG-, JPEG- und SVG-Formate. Laden Sie jedes Bild hoch und verwandeln Sie es sofort.",
    "faq.a4": "Nein! Im Gegensatz zu anderen Tools hat der Wplace Pixel Art Converter keine Bildgrößenbeschränkungen. Verarbeiten Sie Bilder jeder Dimension mit unserem mächtigen Wplace-Tool.",
    "faq.a5": "Absolut! Der Wplace Pixel Art Converter verarbeitet alles lokal in Ihrem Browser. Ihre Bilder verlassen niemals Ihr Gerät und gewährleisten vollständige Privatsphäre.",
    "faq.a6": "Ja! Mit dem Wplace Pixel Art Converter erstellte Kunst gehört Ihnen und kann frei für persönliche oder kommerzielle Projekte verwendet werden. Wir erheben keinen Anspruch auf Ihre Kreationen.",
    
    // User testimonials
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Wplace Veteran-Spieler",
    "testimonials.user1.quote": "Dieses Wplace-Tool hat völlig verändert, wie ich Pixel Art auf der Plattform angehe. Bevor ich diesen Converter entdeckte, verbrachte ich Stunden damit, Bilder manuell mit Farbabweichungen zu konvertieren. Jetzt kann ich jedes Bild hochladen und sofort sehen, wie es mit der offiziellen Palette aussehen wird.",
    "testimonials.user2.name": "Maya_Künstlerin",
    "testimonials.user2.role": "Digital Art Enthusiastin",
    "testimonials.user2.quote": "Ich habe viele Pixel Art Converter ausprobiert, aber dieses Wplace-Tool ist bei weitem das genaueste und benutzerfreundlichste. Die automatische Farbabstimmung gewährleistet, dass meine Kunst genau so aussieht, wie beabsichtigt, wenn ich sie auf die Leinwand setze.",
    "testimonials.user3.name": "RaketenBauer",
    "testimonials.user3.role": "Community-Leiter",
    "testimonials.user3.quote": "Unser ganzes Team verlässt sich auf dieses Wplace-Tool zur Koordination groß angelegter Community-Kunstprojekte. Die Präzision und Zuverlässigkeit machen es unverzichtbar für die Planung komplexer Designs. Die Gitter-Überlagerungen helfen uns, die Pixel-Platzierung zwischen mehreren Mitwirkenden zu koordinieren.",
    "testimonials.user4.name": "Sarah_Pixel",
    "testimonials.user4.role": "Kreative Designerin",
    "testimonials.user4.quote": "Als jemand, der detaillierte Kunstwerke für Wplace erstellt, hat dieses Wplace-Tool meinen kreativen Prozess revolutioniert. Die erweiterten Funktionen wie Dithering und Skalierungsoptionen machen es unglaublich vielseitig für die Konvertierung von Fotografien, Logos und Originalkunst.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Unser Wplace Pixel Art Creator kostet nichts in der Nutzung. Keine Abonnements, keine versteckten Gebühren, keine Beschränkungen bei Konvertierungen. Erstellen Sie so viel Pixel Art, wie Sie möchten.",
    "features.privacy.detailed.desc": "Alles passiert lokal in Ihrem Browser. Ihre Bilder bleiben auf Ihrem Gerät - wir laden niemals hoch, speichern oder greifen auf Ihre Inhalte zu.",
    "features.easy.detailed.desc": "Keine komplexen Einstellungen oder technisches Wissen erforderlich. Laden Sie einfach Ihr Bild hoch und sehen Sie zu, wie es sich sofort in wunderschöne Pixel Art verwandelt.",
    "features.unlimited.detailed.desc": "Von winzigen Icons bis zu massiven Kunstwerken - unser Converter verarbeitet Bilder jeder Dimension. Keine Dateigrößenbeschränkungen oder Qualitätseinbußen.",
    
    // FAQ questions
    "faq.q1": "Was ist der Wplace Pixel Art Converter?",
    "faq.q2": "Ist der Wplace Pixel Art Converter wirklich kostenlos?",
    "faq.q3": "Welche Bildformate unterstützt der Wplace Pixel Art Converter?",
    "faq.q4": "Gibt es Größenbeschränkungen?",
    "faq.q5": "Sind meine Daten mit dem Wplace Pixel Art Converter sicher?",
    "faq.q6": "Kann ich die generierte Kunst kommerziell verwenden?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Wplace Paint Tool - Hilft Wplace-Spielern beim einfachen Malen - Kostenlos nutzbar, kein Eigentumsanspruch auf generierte Kunstwerke",
    "footer.independent.desc": "Diese Website ist ein unabhängiges, von Fans betriebenes Projekt, das zur Erfüllung der Pixel-Art-Bedürfnisse der Community entwickelt wurde. Wir sind nicht mit der offiziellen Wplace-Plattform verbunden, gesponsert oder genehmigt. Von Fans für Fans gemacht, zielt dieses Wplace-Tool darauf ab, die Pixel-Erstellung einfacher und unterhaltsamer zu machen.",
  },

  es: {
    // FAQ complete translations
    "faq.a1": "El Convertidor de Arte Pixel Wplace es un generador gratuito de arte pixel en línea que convierte cualquier imagen en hermoso arte pixel. Nuestra herramienta Wplace utiliza mapeo avanzado de colores para crear resultados impresionantes.",
    "faq.a2": "¡Sí! El Convertidor de Arte Pixel Wplace es completamente gratuito sin limitaciones. Crea tantas piezas de arte pixel como quieras.",
    "faq.a3": "El Convertidor de Arte Pixel Wplace soporta formatos PNG, JPG, JPEG y SVG. Sube cualquier imagen y transfórmala instantáneamente.",
    "faq.a4": "¡No! A diferencia de otras herramientas, el Convertidor de Arte Pixel Wplace no tiene restricciones de tamaño de imagen. Procesa imágenes de cualquier dimensión con nuestra poderosa herramienta Wplace.",
    "faq.a5": "¡Absolutamente! El Convertidor de Arte Pixel Wplace procesa todo localmente en tu navegador. Tus imágenes nunca salen de tu dispositivo, garantizando privacidad completa.",
    "faq.a6": "¡Sí! El arte creado con el Convertidor de Arte Pixel Wplace es tuyo para usar libremente en proyectos personales o comerciales. No reclamamos propiedad sobre tus creaciones.",
    
    // User testimonials
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Jugador Veterano Wplace",
    "testimonials.user1.quote": "Esta Herramienta Wplace ha transformado completamente cómo abordo el arte pixel en la plataforma. Antes de descubrir este convertidor, pasaba horas convirtiendo manualmente imágenes con problemas de coincidencia de colores. Ahora puedo subir cualquier imagen y ver instantáneamente cómo se verá con la paleta oficial.",
    "testimonials.user2.name": "Maya_Artista",
    "testimonials.user2.role": "Entusiasta del Arte Digital",
    "testimonials.user2.quote": "He probado muchos convertidores de arte pixel, pero esta Herramienta Wplace es de lejos la más precisa y fácil de usar. La función de coincidencia automática de colores garantiza que mi arte se vea exactamente como pretendía cuando lo coloco en el lienzo.",
    "testimonials.user3.name": "ConstructorCohete",
    "testimonials.user3.role": "Líder Comunitario",
    "testimonials.user3.quote": "Todo nuestro equipo depende de esta Herramienta Wplace para coordinar proyectos de arte comunitario a gran escala. La precisión y confiabilidad la hacen indispensable para planificar diseños complejos. Las superposiciones de cuadrícula nos ayudan a coordinar la colocación de píxeles entre múltiples colaboradores.",
    "testimonials.user4.name": "Sarah_Pixel",
    "testimonials.user4.role": "Diseñadora Creativa",
    "testimonials.user4.quote": "Como alguien que crea arte detallado para Wplace, esta herramienta wplace ha revolucionado mi proceso creativo. Las características avanzadas como el tramado y las opciones de escalado la hacen increíblemente versátil para convertir fotografías, logos y arte original.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Nuestro creador de arte pixel Wplace no cuesta nada usar. Sin suscripciones, sin tarifas ocultas, sin límites en conversiones. Crea todo el arte pixel que quieras.",
    "features.privacy.detailed.desc": "Todo sucede localmente en tu navegador. Tus imágenes permanecen en tu dispositivo - nunca subimos, almacenamos o accedemos a tu contenido.",
    "features.easy.detailed.desc": "Sin configuraciones complejas o conocimiento técnico necesario. Solo sube tu imagen y mírala transformarse en hermoso arte pixel instantáneamente.",
    "features.unlimited.detailed.desc": "Desde iconos diminutos hasta obras masivas - nuestro convertidor procesa imágenes de cualquier dimensión. Sin restricciones de tamaño de archivo o compromisos de calidad.",
    
    // FAQ questions
    "faq.q1": "¿Qué es el Convertidor de Arte Pixel Wplace?",
    "faq.q2": "¿El Convertidor de Arte Pixel Wplace es realmente gratuito?",
    "faq.q3": "¿Qué formatos de imagen soporta el Convertidor de Arte Pixel Wplace?",
    "faq.q4": "¿Hay limitaciones de tamaño?",
    "faq.q5": "¿Están seguros mis datos con el Convertidor de Arte Pixel Wplace?",
    "faq.q6": "¿Puedo usar el arte generado comercialmente?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Herramienta de Pintura Wplace - Ayuda a jugadores Wplace a pintar fácilmente - Libre de usar, no se reclama propiedad sobre arte generado",
    "footer.independent.desc": "Este sitio web es un proyecto independiente, administrado por fanáticos, construido para servir las necesidades de arte pixel de la comunidad. No estamos conectados, patrocinados o aprobados por la plataforma oficial Wplace. Hecho por fanáticos para fanáticos, esta Herramienta Wplace tiene como objetivo hacer la creación de píxeles más fácil y divertida.",
  },

  ja: {
    // FAQ complete translations
    "faq.a1": "Wplace ピクセルアート コンバーターは、あらゆる画像を美しいピクセルアートに変換する無料のオンライン ピクセルアート ジェネレーターです。私たちの Wplace ツールは高度な色マッピングを使用して、素晴らしい結果を作成します。",
    "faq.a2": "はい！Wplace ピクセルアート コンバーターは制限なしで完全に無料です。好きなだけピクセルアート作品を作成してください。",
    "faq.a3": "Wplace ピクセルアート コンバーターは PNG、JPG、JPEG、SVG 形式をサポートしています。任意の画像をアップロードして即座に変換してください。",
    "faq.a4": "いいえ！他のツールとは異なり、Wplace ピクセルアート コンバーターには画像サイズの制限がありません。私たちの強力な Wplace ツールであらゆる次元の画像を処理してください。",
    "faq.a5": "もちろんです！Wplace ピクセルアート コンバーターはブラウザー内でローカルにすべてを処理します。あなたの画像はデバイスから出ることはなく、完全なプライバシーを保証します。",
    "faq.a6": "はい！Wplace ピクセルアート コンバーターで作成されたアートは、個人または商用プロジェクトで自由に使用できます。私たちはあなたの作品に対して所有権を主張しません。",
    
    // User testimonials
    "testimonials.user1.name": "アレックス_ピクセル",
    "testimonials.user1.role": "Wplace ベテランプレイヤー",
    "testimonials.user1.quote": "この Wplace ツールは、私がプラットフォームでピクセルアートにアプローチする方法を完全に変革しました。このコンバーターを発見する前は、色の不一致の問題で画像を手動で変換するのに何時間も費やしていました。今では任意の画像をアップロードして、公式パレットでどのように見えるかを即座に確認できます。",
    "testimonials.user2.name": "マヤ_アーティスト",
    "testimonials.user2.role": "デジタルアート愛好家",
    "testimonials.user2.quote": "多くのピクセルアート コンバーターを試しましたが、この Wplace ツールは最も正確で使いやすいものです。自動色マッチング機能により、キャンバスに配置したときに私のアートワークが意図したとおりに正確に見えることが保証されます。",
    "testimonials.user3.name": "ロケット建造者",
    "testimonials.user3.role": "コミュニティリーダー",
    "testimonials.user3.quote": "私たちのチーム全体が大規模なコミュニティアートプロジェクトの調整にこの Wplace ツールに頼っています。精度と信頼性により、複雑なデザインの計画に不可欠なものになっています。グリッドオーバーレイは、複数の貢献者間でピクセル配置を調整するのに役立ちます。",
    "testimonials.user4.name": "サラ_ピクセル",
    "testimonials.user4.role": "クリエイティブデザイナー",
    "testimonials.user4.quote": "Wplace の詳細なアートワークを作成する人として、この wplace ツールは私の創造的なプロセスに革命をもたらしました。ディザリングやスケーリングオプションなどの高度な機能により、写真、ロゴ、オリジナルアートの変換において非常に多様性があります。",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "私たちの Wplace ピクセルアート クリエーターは使用料がかかりません。サブスクリプション、隠れた料金、変換の制限はありません。好きなだけピクセルアートを作成してください。",
    "features.privacy.detailed.desc": "すべてはブラウザー内でローカルに発生します。あなたの画像はデバイス上に留まります - 私たちはあなたのコンテンツをアップロード、保存、またはアクセスすることはありません。",
    "features.easy.detailed.desc": "複雑な設定や技術的知識は必要ありません。画像をアップロードするだけで、美しいピクセルアートに即座に変換されるのを見てください。",
    "features.unlimited.detailed.desc": "小さなアイコンから巨大なアートワークまで - 私たちのコンバーターはあらゆる次元の画像を処理します。ファイルサイズの制限や品質の妥協はありません。",
    
    // FAQ questions
    "faq.q1": "Wplace ピクセルアート コンバーターとは何ですか？",
    "faq.q2": "Wplace ピクセルアート コンバーターは本当に無料ですか？",
    "faq.q3": "Wplace ピクセルアート コンバーターはどの画像形式をサポートしていますか？",
    "faq.q4": "サイズ制限はありますか？",
    "faq.q5": "Wplace ピクセルアート コンバーターでデータは安全ですか？",
    "faq.q6": "生成されたアートを商用利用できますか？",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Wplace ペイントツール - Wplace プレイヤーの簡単な描画を支援 - 自由に使用、生成されたアートワークに対する所有権は主張しません",
    "footer.independent.desc": "このウェブサイトは、コミュニティのピクセルアートニーズに応えるために構築された独立したファン運営プロジェクトです。私たちは公式 Wplace プラットフォームと接続、後援、承認されていません。ファンによってファンのために作られた、この Wplace ツールはピクセル作成をより簡単で楽しいものにすることを目指しています。",
  },

  ko: {
    // FAQ complete translations  
    "faq.a1": "Wplace 픽셀 아트 변환기는 모든 이미지를 아름다운 픽셀 아트로 변환하는 무료 온라인 픽셀 아트 생성기입니다. 우리의 Wplace 도구는 고급 색상 매핑을 사용하여 놀라운 결과를 만듭니다.",
    "faq.a2": "네! Wplace 픽셀 아트 변환기는 제한 없이 완전히 무료입니다. 원하는 만큼 픽셀 아트 작품을 만드세요.",
    "faq.a3": "Wplace 픽셀 아트 변환기는 PNG, JPG, JPEG, SVG 형식을 지원합니다. 모든 이미지를 업로드하고 즉시 변환하세요.",
    "faq.a4": "아니요! 다른 도구와 달리 Wplace 픽셀 아트 변환기에는 이미지 크기 제한이 없습니다. 우리의 강력한 Wplace 도구로 모든 크기의 이미지를 처리하세요.",
    "faq.a5": "물론입니다! Wplace 픽셀 아트 변환기는 브라우저에서 로컬로 모든 것을 처리합니다. 당신의 이미지는 절대 당신의 장치를 떠나지 않으며, 완전한 개인정보를 보장합니다.",
    "faq.a6": "네! Wplace 픽셀 아트 변환기로 만든 아트는 개인 또는 상업적 프로젝트에 자유롭게 사용할 수 있습니다. 우리는 당신의 작품에 대한 소유권을 주장하지 않습니다.",
    
    // User testimonials
    "testimonials.user1.name": "알렉스_픽셀",
    "testimonials.user1.role": "Wplace 베테랑 플레이어",
    "testimonials.user1.quote": "이 Wplace 도구는 플랫폼에서 픽셀 아트에 접근하는 방식을 완전히 바꾸었습니다. 이 변환기를 발견하기 전에는 색상 불일치 문제로 이미지를 수동으로 변환하는 데 몇 시간을 보냈습니다. 이제 아무 이미지나 업로드하고 공식 팔레트로 어떻게 보일지 즉시 확인할 수 있습니다.",
    "testimonials.user2.name": "마야_아티스트",
    "testimonials.user2.role": "디지털 아트 애호가",
    "testimonials.user2.quote": "많은 픽셀 아트 변환기를 시도했지만, 이 Wplace 도구가 가장 정확하고 사용자 친화적입니다. 자동 색상 매칭 기능으로 캔버스에 배치했을 때 의도한 대로 정확히 보입니다.",
    "testimonials.user3.name": "로켓빌더",
    "testimonials.user3.role": "커뮤니티 리더",
    "testimonials.user3.quote": "우리 전체 팀이 대규모 커뮤니티 아트 프로젝트를 조정하기 위해 이 Wplace 도구에 의존하고 있습니다. 정밀도와 신뢰성으로 복잡한 디자인을 계획하는 데 없어서는 안 될 도구입니다. 격자 오버레이는 여러 기여자 간의 픽셀 배치를 조정하는 데 도움이 됩니다.",
    "testimonials.user4.name": "사라_픽셀",
    "testimonials.user4.role": "창의적 디자이너",
    "testimonials.user4.quote": "Wplace를 위한 세밀한 아트워크를 만드는 사람으로서, 이 wplace 도구는 제 창작 과정을 혁신했습니다. 디더링과 스케일링 옵션 같은 고급 기능으로 사진, 로고, 원본 아트 변환에 매우 다양하게 활용할 수 있습니다.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "우리의 Wplace 픽셀 아트 제작자는 사용 비용이 없습니다. 구독료, 숨겨진 수수료, 변환 제한이 없습니다. 원하는 만큼 픽셀 아트를 만드세요.",
    "features.privacy.detailed.desc": "모든 것이 브라우저에서 로컬로 발생합니다. 당신의 이미지는 장치에 그대로 남아있습니다 - 우리는 당신의 콘텐츠를 업로드, 저장 또는 액세스하지 않습니다.",
    "features.easy.detailed.desc": "복잡한 설정이나 기술적 지식이 필요하지 않습니다. 이미지를 업로드하고 아름다운 픽셀 아트로 즉시 변환되는 것을 보세요.",
    "features.unlimited.detailed.desc": "작은 아이콘부터 거대한 아트워크까지 - 우리의 변환기는 모든 크기의 이미지를 처리합니다. 파일 크기 제한이나 품질 타협이 없습니다.",
    
    // FAQ questions
    "faq.q1": "Wplace 픽셀 아트 변환기란 무엇인가요?",
    "faq.q2": "Wplace 픽셀 아트 변환기가 정말 무료인가요?",
    "faq.q3": "Wplace 픽셀 아트 변환기는 어떤 이미지 형식을 지원하나요?",
    "faq.q4": "크기 제한이 있나요?",
    "faq.q5": "Wplace 픽셀 아트 변환기에서 제 데이터가 안전한가요?",
    "faq.q6": "생성된 아트를 상업적으로 사용할 수 있나요?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Wplace 페인트 툴 - Wplace 플레이어의 쉬운 그리기 도움 - 자유롭게 사용, 생성된 아트워크에 대한 소유권 주장 없음",
    "footer.independent.desc": "이 웹사이트는 커뮤니티의 픽셀 아트 요구를 충족하기 위해 구축된 독립적인 팬 운영 프로젝트입니다. 우리는 공식 Wplace 플랫폼과 연결되거나 후원받거나 승인받지 않았습니다. 팬에 의해 팬을 위해 만들어진, 이 Wplace 도구는 픽셀 생성을 더 쉽고 재미있게 만드는 것을 목표로 합니다.",
  },

  tr: {
    // FAQ complete translations
    "faq.a1": "Wplace Piksel Sanat Dönüştürücü, herhangi bir görüntüyü güzel piksel sanatına dönüştüren ücretsiz bir çevrimiçi piksel sanat oluşturucusudur. Wplace aracımız çarpıcı sonuçlar elde etmek için gelişmiş renk haritalama kullanır.",
    "faq.a2": "Evet! Wplace Piksel Sanat Dönüştürücü sınırsız olarak tamamen ücretsizdir. İstediğiniz kadar piksel sanat eseri oluşturun.",
    "faq.a3": "Wplace Piksel Sanat Dönüştürücü PNG, JPG, JPEG ve SVG formatlarını destekler. Herhangi bir görüntü yükleyin ve anında dönüştürün.",
    "faq.a4": "Hayır! Diğer araçların aksine, Wplace Piksel Sanat Dönüştürücünün görüntü boyutu kısıtlaması yoktur. Güçlü Wplace aracımızla herhangi bir boyuttaki görüntüleri işleyin.",
    "faq.a5": "Kesinlikle! Wplace Piksel Sanat Dönüştürücü her şeyi tarayıcınızda yerel olarak işler. Görüntüleriniz cihazınızdan hiçbir zaman ayrılmaz ve tam gizlilik sağlar.",
    "faq.a6": "Evet! Wplace Piksel Sanat Dönüştürücü ile oluşturulan sanat kişisel veya ticari projeler için özgürce kullanabilirsiniz. Yaratımlarınız üzerinde hiçbir sahiplik iddiası bulunmuyoruz.",
    
    // User testimonials
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Wplace Deneyimli Oyuncu",
    "testimonials.user1.quote": "Bu Wplace Aracı platformdaki piksel sanatına yaklaşımımı tamamen dönüştürdü. Bu dönüştürücüyü keşfetmeden önce, renk uyumsuzlukları ile görüntüleri manuel olarak dönüştürmek için saatler harcıyordum. Artık herhangi bir görüntü yükleyebilir ve resmi paletle nasıl görüneceğini anında görebilirim.",
    "testimonials.user2.name": "Maya_Sanatçı",
    "testimonials.user2.role": "Dijital Sanat Meraklısı",
    "testimonials.user2.quote": "Birçok piksel sanat dönüştürücü denedim, ancak bu Wplace Aracı açık ara en doğru ve kullanıcı dostudur. Otomatik renk eşleme özelliği, sanat eserimi tuvale yerleştirdiğimde tam istediğim gibi görünmesini sağlar.",
    "testimonials.user3.name": "RoketYapıcısı",
    "testimonials.user3.role": "Topluluk Lideri",
    "testimonials.user3.quote": "Tüm ekibimiz büyük ölçekli topluluk sanat projeleri koordine etmek için bu Wplace Aracına güveniyor. Hassasiyet ve güvenilirlik, karmaşık tasarımları planlamak için vazgeçilmez kılıyor. Izgara kaplamaları, birden çok katkıda bulunan arasında piksel yerleştirmesini koordine etmemize yardımcı olur.",
    "testimonials.user4.name": "Sarah_Piksel",
    "testimonials.user4.role": "Yaratıcı Tasarımcı",
    "testimonials.user4.quote": "Wplace için detaylı sanat eserleri oluşturan biri olarak, bu wplace aracı yaratıcı sürecimi devrimleştirdi. Dithering ve ölçeklendirme seçenekleri gibi gelişmiş özellikler, fotoğrafları, logoları ve orijinal sanat eserlerini dönüştürmek için inanılmaz derecede çok yönlü kılıyor.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Wplace piksel sanat yaratıcımızın kullanımı hiçbir maliyeti yoktur. Abonelik, gizli ücret, dönüştürme sınırı yoktur. İstediğiniz kadar piksel sanat oluşturun.",
    "features.privacy.detailed.desc": "Her şey tarayıcınızda yerel olarak gerçekleşir. Görüntüleriniz cihazınızda kalır - içeriğinizi hiçbir zaman yüklemez, saklamaz veya erişmeyiz.",
    "features.easy.detailed.desc": "Karmaşık ayarlar veya teknik bilgi gerekmez. Sadece görüntünüzü yükleyin ve anında güzel piksel sanatına dönüştüğünü izleyin.",
    "features.unlimited.detailed.desc": "Küçük ikonlardan büyük sanat eserlerine kadar - dönüştürücümüz herhangi bir boyuttaki görüntüleri işler. Dosya boyutu kısıtlaması veya kalite uzlaşması yoktur.",
    
    // FAQ questions
    "faq.q1": "Wplace Piksel Sanat Dönüştürücü nedir?",
    "faq.q2": "Wplace Piksel Sanat Dönüştürücü gerçekten ücretsiz mi?",
    "faq.q3": "Wplace Piksel Sanat Dönüştürücü hangi görüntü formatlarını destekler?",
    "faq.q4": "Herhangi bir boyut sınırlaması var mı?",
    "faq.q5": "Wplace Piksel Sanat Dönüştürücü ile verilerim güvende mi?",
    "faq.q6": "Oluşturulan sanatı ticari olarak kullanabilir miyim?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Wplace Boyama Aracı - Wplace Oyuncularının Kolay Boyama Yapmasına Yardım - Ücretsiz kullanım, oluşturulan sanat eserleri üzerinde sahiplik iddiası yok",
    "footer.independent.desc": "Bu web sitesi, topluluğun piksel sanat ihtiyaçlarına hizmet etmek için inşa edilmiş bağımsız, hayran tarafından yürütülen bir projedir. Resmi Wplace platformu ile bağlantımız, sponsorluğumuz veya onayımız yoktur. Hayranlar tarafından hayranlar için yapılan, bu Wplace Aracı piksel oluşturmayı daha kolay ve eğlenceli hale getirmeyi amaçlar.",
  },

  gn: {
    // FAQ complete translations (Guaraní)
    "faq.a1": "Wplace Pixel Arte Moambue ha'e peteĩ pixel arte moheñoiha reigua eipurukuaáva, omoambuéva oimeraẽva ta'anga pixel arte porãitépe. Ore Wplace tembiporu oipuru sa'y ñembojoaju tenondegua ojejapo hagua apopyréva.",
    "faq.a2": "Heẽ! Wplace Pixel Arte Moambue nde'ãiva reiguáva ha ndaipórigi jejoko. Emoheñoi eipotáva pixel arte.",
    "faq.a3": "Wplace Pixel Arte Moambue omoneĩ PNG, JPG, JPEG ha SVG. Emondo oimeraẽva ta'anga ha emoambue pya'e.",
    "faq.a4": "Nahániri! Ambue tembiporu guive, Wplace Pixel Arte Moambue ndoguerekói ta'anga tuichakue jejoko. Emboguata oimeraẽva tuichakue ta'anga ore Wplace tembiporu ikatúva ndive.",
    "faq.a5": "Añete! Wplace Pixel Arte Moambue omba'apo opavave nde kundahára ryepýpe. Nde ta'anga araka'e ndosẽi nde mba'e'oka guive, omoañete tekoñemi tuichavéva.",
    "faq.a6": "Heẽ! Arte ojejapo hagua Wplace Pixel Arte Moambue ndive nde mba'éva eipuru hagua eipotáva aponde térã ñemuha tembiapo-pe. Ore ndoroikuaaséi jaikoha nde rembiapo rehe.",
    
    // User testimonials (Guaraní)
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Wplace Ñe'ẽmboyke Akãrapuha",
    "testimonials.user1.quote": "Ko Wplace Tembiporu omoambue tuichaiterei che jekuaa pixel arte rehe plataforma-pe. Ahechauka mboyve ko moambue, amano aravo pixel arte ñemoambue po guive sa'y ñembojoaju apañuãi reheve. Ko'ãgã ikatu amondo oimeraẽva ta'anga ha ahecha pya'e mba'éichapa ojehecháta sa'y ñembojoaju oikóva ndive.",
    "testimonials.user2.name": "Maya_Tembiasa",
    "testimonials.user2.role": "Arte Digital Ohayhúva",
    "testimonials.user2.quote": "Aiporu heta pixel arte moambuehe, ha katu ko Wplace Tembiporu tuichave hekopete ha oipurukuaáva. Sa'y ñembojoaju ijeheguíva rembiapo omoañete che tembiasa ojehechávo che apytépe amoĩ aja lienzo-pe.",
    "testimonials.user3.name": "Cohete Moheñoiha",
    "testimonials.user3.role": "Tekoha Motenondé",
    "testimonials.user3.quote": "Ore aty tuichakue ojokupyty ko Wplace Tembiporu rehe ombojehe hagua tekoha arte apopyre tuichaháicha. Pe hekopete ha ojeroviáva oguereko ojeporu haguã ñe'ẽmby iñapysẽ. Ko cuadrícula ñemombyta oipytyvõ ñandéve rombojoaju hagua pixel ñemohenda ambue oipytyvõva apytépe.",
    "testimonials.user4.name": "Sarah_Pixel",
    "testimonials.user4.role": "Mohenda Moheñoiha",
    "testimonials.user4.quote": "Tembiasa momba'apóva ramo Wplace-pe g̃uarã, ko wplace tembiporu omoambue che rembiapo moheñoiha. Umi tembiapoite ha tenondegua dithering ha escalado poravorã ojapo ijeheguíva oipuruháicha ta'anga, logotipos ha tembiasa ypykue omoambuékuaa.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Ore Wplace pixel arte moheñoiha ndahepymei eipuru. Ndaipóri ñemboheraguapy, viruta mokañy, térã moambue jejoko. Emoheñoi eipotáva pixel arte.",
    "features.privacy.detailed.desc": "Opavave oiko ne kundahárape tekoñemíme. Ne ta'anga opyta ne mba'e'okápe - araka'e ndorohupiséi, ñongatuséi térã rojepuru ne retepy.",
    "features.easy.detailed.desc": "Ndaipóri ñemboguejy iñapysẽva térã kuaapy teknikogua. Emondo año ne ta'anga ha ehecha oñemoambuévo pixel arte porãitépe pya'e.",
    "features.unlimited.detailed.desc": "Michĩva iconos guive tembiasa tuichaháicha - ore moambuehe ombopotĩ ta'anga oimeraẽva tuichakue. Ndaipóri marandurenda tuichakue jejoko térã porã ñemomichĩ.",
    
    // FAQ questions
    "faq.q1": "Mba'épa Wplace Pixel Arte Moambue?",
    "faq.q2": "Wplace Pixel Arte Moambue añetehápe reigua?",
    "faq.q3": "Mba'e ta'anga háicha omoneĩ Wplace Pixel Arte Moambue?",
    "faq.q4": "Oĩ mba'e tuichakue jejoko?",
    "faq.q5": "Che marandu hekorosã Wplace Pixel Arte Moambue ndive?",
    "faq.q6": "Ikatu eipuru arte ojeheñóiva ñemuha-pe?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Wplace Sa'y Tembiporu - Oipytyvõ Wplace Ñembosarái Sa'y haguã ndahasýiva - Reigua eipuru hagua, ndaipóri jaikoha tembiasa ojeheñói rehe",
    "footer.independent.desc": "Ko ñanduti renda ha'e peteĩ apopyre isãsóva, ohayhúva omboguatáva, oñemoheñóiva oipytyvõ hagua tekoha pixel arte remikotevẽ. Ore ndarojokói, ndoropatrosinaséi térã ndoroñemoneĩséi Wplace plataforma oikóva rehegua. Ojapohápe ohayhúva-pe g̃uarã, ko Wplace Tembiporu oipota ojapo pixel moheñói ndahasýiva ha vy'aitéva.",
  },

  mi: {
    // FAQ complete translations (Māori)
    "faq.a1": "Ko te Wplace Pixel Art Converter he taputapu atahua kore utu hei whakawhiti i nga whakaahua katoa ki nga taonga toi pixel ataahua. Ka whakamahi to matou taputapu Wplace i nga mapi tae aro-roa hei hanga i nga hua whakamiharo.",
    "faq.a2": "Ae! He kore utu katoa te Wplace Pixel Art Converter kaore he tauwhainga. Hangaia etahi mea toi pixel koe e hiahia ai.",
    "faq.a3": "Ka tautoko te Wplace Pixel Art Converter i nga ahua PNG, JPG, JPEG me SVG. Tukuna tetahi whakaahua me whakawhiti i taua wa.",
    "faq.a4": "Kaore! He rerekee i etahi atu taputapu, kaore he tauwhainga rahi whakaahua o te Wplace Pixel Art Converter. Tukatukaina nga whakaahua katoa o nga rahi katoa ki to matou taputapu Wplace kaha.",
    "faq.a5": "He pono! Ka mahia e te Wplace Pixel Art Converter nga mea katoa i roto i to kaitirotiro. Kaore o whakaahua e wehe atu i to taputapu, me te whakarite i te tino muna katoa.",
    "faq.a6": "Ae! Ko nga toi i hangaia ki te Wplace Pixel Art Converter nou hei whakamahi kore he tauwhainga mo nga kaupapa whaiaro, tauhokohoko ranei. Kaore matou e kii he nei matou nga mea na koe i hanga.",
    
    // User testimonials (Māori)
    "testimonials.user1.name": "Alex_Pixels",
    "testimonials.user1.role": "Takaro Tawhito Wplace",
    "testimonials.user1.quote": "Kua hurihia e tenei Taputapu Wplace taku whakatata ki te toi pixel i runga i te papatohu. I mua i taku kitea i tenei whakawhitinga, i pau ai nga haora ki te whakawhiti whakaahua na ringa me nga raru tae whakataurite. Inaianei ka taea e au te tuku whakaahua me kitea i taua wa me pehea ai te tirohanga ki te palette tawhito.",
    "testimonials.user2.name": "Maya_Ringatoi",
    "testimonials.user2.role": "Kaihiahia Toi Matihiko",
    "testimonials.user2.quote": "Kua mataku au i etahi maha o nga whakawhitinga toi pixel, engari ko tenei Taputapu Wplace he tino tika rawa me te ngawari hoki ki te whakamahi. Ka whakarite te taputapu whakataurite tae aunoa kia kitea ai taku toi i taku i whakaaro ai i ahau i whakanoho ai ki te kiri.",
    "testimonials.user3.name": "Kaihangatanga Rakete",
    "testimonials.user3.role": "Kaiarataki Hapori",
    "testimonials.user3.quote": "Ka whakapono to matou roopu katoa ki tenei Taputapu Wplace hei whakarite i nga kaupapa toi hapori nui. Ko te tika me te pono ka meinga ai hei mea mutunga kore mo te whakamahere hoahoa uaua. Ka awhina nga ahua mata hei whakarite i te whakanohonga pixel i waenganui i nga kaiwhakangao maha.",
    "testimonials.user4.name": "Sarah_Pixel",
    "testimonials.user4.role": "Kaiwhakahoahoa Auaha",
    "testimonials.user4.quote": "Hei tangata hanga toi tino rorohiko mo Wplace, kua whakahou tenei taputapu wplace i taku tahuhu auaha. Nga taputapu aro-roa penei i te dithering me nga whiringa whakatairanga ka meinga ai he taputapu takirua rawa mo te whakawhiti whakaahua, waitohu me nga toi taketake.",
    
    // Features detailed descriptions
    "features.free.detailed.desc": "Kaore he utu to matou kaihanga toi pixel Wplace. Kaore he ohaurunga, utu huna, tauwhainga whakawhiti ranei. Hangaia he toi pixel koe e hiahia ai.",
    "features.privacy.detailed.desc": "He mea katoa i roto i to kaitirotiro. Ka noho o whakaahua ki to taputapu - kaore matou e tuku, tiaki, uru ranei ki o ihirangi.",
    "features.easy.detailed.desc": "Kaore he whirihoranga uaua, matauranga hangarau ranei. Tukuna noa to whakaahua me matakitaki ki tana whakawhitinga ki te toi pixel ataahua i taua wa.",
    "features.unlimited.detailed.desc": "Mai i nga tohu iti ki nga mahi toi nui - ka mahia e ta matou whakawhitinga nga whakaahua katoa o nga rahi. Kaore he tauwhainga rahi kōnae, whakaiti kounga ranei.",
    
    // FAQ questions
    "faq.q1": "He aha te Wplace Pixel Art Converter?",
    "faq.q2": "He pono he kore utu te Wplace Pixel Art Converter?",
    "faq.q3": "He aha nga ahua whakaahua ka tautoko ai te Wplace Pixel Art Converter?",
    "faq.q4": "He aha nga tauwhainga rahi?",
    "faq.q5": "He haumaru oku raraunga ki te Wplace Pixel Art Converter?",
    "faq.q6": "Ka taea e au te whakamahi i te toi i hangaia mo nga tauhokohoko?",
    
    // Copyright and footer
    "footer.copyright": "© 2025 Wplace Paint Tool - Awhinatia nga Takaro Wplace ki te Peita Ngawari - Kore utu ki te whakamahi, kaore he tautohe nei matou ki nga toi i hangaia",
    "footer.independent.desc": "He kaupapa motuhake tenei paetukutuku, he kaupapa a nga kaiwhakapai, i hangaia hei whakangawari i nga hiahia toi pixel o te hapori. Kaore matou i honoa, whakatohatoha, whakaae ranei ki te papatohu tawhito Wplace. I hangaia e nga kaiwhakapai ma nga kaiwhakapai, he whainga o tenei Taputapu Wplace kia meinga ai te hanga pixel he mea ngawari, whakaatahua hoki.",
  }
};

// 现在更新所有语言文件
Object.keys(translations).forEach(lang => {
  const langFile = `lang/${lang}.json`;
  const existingTranslations = JSON.parse(fs.readFileSync(langFile, 'utf8'));
  
  // 合并新的翻译
  const updatedTranslations = { ...existingTranslations, ...translations[lang] };
  
  // 写回文件
  fs.writeFileSync(langFile, JSON.stringify(updatedTranslations, null, 2), 'utf8');
  console.log(`✅ Updated ${lang}.json with ${Object.keys(translations[lang]).length} new translations`);
});

console.log('🎉 All translations updated successfully!');