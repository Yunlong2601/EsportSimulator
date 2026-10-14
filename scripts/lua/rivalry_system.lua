--[[
    ============================================================================
    TAPTAP MAKE: SOLO QUEUE RIVALRY SYSTEM (天梯宿敌对垒系统)
    ============================================================================
    Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    Mechanic:
      - Tracks a persistent high-ELO NPC rival: 顾寒舟 (ColdBlade) in Solo Queue.
      - Head-to-head score tracking (player_wins vs rival_wins).
      - Dynamic tension (火药味 0-100%) escalating across 4 emotional stages:
          * ⚔️ 初试锋芒 (Budding: 0-34%)
          * 🔥 针锋相对 (Intense: 35-59%)
          * 💥 一生之敌 (Nemesis: 60-84%)
          * 👑 绝代双骄 (Legendary: 85-100%)
      - Snipe Queue Radar (宿敌狙击模式) ensures next match encounters the rival.
      - Generates dramatic Chinese flavor-text narratives, quotes, and after-match
        reactions with fame & bonus prize money on victories.
--]]

local RivalrySystem = {}
RivalrySystem.__index = RivalrySystem

function RivalrySystem.newDefaultState()
    return {
        rival_id = "cold_blade",
        rival_name = "顾寒舟",
        rival_handle = "ColdBlade",
        rival_title = "峡谷第一刺客 · 绝活路人王",
        rival_avatar = "🥷",
        signature_champ = "影流之主 (劫)",
        player_wins = 1,
        rival_wins = 1,
        tension = 25,
        tension_stage = "rival_budding",
        last_clash_outcome = nil,
        rival_status_quote = "“天梯高分局就这么大，别让我逮到你落单。”",
        snipe_queue_active = false,
        clash_history = {
            {
                id = "clash_init_1",
                timestamp = "19:42",
                outcome = "rival_win",
                score_snapshot = "0 - 1",
                tension_after = 15,
                flavor_text = "天梯首度狭路相逢！顾寒舟操刀影流之主卡视野三影齐飞秒杀你，公屏打出【就这？】",
                rival_quote = "“操作变形了兄弟，这分我笑纳了。”",
                rival_action = "在全屏公屏亮出提莫点赞嘲讽表情。"
            },
            {
                id = "clash_init_2",
                timestamp = "21:15",
                outcome = "player_win",
                score_snapshot = "1 - 1",
                tension_after = 25,
                flavor_text = "次局再度撞车！你极限反向闪现躲其瞬狱影杀阵并完成塔下反杀，扳平比分！",
                rival_quote = "“走位挺贼，下把最好别让我再排到你。”",
                rival_action = "赛后秒退房间，个性签名改为【专注猎杀】。"
            }
        }
    }
end

function RivalrySystem.evaluateStage(tension)
    if tension >= 85 then
        return "rival_legendary"
    elseif tension >= 60 then
        return "rival_nemesis"
    elseif tension >= 35 then
        return "rival_intense"
    else
        return "rival_budding"
    end
end

function RivalrySystem.getStageTitle(stage)
    if stage == "rival_legendary" then
        return "👑 绝代双骄 · 终极宿命对决", 4
    elseif stage == "rival_nemesis" then
        return "💥 一生之敌 · 宿命仇怨爆发", 3
    elseif stage == "rival_intense" then
        return "🔥 针锋相对 · 火药味急剧升温", 2
    else
        return "⚔️ 初试锋芒 · 宿怨渐起", 1
    end
end

function RivalrySystem.toggleSnipeQueue(state)
    state.snipe_queue_active = not state.snipe_queue_active
    local msg = ""
    if state.snipe_queue_active then
        msg = string.format("🎯【宿敌狙击雷达启动】已锁定天梯高分队列！下一场排位赛将 100%% 狭路相逢宿敌【%s (%s)】！火药味瞬间拉满！",
            state.rival_name, state.rival_handle)
    else
        msg = "🎯 已关闭宿敌狙击雷达，重回常规天梯随机匹配池。"
    end
    return state.snipe_queue_active, msg
end

