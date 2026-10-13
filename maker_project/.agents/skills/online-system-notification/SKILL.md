---
name: online-system-notification
description: "UrhoX 联机平台通知换皮（被踢/顶号/断线重连/封禁/版本过低）。Use when 联机项目要改 SystemNotification、RegisterHandler、OnSystemDialog、大厅 DefineDialog 的平台提示外观。仅 multiplayer.enabled 的大厅与进游戏后的连接/踢人提示。不要用于单机游戏自己的 UI 弹窗、道具窗、确认框。"
---

# 联机系统通知换皮

仅用于 **已开联机**（`@runtime.multiplayer.enabled == true`）时，平台下发的连接 / 踢人 / 封禁提示。

单机项目没有这套通知。单机里的商店窗、暂停菜单、剧情对白、自己 `UI.Toast` **不要用本 skill**。

大厅结构、联机入口、房间/匹配见 `custom-lobby` skill 与 `engine-docs/recipes/custom-lobby.md`。这里只讲注册外观。

引擎按 `id` 派发。制作人注册**一个** handler，按 `info.id` 画 Toast 或窗。返回 `true` 表示已显示；`false` / `nil` / 抛错视为未接管，Host 走默认 UI 或旧 `OnSystemDialog`。

## 注册点（两个 Runtime 各注册一次）

切脚本会拆掉当前 Runtime 的 handler。大厅换皮盖不住进游戏之后；进游戏后的 handler 盖不住回大厅之后。要两边都自定义，**两处都注册**。

| 阶段 | 写在哪 | 怎么注册 |
|---|---|---|
| 大厅 · 模板换皮 | 固定文件 `scripts/lobby_ui.lua` | `Lobby.DefineDialog("error"\|"kicked"\|"dialog"\|"system", ...)`。模板已接好 `RegisterHandler`，只换皮肤。细节见 `custom-lobby` 与 `Example_lobby_ui.lua` |
| 大厅 · 完全自建 | `multiplayer.lobby_runtime` 入口 | `SystemNotification.RegisterHandler`。示例：`Example_Custom_LobbyRuntime.lua` |
| 联机对局中 | 游戏脚本 `Start()`（常见 `scripts/Network/Client.lua`） | 同样 `RegisterHandler`。在 `Stop()` 里 `UnregisterHandler()` |

新项目不要用 `client:OnSystemDialog`。那是未注册新 handler 时的旧兼容口。

## API

```lua
local SN = require("urhox-libs.System.SystemNotification")

SN.RegisterHandler(function(info)
    local view = SN.Resolve(info)
    -- view.id / kind / title / message / reason / exitOnClose
    -- kind: error=短暂提示, kicked=被踢窗, dialog=普通模态
    -- 只给 Kicked 会带 reason；不要改字典 message，由 UI 自己拼（如「原因：」.. reason）
    return true
end)

-- 离开本 Runtime 时
SN.UnregisterHandler()
```

`Resolve` 从 `SN.Default[id]` 还原默认 `kind/title/message`。只改外观时用默认文案；换文案就按 `id` 自己写，不必改引擎字典。不要往这套 API 里加单机自定义事件。

### id（平台固定，不是游戏玩法事件）

| id | 默认 kind | 含义 |
|---|---|---|
| `DisconnectChecking` | error | 掉线，正在检查能否重连 |
| `Reconnecting` | error | 正在重连 |
| `ConnectFailedRetry` | error | 连接失败，将重试 |
| `ConnectInitiateFailed` | error | 无法发起连接 |
| `MiddleGameJoinFailed` | error | 中途加入失败 |
| `DuplicateLogin` | kicked | 顶号 |
| `ResourceExceeded` | kicked | 服务器资源不足，本局结束 |
| `GameOpsKick` | kicked | 管理员移出 |
| `Kicked` | kicked | 其它踢出；可能带 `reason` |
| `VersionTooLow` | dialog | 运行环境过低，默认关窗退出 |
| `PlayerBanned` | dialog | 被该游戏封禁（加入/开局失败，不是踢） |

`SN.Id.Kicked` 等与字符串相同。

## 大厅

**模板换皮**：只动 `DefineDialog`。`error` 改 Toast，`kicked`/`dialog` 改模态；只想统一卡片样式用 `"system"`（不覆盖 `error`）。未定义的 kind 用引擎默认。

**完全自建**：在 `return function(ctx)` 里注册 handler，用 `ctx.root` 画。`stop` 里 `UnregisterHandler()`。大厅怎么建见 `custom-lobby`。

局内被踢/封时，Host 会先回大厅再弹。这些终态窗落在**大厅** handler 上。

## 联机对局中

在联机客户端 `Start()` 里注册，只处理这个 Runtime 还活着时会收到的通知，通常是连接类（`DisconnectChecking` / `Reconnecting` / `ConnectFailedRetry` 等）。不认识的 `id` 返回 `false`，让 Host 兜底。

```lua
local SN = require("urhox-libs.System.SystemNotification")

function Start()
    SN.RegisterHandler(function(info)
        local view = SN.Resolve(info)
        if view.kind ~= "error" then
            return false
        end
        -- 画局内 Toast / banner
        return true
    end)
end

function Stop()
    SN.UnregisterHandler()
end
```

## 约束

- 只服务联机平台这 11 个 id。单机玩法提示自己画，不要 `Dispatch` 假装平台通知。
- 全局只有一个 handler 槽。后注册的覆盖先注册的；切脚本会清掉旧 Runtime 的槽。
- 返回 `true` 就必须自己让玩家关得掉（按钮或限时 Toast）。
- `exitOnClose` 为真（如 `VersionTooLow`）或中途局没有大厅可回时，关窗应 `engine:Exit()`。
- 不要改引擎 `GameLobby` 模板来做项目皮肤。
- 什么都不注册也有默认提示。
