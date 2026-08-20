# 牛来看盘神器 · 项目接续记忆

> 后续 ChatGPT / Codex / AI
> 接手本项目时，开始改代码前必须先阅读本文件。每次完成并验证一轮已批准的功能改动后，必须同步更新本文件的"当前状态
> / 已验证 / 待办"。

最后更新：2026-08-20（Asia/Shanghai）

## 1. 项目定位

"牛来看盘神器"是一个 Electron
桌面宠物项目：透明、无边框、置顶，用黄色牛精灵展示 A
股行情、交易时段动作、口号和设置面板。

当前项目采用：

-   Google Drive：源码共享
-   macOS：独立开发环境
-   Windows：独立开发环境
-   成品目录：只保存发布版本

Canonical Google Drive 源码目录：

`1cESuebt3qc6C3msg7PXorEIga5Pic9C0`

当前核心文件：

-   `niulai-ticker.html`
-   `main.js`
-   `package.json`
-   `preload.js`
-   `spritesheet.webp`
-   `memory.md`

## 2. 开发环境规则

### macOS 开发环境

目录：

`/Users/naiwy/Developer/Electron开发环境/项目目录/牛看盘`

用途：

-   macOS 开发
-   调试
-   npm install
-   npm start
-   macOS 独立打包

允许：

-   node_modules（Mac本机生成）
-   dist（Mac本机生成）

禁止：

-   与 Windows 共用 node_modules
-   与 Windows 共用 dist
-   复制 Windows 运行环境到 Mac

### Windows 开发环境

目录：

`E:\Developer\Electron开发环境\项目目录\牛看盘`

用途：

-   Windows 开发
-   调试
-   npm install
-   npm start
-   Windows 独立打包

允许：

-   node_modules（Win本机生成）
-   dist（Win本机生成）

禁止：

-   与 Mac 共用 node_modules
-   与 Mac 共用 dist

### 成品目录

macOS：

`/Users/naiwy/MoonyMac/牛来看盘神器MAC`

Windows：

`E:\Moony\MoonyMade\牛来看盘神器Win`

用途：

只保存：

-   app
-   dmg
-   exe
-   安装包
-   历史版本

禁止：

-   修改源码
-   npm install
-   npm start

## 3. 源码管理规则

Google Drive 只保存：

-   main.js
-   preload.js
-   package.json
-   package-lock.json
-   html
-   assets
-   文档

禁止：

-   node_modules
-   dist
-   build缓存
-   临时日志

计划迁移：

GitHub 私有仓库作为正式源码管理工具。

Git管理：

包含：

-   源码
-   配置文件
-   素材
-   文档

不包含：

-   node_modules
-   dist
-   app
-   dmg
-   exe

## 4. AI协作规则

修改代码前：

1.  先阅读 memory.md
2.  再读取当前 canonical 源码
3.  不修改 node_modules
4.  不修改 dist
5.  保持 macOS / Windows 兼容
6.  完成修改后更新本文件

永远区分：

-   已修改源码
-   已同步云端
-   已写入本机
-   已重新打包

## 5. 当前功能状态

（以下保留原文件中的功能状态记录）

-   时间模拟器
-   缩放 / 动画 / 文案
-   设置 HUD
-   自选标的菜单
-   搜索与行情链路
-   行情健康状态

详细功能记录继续沿用原 memory.md 内容。

## 6. 当前迁移状态

当前准备：

1.  完成 macOS / Windows 开发环境规范整理
2.  将源码管理迁移到 Git
3.  Google Drive 转为备份与文档用途

Git首次提交基准：

-   main.js
-   preload.js
-   package.json
-   package-lock.json
-   html
-   assets
-   memory.md

不提交：

-   node_modules
-   dist
-   发布文件

## 核心原则

云端管理代码

本地管理环境

系统独立打包

项目独立运行
