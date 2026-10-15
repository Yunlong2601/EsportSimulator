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
                F.NeonButton("🎯 排位", function() _phase1Sub = "LADDER" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "LADDER") and "cyan" or "ghost", height = 30, fontSize = 11, flexGrow = 1 }),
                F.NeonButton("🛒 神装", function() _phase1Sub = "SHOP" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "SHOP") and "cyan" or "ghost", height = 30, fontSize = 11, flexGrow = 1 }),
                F.NeonButton("🤝 经纪", function() _phase1Sub = "AGENCY" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase1Sub == "AGENCY") and "cyan" or "ghost", height = 30, fontSize = 11, flexGrow = 1 }),
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
            width = "100%", flexDirection = "row", gap = 4, marginBottom = 6,
            children = {
                F.NeonButton("⚔️ BP 赛场", function() _phase2Sub = "BP_ROOM" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "BP_ROOM") and "cyan" or "ghost", height = 30, fontSize = 11, flexGrow = 1 }),
                F.NeonButton("📊 全球榜", function() _phase2Sub = "RANKINGS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "RANKINGS") and "cyan" or "ghost", height = 30, fontSize = 11, flexGrow = 1 }),
                F.NeonButton("📜 Meta榜", function() _phase2Sub = "META_TIER" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase2Sub == "META_TIER") and "cyan" or "ghost", height = 30, fontSize = 11, flexGrow = 1 }),
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
    if _phase2Sub == "RANKINGS" then
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
        F.NeonButton("🏆 " .. T.Microcopy.executeTactic .. " (出征正赛)", function()
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
            width = "100%", flexDirection = "row", gap = 2, marginBottom = 6,
            children = {
                F.NeonButton("🧪科研", function() _phase3Sub = "RD_TREE" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "RD_TREE") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("✈️特训", function() _phase3Sub = "BOOTCAMP" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "BOOTCAMP") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("⚔️阵型", function() _phase3Sub = "DYNAMICS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "DYNAMICS") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("💍神戒", function() _phase3Sub = "RINGS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "RINGS") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
                F.NeonButton("🧬传承", function() _phase3Sub = "TALENTS" if navigate then navigate("esport_sim_landscape") end end, { variant = (_phase3Sub == "TALENTS") and "cyan" or "ghost", height = 28, fontSize = 9, flexGrow = 1 }),
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

    -- Root 1920x1080 Responsive Viewport
    return UI.Panel {
        width = "100%",
        height = "100%",
        backgroundColor = T.C.bg,
        flexDirection = "column",
        children = {
            BuildTopBar(game, vs, navigate),
            UI.Panel {
                width = "100%",
                flexGrow = 1,
                padding = { top = 12, bottom = 12, left = 24, right = 24 },
                children = { currentBody },
            },
            bottomTicker,
        }
    }
end

return PhaseViews
