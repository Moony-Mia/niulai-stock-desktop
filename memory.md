# 牛来看盘神器 · 项目接续记忆

> 后续 ChatGPT / Codex / AI 接手本项目时，开始改代码前必须先阅读本文件。每次完成并验证一轮已批准的功能改动后，必须同步更新本文件。

最后更新：2026-08-20（Asia/Shanghai）

## 1. 项目定位

“牛来看盘神器”是 Electron 桌面宠物项目：透明、无边框、置顶，用黄色牛精灵展示 A 股行情、交易时段动作、口号和设置面板。

当前项目采用：

- GitHub：唯一源码仓库
- macOS：独立开发环境
- Windows：独立开发环境
- Google Drive：文档、素材和备份
- 成品目录：只保存发布版本

Canonical 源码仓库：

https://github.com/Moony-Mia/niulai-stock-desktop

当前核心文件：

- niulai-ticker.html
- main.js
- package.json
- preload.js
- spritesheet.webp
- memory.md

## 2. 开发环境规则

### macOS 开发环境

目录：

`/Users/naiwy/Developer/Electron开发环境/项目目录/牛看盘`

用途：

- macOS 开发
- 调试
- npm install
- npm start
- macOS 独立打包

允许：

- node_modules（Mac本机生成）
- dist（Mac本机生成）

禁止：

- 与 Windows 共用 node_modules
- 与 Windows 共用 dist
- 复制 Windows 运行环境到 Mac

Mac 成品目录：

`/Users/naiwy/MoonyMac/牛来看盘神器MAC`

只保存：

- app
- dmg
- 历史版本

---

### Windows 开发环境

目录：

`E:\Developer\Electron开发环境\项目目录\牛看盘`

用途：

- Windows 开发
- 调试
- npm install
- npm start
- Windows 独立打包

允许：

- node_modules（Win本机生成）
- dist（Win本机生成）

禁止：

- 与 Mac 共用 node_modules
- 与 Mac 共用 dist

Windows 成品目录：

`E:\Moony\MoonyMade\牛来看盘神器Win`

## 3. 源码管理规则

GitHub 是唯一源码来源。

Git管理：

包含：

- 源码
- 配置文件
- 素材
- 文档
- memory.md

不包含：

- node_modules
- dist
- app
- dmg
- exe

Google Drive 用于：

- 文档
- 设计素材
- 备份文件

## 4. Git工作流

开发电脑开始工作：

```bash
git pull
```

修改后：

```bash
git add .
git commit -m "修改说明"
git push
```

另一台电脑同步：

```bash
git pull
```

## 5. AI协作规则

修改代码前：

1. 先阅读 memory.md
2. 确认当前 GitHub 源码状态
3. 不修改 node_modules
4. 不修改 dist
5. 保持 macOS / Windows 兼容
6. 修改后更新 changelog

永远区分：

- 已修改源码
- 已提交 Git
- 已同步 GitHub
- 已生成成品

## 6. 当前迁移状态

已完成：

1. macOS 开发环境整理
2. Windows 开发环境整理
3. GitHub 源码迁移
4. 双系统独立 node_modules
5. 双系统独立打包环境

---

## 7. Windows环境同步状态

更新时间：

2026-08-25（Asia/Shanghai）


已完成：

1. Windows开发环境同步完成
2. Windows独立npm环境配置完成
3. Windows Electron运行测试完成
4. Windows electron-builder打包测试完成


Windows开发目录：

E:\Developer\Electron开发环境\项目目录\牛看盘


已验证：

- npm start 正常运行
- npm run dist:portable 打包成功
- npm run dist:setup 打包成功


生成版本：

- 牛来看盘神器-1.0.0-portable.exe
- 牛来看盘神器 Setup 1.0.0.exe


Windows发布目录：

E:\Moony\MoonyMade\牛来看盘神器Win


说明：

- portable版本用于绿色运行测试
- Setup版本用于正式安装发布


---

## 8. Windows图标配置状态

更新时间：

2026-08-25


已完成：

- 添加 icon.ico 到源码仓库
- electron-builder 已正确读取 Windows 图标


作用：

Windows：

- exe图标
- 安装包图标


说明：

icon.ico 属于项目源码资源。


macOS：

- 保留 icon.ico
- 不影响 macOS 开发
- 后续可增加 icon.icns 用于 macOS 应用图标


---

## 9. 当前项目待验证事项

待处理：

- Windows安装版安装测试
- Windows卸载测试
- 开盘行情动画测试
- macOS图标配置
- 后续自动更新方案

## 核心原则

GitHub 管理代码

本地管理环境

系统独立打包

项目独立运行
