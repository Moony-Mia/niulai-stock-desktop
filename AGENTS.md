# 牛来看盘 Codex 项目执行规则

本文件是本仓库中 Codex、AI coding agent 及其他自动化开发工具的长期执行规范。开始任何代码修改前必须阅读本文件、`memory.md`、`CHANGELOG.md` 与 `package.json`。

如果聊天记录、历史摘要或旧文档与当前仓库实际状态冲突，以当前 Git 仓库、实际文件内容、`memory.md` 和 Git 状态为准。

## 项目与源码来源

- 项目名称：牛来看盘
- 类型：Electron 桌面应用
- GitHub 唯一源码仓库：https://github.com/Moony-Mia/niulai-stock-desktop
- GitHub 是唯一源码管理中心。
- 本地成品目录、Google Drive 或其他机器上的文件不得覆盖当前源码。

## 开工前检查

修改前确认操作系统和开发目录，并执行：

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short
uname -s
```

随后必须：

1. 执行 `git status`，理解所有未提交修改；未知修改不得覆盖、删除、stash 或擅自丢弃。
2. 使用 `git pull --ff-only` 同步远端。无法 fast-forward 时停止，不自动合并。
3. 阅读 `memory.md`、`CHANGELOG.md`、`package.json` 及任务涉及的源码。
4. 修改后更新必要文档并验证 Git 状态。

禁止使用 `git reset --hard`、`git clean -fd`、`git push --force`、`git push --force-with-lease`、`git rebase` 或 `git commit --amend`，除非用户明确要求。

## 开发环境隔离

macOS 开发目录：

`/Users/naiwy/Developer/Electron开发环境/项目目录/牛看盘`

macOS 成品目录：

`/Users/naiwy/MoonyMac/牛来看盘神器MAC`

Windows 开发目录：

`E:\Developer\Electron开发环境\项目目录\牛看盘`

Windows 成品目录：

`E:\Moony\MoonyMade\牛看盘神器Win`

开发目录用于源码、调试、依赖安装和本平台打包；成品目录只保存发布产物。macOS 与 Windows 必须分别安装依赖、分别生成 `dist`，不得共享另一系统的 `node_modules`、`dist` 或打包缓存。

## 生成目录与依赖

除非任务明确要求处理构建产物，禁止修改或提交：

```text
node_modules/
dist/
build/
*.app
*.dmg
*.exe
.DS_Store
```

依赖问题通过 `package.json`、`package-lock.json` 和正确的本机安装流程解决，不通过修改 `node_modules` 修复源码。不得因小范围功能修改无理由升级 Electron、升级全部依赖、重写 lockfile 或新增依赖。

## 跨平台要求

默认同时考虑 macOS 与 Windows。不得无必要使用平台专属 API、硬编码平台命令或单平台运行时路径。确需平台差异时，显式检测平台并保持另一平台功能正常。

最终报告必须区分实际验证的平台、尚未验证的平台，以及是否生成对应平台成品。

## 牛动作、spritesheet 与状态机

修改牛角色、spritesheet、Action Registry 或状态机前，必须先阅读 `memory.md` 的最新动作资产盘点。

修改牛动作、spritesheet、Action Registry 或状态机前，必须读取 `memory.md` 获取当前 spritesheet 尺寸、row 分配、动作数量和资产状态。长期规则不在本文件维护动态 spritesheet 基线或 row 清单。

禁止因为 action 名称不同而重复制作已有视觉。新增动作前必须确认：是否已有视觉、是否已有 Registry action、是否只是尚未接入逻辑、是否可以复用或拆分现有帧。确实不存在时，优先基于正式素材确定性编辑，不重新生成整头牛。

必须保持牛角、耳朵、脸型、鼻子、身体及四肢比例、黑白花纹、描边风格、透明背景、帧尺寸和帧对齐。新增 row 不得覆盖或移动旧 row；必须同步更新 Action Registry、`memory.md` 与 `CHANGELOG.md`。

动作统一接入现有 Action Registry、`requestAction()`、`playState()` 和 `ACTIONS`，检查 action id、row、frame 数、loop、speed/FPS、priority、fallback 及状态机调用链。

当前正式行情阈值和 Market State → Action 映射以仓库根目录 `MARKET_STATE_MAPPING.md` 为准。

## 行情状态映射规则

涉及以下内容时，必须先读取仓库根目录 `MARKET_STATE_MAPPING.md`：

- `instrumentType`
- `index` / `stock` 分类
- 行情涨跌幅阈值
- `strong_up` / `up` / `flat` / `down` / `strong_down`
- Market State → Cow Action

`MARKET_STATE_MAPPING.md` 是当前正式行情状态与牛动作映射的权威产品文档。

修改上述任一内容时，必须同步检查并更新 `MARKET_STATE_MAPPING.md`。

`memory.md` 记录当前实现和验证状态，不重复维护完整映射表。

`CHANGELOG.md` 记录历史变化，不作为当前映射规则来源。

## 代码修改与调试

- 遵循最小修改原则，修复真实原因，复用现有结构。
- 不因小功能大规模重构、替换框架或引入无必要状态管理库。
- 任务范围外的问题只在最终报告中指出，不擅自扩大 scope。
- 临时日志、测试入口、截图、调试变量和临时资源在提交前必须清理。

## 验证要求

根据任务执行实际验证，常规 Electron 验证可使用：

```bash
npm start
git diff --check
git diff
git status
```

必须区分应用启动成功、静态检查成功、自动测试成功、人工视觉验证成功和平台实机验证成功。未执行的测试必须明确写“未验证”，不得把理论兼容写成已验证。

## 文档、提交与推送

完成实际功能修改后更新 `CHANGELOG.md`。若改变项目结构、spritesheet、Action Registry、动作状态、状态机映射、关键运行逻辑、构建流程、已知限制或重要技术决定，同步更新 `memory.md`。

完成验证后依次检查：

```bash
git status
git diff
git diff --check
git add <本轮相关文件>
git status
git commit -m "<appropriate commit message>"
git push
git status
```

禁止使用 `git add .` 作为默认提交方式。必须采用 precision staging，只精确 stage 本轮相关文件，禁止误 stage 用户原有工作区内容。

提交前确认没有生成目录、依赖、构建缓存、平台成品、临时图片、调试日志或本机环境文件进入 Git。若用户明确要求不要 commit 或 push，以用户指令为准。

## 上下文恢复与最终报告

会话中断、上下文不完整或不确定前一位 agent 做到哪里时，重新执行：

```bash
git status
git diff
git log -5 --oneline
```

并重新阅读 `AGENTS.md`、`memory.md`、`CHANGELOG.md` 和相关源码，不凭旧聊天记录继续开发。

开发任务最终报告至少包含：

- 修改了哪些文件及原因
- 实际实现与未实现内容
- 执行过的验证、通过项和未验证项
- 对 macOS 与 Windows 的影响及实际验证平台
- 是否需要、是否完成打包，是否生成或复制发布成品
- commit hash、push 结果和最终 `git status`

必须使用事实描述，不得把“预计可用”写成“已验证可用”，也不得把“源码已完成”写成“应用已发布”。
