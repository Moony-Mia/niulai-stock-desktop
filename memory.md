# 牛来看盘神器 · 项目接续记忆

> 后续 ChatGPT / Codex / AI 接手本项目时，开始改代码前必须先阅读本文件。每次完成并验证一轮已批准的功能改动后，必须同步更新本文件。

最后更新：2026-08-30（Asia/Shanghai）

## 2026-08-30 celebration_dance 左峰值 HR Master 冻结（当前权威）

- `celebration_dance_left_peak_identity_correction_02.png` 已通过人工视觉验收，并作为 `celebration_dance Left Peak High-Resolution Master` 正式锁定。
- 权威 Master 文件：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_left_peak_master_hr.png`。该文件由 Identity Correction 02 原文件直接复制生成，未重新编码、未调整视觉、未裁切、未缩放、未处理 Alpha；源文件与 Master 尺寸均为 `1203 × 1307`，模式均为 `RGB PNG`，SHA-256 均为 `c8fe7910471520316756ff11a5d62a8ce447d5cb7423ee43c7763f951a468b2b`，已完成字节级一致性验证。
- `Pose Blueprint` ✅；`Silhouette V2` ✅（历史 Pose 研究）；`Silhouette V2.1` ✅（历史 Pose Boundary）；`Structure / Occlusion V1` ❌；`Volume Blockout V1` ❌；`Generative Reconstruction` ✅；`Left Peak Candidate 02` ✅（Pose / Anatomy 基线）；`Identity Correction 02` ✅（人工视觉验收）；`Left Peak High-Resolution Master` ✅（已冻结）。
- HR Master 锁定后续 `celebration_dance` 的角色 Identity：脸型、muzzle、眼睛、眉形、牛角、耳朵、金黄色毛发、紫灰色手、紫灰色蹄、头身比例、身体粗壮程度、Q 版腿部比例，以及原本略欠、淡定的表情。后续每帧不得重新解释角色 Identity。
- HR Master 同时锁定 Left Peak Reference 的动作关系：左拳高位举起、右手横腹、左胯向左扭出、下半身偏左、上半身向右反向平衡、左腿主要承重、右腿向右侧伸、双脚接地、头部基本正面。
- 当前 HR Master 背景为白色、RGB，尚未透明化；背景处理属于后续统一资产处理阶段。当前尚未转为 `192 × 208`，尚未进入正式 spritesheet、Action Registry、状态机或业务逻辑。
- 不再继续生成左峰值 `Candidate 03`、`Identity Correction 03`、`Left Peak V2` 或 `Left Peak V3`，除非后续发现明确硬伤（例如 192×208 完全不可读、动画一致性出现无法修复的问题或 Anatomy 存在未发现的硬错误）。
- 下一阶段为 `Right Peak High-Resolution Master`。右峰值应以 Left Peak HR Master 为主要 Identity / 比例 / Surface 参考，建立对应动作关系但不得简单机械镜像；本轮未制作右峰值。

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

# 2026-08-30 celebration_dance Right Peak HR Master

- 修正冻结任务中的 SHA-256 描述笔误；Right Peak Candidate 02 的正确 SHA-256 为 `62366ae6b12f22d4d5178cff107e7a337640e7eab7e879fb585cc6792caf2727`，错误值不对应需要寻找或恢复的历史文件。
- Right Peak Candidate 02 已完成人工视觉验收，技术评分 `91 / 100`，`P0 = None`，并已直接冻结为 Right Peak High-Resolution Master：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_right_peak_master_hr.png`。
- Right Peak HR Master 为 `1204 × 1306`、`RGB PNG`，SHA-256 为 `62366ae6b12f22d4d5178cff107e7a337640e7eab7e879fb585cc6792caf2727`；Source 与 Master 已通过字节级比较，完全一致。
- 本次冻结未进行视觉修改、平移、缩放、裁切、重编码或 Alpha 处理；白色背景仍保留，尚未转为 `192 × 208`。此前记录的 bbox / center / baseline 差异及 `X = -14`、`Y = -4` 仅作为未来统一 frame alignment 的参考值，未应用到 HR Master 像素。
- Left Peak HR Master 保持已冻结状态；Left / Right compatibility review 已通过，左右峰值共同作为后续 `celebration_dance` Intermediate Frames 的 High-Resolution Identity Anchors。
- 尚未制作 Intermediate Frames，尚未完成完整 8 帧，尚未修改正式 spritesheet、Action Registry、状态机或业务逻辑；下一阶段正式为 `Intermediate Transition Frames`。

# 2026-08-30 celebration_dance F2 HR Master

