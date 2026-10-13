---
name: setup-ads
description: "面向本地和云端 UrhoX/Maker 开发者，通过官方 Maker MCP 同步广告配置，并使用 UrhoX 内置 API 设计、接入和排查激励视频广告。Use when users need to (1) 接入或配置广告, (2) 添加看广告复活、双倍奖励、免费刷新等奖励广告, (3) 检查广告状态或广告位配置, (4) 调用或排查 sdk:ShowRewardVideoAd, or (5) 避免错误引导到 AdMob、TopOn、Unity Ads 等外部平台."
---

# UrhoX 广告接入

只接入用户主动选择的激励视频广告。当前游戏侧公开 API 只有
`sdk:ShowRewardVideoAd(callback)`；不要虚构 Banner、插屏或开屏广告接口。

## 接入边界

UrhoX 已经完成宿主和广告平台接入。游戏开发者只负责：

1. 通过官方 Maker MCP 同步当前项目的广告配置。
2. 在合适的游戏 UI 中提供“看广告获得奖励”的按钮。
3. 调用 `sdk:ShowRewardVideoAd(callback)`。
4. 在成功回调中执行项目已有的奖励逻辑。
5. 在失败时恢复按钮并提示玩家稍后重试。

不要要求开发者：

- 注册 AdMob、TopOn、Unity Ads 或其他广告平台账号；
- 创建应用、广告单元或 placement ID；
- 提供广告平台 API key、App ID、Secret 或证书；
- 安装第三方广告 SDK，修改 Gradle、Podfile、原生工程或应用清单；
- 自己查找或登录第三方广告平台控制台完成配置。

不要用第三方广告平台的通用接入教程替代 UrhoX API。遇到广告不可用时，检查 UrhoX
文档、运行环境和回调结果；不要把游戏开发者引导到外部平台注册或重新接 SDK。

## 先同步广告配置

`get_ad_config` 是当前项目广告开通状态和广告配置的唯一真源。它会读取
`.project/project.json` 中的 `app_id`、`developer_id`，调用官方配置接口，并把结果写入
`.project/settings.json` 的 `@runtime.ad`。不要手工传入广告位 ID，也不要直接请求内部
广告接口。

### 本地 Maker 开发

1. 先用当前环境提供的 Maker 状态工具检查工作区；目标必须是具体游戏项目，不是 UrhoX
   引擎仓库或项目的上级目录。
2. 如果当前客户端通过 Maker 插件包装动态工具，先列出实时工具，再调用其中的
   `get_ad_config`；如果客户端直接暴露 Maker MCP 工具，则直接调用同名工具。
3. 只在 `.project/project.json` 和 `.project/settings.json` 已完成初始化后调用。
4. 不要自己构造或展示 `_mac_token`、`_project_path`、Client ID 或 Client Token；本地
   Maker Proxy 负责注入登录态和项目上下文。
5. 如果缺少 `app_id` 或 `developer_id`，调用一次 `generate_test_qrcode` 生成项目身份，
   然后重试 `get_ad_config`。不要为此改用发布工具。

如果主要项目配置尚未初始化，不要根据 SDK 文档、`.maker-mcp/config.json`、本地回调或
`.project` 目录存在与否猜测广告可用。构建可能提交并推送项目；只有用户明确要求构建、
提交或预览时才执行构建，否则说明当前无法同步广告配置。

### 云端 Maker 开发

在云端项目工作区直接调用官方 MCP 的 `get_ad_config`，随后使用同一份
`@runtime.ad` 结果。不要在云端另写一套广告位初始化逻辑，也不要让开发者复制本地凭证。
如果云端当前没有暴露该工具或缺少项目身份，明确说明广告状态尚未验证，不要假定已经
开通。

### 处理同步结果

- `ad.status == 1`：配置已生效，可以继续接入或验证游戏代码。
- `ad.status != 1`：停止实现真实广告流程，向开发者说明 `status_message` 和 `warning`。
- 返回 `ad.url` 时，只把它作为 TapTap 官方开通或异常处理入口交给开发者；不要自行访问、
  代办，也不要替换为 AdMob、TopOn、Unity Ads 等第三方平台注册流程。
- 开发者完成官方处理后，再调用 `get_ad_config` 同步一次；不要循环重试。
- `ad_spaces` 和 `top_on_placements` 只供宿主运行时消费。不要在 Lua 中复制、修改或硬编码。

用户只要求解释、设计建议或只读审查时，不调用会写入 `settings.json` 的
`get_ad_config`。可以读取已有配置辅助检查，但必须标注它不是刚同步的实时状态；需要验证
实时状态时，先征得用户同意。

## 工作流程

1. 判断当前是本地 Maker、云端 Maker，还是只读审查。
2. 对接入或配置任务，按上节调用 `get_ad_config`，确认 `ad.status == 1`。
3. 阅读 `engine-docs/recipes/sdk.md` 的“激励视频广告”章节，核对当前 API 契约。
4. 找到用户指定的入口及项目已有的奖励、存档和 UI 流程。
5. 明确“玩家主动做什么、看到什么提示、成功后得到什么”。
6. 沿用项目现有架构完成最小改动，不主动重构其他系统。
7. 处理请求未受理、成功、提前关闭、加载失败、无回调和页面销毁。
8. 验证重复点击和迟到回调不会重复发奖或卡住 UI。

用户只要求检查时保持只读，报告确定的 API 错误和体验问题，不顺带整改其他系统。

## 核心 API

```lua
sdk:ShowRewardVideoAd(function(result)
    if result.success then
        -- 广告完整观看，发放奖励
    else
        -- 未完整观看或加载失败，不发奖励
        print("广告未完成: " .. tostring(result.msg))
    end
end)
```

