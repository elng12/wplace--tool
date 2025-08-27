# 错误记忆文件

## 文案相关
- 当前文案过于冗长，需要更简洁有力
- 标题重复使用 "Wplace" 关键词，显得冗余
- 描述文字过长，用户注意力容易分散

### 已解决的问题
- ✅ 将标题改为 "Wplace Pixel Art Converter | Transform Images to Pixel Art"，避免冗长
- ✅ 精简副标题与功能描述，突出核心价值
- ✅ 减少重复使用 "Wplace" 关键词，提升可读性
- ✅ 全面替换 HTML 中的硬编码文案，确保与语言文件同步

## 技术相关
### 已解决
- ✅ 通过本地 HTTP 服务器 (python -m http.server 8000) 解决 file:// CORS 限制
- ✅ 为 <script src="js/app.js"> 添加版本参数 ?v=3 解决缓存问题
- ✅ 新增内联 CSS 修复移动端版式过大问题

### 新发现
- ⚠️ 误删 js/app.js 主入口脚本，导致语言加载与核心逻辑缺失

#### 待解决方案
```text
1. 查明是否有替代脚本 (如 app-final.js 等) 并更新 index.html 的引用；
2. 如果无替代脚本，需从历史版本恢复或重构 app.js。
```
