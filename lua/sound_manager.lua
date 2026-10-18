--[[
    ============================================================================
    CYBER ESPORTS SOUND & AUDIO MANAGER
    ============================================================================
    Target Platform: TapTap Maker (Pure Lua 5.4 + UrhoX / Love2D Audio API)
    Design Philosophy:
      1. 动态赛博电竞 BGM：对线平缓电子律动 → 大龙生死决胜切入史诗鼓点 → 赛后颁奖号角
      2. 经典电竞广播音效：一血钟鸣、大龙咆哮、团灭震音、水晶爆炸、微操触控
      3. 跨平台环境自适应：兼容手机端原生音频、Web 端与 Node 自动化测试静音回退
    ============================================================================
--]]

local SoundManager = {}

SoundManager.SFX = {
    CLICK           = "assets/audio/click.ogg",
    FIRST_BLOOD     = "assets/audio/first_blood.ogg",
    BARON_ROAR      = "assets/audio/baron_roar.ogg",
    ACE_GONG        = "assets/audio/ace.ogg",
    TOWER_FALL      = "assets/audio/tower_fall.ogg",
    CLUTCH_STRIKE   = "assets/audio/clutch_strike.ogg",
    VICTORY_FANFARE = "assets/audio/victory.ogg",
    DEFEAT_TAPS     = "assets/audio/defeat.ogg",
}

SoundManager.BGM = {
    LOBBY           = "assets/audio/bgm_lobby.ogg",
    MATCH_LANE      = "assets/audio/bgm_match_lane.ogg",
    MATCH_BARON     = "assets/audio/bgm_match_baron.ogg",
    VICTORY         = "assets/audio/bgm_victory.ogg",
}

local _isMuted = false
local _sfxVolume = 0.8
local _bgmVolume = 0.6
local _currentBgm = nil
local _historyEvents = {}

function SoundManager.SetMuted(muted)
    _isMuted = muted
    if love and love.audio and _currentBgm then
        if _isMuted then
            pcall(function() _currentBgm:pause() end)
        else
            pcall(function() _currentBgm:play() end)
        end
    end
end

function SoundManager.IsMuted()
    return _isMuted
end

function SoundManager.SetSfxVolume(vol)
    _sfxVolume = math.max(0, math.min(1, vol or 0.8))
end

function SoundManager.SetBgmVolume(vol)
    _bgmVolume = math.max(0, math.min(1, vol or 0.6))
    if love and love.audio and _currentBgm then
        pcall(function() _currentBgm:setVolume(_bgmVolume) end)
    end
end

function SoundManager.PlaySFX(sfxKey)
    if _isMuted then return false end
    table.insert(_historyEvents, { type = "SFX", key = sfxKey, time = os.time() })
    if #_historyEvents > 50 then table.remove(_historyEvents, 1) end

    -- Safe execution under Love2D / UrhoX audio bindings
    if love and love.audio and love.audio.newSource then
        local filePath = SoundManager.SFX[sfxKey] or sfxKey
        local ok, src = pcall(love.audio.newSource, filePath, "static")
        if ok and src then
            src:setVolume(_sfxVolume)
            pcall(function() src:play() end)
            return true
        end
    end
    return true -- Virtual play succeeded
end

function SoundManager.PlayBGM(bgmKey)
    if _isMuted then return false end
    table.insert(_historyEvents, { type = "BGM", key = bgmKey, time = os.time() })

    if love and love.audio and love.audio.newSource then
        local filePath = SoundManager.BGM[bgmKey] or bgmKey
        if _currentBgm then
            pcall(function() _currentBgm:stop() end)
        end
        local ok, src = pcall(love.audio.newSource, filePath, "stream")
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
    if love and love.audio and _currentBgm then
        pcall(function() _currentBgm:stop() end)
        _currentBgm = nil
    end
end

function SoundManager.GetRecentAudioLog()
    return _historyEvents
end

return SoundManager
