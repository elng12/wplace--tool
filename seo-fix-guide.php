<?php
header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO修复指南 - 解决重定向问题</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .section { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 12px; margin: 10px 0; border-radius: 6px; border-left: 4px solid; }
        .ok { background: #d4edda; color: #155724; border-color: #28a745; }
        .warning { background: #fff3cd; color: #856404; border-color: #ffc107; }
        .error { background: #f8d7da; color: #721c24; border-color: #dc3545; }
        .info { background: #d1ecf1; color: #0c5460; border-color: #17a2b8; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; transition: background 0.3s; }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #1e7e34; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-warning:hover { background: #e0a800; }
        .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: "Courier New", monospace; overflow-x: auto; border: 1px solid #e9ecef; }
        .step { background: #f8f9ff; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 8px 0; }
        .checklist li:before { content: "✓ "; color: #28a745; font-weight: bold; }
        .nav { background: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .nav a { margin-right: 15px; text-decoration: none; color: #667eea; font-weight: 500; }
        .nav a:hover { text-decoration: underline; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="index.php">🏠 首页</a>
        <a href="server-diagnosis.php">🔍 服务器诊断</a>
        <a href="fix-redirects.php">🔧 修复工具</a>
        <a href="seo-fix-guide.php">📚 SEO修复指南</a>
    </nav>

    <div class="header">
        <h1>📈 SEO修复指南</h1>
        <p>解决Google Search Console中的"网页会自动重定向"问题</p>
    </div>

    <div class="section">
        <h2>🎯 问题概述</h2>
        <div class="error">
            <strong>问题：</strong>Search Console 发现网站上的某些网页由于以下新原因而无法被缓入索引：网页会自动重定向
        </div>
        
        <h3>常见原因分析：</h3>
        <div class="grid">
            <div class="info">
                <h4>1. 服务器级重定向</h4>
                <ul>
                    <li>Nginx/Apache强制HTTPS重定向</li>
                    <li>域名重定向配置</li>
                    <li>CDN层面的重定向</li>
                </ul>
            </div>
            <div class="warning">
                <h4>2. 应用级重定向</h4>
                <ul>
                    <li>.htaccess重写规则</li>
                    <li>PHP header()重定向</li>
                    <li>JavaScript重定向</li>
                </ul>
            </div>
            <div class="error">
                <h4>3. 配置冲突</h4>
                <ul>
                    <li>多重重定向链</li>
                    <li>循环重定向</li>
                    <li>协议冲突</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🔧 修复步骤</h2>
        
        <div class="step">
            <h3>步骤1: 诊断当前状态</h3>
            <p>首先运行完整的服务器诊断来识别问题：</p>
            <a href="server-diagnosis.php" class="btn btn-success">运行服务器诊断</a>
            <div class="code">
# 手动检查重定向
curl -I http://wplacetool.app
curl -I https://wplacetool.app
            </div>
        </div>

        <div class="step">
            <h3>步骤2: 修复Nginx配置</h3>
            <p>检查并修复nginx.conf中的重定向规则：</p>
            <div class="code">
# 当前配置已修复，移除了强制HTTPS重定向
# 如需重新启用HTTPS，请确保SSL证书正确配置

server {
    listen 80;
    server_name wplacetool.app www.wplacetool.app;
    
    # 网站根目录
    root /var/www/wplacetool.app;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
            </div>
        </div>

        <div class="step">
            <h3>步骤3: 修复Apache配置</h3>
            <p>使用自动修复工具处理.htaccess文件：</p>
            <a href="fix-redirects.php" class="btn btn-warning">自动修复配置</a>
            <p>或手动编辑.htaccess：</p>
            <div class="code">
# 禁用重定向，确保HTML文件正常访问
RewriteEngine Off

# 设置正确的MIME类型
AddType text/html .html
AddType text/html .htm

# 确保HTML文件可访问
&lt;FilesMatch "\.(html|htm)$"&gt;
    Order allow,deny
    Allow from all
    Require all granted
&lt;/FilesMatch&gt;
            </div>
        </div>

        <div class="step">
            <h3>步骤4: 验证修复结果</h3>
            <ul class="checklist">
                <li>检查主要页面是否可直接访问</li>
                <li>验证没有重定向循环</li>
                <li>确认HTTP状态码为200</li>
                <li>测试移动端和桌面端访问</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>🔍 验证工具</h2>
        <div class="grid">
            <div class="info">
                <h4>在线工具</h4>
                <ul>
                    <li><a href="https://httpstatus.io" target="_blank">HTTP Status Checker</a></li>
                    <li><a href="https://www.redirect-checker.org" target="_blank">Redirect Checker</a></li>
                    <li><a href="https://search.google.com/search-console" target="_blank">Google Search Console</a></li>
                </ul>
            </div>
            <div class="warning">
                <h4>命令行工具</h4>
                <div class="code">
# 检查HTTP响应
curl -I -L http://wplacetool.app

# 检查重定向链
curl -v http://wplacetool.app 2>&1 | grep "< HTTP"

# 测试特定页面
curl -I http://wplacetool.app/color-converter.html
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📊 Google Search Console 修复</h2>
        
        <div class="step">
            <h3>修复完成后的操作：</h3>
            <ol>
                <li><strong>验证修复：</strong>确保所有页面返回200状态码</li>
                <li><strong>请求重新抓取：</strong>在Search Console中请求重新抓取受影响的URL</li>
                <li><strong>提交站点地图：</strong>重新提交sitemap.xml</li>
                <li><strong>监控状态：</strong>等待24-48小时观察索引状态变化</li>
            </ol>
        </div>

        <div class="info">
            <h4>💡 预防措施</h4>
            <ul>
                <li>定期监控网站的HTTP状态码</li>
                <li>避免不必要的重定向链</li>
                <li>确保SSL证书配置正确</li>
                <li>使用301重定向而非302（如果必须重定向）</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>🚀 下一步行动</h2>
        <div class="grid">
            <a href="server-diagnosis.php" class="btn">1. 运行诊断</a>
            <a href="fix-redirects.php" class="btn">2. 自动修复</a>
            <a href="javascript:window.open(\'https://search.google.com/search-console\', \'_blank\')" class="btn">3. 检查Search Console</a>
        </div>
    </div>

    <footer style="text-align: center; margin-top: 40px; color: #666; padding: 20px;">
        <p>© 2025 Wplace Paint Tool - SEO优化指南</p>
        <p><small>如需技术支持，请查看完整的诊断报告</small></p>
    </footer>

    <script src="redirect-checker.js"></script>
</body>
</html>';
?>