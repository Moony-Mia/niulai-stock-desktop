# 牛来看盘神器 · 项目接续记忆

> 后续 ChatGPT / Codex / AI 接手本项目时，开始改代码前必须先阅读本文件。每次完成并验证一轮已批准的功能改动后，必须同步更新本文件。

最后更新：2026-08-31（Asia/Shanghai）

## 2026-08-31 Developer-only Market QA Harness

- Developer-only Market QA Harness=AVAILABLE。跨平台启动：`npm run qa:market -- --suite stock`、`no-restart`、`symbol-switch`、`time-priority` 或 `all`；可用 `--hold <ms>` 调整每步停留时间。实现位于 `scripts/run-market-qa.js` 与 `scripts/market-qa-runner.js`。
- QA 仅在 development 且 `!app.isPackaged && process.env.NIULAI_MARKET_QA === '1'` 时启用；launcher 负责设置 flag，普通 `npm start` 不启用，packaged app 不启用。QA 期间跳过 live feed 覆盖，行情输入仍通过 renderer 正式 `__pushMarket` 路径。
- QA observer 提供 currentSymbol、instrumentType、marketState、marketDirection、currentAction、priority/category、playback frameIndex/elapsedMs、manualRest、restMode、lowProfileMode 与 `playbackSequenceId`。sequence id 只在真正初始化 playback 时递增；同 action dedupe 不递增，纯观察不影响行为。QA API 只接受 symbol、prevClose、price，并不提供 force action 或 force market state 能力。
- 当前已完成工具验收：stock、no-restart、symbol-switch、all suites 的结构化断言通过，time-priority 已覆盖 sleep/restMode 与交易时段恢复；正常启动 QA 默认关闭。第三轮 macOS 实际窗口可见验证已通过 stock profile、stock priority downgrade、symbol switch 与 time-priority，当前 `MACOS_BUSINESS_VISIBLE_RUNTIME=PASS`、`ACTUAL_VISIBLE_RENDER_PASS=YES`。Windows Runtime 未验证，Packaging/Release 未执行。现有 ambient helper 使用强制动作语义，未作为正常 arbitration QA 入口提供。
- Stock priority downgrade transitions now assert both expected action and `playbackSequenceId` increment; time-priority restore now asserts the expected market action after returning to trading time using the current immediate formal restore semantics.
- Market QA Harness now separates immediate decision assertions from visual-hold snapshots; ambient actions such as `idle_blink` during the hold no longer cause false Market Decision failures. Repeat stability verification passed: `symbol-switch` 5/5 and `all` 3/3.
- Third-round macOS visible Market Runtime validation passed: Stock Profile actions, stock priority downgrade transitions, symbol-switch profile changes, and time-priority jumping → sleep → jumping were observed in the Electron window; spritesheet loaded at `1536×3120`, with no new application runtime errors. `AMBIENT_CANNOT_STEAL_MARKET_ACTION=NOT VERIFIED` remains unchanged because the current helper is not suitable for normal arbitration validation. Windows Runtime remains unverified; Packaging/Release were not executed.

## 2026-08-31 Index / Stock Market Profiles and Up Action Re-layering

- Current market state mapping authority: `MARKET_STATE_MAPPING.md`.
- Market state classification is implemented in `marketState.js` with `index` and `stock`; unknown symbols fall back to `stock` (`UNKNOWN_INSTRUMENT_FALLBACK=stock`). Current supported A-share index symbols and `int_nasdaq` / `int_dji` / `int_sp500` classify as `index`; ordinary `sh`/`sz` symbols classify as `stock` unless they match the supported index pattern.
- The current formal action mapping is `strong_up → jumping`, `up → celebration_dance`, `flat → idle`, `down → failed`, `strong_down → crying`. The previous `strong_up` edge-triggered celebration behavior was removed; continuous same-state quotes remain deduplicated and looping. Complete current thresholds and boundary operators are maintained in `MARKET_STATE_MAPPING.md`, not duplicated here.
- Renderer market arbitration now permits a valid market-state action to replace the previous market action even when its request priority is lower, while ambient actions cannot use that release. Spritesheet, Action Registry, and production assets were not modified. Automated tests passed; macOS runtime visual verification for this change remains pending; Windows, packaging, and release were not executed.

## 2026-08-31 strong_down → crying Business Integration（macOS PASS）

- 当前产品规则为指数当日涨跌幅：`strong_down <= -3.00%`（包含边界）；`down <= -0.50% 且 > -3.00%`；`up >= +0.50%`；`strong_up >= +1.50%` 保持不变。此前 `strong_down=-1.5%` 已替换为 `-3.0%`，不是证券市场通用定义。
- `marketState.js` 将 strong_down 阈值改为 `pct <= -3.0`；`cowStateMachine.js` 将 `strong_down` action 从 `failed` 改为已注册的 `crying`，保留 `emotion: panic`、`priority: 70`、`category: market`。普通 `down` 继续为 `failed`。
- 为修复真实阻塞，`niulai-ticker.html` 的市场动作解析保留 State Machine 请求 priority；离开 crying 时允许较低优先级目标动作释放 crying，持续 strong_down 同 action 仍去重，不会每次 quote refresh 重置 F1。未修改 Registry 字段、spritesheet 或 market/state 文件以外的业务规则。
- 确定性边界测试通过：`-2.99→down→failed`、`-3.00→strong_down→crying`、`-3.01→strong_down→crying`；同时覆盖上涨边界、NaN、sleep/rest 时间优先。
- macOS Electron 真实业务链通过：fresh QA quote 逐项验证 `-2/-2.99` failed、`-3/-3.5` crying、连续 `-3.2/-3.1/-4` crying 持续推进、`-3.2→-2` failed、`-3.2→0` idle、`-3.2→+1` jumping、`-3.2→+2` celebration_dance 后 jumping；spritesheet 加载 `1536×3120`，无本轮错误。临时注入已删除。
- 时间优先仍由 `cowStateMachine` 的 sleep/rest 分支保护；offline/stale/invalid quote 处理链未修改，未将异常行情映射到 crying。当前为 `CRYING BUSINESS INTEGRATION ON MACOS=PASS`；Windows Runtime 未验证，Packaging/Release 未执行。

## 2026-08-31 crying Spritesheet + Action Registry Integration（业务触发仍未接入）

