# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个为 Wplace 游戏设计的在线像素艺术工具，提供图像到像素艺术的转换、颜色匹配和多语言支持。主要功能包括：
- 图像上传和像素艺术转换
- Wplace 官方 64 色调色板匹配
- 多语言国际化支持 (11种语言)
- PWA 支持和性能监控
- 批处理和 Web Worker 优化

## 常用开发命令

### 开发环境
```bash
npm run dev              # 构建内联翻译并启动CSS监控
npm run build:i18n       # 生成内联翻译文件
npm run dev:css          # 启动CSS监控模式
npm run serve           # 启动Python本地服务器 (推荐)
npm run serve:node      # 启动Node.js服务器
```

### 构建和部署
```bash
npm run build:all       # 完整构建 (翻译 + CSS)
npm run build:prod      # 生产构建 (清理 + 构建)
npm run build:css       # 构建CSS (生产模式)
npm run clean           # 清理构建文件
```

### 翻译管理
```bash
npm run lint:i18n           # 验证翻译文件完整性
npm run clean:translations  # 清理翻译文件
npm run analyze:translations # 分析翻译完整性
npm run watch:lang          # 监控翻译文件变化
```

## 核心架构

### 模块化系统
- **OptimizedI18nSystem** (js/i18n.js): 轻量级国际化系统，支持内联翻译和动态加载
- **ImageOptimizer** (js/image-optimizer.js): 多线程图像处理系统，使用Web Worker池
- **EnhancedErrorHandler** (js/error-handler.js): 统一错误管理和用户友好的错误提示
- **UIComponents** (js/ui-components.js): 可复用UI组件系统
- **PerformanceMonitor** (js/performance-monitor.js): 实时性能监控和优化建议

### 翻译系统架构
项目使用双层翻译系统：
1. **运行时加载**: 通过 fetch() 从 lang/*.json 动态加载
2. **内联后备**: generate-inline-translations.js 生成内联翻译到 js/inline-translations.js，解决 file:// 协议限制

所有文本使用 `data-lang="key"` 属性标记，翻译键采用 "页面.模块.元素" 命名约定。

### 图像处理流程
1. **智能处理模式选择**: 小图同步处理，大图使用Web Worker异步处理
2. **Wplace调色板匹配**: 64色官方调色板，自动色彩空间转换
3. **性能优化**: 内存管理、进度反馈、错误恢复

## 重要文件说明

### 自动生成文件
- `js/inline-translations.js` - 由 generate-inline-translations.js 生成，勿手动编辑
- `css/main.css` - 由 Tailwind 编译生成，源文件是 css/source.css

### 配置文件
- `package.json` - NPM脚本和依赖管理
- `tailwind.config.js` - Tailwind CSS配置
- `manifest.json` - PWA清单文件
- `docs/CURSOR_RULES.md` - 代码规范和开发约定

## 开发注意事项

### CORS 和协议限制
- 本地开发必须使用HTTP服务器，直接打开HTML文件会因 file:// 协议导致CORS错误
- 翻译系统设计了内联后备机制来处理 file:// 协议限制

### 缓存问题
- JS/CSS文件更新后需要在引入处添加版本参数 `?v=日期` 强制刷新
- 浏览器可能缓存翻译数据，开发时注意清缓存

### 性能考虑
- 大图像处理使用Web Worker避免阻塞UI线程
- 批处理功能支持多文件同时处理
- 内置性能监控，可通过 `window.performanceMonitor.generateReport()` 查看报告

### 错误处理
- 全局错误捕获系统，统一处理JavaScript错误、资源加载失败等
- 开发环境下在控制台输出详细错误信息
- 生产环境提供用户友好的错误提示

### 代码规范
- 使用现代ES6+语法，严格模式
- 优先使用Tailwind CSS类，自定义样式集中在css/source.css
- 所有用户界面文本必须使用data-lang属性进行国际化
- 遵循中文注释和错误提示的约定