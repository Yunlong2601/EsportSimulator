# TapTap Maker MCP Setup & 《电竞传奇: 巅峰王座》 Lua 工程实施方案

本方案根据您的指令，完成 **TapTap Maker MCP 安装配置** 与 **本地独立游戏项目脚手架初始化**。针对 TapTap 国内安卓玩家群体，采用纯 **Lua** 语言与 **UrhoX** 引擎架构，构建高沉浸度电竞俱乐部模拟经营游戏《电竞传奇: 巅峰王座》（Esports Dynasty: Peak Arena）。

---

## 一、 用户意图与目标设定 (User Intent & Objectives)

1. **执行 Maker MCP 与项目初始化流程**：
   - 执行 `npx -y @taptap/maker install --ide codex,cursor,claude` 配置智能开发助手 MCP 协议。
   - 在独立项目目录初始化标准 TapTap Maker 项目工程结构（含 `project.json`、`taptap.config.json`、`manifest.json` 与标准目录层级）。
2. **纯 Lua 架构设计 (Targeting TapTap / UrhoX)**：
   - 面向中国本土手游玩家偏好，全中文界面（含术语：战力、BP阶段、选手转会、赞助商、青训营、巅峰联赛等）。
   - 适配 UrhoX 移动端横屏 1920x1080 (16:9) 高清分辨率，采用 Chamfered Cyber HUD (赛博霓虹机能风) 视觉规范。
3. **国内 TapSDK 与合规套件集成 (Android Ready)**：
   - **TapTap 快捷登录**与**国家实名认证/防沉迷系统** (Anti-Addiction Compliance)。
   - **TapTap 内购充值与支付桥接** (IAP & Payment)。
   - **云存档** (Cloud Save) 与 **巅峰天梯榜** (Leaderboard)。
   - **异形屏切角安全区** (Display Cutout) 与 **120Hz/90Hz 高刷调度**。

---

## 二、 目录架构规划 (Project Structure)

在工程中建立独立的 TapTap Maker 标准工作区 `taptap_maker_project/`：

```text
taptap_maker_project/
├── .mcp/
│   └── taptap_maker_config.json      # MCP IDE 桥接配置文件 (Codex / Cursor / Claude)
├── project.json                      # TapTap Maker 项目元信息与引擎入口
├── taptap.config.json                # TapSDK AppID / ClientToken / 权限清单
├── AndroidManifest.xml               # Android 导出清单与硬件加速配置
├── assets/
│   ├── fonts/                        # 思源黑体/电竞英文字体定义
│   ├── textures/                     # 赛博切角面板、战队徽标、选手立绘图集
│   └── audio/                        # 赛博电音 BGM 与 UI 点击反馈音效
├── scripts/
│   ├── main.lua                      # 游戏入口，UrhoX 引擎生命周期与视口适配
│   ├── core/
│   │   ├── event_bus.lua             # 全局事件总线 (发布/订阅)
│   │   ├── audio_manager.lua         # 音频与触觉振动管理器
│   │   ├── timer.lua                 # 游戏刻与赛季时钟驱动
│   │   └── storage.lua               # 本地持久化与存档加密
│   ├── sdk/
│   │   ├── taptap_bridge.lua         # TapSDK Android 原生 JNI 调用桥接
│   │   ├── auth_anti_addiction.lua   # 实名认证、防沉迷检测与健康游戏时段控制
│   │   ├── iap_manager.lua           # 充值商品目录、订单回调与发货验证
│   │   └── cloud_leaderboard.lua     # 云端存档备份与全服战力排行
│   ├── game/
│   │   ├── career_progression.lua    # 生涯系统：从城市网吧赛到世界冠军
│   │   ├── club_manager.lua          # 俱乐部基地建设、战队收支、商业赞助
│   │   ├── roster_system.lua         # 选手属性(反应/意识/对线/团战)、心态、伤病
│   │   ├── match_sim.lua             # 赛事引擎：BP对位推演、实况文字团战播报
│   │   └── research_lab.lua          # 战术战法研发实验室与科技树进阶
│   └── ui/
│       ├── ui_base.lua               # UrhoX UI 基类 (响应式缩放与安全区对齐)
│       ├── hud_header.lua            # 顶部机能状态栏 (金币、钻石、粉丝数、赛季日程)
│       ├── view_club_hub.lua         # 俱乐部主控中心界面
│       ├── view_match_live.lua       # 比赛实况界面 (红蓝对决、实时战力条、战术指令)
│       ├── view_roster.lua           # 选手管理与转会市场界面
│       └── modal_tapsdk_login.lua    # 登录授权与防沉迷弹窗界面
└── README.md                         # 详细构建、本地调试与 TapTap 打包导出指南
```

