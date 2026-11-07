# 🥢 宝可梦夹夹乐

一个适合亲子一起玩的浏览器小游戏，支持单人冒泡锅和双人传送带。

## 玩法

- 单人：按空格或点“夹一下”。
- 双人：左边按 F，右边按 J，也可使用屏幕按钮。
- 共三关，每关 60 秒，目标依次为 5、8、10 只。
- 速度逐关提升，夹取范围逐关缩小；时间到或全部通关后本局结束。
- 关卡之间手动继续，不会自动开启新局。
- 背景音乐可开关，夹中有庆祝提示音。
- 收藏保存在当前浏览器中，单人、双人分别保存。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run dev
```

## GitHub Pages 构建

静态版与本地游戏共用同一套组件，发布时不需要服务器或数据库。

```sh
npm run test:game
npm run build:pages
npx vite preview --config vite.pages.config.ts
```

默认静态路径为 `/pokemon-chopstick-game/`。其他仓库名可通过环境变量指定：

```sh
PAGES_BASE_PATH=/your-repository/ npm run build:pages
```

构建产物在 `pages-dist/`，不提交到源码分支。

## 自动发布

仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**。
每次推送到 `main` 后，`.github/workflows/pages.yml` 会测试、构建并部署到 GitHub Pages。
工作流自动读取站点的子目录路径。

原来的本地 Vinext 开发配置保留，静态发布使用独立的 `vite.pages.config.ts`。
