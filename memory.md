# 牛来看盘神器 · 项目接续记忆

> 后续 ChatGPT / Codex / AI 接手本项目时，开始改代码前必须先阅读本文件。每次完成并验证一轮已批准的功能改动后，必须同步更新本文件。

最后更新：2026-08-29（Asia/Shanghai）

## 2026-08-29 celebration_left_peak 止损与状态纠正（当前权威）

- 当前人工验收状态：`Pose Blueprint` ✅；`Silhouette V2` ✅；`Silhouette V2.1` ✅（Pose / Silhouette Boundary 继续有效）；`Structure / Occlusion V1` ❌；`Volume Blockout V1` ❌。`Identity Reconstruction` 尚未进入，正式 `celebration_dance` 尚未接入。
- `Volume Blockout V1` 对应历史提交 `811c0a0`（`feat: add celebration volume blockout candidate`）必须保留。该候选仅作为研究和历史参考，不删除、不 revert、不改写为从未发生。
- 失败的是 `Volume Blockout V1` 的具体资产制作方法，不是 `celebration_dance` 动作设计、V2.1 Pose / Silhouette、左腿承重、右腿侧伸、左胯扭动或拟人搞笑庆祝舞方向。人工复核确认其头颈肩胸连接不自然、手臂和腿部呈几何组件感、腹部与骨盆有装甲块 / 裤片式分区，整体不像完整有机的牛摆出舞姿；这些问题在 192×208 下尤其明显。
- 根本原因：该候选使用 Python / Pillow / ImageDraw 的 `ellipse`、`polygon`、几何色块、人工坐标肢体块及 alpha mask 直接构造有机角色 Anatomy / Volume，方法不适合当前牛角色所需的连续有机体积。
- 对 `celebration_dance` 及类似大幅有机形体重建，禁止继续以确定性几何 primitive 作为主要角色绘画方法从零建立胸腔、腹部、骨盆、肩膀、手臂、大腿、小腿、复杂关节或完整角色 Anatomy / Volume。Pillow / ImageDraw / Python 仅可用于裁切、缩放、对齐、alpha、透明背景、像素检查、尺寸转换、Contact Sheet、对比图、spritesheet 拼接及已有素材的确定性工程处理；未来若需局部简单修补，须有人工明确批准。
- 明确停止 `Volume Blockout V1.1`、`Volume Blockout V1.2`、`Structure / Occlusion V1.1`，不得通过调整 polygon 坐标、ellipse 大小、primitive 叠放顺序或增加几何块继续修复当前失败候选。
- 下一阶段路线更新为：`Pose Blueprint ✅ → Silhouette V2 ✅ → Silhouette V2.1 ✅（Pose Boundary） → Structure / Occlusion V1 ❌ → Volume Blockout V1 ❌（几何 primitive 制作方法失败） → AI / Generative Volume Reconstruction → 人工验收完整有机身体 → Identity Reconstruction → Surface → 192×208 适配 → 左峰值最终验收 → 右峰值 → 过渡帧 → 完整 celebration_dance → 正式 spritesheet / Registry / 业务接入`。
- 后续有机体积由图像生成 / 图像编辑模型负责连续体积、自然关节、头颈肩连接、胸腹骨盆和左右腿姿态；Codex / Python 负责文件整理、裁切、比例、尺寸、alpha、对齐、192×208 转换、Contact Sheet、比较图、spritesheet、Registry、状态机、Electron 集成和 Git。不得再次让工程脚本承担有机角色绘画。
- 人工确认的更优完整牛姿势图定位为 `Volume / Anatomy Reference`，不是正式角色资产，也不是直接进入 spritesheet 的素材。若当前仓库不存在该文件，不得假定路径或伪造来源；未来应结合 V2.1 Pose / Silhouette Boundary、该参考图和正式牛 Identity Reference 进行 AI / Generative Volume Reconstruction。
- 本轮只纠正文档状态；未制作任何新图片、候选帧、脚本或动画素材，未修改正式 `spritesheet.webp`、Action Registry、`cowStateMachine.js`、行情逻辑、Electron 配置，未进入 `Identity Reconstruction`。