function RivalrySystem.generateNarrative(is_win, current_state)
    local next_player_wins = current_state.player_wins + (is_win and 1 or 0)
    local next_rival_wins = current_state.rival_wins + (is_win and 0 or 1)
    local cur_tension = current_state.tension

    if is_win then
        if cur_tension >= 80 then
            return {
                flavor_text = string.format("👑 【绝代双骄 · 终极加冕】天梯天王山生死战彻底击溃宿敌【顾寒舟 (ColdBlade)】！双方打满35分钟贡献教科书级极限对拼与心理博弈，全网观战主播齐声惊呼封神！各大职业战队球探已将两人的名字并列记录于首发引援名册！(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“能在天梯遇到你这样的一生之敌，是我的荣幸。职业赛场见，届时我不会再输一分。”",
                rival_action = "顾寒舟在直播间公开发布致敬动态，并向你投递了双雄点赞认证。",
                tension_delta = 10,
                bonus_fame = 6,
                bonus_money = 300
            }
        elseif cur_tension >= 55 then
            return {
                flavor_text = string.format("💥 【宿命对决 · 绝地碾压】万众瞩目的天梯焦点之局！你顶住顾寒舟四次刺杀gank，残血反秀将其斩落马下并推平敌方水晶！顾寒舟红温破防，公屏连发三串问号【???】！(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“算你有种，这局野区被你预判到了。加个好友，改天敢不敢来单挑？”",
                rival_action = "怒退赛后结算界面，游戏个人签名改为【闭关特训，誓报一箭之仇】。",
                tension_delta = 15,
                bonus_fame = 4,
                bonus_money = 180
            }
        elseif cur_tension >= 30 then
            return {
                flavor_text = string.format("🔥 【宿怨交锋 · 强势复仇】与宿敌【顾寒舟 (ColdBlade)】爆发激烈摩擦！你操刀英雄中路抢先升6闪现点燃完成对线单杀，终结其全图节奏！赛后天梯频道热议你的高光集锦！(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“连续被你算计两波...行，这把你的微操确实压了我一头。”",
                rival_action = "在峡谷对局复盘中反复回放你的单杀第一视角寻找破绽。",
                tension_delta = 12,
                bonus_fame = 3,
                bonus_money = 100
            }
        else
            return {
                flavor_text = string.format("⚔️ 【天梯撞车 · 斩获小胜】排位巧遇宿敌【顾寒舟 (ColdBlade)】！团战中你精准锁定其走位完成击杀，阻断其滚雪球之势，夺得对局胜利。(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“阵容克制而已。别高兴太早，下把最好祈祷别再撞到我。”",
                rival_action = "公屏敲出【gg】，立刻秒排进入下一场天梯队列。",
                tension_delta = 10,
                bonus_fame = 2,
                bonus_money = 60
            }
        end
    else
        -- Loss to rival
        if cur_tension >= 80 then
            return {
                flavor_text = string.format("👑 【绝代双骄 · 棋差半招】与【顾寒舟 (ColdBlade)】鏖战38分钟神仙拉扯！终局龙坑决战被其鬼魅刺客极限换命抢下远古龙，遗憾告负！顾寒舟赛后在公屏打字真诚致意。(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“GG WP！这局是我今年在峡谷打得最过瘾的一把对决，你值得所有掌声。下次我等你赢回来。”",
                rival_action = "在天梯战报页面为你点亮【强劲对手】金标勋章。",
                tension_delta = 8,
                bonus_fame = 2,
                bonus_money = 0
            }
        elseif cur_tension >= 55 then
            return {
                flavor_text = string.format("💥 【宿命压制 · 惨痛挫败】顾寒舟在关键战局中展现恐怖刺客压制力！全场游走收割打崩三路，并在击杀你后亮出专属嘲讽大拇指！赛后弹幕黑粉疯狂带节奏！(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“在天梯榜首待太久，你的警惕心退步了。想赢我，回去练好基本功再来吧。”",
                rival_action = "在电竞贴吧截图发帖【今天给某位新晋红人上了一课】，引发数百跟帖。",
                tension_delta = 18,
                bonus_fame = 0,
                bonus_money = 0
            }
        elseif cur_tension >= 30 then
            return {
                flavor_text = string.format("🔥 【宿怨加剧 · 遗憾吞败】中野联动遭宿敌【顾寒舟 (ColdBlade)】彻底粉碎！被其卡视野影分身秒杀后丢掉大龙，公屏被敌方无情嘲讽，战火硝烟愈演愈烈！(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“操作变形了兄弟，关键局就手抖？这分我就不客气地收下了。”",
                rival_action = "在对局公屏持续刷出【问号 ?】，并向你发送了排位加好友约战申请。",
                tension_delta = 14,
                bonus_fame = 0,
                bonus_money = 0
            }
        else
            return {
                flavor_text = string.format("⚔️ 【天梯受挫 · 宿怨初结】在排位中被宿敌【顾寒舟 (ColdBlade)】针对埋伏！下路小规模团战被其收割，输掉对局，天梯胜点缩水。(比分: 玩家 %d - %d 顾寒舟)", next_player_wins, next_rival_wins),
                rival_quote = "“路人王？就这水平？连我的影子都摸不到。”",
                rival_action = "在公屏打出【EZ WIN】，神态嚣张。",
                tension_delta = 12,
                bonus_fame = 0,
                bonus_money = 0
            }
        end
    end
end

function RivalrySystem.resolveClash(state, is_win, player)
    local narrative = RivalrySystem.generateNarrative(is_win, state)
    local next_player_wins = state.player_wins + (is_win and 1 or 0)
    local next_rival_wins = state.rival_wins + (is_win and 0 or 1)
    local next_tension = math.min(100, math.max(0, state.tension + narrative.tension_delta))
    local next_stage = RivalrySystem.evaluateStage(next_tension)

    state.player_wins = next_player_wins
    state.rival_wins = next_rival_wins
    state.tension = next_tension
    state.tension_stage = next_stage
    state.last_clash_outcome = is_win and "win" or "loss"
    state.rival_status_quote = narrative.rival_quote
    state.snipe_queue_active = false

    local time_str = os.date("%H:%M")
    local new_log = {
        id = "clash_" .. tostring(os.time()),
        timestamp = time_str,
        outcome = is_win and "player_win" or "rival_win",
        score_snapshot = string.format("%d - %d", next_player_wins, next_rival_wins),
        tension_after = next_tension,
        flavor_text = narrative.flavor_text,
        rival_quote = narrative.rival_quote,
        rival_action = narrative.rival_action
    }
    table.insert(state.clash_history, 1, new_log)
    if #state.clash_history > 15 then
        table.remove(state.clash_history)
    end

    -- Apply bonuses to player
    if player then
        if narrative.bonus_fame > 0 then
            player.fame = math.min(100, (player.fame or 0) + narrative.bonus_fame)
        end
        if narrative.bonus_money > 0 then
            player.money = (player.money or 0) + narrative.bonus_money
        end
    end

    return narrative, new_log
end

function RivalrySystem.formatStatusBanner(state)
    local stage_title, flame_count = RivalrySystem.getStageTitle(state.tension_stage)
    local flames = string.rep("🔥", flame_count)
    local total = state.player_wins + state.rival_wins
    local win_rate = total > 0 and math.floor((state.player_wins / total) * 100) or 50

    local lines = {}
    table.insert(lines, "╔════════════════════════════════════════════════════════════════╗")
    table.insert(lines, string.format("║ ⚔️ 天梯宿命对垒追踪: %s (%s) · %s ║", state.rival_name, state.rival_handle, state.signature_champ))
    table.insert(lines, string.format("║ 称号: %-53s ║", state.rival_title))
    table.insert(lines, string.format("║ 比分: 玩家 [%d 胜] vs [%d 胜] 顾寒舟 (胜率: %d%%)               ║", state.player_wins, state.rival_wins, win_rate))
    table.insert(lines, string.format("║ 火药味: [%d%%] %s %-32s ║", state.tension, flames, stage_title))
    table.insert(lines, string.format("║ 狙击雷达: %-52s ║", state.snipe_queue_active and "🎯 已锁定顾寒舟队列 (下局必撞车)" or "关闭 (常规天梯匹配)"))
    table.insert(lines, string.format("║ 喊话: %-54s ║", state.rival_status_quote))
    table.insert(lines, "╚════════════════════════════════════════════════════════════════╝")
    return table.concat(lines, "\n")
end

return RivalrySystem
