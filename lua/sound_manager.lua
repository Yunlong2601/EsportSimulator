--[[
    ============================================================================
    CYBER ESPORTS SOUND & AUDIO MANAGER
    ============================================================================
    Target Platform: TapTap Maker (Pure Lua 5.4 + UrhoX / Love2D Audio API)
    Design Philosophy:
      1. 动态赛博电竞 BGM：对线平缓电子律动 → 大龙生死决胜切入史诗鼓点 → 赛后颁奖号角
      2. 经典电竞广播音效：一血钟鸣、大龙咆哮、团灭震音、水晶爆炸、微操触控
      3. 跨平台环境自适应：兼容手机端 UrhoX 原生音频、Love2D Web 端与 Node 自动化测试静音回退
    ============================================================================
--]]

local SoundManager = {}

SoundManager.SFX = {
    CLICK           = "audio/sfx/click1.wav",
    CLICK_SUBTLE    = "audio/sfx/click3.wav",
    SWITCH          = "audio/sfx/switch1.wav",
    FIRST_BLOOD     = "audio/sfx/events/event_action.ogg",
    BARON_ROAR      = "audio/sfx/events/event_levelup.ogg",
    ACE_GONG        = "audio/sfx/events/event_action.ogg",
    TOWER_FALL      = "audio/sfx/events/event_action.ogg",
    CLUTCH_STRIKE   = "audio/sfx/events/event_action.ogg",
    VICTORY_FANFARE = "audio/sfx/events/event_win.ogg",
    DEFEAT_TAPS     = "audio/sfx/events/event_lose.ogg",
    MONEY_GAIN      = "audio/sfx/events/event_money.ogg",
    REWARD          = "audio/sfx/events/event_reward.ogg",
    SIGN_CONTRACT   = "audio/sfx/events/event_sign.ogg",
    TRANSFER        = "audio/sfx/events/event_transfer.ogg",
}

SoundManager.BGM = {
    LOBBY           = "audio/bgm/bgm_ambient.ogg",
    MENU            = "audio/bgm/bgm_menu.ogg",
    MATCH_LANE      = "audio/bgm/bgm_match.ogg",
    MATCH_BARON     = "audio/bgm/bgm_match.ogg",
    VICTORY         = "audio/bgm/bgm_menu_alt.ogg",
}

local _isMuted = false
local _sfxVolume = 0.8
local _bgmVolume = 0.6
local _currentBgm = nil
local _historyEvents = {}

-- UrhoX Native Audio handles
local _urhoxSoundSource = nil
local _urhoxBgmSource = nil

local function getUrhoxSoundSource()
    if _urhoxSoundSource then return _urhoxSoundSource end
    if scene_ and scene_.CreateChild then
        local node = scene_:CreateChild("GlobalSFXNode")
        _urhoxSoundSource = node:CreateComponent("SoundSource")
        return _urhoxSoundSource
    end
    return nil
end

local function getUrhoxBgmSource()
    if _urhoxBgmSource then return _urhoxBgmSource end
    if scene_ and scene_.CreateChild then
        local node = scene_:CreateChild("GlobalBGMNode")
        _urhoxBgmSource = node:CreateComponent("SoundSource")
        return _urhoxBgmSource
    end
    return nil
end

function SoundManager.SetMuted(muted)
    _isMuted = muted
    if love and love.audio and _currentBgm then
        if _isMuted then
            pcall(function() _currentBgm:pause() end)
        else
            pcall(function() _currentBgm:play() end)
        end
    end
    if _urhoxBgmSource and _urhoxBgmSource.SetGain then
        pcall(function()
            _urhoxBgmSource:SetGain(_isMuted and 0 or _bgmVolume)
        end)
    end
end

function SoundManager.IsMuted()
    return _isMuted
end

function SoundManager.SetSfxVolume(vol)
    _sfxVolume = math.max(0, math.min(1, vol or 0.8))
end

function SoundManager.GetSfxVolume()
    return _sfxVolume
end

function SoundManager.SetBgmVolume(vol)
    _bgmVolume = math.max(0, math.min(1, vol or 0.6))
    if love and love.audio and _currentBgm then
        pcall(function() _currentBgm:setVolume(_bgmVolume) end)
    end
    if _urhoxBgmSource and _urhoxBgmSource.SetGain then
        pcall(function()
            _urhoxBgmSource:SetGain(_isMuted and 0 or _bgmVolume)
        end)
    end
end

function SoundManager.GetBgmVolume()
    return _bgmVolume
end

function SoundManager.PlaySFX(sfxKey)
    if _isMuted then return false end
    table.insert(_historyEvents, { type = "SFX", key = sfxKey, time = os.time() })
    if #_historyEvents > 50 then table.remove(_historyEvents, 1) end

    local filePath = SoundManager.SFX[sfxKey] or sfxKey

    -- 1. UrhoX Native Audio engine
    if cache and cache.GetResource then
        local ok, snd = pcall(function()
            return cache:GetResource("Sound", filePath) or cache:GetResource("Sound", "assets/" .. filePath)
        end)
        if ok and snd then
            local src = getUrhoxSoundSource()
            if src and src.Play then
                pcall(function()
                    src:SetGain(_sfxVolume)
                    src:Play(snd)
                end)
                return true
            end
        end
    end

    -- 2. Love2D Web/Desktop audio binding fallback
    if love and love.audio and love.audio.newSource then
        local ok, src = pcall(love.audio.newSource, "assets/" .. filePath, "static")
        if not ok or not src then
            ok, src = pcall(love.audio.newSource, filePath, "static")
        end
        if ok and src then
            src:setVolume(_sfxVolume)
            pcall(function() src:play() end)
            return true
        end
    end

    return true -- Virtual play succeeded for test / headless
end

function SoundManager.PlayBGM(bgmKey)
    if _isMuted then return false end
    table.insert(_historyEvents, { type = "BGM", key = bgmKey, time = os.time() })

    local filePath = SoundManager.BGM[bgmKey] or bgmKey

    -- 1. UrhoX Native Audio engine
    if cache and cache.GetResource then
        local ok, snd = pcall(function()
            return cache:GetResource("Sound", filePath) or cache:GetResource("Sound", "assets/" .. filePath)
        end)
        if ok and snd then
            local src = getUrhoxBgmSource()
            if src and src.Play then
                pcall(function()
                    snd:SetLooped(true)
                    src:SetGain(_bgmVolume)
                    src:Play(snd)
                end)
                return true
            end
        end
    end

    -- 2. Love2D fallback
    if love and love.audio and love.audio.newSource then
        if _currentBgm then
            pcall(function() _currentBgm:stop() end)
        end
        local ok, src = pcall(love.audio.newSource, "assets/" .. filePath, "stream")
        if not ok or not src then
            ok, src = pcall(love.audio.newSource, filePath, "stream")
        end
        if ok and src then
            _currentBgm = src
            _currentBgm:setLooping(true)
            _currentBgm:setVolume(_bgmVolume)
            pcall(function() _currentBgm:play() end)
            return true
        end
    end

    return true
end

function SoundManager.StopBGM()
    if _urhoxBgmSource and _urhoxBgmSource.Stop then
        pcall(function() _urhoxBgmSource:Stop() end)
    end
    if love and love.audio and _currentBgm then
        pcall(function() _currentBgm:stop() end)
        _currentBgm = nil
    end
end

function SoundManager.GetRecentAudioLog()
    return _historyEvents
end

return SoundManager
