---
name: setup-achievements
description: "为 UrhoX/Maker 游戏设计、配置、接入和排查 Tap 成就。Use whenever users mention 成就、奖杯、achievement、trophy、进度成就、白金成就、成就 Toast、成就页面，要求创建/修改/发布/测试成就，或需要调用 sdk:UnlockAchievement、sdk:IncrementAchievement、sdk:RegisterAchievementListener。"
---

# UrhoX 成就接入

使用官方 Maker MCP 管理成就定义，使用 UrhoX `sdk` API 上报玩家进度。不要在游戏
Lua 中调用管理接口，也不要自己接入原生成就 SDK。

UrhoX 运行时成就 API 的目标平台是 **TapTap Android、iOS 和 PC（Windows/macOS）**。
当前只提供客户端 `sdk` API，不提供 UrhoXServer 成就 API。WebAssembly 和 Intl 不在当前目标范围。

成就依赖当前 TapTap 登录用户。单机和联网游戏都可以使用，但未登录时无法把成就归属
到玩家账号。

## 接入原则

- 只使用 Maker MCP 的单一 `achievement` 工具，通过 `op` 选择操作。
- 普通成就在 MCP、`.project/achievements.lock.json` 和 Lua 中统一使用
  `achievementId`；MCP 参数名为 `achievement_id`。
- 不创建额外 `key`，不把 `managementId` 写进 Lua。
- 不生成成就 ID 映射 Lua 文件，不手工修改 `.project/achievements.lock.json`。
- 不要求用户提供 `appId`、`developerId`、`clientId`、Token、Secret 或请求签名。
- 创建和更新会自动进入提审状态，但不会自动发布。删除、发布和重置测试数据只在用户
  明确要求时执行；只有白金成就支持撤销审核。
- 白金成就是应用级单例，不创建或猜测白金 `achievementId`，Lua 不主动解锁白金。
- 当前 Lua 绑定只保存一个 listener。集中注册一次；再次注册会替换已有 listener。
- 成就 Lua API 只注册到游戏 Lua state；HostSandbox 和 AppBox 不提供成就方法。游戏脚本停止、重载或 Runtime 清理时，UrhoX 会自动注销 listener。
- 联网游戏若由服务端判定成就条件，使用现有游戏业务消息通知目标客户端，再由客户端调用成就 `sdk` API。
- `reset_achievement(achievement_id)` 清除全部测试用户下指定普通成就的测试数据。
- `reset_achievement_test_user(user_id)` 清除指定测试用户的全部成就测试数据。
- 两种重置都只用于明确的真机重测流程，不修改成就定义或正式玩家数据，也不刷新 lock。

## 工作流程

### 1. 首次接入与开通检查

1. 检查 `.project/achievements.lock.json`：
   - **文件不存在：** 先调用 `achievement(op="sync_achievements")`。
   - **文件存在：** 可以读取现有 `achievementId`，但开始增删改前仍同步一次远端状态。
2. 处理首次同步结果：
   - MCP/Agent **明确返回成就产品未开通**：停止后续配置，提示开发者去 TapTap 开发者
     中心为当前应用开通成就。
   - 同步成功且成就列表为空：表示已开通但尚未配置，继续下一阶段。
   - 鉴权、项目绑定、网络或 lock 写入失败：报告原错误，不能误报为未开通。

```json
{
  "op": "sync_achievements"
}
```

同步成功后 MCP 会创建或刷新：

```text
.project/achievements.lock.json
```

lock 只由 MCP 管理。不要手工修改，不要从它生成固定路径的 Lua 映射文件。lock 不存在
本身不代表未开通，普通成就列表为空也不代表未开通。

如果远端写入已经成功，但返回 `lock_sync.synced == false`，只调用
`sync_achievements` 修复本地同步；不要重复创建、更新、删除或发布。

### 2. 配置成就数据与测试用户

所有操作都调用 `achievement` 工具并通过 `op` 选择接口。身份参数由项目配置和运行环境提供，
不需要传入。

#### 同步