- `crying` F1–F8 批准 HR 源和 `production_192/` 八帧已重新核验，Production Human Review=PASS；Production 文件未修改。
- 正式 `spritesheet.webp` 已从 `1536×2912` 扩展为 `1536×3120`，保持 `192×208` cell，旧 row 0–13 decoded pixels exact preserved，新增 row 14 为 crying，列 0–7 严格对应 F1→F8。row 14 round-trip 的可见像素与 Alpha 与 Production Source exact；WebP 透明区隐藏 RGB 仍由编码器规范化。
- `niulai-ticker.html` Action Registry 新增 `crying`：`segments: [{ row: 14, frames: 8 }]`、`loop: true`、`speed: 'normal'`、`priority: 10`、`fallback: 'idle'`、`lowProfileAllowed: true`；沿用现有 `normal=120ms/frame`，未修改旧 14 个 Action。
- macOS 独立动作播放已实际验证：spritesheet 加载 `1536×3120`，Registry lookup 与调用成功，窗口实际显示 crying row 14，未回退 idle/failed，观察到爆哭峰值；项目原有 Electron CSP warning 除外，无本轮播放错误。临时 QA trigger 已删除。
- `crying_failed_comparison_qa.png` 已修复为使用正式 failed row 5 与当前 crying Production F1/F4/F6/F8；不是 Runtime 资产。
- 当前正式状态：`15 actions / 15 spritesheet rows`；`strong_down → crying` 尚未实现，`marketState.js`、`cowStateMachine.js`、`timeState.js` 未修改；Windows Runtime、Packaging、Release 未执行。

## 2026-08-30 crying Full HR Sequence Candidate（Human Review Pending）

- 上一轮批准状态已作为硬前提：`POSE_A=APPROVED`、`POSE_B=APPROVED_AS_CRY_PEAK_ANCHOR`、`POSE_C=APPROVED`。本轮将 F2/F4/F7 分别直接复用批准的 A/B/C R2 文件，未重新设计三个 Anchor。
- 新增 `assets/cow-v2/candidates/crying/crying_f01_candidate_hr.png` 至 `crying_f08_candidate_hr.png` 的 8-frame HR Candidate Sequence，统一为 `1128×1394 RGB PNG`。F1/F3/F5/F6/F8 由相邻批准 Anchor 做连续动作派生；F5 只做 1px 级画布统一，不缩放、不重绘。
- Frame responsibilities：F1 Emotion Break、F2 Approved Cry Build、F3 Cry Rise、F4 Approved Cry Peak A、F5 Short Release、F6 Cry Peak B、F7 Approved Heavy Sob、F8 Cry Hold / Seam。F4 与 F6 保持第二峰节奏差异，F8→F1 保留持续哭泣 loop seam。
- QA-only 输出：`/tmp/crying_full_sequence_contact_sheet.png`、`/tmp/crying_anchor_comparison.png`、`/tmp/crying_face_strip.png`、`/tmp/crying_body_rhythm_strip.png`、`/tmp/crying_loop_seam_f7_f8_f1_f2.png`、`/tmp/failed_vs_crying_f1_f8.png`、`/tmp/crying_peak_tears_off_comparison.png`、`/tmp/crying_full_sequence_120ms_3loops.gif`。
- Candidate-level QA：Identity / camera / body scale / foot baseline 稳定；A→B→C 扩展为 F1→F8 的 head、shoulder、chest-belly、mouth、eye、tear rhythm 可读；F4/F6 去泪后仍可读为爆哭峰值；未进入 Alpha、192×208、spritesheet、Registry、状态机、Runtime 或发布。
- 当前状态：`CRYING FULL HR SEQUENCE HUMAN REVIEW REQUIRED`，尚未升格 Master，等待完整 8 帧人工审核。

## 2026-08-30 crying Continuous Key Pose Revision（Human Review Pending）

- `crying` 仍是 HR Key Pose 候选，不是正式 Action；未加入 Action Registry、spritesheet、状态机、Runtime 或任何业务映射。
- 本轮以 `assets/cow-v2/candidates/crying/crying_peak_candidate_hr_r2.png` 为唯一 Motion Anchor；A 由 Peak 向前回退一个节奏点，C 由 Peak 向后释放一个节奏点，未将 A/B/C 作为三个独立角色重新设计。
- 新增 `crying_pre_cry_candidate_hr_r2.png`、`crying_peak_candidate_hr_r2.png`、`crying_heavy_sob_candidate_hr_r2.png`，旧 A/B/C candidates 保留不覆盖；三张仍为 HR RGB candidate，未执行 Alpha、192×208、spritesheet 或正式透明化。
- QA-only 对比输出位于 `/tmp/crying_abc_continuity_qa.png`、`/tmp/failed_crying_abcs_qa.png`、`/tmp/crying_abc_face_crop_qa.png`、`/tmp/crying_abc_silhouette_rhythm_qa.png`、`/tmp/crying_peak_tears_on_off_qa.png`。
- 候选级检查确认 A→B→C 的 head / shoulder / chest-belly / mouth / tear build→peak→release 曲线成立，Cry Peak 去除泪水后仍可读为爆哭；正式牛 Identity、渲染/透明背景管线仍需人工验收。
- 当前状态：`CRYING KEY POSE HUMAN REVIEW REQUIRED`。下一步只有在人工确认 A→B→C continuity、Identity 与 Cry Peak 后，才可进入 crying Full HR Sequence Development。

## 2026-08-30 celebration_dance State Machine Trigger Integration

- 已找到并接入项目已有的单义正向事件：`marketState.state === 'strong_up'`，其真实条件为 `changePct >= 1.5`，既有语义为强势上涨 / `excited`，原有动作仍为 `jumping`。
- `niulai-ticker.html` 在 `applyMarket()` 中增加 `lastMarketState` 边沿记录；仅在非 `strong_up` → `strong_up` 时通过现有 `requestAction()` 触发 `celebration_dance`，未加入随机池、未新增业务阈值或独立 event bus。连续相同状态刷新不会重启动作；离开 `strong_up` 后现有市场动作按原 priority 接管。
- 保持 Registry `priority: 10`、`loop: true`、`fallback: 'idle'`、`lowProfileAllowed: true` 不变。显式事件入口使用 `force` 启动 priority 10 的庆祝动作；后续 `jumping` / `failed` 等更高优先级行情动作仍可抢占，未改既有 priority 体系。
- macOS Runtime 已实际启动并加载 `1536×2912` spritesheet。QA-only 注入通过 `__setTimePreset('am-trading')` → `__pushMarket()` → `marketState` → `applyMarket` → `requestAction`，确认 trigger 命中、row 13、8 帧、120ms；同值重复更新未产生第二次 trigger，随后负向状态更新可离开庆祝动作。QA 注入与临时诊断已删除，未进入提交。
- 本轮未修改 `cowStateMachine.js`、`marketState.js`、`timeState.js`、spritesheet、production_192、corrected alpha、aligned source 或 HR Master；Windows Runtime、packaging 与 release 未执行。未提交截图，人工逐帧视觉 QA 未单独执行。

## 2026-08-30 celebration_dance Action Registry Integration

