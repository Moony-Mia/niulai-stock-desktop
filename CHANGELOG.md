# CHANGELOG

## 2026-08-30

- F4 Candidate 02 已完成人工视觉验收并被选定为 `Right Anticipation / Pre-Peak` HR Master 来源；Candidate 01 保留但不采用，其实际视觉更接近 F5 Peak，会压缩 F4 → F5 的最终动作空间。
- F4 HR Master 已由 Candidate 02 原文件直接复制冻结为 `assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f4_master_hr.png`；Source / Master 均为 `1202 × 1308`、`RGB PNG`、3 通道、`1,695,054 bytes`，SHA-256 为 `266dc65fa820ae2d83808e730d4a5ecacdfac6bdf9cc82cb636f66740b096b1b`，`SHA256_MATCH=YES`、`BYTE_IDENTICAL=YES`。
- F1/F2/F3/F4/F5 已形成连续正式 HR Anchors；F6/F7/F8 尚未生成，完整 8 帧尚未完成，Alpha、192×208、alignment、canvas normalization、spritesheet、Registry、状态机和业务逻辑均未执行。下一阶段为 `F6 Right Release / Early Return Candidate Generation`。
- 已生成两张 `celebration_dance` F4 `Right Anticipation / Pre-Peak` High-Resolution Candidate：Candidate 01（`Continuity First / Moderate Pre-Peak`）与 Candidate 02（`Peak Preparation First / Strong Pre-Peak`），等待人工视觉验收；F4 Master 尚未选择、尚未冻结。
- Candidate 01 更强调 F3 → F4 连续性和 F4 → F5 剩余空间；Candidate 02 更强调右侧进入和 F5 预备感，但两张都未复制 F5 Peak。两张候选均保持 Identity、Camera、Surface 和基本 Lighting，未发现双脚离地、过强垂直运动或左臂腹部融合风险。
- F4 Candidate 01 为 `1203 × 1308` RGB PNG、无 Alpha、`1,686,536 bytes`、SHA-256 `86f9691127ee3fdaac4fb6e3f7b826884b25effa1fb0f9d4efa3f814217cf0fb`；Candidate 02 为 `1202 × 1308` RGB PNG、无 Alpha、`1,695,054 bytes`、SHA-256 `266dc65fa820ae2d83808e730d4a5ecacdfac6bdf9cc82cb636f66740b096b1b`。
- 当前正式状态为 F1 ✅、F2 ✅、F3 ✅、F4 Candidate only、F5 ✅；F6/F7/F8、完整 8 帧、Alpha、192×208、alignment、canvas normalization、spritesheet、Registry、状态机和业务逻辑均未执行。
- 人工视觉验收正式选择 `celebration_dance_f3_candidate_01.png` 作为 F3 `Near Center A / Arm Exchange` HR Master 来源：其 F2 → F3 连续性、左侧惯性、接近中心的 Hip、尚未完成的 Weight Exchange、清楚的 Arm Exchange 以及为 F4 保留的动作空间均符合 F3 职责；Candidate 02 保留但不选。
- F3 HR Master 已由 Candidate 01 原文件直接复制冻结为 `assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f3_master_hr.png`；Source / Master 均为 `1203 × 1307`、`RGB PNG`、`1,629,213 bytes`，SHA-256 为 `bbd352979d221ed65fbc4d047755ff1eeaee1f18a7a5214cad2f1c33e583a38b`，并已通过字节级一致性验证。
- 本次仅完成 F3 Master Freeze，未生成 F4/F6/F7/F8，未完成完整 8 帧，未处理 Alpha、192×208、alignment、canvas normalization、spritesheet、Registry、状态机或业务逻辑；下一阶段为 `F4 Right Anticipation / Pre-Peak Candidate Generation`。
- 已生成两张 `celebration_dance` F3 `Near Center A / Arm Exchange` High-Resolution Candidate：Candidate 01（`Continuity First`）与 Candidate 02（`Exchange First`），等待人工验收，尚未选择或冻结 F3 Master。
- F3 候选以 F2 Left Release HR Master 为第一参考，F1 Left Peak HR Master 为第二参考，F5 Right Peak HR Master 为第三参考；未使用旧候选或历史失败路线。
- 两张 F3 候选均保留白色 RGB 背景，未处理 Alpha、未转 `192 × 208`、未 alignment，未修改 F1/F2/F5 Master、spritesheet、Registry、状态机或业务逻辑；F4/F6/F7/F8 与完整 8 帧尚未生成。

## 2026-08-30