| `op` | 必填参数 | 可选参数 | 说明 |
|---|---|---|---|
| `sync_achievements` | 无 | 无 | 同步普通成就、白金成就和测试所需的本地成就映射 |

#### 普通成就

| `op` | 必填参数 | 可选参数 | 说明 |
|---|---|---|---|
| `get_achievement` | `achievement_id` | 无 | 查询指定普通成就 |
| `create_achievement` | `achievement_id`、`total_steps` | `title`、`sub_title`、`image_url`、`is_hidden`、`blocks_platinum` | 创建普通成就 |
| `update_achievement` | `achievement_id` | `title`、`sub_title`、`image_url`、`is_hidden`、`blocks_platinum`、`total_steps` | 至少传一个实际发生变化的可选字段；不能修改 ID |
| `delete_achievement` | `achievement_id` | 无 | 删除指定普通成就 |
| `set_achievement_order` | `achievement_id`、`list_order` | 无 | 设置普通成就展示顺序 |
| `check_publish_achievements` | 无 | 无 | 检查普通成就是否满足发布条件 |
| `publish_achievements` | 无 | 无 | 发布普通成就 |

参数规则：

- `achievement_id`：Lua 使用的稳定 ID，1–40 个字符，只允许英文、数字、`-`、`_`；创建后不可修改。
- `title`：成就名称，最长 40 个字符。
- `sub_title`：成就简介，最长 200 个字符。
- `image_url`：HTTP(S) 图标地址，不能使用本地路径或 Base64。
- `total_steps`：正整数；单次解锁成就设为 `1`，累计进度成就设为目标总步数。
- `is_hidden`：是否是隐藏成就。
- `blocks_platinum`：是否将该普通成就计入白金解锁条件。
- `list_order`：正整数展示顺序。

#### 白金成就

白金成就是应用级单例，不使用 `achievement_id`。一个应用最多创建一个白金成就，创建前
至少需要 10 个已审核通过或已发布的普通成就。

