<?php
header('Content-Type: text/html; charset=utf-8');

// 测试各个页面的可访问性
function testPageAccess($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // 不跟随重定向
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true); // 只获取头部
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'url' => $url,
        'status_code' => $httpCode,
        'redirect_url' => $redirectUrl,
        'error' => $error,
        'response_headers' => $response
    ];
}

echo '<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面访问测试 - Wplace Tool</title>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3219924658522446"
         crossorigin="anonymous"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .test-result { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-200 { border-left: 5px solid #28a745; }
        .status-301, .status-302 { border-left: 5px solid #ffc107; }
        .status-404 { border-left: 5px solid #dc3545; }
        .status-error { border-left: 5px solid #6c757d; }
        .nav { background: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .nav a { margin-right: 15px; text-decoration: none; color: #667eea; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
        .btn { background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 5px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; }
        .summary { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="index.php">🏠 首页</a>
        <a href="server-diagnosis.php">🔍 服务器诊断</a>
        <a href="fix-redirects.php">🔧 修复工具</a>
        <a href="seo-fix-guide.php">📚 SEO指南</a>
        <a href="test-pages.php">🧪 页面测试</a>
    </nav>

    <div class="header">
        <h1>🧪 页面访问测试</h1>
        <p>检测网站各页面的HTTP状态和重定向情况</p>
    </div>';

// 要测试的页面列表
$pages_to_test = [
    'http://localhost/index.html' => '主页 (HTML)',
    'http://localhost/index.php' => '主页 (PHP)',
    'http://localhost/color-converter.html' => '颜色转换器 (HTML)',
    'http://localhost/color-converter.php' => '颜色转换器 (PHP)',
    'http://localhost/about.html' => '关于页面',
    'http://localhost/blog.html' => '博客页面',
    'http://localhost/privacy.html' => '隐私政策',
    'http://localhost/terms.html' => '服务条款',
    'http://localhost/404.html' => '404页面',
    'http://localhost/robots.txt' => 'Robots.txt',
    'http://localhost/sitemap.xml' => '站点地图'
];

$results = [];
$summary = [
    'total' => count($pages_to_test),
    'success' => 0,
    'redirects' => 0,
    'errors' => 0
];

echo '<div class="summary">
    <h3>📊 测试概览</h3>
    <p>正在测试 ' . count($pages_to_test) . ' 个页面的访问状态...</p>
</div>';

foreach ($pages_to_test as $url => $description) {
    $result = testPageAccess($url);
    $results[] = $result;
    
    // 统计结果
    if ($result['status_code'] == 200) {
        $summary['success']++;
        $statusClass = 'status-200';
        $statusIcon = '✅';
        $statusText = '正常访问';
    } elseif (in_array($result['status_code'], [301, 302, 307, 308])) {
        $summary['redirects']++;
        $statusClass = 'status-301';
        $statusIcon = '🔄';
        $statusText = '重定向';
    } elseif ($result['status_code'] == 404) {
        $summary['errors']++;
        $statusClass = 'status-404';
        $statusIcon = '❌';
        $statusText = '页面不存在';
    } else {
        $summary['errors']++;
        $statusClass = 'status-error';
        $statusIcon = '⚠️';
        $statusText = '访问错误';
    }
    
    echo "<div class=\"test-result $statusClass\">
        <h4>$statusIcon $description</h4>
        <p><strong>URL:</strong> $url</p>
        <p><strong>状态码:</strong> {$result['status_code']} - $statusText</p>";
    
    if ($result['redirect_url']) {
        echo "<p><strong>重定向到:</strong> {$result['redirect_url']}</p>";
    }
    
    if ($result['error']) {
        echo "<p><strong>错误:</strong> {$result['error']}</p>";
    }
    
    if ($result['response_headers']) {
        echo "<details>
            <summary>查看响应头</summary>
            <pre>" . htmlspecialchars($result['response_headers']) . "</pre>
        </details>";
    }
    
    echo "</div>";
}

echo '<div class="summary">
    <h3>📈 测试结果汇总</h3>
    <ul>
        <li>✅ 正常访问: ' . $summary['success'] . ' 个页面</li>
        <li>🔄 发生重定向: ' . $summary['redirects'] . ' 个页面</li>
        <li>❌ 访问错误: ' . $summary['errors'] . ' 个页面</li>
    </ul>';

if ($summary['redirects'] > 0) {
    echo '<div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <strong>⚠️ 发现重定向问题</strong><br>
        有 ' . $summary['redirects'] . ' 个页面存在重定向，这可能是导致Google Search Console报告问题的原因。
        <br><a href="fix-redirects.php" class="btn">立即修复</a>
    </div>';
}

if ($summary['success'] == $summary['total']) {
    echo '<div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <strong>🎉 所有页面访问正常！</strong><br>
        没有发现重定向问题，可以在Google Search Console中请求重新抓取。
    </div>';
}

echo '</div>

<div style="text-align: center; margin: 30px 0;">
    <a href="server-diagnosis.php" class="btn">🔍 详细诊断</a>
    <a href="fix-redirects.php" class="btn">🔧 修复问题</a>
    <a href="javascript:location.reload()" class="btn">🔄 重新测试</a>
</div>

<footer style="text-align: center; margin-top: 40px; color: #666;">
    <p>© 2025 Wplace Paint Tool - 页面访问测试工具</p>
    <p><small>测试时间: ' . date('Y-m-d H:i:s') . '</small></p>
</footer>

</body>
</html>';
?>