- `celebration_dance_f2_candidate_01.png` 已通过人工验收并被选定为 F2 Source；`celebration_dance_f2_candidate_02.png` 未选用为 Master，继续保留。
- F2 `Left Release / Early Transition` 已冻结为 `assets/cow-v2/actions/celebration_dance/masters/celebration_dance_f2_master_hr.png`；Source 与 Master 字节级一致，SHA-256 均为 `19821889a5b4d00dc5ac0c97e277ef69f3ba6e274eedcc4258a4b1e47c846f7b`。
- F2 保持白色 RGB 背景，未进行视觉修改、resize、crop、translation 或 alignment，未处理 Alpha，未转 `192 × 208`。
- 当前正式 HR Anchors 为 F1 Left Peak、F2 Left Release、F5 Right Peak；F3/F4/F6/F7/F8 尚未生成，完整 8 帧尚未完成，未修改 spritesheet、Registry、状态机或业务逻辑。
- 下一阶段为 `F3 Near Center A / Arm Exchange Candidate Generation`；F2 将作为 F3 最重要的局部连续性参考。

## 2026-08-30

- 修正冻结任务中的 SHA-256 描述笔误；实际核验 `celebration_dance_right_peak_candidate_02.png` 通过，正确 SHA-256 为 `62366ae6b12f22d4d5178cff107e7a337640e7eab7e879fb585cc6792caf2727`。
- Right Peak Candidate 02 技术验收记录为 `91 / 100`，人工视觉验收通过，未发现 `P0`，并直接冻结为 `assets/cow-v2/actions/celebration_dance/masters/celebration_dance_right_peak_master_hr.png`。
- Source 与 Right Peak HR Master 字节级一致；Left / Right HR Peak 均已建立，左右峰值 compatibility review 已通过。
- Right Peak HR Master 保留白色 RGB 背景，未处理 Alpha，未转 `192 × 208`；未生成 Intermediate Frames，未完成 celebration_dance 正式动画。
- 尚未修改正式 spritesheet、Action Registry、状态机或业务逻辑；下一阶段为 `Intermediate Transition Frames`。

## 2026-08-30

- `celebration_dance_left_peak_identity_correction_02` 经人工视觉验收，被选定并冻结为 `celebration_dance Left Peak High-Resolution Master`。
- 新增标准母版文件 `assets/cow-v2/actions/celebration_dance/masters/celebration_dance_left_peak_master_hr.png`；由 Identity Correction 02 原文件直接复制，源文件与 Master 已完成尺寸、RGB 模式、SHA-256 和字节级一致性验证。
- Left Peak HR Master 现在作为后续右峰值、中间过渡帧、Identity / Surface 一致性检查、192×208 转换及完整 `celebration_dance` 动画帧的主要视觉参考基线。
- 已记录并锁定正式牛 Identity 与 Left Peak Pose 关系；停止继续生成左峰值候选。下一阶段为 `Right Peak High-Resolution Master`。
- 当前 Master 保留白色 RGB 背景，尚未透明化；尚未转换到 `192 × 208`，尚未修改正式 spritesheet、Action Registry、状态机或业务逻辑。

## 2026-08-29

- 当前状态纠正：人工视觉复核确认 `Structure / Occlusion V1` 失败；其后制作的 `Volume Blockout V1`（保留历史提交 `811c0a0`）同样失败。两次失败历史均保留，未进入正式资产或 `Identity Reconstruction`。
- `Volume Blockout V1` 的失败根因已定位为使用 PIL / ImageDraw 的 ellipse、polygon、rectangle 等几何 primitive 直接建立有机角色 Anatomy / Volume，导致头颈肩胸、手臂、腹部骨盆、关节和腿部呈几何组件 / 贴片感；当前停止继续修复该候选。
- 明确停止 `Volume Blockout V1.1`、`Volume Blockout V1.2`、`Structure / Occlusion V1.1`，不通过调整或增加几何 primitive 延续该路线。`Pose Blueprint`、`Silhouette V2`、`Silhouette V2.1` Pose / Silhouette Boundary 仍为有效基线。
- 下一阶段改为 `AI / Generative Volume Reconstruction`，先完成人工验收的完整有机身体，再进入 `Identity Reconstruction`、`Surface`、192×208 适配和左峰值最终验收；尚未进入正式 `celebration_dance`、spritesheet、Registry 或业务接入。
- 本轮仅纠正文档状态；未制作新候选图片，未修改正式 `spritesheet.webp`、Action Registry、状态机、行情逻辑或 Electron 配置。

