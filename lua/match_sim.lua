--[[
    ============================================================================
    TAPTAP MAKE: TEXT SIMULATOR MATCH ENGINE & PROMOTION SERIES MODULE
    ============================================================================
    目标平台: TapTap Make (纯 Lua 5.1 / LuaJIT)
    功能定位: 文字模拟器逐回合实时战报推演、战术分支抉择与段位生死晋级赛状态机
    ============================================================================
--]]

local MatchSim = {}
MatchSim.__index = MatchSim

-- 选手特质库 (纯中文)
MatchSim.TRAITS = {
    lane_bully     = { id = "lane_bully", name = "线霸压制", bonus_win = 15, desc = "前期对线击杀率提升，第一滴血发生率加倍" },
    ice_veins      = { id = "ice_veins", name = "大心脏冷酷", bonus_win = 20, desc = "逆风翻盘率提升，决胜局心态永不崩溃" },
    clutch_cleaner = { id = "clutch_cleaner", name = "残局收割机", bonus_win = 25, desc = "决胜团战四杀/五杀概率大幅上升" },
    shotcaller     = { id = "shotcaller", name = "战术指挥中枢", bonus_win = 18, desc = "大龙/远古龙决策成功率提升" },
    one_trick_god  = { id = "one_trick_god", name = "绝活哥本命", bonus_win = 16, desc = "连胜状态下排位积分跳段加成" }
}

function MatchSim.new()
    local self = setmetatable({}, MatchSim)
    self.energy_drinks = 2
    self.scout_attention = 35 -- 0 ~ 100%
    self.active_traits = { "lane_bully", "ice_veins" }
    self.promo_series = nil
    return self
end

-- 开启文字模拟器逐分钟对局推演
function MatchSim:simulate_text_match(champ_name, mechanics, mental, win_streak, is_promo)
    local logs = {}
    local kills = 0
    local deaths = 0
    local assists = 0

    -- 1. 03分钟：对线期 抢二血拼
    local early_roll = math.random(1, 100)
    if early_roll <= (mechanics * 0.7 + 25) then
        kills = kills + 1
        table.insert(logs, {
            minute = 3,
            phase = "对线期",
            text = string.format("【第一滴血 FIRST BLOOD】你操刀 [%s] 凭借细腻卡兵线抢先升2级！闪现挂点燃越塔单杀敌方中单！", champ_name),
            type = "kill"
        })
    else
        deaths = deaths + 1
        table.insert(logs, {
            minute = 3,
            phase = "对线期",
            text = "【对线波折】敌方打野二级出人意料反向抓中，你交闪后仍被减速黏住交出一血，但迅速TP稳住兵线。",
            type = "kill"
        })
    end

    -- 2. 09分钟：小龙与先锋团战
    local mid_roll = math.random(1, 100)
    if mid_roll <= (mental * 0.6 + mechanics * 0.4 + 20) then
        kills = kills + 1
        assists = assists + 1
        table.insert(logs, {
            minute = 9,
            phase = "资源控图",
            text = "【战术联动】推完线后敏锐捕捉下路破绽，配合野辅打出四包二越塔，击杀敌方双人组并收下首条炼金小龙！",
            type = "objective"
        })
    else
        assists = assists + 1
        table.insert(logs, {
            minute = 9,
            phase = "资源控图",
            text = "【河道遭遇】野区争夺迅捷蟹爆发小规模摩擦，双方互换辅助技能，拉开阵型继续发育。",
            type = "objective"
        })
    end

    -- 3. 16分钟：中期团战与外塔攻防
    kills = kills + 2
    assists = assists + 2
    table.insert(logs, {
        minute = 16,
        phase = "中期转线",
        text = string.format("【高光团战】中路二塔爆发激烈团战！你 [%s] 在侧翼卡视野进场，关键大招控住敌方走位失误的ADC瞬秒双C！", champ_name),
        type = "teamfight"
    })

    -- 4. 23分钟：大龙生死决胜
    local baron_roll = math.random(1, 100)
    local total_win_pct = math.min(92, math.max(15, mechanics * 0.45 + mental * 0.35 + win_streak * 4 + 15))
    local is_win = baron_roll <= total_win_pct

    if is_win then
        kills = kills + 2
        assists = assists + 3
        table.insert(logs, {
            minute = 23,
            phase = "男爵生死团",
            text = "【男爵决断】大龙坑处双方十人集结！你沉着指挥果断反打，金身骗出对手核心大招，队友顺势团灭对手收下大龙BUFF！",
            type = "clutch"
        })
        table.insert(logs, {
            minute = 28,
            phase = "水晶终局",
            text = "【全场胜利 VICTORY】携带着大龙先锋 Buff 势如破竹摧毁三路高地水晶！敌方主堡枢纽爆裂！",
            type = "caster"
        })
    else
        deaths = deaths + 2
        assists = assists + 1
        table.insert(logs, {
            minute = 23,
            phase = "男爵生死团",
            text = "【大龙失利】大龙坑视野被敌方压缩，敌方刺客极限抢龙并反打团灭我方后排。",
            type = "clutch"
        })
        table.insert(logs, {
            minute = 28,
            phase = "水晶终局",
            text = "【遗憾落败 DEFEAT】高地团战敌方开出完美团控，尽管拼尽全力换掉敌方核心，基地依然告破。",
            type = "caster"
        })
    end

    local kda = string.format("%d/%d/%d", kills, deaths, assists)
    local headline = is_win
        and string.format("👑 [MVP评定 9.8分] 操刀 %s 斩获 %s，力挽狂澜率队拿下关键排位胜场！", champ_name, kda)
        or string.format("💔 [战意不熄 7.4分] %s 遗憾打出 %s，苦战 28 分钟惜败。", champ_name, kda)

    return is_win, logs, kda, headline