- `niulai-ticker.html` Action Registry 新增 `celebration_dance`：`segments: [{ row: 13, frames: 8 }]`、`loop: true`、`speed: 'normal'`、`priority: 10`、`fallback: 'idle'`、`lowProfileAllowed: true`。沿用既有 `CELL_W=192`、`CELL_H=208` 与 `ACTION_SPEED_MS.normal=120ms`，实际约 `8.33 FPS`；未新造独立 timing 系统。
- Runtime 真实验证已在 macOS 开发环境完成：使用临时 QA-only 调用已有 `setState()` / `requestAction()` 播放 `celebration_dance`，确认 spritesheet 加载为 `1536×2912`、动作实际显示 row 13、8 帧按 0→7 读取，并观察到循环中的左/右重心变化；临时 hook 已移除，未进入正式逻辑。
- 渲染器现有计算 `segment.row * CELL_H` 实际得到 `13×208=2704`，尺寸、canvas、scale、anchor、baseline 均复用统一动作路径；没有修改其他 action、状态机触发规则或业务事件绑定。
- Registry 静态 QA：`REGISTRY_ACTION_EXISTS=YES`、`REGISTRY_ROW=13`、`REGISTRY_FRAME_COUNT=8`、`REGISTRY_FRAME_ORDER=PASS`、`REGISTRY_LOOP=PASS`、`REGISTRY_TIMING=PASS`；`EXISTING_ACTION_REGISTRY_MUTATION=NO`、`STATE_MACHINE_BEHAVIOR_MUTATION=NO`、`SPRITESHEET_MUTATION=NO`、`PRODUCTION_192_MUTATION=NO`。
- 本轮未接入涨停、盈利、上涨、点击、定时器或随机业务触发；Windows Runtime、打包与发布未验证/未执行。Runtime QA 截图为 `/tmp/celebration_dance_runtime_validation.png` 与 `/tmp/celebration_dance_runtime_validation_2.png`，不属于项目资产。

## 2026-08-30 celebration_dance Spritesheet Integration

- `assets/cow-v2/actions/celebration_dance/production_192/` F1–F8 已按只读输入整合进正式 `spritesheet.webp`；八个输入文件尺寸均为 `192×208 RGBA`，SHA-256 与 production commit `cbfd899819d9a9699050b9f853c20d9ea2082b69` 记录一致，`PRODUCTION_192_MUTATION=NO`。
- 当前 sheet 从 `1536×2704`（8列×13行）扩展为 `1536×2912`（8列×14行），cell 仍为 `192×208`；旧 row 0–12 坐标保持不动，新增 row 13 专用于 `celebration_dance`，无需修改既有 layout manifest（仓库不存在独立 manifest）。
- `celebration_dance` 坐标为 row 13、columns 0–7：F1–F8 的 `(x,y,w,h)` 分别为 `(0,2704,192,208)`、`(192,2704,192,208)`、`(384,2704,192,208)`、`(576,2704,192,208)`、`(768,2704,192,208)`、`(960,2704,192,208)`、`(1152,2704,192,208)`、`(1344,2704,192,208)`。
- 使用当前正式 WebP 的无损编码方式写入。解码后旧区域所有 alpha>0 像素保持 exact；WebP 编码器规范化了 alpha=0 像素的隐藏 RGB（因此不宣称全 RGBA exact）。八个目标 cell 的可见像素与 Alpha exact，extracted-cell QA、五背景 QA 与 8帧/100ms/无限循环 QA 通过。
- `F1/F5/F8_BACKGROUND_ISLAND_REGRESSION=NO`、`WHITE_HALO=NO`、`DARK_HALO=NO`、`ALPHA_EROSION=NO`；`FRAME_ORDER=F1→F8`、`F8→F1→F2 LEFT_PEAK_CONTINUITY=PASS`、`F4→F5→F6 RIGHT_PEAK_CONTINUITY=PASS`、`LOOP_SEAM=PASS`。
- 本轮未修改 production、HR Master、aligned、alpha_hr、Action Registry、状态机或 Runtime；Runtime、npm start、打包和发布均未执行。QA-only 文件位于 `/tmp/celebration_dance_spritesheet_qa_0830/`。

## 2026-08-30 celebration_dance Alpha HR Preparation（技术通过，等待人工验收）

- F1–F8 正式 HR Master 与 aligned HR RGB source 的 SHA-256 已重新核验并与权威记录一致；`HR_MASTER_MUTATION=NO`、`ALIGNED_SOURCE_MUTATION=NO`。
- 新增 `assets/cow-v2/actions/celebration_dance/alpha_hr/` 八张 `1344 × 1456 RGBA` Alpha engineering copies 及 `alpha_manifest.json`。输入 aligned source 未覆盖。
- 采用确定性 border-connected near-white segmentation：边界中位 RGB、最大通道绝对差容差 `20`、4-connectivity flood fill；仅边界连通近白区域作为背景。边缘使用 edge-only 抗锯齿 Alpha 与 white-matte unmix，opaque core RGB 不变。
- 技术结果：`ALPHA_CANVAS_MATCH=YES`、`BACKGROUND_ALPHA_ZERO=YES`、`POSITION_CHANGE=NO`、`SCALE_CHANGE=NO`、`OPAQUE_CORE_RGB_MATCH=YES`、`INTERNAL_ALPHA_HOLE=NO`、`ALPHA_EROSION=NO`。接触表已检查白、50% 灰、黑、棋盘、洋红背景；灰底和黑底 GIF 均 8 帧、100 ms/frame、600px 高、无限循环。
- QA-only 临时输出：`/tmp/celebration_dance_alpha_qa/`。`WHITE_MATTE_HALO=WATCH`，等待人工 Gray/Black/Checkerboard Alpha Acceptance；未记录 Human Alpha Acceptance 完成。
- 本轮未执行 `192 × 208`、premultiplied-alpha-safe resize、spritesheet、Action Registry、状态机、Runtime、npm start、打包或发布。

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

# 2026-08-30 celebration_dance F6 Right Release / Early Return HR Master 冻结

