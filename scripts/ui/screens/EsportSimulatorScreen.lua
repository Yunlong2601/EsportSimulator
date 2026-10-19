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
local EsportsCrisisEngine = nil
local ok_ece, m_ece = pcall(require, "lua.esports_crisis_engine")
if ok_ece and type(m_ece) == "table" then EsportsCrisisEngine = m_ece else
    local ok_ece2, m_ece2 = pcall(require, "esports_crisis_engine")
    if ok_ece2 and type(m_ece2) == "table" then EsportsCrisisEngine = m_ece2 else
        pcall(function() EsportsCrisisEngine = require("scripts.lua.esports_crisis_engine") end)
    end
end

local MatchHighlightEngine = nil
local ok_mhe, m_mhe = pcall(require, "lua.match_highlight_engine")
if ok_mhe and type(m_mhe) == "table" then MatchHighlightEngine = m_mhe else
    local ok_mhe2, m_mhe2 = pcall(require, "match_highlight_engine")
    if ok_mhe2 and type(m_mhe2) == "table" then MatchHighlightEngine = m_mhe2 else
        pcall(function() MatchHighlightEngine = require("scripts.lua.match_highlight_engine") end)
    end
end

local HallOfFame = nil
local ok_hof, m_hof = pcall(require, "lua.hall_of_fame")
if ok_hof and type(m_hof) == "table" then HallOfFame = m_hof else
    local ok_hof2, m_hof2 = pcall(require, "hall_of_fame")
    if ok_hof2 and type(m_hof2) == "table" then HallOfFame = m_hof2 else
        pcall(function() HallOfFame = require("scripts.lua.hall_of_fame") end)
    end
end

local MatchBroadcastScreen = nil
local ok_mbs, m_mbs = pcall(require, "ui.screens.MatchBroadcastScreen")
if ok_mbs and type(m_mbs) == "table" then MatchBroadcastScreen = m_mbs else
    local ok_mbs2, m_mbs2 = pcall(require, "scripts.ui.screens.MatchBroadcastScreen")
    if ok_mbs2 and type(m_mbs2) == "table" then MatchBroadcastScreen = m_mbs2 else
        pcall(function() MatchBroadcastScreen = require("scripts.ui.screens.MatchBroadcastScreen") end)
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
local _last_toast = nil

