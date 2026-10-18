--[[
    ============================================================================
    PhaseViews.lua — Master Landscape 1920x1080 3-Phase HUD & Subviews
    ============================================================================
    TapTap Maker UrhoX 2D Lua Runtime
    Implements 3-Phase Seamless HUD Morphing:
      - Phase 1: 个人天梯巅峰 (Solo Queue & Rising Prodigy)
      - Phase 2: 职业选秀与战队签约 (Pro Scouting & Tournaments)
      - Phase 3: 俱乐部王朝与科研总控 (Franchise Dynasty & R&D Lab)
--]]

local UI = require("urhox-libs/UI")
local T = require("ui.cyber.UITheme")
local F = require("ui.cyber.UIFactory")
local EsportScreen = require("ui.screens.EsportSimulatorScreen")

local TapTapGame = nil
local ok_ttg, m_ttg = pcall(require, "lua.taptap_make_main")
if ok_ttg and type(m_ttg) == "table" then TapTapGame = m_ttg else
    local ok_ttg2, m_ttg2 = pcall(require, "taptap_make_main")
    if ok_ttg2 and type(m_ttg2) == "table" then TapTapGame = m_ttg2 else
        pcall(function() TapTapGame = require("scripts.lua.taptap_make_main") end)
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

local PhaseViews = {}

-- Module View State
local _activePhase = 1
local _phase1Sub = "LADDER"
local _phase2Sub = "BP_ROOM"
local _phase3Sub = "RD_TREE"

function PhaseViews.SetActivePhase(phase)
    _activePhase = math.max(1, math.min(phase or 1, 3))
end

function PhaseViews.GetActivePhase()
    return _activePhase
end

-- ============================================================================
-- 1. TOP MASTER TELEMETRY BAR (76px Height)
-- ============================================================================
local function BuildTopBar(game, vs, navigate)
    -- Phase Switching Tabs
    local phaseTabs = {
        { id = 1, label = "I. 天梯冲分", icon = "🎯" },
        { id = 2, label = "II. 职业赛场", icon = "⚔️" },
        { id = 3, label = "III. 俱乐部王朝", icon = "🏛️" },
    }

    local tabButtons = {}
    for _, tab in ipairs(phaseTabs) do
        local isActive = (tab.id == _activePhase)
        table.insert(tabButtons, F.NeonButton(tab.icon .. " " .. tab.label, function()
            _activePhase = tab.id
            if navigate then navigate("esport_sim_landscape") end
        end, {
            variant = isActive and "cyan" or "ghost",
            height = 40,
            fontSize = 13,
            flexGrow = 1,
        }))
    end

    return F.ChamferPanel {
        width = "100%",
        height = T.Layout.topBarHeight,
        flexDirection = "row",
        justifyContent = "space-between",
        alignItems = "center",
        backgroundColor = "#0A0E17",
        borderColor = T.C.borderInactive,
        padding = { top = 10, bottom = 10, left = 24, right = 24 },
        children = {
            -- Left Player ID & Rank
            UI.Panel {
                flexDirection = "row",
                alignItems = "center",
                gap = 12,
                children = {
                    UI.Button {
                        text = "🏠 菜单",
                        width = 68,
                        height = 36,
                        fontSize = 12,
                        backgroundColor = T.C.surfaceAlt,
                        textColor = T.C.textSecondary,
                        borderColor = T.C.borderInactive,
                        borderWidth = 1,
                        borderRadius = 6,
                        onClick = function()
                            if navigate then navigate("menu") end
                        end
                    },
                    UI.Button {
                        text = "📱 竖屏",
                        width = 68,
                        height = 36,
                        fontSize = 12,
                        backgroundColor = T.C.surfaceAlt,
                        textColor = T.C.neonCyan,
                        borderColor = T.C.neonCyan,
                        borderWidth = 1,
                        borderRadius = 6,
                        onClick = function()
                            if navigate then navigate("esport_sim") end
                        end
                    },
                    UI.Panel {
                        flexDirection = "column",
                        gap = 2,
                        children = {
                            UI.Label {
                                text = string.format("PLAYER: %s [%s]", vs.player_name or "Prodigy", vs.player_role or "MID"),
                                fontSize = 14,
                                fontWeight = "bold",
                                fontColor = T.C.neonCyan,
                            },
                            UI.Label {
                                text = string.format("RANK: %s (%d LP)", vs.rank, vs.lp),
                                fontSize = 12,
                                fontColor = T.C.neonAmber,
                            }
                        }
                    }
                }
            },

            -- Center Phase Switcher Tabs
            UI.Panel {
                width = 460,
                flexDirection = "row",
                gap = 8,
                alignItems = "center",
                children = tabButtons,
            },

            -- Right Telemetry Gauges
            UI.Panel {
                flexDirection = "row",
                alignItems = "center",
                gap = 16,
                children = {
                    UI.Panel {
                        flexDirection = "column",
                        alignItems = "flex-end",
                        gap = 2,
                        children = {
                            UI.Label { text = "💰 资金资产", fontSize = 10, fontColor = T.C.textMuted },
                            UI.Label { text = string.format("$%d", vs.money), fontSize = 15, fontWeight = "bold", fontColor = T.C.neonEmerald },
                        }
                    },
                    UI.Panel {
                        flexDirection = "column",
                        alignItems = "flex-end",
                        gap = 2,
                        children = {
                            UI.Label { text = "🌟 粉丝关注", fontSize = 10, fontColor = T.C.textMuted },
                            UI.Label { text = string.format("%d", vs.stream_channel and vs.stream_channel.subscribers or 15), fontSize = 15, fontWeight = "bold", fontColor = T.C.neonCyanGlow },
                        }
                    },
                    UI.Panel {
                        flexDirection = "column",
                        alignItems = "flex-end",
                        gap = 2,
                        children = {
                            UI.Label { text = "⚡ 精力/专注", fontSize = 10, fontColor = T.C.textMuted },
                            UI.Label { text = string.format("%d%% / %d%%", vs.energy or 85, vs.focus or 90), fontSize = 13, fontWeight = "bold", fontColor = T.C.textPrimary },
                        }
                    }
                }
            }
        }
    }
end

