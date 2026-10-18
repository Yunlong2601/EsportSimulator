--[[
    ============================================================================
    ESPORTS LEGACY: ROAD TO WORLDS — TITLE LAUNCHER & ENTRANCE SCREEN
    ============================================================================
    Native UrhoX Lua Game Launcher for TapTap Maker
    Pure Yoga Flexbox + NanoVG with modern Dark Gold Cyberpunk Esports aesthetic.
    ============================================================================
--]]

local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local SaveManager = require("SaveManager")

-- Safe loader for SoundManager
local SoundManager = nil
local ok_sm, sm = pcall(require, "lua.sound_manager")
if ok_sm and type(sm) == "table" then
    SoundManager = sm
else
    local ok_sm2, sm2 = pcall(require, "scripts.lua.sound_manager")
    if ok_sm2 and type(sm2) == "table" then
        SoundManager = sm2
    end
end

local MenuScreen = {}

-- UI Screen State
local _screenMode = "MAIN" -- "MAIN", "NEW_CAREER", "SETTINGS"
local _confirmReset = false
local _selectedName = "Prodigy"
local _selectedRole = "MID"
local _selectedTrait = "mechanics"

local PRESET_NAMES = { "Prodigy", "Faker", "Chovy", "Uzi", "TheShy" }
local PRESET_ROLES = {
    { id = "MID", name = "⚡ 中单" },
    { id = "ADC", name = "🏹 射手" },
    { id = "TOP", name = "🛡️ 上单" },
    { id = "JUG", name = "🌲 打野" },
    { id = "SUP", name = "👁️ 辅助" },
}
local PRESET_TRAITS = {
    { id = "mechanics", name = "⚡ 微操怪物", desc = "操作能力 +15，对线击杀率大幅提升" },
    { id = "macro",     name = "🧠 大局指挥", desc = "专注度消耗减少，BP阶段胜率洞察加成" },
    { id = "iron_will", name = "🛡️ 逆境战神", desc = "心态负荷抗性 +25%，不易产生精神疲劳" },
    { id = "streamer",  name = "📈 商业宠儿", desc = "初始粉丝 +5,000，赞助资金倍率提高" },
}

