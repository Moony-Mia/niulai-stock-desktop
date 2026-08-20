# CHANGELOG

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
