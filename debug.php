<?php
// 生产环境访问控制：仅本机或设置 ALLOW_DEBUG=1 时允许访问
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
$allowed = in_array($remote, ['127.0.0.1', '::1']) || getenv('ALLOW_DEBUG') === '1';
if (!$allowed) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo '403 Forbidden';
    exit;
}

// 最简单的PHP调试文件
echo "PHP is working! Time: " . date('Y-m-d H:i:s');
phpinfo();
?>