- F6 `Right Release / Early Return` 已完成人工视觉验收，正式选择 Candidate 02：`assets/cow-v2/actions/celebration_dance/celebration_dance_f6_candidate_02.png`。选择依据为 F5 → F6 continuity 成立，保留正确 Right-side Inertia，Hip 已开始释放但仍明显右偏，右腿仍主承重但开始释放，左腿 Early Return 清楚，Torso Counterbalance Release 合理，右拳开始下降，左手开始离开腹部并上升，Return Direction 清楚，F7 Remaining Space 充足；不存在明显 `F7_TOO_CLOSE` 或 `MECHANICAL_F2_MIRROR`。
- F6 High-Resolution Master 已由 Candidate 02 原文件直接复制冻结：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f6_master_hr.png`。Source 与 Master 均为 PNG、`1205 × 1306`、`RGB`、3 通道、无 Alpha、`1,654,904 bytes`，SHA-256 均为 `5f7d4ccb651c99eb0e13aeb1a22b8af68c063bed23a3f07ccdf2ceb6a9ea02ff`；`SHA256_MATCH=YES`、`BYTE_IDENTICAL=YES`，并已通过 `cmp` 字节级比较。
- Candidate 01：`assets/cow-v2/actions/celebration_dance/celebration_dance_f6_candidate_01.png` 未选作 Master，继续保留为历史 Candidate；其实际视觉更靠近 F5 Peak，存在较明显 `F5_TOO_CLOSE` 倾向。不删除、不修改、不移动。Candidate 02 Source 也继续保留。
- 本次冻结未进行视觉修改、重新编码、resize、crop、translation、alignment、canvas normalization 或 Alpha 处理；白色 RGB 背景仍保留，尚未转为 `192 × 208`。
- 当前正式 HR Anchors 已形成：F1 Left Peak ✅ → F2 Left Release ✅ → F3 Near Center A ✅ → F4 Right Anticipation ✅ → F5 Right Peak ✅ → F6 Right Release ✅。F7 Near Center B、F8 Left Anticipation 尚未生成，完整 8 帧尚未完成；Alpha、192×208、alignment、canvas normalization、spritesheet、Action Registry、状态机和业务逻辑均未进入。
- F6 Freeze 后下一阶段记录为 `F7 Near Center B / Return Arm Exchange Candidate Generation`，仅记录阶段，不在本轮执行。F7 必须体现 `Right → Left` 的运动历史，不得复制或机械镜像 F3。

# 2026-08-30 celebration_dance F7 Near Center B / Return Arm Exchange HR Master 冻结

- F7 `Near Center B / Return Arm Exchange` 已完成人工视觉验收，正式选择 Candidate 01：`assets/cow-v2/actions/celebration_dance/celebration_dance_f7_candidate_01.png`。选择依据为 F6 → F7 continuity 正确，Near Center Position 合理，保留 Right → Left Motion History，Hip Centering 合理，Right-leg Weight Release 清楚，Left-leg Weight Gain 已开始，Weight Exchange 仍有动态感，Left Fist Rising / Right Fist Lowering 清楚，Return Arm Exchange 明确，Torso 接近中心但没有静态锁死，与 F3 属于不同运动历史、非 F3 copy、非 F3 mirror，并为 F8 保留充分空间；未判定为 `IDLE_COLLAPSE`。
- F7 High-Resolution Master 已由 Candidate 01 原文件直接复制冻结：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f7_master_hr.png`。Source 与 Master 均为 PNG、`1199 × 1312`、`RGB`、3 通道、无 Alpha、`1,572,923 bytes`，SHA-256 均为 `bb9ac32ad2022b5b38d12a64350fd6c47139a03bdd1827babef3c6a9e47f64a7`；`SHA256_MATCH=YES`、`BYTE_IDENTICAL=YES`，并已通过 `cmp` 字节级比较。
- Candidate 02：`assets/cow-v2/actions/celebration_dance/celebration_dance_f7_candidate_02.png` 未选作 Master，继续保留为历史 Candidate；其更接近静态中轴，双腿平均站立感更强，Weight Exchange 动态读感较弱，`IDLE_COLLAPSE` 风险高于 Candidate 01。不删除、不修改、不移动。Candidate 01 Source 也继续保留。
- 本次冻结未进行视觉修改、重新编码、resize、crop、translation、alignment、canvas normalization 或 Alpha 处理；白色 RGB 背景仍保留，尚未转为 `192 × 208`。
- 当前正式 HR 序列已形成：F1 Left Peak ✅ → F2 Left Release ✅ → F3 Near Center A ✅ → F4 Right Anticipation ✅ → F5 Right Peak ✅ → F6 Right Release ✅ → F7 Near Center B ✅。F8 Left Anticipation 尚未生成，完整 8 帧尚未完成，Loop Seam 尚未正式验收；Alpha、192×208、alignment、canvas normalization、spritesheet、Action Registry、状态机和业务逻辑均未进入。
- F7 Freeze 后下一阶段记录为 `F8 Left Anticipation / Pre-Peak / Loop Seam Candidate Generation`，仅记录阶段，不在本轮执行。F8 后续需同时参考 F7 → F8 与 F8 → F1，并以 F2 检查 F8 → F1 → F2 的自然 Peak 进入与释放。

# 2026-08-30 celebration_dance HR Alignment / Canvas / Baseline Engineering

- `celebration_dance` HR Alignment / Canvas / Baseline Engineering 已完成。正式 HR Master 仍是唯一 authoritative visual source；本轮新建的 aligned HR Copy 是 production engineering intermediate，未修改八个 Master，确认 `HR_MASTER_MUTATION=NO`。
- 由于仓库现有 production spritesheet 基线为 `1536 × 2704`、`8 × 13`、单帧 `192 × 208`，且未发现现成 celebration_dance alignment convention，选用 `1344 × 1456` 作为 aligned HR Canvas：严格 `12:13`、对应 `7×` 的 `192 × 208`，并能在不缩放的情况下容纳八张原始 HR Canvas 与当前角色占屏比例。`QA Canvas padding ≠ Production alignment`。
- Alignment 仅使用固定 head / muzzle anchor 与 ground-contact baseline 的整数像素 dx/dy 平移；`scale=1.0`、rotation=0、crop=false、resized=false、alpha=false、无重采样。禁止逐帧 bbox 居中，保留 Hip 横向 choreography、Weight Transfer、Leg / Arm trajectory、Peak Separation 与 F8 → F1 Loop Seam。
- Aligned outputs：`assets/cow-v2/actions/celebration_dance/aligned/celebration_dance_f1_aligned_hr.png`（SHA-256 `b4a52eabe973bea2b345a83b28e3217534b444cb603a1bb087dc36bd943df900`，dx=70，dy=147）；F2（`f3057e051511b34722a758ae36ff731e602b97b711d49c7935e5b79077556c0c`，dx=105，dy=138）；F3（`4744ece0beede0e9d85fde63bc8926b2924679cea2ac2b1c19ebd7963bc27403`，dx=83，dy=137）；F4（`0fc665fa52b671bfc81a223bd9a0d4008821ec17ea7493679419fe9fffc399fa`，dx=107，dy=143）。
- Aligned outputs continued：F5（`3f5935ac61ab08c8211aa500bb9862a222e863ccfb227f4f1257c6aa7fc1e5c2`，dx=122，dy=142）；F6（`69f2f21dd1c2e8079cfd0ffea7616cd76796be468b3e67088a9721f695c47c60`，dx=50，dy=148）；F7（`8be57c7f5dcfa22831d8fa4c56ef47a74fb224eccc641c4d1522dbb027617c5f`，dx=113，dy=143）；F8（`9245dc05e14636edc58691fb74dec9aae653fc80eef181dfdcd1272052cdfff1`，dx=91，dy=140）。所有 aligned PNG 均为 `1344 × 1456` RGB、3 通道、无 Alpha。
- Deterministic manifest：`assets/cow-v2/actions/celebration_dance/aligned/alignment.json`。每帧均通过 `SOURCE_PIXEL_REGION_MATCH=YES` 与 `CLIPPING=NO`，统一 `COMMON_CANVAS=YES`、`SCALE_CHANGE=NO`；本轮 `CHOREOGRAPHY_PRESERVED=YES`、`LOOP_SEAM_PRESERVED=YES`。
- Alignment QA-only preview：`/var/folders/xw/v1zhzd5d06x_zppth87hhthm0000gn/T/celebration-dance-aligned-qa.lklsetfq/celebration_dance_aligned_contact_sheet_qa.png` 与 `celebration_dance_aligned_loop_600px_qa.gif`。GIF 为 600px 高、8 actual frames、100ms/frame、`LOOP=INFINITE`，未加入项目资产。
- 本轮未执行 Alpha、192×208 Production Frames、spritesheet assembly、Action Registry、状态机、业务逻辑、Runtime、npm start、打包、发布、macOS 动画运行验证或 Windows 验证。下一阶段为 `celebration_dance Alpha preparation / 192×208 Production Frames`，仅记录阶段，不在本轮执行。