- 后续人工视觉复核确认既有 `Structure / Occlusion V1` 候选未通过：该候选历史保留，但未进入正式资产，也未进入 `Identity Reconstruction`；下一阶段调整为 `Volume Blockout`。
- 基于已确认的 `celebration_left_peak_silhouette_v2_1` Pose / 外轮廓，新增 `assets/cow-v2/candidates/celebration-dance/volume-blockout-v1/`，制作连续头颈肩胸、宽右臂横腹体块、连续胸腹骨盆和双腿体块的 `Volume Blockout V1` 候选；本轮仍待人工验收。
- 新增 `celebration_left_peak` Structure / Occlusion 候选：严格基于已锁定 V2.1 外轮廓，加入正式牛头身份锚点、紫灰手/蹄、右臂横胸遮挡结构，以及左承重腿和右膝的最低限度结构明暗。
- 候选文件位于 `assets/cow-v2/candidates/celebration-dance/structure-occlusion-v1/`，未修改正式 `spritesheet.webp`、Action Registry、状态机、行情逻辑或 Electron 配置；仍未进入正式动作接入。

## 2026-08-29

- 经审计确认既有 `review` 已正式用于收盘后复盘动作池；未修改其业务调度、优先级、Registry 或 spritesheet。
- 增加开发验证入口 `window.__playReview()`，复用统一 `playState()` 和既有 `fallback: idle` 回退机制。

## 2026-08-29

- 正式复用既有 `thinking` 动作作为收盘后“复盘中”随机分析状态，并保留 `priority: 10`，不抢占交易行情、时间相位和其他更高优先级动作。
- 增加开发验证入口 `window.__playThinking()`：以一次性方式播放现有 `thinking`，完成后通过 Registry 的 `fallback: idle` 回到待机；不新增素材或动作帧。

## 2026-08-29

- 正式接入自动 idle blink：仅在交易相位且当前 action 为 `idle` 时，以一次性随机 timeout（4–10 秒）偶尔触发既有 `idle_blink`。
- blink 触发前会再次检查当前 action，避开 running、jumping、failed、sleep 及其他非 idle 状态；高优先级 action 可正常抢占 blink。
- 复用现有 `playState()`、Registry 和非循环 action fallback；blink 完成后恢复 `idle`，保留 `window.__playIdleBlink()` 手动开发入口。

## 2026-08-29

- 新增 `sleep` 睡觉动画素材：基于现有正式 `head_down` / 疲惫闭眼帧确定性编排为 8 帧，写入 spritesheet 新增 row 12。
- Action Registry 新增 `sleep`（8 帧、slow、loop），并与已有 `sleep` state 正式接通，不再回退到 `idle`。
- 增加开发验证入口 `window.__playSleep()`，仍统一通过现有 Registry / `playState()` 播放体系运行。

## 2026-08-27

- 完成牛动作系统 V2 播放契约第一阶段：统一 `getState()` 市场状态接口，建立带 segments、循环、速度、优先级、fallback 和低调模式元数据的动作注册表。
- 播放器改为按实际帧推进处理多段动作和 `loop:false` 完成回调；保留现有 11 个动作和正常模式的原有播放节奏。
- 整理 `cowStateMachine.js` 为正式市场状态到 action request 的映射模块，低调模式统一在动作解析层过滤。

## 2026-08-27

- 新增“低调模式”设置，默认关闭并复用 localStorage 持久化用户选择。
- 开启后保留股票名称与当前价格，隐藏涨跌幅和涨跌额，使用中性颜色与 idle 轻动作，不触发跳跃、失败姿态或涨跌粒子效果。
- 正常模式的行情数值、颜色、文案和动画逻辑保持不变。

## 2026-08-20

### 项目架构调整

- 完成源码管理迁移：Google Drive → GitHub
- GitHub 成为唯一源码仓库
- Google Drive 调整为文档、素材和备份用途

### 开发环境整理

- 明确 macOS 独立开发环境
  - `/Users/naiwy/Developer/Electron开发环境/项目目录/牛看盘`

- 明确 Windows 独立开发环境
  - `E:\Developer\Electron开发环境\项目目录\牛看盘`

- 双系统独立生成：
  - node_modules
  - dist
  - 打包产物

### Git工作流建立

- Mac / Windows 通过 GitHub 同步源码
- 禁止提交：
  - node_modules
  - dist
  - app
  - dmg
  - exe

### 文档更新

- 更新 memory.md
- 增加项目接续规则
- 明确 AI 协作规范
# 2026-08-29

- feat: add idle_blink as a one-shot low-profile action on spritesheet row 11
