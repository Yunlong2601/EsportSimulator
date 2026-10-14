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
    -- 2. FIVE-TAB MAIN NAVIGATION ROW
    -- ========================================================================
    local curTab = game.active_tab or "CAREER"
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
        width = "100%", flexDirection = "row", gap = 6, marginTop = 6, children = navButtons
    })

    -- ========================================================================
    -- 3. TAB CONTENT
    -- ========================================================================
    if curTab == "CAREER" then
        -- --------------------------------------------------------------------
        -- TAB 1: SOLO QUEUE & AMATEUR HUB
        -- --------------------------------------------------------------------
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
                { id = "OVERVIEW",   label = "📊 总盘" },
                { id = "FACILITIES", label = "🏢 基地" },
                { id = "ACADEMY",    label = "🎓 青训" },
                { id = "COACH",      label = "💼 股权" },
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
            end
        end

    elseif curTab == "TOUR" then
        -- --------------------------------------------------------------------
        -- TAB 4: WORLD TOUR & POWER RANKINGS
        -- --------------------------------------------------------------------
        table.insert(nodes, DS.SectionHeader("🌍 无尽世界巡回赛与全球战力榜", "荣耀征途", nil))

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

        -- Global Power Rankings
        table.insert(nodes, DS.Card {
            children = {
                DS.Label("📊 2026 全球豪门战队战力榜 (Global Rankings)", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                DS.Label("1. 🥇 GEN (Gen.G Esports)     - 战力 97.8 (LCK)", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("2. 🥈 BLG (Bilibili Gaming)    - 战力 96.5 (LPL)", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("3. 🥉 T1 (SK Telecom)         - 战力 95.2 (LCK)", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("4.    TES (Top Esports)        - 战力 94.0 (LPL)", { fontSize = 11, fontColor = DS.C.muted }),
                DS.Label("5.    HLE (Hanwha Life)        - 战力 93.1 (LCK)", { fontSize = 11, fontColor = DS.C.muted }),
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
    end

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
