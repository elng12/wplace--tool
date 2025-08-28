# 🚀 Wplace Paint Tool - 开发指南

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境启动
```bash
# 构建内联翻译并启动CSS监控
npm run dev

# 或分步执行
npm run build:i18n  # 生成内联翻译
npm run dev:css     # 启动CSS监控
```

### 本地服务器
```bash
# 使用Python (推荐用于本地测试)
npm run serve

# 使用Node.js
npm run serve:node
```

## 🛠️ 构建流程

### 完整构建
```bash
npm run build:all  # 构建翻译 + CSS
```

### 单独构建
```bash
npm run build:i18n  # 重新生成内联翻译
npm run build:css   # 构建CSS
```

## 📁 项目结构

```
wplace--tool/
├── index.html                 # 主页面
├── css/                      # 样式文件
│   ├── main.css             # 编译后的样式
│   └── source.css           # 源样式文件
├── js/                       # JavaScript文件
│   ├── app-simple.js        # 主应用逻辑
│   ├── i18n.js              # 国际化系统
│   ├── error-handler.js     # 错误处理
│   ├── inline-translations.js # 内联翻译(自动生成)
│   ├── performance-monitor.js # 性能监控
│   └── image-optimizer.js   # 图像优化
├── lang/                     # 翻译文件
│   ├── en.json              # 英文
│   ├── zh.json              # 中文
│   └── ...                  # 其他语言
└── blog/                     # 博客页面
```

## 🔧 开发工具

### 翻译管理
```bash
# 清理翻译文件
npm run clean:translations

# 分析翻译完整性
npm run analyze:translations

# 重新生成内联翻译
npm run build:i18n
```

### 样式开发
```bash
# 监控模式 - 实时编译
npm run dev:css

# 单次构建
npm run build:css
```

## 📊 性能监控

应用内置了性能监控系统，在开发环境下会自动输出性能报告：

- **页面加载时间**：监控整体加载性能
- **图像处理时间**：跟踪像素艺术转换耗时
- **语言切换时间**：监控多语言切换性能
- **错误统计**：自动记录和分析错误

### 查看性能数据
```javascript
// 在浏览器控制台中
window.performanceMonitor.generateReport()
window.performanceMonitor.getOptimizationSuggestions()
```

## 🖼️ 图像处理优化

内置了智能图像处理系统：

- **自动选择处理模式**：小图同步，大图异步
- **Web Worker池**：多线程处理提升性能
- **内存优化**：避免大图像处理时的内存溢出

### 使用方法
```javascript
// 自动选择最优处理方式
const result = await window.imageOptimizer.processImage(imageData, pixelSize, 'average');

// 强制使用异步处理
const result = await window.imageOptimizer.processImageAsync(imageData, pixelSize, 'average');

// 强制使用同步处理
const result = window.imageOptimizer.processImageSync(imageData, pixelSize, 'average');
```

## 🌐 多语言开发

### 添加新语言

1. **创建语言文件**
```bash
cp lang/en.json lang/新语言代码.json
```

2. **翻译内容**
编辑新创建的JSON文件

3. **重新生成内联翻译**
```bash
npm run build:i18n
```

4. **更新语言列表**
在 `js/i18n.js` 中添加新语言代码

### 翻译键命名规范

```javascript
{
  "页面.模块.元素": "翻译内容",
  "nav.home": "首页",
  "hero.title": "标题",
  "btn.download": "下载"
}
```

## 🚫 错误处理

应用具有完善的错误处理机制：

### 错误类型
- **资源加载错误**：CSS、JS、图像文件
- **网络错误**：CORS、fetch失败
- **处理错误**：图像处理、数据解析
- **用户操作错误**：文件格式、大小限制

### 开发环境调试
```javascript
// 查看错误统计
window.errorHandler.getErrorStats()

// 手动记录错误
window.errorHandler.handleError({
  type: 'custom',
  message: '自定义错误',
  details: { ... }
})
```

## 📝 代码规范

### JavaScript
- 使用现代ES6+语法
- 优先使用`const`，需要重新赋值时使用`let`
- 函数使用驼峰命名法
- 类使用帕斯卡命名法

### CSS
- 使用Tailwind CSS工具类
- 自定义样式放在`css/source.css`
- 遵循移动端优先原则

### HTML
- 所有文本内容使用`data-lang`属性标记
- 保持语义化标签使用
- 确保可访问性(aria标签)

## 🧪 测试

### 本地测试
```bash
# 启动本地服务器
npm run serve

# 访问 http://localhost:8000
```

### 功能测试清单
- [ ] 图像上传和处理
- [ ] 多语言切换
- [ ] 响应式设计
- [ ] 错误处理
- [ ] 性能表现

## 📦 部署

### 生产构建
```bash
npm run build:all
```

### 部署前检查
- [ ] 翻译文件完整性
- [ ] CSS样式正确编译
- [ ] 图像和资源文件可访问
- [ ] 错误处理功能正常
- [ ] 性能监控数据正常

## 🔍 调试技巧

### 浏览器开发者工具
- **Console**：查看错误和性能日志
- **Network**：监控资源加载
- **Performance**：分析运行时性能
- **Application**：检查本地存储

### 常见问题

**Q: 翻译不显示？**
A: 检查`js/inline-translations.js`是否最新，运行`npm run build:i18n`

**Q: 样式没更新？**
A: 运行`npm run build:css`重新编译

**Q: 图像处理很慢？**
A: 检查浏览器控制台的性能监控数据，考虑降低图像尺寸

## 📞 支持

遇到问题时：
1. 检查浏览器控制台错误信息
2. 查看性能监控报告
3. 参考此开发指南
4. 检查相关代码注释