## 2026-08-29 celebration_left_peak 阶段复核与 Volume Blockout V1

- `Pose Blueprint` ✅；`Silhouette V2` ✅；`Silhouette V2.1` ✅（Pose / 外轮廓基线继续有效）。
- 历史 `Structure / Occlusion V1` 候选确实制作过，但后续人工视觉复核未通过 ❌，未进入正式资产，未进入 `Identity Reconstruction`。失败的是该候选的制作方法，不是 V2.1、Pose 或 `celebration_dance` 设计本身。
- 主要失败原因：正式牛头与身体存在明显贴片感；头、颈、肩、胸没有形成连续体积；右臂主要依赖结构线解释，没有真正形成粗壮前臂体块；腹部大面积深色区破坏身体连续性；腿部仍依赖 Skeleton / Guide 式线条解释；在 192×208 下没有形成完整可信的身体体积。
- 当前真正缺失的阶段：`Volume Blockout`。下一步基于 `silhouette-v2-1/celebration_left_peak_silhouette_v2_1.png` 已确认的 Pose / Silhouette Boundary，以及人工确认的 Volume / Anatomy Reference（`reference/idle_master.png` 仅作身份与体型参考，不是直接替换素材），制作 `volume-blockout-v1/`。
- 本轮新增 `volume-blockout-v1/celebration_left_peak_volume_blockout_v1.png` 及其 4×、V2.1 对比、Volume / identity reference 对比和纯角色预览。主候选为 192×208 RGBA，采用连续头颈肩胸、宽右前臂、连续胸腹骨盆和有体块的双腿；不含 Skeleton / Guide，仍待人工最终验收。
- 当前流程：`Pose Blueprint ✅ → Silhouette V2 ✅ → Silhouette V2.1 ✅ → Volume Blockout V1（本轮候选，待人工验收） → Structure / Occlusion → Identity Reconstruction → Surface → 左峰值最终验收 → 右峰值 → 动画过渡帧 → 完整 celebration_dance`。暂停 `Identity Reconstruction`。
- 本轮未修改正式 `spritesheet.webp`、Action Registry、`cowStateMachine.js`、行情业务触发、Electron 配置或任何正式动作接入。

## 2026-08-29 review 动作审计

- `review` 已完整正式使用，Action Registry 为 `row: 7`、`frames: 6`、`loop: true`、`speed: normal`、`priority: 10`、`fallback: idle`、`lowProfileAllowed: true`；对应 spritesheet row 7 素材存在且正常，未修改 spritesheet。
- 正式触发位置是 `review` 时间相位（约 15:10–16:55）：`startRandomStateLoop(['review', 'thinking', 'waiting'])` 将其作为收盘后复盘动作池的一员随机选择。每次动作按 6 帧 × 120ms，再加 80–340ms 随机间隔后切换下一动作；定时器由 `startRandomStateLoop()` 管理，并在相位切换时由现有 `playState()` / `startRandomStateLoop()` / `stopRestLoop()` 清理或替换。
- `review` 与 `thinking`、`waiting` 的视觉语义分工合理：分别偏查看/检视、思考/分析、中性等待；三者均为复盘生活态 priority 10，不抢占更高优先级行情或时间动作。
- 新增开发验证入口 `window.__playReview()`，复用 `playState('review')` 以一次性方式播放，完成后由统一 Registry fallback 回到 `idle`；不加入正式随机调度。

## 2026-08-29 thinking 动作正式接入

- `thinking` 复用正式 spritesheet row 8、6 帧；Action Registry 保持 `loop: true`、`speed: normal`、`priority: 10`、`fallback: idle`，未修改素材或 Registry 参数。
- 正式业务触发点为收盘后的 `review` 时间相位：`startRandomStateLoop(['review', 'thinking', 'waiting'])` 将 `thinking` 作为短暂分析/判断状态参与复盘动作池；交易相位行情动作和时间相位动作通过更高优先级或相位切换保护，不由它抢占。
- 新增开发验证入口 `window.__playThinking()`，使用 `playState('thinking')` 以一次性模式播放，完成后由统一 Registry fallback 回到 `idle`；该入口不加入正式随机调度。

