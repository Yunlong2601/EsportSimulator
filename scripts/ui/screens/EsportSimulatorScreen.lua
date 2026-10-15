--[[
    ============================================================================
    ESPORTS LEGACY: ROAD TO WORLDS (URHOX LUA SCREEN)
    ============================================================================
    UrhoX Lua Native Screen for TapTap Maker
    Pure native UI powered by urhox-libs/UI, DesignSystem, and TapTapGame Engine.
--]]

local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")

-- Safe loader for the unified TapTapGame simulation engine
local TapTapGame = nil
local ok_mod, mod = pcall(require, "lua.taptap_make_main")
if ok_mod and type(mod) == "table" then
    TapTapGame = mod
else
    local ok_sub, sub_mod = pcall(require, "taptap_make_main")
    if ok_sub and type(sub_mod) == "table" then
        TapTapGame = sub_mod
    else
        TapTapGame = require("scripts.lua.taptap_make_main")
    end
end

local Gear = nil
local ok_g, m_g = pcall(require, "lua.gear")
if ok_g and type(m_g) == "table" then Gear = m_g else
    local ok_g2, m_g2 = pcall(require, "gear")
    if ok_g2 and type(m_g2) == "table" then Gear = m_g2 else
        pcall(function() Gear = require("scripts.lua.gear") end)
    end
end

local GlobalPowerRankings = nil
local ok_gpr, m_gpr = pcall(require, "lua.global_power_rankings")
if ok_gpr and type(m_gpr) == "table" then GlobalPowerRankings = m_gpr else
    local ok_gpr2, m_gpr2 = pcall(require, "global_power_rankings")
    if ok_gpr2 and type(m_gpr2) == "table" then GlobalPowerRankings = m_gpr2 else
        pcall(function() GlobalPowerRankings = require("scripts.lua.global_power_rankings") end)
    end
end

local PrestigeSystem = nil
local ok_ps, m_ps = pcall(require, "lua.prestige_system")
if ok_ps and type(m_ps) == "table" then PrestigeSystem = m_ps else
    local ok_ps2, m_ps2 = pcall(require, "prestige_system")
    if ok_ps2 and type(m_ps2) == "table" then PrestigeSystem = m_ps2 else
        pcall(function() PrestigeSystem = require("scripts.lua.prestige_system") end)
    end
end

local LegacyLore = nil
local ok_ll, m_ll = pcall(require, "lua.legacy_lore")
if ok_ll and type(m_ll) == "table" then LegacyLore = m_ll else
    local ok_ll2, m_ll2 = pcall(require, "legacy_lore")
    if ok_ll2 and type(m_ll2) == "table" then LegacyLore = m_ll2 else
        pcall(function() LegacyLore = require("scripts.lua.legacy_lore") end)
    end
end

local StreamingMilestones = nil
local ok_sm, m_sm = pcall(require, "lua.streaming_milestones")
if ok_sm and type(m_sm) == "table" then StreamingMilestones = m_sm else
    local ok_sm2, m_sm2 = pcall(require, "streaming_milestones")
    if ok_sm2 and type(m_sm2) == "table" then StreamingMilestones = m_sm2 else
        pcall(function() StreamingMilestones = require("scripts.lua.streaming_milestones") end)
    end
end

local ChampionshipRings = nil
local ok_cr, m_cr = pcall(require, "lua.championship_rings")
if ok_cr and type(m_cr) == "table" then ChampionshipRings = m_cr else
    local ok_cr2, m_cr2 = pcall(require, "championship_rings")
    if ok_cr2 and type(m_cr2) == "table" then ChampionshipRings = m_cr2 else
        pcall(function() ChampionshipRings = require("scripts.lua.championship_rings") end)
    end
end

local TrainingCamp = nil
local ok_tc, m_tc = pcall(require, "lua.training_camp")
if ok_tc and type(m_tc) == "table" then TrainingCamp = m_tc else
    local ok_tc2, m_tc2 = pcall(require, "training_camp")
    if ok_tc2 and type(m_tc2) == "table" then TrainingCamp = m_tc2 else
        pcall(function() TrainingCamp = require("scripts.lua.training_camp") end)
    end
end

local MetaTierList = nil
local ok_mt, m_mt = pcall(require, "lua.meta_tier_list")
if ok_mt and type(m_mt) == "table" then MetaTierList = m_mt else
    local ok_mt2, m_mt2 = pcall(require, "meta_tier_list")
    if ok_mt2 and type(m_mt2) == "table" then MetaTierList = m_mt2 else
        pcall(function() MetaTierList = require("scripts.lua.meta_tier_list") end)
    end
end

local TeamDynamics = nil
local ok_td, m_td = pcall(require, "lua.team_dynamics")
if ok_td and type(m_td) == "table" then TeamDynamics = m_td else
    local ok_td2, m_td2 = pcall(require, "team_dynamics")
    if ok_td2 and type(m_td2) == "table" then TeamDynamics = m_td2 else
        pcall(function() TeamDynamics = require("scripts.lua.team_dynamics") end)
    end
end

local FeaturesData = nil
local ok_fd, m_fd = pcall(require, "lua.gamedata_features")
if ok_fd and type(m_fd) == "table" then FeaturesData = m_fd else
    local ok_fd2, m_fd2 = pcall(require, "gamedata_features")
    if ok_fd2 and type(m_fd2) == "table" then FeaturesData = m_fd2 else
        pcall(function() FeaturesData = require("scripts.lua.gamedata_features") end)
    end
end

local EsportSimulatorScreen = {}

-- Singleton persistent game state across UrhoX screen transitions
local _active_game = nil
function EsportSimulatorScreen.GetGame()
    if not _active_game then
        _active_game = TapTapGame.new()
    end
    return _active_game
end

function EsportSimulatorScreen.ResetGame(opts)
    _active_game = TapTapGame.new(opts)
    return _active_game
end

local _last_msg = nil
local _notice_color = DS.C.gold

local function doAction(nav, action_id, payload)
    local game = EsportSimulatorScreen.GetGame()
    local res = game:onAction(action_id, payload)
    if res and res.message and res.message ~= "" then
        _last_msg = res.message
        _notice_color = res.success and DS.C.success or DS.C.error
    end
    if nav then nav("esport_sim") end
end

-- Crash-safe progress bar widget
local function makeBar(pct, color, height)
    pct = math.max(0, math.min(100, tonumber(pct) or 0))
    height = height or 6
    return UI.Panel {
        width = "100%", height = height, backgroundColor = "#141821",
        borderRadius = math.floor(height / 2), overflow = "hidden",
        children = {
            UI.Panel {
                width = tostring(pct) .. "%", height = height,
                backgroundColor = color or DS.C.ember, borderRadius = math.floor(height / 2),
            },
        },
    }
end