-- ============================================================================
-- 2. PHASE 1 SUBVIEW: 个人天梯巅峰 (SOLO QUEUE & RISING PRODIGY)
-- ============================================================================
local function BuildPhase1SoloView(game, vs, navigate, onAction)
    local energy = vs.energy or 85
    local focus = vs.focus or 90
    local rsi = vs.career_health and vs.career_health.wrist_strain or 0
    local mech = vs.mechanics or 60

    -- Left Flank: Player Telemetry & Vitals
    local leftChildren = {
        UI.Panel {
            width = "100%", flexDirection = "row", gap = 4, marginBottom = 6,
            children = {
                F.NeonButton("🎯排位", function() _phase1Sub = "LADDER" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "LADDER") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🛒神装", function() _phase1Sub = "SHOP" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "SHOP") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🤝经纪", function() _phase1Sub = "AGENCY" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "AGENCY") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📱热搜", function() _phase1Sub = "SOCIAL" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "SOCIAL") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🎬录像", function() _phase1Sub = "VOD" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "VOD") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
            }
        },
        F.TelemetryMeter("⚡ 竞技体能 (Stamina)", energy, 100, { variant = energy < 30 and "rose" or "emerald", unit = "%" }),
        F.TelemetryMeter("🎯 对局专注 (Focus)", focus, 100, { variant = focus < 30 and "rose" or "cyan", unit = "%" }),
        F.TelemetryMeter("🩺 手腕腱鞘劳损 (RSI Strain)", rsi, 100, { variant = rsi > 70 and "rose" or (rsi > 40 and "amber" or "emerald"), unit = "%" }),
        F.TelemetryMeter("⚡ 极限微操手速 (Mechanics)", mech, 100, { variant = "amber", unit = "PTS" }),
        UI.Panel {
            backgroundColor = T.C.surfaceInset,
            padding = 10,
            borderRadius = 6,
            marginTop = 6,
            children = {
                UI.Label { text = "💡 状态洞察:", fontSize = 12, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Label {
                    text = rsi > 50 and "⚠️ 腱鞘炎负荷较高，操作容易变形，请适时进行自适应冰敷理疗！"
                        or "🔥 竞技状态饱满，适合连续排位冲分与宿敌交锋！",
                    fontSize = 11, fontColor = rsi > 50 and T.C.neonRoseGlow or T.C.textSecondary,
                    marginTop = 2,
                }
            }
        }
    }
    local leftFlank = F.TacticalCard("📊 选手生理与手速监控", "SOLO_TELEMETRY", leftChildren, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    -- Center Stage: Matchmaking Radar, Shop, or Agency
    local centerStage
    if _phase1Sub == "SHOP" then
        local shopCards = {}
        local owned = {}
        for _, gid in ipairs(vs.inventory_gear or {}) do owned[gid] = true end

        table.insert(shopCards, UI.Label { text = "🎧 职业选手硬件神装库 (Hardware Rig):", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonCyan })
        for _, it in ipairs(Gear or {}) do
            local isOwned = owned[it.id]
            table.insert(shopCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderColor = isOwned and T.C.neonEmerald or T.C.borderMuted, borderWidth = 1,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = it.name .. (isOwned and " (✓ 已配备)" or ""), fontSize = 12, fontWeight = "bold", fontColor = isOwned and T.C.neonEmerald or T.C.textPrimary },
                            UI.Label { text = string.format("微操 +%d, 心态 +%d | %s", it.mechanics_bonus or 0, it.mental_bonus or 0, it.desc or ""), fontSize = 10, fontColor = T.C.textSecondary },
                        }
                    },
                    isOwned and UI.Label { text = "ACTIVE", fontSize = 11, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton(string.format("购买 $%d", it.cost), function() onAction("BUY_GEAR", { gear_id = it.id }) end, { variant = (vs.money >= it.cost) and "cyan" or "ghost", height = 28, width = 84, fontSize = 11 })
                }
            })
        end

        table.insert(shopCards, UI.Label { text = "🥤 战备应急便利店 (Quick Shop):", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonAmber, marginTop = 6 })
        local quickList = TapTapGame and TapTapGame.QUICK_SHOP_CATALOG or {}
        local quickRow = {}
        for _, q in ipairs(quickList) do
            table.insert(quickRow, UI.Panel {
                flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 4, padding = 6,
                backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                children = {
                    UI.Label { text = q.name, fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                    UI.Label { text = string.format("$%d | 专注+%d%%", q.cost, q.focus or 0), fontSize = 10, fontColor = T.C.textSecondary },
                    F.NeonButton("⚡ 饮用", function() onAction("QUICK_SHOP", { item_id = q.id, immediate_use = true }) end, { variant = "amber", height = 26, fontSize = 10 }),
                }
            })
        end
        table.insert(shopCards, UI.Panel { width = "100%", flexDirection = "row", gap = 6, children = quickRow })

        centerStage = F.TacticalCard("🛒 职业选手硬件神装与战备便利店", "HARDWARE_SHOP", shopCards, { flexGrow = 1 })

    elseif _phase1Sub == "AGENCY" then
        local agCards = {}
        local curAg = vs.agency and vs.agency.hired_agent
        local agConf = curAg and TapTapGame and TapTapGame.AGENTS_CONFIG[curAg]

        if agConf then
            table.insert(agCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 8, backgroundColor = "#0c1812", borderRadius = 6, borderColor = T.C.neonEmerald, borderWidth = 1,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("⭐ 现任专属经纪人: %s (%s)", agConf.name, agConf.title), fontSize = 12, fontWeight = "bold", fontColor = T.C.neonEmerald },
                            UI.Label { text = string.format("特权: 【%s】 商业赞助溢价 +%d%% | 被动分红 $%.1f/场", agConf.perk, math.floor(agConf.bonus_rate * 100), agConf.passive_per_fame), fontSize = 10, fontColor = T.C.textSecondary },
                        }
                    },
                    F.NeonButton("解约", function() onAction("FIRE_AGENT") end, { variant = "rose", height = 28, width = 64, fontSize = 11 })
                }
            })
        end

        table.insert(agCards, UI.Label { text = "🤝 签约专属经纪人:", fontSize = 12, fontWeight = "bold", fontColor = T.C.neonCyan, marginTop = 4 })
        for k, ag in pairs(TapTapGame and TapTapGame.AGENTS_CONFIG or {}) do
            local isHired = (curAg == k)
            table.insert(agCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isHired and T.C.neonEmerald or T.C.borderMuted,
                children = {
                    UI.Label { text = string.format("%s (%s) · 需知名度 %d | $%d", ag.name, ag.title, ag.fame_req, ag.cost), fontSize = 11, fontColor = isHired and T.C.neonEmerald or T.C.textPrimary },
                    isHired and UI.Label { text = "HIRED", fontSize = 10, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton("签约", function() onAction("HIRE_AGENT", { agent_id = k }) end, { variant = "cyan", height = 26, width = 56, fontSize = 10 }),
                }
            })
        end

        table.insert(agCards, UI.Label { text = "💼 顶级商业赞助合作:", fontSize = 12, fontWeight = "bold", fontColor = T.C.neonAmber, marginTop = 4 })
        local signedMap = {}
        for _, sId in ipairs((vs.agency and vs.agency.signed_sponsors) or {}) do signedMap[sId] = true end
        for _, sp in ipairs(TapTapGame and TapTapGame.SPONSORSHIPS_CONFIG or {}) do
            local isSigned = signedMap[sp.id]
            table.insert(agCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isSigned and T.C.neonEmerald or T.C.borderMuted,
                children = {
                    UI.Label { text = string.format("%s [%s] · 底薪 $%d (首笔预付 +$%d)", sp.brand, sp.category, sp.base_payout, sp.signing_bonus), fontSize = 10, fontColor = isSigned and T.C.neonEmerald or T.C.textPrimary },
                    isSigned and UI.Label { text = "ACTIVE", fontSize = 10, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton("签署", function() onAction("SIGN_SPONSOR", { sponsor_id = sp.id }) end, { variant = "amber", height = 26, width = 56, fontSize = 10 }),
                }
            })
        end

        centerStage = F.TacticalCard("🤝 选手经纪人与顶级商业赞助", "AGENCY_SPONSORS", agCards, { flexGrow = 1 })

    elseif _phase1Sub == "SOCIAL" then
        local socCards = {}
        table.insert(socCards, UI.Label { text = "📱 电竞热搜与全网舆论风暴 (Social Banter):", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonCyan })
        local posts = {
            { author = "🎙️ 管泽元 (@大校电竞解说)", platform = "微博", likes = "4.8万", text = "我的天哪！这个闪现盲摸眼回旋踢在职业赛场真的踢出来了？！这波微操完全逆天！！宿命先锋是真敢操作啊！这波封神！" },
            { author = "🔴 T1 俱乐部官方 (@T1LoL_Official)", platform = "微博", likes = "8.9万", text = "令人敬佩的绝佳BP战术与极限微操。非常期待与你在全球总决赛舞台巅峰相遇。🤝" },
            { author = "🎧 解说米勒 (@解说米勒)", platform = "微博", likes = "3.5万", text = "最后那个主堡1滴血的大龙守家看得我头皮发麻！一人肉身飞入敌方五人包夹秒杀双C！这就是电竞的魅力！" }
        }
        for _, p in ipairs(posts) do
            table.insert(socCards, UI.Panel {
                width = "100%", padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted, gap = 2,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between",
                        children = {
                            UI.Label { text = p.author, fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                            UI.Label { text = string.format("❤️ %s [%s]", p.likes, p.platform), fontSize = 10, fontColor = T.C.neonCyan },
                        }
                    },
                    UI.Label { text = p.text, fontSize = 10, fontColor = T.C.textPrimary },
                }
            })
        end
        centerStage = F.TacticalCard("📱 社交媒体实时热帖与全网讨论", "SOCIAL_FEED", socCards, { flexGrow = 1 })

    elseif _phase1Sub == "VOD" then
        local vodCards = {}
        table.insert(vodCards, UI.Label { text = "🎬 职业名局战术录像复盘库 (Match VOD Library):", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonCyan })
        table.insert(vodCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#090D16", borderRadius = 6, gap = 4,
            children = {
                UI.Label { text = "🏆 全球总决赛决胜局：天王山龙坑世纪豪赌", fontSize = 12, fontWeight = "bold", fontColor = T.C.neonAmber },
                UI.Label { text = "对阵: DYNASTY vs T1 | 赛制: BO5 第五局 | 战果: VICTORY | FMVP局", fontSize = 10, fontColor = T.C.textSecondary },
                F.NeonButton("🎬 深度切片研读 (+5 洞察, +2 微操, +3 心态)", function() onAction("VOD_REVIEW") end, { variant = "cyan", height = 30, fontSize = 11 }),
            }
        })
        centerStage = F.TacticalCard("🎬 名局录像切片与对局复盘", "MATCH_VOD", vodCards, { flexGrow = 1 })

    else
        centerStage = F.TacticalCard("⚔️ 峡谷巅峰天梯排位大厅", "LIVE_LADDER", {
            UI.Panel {
                width = "100%",
                height = 140,
                backgroundColor = "#090D16",
                borderColor = T.C.borderMuted,
                borderWidth = 1,
                borderRadius = 6,
                justifyContent = "center",
                alignItems = "center",
                gap = 6,
                children = {
                    UI.Label { text = "🏆 " .. tostring(vs.rank) .. " RANKED TIER", fontSize = 22, fontWeight = "bold", fontColor = T.C.neonAmber },
                    UI.Label { text = string.format("当前天梯胜点: %d LP | 晋级胜率评估: 64.8%%", vs.lp), fontSize = 13, fontColor = T.C.neonCyan },
                    UI.Label { text = "已锁定主打分路: " .. (vs.player_role or "MID") .. " · 擅长英雄池: 阿卡丽 / 辛德拉 / 妖姬", fontSize = 11, fontColor = T.C.textMuted }
                }
            },
            UI.Label { text = "📜 近期实战日志终端 (Realtime Logs):", fontSize = 13, fontWeight = "bold", fontColor = T.C.textPrimary, marginTop = 4 },
            UI.Panel {
                width = "100%",
                flexGrow = 1,
                backgroundColor = T.C.surfaceInset,
                padding = 10,
                borderRadius = 6,
                children = {
                    UI.Label { text = "• [10:24] 单排排位斩获胜局！中路单杀对位选手，胜点 +18 LP！", fontSize = 11, fontColor = T.C.neonEmerald },
                    UI.Label { text = "• [10:35] 针对职业战队 VOD 进行前15分钟对线复盘，微操 +1！", fontSize = 11, fontColor = T.C.neonCyan },
                    UI.Label { text = "• [10:48] 开启个人高分段直播，新增关注 +850 粉丝，礼物打赏 +$35！", fontSize = 11, fontColor = T.C.neonAmber },
                }
            }
        }, { flexGrow = 1 })
    end

    -- Right Flank: Thumb Action Matrix (Fitts's Law Target Zones)
    local rightFlank = F.TacticalCard("🎮 战备操作指令台", "COMMAND_DECK", {
        F.ActionGate(energy >= 20 and rsi < 85, rsi >= 85 and "腱鞘炎超负荷，请先理疗！" or (energy < 20 and "体力严重透支！" or ""),
            "⚔️ " .. T.Microcopy.matchQueue .. " (-20 体力)", function()
                onAction("SOLO_QUEUE")
            end, { variant = "cyan", height = 52 }),

        F.ActionGate(focus >= 15, focus < 15 and "专注度不足，请休整或喝咖啡！" or "",
            "📖 " .. T.Microcopy.studyVod .. " (-15 专注)", function()
                onAction("STUDY_VOD")
            end, { variant = "ghost", height = 48 }),

        F.NeonButton("🎙️ " .. T.Microcopy.streamBootcamp .. " (+资金/粉丝)", function()
            onAction("STREAM")
        end, { variant = "amber", height = 48 }),

        F.NeonButton("☕ 特调咖啡/冰美式 (恢复专注)", function()
            onAction("COFFEE")
        end, { variant = "ghost", height = 46 }),

        F.NeonButton("🩺 " .. T.Microcopy.physioCare .. " (-25% 腱鞘负荷)", function()
            onAction("PHYSIO")
        end, { variant = "emerald", height = 48 }),
    }, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    return UI.Panel {
        width = "100%",
        flexGrow = 1,
        flexDirection = "row",
        gap = 14,
        children = { leftFlank, centerStage, rightFlank },
    }
end

-- ============================================================================
-- 3. PHASE 2 SUBVIEW: 职业选秀与战队签约 (PRO SCOUTING & TOURNAMENTS)
-- ============================================================================
local function BuildPhase2ProView(game, vs, navigate, onAction)
    -- Left Flank: Scout Radar & Switcher
    local leftFlank = F.TacticalCard("🎯 俱乐部球探洞察", "PRO_SCOUT", {
        UI.Panel {
            width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 2, marginBottom = 6,
            children = {
                F.NeonButton("⚔️BP", function() _phase2Sub = "BP_ROOM" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "BP_ROOM") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📺剧场", function() _phase2Sub = "THEATER" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "THEATER") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🧩残局", function() _phase2Sub = "DRILL" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "DRILL") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📡雷达", function() _phase2Sub = "RADAR" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "RADAR") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📊豪门", function() _phase2Sub = "RANKINGS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "RANKINGS") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📜Meta", function() _phase2Sub = "META_TIER" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "META_TIER") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📺战报", function() _phase2Sub = "HIGHLIGHTS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "HIGHLIGHTS") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("📅赛历", function() _phase2Sub = "CALENDAR" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "CALENDAR") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🐉试炼", function() _phase2Sub = "ARENA" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "ARENA") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
            }
        },
        F.TelemetryMeter("🌟 豪门关注度", 82, 100, { variant = "cyan", unit = "%" }),
        F.TelemetryMeter("🤝 战队磨合默契", 75, 100, { variant = "emerald", unit = "%" }),
        F.TelemetryMeter("🏆 季后赛胜率胜势", 68, 100, { variant = "amber", unit = "%" }),
        UI.Panel {
            backgroundColor = T.C.surfaceInset,
            padding = 10,
            borderRadius = 6,
            children = {
                UI.Label { text = "📋 意向战队签约邀约:", fontSize = 12, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Label { text = "• T1 (SK Telecom) - 年薪 $450,000 | 首发中单", fontSize = 11, fontColor = T.C.textPrimary, marginTop = 2 },
                UI.Label { text = "• GEN (Gen.G) - 年薪 $520,000 | 轮换争首发", fontSize = 11, fontColor = T.C.textSecondary, marginTop = 2 },
            }
        }
    }, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    -- Center Stage based on _phase2Sub
    local centerStage
    if _phase2Sub == "THEATER" or (vs.current_visual_match ~= nil and _phase2Sub == "BP_ROOM") then
        local theaterNodes = {}
        if MatchBroadcastScreen then
            table.insert(theaterNodes, MatchBroadcastScreen.Build(game, vs, navigate, onAction))
        else
            table.insert(theaterNodes, UI.Label { text = "📺 2D 比赛演播剧场加载中...", fontSize = 12, fontColor = T.C.neonCyan })
        end
        centerStage = F.TacticalCard("📺 2D 比赛演播剧场与峡谷战术沙盘", "MATCH_THEATER", theaterNodes, { flexGrow = 1 })
    elseif _phase2Sub == "RANKINGS" then
        local rankCards = {}
        local teamsList = GlobalPowerRankings and GlobalPowerRankings.TEAMS or {}
        local scoutedMap = (game.power_rankings_engine and game.power_rankings_engine.scouted_teams) or {}

        for i = 1, math.min(7, #teamsList) do
            local t = teamsList[i]
            local isScouted = scoutedMap[t.id] or scoutedMap[string.upper(t.id)] or scoutedMap[string.lower(t.id)]
            table.insert(rankCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isScouted and T.C.neonCyan or T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("#%d %s %s [%s] · 战力 %.1f", t.rank, t.logo or "⚡", t.name, t.region, t.pwr), fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                            UI.Label { text = "破绽: " .. (t.weakness or ""), fontSize = 9, fontColor = isScouted and T.C.neonEmerald or T.C.textMuted },
                        }
                    },
                    UI.Panel {
                        flexDirection = "row", gap = 4,
                        children = {
                            F.NeonButton(isScouted and "✓已刺探" or "🔍刺探", function() onAction("SCOUT_TEAM", { team_id = t.short or t.id }) end, { variant = isScouted and "ghost" or "cyan", height = 26, width = 60, fontSize = 10 }),
                            F.NeonButton("🥊约战", function() onAction("SCRIM_TEAM", { team_id = t.short or t.id }) end, { variant = "ghost", height = 26, width = 54, fontSize = 10 }),
                        }
                    }
                }
            })
        end
        centerStage = F.TacticalCard("📊 全球 20 强豪门战力天梯榜与刺探约战", "GLOBAL_RANKINGS", rankCards, { flexGrow = 1 })
    elseif _phase2Sub == "META_TIER" then
        local mtl = vs.meta_tier_list or (MetaTierList and MetaTierList.getCurrentPatch())
        local metaCards = {}
        if mtl then
            table.insert(metaCards, UI.Panel {
                width = "100%", padding = 8, backgroundColor = "#090D16", borderRadius = 6,
                children = {
                    UI.Label { text = string.format("⚡ 【%s】%s", mtl.version or "14.19", mtl.theme_title or ""), fontSize = 12, fontColor = T.C.neonCyan, fontWeight = "bold" },
                    UI.Label { text = mtl.meta_highlight or "", fontSize = 10, fontColor = T.C.neonAmber, marginTop = 2 },
                }
            })
            for _, ch in ipairs(mtl.champions or {}) do
                local tCol = (ch.tier == "T0") and T.C.neonAmber or ((ch.tier == "T1") and T.C.neonEmerald or T.C.textMuted)
                table.insert(metaCards, UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                    children = {
                        UI.Label { text = string.format("%s [%s] %s (%s)", ch.icon or "⚔️", ch.tier, ch.name, ch.role), fontSize = 11, fontWeight = "bold", fontColor = tCol },
                        UI.Label { text = string.format("胜率: %.1f%% · %s", ch.win_rate or 50, ch.buff or ""), fontSize = 10, fontColor = T.C.neonCyan },
                    }
                })
            end
        end
        centerStage = F.TacticalCard("📜 当前版本 Meta 梯度榜与克制链", "META_TIER_LIST", metaCards, { flexGrow = 1 })
    elseif _phase2Sub == "CALENDAR" then
        local calCards = {}
        table.insert(calCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#0c1322", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonCyan,
            children = {
                UI.Label { text = "📅 2026 赛季职业赛历总控 (26周赛季时钟)", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Label { text = "当前赛段: 春季常规赛 (Spring Split) · 版本: Patch 14.19 · 全局修饰符: 【春之狂欢】全部比赛微操收益 +10%", fontSize = 10, fontColor = T.C.neonAmber, marginTop = 2 },
            }
        })
        local splits = {
            { name = "🌱 春季常规赛 (Spring Split)", weeks = "W1 - W8", desc = "争夺季后赛席位与 MSI 门票 (需胜率 ≥ 55% 或 450 LP)" },
            { name = "🏆 季中冠军赛 (MSI)", weeks = "W9 - W11", desc = "各大赛区冠军巅峰死斗，胜场大幅提升国际声望" },
            { name = "🔥 夏季常规赛 (Summer Split)", weeks = "W12 - W19", desc = "争夺全球总决赛种子席位 (需胜率 ≥ 58% 或 750 LP)" },
            { name = "👑 全球总决赛 (Worlds Championship)", weeks = "W20 - W26", desc = "全球 16 强鏖战，捧起召唤师金杯与终身传奇戒指" },
        }
        for _, sp in ipairs(splits) do
            table.insert(calCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                children = {
                    UI.Label { text = sp.name, fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                    UI.Label { text = sp.weeks .. " · " .. sp.desc, fontSize = 9, fontColor = T.C.textSecondary },
                }
            })
        end
        centerStage = F.TacticalCard("📅 职业电竞赛历与赛季时钟", "ESPORTS_CALENDAR", calCards, { flexGrow = 1 })

    elseif _phase2Sub == "ARENA" then
        local arenaCards = {}
        table.insert(arenaCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#1b1424", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonPurple,
            children = {
                UI.Label { text = "🐉 比赛时刻 32:15 · 纳什男爵生死决断 (Baron Pit Decider)", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonAmber },
                UI.Label { text = "大龙剩余血量: 1450 / 12000！双方十人集结龙坑狭窄隘口，决定冠军归属的世纪决断！", fontSize = 10, fontColor = T.C.textPrimary, marginTop = 2 },
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 6, marginTop = 6,
                    children = {
                        F.NeonButton("⚡ 中单孤勇者进场 (72%胜率)", function() onAction("BARON_CLUTCH", { choice_id = 1 }) end, { variant = "amber", height = 30, fontSize = 10, flexGrow = 1 }),
                        F.NeonButton("🛡️ 拼惩戒稳拿大龙 (55%胜率)", function() onAction("BARON_CLUTCH", { choice_id = 2 }) end, { variant = "cyan", height = 30, fontSize = 10, flexGrow = 1 }),
                        F.NeonButton("⏸️ 紧急战术暂停 (100%成功)", function() onAction("BARON_CLUTCH", { choice_id = 3 }) end, { variant = "ghost", height = 30, fontSize = 10, flexGrow = 1 }),
                    }
                }
            }
        })
        table.insert(arenaCards, UI.Panel {
            width = "100%", padding = 6, backgroundColor = T.C.surfaceInset, borderRadius = 6,
            children = {
                UI.Label { text = "🧩 经典 BP 残局破阵特训: 【针对敌方强开突脸锁头阵】", fontSize = 11, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Label { text = "• 一手封锁: 深海泰坦 (BAN 1) | 先手反制: 虚空之女 卡莎 (PICK 1) | 后手绝杀: 烈娜塔 (COUNTER)", fontSize = 10, fontColor = T.C.neonEmerald, marginTop = 2 },
                UI.Label { text = "• 已激活战术加成: 防突进反打奇策 (+12% 团战胜率, +4 微操, +6 大局观)", fontSize = 9, fontColor = T.C.neonAmber, marginTop = 2 },
            }
        })
        centerStage = F.TacticalCard("⚔️ 决胜时刻 · 战术决策与大龙争夺", "TACTICAL_ARENA", arenaCards, { flexGrow = 1 })
    elseif _phase2Sub == "DRILL" then
        local drillCards = {}
        local drillData = vs.tactical_bp_drill or {}
        local puzzles = drillData.all_puzzles or {}
        local solvedMap = drillData.solved or {}
        local activeBuff = drillData.active_buff

        if activeBuff then
            table.insert(drillCards, UI.Panel {
                width = "100%", padding = 8, backgroundColor = "#0e1c18", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonEmerald,
                children = {
                    UI.Label { text = "✨ " .. activeBuff.buffLabel, fontSize = 11, fontWeight = "bold", fontColor = T.C.neonEmerald },
                    UI.Label { text = string.format("战力克制加成: +%d%% (生效至今日赛程结束)", activeBuff.winRateBonus or 15), fontSize = 10, fontColor = T.C.neonAmber, marginTop = 2 }
                }
            })
        end

        for _, pz in ipairs(puzzles) do
            local isSolved = solvedMap[pz.id]
            table.insert(drillCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isSolved and T.C.neonEmerald or T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("%s %s", pz.targetTheme or "⚔️", pz.title), fontSize = 11, fontWeight = "bold", fontColor = isSolved and T.C.neonEmerald or T.C.textPrimary },
                            UI.Label { text = string.format("克制阵眼: %s | 敌方: %s", table.concat(pz.correctCounters or {}, ", "), table.concat(pz.enemyPicks or {}, ", ")), fontSize = 9, fontColor = T.C.neonCyan },
                        }
                    },
                    isSolved and UI.Label { text = "SOLVED ✓", fontSize = 10, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton("破解残局", function() onAction("SOLVE_BP_DRILL", { drill_id = pz.id }) end, { variant = "amber", height = 26, width = 75, fontSize = 9 })
                }
            })
        end
        centerStage = F.TacticalCard("🧩 每日教练战术 BP 残局沙盘推演", "BP_DRILL_ROOM", drillCards, { flexGrow = 1 })

    elseif _phase2Sub == "RADAR" then
        local radarCards = {}
        local radarData = vs.scout_radar or {}
        local curMode = radarData.mode or "SELF"
        local rivalId = radarData.rival_id or "t1"

        table.insert(radarCards, UI.Panel {
            width = "100%", flexDirection = "row", gap = 4, marginBottom = 4,
            children = {
                F.NeonButton("👤本队基准", function() onAction("SET_SCOUT_RADAR_MODE", { mode = "SELF", rival_id = rivalId }) end, { variant = (curMode == "SELF") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🌐联赛平均", function() onAction("SET_SCOUT_RADAR_MODE", { mode = "LEAGUE", rival_id = rivalId }) end, { variant = (curMode == "LEAGUE") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("⚡宿敌对标", function() onAction("SET_SCOUT_RADAR_MODE", { mode = "RIVAL", rival_id = rivalId }) end, { variant = (curMode == "RIVAL") and "cyan" or "ghost", height = 26, fontSize = 9, flexGrow = 1 }),
            }
        })

        local clusters = radarData.clusters or { mechanics = 92, macro = 88, teamfight = 94, vision = 85, adaptability = 89 }
        local clusterDefs = {
            { name = "对线微操 (Mechanics)", val = clusters.mechanics or 90 },
            { name = "大局运营 (Macro Ops)", val = clusters.macro or 85 },
            { name = "团战协同 (Teamfight)", val = clusters.teamfight or 92 },
            { name = "视野压制 (Vision Control)", val = clusters.vision or 80 },
            { name = "临场应变 (Adaptability)", val = clusters.adaptability or 88 },
        }
        for _, c in ipairs(clusterDefs) do
            local grade = (c.val >= 93 and "S+") or ((c.val >= 88 and "S") or "A")
            local gradeCol = (grade == "S+" or grade == "S") and T.C.neonAmber or T.C.neonCyan
            table.insert(radarCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                children = {
                    UI.Label { text = c.name, fontSize = 11, fontColor = T.C.textPrimary },
                    UI.Label { text = string.format("%d [%s]", c.val, grade), fontSize = 11, fontWeight = "bold", fontColor = gradeCol }
                }
            })
        end
        centerStage = F.TacticalCard("📊 战术情报五维聚类雷达与三模对标", "SCOUT_RADAR_HEATMAP", radarCards, { flexGrow = 1 })
    elseif _phase2Sub == "HIGHLIGHTS" then
        local hlCards = {}
        local rep = vs.last_match_report
        if rep then
            local outcomeCol = rep.win and T.C.neonEmerald or T.C.neonRose
            table.insert(hlCards, UI.Panel {
                width = "100%", padding = 8, backgroundColor = rep.win and "#0e1814" or "#1a0f12", borderRadius = 6, borderWidth = 1, borderColor = outcomeCol,
                flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Label { text = rep.win and "🏆 比赛大捷 · 胜利 (VICTORY)" or "💔 遗憾惜败 · 告负 (DEFEAT)", fontSize = 13, fontWeight = "bold", fontColor = outcomeCol },
                    UI.Label { text = string.format("击杀比: %d : %d  |  大龙: %s  |  小龙: %d:%d", (rep.score and rep.score.self) or 0, (rep.score and rep.score.enemy) or 0, (rep.baron == "SELF") and "我方抢下" or "敌方拿下", ((rep.dragons and rep.dragons.self) or 0), ((rep.dragons and rep.dragons.enemy) or 0)), fontSize = 11, fontColor = T.C.neonAmber, fontWeight = "bold" },
                }
            })

            -- 4 Tactical Rounds
            for _, rd in ipairs(rep.rounds or {}) do
                local rdCol = (rd.winner == "SELF") and T.C.neonEmerald or T.C.neonAmber
                table.insert(hlCards, UI.Panel {
                    width = "100%", padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                    flexDirection = "column", gap = 2,
                    children = {
                        UI.Label { text = string.format("[%s] %s", rd.phase or "", rd.title or ""), fontSize = 11, fontWeight = "bold", fontColor = rdCol },
                        UI.Label { text = rd.desc or "", fontSize = 9, fontColor = T.C.textSecondary },
                    }
                })
            end

            -- Highlights
            if rep.highlights and #rep.highlights > 0 then
                local hlLines = {}
                for _, hl in ipairs(rep.highlights) do
                    table.insert(hlLines, UI.Label { text = "• " .. hl, fontSize = 9, fontColor = T.C.neonCyan })
                end
                table.insert(hlCards, UI.Panel {
                    width = "100%", padding = 6, backgroundColor = T.C.surfaceInset, borderRadius = 6,
                    flexDirection = "column", gap = 2,
                    children = hlLines
                })
            end

            -- Commentary
            if rep.commentary and rep.commentary ~= "" then
                table.insert(hlCards, UI.Panel {
                    width = "100%", padding = 6, backgroundColor = "#1e1a0e", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonAmber,
                    children = {
                        UI.Label { text = "🎙️ 官方解说席点评: " .. rep.commentary, fontSize = 10, fontColor = T.C.neonAmber },
                    }
                })
            end
        else
            table.insert(hlCards, UI.Panel {
                width = "100%", padding = 12, backgroundColor = T.C.surfaceInset, borderRadius = 6,
                flexDirection = "column", gap = 6, alignItems = "center",
                children = {
                    UI.Label { text = "📺 暂无最新战报数据", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonCyan },
                    UI.Label { text = "请在右侧指令台点击【出征正赛】以推演 5v5 4 大战术回合与高光镜头！", fontSize = 11, fontColor = T.C.textMuted },
                    F.NeonButton("🏆 立即出征常规赛", function() onAction("PLAY_STAGE_MATCH") end, { variant = "emerald", height = 32, fontSize = 11 }),
                }
            })
        end
        centerStage = F.TacticalCard("📺 官方赛事战报与 4 回合高光回放", "MATCH_HIGHLIGHTS", hlCards, { flexGrow = 1 })
    else
        centerStage = F.TacticalCard("⚔️ 5v5 职业赛场 BP 战术分析室", "STAGE_BP_ROOM", {
            UI.Panel {
                width = "100%",
                flexDirection = "row",
                justifyContent = "space-between",
                padding = 8,
                backgroundColor = "#090D16",
                borderRadius = 6,
                children = {
                    UI.Label { text = "🔵 我方首发战力: 94.2 (高联动反手控制)", fontSize = 12, fontColor = T.C.neonCyan, fontWeight = "bold" },
                    UI.Label { text = "VS", fontSize = 14, fontColor = T.C.neonRose, fontWeight = "bold" },
                    UI.Label { text = "🔴 敌方战力 [GEN]: 97.8 (精密齿轮级运营)", fontSize = 12, fontColor = T.C.neonRose, fontWeight = "bold" },
                }
            },
            UI.Label { text = "📊 关键对位 BP 克制与战术破绽洞察:", fontSize = 13, fontWeight = "bold", fontColor = T.C.textPrimary, marginTop = 4 },
            UI.Panel {
                width = "100%",
                flexGrow = 1,
                backgroundColor = T.C.surfaceInset,
                padding = 10,
                borderRadius = 6,
                children = {
                    UI.Label { text = "• 【对线期】中野双游体系已破解敌方眼位习惯，前期越塔成功率 +8%！", fontSize = 11, fontColor = T.C.neonEmerald },
                    UI.Label { text = "• 【大龙坑团战】防范敌方后期大核逆境翻盘，推荐执行快节奏反手控图！", fontSize = 11, fontColor = T.C.neonCyan },
                    UI.Label { text = "• 【心理博弈】敌方前15分钟压线凶悍，针对性呼叫打野可直接打断其节奏。", fontSize = 11, fontColor = T.C.textSecondary },
                }
            }
        }, { flexGrow = 1 })
    end

    -- Right Flank: Pro Stage Action Deck
    local rightFlank = F.TacticalCard("⚔️ 赛场战术指令台", "STAGE_ACTIONS", {
        F.NeonButton("📺 开启 2D 峡谷沙盘演播", function()
            _phase2Sub = "THEATER"
            onAction("START_VISUAL_MATCH")
        end, { variant = "amber", height = 48 }),

        F.NeonButton("🏆 " .. T.Microcopy.executeTactic .. " (出征正赛)", function()
            _phase2Sub = "THEATER"
            onAction("STAGE_MATCH")
        end, { variant = "emerald", height = 52 }),

        F.NeonButton("🕵️ " .. T.Microcopy.scoutIntel .. " (破解T1体系)", function()
            onAction("SCOUT_T1")
        end, { variant = "cyan", height = 48 }),

        F.NeonButton("🤝 " .. T.Microcopy.startScrim .. " (约战GEN豪门)", function()
            onAction("SCRIM_GEN")
        end, { variant = "ghost", height = 48 }),
    }, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    return UI.Panel {
        width = "100%",
        flexGrow = 1,
        flexDirection = "row",
        gap = 14,
        children = { leftFlank, centerStage, rightFlank },
    }
end

-- ============================================================================
-- 4. PHASE 3 SUBVIEW: 俱乐部王朝与科研总控 (FRANCHISE DYNASTY & R&D LAB)
-- ============================================================================
local function BuildPhase3DynastyView(game, vs, navigate, onAction)
    local fac = vs.facilities or {}
    local coach = vs.coach or {}
    local rdPoints = 280

    -- Left Flank: Franchise Treasury & Switcher
    local leftFlank = F.TacticalCard("🏛️ 俱乐部基地矩阵", "FACILITY_MATRIX", {
        UI.Panel {
            width = "100%", flexDirection = "column", gap = 4, marginBottom = 6,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 2,
                    children = {
                        F.NeonButton("🧪科研", function() _phase3Sub = "RD_TREE" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "RD_TREE") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("🌟选秀", function() _phase3Sub = "EXPANSION" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "EXPANSION") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("👕战袍", function() _phase3Sub = "JERSEY" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "JERSEY") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("🏛️名人堂", function() _phase3Sub = "HOF" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "HOF") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("✈️特训", function() _phase3Sub = "BOOTCAMP" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "BOOTCAMP") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("⚔️阵型", function() _phase3Sub = "DYNAMICS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "DYNAMICS") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                    }
                },
                UI.Panel {
                    width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 2,
                    children = {
                        F.NeonButton("💍神戒", function() _phase3Sub = "RINGS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "RINGS") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("🧬传承", function() _phase3Sub = "TALENTS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "TALENTS") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("💼审计", function() _phase3Sub = "BUDGET" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "BUDGET") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("📹监控", function() _phase3Sub = "CCTV" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "CCTV") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("🎰抽卡", function() _phase3Sub = "GACHA" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "GACHA") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("🔗羁绊", function() _phase3Sub = "SYNERGY" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "SYNERGY") and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }),
                    }
                }
            }
        },
        F.TelemetryMeter("🏗️ 训练基地 (Lv." .. (fac.training or 2) .. ")", (fac.training or 2) * 20, 100, { variant = "cyan", unit = "LV" }),
        F.TelemetryMeter("🩺 康复中心 (Lv." .. (fac.rehab or 1) .. ")", (fac.rehab or 1) * 20, 100, { variant = "emerald", unit = "LV" }),
        F.TelemetryMeter("🎙️ 媒体公关室 (Lv." .. (fac.media or 1) .. ")", (fac.media or 1) * 20, 100, { variant = "amber", unit = "LV" }),
        F.TelemetryMeter("💼 个人持股比例", coach.equity or 20, 100, { variant = coach.equity and coach.equity >= 51 and "emerald" or "cyan", unit = "%" }),
        UI.Panel {
            backgroundColor = T.C.surfaceInset,
            padding = 8,
            borderRadius = 6,
            children = {
                UI.Label { text = "👑 控股状态: " .. ((coach.equity and coach.equity >= 51) and "绝对控股大股东" or "少数合伙人"), fontSize = 11, fontColor = T.C.neonAmber, fontWeight = "bold" }
            }
        }
    }, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    -- Center Stage based on _phase3Sub
    local centerStage
    if _phase3Sub == "TALENTS" then
        local pe = vs.prestige or {}
        local pts = pe.prestige_points or 0
        local talentCards = {}
        table.insert(talentCards, UI.Panel {
            width = "100%", flexDirection = "row", justifyContent = "space-between", padding = 8, backgroundColor = "#090D16", borderRadius = 6,
            children = {
                UI.Label { text = string.format("⚡ 轮回传承总池: %d 传承点数", pts), fontSize = 13, fontColor = T.C.neonAmber, fontWeight = "bold" },
                UI.Label { text = string.format("当前第 %d 世 (x%.2f)", pe.generation or 1, pe.difficulty_multiplier or 1.0), fontSize = 12, fontColor = T.C.neonCyan },
            }
        })
        local passives = PrestigeSystem and PrestigeSystem.LEGACY_PASSIVES or {}
        local unlockedMap = pe.unlocked_passives or {}
        for i = 1, math.min(6, #passives) do
            local pass = passives[i]
            local isUnlocked = unlockedMap[pass.id]
            table.insert(talentCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isUnlocked and T.C.neonEmerald or T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("%s %s (阶位%d) - %s", pass.icon or "⚡", pass.name, pass.tier or 1, pass.bonus or ""), fontSize = 11, fontWeight = "bold", fontColor = isUnlocked and T.C.neonEmerald or T.C.textPrimary },
                            UI.Label { text = pass.desc or "", fontSize = 9, fontColor = T.C.textMuted },
                        }
                    },
                    isUnlocked and UI.Label { text = "ACTIVE", fontSize = 11, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton(string.format("解锁 %dP", pass.cost), function() onAction("UNLOCK_LEGACY_PASSIVE", { passiveId = pass.id }) end, { variant = (pts >= pass.cost) and "amber" or "ghost", height = 28, width = 76, fontSize = 10 }),
                }
            })
        end
        centerStage = F.TacticalCard("🧬 名宿轮回传承天赋树 (Legacy Passives)", "TALENTS_TREE", talentCards, { flexGrow = 1 })
    elseif _phase3Sub == "BOOTCAMP" then
        local campCards = {}
        local activeCamp = vs.bootcamp and vs.bootcamp.active_bootcamp
        if activeCamp then
            table.insert(campCards, UI.Panel {
                width = "100%", padding = 8, backgroundColor = "#091712", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonEmerald,
                children = {
                    UI.Label { text = string.format("🔥【特训中】%s", activeCamp.location_name or "特训基地"), fontSize = 12, fontWeight = "bold", fontColor = T.C.neonEmerald },
                    UI.Label { text = string.format("剩余 %d 天 · 世界赛胜率 +%d%%", activeCamp.days_left or 0, math.floor((activeCamp.win_rate_bonus or 0) * 100)), fontSize = 10, fontColor = T.C.neonAmber, marginTop = 2 },
                }
            })
        end
        local locs = (vs.bootcamp and vs.bootcamp.all_locations) or (TrainingCamp and TrainingCamp.getAllLocations()) or {}
        for _, loc in ipairs(locs) do
            table.insert(campCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("%s %s · %s", loc.emoji or "✈️", loc.name, loc.country or ""), fontSize = 11, fontWeight = "bold", fontColor = T.C.neonCyan },
                            UI.Label { text = loc.tactical_buff_desc or "", fontSize = 9, fontColor = T.C.neonEmerald },
                        }
                    },
                    F.NeonButton("✈️出征 ($5W)", function() onAction("START_BOOTCAMP", { location_id = loc.id }) end, { variant = "amber", height = 26, width = 80, fontSize = 10 }),
                }
            })
        end
        centerStage = F.TacticalCard("✈️ 全球封闭特训营与出征集训", "REMOTE_BOOTCAMP", campCards, { flexGrow = 1 })
    elseif _phase3Sub == "DYNAMICS" then
        local dynCards = {}
        local td = vs.team_dynamics
        if td then
            table.insert(dynCards, UI.Panel {
                width = "100%", padding = 8, backgroundColor = "#140e1e", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonPurple,
                children = {
                    UI.Label { text = string.format("⭐ 当前阵型: %s · 战力加成 +%d", td.preset.name, td.synergy_power_bonus or 0), fontSize = 12, fontWeight = "bold", fontColor = T.C.neonPurple },
                    UI.Label { text = string.format("全队平均化学反应: %d/100 · 协同评级: %s", td.average_chemistry, td.synergy_level), fontSize = 10, fontColor = T.C.neonCyan, marginTop = 2 },
                }
            })
        end
        local allPresets = TeamDynamics and TeamDynamics.getAllPresets() or {}
        for _, pr in ipairs(allPresets) do
            local isCur = (td and td.preset and td.preset.id == pr.id)
            table.insert(dynCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isCur and T.C.neonAmber or T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("%s - %s", pr.name, pr.badge or ""), fontSize = 11, fontWeight = "bold", fontColor = isCur and T.C.neonAmber or T.C.textPrimary },
                            UI.Label { text = pr.buff_label or "", fontSize = 9, fontColor = T.C.neonEmerald },
                        }
                    },
                    isCur and UI.Label { text = "ACTIVE", fontSize = 11, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton("采用阵型", function() onAction("SET_TACTICAL_PRESET", { preset_id = pr.id }) end, { variant = "cyan", height = 26, width = 70, fontSize = 10 }),
                }
            })
        end
        centerStage = F.TacticalCard("⚔️ 战队核心战术阵型与选手羁绊", "TEAM_DYNAMICS", dynCards, { flexGrow = 1 })
    elseif _phase3Sub == "RINGS" then
        local ringCards = {}
        local ringData = vs.championship_rings or {}
        local allRings = ringData.all or (ChampionshipRings and ChampionshipRings.getAllRings()) or {}
        local unlockedList = ringData.unlocked or { "ring_s10_origin" }
        local unlockedMap = {}
        for _, uid in ipairs(unlockedList) do unlockedMap[uid] = true end
        local equippedId = ringData.equipped or "ring_s10_origin"

        for _, ring in ipairs(allRings) do
            local isUnlocked = unlockedMap[ring.id]
            local isEquipped = (equippedId == ring.id)
            local rCol = (ring.rarity == "ETERNAL") and T.C.neonAmber or ((ring.rarity == "IMMORTAL") and T.C.neonPurple or T.C.neonCyan)
            table.insert(ringCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isEquipped and T.C.neonAmber or T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("%s %s [%s]", ring.gem_emoji or "💍", ring.name, ring.rarity or "MYTHIC"), fontSize = 11, fontWeight = "bold", fontColor = isUnlocked and rCol or T.C.textMuted },
                            UI.Label { text = ring.stats_buff and ring.stats_buff.desc or "", fontSize = 9, fontColor = isUnlocked and T.C.neonEmerald or T.C.textMuted },
                        }
                    },
                    isEquipped and UI.Label { text = "👑 EQUIPPED", fontSize = 11, fontColor = T.C.neonAmber, fontWeight = "bold" }
                        or (isUnlocked and F.NeonButton("加冕佩戴", function() onAction("EQUIP_RING", { ring_id = ring.id }) end, { variant = "amber", height = 26, width = 70, fontSize = 10 })
                            or UI.Label { text = "🔒 未解锁", fontSize = 10, fontColor = T.C.textMuted })
                }
            })
        end
        centerStage = F.TacticalCard("💍 五代全球总决赛冠军神戒陈列馆", "CHAMPIONSHIP_RINGS", ringCards, { flexGrow = 1 })

    elseif _phase3Sub == "BUDGET" then
        local budCards = {}
        local dynastyBudget = (game.dynasty_engine and game.dynasty_engine.budget) or 250000
        table.insert(budCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#0c1322", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonEmerald,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = "🏛️ 俱乐部金库总储备: ¥" .. tostring(dynastyBudget), fontSize = 13, fontWeight = "bold", fontColor = T.C.neonEmerald },
                        UI.Label { text = "个人资金: $" .. tostring(vs.money), fontSize = 11, fontColor = T.C.neonAmber },
                    }
                },
                UI.Label { text = "跑道周期: 999+ 周 · 现金流极度健康 · 周盈余: +$15,300/周", fontSize = 10, fontColor = T.C.textSecondary, marginTop = 2 },
                F.NeonButton("📊 执行 CFO 深度财务审计 (追回赞助商返款 +$12,000~20,000)", function() onAction("BUDGET_AUDIT") end, { variant = "amber", height = 30, fontSize = 10, marginTop = 4 }),
            }
        })
        table.insert(budCards, UI.Panel {
            width = "100%", padding = 6, backgroundColor = T.C.surfaceInset, borderRadius = 6, gap = 2,
            children = {
                UI.Label { text = "📋 薪资帽安全管控与周成本支出:", fontSize = 11, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Label { text = "• 首发五人周薪总额: $38,500 / 软帽 $60,000 (安全区间，无需缴纳奢侈税)", fontSize = 10, fontColor = T.C.neonEmerald },
                UI.Label { text = "• 俱乐部基地维护: $7,500/周 | 教练组薪酬: $3,500/周", fontSize = 10, fontColor = T.C.textMuted },
                UI.Label { text = "• 赞助与战袍分成净流入: +$64,800/周", fontSize = 10, fontColor = T.C.neonAmber },
            }
        })
        centerStage = F.TacticalCard("💼 CFO 俱乐部财务审计与薪资帽控制台", "BUDGET_REVIEW", budCards, { flexGrow = 1 })

    elseif _phase3Sub == "CCTV" then
        local cctvCards = {}
        local cams = {
            { name = "📹 CAM_01 主训练室 (Scrim Lab)", status = "高频对抗中", temp = "21.5°C", buff = "对战复盘效率 +20%", feed = "五名首发选手正与全球前四强队进行高强度训练赛，打野刚刚完成了一次精彩的二级抓中！" },
            { name = "📹 CAM_02 心理疗愈室 (Mental Lounge)", status = "芳疗静息中", temp = "23.0°C", buff = "全员心率稳定 68bpm", feed = "心理理疗师正为选手佩戴脑波监测仪，进行深呼吸与赛前抗压压力释放指导。" },
            { name = "📹 CAM_03 星级夜宵厨房 (Kitchen)", status = "热量补给充足", temp = "24.2°C", buff = "卡路里超量恢复 +30%", feed = "特聘营养大厨正在准备高蛋白赛后热餐与复合维生素特饮，全天体能储备充足。" },
        }
        for _, c in ipairs(cams) do
            table.insert(cctvCards, UI.Panel {
                width = "100%", padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted, gap = 2,
                children = {
                    UI.Panel {
                        width = "100%", flexDirection = "row", justifyContent = "space-between",
                        children = {
                            UI.Label { text = c.name, fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                            UI.Label { text = string.format("%s · %s", c.temp, c.status), fontSize = 10, fontColor = T.C.neonCyan },
                        }
                    },
                    UI.Label { text = "增益: " .. c.buff, fontSize = 9, fontColor = T.C.neonEmerald },
                    UI.Label { text = c.feed, fontSize = 9, fontColor = T.C.textMuted },
                }
            })
        end
        table.insert(cctvCards, UI.Panel {
            width = "100%", padding = 6, backgroundColor = "#221115", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonRose,
            children = {
                UI.Label { text = "🚨 突发更衣室事件: 中单遭演员恶意嘲讽，心态受阻！", fontSize = 11, fontWeight = "bold", fontColor = T.C.neonRose },
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 6, marginTop = 4,
                    children = {
                        F.NeonButton("A. 教练疏导 (-$1000, 压力-15%)", function() onAction("CCTV_COMMAND", { action_name = "COACH_COUNSELING" }) end, { variant = "cyan", height = 28, fontSize = 9, flexGrow = 1 }),
                        F.NeonButton("B. 逆风硬刚 (微操+2, 压力+5%)", function() onAction("CCTV_COMMAND", { action_name = "RAGE_WIN" }) end, { variant = "amber", height = 28, fontSize = 9, flexGrow = 1 }),
                    }
                }
            }
        })
        centerStage = F.TacticalCard("📹 基地日常 · 俱乐部生活监控与督导", "PRO_LIFE_CCTV", cctvCards, { flexGrow = 1 })

    elseif _phase3Sub == "GACHA" then
        local gachaCards = {}
        table.insert(gachaCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#140e1e", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonPurple,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = "✨ S14 极光限定星探池 (Scout Gacha)", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonPurple },
                        UI.Label { text = "3 次内必出 SSS (保底机制)", fontSize = 10, fontColor = T.C.neonAmber },
                    }
                },
                UI.Label { text = "本期 UP 神级中单: VORTEX (天空领主 OVR: 99 | APM: 480)", fontSize = 11, fontWeight = "bold", fontColor = T.C.neonCyan, marginTop = 2 },
                UI.Label { text = "专属被动: 【神之领域】关键龙坑团战输出提升 35%，逆风翻盘率 +28%", fontSize = 9, fontColor = T.C.neonEmerald },
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 8, marginTop = 6,
                    children = {
                        F.NeonButton("单抽招募 ($2,000)", function() onAction("SCOUT_GACHA_PULL", { times = 1 }) end, { variant = "cyan", height = 30, fontSize = 10, flexGrow = 1 }),
                        F.NeonButton("十连欧皇抽卡 ($18,000 必出SR+)", function() onAction("SCOUT_GACHA_PULL", { times = 10 }) end, { variant = "amber", height = 30, fontSize = 10, flexGrow = 1 }),
                    }
                }
            }
        })
        centerStage = F.TacticalCard("🎁 全球星探 · SSS 神级选手招募", "SCOUT_GACHA", gachaCards, { flexGrow = 1 })

    elseif _phase3Sub == "SYNERGY" then
        local synCards = {}
        table.insert(synCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#09171e", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonCyan,
            children = {
                UI.Label { text = "⚡ 全队超频同调率: 94.2% · 终结伤害加成: +18.4%", fontSize = 12, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Label { text = "拓扑网络: [TOP 上单] === [JNG 打野] === [MID 中单] === [BOT 下路] === [SUP 辅助]", fontSize = 9, fontColor = T.C.textMuted, marginTop = 2 },
            }
        })
        local pairs = {
            { code = "JNG x MID", title = "黄金中野代练组合", lv = 5, effect = "控先锋与转线速度 +35% (已达满级)" },
            { code = "TOP x JNG", title = "上野互信越塔组", lv = 4, effect = "越塔配合 +20% 击杀斩获" },
            { code = "BOT x SUP", title = "默契下路组合", lv = 4, effect = "对线击杀率 +22% / 视野压制 +30%" },
            { code = "MID x BOT", title = "后期双核驱动", lv = 3, effect = "后期大龙团战容错率 +15%" },
        }
        for _, pr in ipairs(pairs) do
            table.insert(synCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("【%s】Lv.%d %s", pr.code, pr.lv, pr.title), fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                            UI.Label { text = pr.effect, fontSize = 9, fontColor = T.C.textMuted },
                        }
                    },
                    (pr.lv < 5) and F.NeonButton("升级羁绊 ($1,500)", function() onAction("UPGRADE_SYNERGY", { pair_code = pr.code }) end, { variant = "cyan", height = 26, width = 80, fontSize = 9 })
                        or UI.Label { text = "MAX", fontSize = 10, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                }
            })
        end
        centerStage = F.TacticalCard("🔗 战队羁绊 · 选手默契神经拓扑网络", "SYNERGY_NETWORK", synCards, { flexGrow = 1 })
    elseif _phase3Sub == "EXPANSION" then
        local expCards = {}
        local expData = vs.expansion_draft or {}
        local franchiseName = expData.expansionFranchiseName or "极光新纪元 (Aurora Gaming)"
        local currentYear = expData.currentYear or 2026
        local isDraftAvail = expData.isDraftAvailable ~= false

        table.insert(expCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#0c1524", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonCyan,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = string.format("🏛️ %d 联盟扩军新军: %s", currentYear, franchiseName), fontSize = 12, fontWeight = "bold", fontColor = T.C.neonCyan },
                        UI.Label { text = isDraftAvail and "🟢 选秀权有效" or "🔴 选秀顺位已使用", fontSize = 10, fontColor = isDraftAvail and T.C.neonEmerald or T.C.textMuted },
                    }
                },
                UI.Label { text = "各队已提交核心 3 人豁免名单 · 未保护战力与 SSS 级新秀入池自由摘牌！", fontSize = 10, fontColor = T.C.textSecondary, marginTop = 2 },
                F.NeonButton("🔒 签署锁定首发核心 3 人豁免名单", function()
                    onAction("EXPANSION_DRAFT", { isProtect = true, protectedIds = { "p_mid", "p_adc", "p_jug" } })
                end, { variant = "cyan", height = 28, fontSize = 10, marginTop = 4 }),
            }
        })

        local prodigiesList = {
            { id = "prodigy-mid-1", name = "顾清锋", alias = "绝影", role = "MID", avatar = "🗡️", mechanics = 96, macro = 86, bonus = 35000, trait = "生死战极限操作 +18%" },
            { id = "prodigy-jug-1", name = "朴俊熙 (Lucid)", alias = "野区路人王", role = "JUG", avatar = "⚡", mechanics = 93, macro = 94, bonus = 32000, trait = "控龙率高达 88%" },
            { id = "prodigy-adc-1", name = "林星辞 (ViperX)", alias = "走A机器", role = "ADC", avatar = "🎯", mechanics = 97, macro = 83, bonus = 38000, trait = "残血收割输出 +22%" },
            { id = "prodigy-top-1", name = "钟天岳 (Aegis)", alias = "叹息之壁", role = "TOP", avatar = "🛡️", mechanics = 88, macro = 95, bonus = 28000, trait = "承伤容错率 +25%" },
            { id = "prodigy-sup-1", name = "白羽舟 (MingKey)", alias = "总导演", role = "SUP", avatar = "🔮", mechanics = 90, macro = 96, bonus = 26000, trait = "视野掌控与完美开团 +20%" },
        }
        local draftedMap = {}
        for _, dp in ipairs(expData.draftedProdigies or {}) do draftedMap[dp.id or dp.name] = true end

        for _, p in ipairs(prodigiesList) do
            local isDrafted = draftedMap[p.id] or draftedMap[p.name]
            table.insert(expCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isDrafted and T.C.neonAmber or T.C.borderMuted,
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2,
                        children = {
                            UI.Label { text = string.format("%s %s · %s [%s] SSS-99", p.avatar, p.name, p.alias, p.role), fontSize = 11, fontWeight = "bold", fontColor = isDrafted and T.C.neonAmber or T.C.textPrimary },
                            UI.Label { text = string.format("微操 %d / 大局 %d · 特权: %s", p.mechanics, p.macro, p.trait), fontSize = 9, fontColor = T.C.neonEmerald },
                        }
                    },
                    isDrafted and UI.Label { text = "SIGNED ✓", fontSize = 10, fontColor = T.C.neonAmber, fontWeight = "bold" }
                        or F.NeonButton(string.format("摘牌 ($%d)", p.bonus), function()
                            onAction("EXPANSION_DRAFT", { isDraft = true, prodigyId = p.id })
                        end, { variant = "amber", height = 26, width = 90, fontSize = 9 })
                }
            })
        end
        centerStage = F.TacticalCard("🌟 联盟扩军特权选秀协议 · SSS级超新星人才池", "EXPANSION_DRAFT_STAGE", expCards, { flexGrow = 1 })

    elseif _phase3Sub == "JERSEY" then
        local jerCards = {}
        local js = vs.jersey_studio or {
            pattern = "cyber_stripes", crest = "cyber_phoenix", colorPreset = "暗影霓虹",
            priceTier = "pro_player_edition", hypeScore = 80, weeklyUnits = 320, projectedRevenue = 47680
        }

        table.insert(jerCards, UI.Panel {
            width = "100%", padding = 8, backgroundColor = "#14101e", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonPurple,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = string.format("👕 战袍: %s · 队徽: %s · 定价: %s", js.pattern or "竞速光芒", js.crest or "赛博不死鸟", js.priceTier or "职业同款"), fontSize = 11, fontWeight = "bold", fontColor = T.C.neonPurple },
                        UI.Label { text = string.format("🔥 HYPE: %d/100", js.hypeScore or 80), fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                    }
                },
                UI.Label { text = string.format("周预估销量: %d 件 · 周预估营业额: +$%d · 周利润: +$%d", js.weeklyUnits or 320, js.projectedRevenue or 47680, js.weeklyProfit or 33280), fontSize = 10, fontColor = T.C.neonEmerald, marginTop = 2 },
            }
        })

        -- Patterns
        local pats = {
            { id = "carbon_fiber", name = "碳纤维 (+8)" },
            { id = "neon_grid", name = "霓虹矩阵 (+12)" },
            { id = "cyber_stripes", name = "竞速光芒 (+10)" },
            { id = "lightning_split", name = "雷霆裂变 (+14)" },
            { id = "gold_hex", name = "至尊金蜂巢 (+18)" },
        }
        local patBtns = {}
        for _, p in ipairs(pats) do
            local isSel = (js.pattern == p.id)
            table.insert(patBtns, F.NeonButton(p.name, function() onAction("CUSTOMIZE_JERSEY", { pattern = p.id }) end, { variant = isSel and "amber" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }))
        end
        table.insert(jerCards, UI.Panel {
            width = "100%", flexDirection = "column", gap = 2,
            children = {
                UI.Label { text = "📐 材质纹理 (Pattern):", fontSize = 10, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Panel { width = "100%", flexDirection = "row", gap = 2, children = patBtns }
            }
        })

        -- Crests
        local crests = {
            { id = "dragon_flame", name = "炽焰炎龙 🐉 (+5)" },
            { id = "cyber_phoenix", name = "赛博不死鸟 🦅 (+8)" },
            { id = "apex_tiger", name = "绝巅白虎 🐯 (+7)" },
            { id = "iron_shield", name = "守望重盾 🛡️ (+6)" },
        }
        local crestBtns = {}
        for _, c in ipairs(crests) do
            local isSel = (js.crest == c.id)
            table.insert(crestBtns, F.NeonButton(c.name, function() onAction("CUSTOMIZE_JERSEY", { crest = c.id }) end, { variant = isSel and "cyan" or "ghost", height = 24, fontSize = 9, flexGrow = 1 }))
        end
        table.insert(jerCards, UI.Panel {
            width = "100%", flexDirection = "column", gap = 2, marginTop = 2,
            children = {
                UI.Label { text = "🛡️ 战队队徽 (Crest):", fontSize = 10, fontWeight = "bold", fontColor = T.C.neonCyan },
                UI.Panel { width = "100%", flexDirection = "row", gap = 2, children = crestBtns }
            }
        })

        -- Pricing Tiers
        local tiers = {
            { id = "fan_edition", name = "大众助威版 ($69)", desc = "销量 1.6x 薄利多销" },
            { id = "pro_player_edition", name = "职业同款 ($149)", desc = "官方专业剪裁" },
            { id = "collector_golden_box", name = "至尊礼盒 ($299)", desc = "纯金绣线 签名认证" },
        }
        for _, t in ipairs(tiers) do
            local isSel = (js.priceTier == t.id)
            table.insert(jerCards, UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                padding = 5, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isSel and T.C.neonEmerald or T.C.borderMuted,
                children = {
                    UI.Label { text = string.format("%s · %s", t.name, t.desc), fontSize = 10, fontColor = isSel and T.C.neonEmerald or T.C.textSecondary },
                    isSel and UI.Label { text = "ACTIVE", fontSize = 10, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        or F.NeonButton("采用定价", function() onAction("CUSTOMIZE_JERSEY", { priceTier = t.id }) end, { variant = "emerald", height = 24, width = 70, fontSize = 9 })
                }
            })
        end
        centerStage = F.TacticalCard("👕 战队定制战袍工坊与周边商业化", "JERSEY_STUDIO_STAGE", jerCards, { flexGrow = 1 })
    elseif _phase3Sub == "HOF" then
        local hofCards = {}
        local hof = vs.hall_of_fame or (game.hall_of_fame) or {}
        local legends = hof.legends or {}
        local eqAuraId = hof.equipped_aura_id
        local eqAura = hof.equipped_aura

        -- Active Aura Banner
        if eqAura then
            table.insert(hofCards, UI.Panel {
                width = "100%", padding = 8, backgroundColor = "#1b1424", borderRadius = 6, borderWidth = 1, borderColor = T.C.neonPurple,
                flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Label { text = "✨ 【当前激活名宿意志】" .. (eqAura.name or "") .. " (" .. (eqAura.desc or "") .. ")", fontSize = 11, fontWeight = "bold", fontColor = T.C.neonPurple },
                    UI.Label { text = string.format("全局胜率 +%d%%", eqAura.winRateBonus or 0), fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                }
            })
        else
            table.insert(hofCards, UI.Panel {
                width = "100%", padding = 6, backgroundColor = T.C.surfaceInset, borderRadius = 6,
                children = {
                    UI.Label { text = "⚠️ 当前未激活名宿意志庇佑。请在下方传奇战袍展台中激活名宿神威！", fontSize = 10, fontColor = T.C.textMuted }
                }
            })
        end

        -- Custom Induction Banner
        table.insert(hofCards, UI.Panel {
            width = "100%", padding = 6, backgroundColor = T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = T.C.borderMuted,
            flexDirection = "row", justifyContent = "space-between", alignItems = "center",
            children = {
                UI.Panel {
                    flexDirection = "column", gap = 2,
                    children = {
                        UI.Label { text = "👑 为自创选手举行球衣退役封神仪式 (#99号战袍)", fontSize = 11, fontWeight = "bold", fontColor = T.C.neonAmber },
                        UI.Label { text = "将生涯荣耀与辉煌数据永久镌刻于名人堂穹顶之上！", fontSize = 9, fontColor = T.C.textSecondary },
                    }
                },
                F.NeonButton("举行退役仪式", function()
                    onAction("INDUCT_HOF", {
                        name = (game.player and game.player.name) or "宿命之子",
                        role = (game.player and game.player.position) or "MID",
                        jerseyNumber = "#99",
                    })
                end, { variant = "amber", height = 26, width = 110, fontSize = 9 }),
            }
        })

        -- Legends Catalog
        for _, leg in ipairs(legends) do
            local isAuraEq = (eqAuraId and leg.aura and eqAuraId == leg.aura.id)
            local rightAction = nil
            if leg.aura then
                if isAuraEq then
                    rightAction = UI.Label { text = "ACTIVE ✨", fontSize = 10, fontColor = T.C.neonPurple, fontWeight = "bold" }
                else
                    rightAction = F.NeonButton("激活意志", function() onAction("EQUIP_HOF_AURA", { aura_id = leg.aura.id }) end, { variant = "cyan", height = 26, width = 75, fontSize = 9 })
                end
            end

            table.insert(hofCards, UI.Panel {
                width = "100%", padding = 6, backgroundColor = isAuraEq and "#191522" or T.C.surface, borderRadius = 6, borderWidth = 1, borderColor = isAuraEq and T.C.neonPurple or T.C.borderMuted,
                flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Panel {
                        flexDirection = "column", gap = 2, flexGrow = 1,
                        children = {
                            UI.Label { text = string.format("👕【%s号战袍】%s · %s [%s] · GOAT %.1f ⭐", leg.jerseyNumber or "#", leg.name or "", leg.title or "", leg.role or "", leg.goatScore or 90), fontSize = 11, fontWeight = "bold", fontColor = isAuraEq and T.C.neonPurple or T.C.neonAmber },
                            UI.Label { text = string.format("生涯: %s | 奖杯: %d 座 | KDA: %s | 绝活: %s", leg.years or "", leg.trophiesCount or 0, tostring(leg.careerKDA or "5.0"), leg.signatureChamps or "全能"), fontSize = 9, fontColor = T.C.neonCyan },
                            leg.aura and UI.Label { text = "意志: " .. (leg.aura.name or "") .. " (" .. (leg.aura.desc or "") .. ")", fontSize = 9, fontColor = T.C.textSecondary } or nil,
                        }
                    },
                    rightAction,
                }
            })
        end

        centerStage = F.TacticalCard("🏛️ 传奇名人堂与退役战袍展厅 (Hall of Fame)", "HOF_STUDIO_STAGE", hofCards, { flexGrow = 1 })
    else
        centerStage = F.TacticalCard("🧪 俱乐部核心科研实验室 (R&D Tech Tree)", "RD_LAB_TREE", {
            UI.Panel {
                width = "100%",
                flexDirection = "row",
                justifyContent = "space-between",
                padding = 8,
                backgroundColor = "#090D16",
                borderRadius = 6,
                children = {
                    UI.Label { text = "🔬 可用科研点数: " .. tostring(rdPoints) .. " PTS", fontSize = 13, fontColor = T.C.neonAmber, fontWeight = "bold" },
                    UI.Label { text = "战袍科技树: Lv.2 蜂窝透气立体编织", fontSize = 12, fontColor = T.C.neonCyan },
                }
            },
            UI.Panel {
                width = "100%",
                flexGrow = 1,
                backgroundColor = T.C.surfaceInset,
                padding = 10,
                borderRadius = 6,
                gap = 8,
                children = {
                    -- Tech Node 1
                    UI.Panel {
                        width = "100%",
                        flexDirection = "row",
                        justifyContent = "space-between",
                        alignItems = "center",
                        padding = 8,
                        backgroundColor = T.C.surface,
                        borderColor = T.C.neonCyan,
                        borderWidth = 1,
                        borderRadius = 6,
                        children = {
                            UI.Panel {
                                flexDirection = "column",
                                gap = 2,
                                children = {
                                    UI.Label { text = "🧬 分支一: 人体机能工程 (Lv.2 已激活)", fontSize = 13, fontWeight = "bold", fontColor = T.C.neonCyan },
                                    UI.Label { text = "全队疲劳积累速度 -20%，高强度BO5体能抗性大幅提升", fontSize = 11, fontColor = T.C.textSecondary },
                                }
                            },
                            UI.Label { text = "✓ ACTIVE", fontSize = 12, fontColor = T.C.neonEmerald, fontWeight = "bold" }
                        }
                    },
                    -- Tech Node 2
                    UI.Panel {
                        width = "100%",
                        flexDirection = "row",
                        justifyContent = "space-between",
                        alignItems = "center",
                        padding = 8,
                        backgroundColor = T.C.surface,
                        borderColor = T.C.borderMuted,
                        borderWidth = 1,
                        borderRadius = 6,
                        children = {
                            UI.Panel {
                                flexDirection = "column",
                                gap = 2,
                                children = {
                                    UI.Label { text = "📡 分支二: 战术AI模拟沙盘 (Lv.1 可研发)", fontSize = 13, fontWeight = "bold", fontColor = T.C.textPrimary },
                                    UI.Label { text = "消耗 150 科研点数，解锁对手实时战术破绽热图", fontSize = 11, fontColor = T.C.textSecondary },
                                }
                            },
                            F.NeonButton("启动突破", function()
                                onAction("UPGRADE_MERCH_TECH")
                            end, { variant = "amber", height = 36, width = 96, fontSize = 12 })
                        }
                    },
                    -- Tech Node 3
                    UI.Panel {
                        width = "100%",
                        flexDirection = "row",
                        justifyContent = "space-between",
                        alignItems = "center",
                        padding = 8,
                        backgroundColor = T.C.surface,
                        borderColor = T.C.borderInactive,
                        borderWidth = 1,
                        borderRadius = 6,
                        children = {
                            UI.Panel {
                                flexDirection = "column",
                                gap = 2,
                                children = {
                                    UI.Label { text = "🏟️ 分支三: 国际电竞主场场馆 (Lv.3 锁定)", fontSize = 13, fontWeight = "bold", fontColor = T.C.textMuted },
                                    UI.Label { text = "需要前置节点解锁且俱乐部资金达到 $1,000,000", fontSize = 11, fontColor = T.C.textMuted },
                                }
                            },
                            UI.Label { text = "🔒 LOCKED", fontSize = 12, fontColor = T.C.neonRose, fontWeight = "bold" }
                        }
                    }
                }
            }
        }, { flexGrow = 1 })
    end

    -- Right Flank: Dynasty Tycoon Action Deck
    local rightFlank = F.TacticalCard("💼 王朝运营指挥台", "DYNASTY_ACTIONS", {
        F.NeonButton("🏗️ 扩建训练基地 (-$20,000)", function()
            onAction("UPGRADE_FACILITY")
        end, { variant = "cyan", height = 48 }),

        F.NeonButton("🌟 青训营球探选拔 (-$10,000)", function()
            onAction("SCOUT_TRAINEE")
        end, { variant = "emerald", height = 48 }),

        F.NeonButton("💼 董事会注资提案", function()
            onAction("COACH_PROPOSAL")
        end, { variant = "ghost", height = 46 }),

        F.NeonButton("🌍 征战世界巡回赛 (10层关卡)", function()
            onAction("WORLD_TOUR")
        end, { variant = "amber", height = 50 }),
    }, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    return UI.Panel {
        width = "100%",
        flexGrow = 1,
        flexDirection = "row",
        gap = 14,
        children = { leftFlank, centerStage, rightFlank },
    }
end

-- ============================================================================
-- 5. MASTER LANDSCAPE VIEW CONTAINER (1920x1080)
-- ============================================================================
function PhaseViews.Build(navigate)
    local game = EsportScreen.GetGame()
    local vs = game:getViewState()

    -- Action dispatcher bridge
    local function onAction(actionId, payload)
        local res = game:onAction(actionId, payload or {})
        if navigate then navigate("esport_sim_landscape") end
        return res
    end

    -- Build Active Subview
    local currentBody
    if _activePhase == 2 then
        currentBody = BuildPhase2ProView(game, vs, navigate, onAction)
    elseif _activePhase == 3 then
        currentBody = BuildPhase3DynastyView(game, vs, navigate, onAction)
    else
        currentBody = BuildPhase1SoloView(game, vs, navigate, onAction)
    end

    -- Bottom Ticker Notification Slot
    local bottomTicker = UI.Panel {
        width = "100%",
        height = 36,
        backgroundColor = "#080C14",
        borderColor = T.C.borderInactive,
        borderTopWidth = 1,
        flexDirection = "row",
        justifyContent = "space-between",
        alignItems = "center",
        padding = { left = 24, right = 24 },
        children = {
            UI.Label {
                text = "⚡ ESPORTS ENGINE 2.4 | 1920x1080 移动端横屏 HUD 已就绪 | 60 FPS BATCHED NANOVG",
                fontSize = 11,
                fontColor = T.C.textMuted,
            },
            UI.Panel {
                flexDirection = "row",
                gap = 12,
                children = {
                    UI.Label { text = "💾 自动云存档已同步", fontSize = 11, fontColor = T.C.neonEmerald },
                    UI.Label { text = "安全触控边缘: 48px+", fontSize = 11, fontColor = T.C.neonCyan },
                }
            }
        }
    }

    -- Emergency Crisis Dilemma Banner (if pending crisis)
    local crisisBanner = nil
    if vs.pending_crisis then
        local pc = vs.pending_crisis
        local optBtns = {}
        for idx, opt in ipairs(pc.options or {}) do
            table.insert(optBtns, UI.Panel {
                flexDirection = "column", gap = 2, flexGrow = 1,
                children = {
                    F.NeonButton(opt.label, function()
                        onAction("RESOLVE_CRISIS", { crisis_id = pc.id, option_index = idx })
                    end, { variant = (idx == 1 and "amber" or "ghost"), height = 30, fontSize = 9 }),
                    UI.Label { text = opt.desc or "", fontSize = 8, fontColor = T.C.textMuted },
                }
            })
        end
        crisisBanner = UI.Panel {
            width = "100%", padding = { top = 8, bottom = 8, left = 24, right = 24 },
            backgroundColor = "#240a12", borderColor = T.C.neonRose, borderBottomWidth = 2,
            flexDirection = "column", gap = 3,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = pc.banner or ("🚨 突发危机事件: " .. (pc.title or "")), fontSize = 12, fontWeight = "bold", fontColor = T.C.neonRose },
                        UI.Label { text = "【两难决断】请在此处迅速做出战队抉择！", fontSize = 9, fontColor = T.C.neonAmber },
                    }
                },
                UI.Label { text = pc.scenario or "", fontSize = 9, fontColor = T.C.textPrimary },
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 8, marginTop = 2, children = optBtns
                }
            }
        }
    end

    local rootChildren = {
        BuildTopBar(game, vs, navigate),
    }
    if crisisBanner then
        table.insert(rootChildren, crisisBanner)
    end
    table.insert(rootChildren, UI.Panel {
        width = "100%",
        flexGrow = 1,
        padding = { top = 12, bottom = 12, left = 24, right = 24 },
        children = { currentBody },
    })
    table.insert(rootChildren, bottomTicker)

    -- Root 1920x1080 Responsive Viewport
    return UI.Panel {
        width = "100%",
        height = "100%",
        backgroundColor = T.C.bg,
        flexDirection = "column",
        children = rootChildren,
    }
end

return PhaseViews
