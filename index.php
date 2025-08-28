<?php
// 强制显示临时主页，不依赖index.html文件
// 设置正确的内容类型
header('Content-Type: text/html; charset=utf-8');
header('HTTP/1.1 200 OK'); // 确保返回200状态码

// 直接显示临时主页
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wplace Paint Tool - Temporary Version</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .content { margin: 20px 0; }
        .btn { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Wplace Paint Tool</h1>
        <p>Ultimate Pixel Art Toolkit for Wplace Players</p>
    </div>
    
    <div class="content">
        <h2>Welcome to Wplace Paint Tool!</h2>
        <p>Transform any image into stunning Wplace-compatible pixel art with our free converter.</p>
        
        <h3>🛠️ Tools Available:</h3>
        <ul>
            <li><a href="color-converter.php" class="btn">🎨 Color Converter</a></li>
            <li><a href="blog.html">📚 Tutorials & Guides</a></li>
            <li><a href="about.html">ℹ️ About Us</a></li>
        </ul>
        
        <h3>✨ Features:</h3>
        <ul>
            <li>✅ Free to use - no subscriptions or limits</li>
            <li>✅ Official Wplace 64-color palette support</li>
            <li>✅ Advanced dithering algorithms</li>
            <li>✅ Real-time preview</li>
            <li>✅ Privacy protected - all processing happens locally</li>
        </ul>
    </div>
    
    <footer style="text-align: center; margin-top: 40px; color: #666;">
        <p>© 2025 Wplace Paint Tool - Free Pixel Art Converter</p>
        <p><small>Temporary PHP version due to server configuration</small></p>
    </footer>
</body>
</html>';
?>
