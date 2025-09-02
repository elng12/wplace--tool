<?php
header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html>
<head>
    <title>修复重定向问题 - Wplace Tool</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .ok { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .warning { background: #fff3cd; color: #856404; }
        .btn { background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 5px; }
    </style>
</head>
<body>
    <h1>🔧 修复重定向问题</h1>';

if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'fix_htaccess':
            $htaccess_content = '# 修复HTML文件访问问题
AddType text/html .html
AddType text/html .htm

# 确保HTML文件正确处理
<Files "*.html">
    Header set Content-Type "text/html; charset=utf-8"
</Files>

# 允许访问所有HTML文件
<FilesMatch "\.(html|htm)$">
    Order allow,deny
    Allow from all
    Require all granted
</FilesMatch>

# 移除可能的执行限制
<Files "*.html">
    RemoveHandler .html
    RemoveType .html
    AddType text/html .html
</Files>

# 禁用自动重定向
RewriteEngine Off';
            
            if (file_put_contents('.htaccess', $htaccess_content)) {
                echo '<div class="ok">✓ .htaccess 文件已更新，移除了重定向规则</div>';
            } else {
                echo '<div class="error">✗ 无法写入 .htaccess 文件</div>';
            }
            break;
            
        case 'fix_redirects':
            $redirects_content = '# 确保所有 HTML 页面都能正确访问（无重定向）
/color-converter.html /color-converter.html 200
/about.html /about.html 200
/blog.html /blog.html 200
/privacy.html /privacy.html 200
/terms.html /terms.html 200
/simple.html /simple.html 200

# 处理不存在的页面
/* /404.html 404';
            
            if (file_put_contents('_redirects', $redirects_content)) {
                echo '<div class="ok">✓ _redirects 文件已更新</div>';
            } else {
                echo '<div class="error">✗ 无法写入 _redirects 文件</div>';
            }
            break;
            
        case 'test_html':
            if (file_exists('index.html')) {
                echo '<div class="ok">✓ index.html 存在</div>';
                echo '<div class="warning">尝试访问: <a href="index.html" target="_blank">index.html</a></div>';
            } else {
                echo '<div class="error">✗ index.html 不存在</div>';
            }
            break;
    }
}

echo '
    <h2>可用的修复选项:</h2>
    
    <form method="post" style="margin: 20px 0;">
        <input type="hidden" name="action" value="fix_htaccess">
        <button type="submit" class="btn">修复 .htaccess 配置</button>
        <p><small>移除可能导致重定向的Apache重写规则</small></p>
    </form>
    
    <form method="post" style="margin: 20px 0;">
        <input type="hidden" name="action" value="fix_redirects">
        <button type="submit" class="btn">修复 _redirects 配置</button>
        <p><small>确保Netlify重定向配置正确</small></p>
    </form>
    
    <form method="post" style="margin: 20px 0;">
        <input type="hidden" name="action" value="test_html">
        <button type="submit" class="btn">测试HTML文件访问</button>
        <p><small>检查HTML文件是否可以正常访问</small></p>
    </form>
    
    <h2>手动检查步骤:</h2>
    <ol>
        <li>运行 <a href="server-diagnosis.php">服务器诊断</a></li>
        <li>检查Google Search Console中的具体错误信息</li>
        <li>使用浏览器开发者工具查看网络请求</li>
        <li>验证SSL证书配置（如果使用HTTPS）</li>
    </ol>
    
    <p><a href="index.php">← 返回主页</a> | <a href="server-diagnosis.php">服务器诊断</a></p>
</body>
</html>';
?>