# 2026-08-30 celebration_dance Human Full-Loop Acceptance

- `celebration_dance` Human Full-Loop Acceptance 已完成。人工实际观看 `celebration_dance_human_review_10fps` 的 F1 → F8、约 10 FPS、无 interpolation / optical flow / morph / tween 的完整循环预览，最终结果为：`A. HUMAN FULL-LOOP ACCEPTED`。
- 人工结论：Overall Dance Readability PASS，动作读作快速左右扭胯庆祝舞；Rhythm PASS，左右节奏成立；Left Peak PASS，F8 → F1 → F2 的 Approach → Peak → Release 成立；Right Peak PASS，F4 → F5 → F6 的 Peak 节奏成立；Loop Seam PASS，F8 → F1 自然；Identity PASS，八帧整体像同一头牛；Surface / Lighting 差异在完整播放中可接受；无 HR Frame Rework required。
- P0 BLOCKER：None。上一阶段记录的 F8 → F1 Peak Separation、Loop rhythm、Surface / Lighting playback consistency 经人工完整循环观看后均未形成 HR 返工阻塞，不再标记为 pending human acceptance。P2 仍保留为工程事项：original canvas size differences、framing drift、baseline drift、minor center drift、padding / placement requirements。
- 当前状态：F1–F8 八个 HR Master ✅；Technical Sequence QA ✅；Human Review Package ✅；Human Full-Loop Acceptance ✅；HR choreography and human full-loop acceptance completed。不得将此状态描述为已完成 Alignment、正式 Sprite、Runtime 接入或发布。
- Alpha、192×208、alignment、baseline normalization、canvas normalization、spritesheet、Action Registry、状态机、业务逻辑、npm start、打包、发布、macOS 动画运行验证和 Windows 验证仍未执行。下一阶段正式记录为 `celebration_dance HR Alignment / Canvas / Baseline Engineering`，仅记录阶段，不在本轮执行。

# 2026-08-30 celebration_dance Full 8-Frame HR Sequence Technical QA

- 已核验正式 `celebration_dance` F1–F8 八个 High-Resolution Master：文件均存在、为可读取的 RGB PNG、无 Alpha，冻结记录中的 SHA-256 全部一致；`HR_MASTER_MUTATION=NO`。本轮未修改、重存、resize、crop、translation、alignment 或重新生成任何 HR Master。
- 已生成 QA-only 临时预览（均位于 `/tmp/celebration-dance-qa.Zmm4ZG/`，不属于项目资产）：Contact Sheet `celebration_dance_f1_f8_contact_sheet_qa.png`；约 10 FPS、6 次循环 `celebration_dance_f1_f8_loop_10fps_qa.gif`；每帧 400 ms、2 次循环 `celebration_dance_f1_f8_loop_slow_400ms_qa.gif`。预览采用最大 `1205 × 1312` 统一 QA Canvas，仅做白色 padding，不做 resize、crop、逐帧 subject alignment 或动态 translation；`QA Canvas padding ≠ Production alignment`。
- Technical HR Sequence QA：八帧角色身份、动作职责、左右 Hip trajectory、Weight transfer、Leg trajectory、Arm trajectory、Torso counterbalance、Head stability、Horizontal Motion 主导关系及左右 Peak 的 `Approach → Peak → Release` 结构均成立；F3 / F7 均为 Near Center，但运动历史不同，未发现 Center Frame duplication、明显 Anatomy blocker、方向反转或 Peak flattening。
- Loop QA：F7 → F8 的左向进入、F8 → F1 的 Loop Seam、F1 → F2 的 Peak release 方向成立；F8 → F1 → F2 的节奏可读。由于本轮未进行完整人工播放确认与正式工程对齐，`Loop Seam Final Acceptance` 记录为 pending，技术结论为 `PASS WITH HR VISUAL REVIEW RECOMMENDED`，无 P0。
- P1 Visual Watch：需要人工在 QA loop 播放中复核 F8 → F1 的 Peak Separation、整体 Surface / Lighting 是否存在可接受的小幅闪烁，以及八帧作为连续动作而非独立图片的最终读感。P2 Engineering Alignment：各 HR Master 原始尺寸、framing、baseline 和 approximate subject bbox 存在小幅差异，后续可在专门的 alignment / canvas / baseline 工程阶段处理；本轮不修正。
- 本轮未执行 Full 8-frame HR Sequence Final Acceptance、Loop Seam Final Acceptance、Alpha、192×208、alignment、baseline normalization、canvas normalization、spritesheet、Action Registry、状态机、业务逻辑、npm start、打包、发布或运行时验证。下一阶段建议为 `celebration_dance HR Alignment / Canvas / Baseline Engineering`，但应先完成人工完整循环复核并关闭 P1 决策。

# 2026-08-30 celebration_dance F8 Left Anticipation / Pre-Peak / Loop Seam HR Master 冻结

