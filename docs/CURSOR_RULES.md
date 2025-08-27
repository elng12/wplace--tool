# Cursor 使用规则

## 1. 一般工作流
1. 尽量 **一次性检索 / 阅读 / 编辑多个文件**；避免重复打开关闭。
2. **先搜索再编辑**：通过 grep 或 semantic search 确认影响范围后再动手。
3. 对大型改动，**先列 Todo**，逐项打勾，保持 PR 清晰、可回滚。

## 2. 文件编辑约定
- **最小可读 diff**：仅修改必要行，其余用 `// ... existing code ...` 占位。
- **行内注释**：
  ```js
  // fix: 修正空指针
  if (!user) return null;
  ```
- **提交信息**：采用 `类型: 范围 - 摘要`，如  `fix: i18n - load correct json on file://`

## 3. 目录与命名
| 类型            | 目录/前缀         | 说明                               |
|-----------------|-------------------|------------------------------------|
| 通用脚本        | `js/`             | 不依赖框架的纯 JS                   |
| 组件/模块       | `js/modules/`     | 单一职责，按功能拆分               |
| 语言文件        | `lang/`           | 命名 `en.json`、`zh.json` 等       |
| 资源            | `assets/`         | 图片、字体等静态资源               |
| 临时/草稿文件   | `sandbox/`        | 调试或实验代码，勿提交生产         |

## 4. CSS 规范
1. **Tailwind 优先**：能用类解决的不要写自定义 CSS。
2. 自定义样式集中到 `css/main.css`，避免散落在 HTML 内联。
3. 颜色、间距使用 CSS 变量或 Tailwind 预设，保持主题一致。

## 5. JavaScript 规范
- 必须使用 **ES6+**；开启 `'use strict';`。
- 禁用 `var`，全部使用 `const` / `let`。
- 函数尽量声明为 **箭头函数**，保持 this 语义一致。
- 异步操作使用 `async/await`；禁止裸 `.then()` 链式地狱。

## 6. 国际化 (i18n)
1. 页面文本统一写成 `data-lang="key"`，值放在 `lang/*.json`。
2. 新增文本时同步更新所有语言文件，英文放第一位。
3. 针对 file:// 预览，确保内联 fallback 在 `i18n.js` 中可用。

## 7. 性能与安全
- 图片处理统一放在 **Web Worker / Off-Main**，避免阻塞 UI。
- 禁止直接拼接 HTML 字符串；使用 DOM API 或模板字面量并 `textContent` 转义。
- 对外请求需显式设置 `mode`, `credentials`，防止隐式泄漏 Cookie。

## 8. 代码审查
- 每个 PR 至少 **1 名成员 Review** 后合并。
- 复杂逻辑请附 **单元测试 / 运行示例** 和性能对比截图。
- CI 必须通过 ESLint + Prettier + 单元测试才能合并。

## 9. 常用命令速查
```bash
# 本地开发
python -m http.server 8000

# 递归搜索关键词
cursor grep -i "todo" .

# 创建 todo
cursor todo "refactor i18n loading" 

# 执行并在后台运行脚本
cursor run "node scripts/build.js" --background
```

## 10. 常见坑
- **CORS**：直接双击 HTML 会因 file:// 跨域阻挡，请本地起服务器。
- **缓存**：更新 JS/CSS 后在引入处加 `?v=日期` 强制刷新。
- **AdSense**：`<script async …>` 只能插入一次，重复会报错。
