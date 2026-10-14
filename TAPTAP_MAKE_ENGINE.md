# 🎮 TapTap Make Lua Game Engine Architecture Guide
## 《电竞传奇：登顶世界赛》TapTap Make 移动竖屏原生引擎工程指南

本项目已完全初始化并深度重构为标准的 **TapTap Make 独立 Lua 游戏引擎工程**。你可以将此目录作为核心参考并直接导出至 TapTap Make / Love2D 移动端引擎环境中运行。

---

## 📁 工程核心目录与文件清单

```text
.
├── main.lua                 # [核心入口] TapTap Make / Love2D 生命周期钩子与 CLI 交互控制台
├── conf.lua                 # [引擎配置] 390x844 移动端竖屏分辨率、高 DPI 与模块加载配置
├── taptap_project.json      # [工程清单] TapTap Make 平台专属元数据与规范配置
├── esports_legacy.lua       # [单文件版] 独立纯控制台精简版脚本
├── scripts/
│   └── test_taptap_engine.cjs # [自动化测试] 基于 Fengari Lua 虚拟机的全流程端到端自动化验证
├── lua/                     # [40 个专业 Lua 模块全矩阵]
│   ├── taptap_make_main.lua     # ★ TapTap Make 核心游戏状态机与动作调度中枢 (TapTapGame)
│   │
│   ├── [阶段 1: 天梯单排]
│   │   ├── match_sim.lua            # 天梯对局引擎、分段晋级赛 (BO3/BO5) 与龙坑抢龙团战
│   │   ├── login_streak.lua         # 7天连续签到成长阶梯与外设皮肤加成
│   │   ├── gear.lua & hardware_rig  # 职业外设装备与 RGB 超频工坊
│   │   ├── career_health.lua        # 职业健康与康复理疗中心 (手腕冰敷/肌贴/超声/队医)
│   │   ├── streaming_milestones.lua # 直播里程碑等级与粉丝专属表情包
│   │   └── rivalry_system.lua       # 天梯宿敌狙击与绝境对决
│   │
│   ├── [阶段 2: 职业舞台]
│   │   ├── draft.lua                # 5v5 职业 BP 选拔、英雄克制与战术羁绊评估
│   │   ├── champions.lua            # 英雄池数据库、版本梯度评级与绝活熟练度
│   │   └── post_match_mvp.lua       # 赛后 MVP 定级卡、FMVP 徽章与选手自信心模型
│   │
│   ├── [阶段 3: 王朝掌控]
│   │   ├── dynasty.lua              # 俱乐部经营、基地设施扩建与企业级赞助合约
│   │   ├── transfer_window.lua      # 休赛期自由人竞标、跨俱乐部转会谈判
│   │   ├── global_power_rankings.lua# 全球战队 TOP 20 战力天梯榜、战术刺探与跨国训练赛
│   │   ├── community_relations.lua  # 粉丝运营企划、官博整活与赛事直播实时弹幕总线
│   │   ├── merch_sales.lua          # 战袍前沿研发实验室 (面料/印花/剪裁/NFC) 科技树
│   │   ├── merch_sales_manager.lua  # 战队官方周边与定制战袍周度流水结算
│   │   └── jersey_customizer.lua    # 定制战袍工坊 (队徽图腾、色系与明星签名)
│   │
│   └── [无限轮回与终局]
│       ├── prestige_system.lua      # 名宿殿堂转生、永久传承被动与多周目难度增益
│       └── world_tour.lua           # 无尽世界巡回赛爬塔挑战
└── src/                     # React + TypeScript 完整前端 UI 模拟器
```

---

## ⚡ 快速启动与测试

### 1. 运行内置自动化验证套件 (无需安装本地 Lua)
本项目内置了基于 `fengari-web` 的全流程测试套件，执行以下命令即可一键运行：
```bash
npm run test:lua
```
测试套件将自动验证：
* 阶段 1：天梯排位、录像钻研、直播赚金、精力恢复、健康理疗
* 阶段 2：职业联赛舞台、战术刺探、训练赛对抗
* 阶段 3：注资收购俱乐部、战袍研发科技树升级、公关活动与实时弹幕
* 终局系统：世界巡礼爬塔与名宿殿堂
* 核心底层：本地存档持久化序列化 (`saveGame` / `loadGame`) 与 ViewState UI 导出校验

---

### 2. 在 Love2D / TapTap Make 中直接启动
如果你安装了 [LÖVE (Love2D)](https://love2d.org/):
```bash
love .
```
引擎将直接启动 **390 x 844 移动竖屏视口**：
* 顶栏 HUD 显示段位、LP、流动资金、精力体能与心态专注度。
* 中部交互按钮支持鼠标点击与移动端触控，可直接执行排位、钻研、直播、世界赛。
* 键盘快捷键映射：
  * `1`: 单排天梯排位
  * `2`: 钻研复盘录像
  * `3`: 开启高分段直播
  * `4`: 战队休整睡眠
  * `5`: 战备特调冰美式
  * `6`: 阶段特色进阶 (打比赛 / 收购俱乐部 / 战袍研发)
  * `s`: 保存游戏存档 (`saveGame`)
* 底部终端实时滚动输出中文赛况战报。

---

### 3. 在纯 Lua 5.1+ / LuaJIT 控制台中运行
```bash
lua main.lua
```

---

## 🛠️ TapTap Make 统一动作调度 API (`onAction`)

在 TapTap Make 中，你可以通过统一事件派发方法与游戏引擎交互：

```lua
local TapTapGame = require("taptap_make_main")
local game = TapTapGame.new()

-- 1. 派发动作
local result = game:onAction("SOLO_QUEUE")
print(result.success, result.message)

-- 2. 派发带参数动作
game:onAction("UPGRADE_MERCH_TECH", { tech_id = "fabric_tech" })
game:onAction("SCOUT_TEAM", { team_id = "t1" })
game:onAction("SEND_DANMAKU", { text = "加油世界第一中单！", sender = "Fan_9527" })

-- 3. 获取全量 UI 视图快照
local state = game:getViewState()

-- 4. 本地持久化保存与读取
local save = game:saveGame()
game:loadGame(save)
```

---

## 📦 从网页端一键打包导出
在运行 `npm run dev` 启动的 Web 模拟器中：
1. 访问 `http://localhost:3000`。
2. 点击顶部状态栏的 **「TapTap Maker Lua 开发者代码工坊」**。
3. 点击 **「完整项目打包下载 (.ZIP)」**，即可下载包含全部 40 个 Lua 模块、`conf.lua`、`main.lua` 与 `taptap_project.json` 的压缩包。