- `celebration_dance_f2_candidate_01.png` 已通过人工验收并被选定为 F2 Source；`celebration_dance_f2_candidate_02.png` 未采用为 Master，继续保留为历史候选。
- F2 `Left Release / Early Transition` 已直接冻结为 `assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f2_master_hr.png`。Master 为 `1202 × 1308`、`RGB PNG`、`1,604,028 bytes`，SHA-256 为 `19821889a5b4d00dc5ac0c97e277ef69f3ba6e274eedcc4258a4b1e47c846f7b`；Source 与 Master 已通过 `cmp` 和字节级比较，完全一致。
- F2 正式职责：仍明显处于动作左侧；左胯从 F1 最大左极值开始回中；左腿仍为主要承重腿；右腿从最大右侧伸开始回收；左拳从最高位开始下降；右手从横腹开始向外 / 向上释放；上身仍向右反平衡但比 F1 减弱；双脚接地；头部基本正面；表情保持不变。F2 不是 Center，也不是 Peak Copy，而是 Left Peak 刚开始释放的第一张过渡帧。
- F1 Left Peak、F2 Left Release、F5 Right Peak 当前已成为 `celebration_dance` 正式 HR Anchors。F3 `Near Center A / Arm Exchange`、F4、F6、F7、F8 尚未生成，完整 8 帧尚未完成。
- 本次冻结未修改 F2 视觉，未 resize、crop、translation 或 alignment；白色 RGB 背景保留，Alpha 未处理，尚未转为 `192 × 208`。尚未修改正式 spritesheet、Action Registry、状态机或业务逻辑。
- 下一阶段为 `F3 Near Center A / Arm Exchange Candidate Generation`。F3 参考优先级为：F1 Left Peak HR Master、F2 Left Release HR Master、F5 Right Peak HR Master；F2 是 F3 最重要的局部连续性参考。F3 重点为接近中线、接近交换重心、左拳继续下降、右手继续上升、两腿接近交换、上身接近正中且双脚接地；不得变成普通站姿、双臂融合或 Identity 漂移。

# 2026-08-30 celebration_dance F3 Near Center A HR Master 冻结

- F3 `Near Center A / Arm Exchange` 已完成人工视觉验收，正式选择 Candidate 01：`assets/cow-v2/actions/celebration_dance/celebration_dance_f3_candidate_01.png`。选择依据为 F2 → F3 continuity 更好、保留轻微左侧惯性、Hip 接近中心但未提前右偏、左腿仍承担部分重量、右腿正在回收、Arm Exchange 已清楚且双臂分离、未提前进入 F4，并为 F4 保留充足动作空间。
- F3 High-Resolution Master 已由 Candidate 01 原文件直接复制冻结：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f3_master_hr.png`。Source 与 Master 均为 `1203 × 1307`、`RGB PNG`、`1,629,213 bytes`，SHA-256 均为 `bbd352979d221ed65fbc4d047755ff1eeaee1f18a7a5214cad2f1c33e583a38b`，并已通过 `cmp` 字节级一致性验证。
- Candidate 02：`assets/cow-v2/actions/celebration_dance/celebration_dance_f3_candidate_02.png` 未选作 Master，继续保留为历史 Candidate，不删除、不修改、不移动。Candidate 01 Source 也继续保留。
- 本次冻结未进行视觉修改、重新编码、resize、crop、translation、alignment、canvas normalization 或 Alpha 处理；白色 RGB 背景仍保留，尚未转为 `192 × 208`。未生成 F4。
- 当前 `celebration_dance` HR Anchor 状态：F1 Left Peak ✅；F2 Left Release ✅；F3 Near Center A ✅；F5 Right Peak ✅。F4 Right Anticipation、F6 Right Release、F7 Near Center B、F8 Left Anticipation 尚未生成，完整 8 帧尚未完成；Alpha、192×208、spritesheet、Action Registry、状态机和业务逻辑均未进入。
- F3 Freeze 后下一阶段记录为 `F4 Right Anticipation / Pre-Peak Candidate Generation`，仅记录阶段，不在本轮执行。

# 2026-08-30 celebration_dance F4 Right Anticipation / Pre-Peak HR Master 冻结

- F4 `Right Anticipation / Pre-Peak` 已完成人工视觉验收，正式选择 Candidate 02：`assets/cow-v2/actions/celebration_dance/celebration_dance_f4_candidate_02.png`。Candidate 02 更准确占据 F3 与 F5 之间的 Pre-Peak 位置：F3 → F4 continuity 正确，Hip 已明显向右进入但未达到 F5 极值，Weight 已明显转移到右腿，左腿开始释放但未达到 F5 最大侧伸，Torso 已开始反向平衡，右拳进入高位但仍有 Peak 空间，左手开始进入横腹但尚未完成，F5 remaining space 合理。
- F4 High-Resolution Master 已由 Candidate 02 原文件直接复制冻结：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f4_master_hr.png`。Source 与 Master 均为 `1202 × 1308`、`RGB PNG`、3 通道、`1,695,054 bytes`，SHA-256 均为 `266dc65fa820ae2d83808e730d4a5ecacdfac6bdf9cc82cb636f66740b096b1b`；`SHA256_MATCH=YES`、`BYTE_IDENTICAL=YES`，并已通过 `cmp` 字节级比较。
- Candidate 01：`assets/cow-v2/actions/celebration_dance/celebration_dance_f4_candidate_01.png` 未选作 Master，继续保留为历史 Candidate；其实际视觉更靠近 F5 Peak，会压缩 F4 → F5 的最终动作空间。不删除、不修改、不移动。Candidate 02 Source 也继续保留。
- 本次冻结未进行视觉修改、重新编码、resize、crop、translation、alignment、canvas normalization 或 Alpha 处理；白色 RGB 背景仍保留，尚未转为 `192 × 208`。
- 当前连续正式 HR Anchors 已形成：F1 Left Peak ✅ → F2 Left Release ✅ → F3 Near Center A ✅ → F4 Right Anticipation ✅ → F5 Right Peak ✅。F6 Right Release、F7 Near Center B、F8 Left Anticipation 尚未生成，完整 8 帧尚未完成；Alpha、192×208、alignment、canvas normalization、spritesheet、Action Registry、状态机和业务逻辑均未进入。
- F4 Freeze 后下一阶段记录为 `F6 Right Release / Early Return Candidate Generation`，仅记录阶段，不在本轮执行。

