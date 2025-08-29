#!/usr/bin/env python3
"""
简单的HTTP服务器，用于测试图片上传修复效果
使用方法：python test-server.py
然后在浏览器中访问 http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头，允许本地文件访问
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # 确保在正确的目录中运行
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"🚀 启动测试服务器...")
    print(f"📁 工作目录: {os.getcwd()}")
    print(f"🌐 服务器地址: http://localhost:{PORT}")
    print(f"📄 主页面: http://localhost:{PORT}/index.html")
    print(f"🔧 测试页面: http://localhost:{PORT}/test-upload-fix.html")
    print(f"⚠️  按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"✅ 服务器已启动在端口 {PORT}")
            
            # 自动打开浏览器
            try:
                webbrowser.open(f'http://localhost:{PORT}/test-upload-fix.html')
                print("🌐 已自动打开测试页面")
            except:
                print("⚠️  无法自动打开浏览器，请手动访问上述地址")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用，请尝试其他端口或关闭占用该端口的程序")
        else:
            print(f"❌ 启动服务器失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()