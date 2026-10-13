---
name: custom-lobby
description: "UrhoX 自定义大厅开发指南。Use when 用户创建或修改启用多人模式的游戏入口、登录后首页、大厅中的本地游玩、主菜单中的匹配或房间功能、联机大厅、房间大厅、房间列表、浏览房间、新建/创建房间、加入/进入房间、快速/自动匹配、匹配等待、等待进入游戏、连接服务器、连服进度，或配置 multiplayer.enabled / multiplayer.lobby_runtime；也适用于 game lobby、multiplayer lobby、online game entry、pre-game screen、room browser、create room、join room、quick match、matchmaking 等说法。覆盖模板换皮与完全自建两条路径。联机平台通知换皮用 online-system-notification。"
---

# UrhoX 自定义大厅

## 开始前

先阅读 `engine-docs/recipes/custom-lobby.md`，按任务选择模板换皮或完全自建。该文档是自定义大厅的权威 API 与示例参考。

## 运行模式前置判断

先读取项目源配置 `.project/settings.json` 中的 `@runtime.multiplayer.enabled`。构建后，`@runtime` 内容会提升到运行时资源 `settings.json` 的顶层；引擎运行时读取的是后者。

- `true`：项目进入联机运行路径，才会启动默认联机入口或 `multiplayer.lobby_runtime`。
- `false` 或缺失：项目是纯单机模式，直接进入普通单机脚本，**不会进入 `lobby_runtime`**，也不应调用联机接口。

`lobby_runtime` 是启用联机项目的自定义大厅 Runtime，不是所有项目的通用启动脚本。

## 选择实现路径

### 模板换皮（默认联机入口的 UI 换皮）

适用于 `multiplayer.enabled: true` 且保留引擎默认的 5 个联机界面，只修改外观与界面响应。联机被踢/断线等平台通知换皮见 `online-system-notification`。

- 直接创建固定文件 `scripts/lobby_ui.lua`；无需也不能在 `settings.json` 中配置其他模板脚本路径。
- 使用 `Lobby.DefineScreen` / `Lobby.DefineDialog` 注册覆盖内容。
- 使用沙箱注入的 `LobbyUI`、`LobbyState`、`Timer` 和 `urhox-libs/UI` 控件。
- 大厅动作使用 `Lobby.*`，例如 `Lobby.QuickMatch()`、`Lobby.JoinRoom()`。
- 查询当前用户使用 `Lobby.GetMyUserId()`，不要使用旧版 `lobby:GetMyUserId()`。
- 沙箱中不要使用 `require`、网络 API、`lobby`、`lobbyBridge` 或其他裸平台对象。

参考：

- `urhox-libs/GameLobby/Runtime/Template/DefaultLobbyUI.lua`
- `urhox-libs/GameLobby/Runtime/Example/Example_lobby_ui.lua`

### 完全自建

适用于启用联机后，需要自定义大厅的界面结构、屏幕数量、导航或完整流程；大厅中也可以提供本地游玩、换装或其他单人功能。

- 配置 `multiplayer.lobby_runtime`。
- 入口脚本返回 `function(ctx)`，使用 `ctx.root` 挂载 UI，使用 `ctx.client` 调用联机能力。
- 使用 `urhox-libs/UI` 构建界面；需要时在完整 Runtime 中使用 `require`。
- 平台动作、查询、事件订阅和错误处理都通过 `ctx.client` 完成。
- 查询当前用户使用 `ctx.client:GetMyUserId()`，不要使用裸 `lobby:GetMyUserId()`。
- 不要直接访问裸 `lobby` 或 `lobbyBridge`。
- 在 `stop` 中注销自己订阅的事件和定时器；`ctx.root` 由引擎统一回收。

#### 联机入口中的本地游玩

`lobby_runtime.lua` 运行在完整 Runtime 中，可以直接实现本地游戏逻辑，也可以按项目需要拆到 `scripts/local_game.lua`（或其他模块）。

引擎不规定项目本地玩法模块的通用接口；但 `Example_Custom_LobbyRuntime.lua` 为了管理退出清理，明确要求它使用的 `scripts/local_game.lua` 返回 `{ stop = function() ... end }`。无论采用哪种文件结构，本地游玩都可以创建自己的 Scene、Viewport、输入、HUD 和 `Update` 逻辑，并负责在 `stop` 中释放这些资源。按本示例的产品设计，“本地游玩”直接运行本地逻辑，不调用 `CreateRoom` + `StartGame`；这不是引擎限制。项目仍可设计只有一名玩家的联机房间，但它属于“单人联机玩法”，不应和本示例的“本地游玩”混为一谈。

参考：

- `urhox-libs/GameLobby/Runtime/Example/Example_Custom_LobbyRuntime.lua`
- `urhox-libs/GameLobby/Runtime/Template/LobbyRuntimeUI.lua`
- `urhox-libs/GameLobby/Runtime/lobby_client.d.lua`

## 联机平台通知

被踢 / 顶号 / 断线重连 / 封禁等换皮，用 `online-system-notification` skill。本 skill 不管这些注册。

## 通用约束

- 两条路径都使用 `urhox-libs/UI`，不要使用已废弃的原生 UI 系统。
- 网络、房间、匹配和连服流程由引擎托管；不要在制作人脚本中重写底层大厅协议。
- 不要把项目特定玩法写进引擎的 `GameLobby` 模板；项目自己的 `lobby_runtime.lua` 可以直接实现玩法，也可以自行拆分模块。
- 本示例中的“本地游玩”不使用 `CreateRoom` + `StartGame`；项目可以另行设计单人联机玩法。纯单机项目不进入 `lobby_runtime`。
- 背景图片只做装饰，按钮、文字、进度条和房间数据等 UI 必须用 Lua 控件实现。
- 资源路径按项目 `assets/` 为资源根目录填写，例如 `UI/bg.png`，不要写 `assets/UI/bg.png`。