- F8 `Left Anticipation / Pre-Peak / Loop Seam` 已完成人工视觉验收，正式选择 Candidate 02：`assets/cow-v2/actions/celebration_dance/celebration_dance_f8_candidate_02.png`。其 F7 → F8 continuity、左侧 Hip Shift、Left-leg Weight Gain、Right-leg Release、左拳高位、右手 Belly / Cross-belly Entry、Torso Right Counterbalance 与 Leftward Motion Direction 均成立；F8 → F1 Loop Continuity、F1 Peak Separation 及 F8 → F1 → F2 的 Approach → Peak → Release 节奏合理，未发现明显 F1 Clone、Loop Direction Reversal、Mechanical Symmetry 或 Arm Belly Occlusion。
- F8 High-Resolution Master 已由 Candidate 02 原文件直接复制冻结：`assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f8_master_hr.png`。Source 与 Master 均为 PNG、`1200 × 1311`、`RGB`、3 通道、无 Alpha、`1,604,905 bytes`，SHA-256 均为 `f9a8bc92ed049e522fe8bd1820b9baa08156b6619a4de19cb12e2da5246e2947`；`SHA256_MATCH=YES`、`BYTE_IDENTICAL=YES`，并已通过 `cmp` 字节级比较。
- Candidate 01：`assets/cow-v2/actions/celebration_dance/celebration_dance_f8_candidate_01.png` 未选作 Master，继续保留为历史 Candidate；其 Identity / Anatomy 合格，但实际更靠近 F1 Peak，`F1_TOO_CLOSE` 风险高于 Candidate 02，可能压缩 F8 → F1 最后进入动作空间。不删除、不修改、不移动。Candidate 02 Source 也继续保留。
- 本次冻结未进行视觉修改、重新编码、resize、crop、translation、alignment、baseline normalization、canvas normalization 或 Alpha 处理；白色 RGB 背景仍保留，尚未转为 `192 × 208`。未进行完整 8 帧正式验收或运行时动画验证。
- 当前正式 HR Master 已形成完整序列：F1 Left Peak ✅ → F2 Left Release ✅ → F3 Near Center A ✅ → F4 Right Anticipation ✅ → F5 Right Peak ✅ → F6 Right Release ✅ → F7 Near Center B ✅ → F8 Left Anticipation ✅。这只表示 8 个 HR Master 已具备，不代表 `celebration_dance` 已完整接入或发布。
- 当前仍未完成：Full 8-frame HR Sequence Acceptance、Loop Seam Final Acceptance、Alpha、192×208、alignment、baseline normalization、canvas normalization、spritesheet、Action Registry、状态机、业务逻辑、npm start、打包、macOS 动画运行验证和 Windows 验证。下一阶段记录为 `celebration_dance Full 8-Frame HR Sequence & Loop Seam Acceptance`，仅记录阶段，不在本轮执行。

# 2026-08-30 celebration_dance F8 Left Anticipation / Pre-Peak / Loop Seam Candidates

- 已生成两张 F8 `Left Anticipation / Pre-Peak / Loop Seam` High-Resolution Candidate：`assets/cow-v2/actions/celebration_dance/celebration_dance_f8_candidate_01.png` 与 `assets/cow-v2/actions/celebration_dance/celebration_dance_f8_candidate_02.png`，等待人工视觉验收；F8 Master 尚未选择、尚未冻结。
- Candidate 01 定位为 `Continuity First / Moderate Left Pre-Peak`：从 F7 Near Center B 明显进入左侧，左腿开始主要承重、右腿开始向右释放，左拳进入高位、右手进入腹部方向，保持 F7 → F8 连续性并为 F1 Peak 保留更多空间。
- Candidate 02 定位为 `Loop Seam First / Strong Left Pre-Peak`：比 Candidate 01 更靠近 F1，左侧 Weight、右向 Torso Counterbalance、左拳高位和右手腹部进入更强，强调 F8 → F1 loop continuity，但仍保留进入 F1 的最后动作空间。
- 两张候选均以 F7 Near Center B HR Master 为第一参考、F1 Left Peak HR Master 为 Loop Seam 目标、F2 Left Release HR Master 为 F8 → F1 → F2 节奏上下文、F3 仅为空间尺度上下文；未使用 F3 作为姿态模板，未进行机械复制、水平镜像或旧失败素材构造。
- Candidate 01：`1199 × 1312`、`RGB PNG`、3 通道、无 Alpha、`1,596,015 bytes`、SHA-256 `3a45f1049920571f1ea87241330b9c491ef9f36541dd96fda9481c2149ac1bad`。Candidate 02：`1200 × 1311`、`RGB PNG`、3 通道、无 Alpha、`1,604,905 bytes`、SHA-256 `f9a8bc92ed049e522fe8bd1820b9baa08156b6619a4de19cb12e2da5246e2947`。两张均已通过 PNG 可读取检查。
- Candidate 级视觉 QA：两张均表现 F7 → F8 的左向连续性、左侧 Hip Shift、左腿 Weight Gain、右腿 Release、左拳 Rising、右手 Belly Entry、Torso Right Counterbalance、F1 Direction Readability 与双臂分离；未发现 `F7_TOO_CLOSE`、`F1_CLONE_FAIL`、`LOOP_DIRECTION_REVERSAL`、`MECHANICAL_SYMMETRY_FAIL`、`ARM_BELLY_OCCLUSION`、`VERTICAL_MOTION_TOO_STRONG` 或 `IDLE_COLLAPSE`。Candidate 02 更接近 F1，存在 `F1_TOO_CLOSE` WATCH；两张因尚未做 alignment / canvas normalization，均保留 `LOOP_CAMERA_SCALE_WATCH`。
- 本轮只完成候选生成和候选级 Loop Seam QA，未进行完整 8 帧正式验收；F8 Human Acceptance pending，F8 Master 尚未冻结。未进行 Alpha、192×208、resize、crop、translation、alignment、canvas normalization、spritesheet assembly、Action Registry、状态机或业务逻辑修改。
- 当前正式状态为 F1 ✅、F2 ✅、F3 ✅、F4 ✅、F5 ✅、F6 ✅、F7 ✅、F8 Candidate only；完整 8 帧 HR Master Sequence、Loop Seam Final Acceptance、Alpha、192×208、alignment、canvas normalization、spritesheet、Registry、状态机和业务逻辑均未完成。下一阶段为 `F8 Human Acceptance / Loop Seam Final Acceptance`，仅记录阶段，不在本轮执行。

# 2026-08-30 celebration_dance F7 Near Center B / Return Arm Exchange Candidates