# 2026-08-30 celebration_dance F4 Right Anticipation Candidates

- 已生成两张 F4 `Right Anticipation / Pre-Peak` High-Resolution Candidate：`assets/cow-v2/actions/celebration_dance/celebration_dance_f4_candidate_01.png` 与 `assets/cow-v2/actions/celebration_dance/celebration_dance_f4_candidate_02.png`，等待人工视觉验收；F4 Master 尚未选择、尚未冻结。
- Candidate 01 定位为 `Continuity First / Moderate Pre-Peak`：从 F3 明显进入右侧但保持较保守的 Hip / Weight Shift / Torso Counterbalance，右拳进入高位、左手进入上腹 / 中腹方向，为 F4 → F5 保留更多空间。
- Candidate 02 定位为 `Peak Preparation First / Strong Pre-Peak`：比 Candidate 01 更强地进入右侧，右腿主承重、左腿释放、左向反平衡和双臂接近 F5 的趋势更明确，但仍未复制 F5 Peak。
- 两张候选均以 F3 Near Center A HR Master 为第一参考、F5 Right Peak HR Master 为第二参考、F2 Left Release HR Master 为第三参考、F1 Left Peak HR Master 为第四参考；未使用旧候选、Identity Correction、silhouette、Structure / Occlusion、Volume Blockout 或其他非正式研究素材。
- Candidate 01：`1203 × 1308`、`RGB PNG`、无 Alpha、`1,686,536 bytes`、SHA-256 `86f9691127ee3fdaac4fb6e3f7b826884b25effa1fb0f9d4efa3f814217cf0fb`。Candidate 02：`1202 × 1308`、`RGB PNG`、无 Alpha、`1,695,054 bytes`、SHA-256 `266dc65fa820ae2d83808e730d4a5ecacdfac6bdf9cc82cb636f66740b096b1b`。两张均已通过 PNG 可读取检查。
- Candidate 级视觉 QA：两张均保持 Identity、Camera / Scale、Surface / Lighting、头部正面与淡定表情；Hip 明显右移、右腿承重增强、左腿释放、右拳上升、左手下降、Torso 开始左向反平衡、F5 方向清楚；双臂可追踪且分离，双脚接地，未发现 `F3_TOO_CLOSE`、`F5_TOO_CLOSE`、`VERTICAL_MOTION_TOO_STRONG` 或 `LEFT_ARM_OCCLUSION_FAIL`。
- 本轮未进行 Alpha、192×208、resize、crop、translation、alignment、canvas normalization、spritesheet assembly、Action Registry、状态机或业务逻辑修改；F6/F7/F8 未生成，完整 8 帧尚未完成。

# 2026-08-30 celebration_dance F3 Candidates

- 已生成两张 F3 `Near Center A / Arm Exchange` High-Resolution Candidate：`assets/cow-v2/actions/celebration_dance/celebration_dance_f3_candidate_01.png` 与 `assets/cow-v2/actions/celebration_dance/celebration_dance_f3_candidate_02.png`；均等待人工验收，F3 Master 尚未选择、尚未冻结。
- Candidate 01 定位为 `Continuity First`：优先承接 F2，保留少量左侧惯性，交换较保守并为 F4 留出空间。Candidate 02 定位为 `Exchange First`：中心与左右手交换更明确，但仍不得进入 F4 Right Anticipation。两张候选都不是 F4、F5、idle 或普通站姿。
- 两张候选均以 F2 Left Release HR Master 为第一参考、F1 Left Peak HR Master 为第二参考、F5 Right Peak HR Master 为第三参考；未使用旧候选、silhouette、Structure / Occlusion、Volume Blockout 或其他非正式研究素材。
- F3 候选保持白色 RGB 背景，未处理 Alpha，未转 `192 × 208`，未做 alignment、canvas normalization 或 spritesheet 接入；F1、F2、F5 HR Master 未修改。未生成 F4/F6/F7/F8，完整 8 帧尚未完成。