白金成就会有更高的审核标准，配置前参考 [白金成就审核标准](https://developer.taptap.cn/docs/sdk/achievement/features/#%E7%99%BD%E9%87%91%E6%88%90%E5%B0%B1%E5%AE%A1%E6%A0%B8%E6%A0%87%E5%87%86)。

| `op` | 必填参数 | 可选参数 | 说明 |
|---|---|---|---|
| `get_platinum_achievement` | 无 | 无 | 查询当前应用的白金成就 |
| `create_platinum_achievement` | 无 | `title`、`sub_title`、`image_url` | 创建白金成就 |
| `update_platinum_achievement` | 无 | `title`、`sub_title`、`image_url` | 至少传一个实际发生变化的字段 |
| `delete_platinum_achievement` | 无 | 无 | 删除当前应用的白金成就 |
| `check_publish_platinum_achievement` | 无 | 无 | 检查白金成就是否满足发布条件 |
| `publish_platinum_achievement` | 无 | 无 | 发布白金成就 |
| `cancel_platinum_achievement_audit` | 无 | 无 | 撤销白金成就审核 |

白金成就的 `title`、`sub_title` 和 `image_url` 与普通成就规则相同。白金成就固定为非隐藏，
进度固定由服务端计算；不要传 `achievement_id`、`total_steps`、`is_hidden` 或
`blocks_platinum`。

#### 测试用户

| `op` | 必填参数 | 可选参数 | 说明 |
|---|---|---|---|
| `add_achievement_test_users` | `user_ids` | 无 | 添加成就测试用户；一次支持 1–100 个用户 ID，自动跳过已存在用户并返回无效 ID |
| `reset_achievement` | `achievement_id` | 无 | 重置指定普通成就在全部测试用户下的测试数据 |
| `reset_achievement_test_user` | `user_id` | 无 | 重置指定测试用户的全部成就测试数据 |

`user_ids` 使用 TapTap 用户 ID 数组，`user_id` 使用单个 TapTap 用户 ID。为避免 JavaScript
整数精度丢失，用户 ID 使用十进制字符串。添加测试用户和两种重置操作都不修改成就定义，
也不刷新 lock。

创建和更新普通成就或白金成就会自动进入提审状态，但不会自动发布。普通成就没有撤销审核
接口；白金成就只能通过 `cancel_platinum_achievement_audit` 撤销审核。接口返回审核中状态
时停止配置流程，不要循环更新或尝试发布；发布和测试数据重置分别按第 5 节和第 4 节执行。

### 3. 在游戏 Lua 中接入成就 SDK

#### 客户端接口

以下成就 Lua API 仅支持客户端游戏 Lua，UrhoXServer 不提供成就 Lua API。客户端游戏
Lua 通过 `sdk` 调用以下六个接口：

| API | 参数 | 说明 |
|---|---|---|
| `sdk:SetAchievementToastEnabled(enabled)` | `enabled: boolean` | 开关原生成就解锁 Toast，不影响成就上报 |
| `sdk:ShowAchievements()` | 无 | 打开原生成就列表页面 |
| `sdk:UnlockAchievement(achievementId)` | `achievementId: string` | 解锁一个 `total_steps == 1` 的普通成就 |
| `sdk:IncrementAchievement(achievementId, steps)` | `achievementId: string`、`steps: integer` | 增加普通进度成就的步数，`steps` 范围为 `1..INT_MAX` |
| `sdk:RegisterAchievementListener(listener)` | `listener: table` | 注册单个异步 listener；再次注册会替换已有 listener |
| `sdk:UnregisterAchievementListener()` | 无 | 注销当前 listener |

`UnlockAchievement` 和 `IncrementAchievement` 没有同步成功返回值，最终结果通过 listener
通知。listener 支持以下两个回调：

```text
onSuccess(result)
onFailure(code, error)
```

#### 服务端判定的成就

UrhoXServer 不直接调用成就 API。成就条件由服务端判定时，服务端先在权威业务逻辑中完成
判定和去重，再通过现有游戏业务消息把 `achievementId`、操作类型以及进度成就的 `steps`
发送给目标客户端。客户端收到消息后调用 `sdk:UnlockAchievement` 或
`sdk:IncrementAchievement`，最终结果仍由客户端 listener 接收。

#### Lua 示例

```lua
local achievementListener = {
    onSuccess = function(result)
        if result.operation == "unlock" then
            print("[Achievement] unlocked: " .. tostring(result.achievementId))
        elseif result.operation == "increment" then
            print(
                "[Achievement] progress: "
                    .. tostring(result.achievementId)
                    .. " step="
                    .. tostring(result.currentStep)
            )
        end
    end,

    onFailure = function(code, error)
        print(
            "[Achievement] failed: id="
                .. tostring(error.achievementId)
                .. " code="
                .. tostring(code)
                .. " message="
                .. tostring(error.message)
        )
    end,
}

local achievementListenerRegistered = false

local function InitAchievements()
    if achievementListenerRegistered then
        return
    end

    sdk:SetAchievementToastEnabled(true)
    sdk:RegisterAchievementListener(achievementListener)
    achievementListenerRegistered = true
end

local function ShutdownAchievements()
    if not achievementListenerRegistered then
        return
    end

    sdk:UnregisterAchievementListener()
    achievementListenerRegistered = false
end
```

在现有生命周期中调用：

```lua
function Start()
    -- 保留项目原有初始化。
    InitAchievements()
end

function Stop()
    ShutdownAchievements()
    -- 保留项目原有清理。
end
```

不要为每次解锁临时注册和注销 listener。listener 用于接收整个游戏模块生命周期内的
异步结果；退出模块或脚本停止时可以调用无参数的 `UnregisterAchievementListener()`，即使未主动调用，UrhoX 也会在游戏脚本清理时自动注销。

单次成就：

```lua
local function HandleFirstWin()
    sdk:UnlockAchievement("first_win")
end
```

进度成就：

```lua
local function HandleCoinsCollected(collectedCount)
    if collectedCount <= 0 then
        return
    end

    sdk:IncrementAchievement("collect_100_coins", collectedCount)
end
```

运行时规则：

- `UnlockAchievement` 和 `IncrementAchievement` 没有同步成功返回值；最终结果只看 listener。
- `IncrementAchievement` 只传正整数增量。不要在 `Update`、渲染回调或轮询中上报。
- 确保同一个游戏事件只触发一次。不要在响应不确定时自动重复 Increment，否则可能重复
  增加进度。
- 不要在成功 listener 中再次调用同一成就，避免回调循环。
- `result.currentStep` 在 `unlock` 成功时固定为 `0`，在 `increment` 成功时表示当前累计进度。
  它只用于提示或调试，不要作为本地存档的唯一真相源。

成功回调字段：

| 字段 | 含义 |
|---|---|
| `result.operation` | `"unlock"` 解锁；`"increment"` 增加进度 |
| `result.achievementId` | 普通成就 ID；白金成就透传宿主值，宿主未提供时为空字符串 |
| `result.achievementName` | 成就展示名称 |
| `result.achievementType` | `"normal"` 普通成就；`"platinum"` 白金成就 |
| `result.currentStep` | `unlock` 成功时固定为 `0`；`increment` 成功时为当前累计进度 |

失败回调签名：

```text
onFailure(code, error)
```

| 字段 | 含义 |
|---|---|
| `code` | 宿主成就域错误码 |
| `error.achievementId` | 失败请求对应的普通成就 ID；宿主未提供时为空字符串 |
| `error.message` | 错误描述 |

白金成就由服务端根据普通成就自动计算。宿主通知白金解锁成功时，无论是否携带
`achievementId`，都以 `achievementType = "platinum"` 进入 `onSuccess`。不要在 UI 或 Lua 中
硬编码白金 ID，也不要调用 Unlock/Increment 主动上报白金。

### 4. TapTap 真机测试与数据重置

使用已添加的测试账号从 TapTap 启动游戏。按需要重测的范围选择接口。

**全部测试用户 × 一个普通成就：**

```json
{
  "op": "reset_achievement",
  "achievement_id": "first_win"
}
```

`reset_achievement` 会清除指定普通成就在当前应用全部测试用户下的测试数据，不只清除
当前账号。

**一个测试用户 × 全部成就：**

```json
{
  "op": "reset_achievement_test_user",
  "user_id": "123456789"
}
```

`reset_achievement_test_user` 会清除指定测试用户在当前应用下的全部成就测试数据，不影响
其他测试用户。

两个接口都是破坏性测试操作，只在开发者明确要求对应范围的重测时调用。

`reset_achievement` 当前只允许重置 `audited` 且尚未发布的普通成就；以下情况不能使用该
接口：

- `auditing`、`rejected` 或其他未审核通过状态；
- 已发布普通成就；
- 白金成就；
- 正式玩家数据。

两种重置都不修改成就定义，也不刷新 lock。当前接入流程不需要测试用户列表接口。

### 5. 发布成就

创建和更新普通成就或白金成就时会自动进入提审状态。

1. 调用 `check_publish_achievements`，向开发者说明本次将发布的普通成就范围。
2. 仅在开发者明确确认后调用 `publish_achievements`。
3. 再次同步，确认状态变为 `published`。

如果审核被拒绝，先报告 `rejectReason`，修改定义会重新进入审核，不得直接发布。

普通成就没有撤销审核接口。白金成就如需在审核期间撤回，调用
`cancel_platinum_achievement_audit`；该接口不适用于普通成就，也不是提审接口。

白金发布流程：

1. 确认至少 10 个普通成就符合白金范围条件。
2. 创建或更新白金成就后自动进入提审；如需撤回，调用
   `cancel_platinum_achievement_audit`。
3. 等待白金状态变为 `audited`。
4. 调用 `check_publish_platinum_achievement`，确认解锁范围内没有未发布普通成就。
5. 仅在开发者明确确认后调用 `publish_platinum_achievement`。