- 已生成两张 F7 `Near Center B / Return Arm Exchange` High-Resolution Candidate：`assets/cow-v2/actions/celebration_dance/celebration_dance_f7_candidate_01.png` 与 `assets/cow-v2/actions/celebration_dance/celebration_dance_f7_candidate_02.png`，等待人工视觉验收；F7 Master 尚未选择、尚未冻结。
- Candidate 01 定位为 `Continuity First / Right Residual Near Center`：更保留 F6 的右侧运动历史，Hip 接近中心但留有轻微右侧残余，Weight 进入交换区，双臂回程交换继续推进，并为 F8 左侧进入保留更多空间。
- Candidate 02 定位为 `Direction Change First / Stronger Return Exchange`：比 Candidate 01 更明确表现 Right → Left 的方向转换，Hip 更接近中心，左腿接管趋势和 Return Arm Exchange 更强，但仍未进入 F8 Left Anticipation。
- 两张候选均以 F6 Right Release HR Master 为第一参考、F5 Right Peak HR Master 为运动历史参考、F1 Left Peak HR Master 为远端左向目标上下文、F3 Near Center A HR Master 为空间尺度参考；未使用 F3 作为姿态模板，未进行 F3 复制或机械水平镜像。
- Candidate 01：`1199 × 1312`、`RGB PNG`、3 通道、无 Alpha、`1,572,923 bytes`、SHA-256 `bb9ac32ad2022b5b38d12a64350fd6c47139a03bdd1827babef3c6a9e47f64a7`。Candidate 02：`1204 × 1306`、`RGB PNG`、3 通道、无 Alpha、`1,649,905 bytes`、SHA-256 `0c3ddd0a59f5e93d8e0665f6de8a694a0a55c8dead0fd83c8fb4864c48feab88`。两张均已通过 PNG 可读取检查。
- Candidate 级视觉 QA：两张均通过 Identity、F6 → F7 Continuity、Near-center Position、Hip Centering、Right-leg Weight Release、Left-leg Weight Gain、Weight Exchange、Right Fist Lowering、Left Fist Rising、Return Arm Exchange、Arm Separation、Arm Anatomy、Torso Centering、Head / Expression、Camera / Scale、Surface / Lighting、F8 Remaining Space；双脚接地，未发现 `F6_TOO_CLOSE`、`F3_COPY_FAIL`、`F3_MIRROR_FAIL`、`F8_TOO_CLOSE` 或 `ARM_EXCHANGE_FUSION`。`IDLE_COLLAPSE` 未判定为硬失败，但普通站姿风险与 Right → Left 运动历史仍需人工重点复核。
- 本轮未进行 Alpha、192×208、resize、crop、translation、alignment、canvas normalization、spritesheet assembly、Action Registry、状态机或业务逻辑修改；F8 未生成，完整 8 帧尚未完成。

# 2026-08-30 celebration_dance F6 Right Release / Early Return Candidates

- 已生成两张 F6 `Right Release / Early Return` High-Resolution Candidate：`assets/cow-v2/actions/celebration_dance/celebration_dance_f6_candidate_01.png` 与 `assets/cow-v2/actions/celebration_dance/celebration_dance_f6_candidate_02.png`，等待人工视觉验收；F6 Master 尚未选择、尚未冻结。
- Candidate 01 定位为 `Continuity First / Peak Release`：更像 F5 刚开始释放的下一帧，保留更多右侧 Peak 惯性，Hip 仅部分回收，右腿仍明显主承重，左腿保持较大左侧展开，右拳开始下降、左手刚离开腹部，为 F7 留出较大空间。
- Candidate 02 定位为 `Return Momentum First / Stronger Release`：比 Candidate 01 更明确地向中心回程，但仍明显右偏；右腿仍主承重但释放更多，左腿回收更多，Torso 更接近中轴，右拳下降更多、左手上升更多，仍保留 F7 Near Center 的下一步空间。
- 两张候选均以 F5 Right Peak HR Master 为第一参考、F4 Right Anticipation HR Master 为第二参考、F3 Near Center A HR Master 为第三参考、F2 Left Release HR Master 为轨迹上下文、F1 Left Peak HR Master 为远端上下文；未使用旧候选、机械镜像、silhouette、Structure / Occlusion、Volume Blockout 或其他非正式研究素材。
- Candidate 01：`1205 × 1306`、`RGB PNG`、3 通道、无 Alpha、`1,585,626 bytes`、SHA-256 `5a1ac3304dd68fe9c42f1bbdf75e52382706b8b4f1a2855c8eed013177d1177c`。Candidate 02：`1205 × 1306`、`RGB PNG`、3 通道、无 Alpha、`1,654,904 bytes`、SHA-256 `5f7d4ccb651c99eb0e13aeb1a22b8af68c063bed23a3f07ccdf2ceb6a9ea02ff`。两张均已通过 PNG 可读取检查。
- Candidate 级视觉 QA：两张均保持 Identity、Camera / Scale、Surface / Lighting、头部正面与淡定表情；均表现 F5 → F6 的右侧惯性释放、Hip 回收、右腿仍承重、左腿回收、右拳下降、左手离开腹部并上升、Torso 反平衡减弱、双臂可追踪且分离、双脚接地；未发现 `F5_TOO_CLOSE`、`F7_TOO_CLOSE`、`MECHANICAL_F2_MIRROR` 或 `ARM_BELLY_OCCLUSION`。
- 本轮未进行 Alpha、192×208、resize、crop、translation、alignment、canvas normalization、spritesheet assembly、Action Registry、状态机或业务逻辑修改；F7/F8 未生成，完整 8 帧尚未完成。

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
# 2026-08-30 celebration_dance Correct Alpha Background Islands

- 人工确认的三个问题是 F1、F5、F8 三个 Frame，不是 F1 内三个 pocket。旧 border-connected-only pipeline 漏掉 enclosed islands，且 edge pass 曾将 removed core 写回 partial alpha。
- 已从 aligned HR RGB 按统一 corrected-v2 临时 pipeline 重建 F1–F8 Alpha HR：Pass 1 tolerance 20 / 4-connectivity；Pass 2 strict seed 6 / 8-connectivity / growth 20 / minimum seed area 100 / mean distance <=6；edge mask 明确排除 removed mask。
- F1/F5/F8 各检测并移除 1 个 enclosed island；八帧均为 1344×1456 RGBA，边界 Alpha=0，removed island core 不再 reopaque。QA-only corrected contact sheet 与 Gray/Checkerboard 600px loop 位于 `/tmp/celebration-dance-alpha-final.wgnmbp37/`。
- HR Master 与 aligned source 未改变；192×208、spritesheet、Registry、Runtime、打包和发布均未执行。Technical Corrected Alpha QA 已完成；Human Corrected Alpha Acceptance 仍 pending。
# 2026-08-30 celebration_dance 192x208 Production Frame Preparation

- `celebration_dance` Corrected Alpha HR 已完成人工最终验收：`Human Corrected Alpha Acceptance = ACCEPTED`，验收依据 commit `146fee80408fcc30d2122c19d6d7bf9f926de0b6`。
- 从已提交的 `alpha_hr/` 唯一输入按精确 `1/7` 进行 premultiplied-alpha-safe resize，源 `1344x1456`，目标 `192x208`，LANCZOS，F1→F8 顺序保持不变。
- 新增正式 production engineering frame 目录 `assets/cow-v2/actions/celebration_dance/production_192/`，八帧均为 RGBA PNG；未修改 `spritesheet.webp`、Action Registry、状态机或 Runtime。
- 192×208 Technical QA：尺寸、Alpha、透明背景、背景岛回归、白边/黑边、轮廓与帧序均通过；QA-only Contact Sheet 与 Gray/Checkerboard Loop 位于 `/tmp/celebration-dance-production-192.m4u4afwa/`。本轮未执行 spritesheet、Runtime、打包或发布。

