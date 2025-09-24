@echo off
setlocal EnableDelayedExpansion

REM 一键启动本地服务并打开 SW 清理页面（Windows）
REM 用法：scripts\dev-clean.bat [PORT]

set PORT=%1
if "%PORT%"=="" set PORT=8888
set HOST=127.0.0.1
set URL=http://%HOST%:%PORT%/tools/sw-reset.html

REM 选择 Python 解释器（优先 py -3）
where py >NUL 2>NUL
if %ERRORLEVEL%==0 (
  set PY=py -3
) else (
  where python >NUL 2>NUL
  if %ERRORLEVEL%==0 (
    set PY=python
  ) else (
    echo [ERR] 未找到 Python。可选：npx http-server -p %PORT% -c-1 --cors
    goto :OPEN
  )
)

echo [INFO] 启动本地服务器：%PY% -m http.server %PORT% --bind %HOST%
start "local-server" cmd /c %PY% -m http.server %PORT% --bind %HOST%

:OPEN
REM 等待服务就绪
ping -n 2 127.0.0.1 >NUL 2>NUL

echo [INFO] 打开 SW 清理页面：%URL%
start "" %URL%

echo [TIP ] 若仍受旧 SW 干扰，请改用不同端口：scripts\dev-clean.bat 8889
echo [TIP ] 关闭窗口不会停止 http.server 进程，请在任务管理器结束或改端口重启。

endlocal
exit /b 0