local function doAction(nav, action_id, payload)
    local game = EsportSimulatorScreen.GetGame()
    if action_id == "START_VISUAL_MATCH" or action_id == "PLAY_STAGE_MATCH" or action_id == "CHOOSE_BP_TACTIC" then
        game.active_tab = "ARENA"
        game.stage_subtab = "THEATER"
    elseif action_id == "CLOSE_VISUAL_MATCH" then
        game.active_tab = "ARENA"
        game.stage_subtab = "CALENDAR"
    end
    local res = game:onAction(action_id, payload)
    if res and res.message and res.message ~= "" then
        _last_msg = res.message
        _notice_color = res.success and DS.C.success or DS.C.error
        _last_toast = {
            msg = res.message,
            color = _notice_color,
            icon = res.success and "✨" or "⚠️",
            time = os.time()
        }

        -- Audio-reactive triggers based on action outcome
        pcall(function()
            local ok_s, sm = pcall(require, "lua.sound_manager")
            if not ok_s or not sm then ok_s, sm = pcall(require, "scripts.lua.sound_manager") end
            if ok_s and sm and sm.PlaySFX then
                if action_id == "SOLO_QUEUE" or action_id == "PLAY_STAGE_MATCH" then
                    if res.is_win or res.win then
                        sm.PlaySFX("VICTORY_FANFARE")
                    else
                        sm.PlaySFX("DEFEAT_TAPS")
                    end
                elseif action_id == "CLAIM_DAILY_LOGIN" or action_id == "RUN_COMMUNITY_CAMPAIGN" then
                    sm.PlaySFX("REWARD")
                elseif action_id == "UPGRADE_FACILITY" or action_id == "UPGRADE_MERCH_TECH" then
                    sm.PlaySFX("BARON_ROAR")
                elseif action_id == "PROMOTE_TRAINEE" or action_id == "SIGN_STAFF" or action_id == "SCOUT_GACHA_PULL" then
                    sm.PlaySFX("SIGN_CONTRACT")
                end
            end
        end)
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

    -- Emergency Crisis & Moral Dilemma Card (if pending crisis)
    if vs.pending_crisis then
        local pc = vs.pending_crisis
        local optCards = {}
        for idx, opt in ipairs(pc.options or {}) do
            table.insert(optCards, UI.Panel {
                width = "100%", flexDirection = "column", gap = 2, marginTop = 4,
                children = {
                    DS.Button(opt.label, function()
                        doAction(navigate, "RESOLVE_CRISIS", { crisis_id = pc.id, option_index = idx })
                    end, { height = 34, fontSize = 11, variant = (idx == 1 and "primary" or "secondary") }),
                    DS.Label(opt.desc, { fontSize = 9, fontColor = DS.C.muted, marginLeft = 4 }),
                }
            })
        end
        table.insert(nodes, DS.Card {
            backgroundColor = "#240a12", borderColor = DS.C.error, borderWidth = 2, padding = 10, gap = 4,
            children = {
                DS.Label(pc.banner or ("🚨 突发危机两难: " .. (pc.title or "")), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.error }),
                DS.Label(pc.scenario or "", { fontSize = 10, fontColor = DS.C.text, lineHeight = 13, marginTop = 2 }),
                UI.Panel {
                    width = "100%", flexDirection = "column", gap = 3, marginTop = 4, children = optCards
                }
            }
        })
    end

    -- 1.5 ROOKIE COACH ONBOARDING GUIDE
    if not game.rookie_guide_dismissed and vs.phase == 1 then
        table.insert(nodes, UI.Panel {
            width = "100%", backgroundColor = "#141c26", borderColor = DS.C.info, borderWidth = 1.5,
            borderRadius = 8, padding = 10, flexDirection = "column", gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Panel {
                            flexDirection = "row", alignItems = "center", gap = 6,
                            children = {
                                DS.CyberBadge("新秀战术导师", { variant = "ember" }),
                                DS.Label("欢迎出征职业电竞！", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text })
                            }
                        },
                        DS.Button("了解并收起", function()
                            game.rookie_guide_dismissed = true
                            if navigate then navigate("esport_sim") end
                        end, { height = 24, fontSize = 10, variant = "secondary" })
                    }
                },
                DS.Label("① 当前为【阶段 1: 天梯路人王】。首要目标为单排冲分证明实力，冲击王者并维持体能。\n② 关注首屏【今日核心指令】，它将实时推演你的当前最优备战操作。\n③ 突破千分天梯后将收到顶级豪门试训邀请，正式迈入 5v5 职业赛场！", {
                    fontSize = 10, fontColor = DS.C.textDim, lineHeight = 14
                })
            }
        })
    end

    -- ========================================================================
    -- 2. PILLAR RESOLVER & TOP SEGMENTED CAPSULE SWITCHER
    -- ========================================================================
    local curTab = game.active_tab or "HQ"
    local activePillar = "HQ"
    if curTab == "ARENA" or curTab == "STAGE" or curTab == "THEATER" or curTab == "CALENDAR" or curTab == "VOD" or curTab == "DRILL" or curTab == "RADAR" or curTab == "TIER" or curTab == "META" or curTab == "DECIDER" then
        activePillar = "ARENA"
    elseif curTab == "CLUB" or curTab == "DYNASTY" or curTab == "FACILITIES" or curTab == "ACADEMY" or curTab == "GEAR" or curTab == "AGENCY" or curTab == "JERSEY" or curTab == "BUDGET" or curTab == "CCTV" or curTab == "GACHA" or curTab == "EXPANSION" or curTab == "DRAFT" or curTab == "BOOTCAMP" or curTab == "DYNAMICS" or curTab == "COACH" or curTab == "OVERVIEW" then
        activePillar = "CLUB"
    elseif curTab == "LEGACY" or curTab == "TOUR" or curTab == "LOGS" or curTab == "HOF" or curTab == "RINGS" or curTab == "JOURNAL" or curTab == "TALENTS" or curTab == "SYNERGY" or curTab == "RANKINGS" or curTab == "LORE" then
        activePillar = "LEGACY"
    else
        activePillar = "HQ"
    end

    -- Render the Clean Segmented Capsule Switcher for the Active Pillar
    local capsulePills = {}
    local activeSubId = ""

    if activePillar == "HQ" then
        activeSubId = game.career_subtab or "TODAY"
        if curTab == "COMMUNITY" or curTab == "SOCIAL" then activeSubId = "NEWS" end
        capsulePills = {
            { id = "TODAY",  label = "🔥 今日作战" },
            { id = "DAILY",  label = "🎯 备战行动" },
            { id = "NEWS",   label = "📢 资讯热搜" },
            { id = "SHOP",   label = "🛒 外设装备" },
            { id = "AGENCY", label = "🤝 商业经纪" },
            { id = "STREAM", label = "🌟 直播特权" },
        }
    elseif activePillar == "ARENA" then
        activeSubId = game.stage_subtab or "STAGE"
        if curTab == "CALENDAR" then activeSubId = "CALENDAR"
        elseif curTab == "VOD" then activeSubId = "VOD"
        elseif curTab == "ARENA" then activeSubId = "DECIDER"
        end
        capsulePills = {
            { id = "STAGE",    label = "🏟️ 5v5赛事" },
            { id = "THEATER",  label = "📺 峡谷沙盘" },
            { id = "DRILL",    label = "🧩 残局沙盘" },
            { id = "RADAR",    label = "📊 五维雷达" },
            { id = "META",     label = "📜 版本梯度" },
            { id = "CALENDAR", label = "📅 赛程赛历" },
            { id = "VOD",      label = "🎬 录像复盘" },
            { id = "DECIDER",  label = "⚔️ 生死决胜" },
        }
    elseif activePillar == "CLUB" then
        activeSubId = game.dynasty_subtab or "ROSTER"
        if curTab == "ROSTER" or curTab == "CLUB" then activeSubId = "ROSTER"
        elseif curTab == "FACILITIES" then activeSubId = "FACILITIES"
        elseif curTab == "TRANSFER" then activeSubId = "TRANSFER"
        elseif curTab == "ACADEMY" then activeSubId = "ACADEMY"
        elseif curTab == "BUDGET" then activeSubId = "BUDGET"
        elseif curTab == "CCTV" then activeSubId = "CCTV"
        elseif curTab == "GACHA" then activeSubId = "GACHA"
        end
        capsulePills = {
            { id = "ROSTER",     label = "👥 战队首发" },
            { id = "TRANSFER",   label = "❄️ 冬季转会" },
            { id = "FACILITIES", label = "🏢 基地设施" },
            { id = "ACADEMY",    label = "🎓 青训基地" },
            { id = "GEAR",       label = "🎧 外设商城" },
            { id = "AGENCY",     label = "🤝 商业赞助" },
            { id = "JERSEY",     label = "👕 战袍工坊" },
            { id = "BUDGET",     label = "💼 财务审计" },
            { id = "CCTV",       label = "📹 基地监控" },
            { id = "GACHA",      label = "🎁 选手抽卡" },
            { id = "EXPANSION",  label = "🌟 选秀大会" },
            { id = "BOOTCAMP",   label = "✈️ 战队集训" },
            { id = "DYNAMICS",   label = "⚔️ 阵型化学" },
            { id = "COACH",      label = "💼 股权提案" },
            { id = "OVERVIEW",   label = "📊 经营总盘" },
        }
    elseif activePillar == "LEGACY" then
        activeSubId = game.tour_subtab or "HOF"
        if curTab == "SYNERGY" then activeSubId = "SYNERGY"
        elseif curTab == "LOGS" then activeSubId = "LOGS"
        end
        capsulePills = {
            { id = "HOF",      label = "🏛️ 名人堂" },
            { id = "RINGS",    label = "💍 神戒馆" },
            { id = "JOURNAL",  label = "📰 生涯剪报" },
            { id = "TALENTS",  label = "🧬 传承树" },
            { id = "SYNERGY",  label = "🔗 双子羁绊" },
            { id = "LOGS",     label = "📜 历史战报" },
            { id = "TOUR",     label = "🌍 巡回关卡" },
            { id = "RANKINGS", label = "📊 豪门榜" },
            { id = "LORE",     label = "📜 编年史" },
        }
    end

    local pillButtons = {}
    for _, cp in ipairs(capsulePills) do
        local isPillActive = (activeSubId == cp.id or (cp.id == "TODAY" and activeSubId == "SOLO"))
        table.insert(pillButtons, UI.Button {
            text = cp.label,
            height = 30, fontSize = 10, fontWeight = isPillActive and "bold" or "normal",
            paddingLeft = 10, paddingRight = 10,
            backgroundColor = isPillActive and DS.C.ember or DS.C.surfaceAlt,
            textColor = isPillActive and "#ffffff" or DS.C.textDim,
            borderColor = isPillActive and DS.C.gold or DS.C.border,
            borderWidth = 1, borderRadius = 6,
            onClick = function()
                game.active_tab = activePillar
                if activePillar == "HQ" then
                    game.career_subtab = cp.id
                elseif activePillar == "ARENA" then
                    game.stage_subtab = cp.id
                elseif activePillar == "CLUB" then
                    game.dynasty_subtab = cp.id
                elseif activePillar == "LEGACY" then
                    game.tour_subtab = cp.id
                end
                if navigate then navigate("esport_sim") end
            end
        })
    end

    table.insert(nodes, UI.Panel {
        width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 5, marginTop = 4, children = pillButtons
    })

    -- ========================================================================
    -- 3. TAB CONTENT
    -- ========================================================================
    if activePillar == "HQ" or curTab == "CAREER" or curTab == "HQ" then
        -- --------------------------------------------------------------------
        -- TAB 1: HQ COMMAND CENTER & CAREER HUB
        -- --------------------------------------------------------------------
        local curCareerSub = activeSubId

        if curCareerSub == "TODAY" or curCareerSub == "SOLO" then
            table.insert(nodes, DS.SectionHeader("⚡ 作战大厅 · 今日焦点赛事与排位 (Command HQ)", "巅峰对决", nil))

            -- ----------------------------------------------------------------
            -- 1. NEXT OBJECTIVE HERO CARD (今日核心指令动态引导卡)
            -- ----------------------------------------------------------------
            local objTitle = "即刻单排冲分 · 登顶国服天梯"
            local objDesc = "当前排位状态优异，保持手感冲击最强王者，为挺进职业赛场积蓄实力！"
            local objActionLabel = "即刻出征 · 单排冲分"
            local objAction = function() doAction(navigate, "SOLO_QUEUE") end
            local objTag = "冲分阶段"

            local curEnergy = vs.energy or vs.stamina or 100
            if curEnergy < 30 then
                objTitle = "体能濒临透支警告 · 立即休眠或饮用咖啡"
                objDesc = string.format("当前选手精力仅剩 %d/100，操作反应与对局胜率大幅衰减，请立即补给！", curEnergy)
                objActionLabel = "饮用战备咖啡 ($150)"
                objAction = function() doAction(navigate, "DRINK_COFFEE") end
                objTag = "体能告急"
            elseif promo and promo.active then
                objTitle = string.format("【%s 生死晋级赛】胜点决胜打响！", promo.target_tier)
                objDesc = string.format("当前晋级赛赛况: %d 胜 / %d 负，拿下此局直接破茧晋级！", promo.wins, promo.losses)
                objActionLabel = "决战生死局 (ADVANCE)"
                objAction = function() doAction(navigate, "ADVANCE_PROMO", { is_win = true }) end
                objTag = "生死决战"
            elseif not vs.daily_claimed then
                objTitle = "领取俱乐部每日签到战备津贴"
                objDesc = "今日尚未打卡，立即领取每日训练经费与体能恢复包！"
                objActionLabel = "一键领取打卡津贴"
                objAction = function() doAction(navigate, "CLAIM_DAILY_LOGIN") end
                objTag = "每日津贴"
            elseif vs.phase >= 2 then
                objTitle = "5v5 职业联赛巅峰对决"
                objDesc = "首发阵容整装待发，开启 2D 峡谷沙盘与实况演播迎战宿敌！"
                objActionLabel = "开战 5v5 舞台决胜"
                objAction = function() doAction(navigate, "START_VISUAL_MATCH") end
                objTag = "赛场焦点"
            end

            table.insert(nodes, DS.ObjectiveCard(objTitle, objDesc, objActionLabel, objAction, { tag = objTag }))

            -- ----------------------------------------------------------------
            -- INTERACTIVE TACTICAL DILEMMA (天梯突发战局实时裁决卡)
            -- ----------------------------------------------------------------
            if vs.pending_dilemma then
                local d = vs.pending_dilemma
                local optButtons = {}
                for idx, opt in ipairs(d.options or {}) do
                    local isHigh = (opt.risk == "High" or opt.risk == "高")
                    local optBg = isHigh and "#2a1518" or "#121e28"
                    local optBd = isHigh and DS.C.error or DS.C.info
                    table.insert(optButtons, UI.Button {
                        text = string.format("👉 方案 %d: %s [%s风险]", idx, opt.label, opt.risk or "中"),
                        width = "100%", height = 38, fontSize = 11, fontWeight = "bold",
                        backgroundColor = optBg, textColor = isHigh and "#ffa3a3" or "#93c5fd",
                        borderColor = optBd, borderWidth = 1, borderRadius = 6,
                        onClick = function()
                            doAction(navigate, "RESOLVE_DILEMMA", { choice_index = idx })
                        end
                    })
                end

                table.insert(nodes, DS.Card {
                    backgroundColor = "#181424", borderColor = DS.C.gold, borderWidth = 2, padding = 12, gap = 8,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("⚡【突发战局裁决 · %s】", d.title or "电竞风云"), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                                DS.CyberBadge(d.tag or "突发事件", { variant = "ember" })
                            }
                        },
                        DS.Label(d.scenario or "", { fontSize = 11, fontColor = DS.C.text, lineHeight = 1.4 }),
                        DS.Divider(DS.C.border),
                        DS.Label("请迅速决断你的战术方案：", { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", flexDirection = "column", gap = 6, children = optButtons
                        }
                    }
                })
            end

            -- ----------------------------------------------------------------
            -- 2. ACTION-CENTRIC HERO CLASH CARD (今日焦点赛事 / 巅峰排位主作战卡)
            -- ----------------------------------------------------------------
            local totalGames = (game.player.games_played or 0)
            local winRate = totalGames > 0 and ((game.player.wins / totalGames) * 100) or 50.0

            if vs.phase == 1 then
                local clashChildren = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.CyberBadge("今日焦点 · 天梯巅峰排位", { variant = "gold" }),
                            DS.Chip(string.format("连胜: %d 场", game.player.win_streak or 0), { fontColor = DS.C.ember, borderColor = DS.C.ember }),
                        }
                    },
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center", marginTop = 4,
                        children = {
                            UI.Panel {
                                flexDirection = "row", alignItems = "center", gap = 6,
                                children = {
                                    DS.CyberBadge(vs.rank, { variant = "gold" }),
                                    DS.Label(string.format("%d LP", vs.lp), { fontSize = 18, fontWeight = "bold", fontColor = DS.C.gold }),
                                }
                            },
                            UI.Panel {
                                flexDirection = "row", alignItems = "center", gap = 6,
                                children = {
                                    DS.Label("选手精力", { fontSize = 10, fontColor = DS.C.muted }),
                                    DS.EnergyBattery(curEnergy, 100, { width = 45, height = 10 }),
                                }
                            }
                        }
                    },
                    DS.Label(string.format("综合胜率: %.1f%% (%d胜/%d场)", winRate, game.player.wins, totalGames), { fontSize = 11, fontColor = DS.C.info }),
                    DS.LPGauge(vs.lp % 100, 100, { height = 8 }),
                }

                if promo and promo.active then
                    table.insert(clashChildren, UI.Panel {
                        width = "100%", flexDirection = "column", gap = 4, marginTop = 4, padding = 8,
                        backgroundColor = "#2e1216", borderColor = DS.C.danger, borderWidth = 1, borderRadius = 6,
                        children = {
                            DS.Label(string.format("⚔️ 【%s 生死晋级赛】打响！当前战况: %d 胜 / %d 负", promo.target_tier, promo.wins, promo.losses),
                                { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                            UI.Panel {
                                width = "100%", flexDirection = "row", gap = 8, marginTop = 2,
                                children = {
                                    DS.Button("⚔️ 决战下局 (Advance)", function()
                                        doAction(navigate, "ADVANCE_PROMO", { is_win = true })
                                    end, { height = 36, fontSize = 12, flexGrow = 1 }),
                                    DS.Button("🏳️ 弃权", function()
                                        doAction(navigate, "FORFEIT_PROMO", nil)
                                    end, { variant = "secondary", height = 36, fontSize = 12, flexGrow = 1 }),
                                }
                            }
                        }
                    })
                else
                    table.insert(clashChildren, UI.Button {
                        id = "btn_hero_clash_solo",
                        text = "⚔️ 即刻开赛 · 单排冲分 (SOLO QUEUE)",
                        width = "100%", height = 50, fontSize = 15, fontWeight = "bold",
                        backgroundColor = DS.C.ember, textColor = "#ffffff", borderRadius = 10, marginTop = 6,
                        onClick = function()
                            doAction(navigate, "SOLO_QUEUE")
                        end
                    })
                    table.insert(clashChildren, DS.Button("🎲 触发突发战术对决 (TACTICAL DILEMMA)", function()
                        doAction(navigate, "TRIGGER_SOLO_DILEMMA")
                    end, { height = 34, fontSize = 11, variant = "secondary", marginTop = 4 }))
                end

                -- Quick Recovery Helper Buttons
                table.insert(clashChildren, UI.Panel {
                    width = "100%", flexDirection = "row", gap = 6, marginTop = 4,
                    children = {
                        UI.Button {
                            text = "🛌 深度休眠", flexGrow = 1, height = 32, fontSize = 11,
                            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.info, borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                            onClick = function() doAction(navigate, "REST") end
                        },
                        UI.Button {
                            text = "☕ 战备咖啡", flexGrow = 1, height = 32, fontSize = 11,
                            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.gold, borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                            onClick = function() doAction(navigate, "DRINK_COFFEE") end
                        },
                        UI.Button {
                            text = "🎁 每日签到", flexGrow = 1, height = 32, fontSize = 11,
                            backgroundColor = DS.C.surfaceAlt, textColor = DS.C.success, borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                            onClick = function() doAction(navigate, "CLAIM_DAILY_LOGIN") end
                        },
                    }
                })

                table.insert(nodes, DS.Card {
                    backgroundColor = "#101522", borderColor = DS.C.ember, borderWidth = 2, padding = 12, gap = 6,
                    children = clashChildren
                })
            else
                -- Pro Stage Today Clash Card
                local proChildren = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Chip("⚔️ 今日焦点赛事 · 2026 世界总决赛", { fontColor = DS.C.gold, borderColor = DS.C.gold }),
                            DS.Chip("伦敦 O2 · BO5 淘汰赛", { fontColor = DS.C.info, borderColor = DS.C.info }),
                        }
                    },
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-around", alignItems = "center", marginTop = 6,
                        children = {
                            UI.Panel {
                                flexDirection = "column", alignItems = "center",
                                children = {
                                    UI.Label { text = string.format("👑 %s", vs.player_name or "你方首发"), fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold },
                                    DS.Label(string.format("战力: %d", vs.mechanics or 80), { fontSize = 10, fontColor = DS.C.muted }),
                                }
                            },
                            UI.Label { text = "⚡ VS ⚡", fontSize = 16, fontWeight = "bold", fontColor = DS.C.ember },
                            UI.Panel {
                                flexDirection = "column", alignItems = "center",
                                children = {
                                    UI.Label { text = "🔥 T1 (SK Telecom)", fontSize = 13, fontWeight = "bold", fontColor = "#ff7b72" },
                                    DS.Label("全球第 1 · 战力: 96", { fontSize = 10, fontColor = DS.C.muted }),
                                }
                            },
                        }
                    },
                    UI.Button {
                        id = "btn_hero_clash_pro",
                        text = "⚔️ 即刻开赛 · 5v5 巅峰决胜 (START MATCH)",
                        width = "100%", height = 50, fontSize = 15, fontWeight = "bold",
                        backgroundColor = DS.C.ember, textColor = "#ffffff", borderRadius = 10, marginTop = 6,
                        onClick = function()
                            doAction(navigate, "START_VISUAL_MATCH", { enemy_team_id = "T1" })
                        end
                    },
                    UI.Panel {
                        width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                        children = {
                            UI.Button {
                                text = "📺 2D 战术沙盘转播", flexGrow = 1, height = 34, fontSize = 11,
                                backgroundColor = DS.C.surfaceAlt, textColor = DS.C.info, borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                                onClick = function()
                                    game.active_tab = "ARENA"
                                    game.stage_subtab = "THEATER"
                                    if navigate then navigate("esport_sim") end
                                end
                            },
                            UI.Button {
                                text = "📹 战术复盘录像 (VOD)", flexGrow = 1, height = 34, fontSize = 11,
                                backgroundColor = DS.C.surfaceAlt, textColor = DS.C.text, borderColor = DS.C.border, borderWidth = 1, borderRadius = 6,
                                onClick = function() doAction(navigate, "STUDY_VOD") end
                            },
                        }
                    }
                }

                table.insert(nodes, DS.Card {
                    backgroundColor = "#121826", borderColor = DS.C.gold, borderWidth = 2, padding = 12, gap = 6,
                    children = proChildren
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

        elseif curCareerSub == "DAILY" then
            table.insert(nodes, DS.SectionHeader("🎯 训练与竞技日常备战行动 (Daily Training)", "全天候作息", nil))
            local actions = {
                { id = "SOLO_QUEUE", badge = "排位", label = "单排天梯冲分", desc = "扣除20精力，冲击当前段位胜点", prim = true, cost = "20精力" },
                { id = "STUDY_VOD",  badge = "复盘", label = "高阶对局复盘", desc = "消耗10专注，微操上限永久+1", prim = false, cost = "10专注" },
                { id = "STREAM",     badge = "直播", label = "开播连麦互动", desc = "高分段技术直播，斩获粉丝与打赏", prim = false, cost = "免费" },
                { id = "REST",       badge = "休眠", label = "深度休眠冥想", desc = "恢复体能，精力+35/专注+40", prim = false, cost = "免费" },
                { id = "DRINK_COFFEE", badge = "战备", label = "特浓战备咖啡", desc = "高能电竞咖啡提神，瞬间+50专注度", prim = false, cost = "$150" },
                { id = "PHYSIOTHERAPY", badge = "理疗", label = "手腕康复理疗", desc = "冰敷与神经牵引，消除手腕劳损负荷", prim = false, payload = { treatment_id = "ice_stretch" }, cost = "$300" },
                { id = "CLAIM_DAILY_LOGIN", badge = "签到", label = "每日打卡签到", desc = "领取连签排位胜点与训练津贴", prim = false, cost = "免费", disabled = vs.daily_claimed },
                { id = "CLASH_RIVAL", badge = "死斗", label = "约战宿敌死斗", desc = "约战宿敌强敌，斩获全网知名度", prim = false, cost = "30精力" },
            }

            for _, act in ipairs(actions) do
                table.insert(nodes, DS.ActionTile {
                    badge = act.badge,
                    title = act.label,
                    desc = act.desc,
                    costText = act.cost,
                    disabled = act.disabled,
                    actionLabel = act.disabled and "已完成" or "立即执行",
                    variant = act.prim and "primary" or "secondary",
                    onAction = function() doAction(navigate, act.id, act.payload) end
                })
            end

        elseif curCareerSub == "NEWS" then
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
                table.insert(nodes, DS.ActionTile {
                    badge = "公关",
                    title = cp.name,
                    desc = cp.desc,
                    cost = cp.cost,
                    actionLabel = "启动",
                    onAction = function()
                        doAction(navigate, "RUN_COMMUNITY_CAMPAIGN", { campaign_id = cp.id })
                    end
                })
            end

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
                                isOwned and UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6,
                                    children = {
                                        DS.Button("🔧 超频调校 ($800)", function()
                                            doAction(navigate, "TUNE_GEAR", { gear_id = it.id })
                                        end, { height = 32, fontSize = 11, flexGrow = 1, backgroundColor = DS.C.ember }),
                                        DS.Button("📦 卸下入库", function()
                                            doAction(navigate, "UNEQUIP_GEAR", { gear_id = it.id })
                                        end, { height = 32, fontSize = 11, width = 80, variant = "secondary" }),
                                    }
                                }
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
                                isHired and UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6,
                                    children = {
                                        DS.Button("💼 指派商谈顶级代言 (-5精力)", function()
                                            doAction(navigate, "AGENT_PITCH_DEAL", { agent_id = k })
                                        end, { height = 32, fontSize = 11, flexGrow = 1, backgroundColor = DS.C.cyan }),
                                        DS.Button("❌ 解除代理", function()
                                            doAction(navigate, "FIRE_AGENT", { agent_id = k })
                                        end, { height = 32, fontSize = 11, width = 80, variant = "secondary" }),
                                    }
                                }
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
                local contractType = (game.player and game.player.agency and game.player.agency.contract_types and game.player.agency.contract_types[sp.id]) or "GUARANTEED"
                local contractBadge = (contractType == "INCENTIVE") and "🔥 对赌激励中 (1.6x)" or "🛡️ 稳妥履约中"

                table.insert(nodes, DS.Card {
                    borderColor = isSigned and (contractType == "INCENTIVE" and DS.C.ember or DS.C.success) or DS.C.border,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label(string.format("🏷️ %s [%s]", sp.brand, sp.category), { fontSize = 12, fontWeight = "bold", fontColor = isSigned and DS.C.success or DS.C.text }),
                                DS.Label(isSigned and string.format("✓ %s", contractBadge) or string.format("签约金: $%d", sp.signing_bonus), { fontSize = 11, fontColor = isSigned and (contractType == "INCENTIVE" and DS.C.ember or DS.C.success) or DS.C.gold }),
                            }
                        },
                        DS.Label(string.format("知名度门槛: %d  |  每场底薪: $%d  |  %s", sp.fame_req, sp.base_payout, sp.desc), { fontSize = 10, fontColor = DS.C.muted }),
                        UI.Panel {
                            width = "100%", marginTop = 4,
                            children = {
                                isSigned and UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6,
                                    children = {
                                        DS.Button("💰 申请提前划拨分红 (+$4,000)", function()
                                            doAction(navigate, "SPONSOR_ADVANCE", { sponsor_id = sp.id })
                                        end, { height = 32, fontSize = 11, flexGrow = 1, backgroundColor = DS.C.gold }),
                                        DS.Button("解除赞助", function()
                                            doAction(navigate, "CANCEL_SPONSOR", { sponsor_id = sp.id })
                                        end, { height = 32, fontSize = 11, width = 80, variant = "secondary" }),
                                    }
                                } or (fameOk and UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6,
                                    children = {
                                        DS.Button(string.format("🛡️ 稳妥保底款 (+$%d)", sp.signing_bonus), function()
                                            doAction(navigate, "SIGN_SPONSOR", { sponsor_id = sp.id, contract_type = "GUARANTEED" })
                                        end, { height = 34, fontSize = 10, flexGrow = 1, variant = "primary" }),
                                        DS.Button(string.format("🔥 对赌激励款 (+$%d, 1.6x)", math.floor(sp.signing_bonus * 1.6)), function()
                                            doAction(navigate, "SIGN_SPONSOR", { sponsor_id = sp.id, contract_type = "INCENTIVE" })
                                        end, { height = 34, fontSize = 10, flexGrow = 1, backgroundColor = DS.C.ember })
                                    }
                                } or DS.Button(string.format("知名度不足 (需 %d 点)", sp.fame_req), function() end, { height = 34, fontSize = 11, variant = "secondary" }))
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
                                isClaimed and DS.Button("✨ 在比赛与直播间亮出专属表情/勋章", function()
                                    doAction(navigate, "EQUIP_EMOTE_BADGE", { emote_id = m.title or "荣耀先锋" })
                                end, { height = 32, fontSize = 11, backgroundColor = "#7e22ce" })
                                    or DS.Button(isReady and "🎁 立即领取里程碑特权" or string.format("🔒 尚未达成 (差 %d 订阅)", m.req - subs), function()
                                        if isReady then doAction(navigate, "CLAIM_STREAM_MILESTONE", { milestone_id = m.id }) end
                                    end, { height = 34, fontSize = 11, variant = isReady and "primary" or "secondary" })
                            }
                        }
                    }
                })
            end
        end

    elseif activePillar == "ARENA" or curTab == "STAGE" or curTab == "ARENA" then
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
            local curStageSub = (activeSubId == "STAGE" and "LEAGUE") or activeSubId or game.stage_subtab or "LEAGUE"
            local stageSubtabs = {
                { id = "LEAGUE",  label = "🏟️ 联赛BP" },
                { id = "THEATER", label = "📺 峡谷沙盘" },
                { id = "DRILL",   label = "🧩 残局沙盘" },
                { id = "RADAR",   label = "📊 五维雷达" },
                { id = "META",    label = "📜 版本梯度" },
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

            if curStageSub == "THEATER" then
                table.insert(nodes, DS.SectionHeader("📺 2D 比赛演播剧场与峡谷战术沙盘", "实况雷达", nil))
                if MatchBroadcastScreen then
                    table.insert(nodes, MatchBroadcastScreen.Build(game, vs, navigate, function(act, payload)
                        doAction(navigate, act, payload)
                    end))
                end

            elseif curStageSub == "LEAGUE" then
                if vs.current_visual_match ~= nil then
                    table.insert(nodes, DS.Card {
                        backgroundColor = "#0e1828", borderColor = DS.C.info,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label("📺 【比赛演播进行中】2D 召唤师峡谷战术沙盘已就绪！", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                                    DS.Button("📺 立即观赛", function()
                                        game.stage_subtab = "THEATER"
                                        if navigate then navigate("esport_sim") end
                                    end, { width = 90, height = 28, fontSize = 11, backgroundColor = DS.C.ember })
                                }
                            }
                        }
                    })
                else
                    local nextFix = vs.current_fixture or (vs.league_schedule and vs.league_schedule[1])
                    local rivalName = (nextFix and nextFix.opponent_name) or "T1 (魔王宿敌)"
                    local rivalStar = (nextFix and nextFix.star_player) or "Faker (大魔王)"
                    local rivalTactic = (nextFix and nextFix.key_tactic) or "大龙逼团与灵性开团"
                    local rivalThreat = (nextFix and nextFix.threat) or "SSS"

                    table.insert(nodes, DS.Card {
                        backgroundColor = "#141724", borderColor = DS.C.ember, borderWidth = 2, padding = 12, gap = 8,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label("🎯 赛前 BP 战术体系部署与对手破译 (Matchday BP Studio)", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                                    DS.CyberBadge(string.format("劲敌评级 %s", rivalThreat), (rivalThreat == "SSS" or rivalThreat == "S+") and "gold" or "ember")
                                }
                            },
                            DS.Label(string.format("对阵豪强: %s  |  对方王牌: %s  |  敌方战术: %s", rivalName, rivalStar, rivalTactic),
                                { fontSize = 11, fontColor = DS.C.text }),
                            DS.Label("根据情报选择克制战术，激活 +15% 战力增益并直接无缝转入召唤师峡谷 2D 沙盘实况演播！",
                                { fontSize = 10, fontColor = DS.C.info }),
                            UI.Panel {
                                width = "100%", flexDirection = "column", gap = 6, marginTop = 4,
                                children = {
                                    DS.Button("🗡️ 冲阵强突体系 (Dive Comp) · 突脸秒核心 [+15% 克制加成]", function()
                                        game.stage_subtab = "THEATER"
                                        doAction(navigate, "CHOOSE_BP_TACTIC", { tactic_id = "DIVE", rival_name = rivalName })
                                    end, { height = 36, fontSize = 11, backgroundColor = "#b91c1c" }),
                                    DS.Button("🏹 远距拉扯体系 (Poke Comp) · 绝境超远消耗 [+15% 克制加成]", function()
                                        game.stage_subtab = "THEATER"
                                        doAction(navigate, "CHOOSE_BP_TACTIC", { tactic_id = "POKE", rival_name = rivalName })
                                    end, { height = 36, fontSize = 11, backgroundColor = "#0284c7" }),
                                    DS.Button("🛡️ 铁桶团战体系 (Teamfight Comp) · 龙坑阵地战 [+15% 克制加成]", function()
                                        game.stage_subtab = "THEATER"
                                        doAction(navigate, "CHOOSE_BP_TACTIC", { tactic_id = "TEAMFIGHT", rival_name = rivalName })
                                    end, { height = 36, fontSize = 11, backgroundColor = "#15803d" }),
                                }
                            }
                        }
                    })
                end

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

                -- Detailed 4-Round Match Broadcast Report if available
                if vs.last_match_report then
                    local rep = vs.last_match_report
                    local repNodes = {}
                    local outcomeTitle = rep.win and "🏆 比赛大捷 · 胜利 (VICTORY)" or "💔 遗憾惜败 · 告负 (DEFEAT)"
                    local outcomeCol = rep.win and DS.C.success or DS.C.error

                    table.insert(repNodes, UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(outcomeTitle, { fontSize = 13, fontWeight = "bold", fontColor = outcomeCol }),
                            DS.Label(string.format("击杀比: %d : %d", (rep.score and rep.score.self) or 0, (rep.score and rep.score.enemy) or 0), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        }
                    })

                    -- Objectives summary
                    local baronStr = (rep.baron == "SELF") and "我方强开抢下" or ((rep.baron == "ENEMY") and "敌方偷下" or "龙坑牵扯未打")
                    local dragonsStr = string.format("小龙比 %d : %d", ((rep.dragons and rep.dragons.self) or 0), ((rep.dragons and rep.dragons.enemy) or 0))
                    table.insert(repNodes, DS.Label(string.format("纳什男爵: %s  |  巨龙资源: %s", baronStr, dragonsStr), { fontSize = 10, fontColor = DS.C.info }))

                    -- 4 Tactical Rounds
                    table.insert(repNodes, DS.Label("⚔️ 4 大战术回合推演过程:", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text, marginTop = 4 }))
                    for _, rd in ipairs(rep.rounds or {}) do
                        local rdCol = (rd.winner == "SELF") and DS.C.success or DS.C.ember
                        table.insert(repNodes, UI.Panel {
                            width = "100%", backgroundColor = DS.C.surfaceInset, padding = 6, borderRadius = 4, marginTop = 2,
                            children = {
                                DS.Label(string.format("[%s] %s", rd.phase or "", rd.title or ""), { fontSize = 10, fontWeight = "bold", fontColor = rdCol }),
                                DS.Label(rd.desc or "", { fontSize = 9, fontColor = DS.C.textDim, marginTop = 1 }),
                            }
                        })
                    end

                    -- Highlights
                    if rep.highlights and #rep.highlights > 0 then
                        table.insert(repNodes, DS.Label("⚡ 本场精彩高光镜头 (Highlight Reel):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold, marginTop = 4 }))
                        for _, hl in ipairs(rep.highlights) do
                            table.insert(repNodes, DS.Label("• " .. hl, { fontSize = 9, fontColor = DS.C.cyan, marginLeft = 4 }))
                        end
                    end

                    -- Caster Commentary
                    if rep.commentary and rep.commentary ~= "" then
                        table.insert(repNodes, UI.Panel {
                            width = "100%", backgroundColor = "#1e1a0e", borderColor = DS.C.gold, borderWidth = 1, padding = 6, borderRadius = 4, marginTop = 4,
                            children = {
                                DS.Label("🎙️ 官方解说席点评:", { fontSize = 9, fontWeight = "bold", fontColor = DS.C.gold }),
                                DS.Label(rep.commentary, { fontSize = 10, fontColor = DS.C.gold, marginTop = 2 }),
                            }
                        })
                    end

                    table.insert(nodes, DS.Card {
                        backgroundColor = rep.win and "#0e1814" or "#1a0f12",
                        borderColor = outcomeCol,
                        children = repNodes
                    })
                end

                -- Stage Action List
                local stageActions = {
                    { id = "START_VISUAL_MATCH", label = "📺 开启 2D 峡谷沙盘与实况演播 (Live Theater)", desc = "全景 2D 召唤师峡谷战术雷达、十人动线、5s 大龙抉择与 MVP 颁奖" },
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

    elseif activePillar == "CLUB" or curTab == "DYNASTY" or curTab == "CLUB" then
        -- --------------------------------------------------------------------
        -- TAB 3: DYNASTY TYCOON & 4 MANAGEMENT SUBTABS
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("👑 传奇俱乐部王朝与商业运营 (Dynasty)", "俱乐部经营", nil))

        -- Dynasty Subtab Pills
        local curSub = activeSubId or game.dynasty_subtab or "ROSTER"
        local subtabs = {
            { id = "ROSTER",     label = "👥首发" },
            { id = "TRANSFER",   label = "❄️转会" },
            { id = "FACILITIES", label = "🏢基地" },
            { id = "ACADEMY",    label = "🎓青训" },
            { id = "DYNAMICS",   label = "⚔️阵型" },
            { id = "BOOTCAMP",   label = "✈️特训" },
            { id = "EXPANSION",  label = "🌟选秀" },
            { id = "JERSEY",     label = "👕战袍" },
            { id = "COACH",      label = "💼股权" },
            { id = "OVERVIEW",   label = "📊经营" },
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
            width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 6, marginTop = 4, children = subButtons
        })

        if curSub == "ROSTER" or curSub == "CLUB" then
            table.insert(nodes, DS.SectionHeader("👥 战队 5v5 首发阵容 (Active 5-Man Starters)", "战力调度", nil))

            local rData = vs.roster or (game.roster) or {}
            local starters = rData.starters or {}
            local rolesOrder = { "TOP", "JUG", "MID", "ADC", "SUP" }
            local roleLabels = {
                TOP = "🛡️ 上单 (TOP)",
                JUG = "🌲 打野 (JUG)",
                MID = "⚡ 中单 (MID)",
                ADC = "🎯 射手 (ADC)",
                SUP = "🛡️ 辅助 (SUP)"
            }

            for _, role in ipairs(rolesOrder) do
                local p = starters[role]
                if p then
                    local gradeColor = (p.grade == "S+" or p.grade == "SSS") and "#ef4444" or ((p.grade == "S" or p.grade == "A+") and DS.C.gold or DS.C.cyan)
                    table.insert(nodes, DS.Card {
                        borderColor = p.is_player and DS.C.gold or DS.C.border,
                        borderWidth = p.is_player and 2 or 1,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    UI.Panel {
                                        flexDirection = "row", alignItems = "center", gap = 6,
                                        children = {
                                            DS.CyberBadge(roleLabels[role] or role, p.is_player and "gold" or "secondary"),
                                            DS.Label(p.name .. (p.is_player and " (你方核心)" or ""), { fontSize = 12, fontWeight = "bold", fontColor = p.is_player and DS.C.gold or DS.C.text })
                                        }
                                    },
                                    DS.Label(string.format("战力: %d [%s]", p.ovr or 80, p.grade or "A"), { fontSize = 11, fontWeight = "bold", fontColor = gradeColor })
                                }
                            },
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(string.format("微操: %d  |  心态: %d  |  竞技状态: %d%%", p.mechanics or 80, p.mental or 80, p.form or 95), { fontSize = 10, fontColor = DS.C.info }),
                                    DS.EnergyBattery(p.morale or 90, 100)
                                }
                            },
                            UI.Panel {
                                width = "100%", flexDirection = "row", gap = 6, marginTop = 4,
                                children = {
                                    DS.Button("🎯 专属大师特训 ($1,200)", function()
                                        doAction(navigate, "TRAIN_ROSTER_PLAYER", { role = role })
                                    end, { height = 30, fontSize = 10, flexGrow = 1, backgroundColor = DS.C.ember }),
                                    DS.Button(string.format("🔄 轮换 %s 替补", role), function()
                                        local candidate = nil
                                        for _, b in ipairs(rData.bench or {}) do
                                            if b.role == role then candidate = b break end
                                        end
                                        if candidate then
                                            doAction(navigate, "SWAP_ROSTER", { role = role, candidate_id = candidate.id })
                                        else
                                            doAction(navigate, "SWAP_ROSTER", { role = role, candidate_id = "nonexistent" })
                                        end
                                    end, { height = 30, fontSize = 10, flexGrow = 1, variant = "secondary" })
                                }
                            }
                        }
                    })
                end
            end

            -- BENCH CANDIDATES
            table.insert(nodes, DS.SectionHeader("🪑 战队替补席与储备人才库 (Bench & Reserves)", "阵容深度", nil))
            local benchList = rData.bench or {}
            if #benchList == 0 then
                table.insert(nodes, DS.Card {
                    children = {
                        DS.Label("替补席当前暂无储备队员。可前往【青训基地】搜寻或【选秀大会】招募新星！", { fontSize = 11, fontColor = DS.C.muted })
                    }
                })
            else
                for _, b in ipairs(benchList) do
                    table.insert(nodes, DS.Card {
                        padding = 8, gap = 4,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    UI.Panel {
                                        flexDirection = "row", alignItems = "center", gap = 6,
                                        children = {
                                            DS.CyberBadge(b.role or "SUB", "secondary"),
                                            DS.Label(b.name, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text })
                                        }
                                    },
                                    DS.Label(string.format("战力: %d [%s]", b.ovr or 75, b.grade or "A"), { fontSize = 10, fontColor = DS.C.gold })
                                }
                            },
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label(string.format("微操: %d | 心态: %d | 士气: %d%%", b.mechanics or 75, b.mental or 75, b.morale or 80), { fontSize = 9, fontColor = DS.C.textDim }),
                                    DS.Button(string.format("🔄 提拔为 %s 首发", b.role), function()
                                        doAction(navigate, "SWAP_ROSTER", { role = b.role, candidate_id = b.id })
                                    end, { height = 26, fontSize = 9, width = 110, backgroundColor = DS.C.cyan })
                                }
                            }
                        }
                    })
                end
            end

        elseif curSub == "TRANSFER" then
            table.insert(nodes, DS.SectionHeader("❄️ 冬季全球转会期与薪资财政公约 (Transfer & Salary Cap)", "全球转会与公约", nil))

            local tm = vs.transfer_market or (game.transfer_market) or {}
            local capRep = vs.salary_cap_report or (game.getSalaryCapReport and game:getSalaryCapReport()) or {
                total_salary = 240000,
                effective_salary = 210000,
                franchise_relief = 30000,
                franchise_player_id = "mid_player",
                soft_cap = 250000,
                over_cap = 0,
                luxury_tax = 0,
                rebate = 10000,
                breakdown = {}
            }

            local isActive = tm.active
            local currentWeek = tm.current_week or 1

            -- 1. Top Executive Summary Card
            local capPercent = math.min(100, math.floor((capRep.effective_salary / (capRep.soft_cap > 0 and capRep.soft_cap or 250000)) * 100))
            local capBarColor = capRep.over_cap > 0 and DS.C.danger or (capPercent > 85 and DS.C.warning or DS.C.success)
            local statusBadgeText = isActive and string.format("第 %d/4 周 · 激烈竞价中", currentWeek) or "休赛期未开启"
            local statusBadgeVariant = isActive and "gold" or "secondary"

            table.insert(nodes, DS.Card {
                backgroundColor = "#101626", borderColor = DS.C.cyan,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label("❄️【2026 全球冬季转会窗口】", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.cyan }),
                            DS.CyberBadge(statusBadgeText, statusBadgeVariant)
                        }
                    },
                    DS.Label(string.format("联盟软工资帽: $%d  |  战队实际计税薪资: $%d (%d%%)", capRep.soft_cap, capRep.effective_salary, capPercent),
                        { fontSize = 11, fontColor = DS.C.text, marginTop = 4 }),
                    makeBar(capPercent, capBarColor, 6),
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", marginTop = 4,
                        children = {
                            DS.Label(string.format("名义总薪资: $%d (建队特权减免 -$%d)", capRep.total_salary, capRep.franchise_relief), { fontSize = 10, fontColor = DS.C.textDim }),
                            capRep.over_cap > 0
                                and DS.Label(string.format("⚠️ 超帽 $%d (预计缴纳奢侈税 -$%d)", capRep.over_cap, capRep.luxury_tax), { fontSize = 10, fontWeight = "bold", fontColor = DS.C.danger })
                                or DS.Label(string.format("🌟 空间充裕 (预计获财政分红 +$%d)", capRep.rebate), { fontSize = 10, fontWeight = "bold", fontColor = DS.C.success })
                        }
                    }
                }
            })

            -- 2. Three-way view switcher
            game.transfer_view_mode = game.transfer_view_mode or "IN_HOUSE"
            local curMode = game.transfer_view_mode
            local modes = {
                { id = "IN_HOUSE", label = "📋 队内合同自检" },
                { id = "GLOBAL_MARKET", label = "🌐 全球自由人竞价" },
                { id = "SALARY_CAP", label = "⚖️ 工资帽与财政公约" },
            }
            local modeButtons = {}
            for _, m in ipairs(modes) do
                local isMActive = (curMode == m.id)
                table.insert(modeButtons, UI.Button {
                    text = m.label,
                    flexGrow = 1, flexBasis = 0, height = 30, fontSize = 10,
                    fontWeight = isMActive and "bold" or "normal",
                    backgroundColor = isMActive and DS.C.cyan or DS.C.surfaceAlt,
                    textColor = isMActive and "#0c1524" or DS.C.text,
                    borderWidth = 1, borderColor = isMActive and DS.C.cyan or DS.C.border, borderRadius = 6,
                    onClick = function()
                        game.transfer_view_mode = m.id
                        if navigate then navigate("esport_sim") end
                    end
                })
            end
            table.insert(nodes, UI.Panel {
                width = "100%", flexDirection = "row", gap = 6, marginTop = 4, marginBottom = 4, children = modeButtons
            })

            -- 3. Sub-View Content
            if curMode == "IN_HOUSE" then
                -- 队内合同自检与续约协商
                table.insert(nodes, DS.Label("👥 战队现有选手合同库 (点击进行续约重组或特权保护):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }))
                local breakdown = capRep.breakdown or {}
                if #breakdown == 0 then
                    table.insert(nodes, DS.Label("暂无选手合同数据", { fontSize = 11, fontColor = DS.C.textDim }))
                else
                    for _, p in ipairs(breakdown) do
                        local isFranchise = p.is_franchise
                        local pBorderColor = isFranchise and DS.C.gold or (p.is_starter and DS.C.border or "#262b3d")
                        local cardChildren = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    UI.Panel {
                                        flexDirection = "row", alignItems = "center", gap = 6,
                                        children = {
                                            DS.CyberBadge(p.role, p.is_starter and "gold" or "secondary"),
                                            DS.Label(p.name .. (isFranchise and " 👑[特权标签]" or ""), { fontSize = 12, fontWeight = "bold", fontColor = isFranchise and DS.C.gold or DS.C.text }),
                                        }
                                    },
                                    DS.Label(string.format("年薪: $%d | 剩余 %d 年", p.salary, p.years_left), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.cyan })
                                }
                            },
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", marginTop = 3,
                                children = {
                                    DS.Label(string.format("首发承诺: %s  |  世界赛条款: %s  |  买断解约金: $%d",
                                        p.starter_guarantee and "保证首发" or "轮换竞岗",
                                        p.worlds_promise and "承诺晋级" or "无特殊要求",
                                        p.buyout_fee or (p.salary * 2)), { fontSize = 9, fontColor = DS.C.textDim })
                                }
                            }
                        }

                        local btnPanels = {}
                        if not isFranchise then
                            table.insert(btnPanels, DS.Button("👑 指定特权标签(减免50%薪资计税)", function()
                                doAction(navigate, "ASSIGN_FRANCHISE_TAG", { player_id = p.id })
                            end, { flexGrow = 1, height = 28, fontSize = 9, backgroundColor = DS.C.gold, textColor = "#1a0e08" }))
                        end
                        table.insert(btnPanels, DS.Button("🤝 递交2年续约合同(年薪+$3K)", function()
                            doAction(navigate, "OFFER_CONTRACT", {
                                player_id = p.id,
                                salary = p.salary + 3000,
                                years = 2,
                                starter_guarantee = true,
                                worlds_promise = true
                            })
                        end, { flexGrow = 1, height = 28, fontSize = 9, backgroundColor = DS.C.surfaceAlt, textColor = DS.C.text }))
                        table.insert(btnPanels, DS.Button("🏷️ 挂牌出售套现", function()
                            doAction(navigate, "LIST_PLAYER_FOR_SALE", {
                                player_id = p.id,
                                asking_price = math.floor(p.salary * 1.5)
                            })
                        end, { height = 28, fontSize = 9, backgroundColor = "#4a1c1d", textColor = "#ff8888" }))

                        table.insert(cardChildren, UI.Panel {
                            width = "100%", flexDirection = "row", gap = 6, marginTop = 6,
                            children = btnPanels
                        })

                        table.insert(nodes, DS.Card {
                            borderColor = pBorderColor,
                            children = cardChildren
                        })
                    end
                end

            elseif curMode == "GLOBAL_MARKET" then
                -- 全球自由人竞价战场
                table.insert(nodes, DS.Label("🌐 全球自由人转会大鱼 (与其他顶级豪门竞标争夺):", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.cyan }))
                local fas = tm.global_free_agents or {}
                if #fas == 0 then
                    table.insert(nodes, DS.Card {
                        children = {
                            DS.Label("🎉 全球自由人市场转会竞标已全部落槌签约！", { fontSize = 12, fontColor = DS.C.success })
                        }
                    })
                else
                    for _, fa in ipairs(fas) do
                        local tierCol = (fa.tier == "SSS" or fa.tier == "S+") and "#ef4444" or DS.C.gold
                        local signingBonus = math.floor(fa.asking_salary * 0.25)
                        local competing = fa.competing_bid
                        local isLeading = competing and competing.club == "DYNASTY (YOU)"

                        table.insert(nodes, DS.Card {
                            borderColor = isLeading and DS.C.success or (competing and DS.C.danger or DS.C.border),
                            children = {
                                UI.Panel {
                                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                    children = {
                                        UI.Panel {
                                            flexDirection = "row", alignItems = "center", gap = 6,
                                            children = {
                                                DS.CyberBadge(fa.role, "primary"),
                                                DS.Label(fa.name, { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                                                DS.CyberBadge(fa.tier, "danger")
                                            }
                                        },
                                        DS.Label(string.format("综合战力: %d", fa.ovr), { fontSize = 11, fontWeight = "bold", fontColor = tierCol })
                                    }
                                },
                                UI.Panel {
                                    width = "100%", flexDirection = "row", justifyContent = "space-between", marginTop = 3,
                                    children = {
                                        DS.Label(string.format("微操: %d  |  心态: %d  |  市场估值: $%d", fa.mechanics, fa.mental, fa.market_value), { fontSize = 9, fontColor = DS.C.info }),
                                        DS.Label(string.format("期望年薪: $%d (签字费 $%d)", fa.asking_salary, signingBonus), { fontSize = 9, fontColor = DS.C.gold })
                                    }
                                },
                                UI.Panel {
                                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center", marginTop = 4,
                                    children = {
                                        competing and DS.Label(string.format("竞标动态: [%s] 出价 $%d (%s)", competing.club, competing.salary, isLeading and "我方领跑" or "截胡领先"),
                                            { fontSize = 10, fontWeight = "bold", fontColor = isLeading and DS.C.success or DS.C.danger })
                                            or DS.Label("竞标动态: 暂无竞争出价，等待递交报价单", { fontSize = 10, fontColor = DS.C.textDim }),
                                    }
                                },
                                UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6, marginTop = 6,
                                    children = {
                                        DS.Button(string.format("🎯 匹配期望报价 ($%d/年)", fa.asking_salary), function()
                                            doAction(navigate, "SUBMIT_TRANSFER_BID", {
                                                player_id = fa.id,
                                                salary = fa.asking_salary,
                                                years = 2,
                                                starter_guarantee = true,
                                                worlds_promise = true
                                            })
                                        end, { flexGrow = 1, height = 28, fontSize = 9, backgroundColor = DS.C.cyan, textColor = "#0b1424" }),
                                        DS.Button(string.format("💰 豪掷千金截胡 ($%d/年)", math.floor(fa.asking_salary * 1.15)), function()
                                            doAction(navigate, "SUBMIT_TRANSFER_BID", {
                                                player_id = fa.id,
                                                salary = math.floor(fa.asking_salary * 1.15),
                                                years = 3,
                                                starter_guarantee = true,
                                                worlds_promise = true
                                            })
                                        end, { flexGrow = 1, height = 28, fontSize = 9, backgroundColor = DS.C.gold, textColor = "#1a0e08" }),
                                    }
                                }
                            }
                        })
                    end
                end

            elseif curMode == "SALARY_CAP" then
                -- 工资帽与财政公约
                table.insert(nodes, DS.Card {
                    backgroundColor = "#121927", borderColor = DS.C.gold,
                    children = {
                        DS.Label("📜【全球电竞赛事联盟薪资帽与财政公平法案】", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label("1. 联盟软工资帽基准: $250,000 / 赛季。", { fontSize = 10, fontColor = DS.C.text, marginTop = 3 }),
                        DS.Label("2. 建队特权选手 (Franchise Tag): 每队可指定 1 名功勋/核心选手，其薪资在工资帽中享受 50% 豁免！", { fontSize = 10, fontColor = DS.C.text }),
                        DS.Label("3. 阶梯式超额奢侈税公约:", { fontSize = 10, fontWeight = "bold", fontColor = DS.C.warning, marginTop = 3 }),
                        DS.Label("   · 超帽第一阶梯 ($0 ~ $50,000): 150% 奢侈税率征收", { fontSize = 9, fontColor = DS.C.textDim }),
                        DS.Label("   · 超帽第二阶梯 (> $50,000): 250% 惩罚性重税征收", { fontSize = 9, fontColor = DS.C.textDim }),
                        DS.Label("4. 恪守薪资公约返还池: 薪资未触顶的模范俱乐部，将在休赛期结算时获得全联盟奢侈税分红池 25% 的高额返款！", { fontSize = 10, fontColor = DS.C.success, marginTop = 3 })
                    }
                })

                -- 转会日志 Transfer Logs
                table.insert(nodes, DS.SectionHeader("📰 转会期重磅通告与媒体报导", "转会日志", nil))
                local logs = tm.transfer_logs or {}
                if #logs == 0 then
                    table.insert(nodes, DS.Label("暂无最新转会期快讯", { fontSize = 10, fontColor = DS.C.textDim }))
                else
                    for i = #logs, math.max(1, #logs - 5), -1 do
                        table.insert(nodes, DS.Card {
                            children = {
                                DS.Label(logs[i], { fontSize = 10, fontColor = DS.C.text })
                            }
                        })
                    end
                end
            end

            -- 4. Bottom Footer Action (Week Advance / Finalize)
            if isActive then
                if currentWeek < 4 then
                    table.insert(nodes, DS.Button(string.format("⏩ 推进至冬季转会期第 %d 周 (完成本周报价结算与对手截胡)", currentWeek + 1), function()
                        doAction(navigate, "ADVANCE_TRANSFER_WEEK", {})
                    end, { height = 38, fontSize = 12, fontWeight = "bold", backgroundColor = DS.C.cyan, textColor = "#0b1424", marginTop = 8 }))
                else
                    table.insert(nodes, DS.Button("🏆 锁定 2027 新赛季大名单 (缴纳奢侈税/收取分红，揭幕新常规赛)", function()
                        doAction(navigate, "FINALIZE_OFFSEASON", {})
                    end, { height = 38, fontSize = 12, fontWeight = "bold", backgroundColor = DS.C.gold, textColor = "#1a0e08", marginTop = 8 }))
                end
            else
                table.insert(nodes, DS.Button("❄️ 开启 2026 冬季转会期 (开启 4 周全球转会与合同博弈)", function()
                    doAction(navigate, "OPEN_TRANSFER_WINDOW", {})
                end, { height = 38, fontSize = 12, fontWeight = "bold", backgroundColor = DS.C.gold, textColor = "#1a0e08", marginTop = 8 }))
            end

        elseif curSub == "OVERVIEW" then
            if vs.phase < 3 then
                table.insert(nodes, DS.Card {
                    backgroundColor = "#141824", borderColor = DS.C.gold,
                    children = {
                        DS.Label("👑 俱乐部王朝模式终极收购目标 (Dynasty Tycoon)", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label("进阶要求: 退役并注资 $1,000,000 收购电竞俱乐部成为老板兼幕后操盘手！", { fontSize = 11, fontColor = DS.C.text }),
                        DS.Label(string.format("当前个人储蓄: $%d / $1,000,000", vs.money), { fontSize = 11, fontColor = DS.C.success }),
                        makeBar(vs.money / 10000, DS.C.gold, 5),
                        DS.Button("👑 快捷注资收购俱乐部 (进入 Phase 3 幕后老板模式)", function()
                            game.phase = 3
                            game.unlocked_phases[3] = true
                            game.player.money = math.max(game.player.money, 1000000)
                            if navigate then navigate("esport_sim") end
                        end, { height = 36, fontSize = 12, marginTop = 6 }),
                    }
                })
            end
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
                    local costVal = f.cost * curLv
                    table.insert(nodes, DS.ActionTile {
                        badge = "Lv." .. curLv,
                        badgeVariant = isMax and "gold" or "ember",
                        title = f.name .. (isMax and " (满级巅峰)" or string.format(" -> Lv.%d", curLv + 1)),
                        desc = f.desc,
                        costText = isMax and "MAX" or string.format("$%d", costVal),
                        disabled = isMax,
                        actionLabel = isMax and "已达满级" or "升级硬件",
                        onAction = function()
                            if not isMax then doAction(navigate, "UPGRADE_FACILITY", { facility_id = f.id }) end
                        end
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

                -- REVEAL CARD FOR JUST SCOUTED PRODIGY
                local scouted = vs.last_scouted_trainee or (game and game.last_scouted_trainee)
                if scouted then
                    local sTier = scouted.tier or scouted.grade or "A"
                    local tierCol = (sTier == "SSS" or sTier == "SS") and "#ec4899" or ((sTier == "S") and DS.C.gold or DS.C.cyan)
                    local sellFee = (sTier == "S" and 38000) or ((sTier == "A") and 18000 or 8000)
                    table.insert(nodes, DS.Card {
                        backgroundColor = "#161b26", borderColor = tierCol, borderWidth = 2, padding = 12, gap = 8,
                        children = {
                            UI.Panel {
                                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                                children = {
                                    DS.Label("🌟【刚刚发掘的超新星】球探即时报告", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                                    DS.CyberBadge(string.format("[%s级] %s", sTier, scouted.role or "MID"), "gold")
                                }
                            },
                            DS.Label(string.format("选手代号: %s  |  微操潜能: %d  |  大局观: %d  |  竞技心态: %d",
                                scouted.name, scouted.mechanics or 80, math.floor((scouted.mechanics or 80) * 0.95), scouted.form or 100),
                                { fontSize = 11, fontColor = DS.C.text }),
                            DS.Label(string.format("星探评语: 极具杀气的年轻核心，可提拔为一队首发培养，或挂牌次级联赛套现 +$%d 俱乐部发展金！",
                                sellFee), { fontSize = 10, fontColor = DS.C.info }),
                            UI.Panel {
                                width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                                children = {
                                    DS.Button("⭐ 破格提拔至俱乐部一队首发", function()
                                        doAction(navigate, "PROMOTE_TRAINEE", { trainee_id = scouted.id })
                                    end, { height = 36, fontSize = 11, flexGrow = 1, backgroundColor = DS.C.ember }),
                                    DS.Button(string.format("💰 挂牌次级联赛套现 (+$%d)", sellFee), function()
                                        doAction(navigate, "SELL_TRAINEE", { trainee_id = scouted.id })
                                    end, { height = 36, fontSize = 11, flexGrow = 1, backgroundColor = DS.C.gold, textColor = "#120d04" })
                                }
                            }
                        }
                    })
                end

                if traineeCnt == 0 and not scouted then
                    table.insert(nodes, DS.EmptyState("青训营暂无在训新人", "点击上方按钮派遣星探，发掘拥有 S/A 级潜力的超新星！"))
                else
                    for i = 1, math.min(4, traineeCnt) do
                        local t = game.academy.trainees[i]
                        local tTier = t.tier or t.grade or "B"
                        local traineeFee = (tTier == "S" and 38000) or ((tTier == "A") and 18000 or 8000)
                        table.insert(nodes, UI.Panel {
                            width = "100%", flexDirection = "column", gap = 4,
                            children = {
                                DS.PlayerCard({
                                    name = t.name,
                                    role = t.role,
                                    tier = tTier,
                                    ovr = t.potential or t.mechanics or 80,
                                    mechanics = t.mechanics or 75,
                                    awareness = math.floor((t.mechanics or 75) * 0.95),
                                    mentality = t.form or 100,
                                }),
                                UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6,
                                    children = {
                                        DS.Button("⭐ 破格提拔一队", function()
                                            doAction(navigate, "PROMOTE_TRAINEE", { trainee_id = t.id })
                                        end, { height = 30, fontSize = 10, flexGrow = 1, variant = "secondary" }),
                                        DS.Button(string.format("💰 次级联赛转会 (+$%d)", traineeFee), function()
                                            doAction(navigate, "SELL_TRAINEE", { trainee_id = t.id })
                                        end, { height = 30, fontSize = 10, flexGrow = 1, backgroundColor = "#3b2a1a", textColor = DS.C.gold })
                                    }
                                }
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

    elseif activePillar == "LEGACY" or curTab == "TOUR" or curTab == "LEGACY" then
        -- --------------------------------------------------------------------
        -- TAB 4: WORLD TOUR, POWER RANKINGS, TALENT TREE & LORE (4 SUBTABS)
        -- --------------------------------------------------------------------
        local curTourSub = activeSubId or game.tour_subtab or "TOUR"
        local tourTabs = {
            { id = "TOUR",     label = "🌍 巡回关卡" },
            { id = "RANKINGS", label = "📊 豪门榜" },
            { id = "HOF",      label = "🏛️ 名人堂" },
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

        elseif curTourSub == "HOF" then
            table.insert(nodes, DS.SectionHeader("🏛️ 传奇名人堂与退役战袍展厅 (Hall of Fame & Retired Jerseys)", "电竞丰碑", nil))

            local hof = vs.hall_of_fame or (game.hall_of_fame) or {}
            local legends = hof.legends or {}
            local eqAuraId = hof.equipped_aura_id
            local eqAura = hof.equipped_aura

            -- Active Aura Banner Card
            if eqAura then
                table.insert(nodes, DS.Card {
                    backgroundColor = "#1b1424", borderColor = "#c08bff", borderWidth = 1,
                    children = {
                        UI.Panel {
                            width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                DS.Label("✨【当前激活的名宿意志庇佑】" .. (eqAura.name or ""), { fontSize = 12, fontWeight = "bold", fontColor = "#c08bff" }),
                                DS.Label(string.format("胜率+%d%%", eqAura.winRateBonus or 0), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                            }
                        },
                        DS.Label(eqAura.desc or "", { fontSize = 10, fontColor = DS.C.text, marginTop = 2 }),
                    }
                })
            else
                table.insert(nodes, DS.Card {
                    backgroundColor = DS.C.surfaceInset,
                    children = {
                        DS.Label("⚠️ 当前未激活名宿意志庇护。请在下方传奇展台中挑选一位名宿并激活其被动意志！", { fontSize = 10, fontColor = DS.C.muted }),
                    }
                })
            end

            -- Induction Action
            table.insert(nodes, DS.Card {
                children = {
                    DS.Label("👑 自创选手封神仪式 (Induct Player into Hall of Fame)", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                    DS.Label("将你当前的生涯荣耀铭刻于名人堂穹顶，退役战袍永久悬挂！", { fontSize = 10, fontColor = DS.C.muted }),
                    DS.Button("📜 举行退役仪式并载入名人堂 (#99号战袍)", function()
                        doAction(navigate, "INDUCT_HOF", {
                            name = (game.player and game.player.name) or "宿命之子",
                            role = (game.player and game.player.position) or "MID",
                            jerseyNumber = "#99",
                        })
                    end, { height = 36, fontSize = 11, marginTop = 4, variant = "secondary" })
                }
            })

            -- Legends & Retired Jerseys
            for _, leg in ipairs(legends) do
                local isAuraEq = (eqAuraId and leg.aura and eqAuraId == leg.aura.id)
                local legNodes = {}

                table.insert(legNodes, UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        DS.Label(string.format("👕【%s号战袍】%s · %s", leg.jerseyNumber or "#", leg.name or "", leg.title or ""), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label(string.format("GOAT: %.1f ⭐", leg.goatScore or 90), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.cyan }),
                    }
                })

                table.insert(legNodes, DS.Label(string.format("位置: %s  |  活跃生涯: %s  |  冠军奖杯: %d 座  |  生涯KDA: %s", leg.role or "", leg.years or "", leg.trophiesCount or 0, tostring(leg.careerKDA or "5.0")), { fontSize = 10, fontColor = DS.C.info, marginTop = 2 }))
                table.insert(legNodes, DS.Label("招牌绝活: " .. (leg.signatureChamps or "全英雄精通"), { fontSize = 9, fontColor = DS.C.textDim, marginTop = 1 }))
                table.insert(legNodes, DS.Label("传奇故事: " .. (leg.lore or ""), { fontSize = 9, fontColor = DS.C.muted, marginTop = 2 }))

                if leg.aura then
                    table.insert(legNodes, UI.Panel {
                        width = "100%", backgroundColor = DS.C.surfaceInset, padding = 6, borderRadius = 4, marginTop = 4,
                        children = {
                            DS.Label("⚡ 名宿专属意志: " .. (leg.aura.name or ""), { fontSize = 10, fontWeight = "bold", fontColor = "#c08bff" }),
                            DS.Label(leg.aura.desc or "", { fontSize = 9, fontColor = DS.C.textDim, marginTop = 1 }),
                        }
                    })

                    table.insert(legNodes, DS.Button(isAuraEq and "✨ 已激活名宿意志 (Active)" or "⚡ 激活此名宿意志加成", function()
                        if not isAuraEq then
                            doAction(navigate, "EQUIP_HOF_AURA", { aura_id = leg.aura.id })
                        end
                    end, { height = 32, fontSize = 11, marginTop = 4, variant = isAuraEq and "primary" or "secondary" }))
                end

                table.insert(nodes, DS.Card {
                    backgroundColor = isAuraEq and "#191522" or DS.C.surface,
                    borderColor = isAuraEq and "#c08bff" or DS.C.border,
                    borderWidth = isAuraEq and 2 or 1,
                    children = legNodes
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
                                isEquipped and UI.Panel {
                                    width = "100%", flexDirection = "row", gap = 6,
                                    children = {
                                        DS.Button("✨ 缅怀铭文与擦拭神戒 (心态+4, 自信+10)", function()
                                            doAction(navigate, "POLISH_RING", { ring_id = ring.id })
                                        end, { height = 32, fontSize = 11, flexGrow = 1, backgroundColor = DS.C.gold }),
                                        DS.Button("放进展柜", function()
                                            doAction(navigate, "UNEQUIP_RING", { ring_id = ring.id })
                                        end, { height = 32, fontSize = 11, width = 80, variant = "secondary" }),
                                    }
                                }
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
                                isUnlocked and DS.Button("🔄 传承树洗点重配 (全额返还声望)", function()
                                    doAction(navigate, "REFUND_TALENT", { talent_id = pass.id })
                                end, { height = 30, fontSize = 11, backgroundColor = "#6366f1" })
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
        -- TAB: ESPORTS CALENDAR & LEAGUE MATCHDAY PROGRESSION (18-26 WEEKS)
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("📅 职业联赛赛历与常规赛积分榜 (Esports League)", "2026赛季", nil))

        local curWeek = (game.esports_engine and game.esports_engine.state and game.esports_engine.state.current_week) or 1
        local curSplit = (game.esports_engine and game.esports_engine:getCurrentSplit()) or { name = "春季常规赛 (Spring Split)" }
        local curPatch = (game.esports_engine and game.esports_engine:getCurrentPatch()) or { version = "14.19", headline = "破败重装崛起" }

        -- Season Status Overview
        table.insert(nodes, DS.Card {
            backgroundColor = "#121a28", borderColor = DS.C.ember, padding = 12, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        DS.Label("🌱 2026 赛季职业赛历总控", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label(string.format("当前赛程: 第 %d 周 / 26周 (%d%%)", curWeek, math.min(100, math.floor(curWeek / 26 * 100))), { fontSize = 11, fontColor = DS.C.cyan })
                    }
                },
                DS.Label(string.format("当前赛段: %s · 争夺季后赛席位与 MSI 国际门票", curSplit.name), { fontSize = 11, fontColor = DS.C.text }),
                DS.Label(string.format("竞技版本: Patch %s · %s", curPatch.version, curPatch.headline), { fontSize = 10, fontColor = DS.C.success }),
            }
        })

        -- HERO CARD: NEXT SCHEDULED MATCHDAY FIXTURE
        local fix = vs.current_fixture or (vs.league_schedule and vs.league_schedule[1])
        if fix and not fix.played then
            local threatColor = (fix.threat == "SSS" and "#ef4444") or (fix.threat == "S+" and DS.C.ember) or (fix.threat == "S" and DS.C.gold) or DS.C.info
            table.insert(nodes, DS.SectionHeader("⚔️ 今日焦点联赛对决 (Next Fixture)", string.format("第 %d 轮常规赛", fix.week), nil))
            table.insert(nodes, DS.Card {
                backgroundColor = "#161320", borderColor = threatColor, padding = 12, gap = 8,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(string.format("🏆 第 %d 轮: DYNASTY (你方) VS %s", fix.week, fix.opponent_name),
                                { fontSize = 13, fontWeight = "bold", fontColor = DS.C.gold }),
                            DS.CyberBadge(string.format("战力评级 %s", fix.threat), (fix.threat == "SSS" or fix.threat == "S+") and "gold" or "ember")
                        }
                    },
                    DS.Label(string.format("敌方核心领袖: %s  |  特色战术风格: %s", fix.star_player or "主力选手", fix.key_tactic or "团队配合"),
                        { fontSize = 11, fontColor = DS.C.text }),
                    DS.Label("备战情报: 击败对手可斩获 +45 LP 职业排位分、+$12,000 赛事奖金及大量联赛积分！",
                        { fontSize = 10, fontColor = DS.C.info }),
                    UI.Panel {
                        width = "100%", flexDirection = "row", gap = 8, marginTop = 4,
                        children = {
                            DS.Button("🎯 赛前战术 BP 部署与 2D 沙盘", function()
                                game.active_tab = "ARENA"
                                game.stage_subtab = "LEAGUE"
                                if navigate then navigate("esport_sim") end
                            end, { height = 38, fontSize = 12, flexGrow = 1, backgroundColor = DS.C.ember }),
                            DS.Button("📋 战术研讨 (+12%)", function()
                                doAction(navigate, "PRE_MATCH_STRATEGY")
                            end, { height = 38, fontSize = 11, width = 130, variant = "secondary" })
                        }
                    }
                }
            })
        elseif fix and fix.played then
            table.insert(nodes, DS.Card {
                backgroundColor = "#121a15", borderColor = DS.C.success, padding = 10,
                children = {
                    DS.Label("🎉 当前赛段常规赛全部完赛！战队全员已锁定季后赛胜者组席位！", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.success }),
                    DS.Label("请在赛场演播剧场中迎战全球总决赛巅峰对决！", { fontSize = 10, fontColor = DS.C.muted })
                }
            })
        end

        -- LIVE LEAGUE STANDINGS TABLE (8 TEAMS)
        table.insert(nodes, DS.SectionHeader("📊 2026 赛季职业联赛实时积分榜 (League Standings)", "常规赛排名", nil))
        table.insert(nodes, DS.Card {
            padding = 10, gap = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        DS.Label("排名 / 战队名", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.muted, width = 140 }),
                        DS.Label("胜 - 负", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.muted, width = 60 }),
                        DS.Label("状态", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.muted, width = 50 }),
                        DS.Label("积分", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold, width = 45 }),
                    }
                },
                DS.Divider(DS.C.border)
            }
        })

        local standings = vs.league_standings or (game.getLeagueStandings and game:getLeagueStandings()) or {}
        for idx, team in ipairs(standings) do
            local isMyTeam = (team.id == "DYNASTY")
            local zoneColor = (idx <= 4 and DS.C.success) or (idx <= 6 and DS.C.gold) or "#ef4444"
            local zoneLabel = (idx <= 4 and "🟢 胜者组") or (idx <= 6 and "🟡 附加赛") or "🔴 淘汰区"
            local streakStr = (team.streak and team.streak > 0) and string.format("🔥 %d连胜", team.streak) or ((team.streak and team.streak < 0) and string.format("❄️ %d连败", -team.streak) or "平")

            table.insert(nodes, DS.Card {
                backgroundColor = isMyTeam and "#1c182a" or DS.C.surface,
                borderColor = isMyTeam and DS.C.gold or (idx <= 4 and "#1e3a2f" or DS.C.border),
                borderWidth = isMyTeam and 2 or 1,
                padding = 8, gap = 4,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            UI.Panel {
                                flexDirection = "row", alignItems = "center", gap = 6, width = 140,
                                children = {
                                    DS.CyberBadge(string.format("#%d", idx), idx <= 4 and "gold" or "secondary"),
                                    DS.Label(team.name, { fontSize = 11, fontWeight = isMyTeam and "bold" or "normal", fontColor = isMyTeam and DS.C.gold or DS.C.text })
                                }
                            },
                            DS.Label(string.format("%d胜 - %d负", team.wins or 0, team.losses or 0), { fontSize = 11, fontColor = DS.C.text, width = 60 }),
                            DS.Label(streakStr, { fontSize = 10, fontColor = (team.streak and team.streak > 0) and DS.C.ember or DS.C.muted, width = 50 }),
                            DS.Label(string.format("%d 分", team.points or 0), { fontSize = 12, fontWeight = "bold", fontColor = zoneColor, width = 45 })
                        }
                    },
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(string.format("席位区划: %s", zoneLabel), { fontSize = 9, fontColor = zoneColor }),
                            isMyTeam and DS.Label("⭐ 你方主力执教战队", { fontSize = 9, fontColor = DS.C.gold }) or DS.Label(string.format("战队评级: %s 级", team.tier or "A"), { fontSize = 9, fontColor = DS.C.muted })
                        }
                    }
                }
            })
        end

        -- FULL 2026 FIXTURE ROADMAP
        table.insert(nodes, DS.SectionHeader("🗓️ 2026 常规赛全程赛程路标", "12周对战", nil))
        local schedule = vs.league_schedule or (game.league_schedule) or {}
        for _, fixItem in ipairs(schedule) do
            local fixBg = fixItem.played and (fixItem.player_won and "#102219" or "#221215") or DS.C.surface
            local fixBorder = fixItem.played and (fixItem.player_won and DS.C.success or "#ef4444") or DS.C.border
            local statusTxt = fixItem.played and (fixItem.player_won and string.format("✓ 胜局 [%s]", fixItem.score or "2-0") or string.format("✗ 惜败 [%s]", fixItem.score or "1-2")) or "⏳ 待战"

            table.insert(nodes, DS.Card {
                backgroundColor = fixBg, borderColor = fixBorder, padding = 8, gap = 4,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                        children = {
                            DS.Label(string.format("第 %d 轮: 对阵 %s", fixItem.week, fixItem.opponent_name),
                                { fontSize = 11, fontWeight = "bold", fontColor = fixItem.played and (fixItem.player_won and DS.C.success or "#ef4444") or DS.C.text }),
                            DS.Label(statusTxt, { fontSize = 10, fontWeight = "bold", fontColor = fixItem.played and (fixItem.player_won and DS.C.success or "#ef4444") or DS.C.gold })
                        }
                    },
                    DS.Label(string.format("敌方核心: %s | 战力: %s | 战术: %s", fixItem.star_player or "主力", fixItem.threat or "S", fixItem.key_tactic or "常规"),
                        { fontSize = 9, fontColor = DS.C.textDim })
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
    -- 5. RETURN WRAPPED FULL-SCREEN SAFE SCROLL CONTAINER WITH 4-PILLAR DOCK
    -- ========================================================================
    local curEng = vs.energy or vs.stamina or 100
    local hasHqAlert = not vs.daily_claimed or (curEng < 30)
    local hasArenaAlert = (promo and promo.active)
    local hasClubAlert = (game.crisis_pending ~= nil)

    local dockTabs = {
        { id = "HQ",     icon = "🏠", label = "大厅", alert = hasHqAlert },
        { id = "ARENA",  icon = "🏟️", label = "赛场", alert = hasArenaAlert },
        { id = "CLUB",   icon = "🏢", label = "俱乐部", alert = hasClubAlert },
        { id = "LEGACY", icon = "👑", label = "荣誉", alert = false },
    }

    local bottomDockButtons = {}
    for _, dt in ipairs(dockTabs) do
        local isPillarActive = (activePillar == dt.id)
        local btnText = dt.icon .. " " .. dt.label .. (dt.alert and " •" or "")
        table.insert(bottomDockButtons, UI.Button {
            id = "btn_dock_" .. string.lower(dt.id),
            text = btnText,
            flexGrow = 1, flexBasis = 0, height = 44,
            fontSize = 12, fontWeight = isPillarActive and "bold" or "normal",
            backgroundColor = isPillarActive and DS.C.ember or "#101522",
            textColor = isPillarActive and "#ffffff" or (dt.alert and DS.C.gold or DS.C.textDim),
            borderColor = isPillarActive and DS.C.gold or (dt.alert and DS.C.ember or "#1f2738"),
            borderWidth = isPillarActive and 2 or 1,
            borderRadius = 8,
            onClick = function()
                game.active_tab = dt.id
                if dt.id == "HQ" and not game.career_subtab then game.career_subtab = "TODAY" end
                if dt.id == "ARENA" and not game.stage_subtab then game.stage_subtab = "STAGE" end
                if dt.id == "CLUB" and not game.dynasty_subtab then game.dynasty_subtab = "FACILITIES" end
                if dt.id == "LEGACY" and not game.tour_subtab then game.tour_subtab = "HOF" end
                if navigate then navigate("esport_sim") end
            end
        })
    end

    local bottomDockPanel = UI.Panel {
        width = "100%", height = 54, flexDirection = "row", gap = 6, padding = 5,
        backgroundColor = "#090d15", borderColor = "#1a2233", borderWidth = 1,
        children = bottomDockButtons
    }

    local toastBanner = nil
    if _last_toast and _last_toast.msg and _last_toast.msg ~= "" then
        toastBanner = UI.Panel {
            width = "100%", paddingLeft = 12, paddingRight = 10, paddingTop = 8, paddingBottom = 8,
            backgroundColor = "#0d1422", borderColor = _last_toast.color or DS.C.gold, borderWidth = 1,
            borderRadius = 8, flexDirection = "row", alignItems = "center", justifyContent = "space-between",
            marginBottom = 4,
            children = {
                UI.Panel {
                    flexDirection = "row", alignItems = "center", gap = 8, flexGrow = 1, flexBasis = 0,
                    children = {
                        DS.Label(_last_toast.icon or "✨", { fontSize = 14 }),
                        DS.Label(_last_toast.msg or "", { fontSize = 11, fontWeight = "bold", fontColor = _last_toast.color or DS.C.text }),
                    }
                },
                UI.Button {
                    text = "✕", width = 24, height = 24, fontSize = 11,
                    backgroundColor = "#00000000", textColor = DS.C.textDim, borderWidth = 0,
                    onClick = function()
                        _last_toast = nil
                        if navigate then navigate("esport_sim") end
                    end
                }
            }
        }
    end

    local safeChildren = {
        UI.ScrollView {
            width = "100%", flexGrow = 1, flexBasis = 0, scrollY = true, showScrollbar = true,
            children = {
                UI.Panel {
                    width = "100%", padding = 12, gap = 10, children = nodes
                }
            }
        }
    }
    if toastBanner then
        table.insert(safeChildren, toastBanner)
    end
    table.insert(safeChildren, bottomDockPanel)

    return UI.Panel {
        width = "100%", height = "100%", backgroundColor = DS.C.bg,
        children = {
            UI.SafeAreaView {
                width = "100%", height = "100%", nativeMenuInset = true,
                flexDirection = "column",
                children = safeChildren
            }
        }
    }
end

return EsportSimulatorScreen