# 2026-08-31 Watchlist Big-Move Alert Badge V1

- 当前真实功能：只监控 `watchlist` 中 `symbol !== currentSymbol` 的标的；后台主进程批量复用现有 `fetchBuffer`、Sina headers、proxy/direct fallback 与 parser 约定，renderer 只接收窄字段 quote。
- Alert 通过正式 `marketStateEngine.getState(changePct, { symbol })` 归一为 `normal` / `strong_up` / `strong_down`，没有复制阈值。首次后台 quote 只 baseline；normal→strong_up/down 才触发，退出强区后可重新触发，反向方向是新事件。
- Alert Runtime 独立于 Market State/Cow Action：后台 quote 不进入 `__pushMarket`、`applyMarket`、`requestAction`、`setState`，不会驱动牛动作。Market QA 环境禁用后台 monitor；current symbol 排除后台请求。
- UI 为 `#stage` 内独立红色圆形白色 `!` 与自选快速菜单行末静态小 `!`。大 `!` 点击只打开现有菜单并清 global unseen，symbol pending 保留；正式 `selectSymbol()` 只清被点击 symbol。删除清理 state，Undo 恢复后重新 baseline，跨 `quoteDate` 清除旧日 pending/unread 并重置追踪。
- 本轮未修改 `marketState.js`、`cowStateMachine.js`、`timeState.js`、`MARKET_STATE_MAPPING.md`、spritesheet、Action Registry 或 assets。Market QA all suite 已通过；macOS 可见窗口的 badge 多倍率人工检查仍需记录，Windows Runtime、Packaging、Release 未执行。

# 2026-08-31 Developer-only Watchlist Alert QA Harness

- `WATCHLIST_ALERT_QA=AVAILABLE`：使用 `npm run qa:watch-alert -- --suite all`，通过 `NIULAI_ALERT_QA=1` + `niulaiAlertQa=1` 显式启用；仅未打包环境可启用，且与 `NIULAI_MARKET_QA=1` 互斥。
- QA API 为 `window.__niulaiWatchAlertQA`，只在 Alert QA query 下存在，负责 configure、synthetic quote、snapshot、真实 DOM badge/menu/symbol click 与 setScale；synthetic quote 复用正式 `processWatchQuote()` / `alertZone()` / `watchAlertStates` / `refreshWatchAlertUI()`，未复制阈值或 Alert 实现。
- QA 期间关闭真实 watchlist quote polling、current feed refresh 和 Market QA runner；Alert QA 不调用 `__pushMarket()`、`applyMarket()`、`requestAction()` 或 `setState()`。逻辑和交互 suite 通过，逻辑重复运行 3/3；visual suite 完成 Electron 80/130/160 hold，截图观察到红色 head badge，视觉 PASS 仍以人工逐项检查为准。
- `logic`、`interaction`、`visual`、`all` suite 均通过；logic 重复运行 3/3 通过。视觉 suite 在 macOS Electron 实际窗口完成 80/130/160 hold，并观察到 head badge；DOM click 交互通过，物理鼠标逐项点击与透明 hit-test 仍需人工复核。`npm run qa:market -- --suite all --hold 1200` 通过；普通 `npm start` smoke 启动成功。Windows Runtime、Packaging、Release 未执行，未修改 market/state/spritesheet/asset authority。

# 2026-08-31 Current Quote Ownership and Background Baseline QA

- `QUOTE_OWNERSHIP_EXPLICIT=YES`：renderer 通过 `lastQuoteSymbol` 与 `recordCurrentQuoteMeta()` 记录最后一份有效 quote 的 symbol、价格、昨收和 quoteDate；启动默认 `simPrice/simPrevClose` 不再被视为可信 symbol quote。正式 `__pushMarket()` 和 Web real feed 都记录 ownership。
- `selectSymbol()` 只有在 `lastQuoteSymbol === previous` 且价格/昨收有效时才用 previous quote 建 background baseline；否则调用现有 `seedWatchAlert(previous)` 进入 uninitialized 状态，禁止把其他 symbol 的行情猜成 `normal`。
- Alert QA 仅新增 developer-only `setCurrentQuote()` 记录 ownership，不触发 Market State/Cow Action；`interaction` 已覆盖 `trusted-current-background-baseline` → normal → `trusted-current-background-reentry`，以及 A→B→C 快速切换的 `untrusted-fast-switch-background-baseline` → reentry。结果：`TRUSTED_CURRENT_TO_BACKGROUND=PASS`、`UNTRUSTED_FAST_SWITCH_TO_BACKGROUND=PASS`、`CURRENT_BACKGROUND_QA_REPEAT=3/3`。
- 当前验证：Alert interaction 3/3、Alert all、Market QA all、普通 `npm start` smoke 均通过；`MACOS_ALERT_VISIBLE_RUNTIME=PARTIAL`、`PHYSICAL_MOUSE_VALIDATION=NOT FULLY VERIFIED`、`TRANSPARENT_MOUSE_HIT_REGRESSION=NOT FULLY VERIFIED` 保持不变。Windows Runtime、Packaging、Release 未执行。

# 2026-08-31 Windows Packaging Sync

- 已从 GitHub `origin/main` 快进同步 Mac 新进度至 commit `bc4570f726a3f52f206ee27067621de760e0be13`；本地 `main` 与远端一致，源码工作区干净。
- 使用 Electron `33.4.11` 与 electron-builder `26.15.6` 在 Windows x64 重新生成安装版和便携版；项目未配置 `npm test`，因此未执行成功该命令。Watchlist Alert QA 的逻辑与交互阶段通过，视觉阶段在本次执行窗口内未完整收尾。
- 最新 Windows 安装版：`dist/牛来看盘神器 Setup 1.0.0.exe`，已复制至 `E:\Moony\MoonyMade\牛来看盘神器Win\牛来看盘神器 Setup 1.0.0.exe`；文件大小 `89,979,190` bytes，SHA-256 `4E137C6D383ECB4F400EE3E3AD7495248AC84CE49EA3CA4893831D970F32616A`。
- 最新 Windows 便携版：`dist/牛来看盘神器-1.0.0-portable.exe`，已复制至 `E:\Moony\MoonyMade\牛来看盘神器Win\牛来看盘神器-1.0.0-portable.exe`；文件大小 `89,598,686` bytes，SHA-256 `A30BE7F4C3E7998856078816C6E30F70826E8FF152E1F2F6F1EA70D89F1F26F2`。
- 已确认发布目录中的两个文件与本地 `dist` 产物校验值一致。Windows 实机安装、启动、交互和发布验收仍未完成；macOS 封装本轮未执行。