---

## 三、 核心系统与 Lua 模块设计 (Key Lua Modules)

### 1. 引擎初始化与安全区适配 (`scripts/main.lua`)
- 初始化 UrhoX Engine 视口 `1920x1080`，锁定横屏模式。
- 查询 Android `getDisplayCutoutInsets` 动态留出两侧刘海与相机打孔安全边距（24~48px）。
- 启动 TapSDK 桥接，并在主循环 `Update(dt)` 中驱动核心模拟时钟。

### 2. TapSDK 国内合规桥接 (`scripts/sdk/auth_anti_addiction.lua`)
- 按照国家电竞与网络游戏防沉迷规范，封装：
  - `CheckRealNameStatus()`: 查询玩家实名认证阶段。
  - `EnforcePlayTimeLimit(ageGroup)`: 未成年人防沉迷监管（仅周五、周六、周日及节假日 20:00~21:00 可在线）。
  - `ShowAntiAddictionDialog()`: 触发 TapTap 标准防沉迷阻断提示与离线保存。

### 3. 电竞赛事与俱乐部经营内核 (`scripts/game/match_sim.lua` & `club_manager.lua`)
- 5个位置选手属性（上单、打野、中单、下路、辅助）。
- 战术克制树：速攻推塔流、四一分推流、大招团战流、视野控龙流。
- 模拟对局实时输出胜率博弈、精彩单杀点与经济折线。

### 4. 赛博霓虹机能 HUD 界面渲染 (`scripts/ui/`)
- 采用深空幽蓝 `#0B0F19` 背景、青色电光 `#00F3FF`、品红能量 `#FF0055` 与霓虹金 `#FFD700` 高亮。
- 倾角切角（Chamfered 45°）面板结构，适配高清移动屏幕渲染。

---

## 四、 执行路线图 (Execution Steps)

1. **第一阶段：MCP 插件与环境配置**
   - 验证并持久化 `@taptap/maker` 的 MCP 配置，生成针对 Codex/Cursor/Claude 的服务定义。
2. **第二阶段：TapTap Maker 项目结构初始化**
   - 创建 `taptap_maker_project` 目录与标准元信息配置文件 (`project.json`, `taptap.config.json`, `AndroidManifest.xml`)。
3. **第三阶段：编写核心纯 Lua 系统与模拟逻辑**
   - 实现 `main.lua`、`event_bus.lua`、`roster_system.lua`、`match_sim.lua`、`club_manager.lua`、`research_lab.lua`。
4. **第四阶段：编写 TapSDK 桥接与合规模块**
   - 实现 `taptap_bridge.lua`、`auth_anti_addiction.lua`、`iap_manager.lua`、`cloud_leaderboard.lua`。
5. **第五阶段：编写 UrhoX 1920x1080 赛博 HUD 界面模块**
   - 实现 `ui_base.lua`、`hud_header.lua`、`view_club_hub.lua`、`view_match_live.lua`。
6. **第六阶段：本地运行说明与验证**
   - 提供在 TapTap Maker 客户端中打开导入、模拟调试、以及一键打包导出 APK 的说明文档。

---

## 五、 验证与自测方案 (Verification Plan)

- [ ] **项目工程有效性验证**：验证 `project.json` 与 `taptap.config.json` 语法无误，符合 TapTap Maker 规范。
- [ ] **Lua 语法与依赖检查**：检查所有 `require` 模块无循环死锁，变量与函数签名闭环。
- [ ] **防沉迷逻辑测试**：模拟成年人与未成年人账户登录，校验时段阻断与充值上限逻辑。
- [ ] **UI 布局计算测试**：验证 1920x1080 分辨率在各比例拉伸与切角坐标计算准确性。
