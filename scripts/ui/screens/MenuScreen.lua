--[[
    ============================================================================
    ESPORTS LEGACY: ROAD TO WORLDS — TITLE LAUNCHER & ENTRANCE SCREEN
    ============================================================================
    Native UrhoX Lua Game Launcher for TapTap Maker
    Pure Yoga Flexbox + NanoVG with modern Cyberpunk Esports aesthetic.
--]]

local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local SaveManager = require("SaveManager")

local MenuScreen = {}

-- Interactive Character Creation State
local _creatingNew = false
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

    local hasClubSave = false
    pcall(function() hasClubSave = SaveManager.Exists() end)

    local nodes = {}

    -- ========================================================================
    -- 1. TITLE HERO BANNER (Cyberpunk Esports Brand)
    -- ========================================================================
    local brandBadges = UI.Panel {
        flexDirection = "row", alignItems = "center", gap = 8,
        children = {
            DS.Chip("🏆 ROAD TO WORLDS 2026", { fontColor = DS.C.gold, borderColor = DS.C.gold }),
            DS.Chip("⚡ NATIVE LUA v2.4", { fontColor = DS.C.info, borderColor = DS.C.info }),
        }
    }

    local titleCard = DS.Card {
        backgroundColor = "#121722", borderColor = "#2b3448", borderWidth = 1,
        children = {
            brandBadges,
            UI.Label {
                text = "ESPORTS LEGACY",
                fontSize = 24, fontWeight = "bold", fontColor = DS.C.ember,
                marginTop = 6,
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
    -- 2. ACTIVE CAREER LIVE SNAPSHOT (动态生涯状态卡)
    -- ========================================================================
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
                width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 8, marginTop = 6,
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

    -- ========================================================================
    -- 3. PRIMARY ENTRANCE ACTIONS (赛博横屏与竖屏双模入口)
    -- ========================================================================
    table.insert(nodes, UI.Panel {
        width = "100%", flexDirection = "row", gap = 8,
        children = {
            UI.Button {
                id = "btn_continue_cyber_landscape",
                text = "🚀 赛博横屏主控 · 1080P HUD",
                flexGrow = 1, flexBasis = 0, height = 50, fontSize = 13, fontWeight = "bold",
                backgroundColor = DS.C.ember, textColor = "#ffffff",
                borderRadius = 10,
                onClick = function()
                    if navigate then navigate("esport_sim_landscape") end
                end
            },
            UI.Button {
                id = "btn_continue_portrait",
                text = "📱 竖屏视界",
                width = 110, height = 50, fontSize = 13, fontWeight = "bold",
                backgroundColor = DS.C.surfaceAlt, textColor = DS.C.gold,
                borderColor = DS.C.gold, borderWidth = 1, borderRadius = 10,
                onClick = function()
                    if navigate then navigate("esport_sim") end
                end
            },
        }
    })

    -- ========================================================================
    -- 4. NEW CAREER BUILDER & SETUP (角色创建与全新生涯)
    -- ========================================================================
    if not _creatingNew then
        table.insert(nodes, UI.Button {
            id = "btn_toggle_new_career",
            text = "✨ 开启全新生涯 · 角色建档 (NEW CAREER)",
            width = "100%", height = 44, fontSize = 13, fontWeight = "bold",
            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.gold,
            borderColor = DS.C.gold, borderWidth = 1, borderRadius = 8,
            onClick = function()
                _creatingNew = true
                if navigate then navigate("menu") end
            end
        })
    else
        local setupItems = {
            UI.Label { text = "🎮 创建全新选手档案", fontSize = 15, fontWeight = "bold", fontColor = DS.C.gold },
            UI.Label { text = "选择你的选手代号、主打分路与初始天资特质，踏上世界赛登峰之旅：", fontSize = 11, fontColor = DS.C.textDim },
        }

        -- Name Presets
        table.insert(setupItems, UI.Label { text = "1. 选手代号 (GamerTag):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 4 })
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
        table.insert(setupItems, UI.Label { text = "2. 擅长分路 (Preferred Role):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 4 })
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
        table.insert(setupItems, UI.Label { text = "3. 天资特质 (Initial Talent):", fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, marginTop = 4 })
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
            width = "100%", flexDirection = "row", gap = 8, marginTop = 6,
            children = {
                UI.Button {
                    text = "🔥 正式出征 · 开启新征程", flexGrow = 2, height = 44, fontSize = 13, fontWeight = "bold",
                    backgroundColor = DS.C.ember, textColor = "#ffffff", borderRadius = 8,
                    onClick = function()
                        EsportScreen.ResetGame({
                            name = _selectedName,
                            role = _selectedRole,
                            trait = _selectedTrait,
                        })
                        _creatingNew = false
                        if navigate then navigate("esport_sim") end
                    end
                },
                UI.Button {
                    text = "取消返回", flexGrow = 1, height = 44, fontSize = 12,
                    backgroundColor = DS.C.surface, textColor = DS.C.textDim,
                    borderColor = DS.C.border, borderWidth = 1, borderRadius = 8,
                    onClick = function()
                        _creatingNew = false
                        if navigate then navigate("menu") end
                    end
                }
            }
        })

        table.insert(nodes, DS.Card {
            backgroundColor = DS.C.surfaceAlt, borderColor = DS.C.gold, borderWidth = 1,
            children = setupItems
        })
    end

    -- ========================================================================
    -- 5. SECONDARY / LEGACY MODES (经典模式收纳)
    -- ========================================================================
    local legacyBtns = {}
    if hasClubSave then
        table.insert(legacyBtns, UI.Button {
            text = "继续执教 · 战队经理", flexGrow = 1, height = 36, fontSize = 11,
            backgroundColor = DS.C.surface, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
            onClick = function() if navigate then navigate("dashboard") end end,
        })
        table.insert(legacyBtns, UI.Button {
            text = "新赛季 · 重建战队", flexGrow = 1, height = 36, fontSize = 11,
            backgroundColor = DS.C.surface, textColor = DS.C.textDim,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
            onClick = function() if navigate then navigate("setup") end end,
        })
    else
        table.insert(legacyBtns, UI.Button {
            text = "创建俱乐部 · 战队经理", flexGrow = 1, height = 36, fontSize = 11,
            backgroundColor = DS.C.surface, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
            onClick = function() if navigate then navigate("setup") end end,
        })
    end

    table.insert(legacyBtns, UI.Button {
        text = "青训新秀 · 选手旧线", flexGrow = 1, height = 36, fontSize = 11,
        backgroundColor = DS.C.surface, textColor = DS.C.textDim,
        borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
        onClick = function() if navigate then navigate("unified_start") end end,
    })

    table.insert(nodes, DS.Card {
        backgroundColor = "#12151d", borderColor = "#1f2430", borderWidth = 1,
        children = {
            UI.Label { text = "🏛️ 经典扩展模式 (Classic Modes)", fontSize = 12, fontWeight = "bold", fontColor = DS.C.textDim },
            UI.Panel { width = "100%", flexDirection = "row", gap = 6, marginTop = 6, children = legacyBtns },
        }
    })

    -- ========================================================================
    -- 6. SYSTEM UTILITIES (设置、存档与关于)
    -- ========================================================================
    local utilBtns = {
        UI.Button {
            text = "💾 存档管理", flexGrow = 1, height = 36, fontSize = 12,
            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
            onClick = function() if navigate then navigate("savemanager") end end,
        },
        UI.Button {
            text = "⚙️ 游戏设置", flexGrow = 1, height = 36, fontSize = 12,
            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
            onClick = function() if navigate then navigate("settings") end end,
        },
        UI.Button {
            text = "ℹ️ 关于游戏", flexGrow = 1, height = 36, fontSize = 12,
            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.text,
            borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
            onClick = function() if navigate then navigate("about") end end,
        },
    }

    table.insert(nodes, UI.Panel {
        width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
        children = utilBtns,
    })

    -- ========================================================================
    -- 7. FULL SCREEN SAFE SCROLLVIEW ROOT
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
