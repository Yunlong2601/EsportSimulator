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

local PhaseViews = {}

-- Module View State
local _activePhase = 1

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
    local leftFlank = F.TacticalCard("📊 选手生理与手速监控", "SOLO_TELEMETRY", {
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
    }, { width = T.Layout.flankZoneWidth, flexGrow = 0 })

    -- Center Stage: Matchmaking Radar & Live Arena Logs
    local centerStage = F.TacticalCard("⚔️ 峡谷巅峰天梯排位大厅", "LIVE_LADDER", {
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
    -- Left Flank: Scout Radar & Tournament Tree
    local leftFlank = F.TacticalCard("🎯 俱乐部球探洞察", "PRO_SCOUT", {
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

    -- Center Stage: 5v5 Tactical Match & BP Draft Room
    local centerStage = F.TacticalCard("⚔️ 5v5 职业赛场 BP 战术分析室", "STAGE_BP_ROOM", {
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
    local rdPoints = 280 -- Simulated tech points pool

    -- Left Flank: Franchise Treasury & Facility Matrix
    local leftFlank = F.TacticalCard("🏛️ 俱乐部基地矩阵", "FACILITY_MATRIX", {
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

    -- Center Stage: R&D Technology Tree (Interactive Branching Visualizer)
    local centerStage = F.TacticalCard("🧪 俱乐部核心科研实验室 (R&D Tech Tree)", "RD_LAB_TREE", {
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