回调结果：

| 字段 | 类型 | 含义 |
|---|---|---|
| `success` | boolean | 是否完整观看并满足发奖条件 |
| `msg` | string | 平台结果或错误描述 |
| `extra` | string | SDK 扩展 JSON；没有时为空字符串 |

将 `success` 作为唯一发奖依据。不要根据播放时长、按钮状态、`msg` 文案或
`extra` 自行推断成功。`"embed manual close"` 表示提前关闭，必须视为失败。

API 还会返回一个 boolean，表示本次展示请求是否被受理。它不代表广告观看成功。
回调可能在调用栈内同步失败，也可能稍后异步返回，因此同时处理返回值和回调：

```lua
local adInFlight = false

local function showRewardAd(options)
    if adInFlight then
        return
    end

    adInFlight = true
    local completed = false
    local callbackFired = false
    local cancelWatchdog

    local function finish(result)
        if completed then
            return
        end

        completed = true
        adInFlight = false
        if cancelWatchdog then
            cancelWatchdog()
        end

        if result and result.success == true then
            options.grantReward()
            if options.onSuccess then
                options.onSuccess()
            end
            return
        end

        if options.onFailure then
            options.onFailure(result and result.msg or "广告暂不可用")
        end
    end

    -- 可选：复用项目已有计时器。startWatchdog 接收超时回调并返回取消函数。
    if options.startWatchdog then
        cancelWatchdog = options.startWatchdog(function()
            finish({ success = false, msg = "广告响应超时，请稍后重试" })
        end)
    end

    local accepted = sdk:ShowRewardVideoAd(function(result)
        callbackFired = true
        finish(result)
    end)

    if accepted == false and not callbackFired then
        finish({ success = false, msg = "广告暂不可用，请稍后重试" })
    end
end
```

如果需要无回调 watchdog，只能把本次流程结束为失败并恢复 UI，绝不能因为等待时间、
焦点变化、切后台时长或“玩家大概率看完”而发奖。watchdog、正常回调、同步拒绝和重复
回调必须共用同一个一次性完成状态；先完成的路径关闭本次流程，其他路径直接返回。

在成功分支中调用项目原有的奖励方法；不要为了接广告改造既有数据层或存档结构。

## 引擎已经处理的事项

- 由 `get_ad_config` 同步到 `@runtime.ad` 的广告位 ID、国内/海外平台映射和变现状态，
  由宿主配置与引擎 Bootstrap 加载。
- 广告平台账号、原生 SDK 和宿主应用配置不属于游戏项目的接入工作。
- 引擎内置 3 秒调用防抖，并从服务端获取广告冷却间隔。
- 不支持真实广告 SDK 的运行环境会使用内置 FakeAd 预览。
- 平台差异由同一个 Lua API 适配。

不要在游戏脚本中硬编码广告位 ID、修改 `ad_spaces`、`top_on_placements`，也不要直接
调用 `urhox-libs/FakeAd`。不要通过循环重试绕过引擎冷却；收到失败后恢复 UI，让玩家
稍后主动重试。

## 审查现有项目

先定位所有广告调用：

```bash
rg -n 'ShowRewardVideoAd|广告' <project>/scripts
```

对每个入口追踪完整链路：

```text
按钮 → SDK 调用 → 回调结果 → 项目原有奖励方法 → UI
```

重点检查：

- 是否忽略 boolean 返回值，导致按钮或全局锁永久卡住。
- 是否把失败、无回调、超时或失焦转成成功。
- 页面关闭或场景切换后，回调是否仍操作失效 UI、错误对象或错误列表索引。
- 是否硬编码广告位或广告视频 URL。

## 广告设计原则

### 让玩家主动选择

- 在按钮上明确写出行为和收益，例如“看广告复活”或“看广告领取双倍金币”。
- 在点击前说明准确奖励，不使用伪装按钮、误导文案或默认勾选。
- 不在启动、首次教学、战斗操作中或其他无预期时刻强制弹出广告。

### 放在自然节点

优先选择玩家已经停下并面临明确选择的节点：

- 失败结算时复活一次；
- 关卡结算时领取双倍奖励；
- 主动补充体力、免费刷新或重抽；
- 可选地缩短等待时间。

不要为了制造广告需求而故意削弱正常奖励、拖慢流程或制造虚假失败。

### 表达清楚

- 在按钮上直接说明广告行为和具体收益。
- 成功后及时显示结果，失败时说明没有获得奖励。
- 同一次观看最多发奖一次。重复回调、重复点击或页面重建不得重复发放。

### 失败不惩罚玩家

- 提前关闭、加载失败、平台不支持或冷却中均不发奖励。
- 失败时不得扣除已有资源、消耗复活次数或破坏当前进度。
- 给出简短可行动提示；技术错误写入日志，不把原始 SDK 错误堆给玩家。
- 广告期间禁用触发按钮并显示等待状态；回调或请求拒绝后必须恢复。

## 验证清单

- 正常完整观看只发放一次奖励。
- 提前关闭、加载失败、nil/异常结果和 `accepted == false` 均不发奖励。
- `accepted == false` 同步触发回调和不触发回调两种路径都只结束一次。
- 快速连点不会发起多个广告，也不会重复发奖。
- 无回调 watchdog 只恢复 UI 并报失败，不会推断成功。
- 重复回调和超时后的迟到回调不会发奖。
- 广告返回时原页面已经关闭，不会访问失效 UI 或卡住全局输入。
- 成功、失败和冷却提示清晰，按钮最终都会恢复可用状态。
- 本地 FakeAd 流程可走通；真实 SDK 行为在目标宿主或设备上复验。
- 没有硬编码广告位或广告视频 URL。
