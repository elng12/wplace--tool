@echo off
echo 🚀 启动Wplace图片工具测试服务器
echo.
echo 📁 当前目录: %CD%
echo 🌐 服务器将在 http://localhost:8000 启动
echo.
echo 📄 可用页面:
echo    主应用: http://localhost:8000/index.html
echo    尺寸测试: http://localhost:8000/test-image-size.html
echo    上传测试: http://localhost:8000/test-upload-fix.html
echo.
echo ⚠️  按 Ctrl+C 停止服务器
echo ==========================================
echo.

REM 检查Python是否可用
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python，请先安装Python
    echo 💡 建议: 从 https://python.org 下载并安装Python
    pause
    exit /b 1
)

REM 启动Python HTTP服务器
echo ✅ 启动服务器...
python -m http.server 8000

pause