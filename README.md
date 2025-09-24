# 本地预览 sitemap.xml

提供两种本地静态服务方式，统一使用端口 8790。

## 启动

- Python（推荐，系统自带，工作目录需在项目根）：
  npm run serve:python:8790

- Node（http-server）：
  npm run serve:node:8790

然后在浏览器打开：
http://127.0.0.1:8790/sitemap.xml

若页面 404，请确认你是在项目根目录运行命令（包含 sitemap.xml），或端口未被其它程序占用。

## 本地预览打不开的排查流程（推荐）

1) 启动本地静态服务（二选一）
- Node：http://127.0.0.1:8790/（`npm run serve:node:8790`）
- Python：http://127.0.0.1:8790/（`npm run serve:python:8790`）

2) 若页面“空白/异常”，先清理 SW 与缓存
- 打开：http://127.0.0.1:8790/tools/sw-reset.html（或使用一键脚本：见下文）
- 点击“🧹 一键清理”，完成后回到首页刷新

3) 仍异常？更换端口以避开旧 SW 作用域
- 例如：`npx http-server -p 8888 -c-1 --cors`，然后打开 http://127.0.0.1:8888/

### 一键清理与预览脚本

- Mac/Linux：
  - `npm run dev:clean:unix`（默认端口 8888，可 `PORT=8889 npm run dev:clean:unix`）

- Windows：
  - `npm run dev:clean:win`（默认端口 8888，可 `scripts\dev-clean.bat 8889`）

脚本会：
- 启动本地静态服务器（Python http.server）
- 自动打开 `tools/sw-reset.html`，一键注销 SW、清空缓存与分析相关本地键

4) 注意事项
- 使用 `.php` 页面需启动 PHP 内建服务器：`php -S 127.0.0.1:8790 -t .`
- `debug.php`/`server-diagnosis.php` 等默认返回 403（安全防护）；本机放行需设置环境变量 `ALLOW_DEBUG=1` 后再访问。


## 停止服务（Windows PowerShell）

- 结束占用 8790 端口的进程：
  $p=(Get-NetTCPConnection -LocalPort 8790 -State Listen).OwningProcess; if($p){ Stop-Process -Id $p -Force }

## 备注

- sitemap.xml 中链接应保持为线上域名（https://wplacetool.app/），提交搜索引擎时以线上地址为准。
- 若需要改端口，可在 package.json 中调整脚本的端口号。
