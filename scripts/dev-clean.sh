#!/usr/bin/env bash
set -euo pipefail

# 一键启动本地服务并打开 SW 清理页面
# 用法：PORT=8888 bash scripts/dev-clean.sh

PORT="${PORT:-8888}"
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}/tools/sw-reset.html"

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$root_dir"

pick_python() {
  if command -v python3 >/dev/null 2>&1; then echo python3; return; fi
  if command -v python >/dev/null 2>&1; then echo python; return; fi
  echo ""; return 1
}

PY_CMD="$(pick_python || true)"
if [[ -z "$PY_CMD" ]]; then
  echo "[ERR] 未找到 Python，请先安装 Python 或使用 npm 的 http-server。"
  echo "      可选：npx http-server -p ${PORT} -c-1 --cors"
  exit 1
fi

echo "[INFO] 启动本地服务器：${PY_CMD} -m http.server ${PORT} --bind ${HOST}"
"${PY_CMD}" -m http.server "${PORT}" --bind "${HOST}" >/dev/null 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

# 等待端口就绪
sleep 1

open_url() {
  if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 && return; fi
  if command -v open >/dev/null 2>&1; then open "$URL" >/dev/null 2>&1 && return; fi
  echo "[INFO] 请在浏览器打开：$URL"
}

echo "[INFO] 打开 SW 清理页面：$URL"
open_url || true

echo "[TIP ] 关闭此脚本将自动停止本地服务器。"
echo "[TIP ] 若仍受旧 SW 干扰，请改用不同端口：PORT=8889 bash scripts/dev-clean.sh"

# 保持前台，直到用户中断
wait "$SERVER_PID"