function MenuScreen.Build(navigate)
    -- Fetch active game state from EsportSimulatorScreen
    local EsportScreen = require("ui.screens.EsportSimulatorScreen")
    local activeGame = EsportScreen.GetGame()
    local vs = activeGame:getViewState()

    local nodes = {}

    -- ========================================================================
    -- 1. TITLE HERO BANNER (Cyber Dark Gold Esports Brand)
    -- ========================================================================
    local brandBadges = UI.Panel {
        flexDirection = "row", alignItems = "center", gap = 8,
        children = {
            DS.Chip("🏆 ROAD TO WORLDS 2026", { fontColor = DS.C.gold, borderColor = DS.C.gold }),
            DS.Chip("⚡ 沉浸式职业电竞", { fontColor = DS.C.info, borderColor = DS.C.info }),
        }
    }

    local titleCard = DS.Card {
        backgroundColor = "#0d1117", borderColor = "#2b3448", borderWidth = 1,
        children = {
            brandBadges,
            UI.Label {
                text = "ESPORTS LEGACY",
                fontSize = 24, fontWeight = "bold", fontColor = DS.C.ember,
                marginTop = 8,
            },
            UI.Label {
                text = "电竞传奇 · 逐梦世界赛",
                fontSize = 18, fontWeight = "bold", fontColor = DS.C.gold,
                marginTop = 2,
            },
            UI.Label {
                text = "从出租屋单排路人王 ➔ 职业赛场5v5 BP捧杯 ➔ 收购俱乐部建立王朝！",
                fontSize = 12, fontColor = DS.C.textDim, marginTop = 4, lineHeight = 1.4,
            },
        }
    }
    table.insert(nodes, titleCard)

    -- ========================================================================
    -- 2. CONDITIONAL VIEW: MAIN / NEW_CAREER / SETTINGS
    -- ========================================================================
    if _screenMode == "MAIN" then
        -- --------------------------------------------------------------------
        -- ACTIVE CAREER LIVE SNAPSHOT (动态生涯状态卡)
        -- --------------------------------------------------------------------
        local phaseName = (vs.phase == 1 and "【第一阶段】路人王天梯单排")
            or ((vs.phase == 2 and "【第二阶段】职业赛场 5v5 BP") or "【第三阶段】俱乐部商业王朝")

        local traitInfo = "微操天才"
        for _, t in ipairs(PRESET_TRAITS) do
            if t.id == vs.player_trait then traitInfo = t.name break end
        end

        local snapshotCard = DS.Card {
            backgroundColor = DS.C.surfaceAlt, borderColor = DS.C.border, borderWidth = 1,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = "📋 当前生涯档案", fontSize = 13, fontWeight = "bold", fontColor = DS.C.text },
                        DS.Chip(phaseName, { fontColor = DS.C.ember, borderColor = DS.C.ember }),
                    }
                },
                UI.Panel {
                    width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 8, marginTop = 8,
                    children = {
                        DS.Chip(string.format("👤 %s [%s]", vs.player_name or "Prodigy", vs.player_role or "MID"), { fontColor = DS.C.info, borderColor = DS.C.info }),
                        DS.Chip(string.format("🏆 %s (%d LP)", vs.rank, vs.lp), { fontColor = DS.C.gold, borderColor = DS.C.gold }),
                        DS.Chip(string.format("💰 $%d", vs.money), { fontColor = DS.C.success, borderColor = DS.C.success }),
                        DS.Chip(string.format("🌟 %d 粉丝", vs.stream_channel and vs.stream_channel.subscribers or 10), { fontColor = DS.C.role_adc, borderColor = DS.C.role_adc }),
                        DS.Chip(string.format("✨ 天赋: %s", traitInfo), { fontColor = DS.C.role_sup, borderColor = DS.C.role_sup }),
                    }
                }
            }
        }
        table.insert(nodes, snapshotCard)

        -- --------------------------------------------------------------------
        -- THREE PRIMARY DIRECT ENTRANCE ACTIONS
        -- --------------------------------------------------------------------
        -- 1. CONTINUE CAREER
        table.insert(nodes, UI.Button {
            id = "btn_continue_career",
            text = "⚔️ 继续征途 (CONTINUE)",
            width = "100%", height = 52, fontSize = 15, fontWeight = "bold",
            backgroundColor = DS.C.ember, textColor = "#ffffff",
            borderRadius = 10,
            onClick = function()
                if navigate then navigate("esport_sim") end
            end
        })

        -- 2. NEW CAREER
        table.insert(nodes, UI.Button {
            id = "btn_toggle_new_career",
            text = "✨ 开启全新生涯 · 角色建档 (NEW CAREER)",
            width = "100%", height = 46, fontSize = 13, fontWeight = "bold",
            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.gold,
            borderColor = DS.C.gold, borderWidth = 1, borderRadius = 8,
            onClick = function()
                _screenMode = "NEW_CAREER"
                if navigate then navigate("menu") end
            end
        })

        -- 3. SETTINGS & PREFERENCES
        table.insert(nodes, UI.Button {
            id = "btn_open_settings",
            text = "⚙️ 游戏系统设置 (SETTINGS)",
            width = "100%", height = 44, fontSize = 13, fontWeight = "bold",
            backgroundColor = DS.C.surface, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 8,
            onClick = function()
                _screenMode = "SETTINGS"
                _confirmReset = false
                if navigate then navigate("menu") end
            end
        })

    elseif _screenMode == "NEW_CAREER" then
        -- --------------------------------------------------------------------
        -- POLISHED CHARACTER CREATION WIZARD
        -- --------------------------------------------------------------------
        local setupItems = {
            UI.Label { text = "🎮 创建全新选手档案 (New Career)", fontSize = 16, fontWeight = "bold", fontColor = DS.C.gold },
            UI.Label { text = "选择你的选手代号、主打分路与初始天资特质，踏上世界赛登峰之旅：", fontSize = 11, fontColor = DS.C.textDim, marginTop = 2 },
        }

        -- Name Presets
        table.insert(setupItems, UI.Label { text = "1. 选手代号 (GamerTag):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 8 })
        local nameBtns = {}
        for _, n in ipairs(PRESET_NAMES) do
            local isSel = (n == _selectedName)
            table.insert(nameBtns, UI.Button {
                text = n, flexGrow = 1, height = 34, fontSize = 12, fontWeight = isSel and "bold" or "normal",
                backgroundColor = isSel and DS.C.gold or DS.C.surface,
                textColor = isSel and "#000000" or DS.C.text,
                borderRadius = 6,
                onClick = function()
                    _selectedName = n
                    if navigate then navigate("menu") end
                end
            })
        end
        table.insert(setupItems, UI.Panel { width = "100%", flexDirection = "row", gap = 6, children = nameBtns })

        -- Role Presets
        table.insert(setupItems, UI.Label { text = "2. 擅长分路 (Preferred Role):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 8 })
        local roleBtns = {}
        for _, r in ipairs(PRESET_ROLES) do
            local isSel = (r.id == _selectedRole)
            table.insert(roleBtns, UI.Button {
                text = r.name, flexGrow = 1, height = 34, fontSize = 11, fontWeight = isSel and "bold" or "normal",
                backgroundColor = isSel and DS.C.info or DS.C.surface,
                textColor = isSel and "#000000" or DS.C.text,
                borderRadius = 6,
                onClick = function()
                    _selectedRole = r.id
                    if navigate then navigate("menu") end
                end
            })
        end
        table.insert(setupItems, UI.Panel { width = "100%", flexDirection = "row", gap = 6, children = roleBtns })

        -- Trait Presets
        table.insert(setupItems, UI.Label { text = "3. 天资特质 (Initial Talent):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 8 })
        local traitBtns = {}
        for _, tr in ipairs(PRESET_TRAITS) do
            local isSel = (tr.id == _selectedTrait)
            table.insert(traitBtns, UI.Button {
                text = tr.name, flexGrow = 1, height = 34, fontSize = 11, fontWeight = isSel and "bold" or "normal",
                backgroundColor = isSel and DS.C.success or DS.C.surface,
                textColor = isSel and "#000000" or DS.C.text,
                borderRadius = 6,
                onClick = function()
                    _selectedTrait = tr.id
                    if navigate then navigate("menu") end
                end
            })
        end
        table.insert(setupItems, UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 6, children = traitBtns })

        -- Trait description
        local activeDesc = ""
        for _, tr in ipairs(PRESET_TRAITS) do
            if tr.id == _selectedTrait then activeDesc = tr.desc break end
        end
        table.insert(setupItems, DS.AlertBox({ { "💡 效果: " .. activeDesc, DS.C.info } }))

        -- Confirmation buttons
        table.insert(setupItems, UI.Panel {
            width = "100%", flexDirection = "row", gap = 8, marginTop = 8,
            children = {
                UI.Button {
                    id = "btn_confirm_launch_career",
                    text = "🔥 正式出征 · 开启新征程", flexGrow = 2, height = 46, fontSize = 13, fontWeight = "bold",
                    backgroundColor = DS.C.ember, textColor = "#ffffff", borderRadius = 8,
                    onClick = function()
                        EsportScreen.ResetGame({
                            name = _selectedName,
                            role = _selectedRole,
                            trait = _selectedTrait,
                        })
                        _screenMode = "MAIN"
                        if navigate then navigate("esport_sim") end
                    end
                },
                UI.Button {
                    text = "取消返回", flexGrow = 1, height = 46, fontSize = 12,
                    backgroundColor = DS.C.surface, textColor = DS.C.textDim,
                    borderColor = DS.C.border, borderWidth = 1, borderRadius = 8,
                    onClick = function()
                        _screenMode = "MAIN"
                        if navigate then navigate("menu") end
                    end
                }
            }
        })

        table.insert(nodes, DS.Card {
            backgroundColor = DS.C.surfaceAlt, borderColor = DS.C.gold, borderWidth = 1,
            children = setupItems
        })

    elseif _screenMode == "SETTINGS" then
        -- --------------------------------------------------------------------
        -- IN-DEPTH SETTINGS MODAL (音量调节、横竖屏切换、清理缓存)
        -- --------------------------------------------------------------------
        local settingsItems = {
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Label { text = "⚙️ 游戏系统设置 (Settings)", fontSize = 16, fontWeight = "bold", fontColor = DS.C.gold },
                    DS.Chip("环境正常", { fontColor = DS.C.success, borderColor = DS.C.success }),
                }
            },
            UI.Label { text = "自定义声音、显示视界与本地存档配置：", fontSize = 11, fontColor = DS.C.textDim, marginTop = 2 },
        }

        -- Section 1: Audio Volume & Mute
        local isMuted = SoundManager and SoundManager.IsMuted and SoundManager.IsMuted() or false
        local curBgmVol = SoundManager and SoundManager.GetBgmVolume and math.floor(SoundManager.GetBgmVolume() * 100) or 60
        local curSfxVol = SoundManager and SoundManager.GetSfxVolume and math.floor(SoundManager.GetSfxVolume() * 100) or 80

        table.insert(settingsItems, UI.Label { text = "1. 音量与声音控制 (Audio Settings):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 8 })
        
        -- Mute Toggle Button
        table.insert(settingsItems, UI.Button {
            id = "btn_toggle_mute",
            text = isMuted and "🔇 当前状态: 已静音 (点击开启)" or "🔊 当前状态: 声音开启 (点击静音)",
            width = "100%", height = 36, fontSize = 12, fontWeight = "bold",
            backgroundColor = isMuted and "#2a151b" or "#122a1e",
            textColor = isMuted and DS.C.error or DS.C.success,
            borderColor = isMuted and DS.C.error or DS.C.success, borderWidth = 1, borderRadius = 6,
            onClick = function()
                if SoundManager and SoundManager.SetMuted then
                    SoundManager.SetMuted(not isMuted)
                end
                if navigate then navigate("menu") end
            end
        })

        -- BGM Volume Pills
        table.insert(settingsItems, UI.Label { text = string.format("🎵 音乐音量 (BGM Volume: %d%%):", curBgmVol), fontSize = 11, fontColor = DS.C.textDim, marginTop = 4 })
        local bgmPills = {}
        for _, pct in ipairs({ 100, 70, 40, 10 }) do
            local isSel = (math.abs(curBgmVol - pct) < 15)
            table.insert(bgmPills, UI.Button {
                text = tostring(pct) .. "%", flexGrow = 1, height = 30, fontSize = 11,
                backgroundColor = isSel and DS.C.gold or DS.C.surface,
                textColor = isSel and "#000000" or DS.C.textDim,
                borderRadius = 4,
                onClick = function()
                    if SoundManager and SoundManager.SetBgmVolume then
                        SoundManager.SetBgmVolume(pct / 100)
                    end
                    if navigate then navigate("menu") end
                end
            })
        end
        table.insert(settingsItems, UI.Panel { width = "100%", flexDirection = "row", gap = 6, children = bgmPills })

        -- SFX Volume Pills
        table.insert(settingsItems, UI.Label { text = string.format("🔔 音效音量 (SFX Volume: %d%%):", curSfxVol), fontSize = 11, fontColor = DS.C.textDim, marginTop = 4 })
        local sfxPills = {}
        for _, pct in ipairs({ 100, 70, 40, 10 }) do
            local isSel = (math.abs(curSfxVol - pct) < 15)
            table.insert(sfxPills, UI.Button {
                text = tostring(pct) .. "%", flexGrow = 1, height = 30, fontSize = 11,
                backgroundColor = isSel and DS.C.info or DS.C.surface,
                textColor = isSel and "#000000" or DS.C.textDim,
                borderRadius = 4,
                onClick = function()
                    if SoundManager and SoundManager.SetSfxVolume then
                        SoundManager.SetSfxVolume(pct / 100)
                    end
                    if navigate then navigate("menu") end
                end
            })
        end
        table.insert(settingsItems, UI.Panel { width = "100%", flexDirection = "row", gap = 6, children = sfxPills })

        -- Section 2: Screen Orientation & HUD
        table.insert(settingsItems, UI.Label { text = "2. 界面显示视界与排版 (Orientation & Layout):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 10 })
        table.insert(settingsItems, UI.Panel {
            width = "100%", flexDirection = "row", gap = 8,
            children = {
                UI.Button {
                    text = "📱 竖屏视界 (推荐触控)", flexGrow = 1, height = 40, fontSize = 12, fontWeight = "bold",
                    backgroundColor = DS.C.surfaceAlt, textColor = DS.C.gold,
                    borderColor = DS.C.gold, borderWidth = 1, borderRadius = 8,
                    onClick = function()
                        if navigate then navigate("esport_sim") end
                    end
                },
                UI.Button {
                    text = "🖥️ 赛博横屏 (1080P HUD)", flexGrow = 1, height = 40, fontSize = 12, fontWeight = "bold",
                    backgroundColor = DS.C.ember, textColor = "#ffffff", borderRadius = 8,
                    onClick = function()
                        if navigate then navigate("esport_sim_landscape") end
                    end
                },
            }
        })

        -- Section 3: Storage & Cache Reset
        table.insert(settingsItems, UI.Label { text = "3. 本地存储与存档管理 (Storage & Cache):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 10 })
        if not _confirmReset then
            table.insert(settingsItems, UI.Button {
                id = "btn_reset_cache_ask",
                text = "🗑️ 清理全部本地数据与缓存 (Reset All)",
                width = "100%", height = 38, fontSize = 12,
                backgroundColor = "#241014", textColor = DS.C.error,
                borderColor = DS.C.error, borderWidth = 1, borderRadius = 6,
                onClick = function()
                    _confirmReset = true
                    if navigate then navigate("menu") end
                end
            })
        else
            table.insert(settingsItems, UI.Panel {
                width = "100%", flexDirection = "column", gap = 6, padding = 8,
                backgroundColor = "#331218", borderColor = DS.C.error, borderWidth = 1, borderRadius = 6,
                children = {
                    UI.Label { text = "⚠️ 确定要清空全部本地数据并从零重置吗？此操作不可撤销！", fontSize = 11, fontColor = "#ffb0b0" },
                    UI.Panel {
                        width = "100%", flexDirection = "row", gap = 8,
                        children = {
                            UI.Button {
                                text = "🔴 确认清空重置", flexGrow = 1, height = 36, fontSize = 12, fontWeight = "bold",
                                backgroundColor = DS.C.error, textColor = "#ffffff", borderRadius = 6,
                                onClick = function()
                                    pcall(function() SaveManager.Delete() end)
                                    EsportScreen.ResetGame()
                                    _confirmReset = false
                                    _screenMode = "MAIN"
                                    if navigate then navigate("menu") end
                                end
                            },
                            UI.Button {
                                text = "取消", flexGrow = 1, height = 36, fontSize = 12,
                                backgroundColor = DS.C.surface, textColor = DS.C.textDim,
                                borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                                onClick = function()
                                    _confirmReset = false
                                    if navigate then navigate("menu") end
                                end
                            }
                        }
                    }
                }
            })
        end

        -- Close Settings Button
        table.insert(settingsItems, UI.Button {
            id = "btn_close_settings",
            text = "↩️ 保存并返回主页",
            width = "100%", height = 44, fontSize = 13, fontWeight = "bold",
            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 8,
            marginTop = 8,
            onClick = function()
                _screenMode = "MAIN"
                _confirmReset = false
                if navigate then navigate("menu") end
            end
        })

        table.insert(nodes, DS.Card {
            backgroundColor = DS.C.surfaceAlt, borderColor = DS.C.border, borderWidth = 1,
            children = settingsItems
        })
    end

    -- ========================================================================
    -- 3. FULL SCREEN SAFE SCROLLVIEW ROOT
    -- ========================================================================
    return UI.Panel {
        width = "100%", height = "100%", backgroundColor = DS.C.bg,
        children = {
            UI.SafeAreaView {
                width = "100%", height = "100%", nativeMenuInset = true,
                flexDirection = "column",
                children = {
                    UI.ScrollView {
                        width = "100%", flexGrow = 1, flexBasis = 0, scrollY = true, showScrollbar = true,
                        children = {
                            UI.Panel {
                                width = "100%", padding = 16, gap = 12, children = nodes
                            }
                        }
                    }
                }
            }
        }
    }
end

return MenuScreen