function EsportSimulatorScreen.Build(navigate)
    local game = EsportSimulatorScreen.GetGame()
    local vs = game:getViewState()

    local nodes = {}

    -- ========================================================================
    -- 1. TOP MOBILE STATUS HUD (L-Shape Mobile HUD)
    -- ========================================================================
    local hudItems = {}

    -- Header Row: Rank, Money, Fame
    local rankLabel = string.format("🏆 %s (%d LP)", vs.rank, vs.lp)
    local promo = vs.promo_series
    if promo and promo.active then
        rankLabel = string.format("⚔️ [%s 晋级赛 %d-%d]", promo.target_tier, promo.wins, promo.losses)
    end

    local topRow = UI.Panel {
        width = "100%", flexDirection = "row", alignItems = "center",
        justifyContent = "space-between", gap = 6,
        children = {
            UI.Panel {
                flexDirection = "row", alignItems = "center", gap = 6,
                children = {
                    UI.Button {
                        text = "🏠 菜单", width = 56, height = 26, fontSize = 11, fontWeight = "bold",
                        backgroundColor = DS.C.surfaceAlt, textColor = DS.C.textDim,
                        borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                        onClick = function() if navigate then navigate("menu") end end,
                    },
                    DS.Chip(string.format("👤 %s [%s]", vs.player_name or "Prodigy", vs.player_role or "MID"), { fontColor = DS.C.info, borderColor = DS.C.info }),
                    DS.Chip(rankLabel, { fontColor = DS.C.gold, borderColor = DS.C.gold }),
                }
            },
            UI.Panel {
                flexDirection = "row", alignItems = "center", gap = 6,
                children = {
                    DS.Chip(string.format("💰 $%d", vs.money), { fontColor = DS.C.success, borderColor = DS.C.success }),
                    UI.Button {
                        text = "🖥️ 横屏", width = 64, height = 26, fontSize = 11, fontWeight = "bold",
                        backgroundColor = "#06b6d422", textColor = DS.C.info,
                        borderColor = DS.C.info, borderWidth = 1, borderRadius = 6,
                        onClick = function() if navigate then navigate("esport_sim_landscape") end end,
                    },
                }
            }
        }
    }
    table.insert(hudItems, topRow)

    -- Dual Progress Bars: Energy & Mental
    local energyPct = vs.energy or 100
    local mentalPct = vs.mental or 100
    local focusPct = vs.focus or 100

    local barRow = UI.Panel {
        width = "100%", flexDirection = "row", gap = 12, marginTop = 6,
        children = {
            UI.Panel {
                flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 3,
                children = {
                    UI.Panel {
                        flexDirection = "row", justifyContent = "space-between",
                        children = {
                            DS.Label(string.format("⚡ 体能 %d%%", energyPct), { fontSize = 10, fontColor = DS.C.info }),
                        }
                    },
                    makeBar(energyPct, DS.C.info, 5),
                }
            },
            UI.Panel {
                flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 3,
                children = {
                    UI.Panel {
                        flexDirection = "row", justifyContent = "space-between",
                        children = {
                            DS.Label(string.format("🧠 心态 %d%%", mentalPct), { fontSize = 10, fontColor = "#c08bff" }),
                        }
                    },
                    makeBar(mentalPct, "#c08bff", 5),
                }
            },
        }
    }
    table.insert(hudItems, barRow)

    -- Focus & Health Status Line
    local focusStatus = focusPct >= 70 and "🟢 巅峰专注" or (focusPct >= 30 and "🟡 平稳消耗" or "🔴 严重疲劳")
    local ch = vs.career_health
    local wristStrain = (ch and ch.wrist_strain) or 0
    local healthStr = (ch and ch.has_rsi) and string.format("🚨 腱鞘炎警报(上限%d)", ch.max_mechanics or 80) or string.format("🩺 手腕负荷: %d%%", wristStrain)

    local statusText = string.format("专注度: %d%% (%s)  |  %s", focusPct, focusStatus, healthStr)
    table.insert(hudItems, DS.Label(statusText, { fontSize = 10, fontColor = DS.C.muted, marginTop = 4 }))

    -- Confidence Buff Banner if active
    local conf = vs.confidence
    if conf and conf.is_active then
        local confTxt = string.format("🔥 【狂傲自信】%s (微操+%d, 心态+%d, 胜率+%d%% | 剩余%d场)",
            conf.name or "极度火热", conf.bonus_mech or 5, conf.bonus_mental or 5, conf.bonus_win or 10, conf.matches_left or 3)
        table.insert(hudItems, DS.Label(confTxt, { fontSize = 10, fontColor = DS.C.warning, marginTop = 2 }))
    end

    table.insert(nodes, DS.Card {
        backgroundColor = DS.C.surface, padding = 10, gap = 4, children = hudItems
    })

    -- Action feedback alert if any
    if _last_msg and _last_msg ~= "" then
        table.insert(nodes, DS.AlertBox({ { _last_msg, _notice_color } }))
        _last_msg = nil
    end

    -- ========================================================================
    -- 1.5. L-RAIL QUICK-DOCK MACRO ROW (Web LeftNavRail & Tactical Modals)
    -- ========================================================================
    local curTab = game.active_tab or "CAREER"
    local railMacros = {
        { id = "CALENDAR",  icon = "📅", label = "赛历" },
        { id = "VOD",       icon = "🎬", label = "录像" },
        { id = "COMMUNITY", icon = "📢", label = "公关" },
        { id = "SOCIAL",    icon = "📱", label = "热搜" },
        { id = "CCTV",      icon = "📹", label = "监控" },
        { id = "ARENA",     icon = "⚔️", label = "试炼" },
        { id = "BUDGET",    icon = "💼", label = "审计" },
        { id = "GACHA",     icon = "🎁", label = "抽卡" },
        { id = "SYNERGY",   icon = "🔗", label = "羁绊" },
    }
    local railButtons = {}
    for _, rm in ipairs(railMacros) do
        local isRailActive = (curTab == rm.id)
        table.insert(railButtons, UI.Button {
            text = rm.icon .. " " .. rm.label,
            flexGrow = 1, flexBasis = 0, height = 28,
            fontSize = 9, fontWeight = isRailActive and "bold" or "normal",
            backgroundColor = isRailActive and DS.C.cyan or DS.C.surfaceInset,
            textColor = isRailActive and "#001018" or DS.C.textDim,
            borderColor = isRailActive and DS.C.cyan or DS.C.border,
            borderWidth = 1, borderRadius = 4,
            onClick = function()
                game.active_tab = rm.id
                if navigate then navigate("esport_sim") end
            end
        })
    end
    table.insert(nodes, UI.Panel {
        width = "100%", flexDirection = "row", gap = 3, marginTop = 4, children = railButtons
    })

    -- ========================================================================
    -- 2. FIVE-TAB MAIN NAVIGATION ROW
    -- ========================================================================
    local tabsDef = {
        { id = "CAREER",  icon = "⚔️", label = "天梯" },
        { id = "STAGE",   icon = "🏟️", label = "赛场" },
        { id = "DYNASTY", icon = "👑", label = "王朝" },
        { id = "TOUR",    icon = "🌍", label = "巡礼" },
        { id = "LOGS",    icon = "📜", label = "战报" },
    }

    local navButtons = {}
    for _, t in ipairs(tabsDef) do
        local isActive = (curTab == t.id)
        table.insert(navButtons, UI.Button {
            text = t.icon .. " " .. t.label,
            flexGrow = 1, flexBasis = 0, height = 36,
            fontSize = 11, fontWeight = isActive and "bold" or "normal",
            backgroundColor = isActive and DS.C.ember or DS.C.surfaceAlt,
            textColor = isActive and "#1a0e08" or DS.C.text,
            borderColor = isActive and DS.C.ember or DS.C.border,
            borderWidth = 1, borderRadius = 6,
            onClick = function()
                game.active_tab = t.id
                if navigate then navigate("esport_sim") end
            end
        })
    end

    table.insert(nodes, UI.Panel {
        width = "100%", flexDirection = "row", gap = 6, marginTop = 4, children = navButtons
    })

    -- ========================================================================
    -- 3. TAB CONTENT
    -- ========================================================================
    if curTab == "CAREER" then
        -- --------------------------------------------------------------------
        -- TAB 1: SOLO QUEUE & AMATEUR HUB (WITH 4 SUBTABS)
        -- --------------------------------------------------------------------
        local curCareerSub = game.career_subtab or "SOLO"
        local careerTabs = {
            { id = "SOLO",   label = "⚔️ 排位冲刺" },
            { id = "SHOP",   label = "🛒 外设便利店" },
            { id = "AGENCY", label = "🤝 经纪赞助" },
            { id = "STREAM", label = "🌟 直播特权" },
        }

        local cNavButtons = {}
        for _, ct in ipairs(careerTabs) do
            local isSubActive = (curCareerSub == ct.id)
            table.insert(cNavButtons, UI.Button {
                text = ct.label,
                flexGrow = 1, flexBasis = 0, height = 30,
                fontSize = 11, fontWeight = isSubActive and "bold" or "normal",
                backgroundColor = isSubActive and DS.C.ember or DS.C.surfaceAlt,
                textColor = isSubActive and "#1a0e08" or DS.C.text,
                borderColor = isSubActive and DS.C.ember or DS.C.border,
                borderWidth = 1, borderRadius = 6,
                onClick = function()
                    game.career_subtab = ct.id
                    if navigate then navigate("esport_sim") end
                end
            })
        end

        table.insert(nodes, UI.Panel {
            width = "100%", flexDirection = "row", gap = 6, marginTop = 2, children = cNavButtons
        })

        if curCareerSub == "SOLO" then
            table.insert(nodes, DS.SectionHeader("⚡ 召唤师高分排位中枢 (Solo Queue)", "段位冲刺", nil))

            if promo and promo.active then
                -- Promo Series Active Card
                table.insert(nodes, DS.Card {
                    backgroundColor = "#24180e", borderColor = DS.C.gold, padding = 12, gap = 8,
                    children = {
                        DS.Label(string.format("⚔️ 【%s 生死晋级赛】打响！赛制: %s", promo.target_tier, promo.format or "BO3"),
                            { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label(string.format("当前比分: %d 胜 / %d 负 (需胜 %d 局捧起晋级)", promo.wins, promo.losses, promo.required_wins),
                            { fontSize = 11, fontColor = DS.C.text }),
                        UI.Panel {
                            width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                            children = {
                                DS.Button("⚔️ 决战下局 (Advance)", function()
                                    doAction(navigate, "ADVANCE_PROMO", { is_win = true })
                                end, { height = 36, fontSize = 12, flexGrow = 1 }),
                                DS.Button("🏳️ 弃权 (Forfeit)", function()
                                    doAction(navigate, "FORFEIT_PROMO", nil)
                                end, { variant = "secondary", height = 36, fontSize = 12, flexGrow = 1 }),
                            }
                        }
                    }
                })
            else
                -- Standard Rank Progress Card
                local totalGames = (game.player.games_played or 0)
                local winRate = totalGames > 0 and ((game.player.wins / totalGames) * 100) or 50.0
                table.insert(nodes, DS.Card {
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between",
                            children = {
                                DS.Label(string.format("段位: %s (%d LP)", vs.rank, vs.lp), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                                DS.Label(string.format("胜率: %.1f%% (%d胜/%d场)", winRate, game.player.wins, totalGames), { fontSize = 11, fontColor = DS.C.muted }),
                            }
                        },
                        DS.Label(string.format("微操评分: %d  |  心态稳定性: %d  |  连胜场次: %d", vs.mechanics, vs.mental, game.player.win_streak or 0), { fontSize = 11, fontColor = DS.C.faint }),
                        makeBar((vs.lp % 100), DS.C.success, 5),
                    }
                })
            end

            -- 8 Action Buttons Grid
            table.insert(nodes, DS.SectionHeader("🎯 训练与竞技行动", nil, nil))

            local actions = {
                { id = "SOLO_QUEUE", label = "⚔️ 单排排位", desc = "扣除20体力/15专注，冲击胜点", prim = true },
                { id = "STUDY_VOD",  label = "📹 复盘录像", desc = "消耗10专注，微操上限+1", prim = false },
                { id = "STREAM",     label = "🔴 高分直播", desc = "直播获赞，斩获粉丝与打赏", prim = false },
                { id = "REST",       label = "🛌 战队休整", desc = "深度休眠，体力+35/专注+40", prim = false },
                { id = "DRINK_COFFEE", label = "☕ 战备咖啡", desc = "备用咖啡+50专注度", prim = false },
                { id = "PHYSIOTHERAPY", label = "🩺 康复理疗", desc = "冰敷理疗消除手腕劳损负荷", prim = false, payload = { treatment_id = "ice_stretch" } },
                { id = "CLAIM_DAILY_LOGIN", label = "🎁 每日签到", desc = "领取连签排位胜点与奖金", prim = false },
                { id = "CLASH_RIVAL", label = "⚔️ 宿命死斗", desc = "约战宿敌，斩获全网知名度", prim = false },
            }

            local gridPanels = {}
            for i = 1, #actions, 2 do
                local a1 = actions[i]
                local a2 = actions[i + 1]
                local rowChildren = {}

                if a1 then
                    table.insert(rowChildren, UI.Panel {
                        flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 4,
                        padding = 8, backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = 8,
                        children = {
                            DS.Button(a1.label, function() doAction(navigate, a1.id, a1.payload) end, {
                                height = 34, fontSize = 12, variant = a1.prim and "primary" or "secondary"
                            }),
                            DS.Label(a1.desc, { fontSize = 9, fontColor = DS.C.muted, textAlign = "center" })
                        }
                    })
                end

                if a2 then
                    table.insert(rowChildren, UI.Panel {
                        flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 4,
                        padding = 8, backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = 8,
                        children = {
                            DS.Button(a2.label, function() doAction(navigate, a2.id, a2.payload) end, {
                                height = 34, fontSize = 12, variant = a2.prim and "primary" or "secondary"
                            }),
                            DS.Label(a2.desc, { fontSize = 9, fontColor = DS.C.muted, textAlign = "center" })
                        }
                    })
                end

                table.insert(gridPanels, UI.Panel {
                    width = "100%", flexDirection = "row", gap = 8, children = rowChildren
                })
            end

            for _, gp in ipairs(gridPanels) do
                table.insert(nodes, gp)
            end

            -- Pro Transition Gate Card
            if vs.lp >= 1000 or vs.phase >= 2 then
                table.insert(nodes, DS.Card {
                    backgroundColor = "#15241b", borderColor = DS.C.success,
                    children = {
                        DS.Label("🌟 达成 1,000 LP 千分王者！职业战队星探已递交试训合约！", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.success }),
                        DS.Button("出征职业联赛 (前往 Phase 2)", function()
                            game.phase = 2
                            game.unlocked_phases[2] = true
                            game.active_tab = "STAGE"
                            if navigate then navigate("esport_sim") end
                        end, { height = 36, fontSize = 12, marginTop = 4 })
                    }
                })
            else
                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label(string.format("🔒 职业赛场试训门槛: 达成 1000 LP (当前: %d/1000 LP)", vs.lp), { fontSize = 11, fontColor = DS.C.muted }),
                        makeBar(vs.lp / 10, DS.C.ember, 4),
                    }
                })
            end

        elseif curCareerSub == "SHOP" then
            -- ----------------------------------------------------------------
            -- SUBTAB: HARDWARE RIG & QUICK SHOP
            -- ----------------------------------------------------------------
            table.insert(nodes, DS.SectionHeader("🎧 职业选手硬件神装 (Hardware Rig)", "外设升级", nil))

            local ownedGear = {}
            for _, gid in ipairs(vs.inventory_gear or {}) do
                ownedGear[gid] = true
            end

            local gearList = Gear or {}
            for _, it in ipairs(gearList) do
                local isOwned = ownedGear[it.id]
                local canAfford = vs.money >= it.cost
                local statusTxt = isOwned and "✨ 已配备装载" or string.format("售价: $%d", it.cost)

                table.insert(nodes, DS.Card {
                    borderColor = isOwned and DS.C.success or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("🎮 %s", it.name), { fontSize = 12, fontWeight = "bold", fontColor = isOwned and DS.C.success or DS.C.text }),
                                DS.Label(statusTxt, { fontSize = 11, fontColor = isOwned and DS.C.success or DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("加成: 微操 +%d  |  心态稳定性 +%d  [%s]", it.mechanics_bonus or 0, it.mental_bonus or 0, it.category or "外设"),
                            { fontSize = 10, fontColor = DS.C.info }),
                        DS.Label(it.desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isOwned and DS.Button("✓ 装备已生效中", function() end, { height = 32, fontSize = 11, variant = "secondary" })
                                    or DS.Button(canAfford and string.format("🛒 购入装备 ($%d)", it.cost) or string.format("资金不足 (需 $%d)", it.cost), function()
                                        if canAfford then doAction(navigate, "BUY_GEAR", { gear_id = it.id }) end
                                    end, { height = 34, fontSize = 11, variant = canAfford and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end

            table.insert(nodes, DS.SectionHeader("🥤 战备应急便利店 (Quick Shop Consumables)", "即时回血", nil))

            local quickCatalog = TapTapGame.QUICK_SHOP_CATALOG or {}
            for _, it in ipairs(quickCatalog) do
                local canAfford = vs.money >= it.cost
                table.insert(nodes, DS.Card {
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("⚡ %s", it.name), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                                DS.Label(string.format("$%d", it.cost), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("效能: 专注 +%d%%  |  精力 +%d%%  |  心态 +%d%%", it.focus or 0, it.energy or 0, it.mental or 0),
                            { fontSize = 10, fontColor = DS.C.info }),
                        DS.Label(it.desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                            children = {
                                DS.Button("⚡ 立即使用", function()
                                    if canAfford then doAction(navigate, "QUICK_SHOP", { item_id = it.id, immediate_use = true }) end
                                end, { height = 32, fontSize = 11, flexGrow = 1, variant = canAfford and "primary" or "secondary" }),
                                DS.Button("🎒 存入背包", function()
                                    if canAfford then doAction(navigate, "QUICK_SHOP", { item_id = it.id, immediate_use = false }) end
                                end, { height = 32, fontSize = 11, flexGrow = 1, variant = "secondary" }),
                            }
                        }
                    }
                })
            end

        elseif curCareerSub == "AGENCY" then
            -- ----------------------------------------------------------------
            -- SUBTAB: PLAYER AGENCY & SPONSORSHIPS
            -- ----------------------------------------------------------------
            table.insert(nodes, DS.SectionHeader("🤝 选手经纪人与商业合作 (Agency & Sponsors)", "商业运作", nil))

            local curAgentId = vs.agency and vs.agency.hired_agent
            local curAgentConf = curAgentId and TapTapGame.AGENTS_CONFIG[curAgentId]

            if curAgentConf then
                table.insert(nodes, DS.Card {
                    backgroundColor = "#121d17", borderColor = DS.C.success,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("⭐ 现任专属经纪人: %s", curAgentConf.name), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.success }),
                                DS.Label(curAgentConf.title, { fontSize = 11, fontColor = DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("核心特权: 【%s】  |  商业赞助溢价率: +%d%%", curAgentConf.perk, math.floor(curAgentConf.bonus_rate * 100)), { fontSize = 11, fontColor = DS.C.info }),
                        DS.Label(string.format("被动每知名度分红: $%.1f/场  |  累计带来商业收益: $%d", curAgentConf.passive_per_fame, vs.agency.total_earned or 0), { fontSize = 10, fontColor = DS.C.muted }),
                        DS.Button("📋 解除专属经纪合约", function()
                            doAction(navigate, "FIRE_AGENT", nil)
                        end, { height = 32, fontSize = 11, variant = "secondary", marginTop = 4 })
                    }
                })
            else
                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label("📋 暂无签约专属经纪人", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label("签约知名经纪人可激活商业溢价谈判、粉丝被动收入与各大品牌赞助推介！", { fontSize = 10, fontColor = DS.C.muted }),
                    }
                })
            end

            -- Agent Recruitment List
            table.insert(nodes, DS.SectionHeader("🌟 经纪公司人选签约", nil, nil))
            for k, ag in pairs(TapTapGame.AGENTS_CONFIG or {}) do
                local isHired = (curAgentId == k)
                local fameOk = (vs.fame or 0) >= ag.fame_req
                local moneyOk = vs.money >= ag.cost
                table.insert(nodes, DS.Card {
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("%s (%s)", ag.name, ag.title), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                                DS.Label(string.format("佣金: $%d", ag.cost), { fontSize = 11, fontColor = DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("要求知名度: %d  |  特权: 【%s】 (溢价 +%d%%)", ag.fame_req, ag.perk, math.floor(ag.bonus_rate * 100)), { fontSize = 10, fontColor = DS.C.info }),
                        DS.Label(ag.bio or "", { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isHired and DS.Button("✓ 当前已签约", function() end, { height = 32, fontSize = 11, variant = "secondary" })
                                    or DS.Button((fameOk and moneyOk) and string.format("🤝 签约聘用 ($%d)", ag.cost)
                                        or (not fameOk and string.format("知名度不足 (需 %d)", ag.fame_req) or string.format("资金不足 (需 $%d)", ag.cost)),
                                        function()
                                            if fameOk and moneyOk then doAction(navigate, "HIRE_AGENT", { agent_id = k }) end
                                        end, { height = 34, fontSize = 11, variant = (fameOk and moneyOk) and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end

            -- Sponsorships List
            table.insert(nodes, DS.SectionHeader("💼 顶级商业赞助合约", nil, nil))
            local signedSponsors = {}
            for _, spId in ipairs((vs.agency and vs.agency.signed_sponsors) or {}) do
                signedSponsors[spId] = true
            end

            for _, sp in ipairs(TapTapGame.SPONSORSHIPS_CONFIG or {}) do
                local isSigned = signedSponsors[sp.id]
                local fameOk = (vs.fame or 0) >= sp.fame_req
                table.insert(nodes, DS.Card {
                    borderColor = isSigned and DS.C.success or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("🏷️ %s [%s]", sp.brand, sp.category), { fontSize = 12, fontWeight = "bold", fontColor = isSigned and DS.C.success or DS.C.text }),
                                DS.Label(isSigned and "✓ 合作生效中" or string.format("签约金: $%d", sp.signing_bonus), { fontSize = 11, fontColor = isSigned and DS.C.success or DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("知名度门槛: %d  |  每场底薪: $%d  |  %s", sp.fame_req, sp.base_payout, sp.desc), { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isSigned and DS.Button("✓ 赞助分红按场发放中", function() end, { height = 32, fontSize = 11, variant = "secondary" })
                                    or DS.Button(fameOk and string.format("✍️ 签署赞助合约 (首笔预付 +$%d)", sp.signing_bonus)
                                        or string.format("知名度不足 (需 %d 点)", sp.fame_req),
                                        function()
                                            if fameOk then doAction(navigate, "SIGN_SPONSOR", { sponsor_id = sp.id }) end
                                        end, { height = 34, fontSize = 11, variant = fameOk and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end

        elseif curCareerSub == "STREAM" then
            -- ----------------------------------------------------------------
            -- SUBTAB: STREAMING MILESTONES & EMOTES
            -- ----------------------------------------------------------------
            local sc = vs.stream_channel or {}
            local subs = sc.subscribers or 15
            local viewers = sc.peak_viewers or 50

            table.insert(nodes, DS.SectionHeader("🔴 高分直播间与粉丝特权", "直播经济", nil))

            table.insert(nodes, DS.Card {
                backgroundColor = "#1b1424", borderColor = "#c08bff",
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(string.format("📺 【%s 直播间】实时数据", vs.player_name or "Prodigy"), { fontSize = 13, fontWeight = "bold", fontColor = "#c08bff" }),
                            DS.Label(string.format("🔥 订阅粉丝: %d 人", subs), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        }
                    },
                    DS.Label(string.format("历史峰值人气: %d 人  |  当前直播打赏底薪: $%d/场", viewers, (sc.base_donation or 30)), { fontSize = 10, fontColor = DS.C.text }),
                    DS.Button("🔴 开启一局巅峰峡谷直播 (Stream Bootcamp)", function()
                        doAction(navigate, "STREAM", nil)
                    end, { height = 36, fontSize = 12, marginTop = 4 })
                }
            })

            -- Streaming Milestones List
            table.insert(nodes, DS.SectionHeader("🏆 订阅人数里程碑与独家特权", nil, nil))

            local streamMilestones = StreamingMilestones and StreamingMilestones.CATALOG or {}
            local claimedMilestones = sc.claimed_milestones or {}
            local claimedMap = {}
            for _, cid in ipairs(claimedMilestones) do claimedMap[cid] = true end

            for _, m in ipairs(streamMilestones) do
                local isClaimed = claimedMap[m.id]
                local isReady = (subs >= m.req) and (not isClaimed)
                table.insert(nodes, DS.Card {
                    borderColor = isClaimed and DS.C.success or (isReady and DS.C.gold or DS.C.border),
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("%s (%d 订阅)", m.title, m.req), { fontSize = 12, fontWeight = "bold", fontColor = isClaimed and DS.C.success or DS.C.text }),
                                DS.Label(m.badge or "", { fontSize = 11, fontColor = DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("特权: %s - %s", m.perk_name, m.perk_summary), { fontSize = 10, fontColor = DS.C.info }),
                        DS.Label(string.format("专属表情: %s %s [%s]  |  奖励金: +$%d, 知名度: +%d",
                            m.emote_char or "👏", m.emote_name, m.emote_rarity, m.reward_cash, m.reward_fame), { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isClaimed and DS.Button("✨ 特权与表情已永久激活", function() end, { height = 32, fontSize = 11, variant = "secondary" })
                                    or DS.Button(isReady and "🎁 立即领取里程碑特权" or string.format("🔒 尚未达成 (差 %d 订阅)", m.req - subs), function()
                                        if isReady then doAction(navigate, "CLAIM_STREAM_MILESTONE", { milestone_id = m.id }) end
                                    end, { height = 34, fontSize = 11, variant = isReady and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end
        end

    elseif curTab == "STAGE" then
        -- --------------------------------------------------------------------
        -- TAB 2: PRO LEAGUE STAGE & 5v5 BP
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("🏟️ 职业联赛与 5v5 BP 赛场 (Stage)", "职业赛程", nil))

        if vs.phase < 2 then
            table.insert(nodes, DS.Card {
                children = {
                    DS.Label("🔒 职业赛场尚未解锁", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                    DS.Label("入场资格: 在单排天梯达成 1000 LP (王者段位)！", { fontSize = 11, fontColor = DS.C.muted }),
                    DS.Button("🌟 快捷签约加入职业战队 (进入 Phase 2)", function()
                        game.phase = 2
                        game.unlocked_phases[2] = true
                        if navigate then navigate("esport_sim") end
                    end, { height = 36, fontSize = 12, marginTop = 6 }),
                }
            })
        else
            local curStageSub = game.stage_subtab or "LEAGUE"
            local stageSubtabs = {
                { id = "LEAGUE", label = "🏟️ 联赛BP" },
                { id = "DRILL",  label = "🧩 残局沙盘" },
                { id = "RADAR",  label = "📊 五维雷达" },
                { id = "META",   label = "📜 版本梯度" },
            }

            local sSubButtons = {}
            for _, sst in ipairs(stageSubtabs) do
                local isSubActive = (curStageSub == sst.id)
                table.insert(sSubButtons, UI.Button {
                    text = sst.label,
                    flexGrow = 1, flexBasis = 0, height = 30,
                    fontSize = 11, fontWeight = isSubActive and "bold" or "normal",
                    backgroundColor = isSubActive and "#38bdf8" or DS.C.surfaceAlt,
                    textColor = isSubActive and "#0c1524" or DS.C.text,
                    borderWidth = 1, borderColor = isSubActive and "#38bdf8" or DS.C.border, borderRadius = 6,
                    onClick = function()
                        game.stage_subtab = sst.id
                        if navigate then navigate("esport_sim") end
                    end
                })
            end

            table.insert(nodes, UI.Panel {
                width = "100%", flexDirection = "row", gap = 6, marginTop = 4, children = sSubButtons
            })

            if curStageSub == "LEAGUE" then
                -- Pro Team Roster Overview
                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label("⭐ 战队主力阵容与综合战力评估", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                        DS.Label("上单: 70  |  打野: 74  |  中单(你): 80  |  射手: 72  |  辅助: 68", { fontSize = 11, fontColor = DS.C.info }),
                        DS.Label("战队综合战力: 72.8  |  联赛常规赛积分: 12胜 2负 (榜首)", { fontSize = 11, fontColor = DS.C.success }),
                        DS.Label(string.format("荣誉奖杯: %s  |  %s",
                            game.trophies.regional_champ and "🏆 银龙杯已捧起" or "银龙杯角逐中",
                            game.trophies.worlds_cup and "🌍 召唤师杯已斩获" or "世界赛备战中"),
                            { fontSize = 10, fontColor = DS.C.gold }),
                    }
                })

                -- Stage Action List
                local stageActions = {
                    { id = "PLAY_STAGE_MATCH", label = "🏟️ 出征职业联赛常规赛 (Play Stage Match)", desc = "5v5 对局战术博弈，斩获联赛积分与 MVP 评分" },
                    { id = "SCOUT_TEAM", label = "🔍 战术刺探豪门弱点 (Scout T1)", desc = "刺探破解敌方体系，激活面对该队 +8% 战力加成", payload = { team_id = "T1" } },
                    { id = "SCRIM_TEAM", label = "🥊 约战 GEN 顶级战术训练赛 (Scrim GEN)", desc = "约战全球第3名豪门，磨练团战协同与战术体系", payload = { team_id = "GEN" } },
                    { id = "WORLDS_FINALS", label = "🏆 决战召唤师全球总决赛 (Worlds Finals)", desc = "巅峰决战出征全球总决赛，捧起最高荣誉奖杯" },
                    { id = "RETIRE_AND_BUY_ORG", label = "👑 退役挂靴注资收购俱乐部 (进入 Phase 3)", desc = "斥资 $1,000,000 收购电竞战队，进军俱乐部商业王朝" },
                }

                for _, sa in ipairs(stageActions) do
                    table.insert(nodes, DS.Card {
                        children = {
                            DS.Button(sa.label, function() doAction(navigate, sa.id, sa.payload) end, { height = 36, fontSize = 12 }),
                            DS.Label(sa.desc, { fontSize = 10, fontColor = DS.C.muted }),
                        }
                    })
                end

            elseif curStageSub == "DRILL" then
                -- Daily Tactical BP Drill Subtab
                table.insert(nodes, DS.SectionHeader("🧩 每日教练战术 BP 残局沙盘特训", "BP 战术对局", nil))

                local drillData = vs.tactical_bp_drill or {}
                local puzzles = drillData.all_puzzles or {}
                local solvedMap = drillData.solved or {}
                local activeBuff = drillData.active_buff

                if activeBuff then
                    table.insert(nodes, DS.Card {
                        backgroundColor = "#0e1c18", borderColor = DS.C.success,
                        children = {
                            DS.Label("✨【残局特训加成生效中】" .. activeBuff.buffLabel, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.success }),
                            DS.Label(string.format("克制战术加成: +%d%% 局内战力 | 生效至本日赛程结束", activeBuff.winRateBonus or 15), { fontSize = 10, fontColor = DS.C.gold })
                        }
                    })
                end

                for _, pz in ipairs(puzzles) do
                    local isSolved = solvedMap[pz.id]
                    table.insert(nodes, DS.Card {
                        borderColor = isSolved and DS.C.success or DS.C.border,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(string.format("%s %s", pz.targetTheme or "⚔️", pz.title), { fontSize = 12, fontWeight = "bold", fontColor = isSolved and DS.C.success or DS.C.text }),
                                    DS.Label(isSolved and "✓ 已破解" or "待沙盘演练", { fontSize = 10, fontColor = isSolved and DS.C.success or DS.C.gold })
                                }
                            },
                            DS.Label("战局情景: " .. (pz.scenario or ""), { fontSize = 10, fontColor = DS.C.muted, marginTop = 2 }),
                            UI.Panel {
                                width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                                children = {
                                    DS.Label("🔴 敌方禁选: " .. table.concat(pz.enemyPicks or {}, ", "), { fontSize = 10, fontColor = "#f87171" }),
                                    DS.Label("🔵 克制阵眼: " .. table.concat(pz.correctCounters or {}, ", "), { fontSize = 10, fontColor = "#38bdf8" })
                                }
                            },
                            DS.Label("💡 破解思路: " .. (pz.tacticalKey or ""), { fontSize = 9, fontColor = DS.C.info, marginTop = 2 }),
                            DS.Button(isSolved and "✓ 重新演练该残局" or "⚡ 立即推演破解残局", function()
                                doAction(navigate, "SOLVE_BP_DRILL", { drill_id = pz.id })
                            end, { height = 32, fontSize = 11, variant = isSolved and "secondary" or "primary", marginTop = 4 })
                        }
                    })
                end

            elseif curStageSub == "RADAR" then
                -- Scout Intel 5-Cluster Radar & Heatmap Subtab
                table.insert(nodes, DS.SectionHeader("📊 战术情报五维聚类雷达与三模对标", "情报刺探", nil))

                local radarData = vs.scout_radar or {}
                local curMode = radarData.mode or "SELF"
                local rivalId = radarData.rival_id or "t1"

                -- 3 Modes Switcher
                local modes = {
                    { id = "SELF",   label = "👤 本队基准" },
                    { id = "LEAGUE", label = "🌐 联赛平均" },
                    { id = "RIVAL",  label = "⚡ 宿敌对标 (T1)" },
                }
                local mButtons = {}
                for _, m in ipairs(modes) do
                    local isMActive = (curMode == m.id)
                    table.insert(mButtons, UI.Button {
                        text = m.label,
                        flexGrow = 1, flexBasis = 0, height = 28,
                        fontSize = 11, fontWeight = isMActive and "bold" or "normal",
                        backgroundColor = isMActive and DS.C.gold or DS.C.surfaceAlt,
                        textColor = isMActive and "#1a0e08" or DS.C.text,
                        borderColor = isMActive and DS.C.gold or DS.C.border,
                        borderWidth = 1, borderRadius = 6,
                        onClick = function()
                            doAction(navigate, "SET_SCOUT_RADAR_MODE", { mode = m.id, rival_id = rivalId })
                        end
                    })
                end
                table.insert(nodes, UI.Panel {
                    width = "100%", flexDirection = "row", gap = 6, children = mButtons
                })

                -- 5 Clusters Display
                local clusters = radarData.clusters or {
                    mechanics = 92, macro = 88, teamfight = 94, vision = 85, adaptability = 89
                }
                local clusterDefs = {
                    { key = "mechanics",    name = "对线微操 (Mechanics)",    val = clusters.mechanics or 90 },
                    { key = "macro",        name = "大局运营 (Macro Ops)",    val = clusters.macro or 85 },
                    { key = "teamfight",    name = "团战协同 (Teamfight)",    val = clusters.teamfight or 92 },
                    { key = "vision",       name = "视野压制 (Vision Control)", val = clusters.vision or 80 },
                    { key = "adaptability", name = "临场应变 (Adaptability)",   val = clusters.adaptability or 88 },
                }

                table.insert(nodes, DS.Card {
                    backgroundColor = "#0e1422", borderColor = DS.C.info,
                    children = {
                        DS.Label(string.format("📡 当前雷达模式: [%s 对标模式]", curMode), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                        DS.Label("战术分析组评级: S+ 级霸主体系 · 团战执行力与线权剥夺率极高", { fontSize = 10, fontColor = DS.C.muted })
                    }
                })

                for _, c in ipairs(clusterDefs) do
                    local grade = (c.val >= 93 and "S+") or ((c.val >= 88 and "S") or ((c.val >= 82 and "A+") or "A"))
                    local gradeCol = (grade == "S+" or grade == "S") and DS.C.gold or DS.C.info
                    table.insert(nodes, DS.Card {
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(c.name, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }),
                                    DS.Label(string.format("评分: %d [%s]", c.val, grade), { fontSize = 11, fontWeight = "bold", fontColor = gradeCol })
                                }
                            },
                            makeBar(c.val, gradeCol, 6)
                        }
                    })
                end

            elseif curStageSub == "META" then
                -- Current Meta Patch & Tier List Showcase
                if vs.meta_tier_list then
                    local mtl = vs.meta_tier_list
                    table.insert(nodes, DS.SectionHeader("📜 当前版本梯度与 BP 战术风向", mtl.version or "Patch 14.19", nil))
                    table.insert(nodes, DS.Card {
                        backgroundColor = "#121722", borderColor = DS.C.info,
                        children = {
                            DS.Label(string.format("⚡ 【%s】%s", mtl.version, mtl.theme_title), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                            DS.Label(mtl.theme_desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                            DS.Label("💡 " .. (mtl.bp_tactical_tip or ""), { fontSize = 10, fontColor = DS.C.gold }),
                        }
                    })

                    -- Show top meta champions
                    for _, ch in ipairs(mtl.champions or {}) do
                        local tierCol = (ch.tier == "T0") and DS.C.gold or ((ch.tier == "T1") and DS.C.success or DS.C.muted)
                        table.insert(nodes, DS.Card {
                            children = {
                                UI.Panel {
                                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                    children = {
                                        DS.Label(string.format("%s [%s] %s (%s)", ch.icon or "⚔️", ch.tier or "T0", ch.name, ch.role),
                                            { fontSize = 12, fontWeight = "bold", fontColor = tierCol }),
                                        DS.Label(string.format("胜率: %.1f%%  |  BP率: %.1f%%", ch.win_rate or 50, ch.pb_rate or 50),
                                            { fontSize = 10, fontColor = DS.C.info }),
                                    }
                                },
                                DS.Label(string.format("体系协同: %s  [%s]", ch.synergy or "", ch.buff or ""),
                                    { fontSize = 10, fontColor = DS.C.textDim })
                            }
                        })
                    end
                end
            end
        end

    elseif curTab == "DYNASTY" then
        -- --------------------------------------------------------------------
        -- TAB 3: DYNASTY TYCOON & 4 MANAGEMENT SUBTABS
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("👑 传奇俱乐部王朝与商业运营 (Dynasty)", "俱乐部经营", nil))

        if vs.phase < 3 then
            table.insert(nodes, DS.Card {
                children = {
                    DS.Label("🔒 俱乐部王朝模式尚未解锁", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                    DS.Label("开启要求: 退役并注资 $1,000,000 收购电竞俱乐部！", { fontSize = 11, fontColor = DS.C.muted }),
                    DS.Label(string.format("当前个人储蓄: $%d / $1,000,000", vs.money), { fontSize = 11, fontColor = DS.C.success }),
                    makeBar(vs.money / 10000, DS.C.gold, 5),
                    DS.Button("👑 快捷注资收购俱乐部 (进入 Phase 3)", function()
                        game.phase = 3
                        game.unlocked_phases[3] = true
                        game.player.money = math.max(game.player.money, 1000000)
                        if navigate then navigate("esport_sim") end
                    end, { height = 36, fontSize = 12, marginTop = 6 }),
                }
            })
        else
            -- Dynasty Subtab Pills
            local curSub = game.dynasty_subtab or "OVERVIEW"
            local subtabs = {
                { id = "OVERVIEW",   label = "📊总盘" },
                { id = "EXPANSION",  label = "🌟选秀" },
                { id = "JERSEY",     label = "👕战袍" },
                { id = "BOOTCAMP",   label = "✈️特训" },
                { id = "DYNAMICS",   label = "⚔️阵型" },
                { id = "FACILITIES", label = "🏢基地" },
                { id = "ACADEMY",    label = "🎓青训" },
                { id = "COACH",      label = "💼股权" },
            }

            local subButtons = {}
            for _, st in ipairs(subtabs) do
                local isSubActive = (curSub == st.id)
                table.insert(subButtons, UI.Button {
                    text = st.label,
                    flexGrow = 1, flexBasis = 0, height = 32,
                    fontSize = 11, fontWeight = isSubActive and "bold" or "normal",
                    backgroundColor = isSubActive and DS.C.gold or DS.C.surfaceAlt,
                    textColor = isSubActive and "#1a0e08" or DS.C.text,
                    borderWidth = 1, borderColor = isSubActive and DS.C.gold or DS.C.border, borderRadius = 6,
                    onClick = function()
                        game.dynasty_subtab = st.id
                        if navigate then navigate("esport_sim") end
                    end
                })
            end

            table.insert(nodes, UI.Panel {
                width = "100%", flexDirection = "row", gap = 6, marginTop = 4, children = subButtons
            })

            if curSub == "OVERVIEW" then
                -- Financial Overview Card
                local budget = (game.dynasty_engine and game.dynasty_engine.budget) or 250000
                table.insert(nodes, DS.Card {
                    backgroundColor = "#121a15", borderColor = DS.C.success,
                    children = {
                        DS.Label(string.format("💰 俱乐部运营金库: $%d", budget), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.success }),
                        DS.Label("🌟 全球粉丝规模: 12.5 万人  |  商业赞助收益倍率: 1.08x", { fontSize = 11, fontColor = DS.C.gold }),
                        DS.Label("战队综合商业估值: $12,500,000  |  当前赛季胜场: 18 场", { fontSize = 10, fontColor = DS.C.text }),
                    }
                })

                -- Overview Action Cards
                local dActions = {
                    { id = "UPGRADE_MERCH_TECH", label = "🧪 战袍工坊: 升级面料材质科技 (Merch Lab)", desc = "研发蜂窝立体编织，提升周边好评度与综合收益倍率", payload = { tech_id = "fabric_tech" } },
                    { id = "OPEN_TRANSFER_WINDOW", label = "🔄 开启休赛期转会窗口 (Transfer Window)", desc = "启动全球选手交易市场，搜寻顶级自由人", payload = { split_name = "Spring" } },
                    { id = "BID_FREE_AGENT", label = "💰 竞标顶级自由人明星选手 (Bid Free Agent)", desc = "斥资 $80,000 竞标签约国际知名明星战力", payload = { fa_id = "fa_mid_faker", bid_amount = 80000 } },
                    { id = "RUN_COMMUNITY_CAMPAIGN", label = "📢 官博高光整活宣发 (Viral Memes PR)", desc = "公关团队发布超燃高光，新增全网关注粉丝 +8,500 人", payload = { campaign_id = "viral_clips" } },
                    { id = "SIGN_STAFF", label = "🤝 聘任首席战术分析师 Kramer ($10,000)", desc = "激活全队特权：豪门战术刺探准确度 +12%", payload = { staff_type = "analyst" } },
                    { id = "WORLDS_FINALS", label = "🏆 率队出征召唤师全球总决赛 (Worlds Finals)", desc = "带领全队出征世界之巅，争夺电竞至高荣誉" },
                }

                for _, da in ipairs(dActions) do
                    table.insert(nodes, DS.Card {
                        children = {
                            DS.Button(da.label, function() doAction(navigate, da.id, da.payload) end, { height = 36, fontSize = 12 }),
                            DS.Label(da.desc, { fontSize = 10, fontColor = DS.C.muted }),
                        }
                    })
                end

            elseif curSub == "BOOTCAMP" then
                -- Remote Bootcamp Subtab
                table.insert(nodes, DS.SectionHeader("✈️ 全球封闭特训营 (Remote Bootcamp)", "出征特训", nil))

                local activeCamp = vs.bootcamp and vs.bootcamp.active_bootcamp
                if activeCamp then
                    table.insert(nodes, DS.Card {
                        backgroundColor = "#12201b", borderColor = DS.C.success,
                        children = {
                            DS.Label(string.format("🔥【特训进行中】首发五虎正在【%s】进行高强度封闭淬炼！", activeCamp.location_name or "特训基地"),
                                { fontSize = 12, fontWeight = "bold", fontColor = DS.C.success }),
                            DS.Label(string.format("剩余特训天数: %d 天  |  世界赛决胜胜率加成: +%d%%",
                                activeCamp.days_left or 0, math.floor((activeCamp.win_rate_bonus or 0) * 100)), { fontSize = 11, fontColor = DS.C.gold }),
                            DS.Label(activeCamp.tactical_buff_desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                        }
                    })
                end

                local allLocations = (vs.bootcamp and vs.bootcamp.all_locations) or (TrainingCamp and TrainingCamp.getAllLocations()) or {}
                for _, loc in ipairs(allLocations) do
                    local canAfford = vs.money >= 50000
                    table.insert(nodes, DS.Card {
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(string.format("%s %s", loc.emoji or "✈️", loc.name), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                                    DS.Label("$50,000 / 7天", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                                }
                            },
                            DS.Label(string.format("地理: %s (%s)", loc.destination or "", loc.altitude_and_climate or ""), { fontSize = 10, fontColor = DS.C.info }),
                            DS.Label(string.format("专属特权: %s", loc.tactical_buff_desc or ""), { fontSize = 10, fontColor = DS.C.success }),
                            DS.Label(loc.description or "", { fontSize = 10, fontColor = DS.C.muted }),
                            DS.Button(canAfford and "✈️ 启动海外集训 (注资 $50,000)" or "资金不足 (需 $50,000)", function()
                                if canAfford then doAction(navigate, "START_BOOTCAMP", { location_id = loc.id }) end
                            end, { height = 34, fontSize = 11, variant = canAfford and "primary" or "secondary", marginTop = 4 })
                        }
                    })
                end

            elseif curSub == "DYNAMICS" then
                -- Team Dynamics Subtab
                table.insert(nodes, DS.SectionHeader("⚔️ 战队战术阵型与选手化学反应 (Team Dynamics)", "阵容羁绊", nil))

                local td = vs.team_dynamics
                if td then
                    table.insert(nodes, DS.Card {
                        backgroundColor = "#1b1424", borderColor = "#c08bff",
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(string.format("⭐ 当前核心阵型: %s", td.preset.name), { fontSize = 12, fontWeight = "bold", fontColor = "#c08bff" }),
                                    DS.Label(string.format("战力加成: +%d", td.synergy_power_bonus or 0), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                                }
                            },
                            DS.Label(string.format("全队平均化学反应: %d/100 · 协同评级: %s", td.average_chemistry, td.synergy_level), { fontSize = 11, fontColor = DS.C.info }),
                            DS.Label(td.preset.buff_label or "", { fontSize = 10, fontColor = DS.C.success }),
                        }
                    })
                end

                local allPresets = TeamDynamics and TeamDynamics.getAllPresets() or {}
                for _, pr in ipairs(allPresets) do
                    local isCur = (td and td.preset and td.preset.id == pr.id)
                    table.insert(nodes, DS.Card {
                        borderColor = isCur and DS.C.gold or DS.C.border,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(pr.name, { fontSize = 12, fontWeight = "bold", fontColor = isCur and DS.C.gold or DS.C.text }),
                                    DS.Label(pr.badge or "", { fontSize = 11, fontColor = DS.C.gold }),
                                }
                            },
                            DS.Label(pr.tagline or "", { fontSize = 10, fontColor = DS.C.info }),
                            DS.Label(pr.desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                            DS.Button(isCur and "✓ 当前采用中" or "⚔️ 切换为该战术阵型", function()
                                if not isCur then doAction(navigate, "SET_TACTICAL_PRESET", { preset_id = pr.id }) end
                            end, { height = 34, fontSize = 11, variant = isCur and "secondary" or "primary", marginTop = 4 })
                        }
                    })
                end

            elseif curSub == "FACILITIES" then
                -- Facilities Matrix Subtab
                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label("🏢 基地设施硬件矩阵 (Facilities Matrix)", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                        DS.Label("升级基地硬件全面提升队员训练增益、医疗康复与赞助估值", { fontSize = 10, fontColor = DS.C.muted }),
                    }
                })

                local facs = {
                    { id = "training",     name = "训练基地", desc = "训练微操经验 +15%/级", cost = 25000 },
                    { id = "medical",      name = "康复医疗室", desc = "伤病康复速度 +20%/级", cost = 20000 },
                    { id = "analysis",     name = "战术分析中心", desc = "情报刺探准确度 +12%/级", cost = 30000 },
                    { id = "business",     name = "商务发展司", desc = "赞助商分红回报 +10%/级", cost = 35000 },
                    { id = "gaming_house", name = "电竞总部大厦", desc = "俱乐部品牌估值 +$200W/级", cost = 50000 },
                }

                for _, f in ipairs(facs) do
                    local curLv = (game.facilities and game.facilities[f.id]) or 1
                    local isMax = curLv >= 3
                    local btnTxt = isMax and string.format("✨ %s (Lv 3 满级巅峰)", f.name)
                        or string.format("升级%s (Lv %d -> %d) · $%d", f.name, curLv, curLv + 1, f.cost * curLv)
                    table.insert(nodes, DS.Card {
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between",
                                children = {
                                    DS.Label(f.name .. " Lv." .. curLv .. "/3", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                                    DS.Label(f.desc, { fontSize = 10, fontColor = DS.C.gold }),
                                }
                            },
                            DS.Button(btnTxt, function()
                                if not isMax then doAction(navigate, "UPGRADE_FACILITY", { facility_id = f.id }) end
                            end, { height = 34, fontSize = 11, variant = isMax and "secondary" or "primary" })
                        }
                    })
                end

            elseif curSub == "ACADEMY" then
                -- Academy Subtab
                local traineeCnt = (game.academy and game.academy.trainees and #game.academy.trainees) or 0
                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label("🎓 青训梯队与新星孵化营 (Youth Academy)", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label(string.format("在训青训选手: %d / 5 位  |  每次星探搜寻资金: $15,000", traineeCnt), { fontSize = 10, fontColor = DS.C.muted }),
                        DS.Button("🔍 派遣金牌星探深入高校联赛搜寻新星 ($15,000)", function()
                            doAction(navigate, "SCOUT_ACADEMY_TRAINEE", nil)
                        end, { height = 36, fontSize = 12, marginTop = 4 }),
                    }
                })

                if traineeCnt == 0 then
                    table.insert(nodes, DS.EmptyState("青训营暂无在训新人", "点击上方按钮派遣星探，发掘拥有 S/A 级潜力的超新星！"))
                else
                    for i = 1, math.min(4, traineeCnt) do
                        local t = game.academy.trainees[i]
                        local tTier = t.tier or t.grade or "B"
                        local tierCol = (tTier == "S") and DS.C.gold or ((tTier == "A") and "#c08bff" or DS.C.info)
                        table.insert(nodes, DS.Card {
                            children = {
                                UI.Panel {
                                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                    children = {
                                        DS.Label(string.format("⭐ [%s级] %s (%s)", tTier, t.name, t.role), { fontSize = 12, fontWeight = "bold", fontColor = tierCol }),
                                        DS.Button("提拔首发", function()
                                            doAction(navigate, "PROMOTE_TRAINEE", { trainee_id = t.id })
                                        end, { height = 28, fontSize = 11 })
                                    }
                                },
                                DS.Label(string.format("微操基础: %d  |  潜力上限: %d  |  竞技状态: %d%%",
                                    t.mechanics or 70, t.potential or 80, t.form or 100), { fontSize = 10, fontColor = DS.C.muted })
                            }
                        })
                    end
                end

            elseif curSub == "COACH" then
                -- Board & Equity Subtab
                local trust = (game.coach and game.coach.trust) or 75
                local eq = (game.coach and game.coach.equity) or 15
                local eqStatus = (eq >= 100 and "👑 独资财阀") or ((eq >= 51 and "👑 绝对控股大股东") or "少数合伙人")

                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label("💼 教练执委会与俱乐部股权 (Board & Equity)", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                        DS.Label(string.format("董事会信任度: %d%%", trust), { fontSize = 11, fontColor = DS.C.text }),
                        makeBar(trust, DS.C.success, 5),
                        DS.Label(string.format("个人持股比例: %d%% (%s)", eq, eqStatus), { fontSize = 11, fontColor = DS.C.gold, marginTop = 4 }),
                        makeBar(eq, DS.C.gold, 5),
                    }
                })

                local coachActions = {
                    { id = "COACH_PROPOSAL", label = "📋 向董事会申请 $100,000 战术引援预算", desc = "消耗 5 点信任度，向投资方申请专项引援注资", payload = { proposal_id = "request_funds" } },
                    { id = "COACH_BUY_EQUITY", label = "💼 个人出资回购 5% 股权 (目标: 51% 控股)", desc = "耗资个人储蓄回购战队股权，逐步实现绝对控股", payload = { shares_pct = 5 } },
                    { id = "SIGN_STAFF", label = "🤝 聘任金牌冠军教头 Homme ($15,000)", desc = "BP 克制加成 +10%，关键局胜率提升", payload = { staff_type = "head_coach" } },
                    { id = "SIGN_STAFF", label = "🩺 聘任运动医学博士 Dr. Kang ($8,000)", desc = "选手高强度训练伤病发生率降低 50%", payload = { staff_type = "physio" } },
                }

                for _, ca in ipairs(coachActions) do
                    table.insert(nodes, DS.Card {
                        children = {
                            DS.Button(ca.label, function() doAction(navigate, ca.id, ca.payload) end, { height = 36, fontSize = 12 }),
                            DS.Label(ca.desc, { fontSize = 10, fontColor = DS.C.muted }),
                        }
                    })
                end

            elseif curSub == "EXPANSION" then
                -- League Expansion Draft Subtab
                table.insert(nodes, DS.SectionHeader("🌟 联盟扩军特权选秀协议", "特权选秀", nil))

                local expData = vs.expansion_draft or {}
                local franchiseName = expData.expansionFranchiseName or "极光新纪元 (Aurora Gaming)"
                local currentYear = expData.currentYear or 2026
                local protectedCount = expData.protectedPlayerIds and #expData.protectedPlayerIds or 3
                local isDraftAvail = expData.isDraftAvailable ~= false

                table.insert(nodes, DS.Card {
                    backgroundColor = "#0e1a26", borderColor = DS.C.info,
                    children = {
                        DS.Label(string.format("🏛️ 【%d 扩军特权备忘录】新军加盟: %s", currentYear, franchiseName), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                        DS.Label("联盟席位扩军至 18 支战队！各队享有 3 名核心基石选手豁免保护权，未保护战力与年度超新星进入选秀池！", { fontSize = 10, fontColor = DS.C.muted }),
                        DS.Label(string.format("🛡️ 俱乐部保护名单: 首发 %d 人已锁定豁免 | 选秀顺位状态: %s", protectedCount, isDraftAvail and "🟢 待摘牌" or "🔴 已完成签约"), { fontSize = 10, fontColor = DS.C.gold }),
                        DS.Button("🔒 签署并锁定首发核心 3 人豁免名单", function()
                            doAction(navigate, "EXPANSION_DRAFT", { isProtect = true, protectedIds = { "p_mid", "p_adc", "p_jug" } })
                        end, { height = 32, fontSize = 11, marginTop = 4 })
                    }
                })

                local prodigiesList = {
                    { id = "prodigy-mid-1", name = "顾清锋", alias = "峡谷第一刺客 · 绝影", role = "MID", avatar = "🗡️", mechanics = 96, macro = 86, bonus = 35000, trait = "初生牛犊不畏虎: 生死战极限操作 +18%" },
                    { id = "prodigy-jug-1", name = "朴俊熙 (Lucid)", alias = "韩服1700分路人王", role = "JUG", avatar = "⚡", mechanics = 93, macro = 94, bonus = 32000, trait = "神算野区掌控: 控龙率高达 88%" },
                    { id = "prodigy-adc-1", name = "林星辞 (ViperX)", alias = "极限走A机器", role = "ADC", avatar = "🎯", mechanics = 97, macro = 83, bonus = 38000, trait = "狂暴收割本能: 残血绝境收割输出 +22%" },
                    { id = "prodigy-top-1", name = "钟天岳 (Aegis)", alias = "叹息之壁", role = "TOP", avatar = "🛡️", mechanics = 88, macro = 95, bonus = 28000, trait = "不灭铁骨磐石: 承伤容错率 +25%" },
                    { id = "prodigy-sup-1", name = "白羽舟 (MingKey)", alias = "战场总导演", role = "SUP", avatar = "🔮", mechanics = 90, macro = 96, bonus = 26000, trait = "奇迹开团先知: 视野掌控与完美开团 +20%" },
                    { id = "prodigy-mid-2", name = "洛子安 (Aether)", alias = "空间魔术师", role = "MID", avatar = "🌌", mechanics = 95, macro = 89, bonus = 34000, trait = "灵动移形换位: 对线压制与残血反杀 +16%" }
                }

                local draftedMap = {}
                for _, dp in ipairs(expData.draftedProdigies or {}) do
                    draftedMap[dp.id or dp.name] = true
                end

                for _, p in ipairs(prodigiesList) do
                    local isDrafted = draftedMap[p.id] or draftedMap[p.name]
                    table.insert(nodes, DS.Card {
                        borderColor = isDrafted and DS.C.gold or DS.C.border,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(string.format("%s %s · %s [%s]", p.avatar, p.name, p.alias, p.role), { fontSize = 12, fontWeight = "bold", fontColor = isDrafted and DS.C.gold or DS.C.text }),
                                    DS.Label(isDrafted and "👑 已签约入队" or string.format("签字费: $%d", p.bonus), { fontSize = 11, fontColor = isDrafted and DS.C.gold or DS.C.info })
                                }
                            },
                            DS.Label(string.format("微操战力: %d | 大局观: %d | 潜力评级: SSS (99)", p.mechanics, p.macro), { fontSize = 10, fontColor = DS.C.muted }),
                            DS.Label("⭐ 特质特权: " .. p.trait, { fontSize = 10, fontColor = DS.C.gold }),
                            DS.Button(isDrafted and "✓ 本届已签下该超新星" or "🌟 行使选秀特权摘牌签约", function()
                                if not isDrafted then
                                    doAction(navigate, "EXPANSION_DRAFT", { isDraft = true, prodigyId = p.id })
                                end
                            end, { height = 34, fontSize = 11, variant = isDrafted and "secondary" or "primary", marginTop = 4 })
                        }
                    })
                end

            elseif curSub == "JERSEY" then
                -- Jersey Customizer Studio Subtab
                table.insert(nodes, DS.SectionHeader("👕 战队定制战袍工坊与周边商业化", "定制战袍", nil))

                local js = vs.jersey_studio or {
                    pattern = "cyber_stripes", crest = "cyber_phoenix", colorPreset = "暗影霓虹 (Cyber Shadow)",
                    priceTier = "pro_player_edition", hypeScore = 80, weeklyUnits = 320, projectedRevenue = 47680, weeklyProfit = 33280
                }

                table.insert(nodes, DS.Card {
                    backgroundColor = "#121b24", borderColor = DS.C.info,
                    children = {
                        DS.Label("🎨【当前战袍配置】" .. (js.pattern or "竞速光芒") .. " · " .. (js.crest or "赛博不死鸟"), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                        DS.Label(string.format("商业定价档位: %s  |  定制配色: %s", js.priceTier or "职业选手同款", js.colorPreset or "暗影霓虹"), { fontSize = 10, fontColor = DS.C.muted }),
                        DS.Label(string.format("🔥 粉丝狂热度 Hype: %d / 100", js.hypeScore or 80), { fontSize = 11, fontColor = DS.C.gold, marginTop = 4 }),
                        makeBar(js.hypeScore or 80, DS.C.gold, 6),
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", marginTop = 4,
                            children = {
                                DS.Label(string.format("📦 周预计出货: %d 件", js.weeklyUnits or 320), { fontSize = 10, fontColor = DS.C.text }),
                                DS.Label(string.format("💰 周预计营业额: +$%d", js.projectedRevenue or 47680), { fontSize = 10, fontColor = DS.C.success }),
                            }
                        }
                    }
                })

                -- Patterns Selection
                table.insert(nodes, DS.Label("📐 1. 选择战袍前沿科技材质纹理 (Pattern):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold, marginTop = 4 }))
                local patterns = {
                    { id = "solid", name = "纯粹极简", hype = 0 },
                    { id = "carbon_fiber", name = "碳纤维几何", hype = 8 },
                    { id = "neon_grid", name = "霓虹矩阵", hype = 12 },
                    { id = "cyber_stripes", name = "竞速光芒", hype = 10 },
                    { id = "geometric_camo", name = "数码迷彩", hype = 11 },
                    { id = "lightning_split", name = "雷霆裂变", hype = 14 },
                    { id = "gold_hex", name = "至尊金蜂巢", hype = 18 },
                }
                local patBtns = {}
                for _, p in ipairs(patterns) do
                    local isSel = (js.pattern == p.id)
                    table.insert(patBtns, UI.Button {
                        text = string.format("%s (+%d)", p.name, p.hype),
                        height = 28, fontSize = 10,
                        backgroundColor = isSel and DS.C.gold or DS.C.surfaceAlt,
                        textColor = isSel and "#1a0e08" or DS.C.text,
                        borderColor = isSel and DS.C.gold or DS.C.border,
                        borderWidth = 1, borderRadius = 4,
                        onClick = function()
                            doAction(navigate, "CUSTOMIZE_JERSEY", { pattern = p.id })
                        end
                    })
                end
                table.insert(nodes, UI.Panel {
                    width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 4, children = patBtns
                })

                -- Crests Selection
                table.insert(nodes, DS.Label("🛡️ 2. 选择战队精神队徽徽章 (Crest):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.info, marginTop = 6 }))
                local crests = {
                    { id = "dragon_flame", name = "炽焰炎龙 🐉", hype = 5 },
                    { id = "cyber_phoenix", name = "赛博不死鸟 🦅", hype = 8 },
                    { id = "apex_tiger", name = "绝巅白虎 🐯", hype = 7 },
                    { id = "iron_shield", name = "守望重盾 🛡️", hype = 6 },
                }
                local crestBtns = {}
                for _, c in ipairs(crests) do
                    local isSel = (js.crest == c.id)
                    table.insert(crestBtns, UI.Button {
                        text = string.format("%s (+%d)", c.name, c.hype),
                        flexGrow = 1, flexBasis = 0, height = 28, fontSize = 10,
                        backgroundColor = isSel and "#38bdf8" or DS.C.surfaceAlt,
                        textColor = isSel and "#0c1524" or DS.C.text,
                        borderColor = isSel and "#38bdf8" or DS.C.border,
                        borderWidth = 1, borderRadius = 4,
                        onClick = function()
                            doAction(navigate, "CUSTOMIZE_JERSEY", { crest = c.id })
                        end
                    })
                end
                table.insert(nodes, UI.Panel {
                    width = "100%", flexDirection = "row", gap = 4, children = crestBtns
                })

                -- Pricing Tier Selection
                table.insert(nodes, DS.Label("🏷️ 3. 商业周边定价策略 (Pricing Tier):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.success, marginTop = 6 }))
                local tiers = {
                    { id = "fan_edition", name = "大众助威版 ($69)", desc = "薄利多销 · 销量 1.6x" },
                    { id = "pro_player_edition", name = "职业同款 ($149)", desc = "标准售价 · 科技立体剪裁" },
                    { id = "collector_golden_box", name = "至尊礼盒 ($299)", desc = "纯金绣线 · 签名证书" },
                }
                for _, t in ipairs(tiers) do
                    local isSel = (js.priceTier == t.id)
                    table.insert(nodes, DS.Card {
                        borderColor = isSel and DS.C.success or DS.C.border,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(t.name, { fontSize = 11, fontWeight = "bold", fontColor = isSel and DS.C.success or DS.C.text }),
                                    DS.Label(t.desc, { fontSize = 10, fontColor = DS.C.muted }),
                                }
                            },
                            DS.Button(isSel and "✓ 当前采用此商业策略" or "💼 采用此商业定价", function()
                                doAction(navigate, "CUSTOMIZE_JERSEY", { priceTier = t.id })
                            end, { height = 28, fontSize = 10, variant = isSel and "secondary" or "primary", marginTop = 2 })
                        }
                    })
                end
            end
        end

    elseif curTab == "TOUR" then
        -- --------------------------------------------------------------------
        -- TAB 4: WORLD TOUR, POWER RANKINGS, TALENT TREE & LORE (4 SUBTABS)
        -- --------------------------------------------------------------------
        local curTourSub = game.tour_subtab or "TOUR"
        local tourTabs = {
            { id = "TOUR",     label = "🌍 巡回关卡" },
            { id = "RANKINGS", label = "📊 豪门榜" },
            { id = "RINGS",    label = "💍 神戒馆" },
            { id = "TALENTS",  label = "🧬 传承树" },
            { id = "LORE",     label = "📜 编年史" },
        }

        local tNavButtons = {}
        for _, tt in ipairs(tourTabs) do
            local isSubActive = (curTourSub == tt.id)
            table.insert(tNavButtons, UI.Button {
                text = tt.label,
                flexGrow = 1, flexBasis = 0, height = 30,
                fontSize = 11, fontWeight = isSubActive and "bold" or "normal",
                backgroundColor = isSubActive and "#c08bff" or DS.C.surfaceAlt,
                textColor = isSubActive and "#1a0e08" or DS.C.text,
                borderColor = isSubActive and "#c08bff" or DS.C.border,
                borderWidth = 1, borderRadius = 6,
                onClick = function()
                    game.tour_subtab = tt.id
                    if navigate then navigate("esport_sim") end
                end
            })
        end

        table.insert(nodes, UI.Panel {
            width = "100%", flexDirection = "row", gap = 6, marginTop = 2, children = tNavButtons
        })

        if curTourSub == "TOUR" then
            table.insert(nodes, DS.SectionHeader("🌍 无尽世界巡回赛挑战", "荣耀征途", nil))

            local curFloor = (game.world_tour_engine and game.world_tour_engine.current_floor) or 1
            table.insert(nodes, DS.Card {
                backgroundColor = "#1a1622", borderColor = "#c08bff",
                children = {
                    DS.Label(string.format("🌍【世界巡回赛】当前挑战关卡: 第 %d 层", curFloor), { fontSize = 13, fontWeight = "bold", fontColor = "#c08bff" }),
                    DS.Label("守关战队: [LPL] 巨浪 Dynasty  |  敌方综合战力: 75", { fontSize = 11, fontColor = DS.C.text }),
                    DS.Label("首通战利品: 名宿声望点数 +10, 专属战袍碎片", { fontSize = 10, fontColor = DS.C.gold }),
                    DS.Button("⚔️ 挑战巡回赛当前层 (Battle Tour)", function()
                        doAction(navigate, "BATTLE_WORLD_TOUR", nil)
                    end, { height = 36, fontSize = 12, marginTop = 4 })
                }
            })

            table.insert(nodes, DS.Card {
                children = {
                    DS.Label("✨ 名宿轮回转生 (Prestige Rebirth)", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.ember }),
                    DS.Label("结算当前周目所有战绩，斩获名宿点数开启下周目挑战！", { fontSize = 10, fontColor = DS.C.muted }),
                    DS.Button("荣登名宿殿堂 · 开启轮回", function()
                        doAction(navigate, "PRESTIGE_REBIRTH", { chosenEndingId = "dynasty_king" })
                    end, { height = 36, fontSize = 12, variant = "secondary" })
                }
            })

        elseif curTourSub == "RANKINGS" then
            table.insert(nodes, DS.SectionHeader("📊 全球 20 强豪门战队战力榜 (Global Power Rankings)", "全球刺探", nil))

            local teamsList = GlobalPowerRankings and GlobalPowerRankings.TEAMS or {}
            local scoutedMap = (game.power_rankings_engine and game.power_rankings_engine.scouted_teams) or {}

            for _, t in ipairs(teamsList) do
                local isScouted = scoutedMap[t.id] or scoutedMap[string.upper(t.id)] or scoutedMap[string.lower(t.id)]
                table.insert(nodes, DS.Card {
                    borderColor = isScouted and DS.C.info or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("#%d %s %s [%s]", t.rank, t.logo or "⚡", t.name, t.region),
                                    { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                                DS.Label(string.format("战力: %.1f (%s级)", t.pwr, t.tier or "S"),
                                    { fontSize = 11, fontWeight = "bold", fontColor = DS.C.info }),
                            }
                        },
                        DS.Label(string.format("战绩: %d胜 %d负 (%s)  |  战队稳定性: %d%%", t.wins or 0, t.losses or 0, t.streak or "连胜", t.consistency or 90),
                            { fontSize = 10, fontColor = DS.C.textDim }),
                        DS.Label("风格: " .. (t.playstyle or ""), { fontSize = 10, fontColor = DS.C.text }),
                        DS.Label("破绽: " .. (t.weakness or ""), { fontSize = 10, fontColor = isScouted and DS.C.success or DS.C.muted }),
                        UI.Panel {
                            width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                            children = {
                                DS.Button(isScouted and "✓ 已刺探 (+8%加成)" or "🔍 战术刺探", function()
                                    doAction(navigate, "SCOUT_TEAM", { team_id = t.short or t.id })
                                end, { height = 32, fontSize = 11, flexGrow = 1, variant = isScouted and "secondary" or "primary" }),
                                DS.Button("🥊 约战训练赛", function()
                                    doAction(navigate, "SCRIM_TEAM", { team_id = t.short or t.id })
                                end, { height = 32, fontSize = 11, flexGrow = 1, variant = "secondary" })
                            }
                        }
                    }
                })
            end

        elseif curTourSub == "RINGS" then
            table.insert(nodes, DS.SectionHeader("💍 五代冠军神戒陈列馆 (Championship Rings)", "至尊神戒", nil))

            local ringData = vs.championship_rings or {}
            local allRings = ringData.all or (ChampionshipRings and ChampionshipRings.getAllRings()) or {}
            local unlockedList = ringData.unlocked or { "ring_s10_origin" }
            local unlockedMap = {}
            for _, uid in ipairs(unlockedList) do unlockedMap[uid] = true end
            local equippedId = ringData.equipped or "ring_s10_origin"

            for _, ring in ipairs(allRings) do
                local isUnlocked = unlockedMap[ring.id]
                local isEquipped = (equippedId == ring.id)
                local rarityCol = (ring.rarity == "ETERNAL") and DS.C.gold or ((ring.rarity == "IMMORTAL") and "#c08bff" or DS.C.info)
                table.insert(nodes, DS.Card {
                    borderColor = isEquipped and DS.C.gold or (isUnlocked and rarityCol or DS.C.border),
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("%s %s", ring.gem_emoji or "💍", ring.name),
                                    { fontSize = 12, fontWeight = "bold", fontColor = isUnlocked and DS.C.gold or DS.C.muted }),
                                DS.Label(string.format("[%s] %s", ring.rarity or "MYTHIC", ring.season or ""),
                                    { fontSize = 10, fontWeight = "bold", fontColor = rarityCol }),
                            }
                        },
                        DS.Label(ring.title or "", { fontSize = 11, fontColor = DS.C.text }),
                        DS.Label(string.format("材质: %s", ring.material or ""), { fontSize = 10, fontColor = DS.C.muted }),
                        DS.Label(string.format("神戒加成: %s", ring.stats_buff and ring.stats_buff.desc or ""),
                            { fontSize = 10, fontColor = DS.C.success }),
                        DS.Label(ring.lore or "", { fontSize = 10, fontColor = DS.C.textDim }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isEquipped and DS.Button("✨ 当前正在佩戴加冕中", function() end, { height = 32, fontSize = 11, variant = "secondary" })
                                    or DS.Button(isUnlocked and "👑 加冕佩戴此枚神戒" or "🔒 尚未斩获全球总决赛该赛季冠军", function()
                                        if isUnlocked then doAction(navigate, "EQUIP_RING", { ring_id = ring.id }) end
                                    end, { height = 34, fontSize = 11, variant = isUnlocked and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end

        elseif curTourSub == "TALENTS" then
            local pe = vs.prestige or {}
            local pts = pe.prestige_points or 0
            local gen = pe.generation or 1

            table.insert(nodes, DS.SectionHeader("🧬 名宿轮回传承天赋树 (Legacy Passives)", "肉鸽天赋", nil))

            table.insert(nodes, DS.Card {
                backgroundColor = "#1a1622", borderColor = DS.C.gold,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(string.format("⚡ 轮回传承总池: %d 传承点数", pts), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                            DS.Label(string.format("当前周目: 第 %d 世 (x%.2f)", gen, pe.difficulty_multiplier or 1.0), { fontSize = 11, fontColor = "#c08bff" }),
                        }
                    },
                    DS.Label("消耗名宿传承点数参悟四大流派神级被动，天赋永久跨周目生效！", { fontSize = 10, fontColor = DS.C.muted }),
                }
            })

            local passives = PrestigeSystem and PrestigeSystem.LEGACY_PASSIVES or {}
            local unlockedMap = pe.unlocked_passives or {}

            for _, pass in ipairs(passives) do
                local isUnlocked = unlockedMap[pass.id]
                local canAfford = pts >= pass.cost
                table.insert(nodes, DS.Card {
                    borderColor = isUnlocked and DS.C.success or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("%s %s (阶位 %d)", pass.icon or "⚡", pass.name, pass.tier or 1),
                                    { fontSize = 12, fontWeight = "bold", fontColor = isUnlocked and DS.C.success or DS.C.text }),
                                DS.Label(isUnlocked and "✨ 已参悟激活" or string.format("需: %d 点", pass.cost),
                                    { fontSize = 11, fontColor = isUnlocked and DS.C.success or DS.C.gold }),
                            }
                        },
                        DS.Label("加成: " .. (pass.bonus or pass.desc or ""), { fontSize = 10, fontColor = DS.C.info }),
                        DS.Label(pass.desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isUnlocked and DS.Button("✓ 天赋永久生效中", function() end, { height = 30, fontSize = 11, variant = "secondary" })
                                    or DS.Button(canAfford and string.format("⚡ 参悟解锁 (%d 点数)", pass.cost) or string.format("传承点数不足 (差 %d)", pass.cost - pts),
                                        function()
                                            if canAfford then doAction(navigate, "UNLOCK_LEGACY_PASSIVE", { passiveId = pass.id }) end
                                        end, { height = 32, fontSize = 11, variant = canAfford and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end

            -- Run Modifiers Section
            table.insert(nodes, DS.SectionHeader("🔥 修罗轮回挑战词条 (Run Modifiers)", nil, nil))
            local mods = PrestigeSystem and PrestigeSystem.RUN_MODIFIERS or {}
            local activeMods = pe.active_modifiers or {}
            local activeModMap = {}
            for _, mid in ipairs(activeMods) do activeModMap[mid] = true end

            for _, rm in ipairs(mods) do
                local isActive = activeModMap[rm.id]
                table.insert(nodes, DS.Card {
                    borderColor = isActive and DS.C.error or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("%s %s", rm.icon or "⚠️", rm.name), { fontSize = 12, fontWeight = "bold", fontColor = isActive and DS.C.error or DS.C.text }),
                                DS.Label(string.format("结算声望加成: +%d%%", math.floor(((rm.multiplier or 1.2) - 1) * 100)), { fontSize = 11, fontColor = DS.C.gold }),
                            }
                        },
                        DS.Label(rm.desc or "", { fontSize = 10, fontColor = DS.C.muted }),
                        DS.Button(isActive and "🔥 挑战词条已激活 (点击关闭)" or "启用此修罗词条", function()
                            doAction(navigate, "TOGGLE_RUN_MODIFIER", { modId = rm.id })
                        end, { height = 30, fontSize = 11, variant = isActive and "primary" or "secondary", marginTop = 4 })
                    }
                })
            end

        elseif curTourSub == "LORE" then
            table.insert(nodes, DS.SectionHeader("📜 电竞编年史传奇时刻 (Legacy Chronicles)", "电竞丰碑", nil))

            local pe = vs.prestige or {}
            local gen = pe.generation or 1
            local chronicles = LegacyLore and LegacyLore.getUnlockedChronicles and LegacyLore.getUnlockedChronicles(gen) or {}

            for _, ch in ipairs(chronicles) do
                table.insert(nodes, DS.Card {
                    borderColor = ch.unlocked and DS.C.gold or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("🏆 %s", ch.title), { fontSize = 12, fontWeight = "bold", fontColor = ch.unlocked and DS.C.gold or DS.C.muted }),
                                DS.Label(ch.unlocked and string.format("比分: %s", ch.score) or "🔒 需更高周目解锁", { fontSize = 11, fontColor = ch.unlocked and DS.C.success or DS.C.muted }),
                            }
                        },
                        ch.unlocked and DS.Label(string.format("全场 FMVP: %s  |  载入全球电竞永恒名人堂殿堂！", ch.mvp or "Prodigy"), { fontSize = 10, fontColor = DS.C.info })
                            or DS.Label("前世轮回尚未踏足此段传奇历史，完成周目转生探索更深历史回响！", { fontSize = 10, fontColor = DS.C.faint })
                    }
                })
            end
        end

    elseif curTab == "LOGS" then
        -- --------------------------------------------------------------------
        -- TAB 5: DANMAKU & LOGS TERMINAL
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("📜 赛事解说与粉丝弹幕终端", "实时动态", nil))

        table.insert(nodes, DS.Card {
            children = {
                DS.Label("💬 发送赛事助威弹幕", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.info }),
                DS.Button("发送专属粉丝弹幕「全华班加油！」", function()
                    doAction(navigate, "SEND_DANMAKU", { text = "全华班加油！", sender = "Fan_VIP" })
                end, { height = 34, fontSize = 12 })
            }
        })

        local logChildren = {
            DS.Label("💻 [实时赛事解说与战报动态流]", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.success }),
        }
        local recentLogs = game.recent_logs or {}
        local maxShow = math.min(12, #recentLogs)
        for i = 1, maxShow do
            local l = recentLogs[i]
            if l then
                table.insert(logChildren, DS.Label(l, { fontSize = 10, fontColor = DS.C.textDim }))
            end
        end

        table.insert(nodes, DS.Card {
            backgroundColor = "#0e1117", borderColor = "#1f2636", gap = 4, children = logChildren
        })

        -- --------------------------------------------------------------------
        -- VINTAGE ESPORTS NEWSPAPER CLIPPINGS JOURNAL
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("🗞️ 职业生涯头版复古报纸号外日记", "报刊号外", nil))

        local cj = vs.career_journal or {}
        local clippings = cj.clippings or {}

        table.insert(nodes, DS.Card {
            backgroundColor = "#241e16", borderColor = DS.C.gold,
            children = {
                DS.Label("📜 电竞黄金时代权威报刊头版头条", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                DS.Label("收录《全球电竞纪事周报》、《召唤师先锋时报》与《商业观察》，记录王朝登顶每一个载入史册的传奇瞬间！", { fontSize = 10, fontColor = DS.C.muted }),
                DS.Button("🖨️ 印刷最新重大战役号外头条 (Generate Clipping)", function()
                    doAction(navigate, "GENERATE_CAREER_CLIPPING", { clipping_type = "title" })
                end, { height = 34, fontSize = 11, marginTop = 4 })
            }
        })

        for i, clip in ipairs(clippings) do
            table.insert(nodes, DS.Card {
                backgroundColor = "#1a1612", borderColor = "#8c6b3e",
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(clip.publication or "《全球电竞纪事周报》", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                            DS.Label(clip.retroStamp or "【号外 · EXTRA】", { fontSize = 10, fontWeight = "bold", fontColor = "#ef4444" })
                        }
                    },
                    DS.Label(clip.headline or "电竞风云", { fontSize = 13, fontWeight = "bold", fontColor = "#fef08a", marginTop = 2 }),
                    DS.Label(clip.subheadline or "", { fontSize = 10, fontColor = DS.C.text, marginTop = 2 }),
                    clip.quote and DS.Label(string.format("“%s”", clip.quote), { fontSize = 10, fontColor = DS.C.info, marginTop = 2 }),
                    clip.photoCaption and DS.Label(string.format("📸 %s", clip.photoCaption), { fontSize = 9, fontColor = DS.C.textDim, marginTop = 2 }),
                    DS.Label(string.format("版次: %s", clip.edition or "晨报第一版"), { fontSize = 9, fontColor = DS.C.muted, marginTop = 2 })
                }
            })
        end

    elseif curTab == "CALENDAR" then
        -- --------------------------------------------------------------------
        -- TAB: ESPORTS CALENDAR & SEASON CLOCK (26 WEEKS)
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("📅 职业电竞赛历与赛季时钟 (Esports Calendar)", "2026赛季", nil))
        table.insert(nodes, DS.Card {
            backgroundColor = "#121a28", borderColor = DS.C.ember, padding = 12, gap = 8,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        DS.Label("🌱 2026 赛季职业赛历总控", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label("当前进度: 第 1 周 / 26周 (4%)", { fontSize = 11, fontColor = DS.C.cyan })
                    }
                },
                DS.Label("当前赛段: 春季常规赛 (Spring Split) · 争夺季后赛与 MSI 邀请门票", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("当前竞技版本: Patch 14.19 · 全局修饰符: 【春之狂欢】全部比赛微操收益 +10%", { fontSize = 10, fontColor = DS.C.success }),
            }
        })
        local splits = {
            { name = "🌱 春季常规赛 (Spring Split)", weeks = "W1 - W8", desc = "争夺季后赛席位与 MSI 门票 (需胜率 ≥ 55% 或 450 LP)" },
            { name = "🏆 季中冠军赛 (MSI)", weeks = "W9 - W11", desc = "各大赛区冠军巅峰死斗，胜场大幅提升国际声望" },
            { name = "🔥 夏季常规赛 (Summer Split)", weeks = "W12 - W19", desc = "争夺全球总决赛种子席位 (需胜率 ≥ 58% 或 750 LP)" },
            { name = "👑 全球总决赛 (Worlds Championship)", weeks = "W20 - W26", desc = "全球 16 强鏖战，捧起召唤师金杯与终身传奇戒指" },
        }
        for _, sp in ipairs(splits) do
            table.insert(nodes, DS.Card {
                padding = 8, gap = 4, children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between",
                        children = {
                            DS.Label(sp.name, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                            DS.Label(sp.weeks, { fontSize = 10, fontColor = DS.C.cyan })
                        }
                    },
                    DS.Label(sp.desc, { fontSize = 10, fontColor = DS.C.textDim })
                }
            })
        end

    elseif curTab == "VOD" then
        -- --------------------------------------------------------------------
        -- TAB: MATCH VOD LIBRARY
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("🎬 名局战术录像复盘库 (Match VOD Library)", "切片研读", nil))
        table.insert(nodes, DS.Card {
            backgroundColor = "#121424", borderColor = "#6366f1", padding = 12, gap = 6,
            children = {
                DS.Label("🏆 全球总决赛决胜局：天王山龙坑世纪豪赌", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                DS.Label("对阵: DYNASTY (LPL #1) vs T1 (LCK #1) | 赛制: BO5 第五局 | 战果: VICTORY", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("核心数据: 阿狸 9/1/11 (KDA 20.0) | FMVP 关键局 | 复盘可得: 洞察力 +5, 微操 +2, 心态 +3", { fontSize = 10, fontColor = DS.C.cyan }),
                DS.Button("🎬 深度切片研读复盘 (消耗 15 精力与专注)", function()
                    doAction(navigate, "VOD_REVIEW", { vod_id = "vod_worlds_final_2026" })
                end, { height = 36, fontSize = 12, backgroundColor = "#4f46e5" })
            }
        })
        local moments = {
            { min = "12:00", title = "先锋坑口致命魅惑 · 破局先手", desc = "红BUFF视野盲区盲Q探草接极限魅惑秒杀敌方核心", bonus = "+4 洞察力, +2 微操" },
            { min = "22:00", title = "小龙龙魂拉扯战 · 绝境金身换血", desc = "三段大招肉身进场吸收敌方3个大招，秒按金身骗大逆转团战", bonus = "+5 洞察力, +1 微操, +2 大局观" },
            { min = "33:00", title = "纳什男爵决胜决断 · 闪现收割登顶", desc = "大龙血量跌破2000，果断闪现越过肉盾秒杀敌方ADC平推水晶", bonus = "+6 洞察力, +2 微操, +2 大局观" },
        }
        for _, m in ipairs(moments) do
            table.insert(nodes, DS.Card {
                padding = 8, gap = 4, children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between",
                        children = {
                            DS.Label(string.format("⏱️ [%s] %s", m.min, m.title), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }),
                            DS.Label(m.bonus, { fontSize = 10, fontColor = DS.C.success })
                        }
                    },
                    DS.Label(m.desc, { fontSize = 10, fontColor = DS.C.textDim })
                }
            })
        end

    elseif curTab == "COMMUNITY" then
        -- --------------------------------------------------------------------
        -- TAB: COMMUNITY RELATIONS & CAMPAIGNS
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("📢 社区公关与粉丝团运营 (Community Relations)", "声望膨胀", nil))
        local cr = vs.community_relations or {}
        table.insert(nodes, DS.Card {
            backgroundColor = "#1a1218", borderColor = "#f43f5e", padding = 12, gap = 6,
            children = {
                DS.Label(string.format("🌟 粉丝总量: %d 人 | 商业赞助增幅: %.2fx", cr.fanbase_count or 12000, cr.fanbase_multiplier or 1.0),
                    { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                DS.Label(string.format("已成功举办粉丝公关活动: %d 场", cr.campaigns_run or 0), { fontSize = 11, fontColor = DS.C.text }),
            }
        })
        local campaigns = {
            { id = "social_memes", name = "🔥 官博整活与超燃高光剪辑", cost = 2000, desc = "全网吸粉 +8500 人，赞助收益倍率提升至 1.08x" },
            { id = "social_lottery", name = "🎁 百万豪礼锦鲤抽奖大会", cost = 5000, desc = "全网吸粉 +22000 人，狂热转化率提升 15%" },
            { id = "meetup_city_tour", name = "🚌 全国主要电竞城市巡回签名会", cost = 12000, desc = "线下引爆狂潮，粉丝粘性与周边购买力提升至 1.25x" },
            { id = "stream_merch_drop", name = "👕 冠军限定战袍与队服全网空投", cost = 8000, desc = "周边商城订单狂增，战袍单件利润额外 +30%" },
        }
        for _, cp in ipairs(campaigns) do
            table.insert(nodes, DS.Card {
                padding = 8, gap = 4, children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(cp.name, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }),
                            DS.Button(string.format("启动 ¥%d", cp.cost), function()
                                doAction(navigate, "RUN_COMMUNITY_CAMPAIGN", { campaign_id = cp.id })
                            end, { height = 28, fontSize = 10, width = 90 })
                        }
                    },
                    DS.Label(cp.desc, { fontSize = 10, fontColor = DS.C.textDim })
                }
            })
        end

    elseif curTab == "SOCIAL" then
        -- --------------------------------------------------------------------
        -- TAB: SOCIAL BANTER & WEIBO POSTS
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("📱 电竞热搜与社交媒体动态 (Social Banter)", "舆论风暴", nil))
        local posts = {
            { author = "🎙️ 管泽元 (@大校电竞解说)", platform = "微博", tag = "官方解说", likes = "4.8万", text = "我的天哪！这个闪现盲摸眼回旋踢在职业赛场真的踢出来了？！这波微操完全逆天！！宿命先锋是真敢操作啊！这波封神！" },
            { author = "👾 抗压背锅吧 (@电竞吃瓜观察员)", platform = "贴吧热帖", tag = "贴吧爆帖", likes = "1.5万", text = "【赛后热议】宿命先锋首发直接狂轰 14 杀无解carry！这表现是不是近十年来最具统治力的新人中单？（当前已突破 3,842 条回帖讨论）" },
            { author = "🔴 T1 俱乐部官方 (@T1LoL_Official)", platform = "微博", tag = "认证豪门", likes = "8.9万", text = "令人敬佩的绝佳BP战术与极限微操。非常期待与你在全球总决赛舞台巅峰相遇。🤝" },
            { author = "🎧 解说米勒 (@解说米勒)", platform = "微博", tag = "金牌解说", likes = "3.5万", text = "最后那个主堡1滴血的大龙守家看得我头皮发麻！一人肉身飞入敌方五人包夹秒杀双C！这就是电竞的魅力！" }
        }
        for _, p in ipairs(posts) do
            table.insert(nodes, DS.Card {
                padding = 10, gap = 6, children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(p.author, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                            DS.Label(string.format("❤️ %s  [%s]", p.likes, p.platform), { fontSize = 10, fontColor = DS.C.cyan })
                        }
                    },
                    DS.Label(p.text, { fontSize = 11, fontColor = DS.C.text }),
                }
            })
        end

    elseif curTab == "CCTV" then
        -- --------------------------------------------------------------------
        -- TAB: PRO LIFE SIM & BASE CCTV MONITORS
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("📹 基地日常 · 电竞生活俱乐部监控 (Pro Life Sim)", "全域监控", nil))
        table.insert(nodes, DS.Card {
            backgroundColor = "#0e1520", borderColor = DS.C.cyan, padding = 10, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between",
                    children = {
                        DS.Label("🏢 上海静安区顶层俱乐部基地 LV.4", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.cyan }),
                        DS.Label("环境舒适度: 92% | 心态压力: 24%", { fontSize = 10, fontColor = DS.C.success })
                    }
                },
                DS.Label("今日剩余主教练督导令: 3 次", { fontSize = 10, fontColor = DS.C.gold })
            }
        })
        local cams = {
            { id = "CAM_01", name = "📹 CAM_01 主训练室 (Scrim Lab)", status = "高频对抗中", temp = "21.5°C", buff = "对战复盘效率 +20%", feed = "五名首发选手正与全球前四强队进行高强度训练赛，打野刚刚完成了一次精彩的二级抓中！" },
            { id = "CAM_02", name = "📹 CAM_02 心理疗愈室 (Mental Lounge)", status = "芳疗静息中", temp = "23.0°C", buff = "全员心率稳定 68bpm", feed = "心理理疗师正为选手佩戴脑波监测仪，进行深呼吸与赛前抗压压力释放指导。" },
            { id = "CAM_03", name = "📹 CAM_03 星级夜宵厨房 (Kitchen)", status = "热量补给充足", temp = "24.2°C", buff = "卡路里超量恢复 +30%", feed = "特聘营养大厨正在准备高蛋白赛后热餐与复合维生素特饮，全天体能储备充足。" },
        }
        for _, c in ipairs(cams) do
            table.insert(nodes, DS.Card {
                padding = 8, gap = 4, children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between",
                        children = {
                            DS.Label(c.name, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                            DS.Label(string.format("%s · %s", c.temp, c.status), { fontSize = 10, fontColor = DS.C.cyan })
                        }
                    },
                    DS.Label("增益: " .. c.buff, { fontSize = 10, fontColor = DS.C.success }),
                    DS.Label(c.feed, { fontSize = 10, fontColor = DS.C.textDim })
                }
            })
        end
        table.insert(nodes, DS.Card {
            backgroundColor = "#241614", borderColor = DS.C.danger, padding = 10, gap = 6,
            children = {
                DS.Label("🚨 突发更衣室事件: 中单选手峡谷之巅遭演员恶意嘲讽，键盘啪啪作响心态爆炸！", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.danger }),
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                    children = {
                        DS.Button("A. 教练一对一疏导 (-$1000, 压力-15%)", function()
                            doAction(navigate, "CCTV_COMMAND", { action_name = "COACH_COUNSELING" })
                        end, { height = 34, fontSize = 11, flexGrow = 1 }),
                        DS.Button("B. 逆风硬刚虐泉反杀 (微操+2, 压力+5%)", function()
                            doAction(navigate, "CCTV_COMMAND", { action_name = "RAGE_WIN" })
                        end, { height = 34, fontSize = 11, flexGrow = 1, variant = "secondary" })
                    }
                }
            }
        })

    elseif curTab == "ARENA" then
        -- --------------------------------------------------------------------
        -- TAB: TACTICAL DECISION & BARON CLUTCH
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("⚔️ 决胜时刻 · 战术决策与大龙争夺 (Tactical Arena)", "残局博弈", nil))
        table.insert(nodes, DS.Card {
            backgroundColor = "#1b1424", borderColor = "#a855f7", padding = 10, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between",
                    children = {
                        DS.Label("🐉 比赛时刻 32:15 · 纳什男爵决胜决断", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label("大龙剩余血量: 1450 / 12000", { fontSize = 11, fontColor = DS.C.danger })
                    }
                },
                DS.Label("敌我十人集结龙坑狭窄隘口！斩杀线已至，决定全球总决赛冠军归属的生死决断！", { fontSize = 10, fontColor = DS.C.text }),
                UI.Panel {
                    width = "100%", flexDirection = "column", gap = 6, marginTop = 4,
                    children = {
                        DS.Button("⚡ 【中单孤勇者进场】(极危刺客决断 | 72% 胜率 | 秒杀双C直通高地)", function()
                            doAction(navigate, "BARON_CLUTCH", { choice_id = 1 })
                        end, { height = 36, fontSize = 11, backgroundColor = "#9333ea" }),
                        DS.Button("🛡️ 【拼惩戒稳拿大龙】(野区博弈 | 55% 胜率 | 斩杀男爵超级兵平推)", function()
                            doAction(navigate, "BARON_CLUTCH", { choice_id = 2 })
                        end, { height = 36, fontSize = 11, variant = "secondary" }),
                        DS.Button("⏸️ 【主教练紧急战术暂停】(100% 成功 | 重置战术卡池)", function()
                            doAction(navigate, "BARON_CLUTCH", { choice_id = 3 })
                        end, { height = 32, fontSize = 10, variant = "secondary" })
                    }
                }
            }
        })
        table.insert(nodes, DS.Card {
            padding = 10, gap = 6, children = {
                DS.Label("🧩 BP 战术残局特训: 【针对敌方强开突脸锁头阵】", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.cyan }),
                DS.Label("敌方阵容: 硬核突脸锁头 (Vi + Aatrox + Ahri) | 意图越塔瞬秒我方后排", { fontSize = 10, fontColor = DS.C.textDim }),
                DS.Label("✓ 一手封锁: 深海泰坦 (BAN 1) | 先手反制: 虚空之女 卡莎 (PICK 1) | 后手绝杀: 烈娜塔 (COUNTER)", { fontSize = 10, fontColor = DS.C.success }),
                DS.Label("已激活战术加成: 防突进反打奇策 (+12% 团战胜率, +4 微操, +6 大局观)", { fontSize = 10, fontColor = DS.C.gold })
            }
        })

    elseif curTab == "BUDGET" then
        -- --------------------------------------------------------------------
        -- TAB: BUDGET REVIEW & CFO CONSOLE
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("💼 CFO 俱乐部财务审计与薪资帽控制台 (Budget Review)", "财务总控", nil))
        local money = vs.money or 0
        local dynastyBudget = (game.dynasty_engine and game.dynasty_engine.budget) or 250000
        table.insert(nodes, DS.Card {
            backgroundColor = "#141c28", borderColor = DS.C.ember, padding = 12, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between",
                    children = {
                        DS.Label("🏛️ 俱乐部金库总储备", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label(string.format("¥%s", dynastyBudget), { fontSize = 14, fontWeight = "bold", fontColor = DS.C.success })
                    }
                },
                DS.Label(string.format("个人私有资金: $%d | 俱乐部健康跑道: 999+ 周 (财务极其健康)", money), { fontSize = 10, fontColor = DS.C.textDim }),
                DS.Button("📊 执行 CFO 深度财务审计 (剔除冗余开销并追回赞助商返款 +$12,000~20,000)", function()
                    doAction(navigate, "BUDGET_AUDIT", nil)
                end, { height = 36, fontSize = 11, backgroundColor = DS.C.ember })
            }
        })
        table.insert(nodes, DS.Card {
            padding = 10, gap = 4, children = {
                DS.Label("📋 战队薪资帽与周支出明细", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                DS.Label("• 首发五人周薪总额: $38,500 / 软帽 $60,000 (安全区间，无需缴纳奢侈税)", { fontSize = 10, fontColor = DS.C.success }),
                DS.Label("• 俱乐部基地设施日常维护费: $7,500 / 周", { fontSize = 10, fontColor = DS.C.textDim }),
                DS.Label("• 金牌教练组与分析师薪酬: $3,500 / 周", { fontSize = 10, fontColor = DS.C.textDim }),
                DS.Label("• 每周赞助商与战袍分成净流入: +$64,800 / 周 (周现金流净盈余 +$15,300)", { fontSize = 10, fontColor = DS.C.gold }),
            }
        })

    elseif curTab == "GACHA" then
        -- --------------------------------------------------------------------
        -- TAB: SCOUT GACHA SSS RECRUITMENT
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("🎁 全球星探 · SSS 神级选手招募 (Scout Gacha)", "欧皇抽卡", nil))
        table.insert(nodes, DS.Card {
            backgroundColor = "#1a162b", borderColor = "#c084fc", padding = 12, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between",
                    children = {
                        DS.Label("✨ S14 极光限定星探池", { fontSize = 13, fontWeight = "bold", fontColor = "#c084fc" }),
                        DS.Label("3 次内必出 SSS 神级选手 (保底机制)", { fontSize = 10, fontColor = DS.C.gold })
                    }
                },
                DS.Label("本期 UP 神级中单: VORTEX (神级中单 // 天空领主 OVR: 99 | APM: 480)", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("专属被动: 【神之领域】关键龙坑团战输出提升 35%，逆风翻盘率 +28%", { fontSize = 10, fontColor = DS.C.cyan }),
                DS.Label("招募概率: SSS 2.5% | SSR 12.0% | SR 35.5% | R 50.0%", { fontSize = 9, fontColor = DS.C.textDim }),
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                    children = {
                        DS.Button("单抽招募 ($2,000)", function()
                            doAction(navigate, "SCOUT_GACHA_PULL", { times = 1 })
                        end, { height = 36, fontSize = 11, flexGrow = 1 }),
                        DS.Button("十连欧皇抽卡 ($18,000 必出SR+)", function()
                            doAction(navigate, "SCOUT_GACHA_PULL", { times = 10 })
                        end, { height = 36, fontSize = 11, flexGrow = 1, backgroundColor = "#a855f7" })
                    }
                }
            }
        })

    elseif curTab == "SYNERGY" then
        -- --------------------------------------------------------------------
        -- TAB: SYNERGY NETWORK MATRIX
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("🔗 战队羁绊 · 选手默契神经拓扑网络 (Synergy Matrix)", "同调超频", nil))
        table.insert(nodes, DS.Card {
            backgroundColor = "#0e1a24", borderColor = "#06b6d4", padding = 12, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between",
                    children = {
                        DS.Label("⚡ 全队超频同调率: 94.2%", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.cyan }),
                        DS.Label("终结伤害加成: +18.4%", { fontSize = 11, fontColor = DS.C.success })
                    }
                },
                DS.Label("拓扑星图: [TOP 上单] === [JNG 打野] === [MID 中单] === [BOT 下路] === [SUP 辅助]", { fontSize = 10, fontColor = DS.C.textDim })
            }
        })
        local pairs = {
            { code = "JNG x MID", title = "黄金中野代练组合", lv = 5, effect = "控峡谷先锋与转线速度 +35% (已达满级)" },
            { code = "TOP x JNG", title = "上野互信越塔组", lv = 4, effect = "越塔配合 +20% 击杀斩获" },
            { code = "BOT x SUP", title = "默契下路组合", lv = 4, effect = "对线击杀率 +22% / 视野压制 +30%" },
            { code = "MID x BOT", title = "后期双核驱动", lv = 3, effect = "后期大龙团战容错率 +15%" }
        }
        for _, pr in ipairs(pairs) do
            table.insert(nodes, DS.Card {
                padding = 8, gap = 4, children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(string.format("【%s】Lv.%d %s", pr.code, pr.lv, pr.title), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                            (pr.lv < 5) and DS.Button("升级羁绊 ($1,500)", function()
                                doAction(navigate, "UPGRADE_SYNERGY", { pair_code = pr.code })
                            end, { height = 26, fontSize = 10, width = 100 })
                            or DS.Label("MAX", { fontSize = 10, fontColor = DS.C.success, fontWeight = "bold" })
                        }
                    },
                    DS.Label(pr.effect, { fontSize = 10, fontColor = DS.C.textDim })
                }
            })
        end
    end

    -- ========================================================================
    -- FLOATING CHAMFERED COMMAND DECK & ACTIONS HUB (常驻底部战术指令台)
    -- ========================================================================
    local health = game.player.career_health or { wrist_strain = 0 }
    local rsi_strain = health.wrist_strain or 0
    local isHighStrain = rsi_strain >= 50
    local curPhase = game.phase or 1

    local commandButtons = {
        DS.Button("🌙 深度休整", function() doAction(navigate, "REST") end, { height = 34, fontSize = 11, flexGrow = 1, variant = "secondary" }),
        DS.Button("☕ 特调咖啡", function() doAction(navigate, "DRINK_COFFEE") end, { height = 34, fontSize = 11, flexGrow = 1, variant = "secondary" }),
        DS.Button("⚡ 1v1死斗", function() doAction(navigate, "CLASH_RIVAL") end, { height = 34, fontSize = 11, flexGrow = 1, backgroundColor = "#b91c1c" }),
    }
    if curPhase == 1 then
        table.insert(commandButtons, DS.Button("📻 直播冲分", function() doAction(navigate, "STREAM") end, { height = 34, fontSize = 11, flexGrow = 1, backgroundColor = "#7e22ce" }))
    elseif curPhase == 2 then
        table.insert(commandButtons, DS.Button("🎯 豪门侦察", function() doAction(navigate, "SCOUT_TEAM", { team_id = "t1" }) end, { height = 34, fontSize = 11, flexGrow = 1, backgroundColor = "#0f766e" }))
    else
        table.insert(commandButtons, DS.Button("💼 预算审阅", function() doAction(navigate, "BUDGET_AUDIT") end, { height = 34, fontSize = 11, flexGrow = 1, backgroundColor = "#d97706" }))
    end

    local deckChildren = {
        UI.Panel {
            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
            children = {
                DS.Label(string.format("🕹️ 战术指令台 · 体能: %d%% | 专注: %d%% | 手腕劳损: %d%%%s",
                    game.player.energy or 100, game.player.focus or 100, rsi_strain, isHighStrain and " ⚠️" or ""),
                    { fontSize = 10, fontWeight = "bold", fontColor = isHighStrain and DS.C.danger or DS.C.cyan }),
                DS.Button(game.show_actions_hub and "收起行动舱 ▲" or "次级行动舱 · 24h作息 ▼", function()
                    game.show_actions_hub = not game.show_actions_hub
                    if navigate then navigate("esport_sim") end
                end, { height = 24, fontSize = 9, width = 130, variant = "secondary" })
            }
        },
        UI.Panel {
            width = "100%", flexDirection = "row", gap = 4, marginTop = 4, children = commandButtons
        }
    }

    if game.show_actions_hub then
        table.insert(deckChildren, DS.Card {
            backgroundColor = "#0b101b", borderColor = DS.C.cyan, padding = 8, gap = 4, marginTop = 6,
            children = {
                DS.Label("⏱️ 24小时全天候职业选手训练作息表 (Daily Marathon Schedule):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 4, flexWrap = "wrap",
                    children = {
                        DS.Button("🌅 09:00 早间情报 (录像)", function() game.active_tab = "VOD" if navigate then navigate("esport_sim") end end, { height = 26, fontSize = 9, flexGrow = 1 }),
                        DS.Button("⚔️ 11:00 巅峰排位 (死斗)", function() doAction(navigate, "CLASH_RIVAL") end, { height = 26, fontSize = 9, flexGrow = 1 }),
                        DS.Button("🩺 14:00 午间理疗 (水疗)", function() doAction(navigate, "PHYSIOTHERAPY", { treatment_id = "cold_pack" }) end, { height = 26, fontSize = 9, flexGrow = 1 }),
                        DS.Button("🛡️ 16:00 战术对抗 (研读)", function() doAction(navigate, "REVIEW_TACTICAL_THEORY") end, { height = 26, fontSize = 9, flexGrow = 1 }),
                        DS.Button("🏆 19:00 杯赛博弈 (录像)", function() game.active_tab = "VOD" if navigate then navigate("esport_sim") end end, { height = 26, fontSize = 9, flexGrow = 1 }),
                        DS.Button("🌟 21:00 晚间直播 (涨粉)", function() doAction(navigate, "STREAM") end, { height = 26, fontSize = 9, flexGrow = 1 }),
                        DS.Button("📊 23:00 深夜审计 (CFO)", function() doAction(navigate, "BUDGET_AUDIT") end, { height = 26, fontSize = 9, flexGrow = 1 }),
                    }
                }
            }
        })
    end

    table.insert(nodes, DS.Card {
        backgroundColor = "#0e1320", borderColor = DS.C.border, padding = 10, gap = 4, marginTop = 8,
        children = deckChildren
    })

    -- ========================================================================
    -- 4. BOTTOM UTILITY & PERSISTENCE CONTROLS
    -- ========================================================================
    table.insert(nodes, UI.Panel {
        width = "100%", flexDirection = "row", gap = 8, marginTop = 12,
        children = {
            DS.Button("💾 保存存档", function()
                doAction(navigate, "SAVE_GAME", nil)
            end, { flexGrow = 1, height = 36, fontSize = 11, variant = "secondary" }),
            DS.Button("📂 读取存档", function()
                local s = game:saveGame()
                doAction(navigate, "LOAD_GAME", { save_data = s })
            end, { flexGrow = 1, height = 36, fontSize = 11, variant = "secondary" }),
            DS.Button("🏠 返回主菜单", function()
                if navigate then navigate("menu") end
            end, { flexGrow = 1, height = 36, fontSize = 11, variant = "secondary" }),
        }
    })

    -- ========================================================================
    -- 5. RETURN WRAPPED FULL-SCREEN SAFE SCROLL CONTAINER
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
                                width = "100%", padding = 12, gap = 10, children = nodes
                            }
                        }
                    }
                }
            }
        }
    }
end

return EsportSimulatorScreen
