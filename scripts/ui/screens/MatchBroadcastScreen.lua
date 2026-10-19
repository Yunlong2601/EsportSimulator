--[[
    ============================================================================
    MATCH BROADCAST SCREEN — 2D 比赛演播剧场与峡谷战术沙盘
    ============================================================================
    TapTap Maker UrhoX Native Screen Component
    Visualizes:
      1. Top Telemetry Bar (Teams, Score, Timer, Gold Diff, Speed & Skip buttons)
      2. 2D Summoner's Rift Tactical Radar Canvas with 10 Champion dynamic nodes
      3. Live Event Ticker & Kill Feed Banners (First Blood, Dragon, Baron, Ace)
      4. Baron Tactical Intervention Modal (5-second player decider)
      5. Post-Match MVP & Damage Share Ceremony Card
    ============================================================================
--]]

local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")

local MatchBroadcastScreen = {}

local function formatGold(g)
    if not g then return "0" end
    if g >= 10000 then
        return string.format("%.1fk", g / 1000)
    end
    return tostring(g)
end

function MatchBroadcastScreen.Build(game, vs, navigate, onAction)
    local match = vs.current_visual_match or (game and game.current_visual_match)
    if not match then
        local fix = vs.current_fixture or (vs.league_schedule and vs.league_schedule[1])
        local rivalName = (fix and fix.opponent_name) or "T1 (魔王宿敌)"
        local rivalStar = (fix and fix.star_player) or "Faker (大魔王)"
        local rivalTactic = (fix and fix.key_tactic) or "大龙逼团与灵性开团"
        local rivalThreat = (fix and fix.threat) or "SSS"

        return UI.Panel {
            width = "100%", padding = 16, backgroundColor = DS.C.surface, borderRadius = 8, gap = 8,
            children = {
                UI.Panel {
                    width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        DS.Label("📺 2D 比赛演播剧场 · 赛前 BP 战术草拟室", { fontSize = 14, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.CyberBadge(string.format("劲敌 %s", rivalThreat), "gold")
                    }
                },
                DS.Label(string.format("⚔️ 今日常规赛天王山对决: 你方战队 VS %s", rivalName), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                DS.Label(string.format("核心关注: %s  |  敌方绝招: %s", rivalStar, rivalTactic), { fontSize = 11, fontColor = DS.C.info }),
                DS.Label("请在下方选定一套战术体系进场，以克制对方打法并获得 +15% 战力增益！选定后即刻开战：", { fontSize = 10, fontColor = DS.C.muted }),
                UI.Panel {
                    width = "100%", flexDirection = "column", gap = 6, marginTop = 6,
                    children = {
                        UI.Button {
                            text = "🗡️ 冲阵强突体系 (Dive Comp) · 突脸秒核心 [+15% 战力]", height = 36,
                            backgroundColor = "#b91c1c", textColor = "#ffffff", fontWeight = "bold",
                            onClick = function()
                                if onAction then onAction("CHOOSE_BP_TACTIC", { tactic_id = "DIVE", rival_name = rivalName }) end
                            end
                        },
                        UI.Button {
                            text = "🏹 远距拉扯体系 (Poke Comp) · 绝境超远消耗 [+15% 战力]", height = 36,
                            backgroundColor = "#0284c7", textColor = "#ffffff", fontWeight = "bold",
                            onClick = function()
                                if onAction then onAction("CHOOSE_BP_TACTIC", { tactic_id = "POKE", rival_name = rivalName }) end
                            end
                        },
                        UI.Button {
                            text = "🛡️ 铁桶团战体系 (Teamfight Comp) · 阵地大龙团 [+15% 战力]", height = 36,
                            backgroundColor = "#15803d", textColor = "#ffffff", fontWeight = "bold",
                            onClick = function()
                                if onAction then onAction("CHOOSE_BP_TACTIC", { tactic_id = "TEAMFIGHT", rival_name = rivalName }) end
                            end
                        },
                        UI.Button {
                            text = "⚡ 快速开启常规演播对决 (Standard Match)", height = 32,
                            backgroundColor = DS.C.surfaceInset, textColor = DS.C.textDim,
                            onClick = function()
                                if onAction then onAction("START_VISUAL_MATCH") end
                            end
                        }
                    }
                }
            }
        }
    end

    local nodes = {}

    -- ------------------------------------------------------------------------
    -- 1. TOP TELEMETRY & MATCH HEADER
    -- ------------------------------------------------------------------------
    local goldDiff = (match.score.gold_blue or 2500) - (match.score.gold_red or 2500)
    local goldDiffLabel = ""
    local goldDiffColor = DS.C.textDim
    if goldDiff > 0 then
        goldDiffLabel = string.format("蓝方 +%s G 领先", formatGold(goldDiff))
        goldDiffColor = DS.C.info
    elseif goldDiff < 0 then
        goldDiffLabel = string.format("红方 +%s G 领先", formatGold(-goldDiff))
        goldDiffColor = DS.C.error
    else
        goldDiffLabel = "双方经济持平"
    end

    local topTelemetry = UI.Panel {
        width = "100%", backgroundColor = DS.C.surfaceAlt, borderRadius = 8,
        padding = 8, borderWidth = 1, borderColor = DS.C.border, flexDirection = "column", gap = 6,
        children = {
            -- Row 1: Team names, Score, Match Clock
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    -- Blue Team
                    UI.Panel {
                        flexDirection = "row", alignItems = "center", gap = 6,
                        children = {
                            DS.Chip("蓝方", { fontColor = DS.C.info, borderColor = DS.C.info }),
                            UI.Label { text = match.playerTeamName or "你方战队", fontSize = 12, fontWeight = "bold", fontColor = DS.C.info },
                        }
                    },
                    -- Scoreboard & Clock
                    UI.Panel {
                        flexDirection = "column", alignItems = "center",
                        children = {
                            UI.Label {
                                text = string.format("%d  VS  %d", match.score.blue or 0, match.score.red or 0),
                                fontSize = 16, fontWeight = "bold", fontColor = DS.C.gold
                            },
                            UI.Label {
                                text = string.format("⏱️ %s", match:formatGameTime()),
                                fontSize = 11, fontColor = DS.C.muted, marginTop = 1
                            }
                        }
                    },
                    -- Red Team
                    UI.Panel {
                        flexDirection = "row", alignItems = "center", gap = 6,
                        children = {
                            UI.Label { text = match.enemyTeamName or "GEN", fontSize = 12, fontWeight = "bold", fontColor = DS.C.error },
                            DS.Chip("红方", { fontColor = DS.C.error, borderColor = DS.C.error }),
                        }
                    }
                }
            },
            -- Row 2: Objective Counters & Economy Gauge
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                paddingTop = 4, borderTopWidth = 1, borderColor = DS.C.border,
                children = {
                    UI.Label {
                        text = string.format("🐉 大龙: %d  |  🔥 小龙: %d  |  🏰 防御塔: %d",
                            match.score.baron_blue or 0, match.score.dragons_blue or 0, 11 - (match.score.towers_red or 11)),
                        fontSize = 10, fontColor = DS.C.info
                    },
                    UI.Label {
                        text = goldDiffLabel,
                        fontSize = 10, fontWeight = "bold", fontColor = goldDiffColor
                    },
                    UI.Label {
                        text = string.format("🏰 防御塔: %d  |  🔥 小龙: %d  |  🐉 大龙: %d",
                            11 - (match.score.towers_blue or 11), match.score.dragons_red or 0, match.score.baron_red or 0),
                        fontSize = 10, fontColor = DS.C.error
                    }
                }
            },
            -- Row 3: Playback Controls (1x, 2x, 4x, Pause, Skip, Close)
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                paddingTop = 4,
                children = {
                    UI.Panel {
                        flexDirection = "row", gap = 4,
                        children = {
                            UI.Button {
                                text = "⏸️ 暂停", width = 50, height = 24, fontSize = 10,
                                backgroundColor = (match.speed == 0) and DS.C.gold or DS.C.surfaceInset,
                                textColor = (match.speed == 0) and "#1a0e08" or DS.C.textDim,
                                borderWidth = 1, borderColor = DS.C.border, borderRadius = 4,
                                onClick = function() if onAction then onAction("SET_MATCH_SPEED", { speed = 0 }) end end
                            },
                            UI.Button {
                                text = "1x", width = 36, height = 24, fontSize = 10,
                                backgroundColor = (match.speed == 1) and DS.C.info or DS.C.surfaceInset,
                                textColor = (match.speed == 1) and "#1a0e08" or DS.C.textDim,
                                borderWidth = 1, borderColor = DS.C.border, borderRadius = 4,
                                onClick = function() if onAction then onAction("SET_MATCH_SPEED", { speed = 1 }) end end
                            },
                            UI.Button {
                                text = "2x", width = 36, height = 24, fontSize = 10,
                                backgroundColor = (match.speed == 2) and DS.C.info or DS.C.surfaceInset,
                                textColor = (match.speed == 2) and "#1a0e08" or DS.C.textDim,
                                borderWidth = 1, borderColor = DS.C.border, borderRadius = 4,
                                onClick = function() if onAction then onAction("SET_MATCH_SPEED", { speed = 2 }) end end
                            },
                            UI.Button {
                                text = "4x", width = 36, height = 24, fontSize = 10,
                                backgroundColor = (match.speed == 4) and DS.C.ember or DS.C.surfaceInset,
                                textColor = (match.speed == 4) and "#1a0e08" or DS.C.textDim,
                                borderWidth = 1, borderColor = DS.C.border, borderRadius = 4,
                                onClick = function() if onAction then onAction("SET_MATCH_SPEED", { speed = 4 }) end end
                            },
                        }
                    },
                    UI.Panel {
                        flexDirection = "row", gap = 4,
                        children = {
                            UI.Button {
                                text = "⏩ 快速跳过", width = 76, height = 24, fontSize = 10,
                                backgroundColor = DS.C.surfaceInset, textColor = DS.C.warning,
                                borderWidth = 1, borderColor = DS.C.warning, borderRadius = 4,
                                onClick = function() if onAction then onAction("SKIP_VISUAL_MATCH") end end
                            },
                            UI.Button {
                                text = "✖️ 退出演播", width = 76, height = 24, fontSize = 10,
                                backgroundColor = DS.C.surfaceInset, textColor = DS.C.muted,
                                borderWidth = 1, borderColor = DS.C.border, borderRadius = 4,
                                onClick = function() if onAction then onAction("CLOSE_VISUAL_MATCH") end end
                            }
                        }
                    }
                }
            }
        }
    }
    table.insert(nodes, topTelemetry)

    -- ------------------------------------------------------------------------
    -- 2. DYNAMIC BROADCAST BANNER (High-Octane Cut-in)
    -- ------------------------------------------------------------------------
    if match.activeBanner then
        local banner = match.activeBanner
        local bColor = DS.C.gold
        if banner.type == "FIRST_BLOOD" then bColor = "#ff3366"
        elseif banner.type == "BARON_SLAY" then bColor = "#b829ea"
        elseif banner.type == "DRAGON_SLAY" then bColor = "#ff7700"
        elseif banner.type == "ACE" then bColor = "#ffcc00"
        elseif banner.type == "VICTORY" then bColor = "#00ffcc"
        elseif banner.type == "DEFEAT" then bColor = "#ff4444"
        end

        table.insert(nodes, UI.Panel {
            width = "100%", backgroundColor = "#0b101b", borderRadius = 8,
            padding = 10, marginTop = 6, borderWidth = 2, borderColor = bColor,
            flexDirection = "column", alignItems = "center", justifyContent = "center",
            children = {
                UI.Label { text = banner.title or "HIGH OCTANE PLAY", fontSize = 15, fontWeight = "bold", fontColor = bColor },
                UI.Label { text = banner.subtitle or "", fontSize = 11, fontColor = DS.C.text, marginTop = 2 }
            }
        })
    end

    -- ------------------------------------------------------------------------
    -- 3. 2D SUMMONER'S RIFT TACTICAL RADAR CANVAS
    -- ------------------------------------------------------------------------
    -- Tactical map schematic representations
    local mapCanvasChildren = {}

    -- Background Grid & River Divider Indicator
    table.insert(mapCanvasChildren, UI.Panel {
        position = "absolute", left = 0, top = 0, width = "100%", height = "100%",
        backgroundColor = "#080c14", borderRadius = 8, borderWidth = 1, borderColor = "#1b253b"
    })

    -- Map Base Anchors: Blue Nexus (Bottom-Left) & Red Nexus (Top-Right)
    table.insert(mapCanvasChildren, UI.Panel {
        position = "absolute", left = 14, bottom = 14, width = 48, height = 26,
        backgroundColor = "#00448888", borderRadius = 4, borderWidth = 1, borderColor = DS.C.info,
        alignItems = "center", justifyContent = "center",
        children = { UI.Label { text = "蓝方枢纽", fontSize = 9, fontColor = DS.C.info } }
    })
    table.insert(mapCanvasChildren, UI.Panel {
        position = "absolute", right = 14, top = 14, width = 48, height = 26,
        backgroundColor = "#88002288", borderRadius = 4, borderWidth = 1, borderColor = DS.C.error,
        alignItems = "center", justifyContent = "center",
        children = { UI.Label { text = "红方枢纽", fontSize = 9, fontColor = DS.C.error } }
    })

    -- Baron Pit (Top-Left River)
    table.insert(mapCanvasChildren, UI.Panel {
        position = "absolute", left = 75, top = 55, width = 72, height = 28,
        backgroundColor = "#2b104088", borderRadius = 6, borderWidth = 1, borderColor = "#b829ea",
        alignItems = "center", justifyContent = "center",
        children = { UI.Label { text = "🐉 纳什男爵", fontSize = 9, fontColor = "#e68bff" } }
    })

    -- Dragon Pit (Bottom-Right River)
    table.insert(mapCanvasChildren, UI.Panel {
        position = "absolute", right = 75, bottom = 55, width = 72, height = 28,
        backgroundColor = "#40180888", borderRadius = 6, borderWidth = 1, borderColor = "#ff7700",
        alignItems = "center", justifyContent = "center",
        children = { UI.Label { text = "🔥 炼狱巨龙", fontSize = 9, fontColor = "#ffaa44" } }
    })

    -- Center Lane / River Crossing Beacon
    table.insert(mapCanvasChildren, UI.Panel {
        position = "absolute", left = "45%", top = "46%", width = 36, height = 20,
        backgroundColor = "#121b2b88", borderRadius = 4, alignItems = "center", justifyContent = "center",
        children = { UI.Label { text = "中河道", fontSize = 8, fontColor = DS.C.muted } }
    })

    -- Render 10 Champion dynamic nodes (Blue & Red)
    local function renderChampionNode(champ, isBlue)
        local posX = string.format("%d%%", math.min(90, math.max(6, math.floor(champ.x or 50))))
        local posY = string.format("%d%%", math.min(90, math.max(6, math.floor(champ.y or 50))))
        local nodeBorder = isBlue and DS.C.info or DS.C.error
        local nodeBg = isBlue and "#0a1f38" or "#380a14"
        if champ.isDead then
            nodeBorder = "#555566"
            nodeBg = "#111118"
        end

        local hpBarWidth = math.max(4, math.floor((champ.hp or 100) * 0.36))
        local hpColor = ((champ.hp or 100) > 40) and DS.C.success or DS.C.warning
        if champ.isDead then hpColor = "#555555" end

        return UI.Panel {
            position = "absolute", left = posX, top = posY,
            width = 44, height = 30,
            backgroundColor = nodeBg, borderRadius = 6, borderWidth = 1.5, borderColor = nodeBorder,
            flexDirection = "column", alignItems = "center", justifyContent = "center",
            children = {
                UI.Panel {
                    flexDirection = "row", alignItems = "center", gap = 2,
                    children = {
                        UI.Label {
                            text = champ.isDead and "💀" or (champ.role or ""),
                            fontSize = 8, fontWeight = "bold", fontColor = champ.isDead and "#888899" or nodeBorder
                        },
                        UI.Label {
                            text = tostring(champ.kills or 0),
                            fontSize = 8, fontColor = DS.C.gold
                        }
                    }
                },
                -- Miniature Health Bar
                UI.Panel {
                    width = 36, height = 3, backgroundColor = "#111122", borderRadius = 1, marginTop = 1,
                    children = {
                        UI.Panel { width = hpBarWidth, height = 3, backgroundColor = hpColor, borderRadius = 1 }
                    }
                }
            }
        }
    end

    for _, c in pairs(match.champions.blue or {}) do
        table.insert(mapCanvasChildren, renderChampionNode(c, true))
    end
    for _, c in pairs(match.champions.red or {}) do
        table.insert(mapCanvasChildren, renderChampionNode(c, false))
    end

    local radarContainer = UI.Panel {
        width = "100%", height = 240, marginTop = 6,
        position = "relative", overflow = "hidden",
        children = mapCanvasChildren
    }
    table.insert(nodes, radarContainer)

    -- ------------------------------------------------------------------------
    -- 4. TACTICAL INTERVENTION DECIDER (5-Second Baron Decider)
    -- ------------------------------------------------------------------------
    if match.status == "PAUSED_TACTICAL" then
        local timeoutSec = string.format("%.1fs", math.max(0, match.tacticalTimeout or 0))
        local interventionModal = UI.Panel {
            width = "100%", backgroundColor = "#1c1404", borderRadius = 8,
            padding = 10, marginTop = 6, borderWidth = 2, borderColor = DS.C.gold,
            flexDirection = "column", gap = 6,
            children = {
                UI.Panel {
                    flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = "⚡【绝境临场战术决断】22:30 大龙坑死斗决策！", fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold },
                        DS.Chip("倒计时 " .. timeoutSec, { fontColor = DS.C.error, borderColor = DS.C.error })
                    }
                },
                UI.Label { text = "豪门战队在大龙坑率先逼团！全场聚焦于你的指挥，请立刻下达战术指令：", fontSize = 10, fontColor = DS.C.textDim },
                UI.Panel {
                    width = "100%", flexDirection = "row", gap = 6, marginTop = 4,
                    children = {
                        UI.Button {
                            text = "👑 孤勇者中单进场抢龙\n(+60%微操抢龙率/极高风险)", flexGrow = 1, flexBasis = 0, height = 38,
                            fontSize = 9, fontWeight = "bold", backgroundColor = "#ff6a3d", textColor = "#1a0e08",
                            borderRadius = 6, onClick = function() if onAction then onAction("MAKE_TACTICAL_DECISION", { choice_index = 1 }) end end
                        },
                        UI.Button {
                            text = "🛡️ 双惩戒拼刺刀稳杀\n(+40%团战防守胜率)", flexGrow = 1, flexBasis = 0, height = 38,
                            fontSize = 9, fontWeight = "bold", backgroundColor = "#06b6d4", textColor = "#001018",
                            borderRadius = 6, onClick = function() if onAction then onAction("MAKE_TACTICAL_DECISION", { choice_index = 2 }) end end
                        },
                        UI.Button {
                            text = "🏰 止损偷家换高地水晶\n(战术置换推塔逼退)", flexGrow = 1, flexBasis = 0, height = 38,
                            fontSize = 9, fontWeight = "bold", backgroundColor = "#36d399", textColor = "#001810",
                            borderRadius = 6, onClick = function() if onAction then onAction("MAKE_TACTICAL_DECISION", { choice_index = 3 }) end end
                        },
                    }
                }
            }
        }
        table.insert(nodes, interventionModal)
    end

    -- ------------------------------------------------------------------------
    -- 5. POST-MATCH MVP CEREMONY CARD (When match is FINISHED)
    -- ------------------------------------------------------------------------
    if match.status == "FINISHED" and match.mvpReport then
        local rep = match.mvpReport
        local isWin = rep.isWin
        local outcomeTitle = isWin and "🏆 荣耀决胜 · VICTORY" or "💔 战局落幕 · DEFEAT"
        local outcomeColor = isWin and DS.C.gold or DS.C.error

        local mvpCard = UI.Panel {
            width = "100%", backgroundColor = DS.C.surfaceAlt, borderRadius = 8,
            padding = 10, marginTop = 6, borderWidth = 1.5, borderColor = outcomeColor,
            flexDirection = "column", gap = 6,
            children = {
                UI.Panel {
                    flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                    children = {
                        UI.Label { text = outcomeTitle, fontSize = 14, fontWeight = "bold", fontColor = outcomeColor },
                        DS.Chip("总比分: " .. tostring(rep.teamScore or "0:0"), { fontColor = outcomeColor, borderColor = outcomeColor })
                    }
                },
                -- MVP Showcase
                UI.Panel {
                    backgroundColor = DS.C.surfaceInset, borderRadius = 6, padding = 8,
                    flexDirection = "column", gap = 4,
                    children = {
                        UI.Panel {
                            flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                            children = {
                                UI.Label {
                                    text = string.format("👑 全场 MVP: %s [%s]", rep.mvpPlayer or "Prodigy", rep.mvpRole or "MID"),
                                    fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold
                                },
                                UI.Label {
                                    text = string.format("官方评分: ★ %s 分 ★", rep.mvpRating or "9.8"),
                                    fontSize = 12, fontWeight = "bold", fontColor = DS.C.ember
                                }
                            }
                        },
                        UI.Label { text = rep.mvpTitle or "绝境救世主", fontSize = 10, fontColor = DS.C.textDim },
                        UI.Label {
                            text = string.format("战绩 KDA: %s  |  全队伤害占比: %d%%  |  经济净胜: %+d G",
                                rep.kda or "0/0/0", rep.damageShare or 0, rep.totalGoldDiff or 0),
                            fontSize = 10, fontColor = DS.C.info
                        },
                        UI.Label {
                            text = "🎙️ 解说热评: " .. (rep.casterQuote or "精彩绝伦的巅峰之战！"),
                            fontSize = 10, fontColor = DS.C.muted, marginTop = 2
                        }
                    }
                },
                -- Team Damage Share Breakdown
                UI.Panel {
                    width = "100%", flexDirection = "column", gap = 2,
                    children = {
                        UI.Label { text = "📊 全队输出伤害占比图谱:", fontSize = 10, fontWeight = "bold", fontColor = DS.C.textDim },
                        UI.Panel {
                            width = "100%", flexDirection = "row", gap = 6,
                            children = {
                                UI.Label { text = string.format("上单: %d%%", rep.teamDmgShares.TOP or 20), fontSize = 9, fontColor = DS.C.text },
                                UI.Label { text = string.format("打野: %d%%", rep.teamDmgShares.JNG or 20), fontSize = 9, fontColor = DS.C.text },
                                UI.Label { text = string.format("中单: %d%% ★", rep.teamDmgShares.MID or 35), fontSize = 9, fontWeight = "bold", fontColor = DS.C.gold },
                                UI.Label { text = string.format("射手: %d%%", rep.teamDmgShares.ADC or 20), fontSize = 9, fontColor = DS.C.text },
                                UI.Label { text = string.format("辅助: %d%%", rep.teamDmgShares.SUP or 5), fontSize = 9, fontColor = DS.C.text },
                            }
                        }
                    }
                },
                -- Return & Collect Rewards Button
                UI.Button {
                    text = isWin and "💰 领取 +$12,000 赛事胜场奖金并返回大厅" or "📋 总结复盘并返回大厅",
                    width = "100%", height = 36, marginTop = 4,
                    backgroundColor = isWin and DS.C.ember or DS.C.surfaceInset,
                    textColor = isWin and "#1a0e08" or DS.C.text,
                    fontWeight = "bold", fontSize = 11, borderRadius = 6,
                    onClick = function()
                        if onAction then onAction("CLOSE_VISUAL_MATCH") end
                    end
                }
            }
        }
        table.insert(nodes, mvpCard)
    end

    -- ------------------------------------------------------------------------
    -- 6. LIVE EVENT TICKER STREAM (Recent 4 events)
    -- ------------------------------------------------------------------------
    local recentEvents = {}
    local logs = match.eventsLog or {}
    local startIdx = math.max(1, #logs - 3)
    for i = #logs, startIdx, -1 do
        table.insert(recentEvents, logs[i])
    end

    local tickerItems = {}
    table.insert(tickerItems, UI.Label {
        text = "📢 实时解说与击杀快讯:", fontSize = 10, fontWeight = "bold", fontColor = DS.C.muted
    })

    if #recentEvents == 0 then
        table.insert(tickerItems, UI.Label {
            text = "对线期平稳发育中，兵线汇聚，双方试探中...", fontSize = 9, fontColor = DS.C.muted
        })
    else
        for _, ev in ipairs(recentEvents) do
            table.insert(tickerItems, UI.Label {
                text = ev.text or "", fontSize = 9, fontColor = DS.C.textDim
            })
        end
    end

    table.insert(nodes, UI.Panel {
        width = "100%", backgroundColor = DS.C.surface, borderRadius = 6,
        padding = 8, marginTop = 6, borderWidth = 1, borderColor = DS.C.border,
        flexDirection = "column", gap = 3, children = tickerItems
    })

    return UI.Panel {
        width = "100%", flexDirection = "column", children = nodes
    }
end

return MatchBroadcastScreen
