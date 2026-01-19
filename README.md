# HiCode Vue Frontend

HiCode Vue 是 HiCode VS Code 扩展的前端项目，使用 Vue 3 + Vite 构建，为扩展提供聊天界面和设置页面的 Webview 资源。

## 项目概述

本项目是 HiCode AI Assistant VS Code 扩展的前端部分，包含两个主要页面：

- **Chat Page** (`/src/pages/chat`) - AI 聊天界面
- **Settings Page** (`/src/pages/settings`) - 扩展设置界面

构建后的资源会被复制到 `hicode` 扩展项目的 `media/` 目录，供 VS Code Webview 使用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite 7** - 下一代前端构建工具
- **TypeScript** - 类型安全的 JavaScript
- **Element Plus** - Vue 3 组件库
- **Marked** - Markdown 解析器
- **Highlight.js** - 代码语法高亮
- **Sass** - CSS 预处理器

## 前置要求

- **Node.js**: `^20.19.0 || >=22.12.0`
- **pnpm**: `>=8.0.0` (推荐) 或 npm

## 项目结构

```
hicode-vue/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── iconfont/        # 图标字体
│   │   ├── styles/          # 全局样式（variables, mixins）
│   │   └── *.svg            # SVG 图标
│   ├── components/          # Vue 组件
│   │   ├── base/           # 基础组件
│   │   └── business/       # 业务组件
│   ├── composables/         # Vue Composables
│   │   ├── useMessageHandler.ts
│   │   └── usePostMessage.ts
│   ├── pages/              # 页面入口
│   │   ├── chat/          # 聊天页面
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   └── src/
│   │   └── settings/      # 设置页面
│   │       ├── App.vue
│   │       ├── main.ts
│   │       └── src/
│   └── utils/             # 工具函数
│       └── messageType.ts
├── scripts/
│   └── package-migrate.mjs # 构建后复制脚本
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json
```

## 安装依赖

```bash
pnpm install
```

或使用 npm:

```bash
npm install
```

## 开发

### 开发模式

启动开发服务器（聊天页面）：

```bash
pnpm run serve:chat
```

启动开发服务器（设置页面）：

```bash
pnpm run serve:settings
```

开发服务器会在 `http://localhost:5173` 启动，支持热模块替换（HMR）。

### 预览构建结果

构建后预览：

```bash
# 预览聊天页面
pnpm run preview:chat

# 预览设置页面
pnpm run preview:settings
```

## 构建

### 构建单个页面

```bash
# 构建聊天页面
pnpm run build:chat

# 构建设置页面
pnpm run build:settings
```

### 构建所有页面

```bash
# 快速构建（不复制）
pnpm run build:fast

# 构建并复制到 hicode 扩展项目
pnpm run build:copy
```

`build:copy` 命令会：
1. 构建聊天和设置页面
2. 将构建产物复制到 `../hicode/media/` 目录

### 构建输出

构建后的文件会输出到：

- 聊天页面: `media/chatPage/`
- 设置页面: `media/settings/`

每个目录包含：
- `index.html` - HTML 入口文件
- `assets/` - JavaScript、CSS 和静态资源
- `favicon.ico` - 网站图标

## 代码质量

### 类型检查

```bash
pnpm run type-check
```

### 代码检查

```bash
# 运行所有检查
pnpm run lint

# 仅运行 oxlint
pnpm run lint:oxlint

# 仅运行 eslint
pnpm run lint:eslint
```

### 代码格式化

```bash
pnpm run format
```

## VS Code Webview 特殊处理

由于 VS Code Webview 环境的限制，项目包含了一些特殊的构建配置：

### 1. 字体文件 Base64 内联

`vite.config.ts` 中的 `createIconfontFixPlugin()` 会将字体文件（woff、woff2、ttf）转换为 base64 内联到 CSS 中，避免 Webview 中的路径解析问题。

### 2. 多模式构建

项目支持两种构建模式：
- `chat` - 构建聊天页面
- `settings` - 构建设置页面

每种模式有不同的入口文件和输出目录。

### 3. HTML 生成

生产构建时会自动生成包含正确资源引用的 `index.html` 文件。

## 与 HiCode 扩展集成

### 工作流程

1. **开发阶段**：在 `hicode-vue` 中开发前端界面
2. **构建阶段**：运行 `pnpm run build:copy` 构建并复制资源
3. **打包阶段**：在 `hicode` 扩展项目中运行 `npm run package` 打包扩展

### 构建脚本说明

`scripts/package-migrate.mjs` 脚本会：
- 清空 `../hicode/media` 目录
- 将构建后的 `media` 目录复制到扩展项目

如果目标目录不存在，脚本会提示输入正确的路径。

## 主要组件

### 基础组件 (`src/components/base/`)

- `HicodeDialog.vue` - 对话框组件
- `HicodeInput.vue` - 输入框组件
- `HicodeSelector.vue` - 选择器组件
- `HicodeTable.vue` - 表格组件
- `PromptList.vue` - 提示列表组件
- `PromptTabs.vue` - 提示标签页组件

### 业务组件 (`src/components/business/`)

- `ChatMessage.vue` - 聊天消息组件
- `CodeCompletion.vue` - 代码补全组件
- `ModelSelector.vue` - 模型选择器组件
- `PromptTemplate.vue` - 提示模板组件
- `ResourceInput.vue` - 资源输入组件
- `WelcomeView.vue` - 欢迎视图组件
- 等等...

### Composables

- `useMessageHandler.ts` - 处理与 VS Code 扩展的消息通信
- `usePostMessage.ts` - 封装 postMessage API

## 样式系统

项目使用 Sass 作为 CSS 预处理器，包含：

- `src/assets/styles/variables.scss` - 全局变量
- `src/assets/styles/mixins.scss` - 全局 Mixins
- `src/assets/styles/global.scss` - 全局样式

这些样式文件会在所有组件中自动导入（通过 Vite 配置）。

## 开发建议

### IDE 设置

推荐使用 [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展。

**注意**：需要禁用 Vetur 扩展，因为它与 Volar 冲突。

### 浏览器开发工具

推荐安装 Vue.js DevTools：

- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### TypeScript 支持

项目使用 `vue-tsc` 进行类型检查。在编辑器中需要安装 Volar 扩展以获得完整的 TypeScript 支持。

## 常见问题

### Q: 构建后字体图标不显示？

A: 确保运行了完整的构建流程（`build:copy`），字体文件会被自动转换为 base64 内联到 CSS 中。

### Q: 如何调试 Webview 中的问题？

A: 在 VS Code 中打开 Webview 开发者工具：
1. 打开命令面板（`Ctrl+Shift+P`）
2. 运行 "Developer: Open Webview Developer Tools"

### Q: 修改代码后需要重新构建吗？

A: 在开发模式下使用 `serve:chat` 或 `serve:settings` 会自动热更新。生产构建需要运行 `build:copy`。

### Q: 如何添加新的页面？

A: 
1. 在 `src/pages/` 下创建新页面目录
2. 在 `vite.config.ts` 中添加新的模式配置
3. 在 `package.json` 中添加对应的构建脚本

## 相关项目

- [hicode](../hicode) - HiCode VS Code 扩展主项目

## 许可证

[License information]

---

**Version**: 0.0.0  
**Last Updated**: 2024-12

Made with ❤️ by HiCode Team
