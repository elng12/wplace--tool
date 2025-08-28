<?php
// 临时转换器页面
header('Content-Type: text/html; charset=utf-8');
header('HTTP/1.1 200 OK');

echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wplace Color Converter - Temporary Version</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .converter { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .upload-area:hover { border-color: #667eea; background: #f8f9ff; }
        .btn { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #5a6fd8; }
        .nav { background: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .nav a { margin-right: 15px; text-decoration: none; color: #667eea; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="index.php">🏠 首页</a>
        <a href="color-converter.php">🎨 颜色转换器</a>
        <a href="blog.html">📚 博客</a>
        <a href="about.html">ℹ️ 关于</a>
    </nav>

    <div class="header">
        <h1>🎨 Wplace Color Converter</h1>
        <p>Transform any image into Wplace-compatible pixel art</p>
    </div>
    
    <div class="converter">
        <h2>Image to Pixel Art Converter</h2>
        
        <div class="upload-area" onclick="alert('This is a temporary version. Full functionality will be restored once the server issue is resolved.')">
            <h3>📤 Click to Upload Image</h3>
            <p>Supports PNG, JPG formats</p>
            <p><small>⚠️ Temporary version - Click for more info</small></p>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>🛠️ Features (Will be restored):</h3>
            <ul>
                <li>✅ Official Wplace 64-color palette matching</li>
                <li>✅ Real-time preview with adjustable pixel size</li>
                <li>✅ Advanced Floyd-Steinberg dithering</li>
                <li>✅ Multiple scaling algorithms</li>
                <li>✅ Grid overlay for precise placement</li>
                <li>✅ Color usage statistics</li>
                <li>✅ High-quality downloads</li>
            </ul>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>🔧 Server Issue Notice</h4>
            <p>We are currently experiencing a server configuration issue that prevents HTML files from loading properly. Our team is working to resolve this issue.</p>
            <p><strong>Current Status:</strong> PHP files work, HTML files are blocked</p>
            <p><strong>Expected Resolution:</strong> 24-48 hours</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn" onclick="alert('Full converter will be available once server issue is resolved. Thank you for your patience!')">
                🔄 Check Status
            </button>
        </div>
    </div>
    
    <footer style="text-align: center; margin-top: 40px; color: #666;">
        <p>© 2025 Wplace Paint Tool - Free Pixel Art Converter</p>
        <p><small>Temporary PHP version - Full functionality coming soon</small></p>
    </footer>
</body>
</html>';
?>
