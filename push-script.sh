#!/bin/bash

echo "🔧 配置Git用户信息..."
git config --global user.name "elng12"
git config --global user.email "2296744453m@gmail.com"

echo "📤 尝试推送到GitHub..."
echo "如果需要认证，请输入GitHub用户名和Personal Access Token"

# 尝试推送
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
else
    echo "❌ 推送失败，可能需要手动处理认证"
    echo "请运行以下命令手动推送："
    echo "cd /mnt/f/Git\\ des/wplace--tool"
    echo "git push origin main"
fi