end

-- 饮用特浓冰美式/红牛战备 (瞬回精力，打破断粮卡关)
function MatchSim:consume_energy_drink(current_energy, current_money)
    if self.energy_drinks > 0 then
        self.energy_drinks = self.energy_drinks - 1
        local new_energy = math.min(100, current_energy + 40)
        return true, new_energy, current_money, "⚡ 饮用备战背包中的特浓红牛！精力 +40，心态 +8！"
    elseif current_money >= 25 then
        local new_money = current_money - 25
        local new_energy = math.min(100, current_energy + 35)
        return true, new_energy, new_money, "☕ 楼下便利店自费 $25 购买特浓冰美式！瞬间补充 +35 精力！"
    else
        return false, current_energy, current_money, "❌ 备战存量不足且资金不足以购买冰美式。"
    end
end

-- 零体力消耗 · 战术理论研讨 (低谷期持续游玩闭环)
function MatchSim:review_tactical_theory(mechanics, mental)
    local new_mechanics = math.min(100, mechanics + 1)
    local new_mental = math.min(100, mental + 4)
    local log = "📖 零体力消耗 · 战术理论研讨：研读世界赛 14.20 兵线慢推与四包二越塔教案 (+1 微操, +4 心态)"
    return new_mechanics, new_mental, log
end

-- 触发晋级赛状态机 (BO3 / BO5)
function MatchSim:trigger_promo_series(target_tier)
    local max_games = (target_tier == "Master" or target_tier == "Grandmaster") and 5 or 3
    local required_wins = (max_games == 5) and 3 or 2

    self.promo_series = {
        target_tier = target_tier,
        wins = 0,
        losses = 0,
        required_wins = required_wins,
        max_games = max_games,
        history = {},
        active = true
    }
    return self.promo_series
end

-- 推进晋级赛胜负局
function MatchSim:advance_promo(is_win)
    if not self.promo_series or not self.promo_series.active then return nil end

    if is_win then
        self.promo_series.wins = self.promo_series.wins + 1
        table.insert(self.promo_series.history, "WIN")
    else
        self.promo_series.losses = self.promo_series.losses + 1
        table.insert(self.promo_series.history, "LOSS")
    end

    if self.promo_series.wins >= self.promo_series.required_wins then
        local target = self.promo_series.target_tier
        self.promo_series.active = false
        self.scout_attention = math.min(100, self.scout_attention + 20)
        return "SUCCESS", target, string.format("🏆 晋级成功！荣登【%s】！俱乐部球探关注度飙升至 %d%%！", target, self.scout_attention)
    elseif self.promo_series.losses > (self.promo_series.max_games - self.promo_series.required_wins) then
        self.promo_series.active = false
        return "FAILED", nil, "💀 晋级赛遗憾惜败。积分回落，调整心态卷土重来！"
    else
        return "IN_PROGRESS", nil, string.format("⚔️ 晋级赛进行中: %d胜 %d负 (总局数 BO%d)", self.promo_series.wins, self.promo_series.losses, self.promo_series.max_games)
    end
end

-- 职业 5v5 舞台对战模拟推演
function MatchSim.run(blue_picks, red_picks, win_prob)
    win_prob = win_prob or 50
    local won = (math.random(1, 100) <= win_prob)
    local logs = {}
    
    local blue_mid = (blue_picks and blue_picks[3] and blue_picks[3].name) or "主力中单"
    local red_mid = (red_picks and red_picks[3] and red_picks[3].name) or "敌方中单"
    local blue_adc = (blue_picks and blue_picks[4] and blue_picks[4].name) or "主力射手"

    table.insert(logs, "⚔️【03:15 一血诞生】中路爆发二级极限对拼！" .. blue_mid .. " 闪现挂引燃极限单杀 " .. red_mid .. "！")
    table.insert(logs, "🐉【12:30 小龙团战】我方野辅完美开团控住三人！打出 0 换 2 并顺利控下第二条炼金科技亚龙！")
    table.insert(logs, "⚡【21:45 大龙逼团】" .. blue_adc .. " 侧翼输出拉满，狂暴三杀破局！我方大龙逼退对手！")

    if won then
        table.insert(logs, "🏆【28:10 决胜高地】带着纳什男爵 Buff 势如破竹摧毁两路高地，一波推平敌方主堡水晶！比赛胜利！")
    else
        table.insert(logs, "💔【29:30 遗憾落败】敌方在后期防守反击中偷下远古巨龙，高地团战惜败告负。")
    end

    return won, logs
end

return MatchSim
