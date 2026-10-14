-- ============================================================================
-- AudioManager —— 游戏音频统一管理（BGM / 事件音效 / UI 音效）
-- ----------------------------------------------------------------------------
-- 纯 UI 架构（urhox-libs/UI = Yoga + NanoVG），无 3D Scene / 角色移动。
-- Effects.PlaySound / PlaySoundLooped 需要一个 Urho3D Scene 来挂载 SoundSource，
-- 因此这里惰性创建并持有【唯一的最小音频 Scene + AudioListener 节点】。
-- 若引擎音频子系统不可用（engine:GetSubsystem("Audio") == nil），
-- 所有播放静默 no-op，绝不抛错阻断 UI。
-- ============================================================================

local Effects = require("urhox-libs/Effects/Effects")

local AudioManager = {}

-- ---------------------------------------------------------------------------
-- 模块级状态（Scene 必须被模块级变量持有，否则函数返回后会被 GC 回收 → 随机闪退）
-- ---------------------------------------------------------------------------
local enabled_     = false   -- 音频子系统是否可用（供设置页读取）
local scene_       = nil     -- 最小音频 Scene
local listener_    = nil     -- AudioListener 节点
local initialized_ = false

-- 当前 BGM 句柄 / key
local bgmHandle_ = nil
local bgmKey_    = nil

-- ---------------------------------------------------------------------------
-- 资源映射
-- 资源路径前缀："audio/" → assets/audio/，"image/" → assets/image/，"fonts/" → assets/fonts/
-- ---------------------------------------------------------------------------

-- BGM key → 资源路径
local BGM_MAP = {
    menu     = "audio/bgm/bgm_menu.ogg",
    match    = "audio/bgm/bgm_match.ogg",
    ambient  = "audio/bgm/bgm_ambient.ogg",
    menu_alt = "audio/bgm/bgm_menu_alt.ogg",
}

-- UI 点击/切换/悬停音效 name → 资源路径（assets/audio/sfx/ 下）
local UI_MAP = {
    click        = "audio/sfx/click1.wav",
    click2       = "audio/sfx/click2.wav",
    click3       = "audio/sfx/click3.wav",
    click4       = "audio/sfx/click4.wav",
    click5       = "audio/sfx/click5.wav",
    switch       = "audio/sfx/switch1.wav",
    rollover     = "audio/sfx/rollover1.wav",
    mouseclick   = "audio/sfx/mouseclick1.wav",
    mouserelease = "audio/sfx/mouserelease1.wav",
}

-- 事件音效目录（PlayEvent(name) 按 "event_<name>.ogg" 拼接）
local EVENT_DIR = "audio/sfx/events/"

-- ---------------------------------------------------------------------------
-- 内部工具
-- ---------------------------------------------------------------------------

-- 安全执行播放：失败仅 log，不阻断调用方（UI 永不因音频崩溃）
local function safeCall(fn)
    local ok, res = pcall(fn)
    if not ok then
        if log then log:Write(LOG_WARNING, "[AudioManager] play failed: " .. tostring(res)) end
        return nil
    end
    return res
end

-- 仅在音频可用时执行 fn（fn 内部用 safeCall 包裹）
local function ifEnabled(fn)
    if not enabled_ or not scene_ then return nil end
    return safeCall(fn)
end

-- ---------------------------------------------------------------------------
-- 生命周期
-- ---------------------------------------------------------------------------

function AudioManager.Init()
    if initialized_ then return end
    initialized_ = true

    -- 判断音频子系统是否可用
    local audio = nil
    pcall(function() audio = engine:GetSubsystem("Audio") end)
    if not audio then
        enabled_ = false
        if log then log:Write(LOG_INFO, "[AudioManager] Audio subsystem unavailable; audio disabled (UI unaffected).") end
        return
    end

    -- 惰性创建最小音频 Scene + AudioListener
    safeCall(function()
        scene_ = Scene()
        listener_ = scene_:CreateChild("SoundListener")
        listener_:CreateComponent("SoundListener")
        enabled_ = true
    end)

    if not enabled_ or not scene_ then
        enabled_ = false
        return
    end

    -- 每帧驱动音频 Scene 的组件更新（SoundSource 混音 + Effects 的节点延时删除）。
    -- 纯 UI 游戏没有“主场景”被引擎更新，这里自行订阅 Update 事件驱动本 Scene。
    pcall(function()
        SubscribeToEvent("Update", function(eventType, eventData)
            if scene_ then
                scene_:Update(eventData["TimeStep"]:GetFloat())
            end
        end)
    end)
end

-- 音频子系统运行时是否可用（设置页读取）
function AudioManager.IsEnabled()
    return enabled_
end

-- ---------------------------------------------------------------------------
-- BGM（循环，切换时先停旧曲）
-- ---------------------------------------------------------------------------

function AudioManager.PlayBGM(key)
    if not enabled_ or not scene_ then return end
    local path = BGM_MAP[key]
    if not path then
        if log then log:Write(LOG_WARNING, "[AudioManager] Unknown BGM key: " .. tostring(key)) end
        return
    end
    -- 切换时先停旧曲
    if bgmHandle_ then
        pcall(function() bgmHandle_:Stop() end)
        bgmHandle_ = nil
    end
    bgmKey_ = key
    bgmHandle_ = ifEnabled(function()
        return Effects.PlaySoundLooped(scene_, path, {
            gain = 0.5,
        })
    end)
end

function AudioManager.StopBGM()
    if bgmHandle_ then
        pcall(function() bgmHandle_:Stop() end)
        bgmHandle_ = nil
        bgmKey_ = nil
    end
end

function AudioManager.GetBGMKey()
    return bgmKey_
end

-- ---------------------------------------------------------------------------
-- 事件音效（一次性）
-- PlayEvent("sign") → audio/sfx/events/event_sign.ogg
-- ---------------------------------------------------------------------------

function AudioManager.PlayEvent(name)
    if not name or name == "" then return end
    ifEnabled(function()
        local path = EVENT_DIR .. "event_" .. name .. ".ogg"
        return Effects.PlaySound(scene_, path, { gain = 0.7 })
    end)
end

-- ---------------------------------------------------------------------------
-- UI 音效（一次性）
-- PlayUI("click") → audio/sfx/click1.wav（在已发货的 click1-5 间随机增加变化）
-- ---------------------------------------------------------------------------

function AudioManager.PlayUI(name)
    if not name or name == "" then return end
    local path = UI_MAP[name]
    if not path then
        -- 兜底：直接尝试 audio/sfx/<name>.wav
        path = "audio/sfx/" .. name .. ".wav"
    end
    if name == "click" then
        -- 在已发货的 click1-5.wav 间随机，避免单一音效单调
        path = "audio/sfx/click" .. tostring(math.random(1, 5)) .. ".wav"
    end
    ifEnabled(function()
        return Effects.PlaySound(scene_, path, { gain = 0.4 })
    end)
end

return AudioManager
