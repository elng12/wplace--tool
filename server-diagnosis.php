<?php
header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html>
<head>
    <title>服务器诊断 - Wplace Tool</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 20px auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 服务器诊断报告</h1>
    
    <h2>1. 基本信息</h2>
    <div class="info">
        <strong>服务器时间:</strong> ' . date('Y-m-d H:i:s') . '<br>
        <strong>PHP版本:</strong> ' . phpversion() . '<br>
        <strong>服务器软件:</strong> ' . ($_SERVER['SERVER_SOFTWARE'] ?? '未知') . '<br>
        <strong>文档根目录:</strong> ' . ($_SERVER['DOCUMENT_ROOT'] ?? '未知') . '<br>
        <strong>当前脚本:</strong> ' . $_SERVER['SCRIPT_NAME'] . '<br>
        <strong>请求URI:</strong> ' . $_SERVER['REQUEST_URI'] . '
    </div>
    
    <h2>2. 文件访问测试</h2>';

// 测试关键文件
$files_to_test = [
    'index.html' => 'HTML主页',
    'color-converter.html' => 'HTML颜色转换器',
    'about.html' => 'HTML关于页面',
    '.htaccess' => 'Apache配置',
    '_redirects' => 'Netlify重定向配置',
    'nginx.conf' => 'Nginx配置'
];

foreach ($files_to_test as $file => $description) {
    if (file_exists($file)) {
        $size = filesize($file);
        $readable = is_readable($file);
        $status = $readable ? 'ok' : 'warning';
        echo "<div class=\"$status\">✓ $description ($file): 存在, 大小: {$size}字节, 可读: " . ($readable ? '是' : '否') . "</div>";
    } else {
        echo "<div class=\"error\">✗ $description ($file): 不存在</div>";
    }
}

echo '<h2>3. HTTP头信息</h2>
    <div class="info">
        <pre>';
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        echo htmlspecialchars("$key: $value") . "\n";
    }
}
echo '</pre>
    </div>
    
    <h2>4. 重定向检测</h2>';

// 检查是否有重定向头
$headers = headers_list();
$redirect_found = false;
foreach ($headers as $header) {
    if (stripos($header, 'location:') === 0 || stripos($header, 'refresh:') === 0) {
        echo "<div class=\"error\">发现重定向头: " . htmlspecialchars($header) . "</div>";
        $redirect_found = true;
    }
}

if (!$redirect_found) {
    echo '<div class="ok">✓ 未发现重定向头</div>';
}

echo '<h2>5. 建议修复方案</h2>
    <div class="info">
        <h3>如果HTML文件无法访问:</h3>
        <ol>
            <li>检查.htaccess配置是否正确</li>
            <li>确保web服务器支持HTML文件</li>
            <li>检查文件权限设置</li>
            <li>验证nginx/apache配置</li>
        </ol>
        
        <h3>如果存在重定向问题:</h3>
        <ol>
            <li>移除nginx.conf中的强制HTTPS重定向</li>
            <li>检查.htaccess中的重写规则</li>
            <li>验证_redirects文件配置</li>
            <li>确保SSL证书正确配置</li>
        </ol>
    </div>
    
    <p><a href="index.php">← 返回主页</a> | <a href="color-converter.php">颜色转换器</a></p>
</body>
</html>';
?>