# 🐂 牛来看盘神器

别人家的牛登上大银幕。

我的牛选择上班。

这是一头住在桌面的 Electron 电子牛，
不会表演，不会预测未来，
只负责看行情、提醒交易时间，
陪你关注 A股、期货和全球市场。

---

## 项目介绍

牛来看盘神器是一款基于 Electron 开发的桌面行情助手。

它以一头黄色电子牛作为桌面伙伴，将原本冰冷的行情数据变成一个陪伴式的桌面体验。

主要功能：

- 🐮 桌面电子牛助手
- 📈 A股行情展示
- 📊 国内期货行情扩展
- 🌎 全球市场行情扩展
- ⏰ 交易时间状态提示
- 🎨 动画互动效果
- ⚙️ 设置面板

目标很简单：

让行情数据不只是数字，
而是一个每天陪你工作的桌面伙伴。

## 技术栈

- Electron
- JavaScript
- HTML / CSS
- electron-builder

## 项目结构

```
main.js              Electron 主进程
preload.js           安全通信桥接
niulai-ticker.html   桌面展示界面
spritesheet.webp     动画素材
package.json         项目配置
memory.md            项目接续记录
CHANGELOG.md         更新日志
```

## 开发环境

### macOS

```
/Users/naiwy/Developer/Electron开发环境/项目目录/牛看盘
```

用于：

- macOS 开发
- 调试
- npm install
- npm start
- macOS 打包

### Windows

```
E:\Developer\Electron开发环境\项目目录\牛看盘
```

用于：

- Windows 开发
- 调试
- npm install
- npm start
- Windows 打包

## 支持市场规划

未来支持：

- A股股票行情
- 国内商品期货
- 股指期货
- 国际市场行情
- 自选品种关注

## 开发规则

- GitHub 是唯一源码管理中心
- macOS 与 Windows 使用独立开发环境
- 不共享 node_modules
- 不共享 dist
- 不提交构建产物

禁止提交：

- node_modules
- dist
- app
- dmg
- exe

## Git 工作流

开发前：

```bash
git pull
```

完成修改后：

```bash
git add .
git commit -m "修改说明"
git push
```

## 打包

Windows：

```bash
npm run dist:all
```

## 文档

- `memory.md`：项目接续规则与 AI 协作记录
- `CHANGELOG.md`：版本更新记录

## 项目定位

GitHub 管理源码，Linear 管理项目规划与任务。

保持代码、环境、发布版本独立管理。
