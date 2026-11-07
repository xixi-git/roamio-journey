# roamio-journey

A cooperative platform to craft travel itineraries with friends and showcase your global adventures

# 起点 · React Starter

一个面向新项目的 Vite + React + TypeScript 起点，内置 Tailwind CSS 4、React Router、Lucide React，以及可继续扩展的 shadcn/ui 组件基础。

## 开始使用

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 项目结构

```text
src/
├── components/ui/   # 可复用 UI 组件
├── lib/             # 通用工具
├── App.tsx          # 页面与路由
├── index.css        # Tailwind CSS 4 与全局样式
└── main.tsx         # 应用入口
```

路径别名 `@/` 指向 `src/`。shadcn/ui 的配置已放在 `components.json`；可以通过 shadcn CLI 按需添加组件。