## 2026-08-29 idle_blink 自动待机接入

- `idle_blink` 已正式接入自动待机逻辑；只在交易相位且当前 action 为 `idle` 时触发，避免打断生活态动作和业务动作。
- 调度使用单一一次性随机 timeout，每次重新随机 `4–10 秒`，不是固定 `setInterval`；页面初始化只启动一套 scheduler，销毁时清理 timer。
- 触发前再次检查当前 action；running、jumping、failed、sleep、waving 及正在执行的 `idle_blink` 都不会被自动 blink 抢占。高优先级 action 可正常接管，blink 完成回调不会强制覆盖新 action。
- 复用现有 `playState()` 与非循环 action fallback，blink 完成后恢复 `idle`；手动入口 `window.__playIdleBlink()` 保留。
- spritesheet 仍为 `1536 × 2704 px`、13 行；row 11 为 `idle_blink`，row 12 为 `sleep`。

## 2026-08-29 sleep 动作接入

- 正式 `spritesheet.webp` 已扩展为 `1536 × 2704 px`，保持 8 列、单帧 `192 × 208 px`，共 13 行（row 0–12）。
- 新增 row 12 专用于 `sleep`：8 帧，基于现有正式 `head_down` / 疲惫闭眼帧确定性编排，不重新生成或覆盖旧动作素材。
- `niulai-ticker.html` Action Registry 已注册 `sleep`：`row: 12`、`frames: 8`、`speed: slow`、`loop: true`；开发入口为 `window.__playSleep()`。
- `cowStateMachine.js` 原有 `timeState.state === "sleep"` 映射现在可命中真实 Registry，不再 fallback 到 `idle`。

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

## 2026-08-27 低调模式

已完成：

- 在 `niulai-ticker.html` 的现有设置面板新增“低调模式”开关，默认关闭。
- 复用 `localStorage` 键 `niulai.lowProfile.v1` 持久化用户选择，重启后恢复。
- 开启后保留股票名称和当前价格，涨跌幅/涨跌额隐藏并保留布局占位；行情颜色中性化，涨跌动作统一为 `idle`，不触发跳跃、失败姿态或涨跌粒子。
- 未修改行情计算、涨跌判断、行情获取、`node_modules` 或 `dist`。

Windows `npm start` 启动验证通过；控制台仅见既有 Electron CSP warning。

## 2026-08-27 牛动作系统 V2 播放契约第一阶段

已完成：

- `marketState.js` 保持 `getState(changePct)` 为唯一市场状态接口，未修改原有阈值；`niulai-ticker.html` 不再调用不存在的 `getAction()`。
- `cowStateMachine.js` 提供正式 `getActionRequest()` 市场状态到真实 action ID 的映射，并保留 `getCowState()` 兼容入口；现有未配套的 V2 素材继续映射到当前 `jumping` / `failed`，未返回不存在的动作。
- `niulai-ticker.html` 将 11 个现有动作统一为 Action Registry，支持 `segments`、`loop`、`speed`、`priority`、`fallback`、`lowProfileAllowed`。
- 播放器按实际帧推进处理多 segment 和 `loop:false` 完成、fallback、回调；统一速度为 slow 160ms、normal 120ms、fast 90ms，现有动作均为 normal。
- `applyMarket()` 已整理为 getState → action request → 低调过滤 → requestAction 的单一路径；时间相位仍使用显式强制切换，不被行情刷新打断。

验证：市场/状态机断言、动作契约静态断言和 `git diff --check` 通过；Windows `npm start` 返回 0。未修改 `spritesheet.webp`、`node_modules`、`dist` 或行情阈值。
# 2026-08-29 idle_blink

- Added `idle_blink` as a deterministic five-frame blink derived from `assets/cow-v2/reference/idle_master.png`; only compact eye/eyelid regions change.
- Appended it as 0-based spritesheet row 11 with five frames and three transparent cells. The original 11 rows were verified pixel-identical to `origin/main`.
- Registry configuration: `loop:false`, `speed:'normal'`, `priority:10`, `fallback:'idle'`, `lowProfileAllowed:true`. It is not in the random action pools. Developer trigger: `window.__playIdleBlink()`.
