# CHANGELOG

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
