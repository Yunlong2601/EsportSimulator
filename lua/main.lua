--[[
    ESPORTS LEGACY: ROAD TO WORLDS
    Complete Master Entry Point in Pure Lua 5.1+ / LuaJIT
    A 3-Phase Esports Career Simulator:
      Phase 1: Amateur Solo Queue Life Sim (Reach 1,000 LP Challenger to unlock Pro Stage)
      Phase 2: Pro Stage Team Captain (Lead Pick/Ban & accumulate $1,000,000 in tournament prizes)
      Phase 3: Retire from Playing & Buy an Esports Organization (Lead Org to Worlds Summoner's Cup)
--]]

local Champions = require("champions")
local Gear = require("gear")
local Events = require("events")
local Draft = require("draft")
local Dynasty = require("dynasty")
local MatchSim = require("match_sim")
local LoginStreak = require("login_streak")
local EsportsEventEngine = require("esports_event_engine")
local GlobalPowerRankings = require("global_power_rankings")
local PostMatchMVP = require("post_match_mvp")
local CommunityRelations = require("community_relations")

local EsportsGame = {
    phase = 1,
    running = true,
    unlocked_phases = { [1] = true, [2] = false, [3] = false },
    player = {
        lp = 340,
        rank = "Gold",
        mechanics = 55,
        mental = 70,
        energy = 85,
        focus = 90,              -- 0 - 100 专注度 (高强度活动消耗，休整/咖啡恢复)
        energy_drinks = 2,       -- 备用战术冰美式/红牛
        money = 180,
        fame = 15,
        streak = 2,
        gear = {},
        promo_series = nil,
        confidence = PostMatchMVP.newDefaultPlayerConfidence(),
        mvp_stats = { total_mvp = 0, solo_mvp = 0, stage_mvp = 0 }
    },
    login_streak = LoginStreak.new(),
    daily_challenges = {
        { id = "win3", title = "Grind Master", target = 3, current = 0, reward_lp = 45, reward_cash = 60, claimed = false },
        { id = "vod2", title = "VOD Analyst",  target = 2, current = 0, reward_lp = 25, reward_cash = 30, claimed = false },
        { id = "stream", title = "Bootcamp Stream", target = 1, current = 0, reward_lp = 20, reward_cash = 80, claimed = false }
    },
    draft = Draft.new(),
    dynasty = Dynasty.new(),
    esports_engine = EsportsEventEngine.new(),
    power_rankings = GlobalPowerRankings.new(),
    mvp_engine = PostMatchMVP.new(),
    community_engine = CommunityRelations.new(),
    trophies = {
        challenger = false,
        regional_champ = false,
        worlds_cup = false,
        mvp_ring = false
    }
}

EsportsGame.PROMO_CONFIG = {
    ["Iron"]        = { next = "Bronze",      lp = 100,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Bronze"]      = { next = "Silver",      lp = 200,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Silver"]      = { next = "Gold",        lp = 300,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Gold"]        = { next = "Platinum",    lp = 400,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Platinum"]    = { next = "Emerald",     lp = 550,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Emerald"]     = { next = "Diamond",     lp = 700,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Diamond"]     = { next = "Master",      lp = 850,  format = "BO5", req_wins = 3, req_consecutive = 3 },
    ["Master"]      = { next = "Grandmaster", lp = 950,  format = "BO5", req_wins = 3, req_consecutive = 3 },
    ["Grandmaster"] = { next = "Challenger",  lp = 1000, format = "BO5", req_wins = 3, req_consecutive = 3 }
}

function EsportsGame:calculateRank()
    local lp = self.player.lp
    if lp >= 1000 then return "Challenger"
    elseif lp >= 950 then return "Grandmaster"
    elseif lp >= 850 then return "Master"
    elseif lp >= 700 then return "Diamond"
    elseif lp >= 550 then return "Emerald"
    elseif lp >= 400 then return "Platinum"
    elseif lp >= 300 then return "Gold"
    elseif lp >= 200 then return "Silver"
    elseif lp >= 100 then return "Bronze"
    else return "Iron" end
end

function EsportsGame:triggerPromoSeries(target_tier, override_format)
    local cur_tier = self.player.rank
    local conf = EsportsGame.PROMO_CONFIG[cur_tier]
    local target = target_tier or (conf and conf.next) or "Platinum"
    local is_apex = (target == "Master" or target == "Grandmaster" or target == "Challenger")
    local format = override_format or (conf and conf.format) or (is_apex and "BO5" or "BO3")
    local max_games = (format == "BO5") and 5 or 3
    local req_wins = (format == "BO5") and 3 or 2

    self.player.promo_series = {
        target_tier = target,
        current_tier = cur_tier,
        wins = 0,
        losses = 0,
        consecutive_wins = 0,
        required_wins = req_wins,
        required_consecutive_wins = req_wins,
        max_games = max_games,
        history = {},
        active = true,
        format = format
    }
    print(string.format("\n⚔️ 【%s 生死晋级赛】打响！赛制: %s (需达成 %d 胜 / 连胜绝杀)！", target, format, req_wins))
    return true
end

function EsportsGame:advancePromoSeries(is_win)
    local promo = self.player.promo_series
    if not promo or not promo.active then return false end

    table.insert(promo.history, is_win and "WIN" or "LOSS")
    if is_win then
        promo.wins = promo.wins + 1
        promo.consecutive_wins = promo.consecutive_wins + 1
    else
        promo.losses = promo.losses + 1
        promo.consecutive_wins = 0
    end

    local score_str = string.format("%d-%d", promo.wins, promo.losses)
    local is_won = (promo.consecutive_wins >= promo.required_consecutive_wins) or (promo.wins >= promo.required_wins)
    local is_lost = (not is_won) and (promo.losses > promo.max_games - promo.required_wins or #promo.history >= promo.max_games)

    if is_won then
        print(string.format("\n🏆 晋级成功！比分【%s】斩获 %s 晋级赛！荣登【%s】！", score_str, promo.format, promo.target_tier))
        self.player.rank = promo.target_tier
        self.player.promo_series = nil
        self.player.lp = self.player.lp + 25
        self.player.fame = math.min(100, self.player.fame + 15)
        return true, score_str
    elseif is_lost then
        print(string.format("\n💀 晋级赛惜败 (终局比分【%s】)。积分回退 20 LP，吸取经验调整心态！", score_str))
        self.player.promo_series = nil
        self.player.lp = math.max(0, self.player.lp - 20)
        return false, score_str
    else
        print(string.format("⚔️ 晋级赛第 %d 局结束 (%s)！当前比分【%s】(连胜: %d/%d)",
            #promo.history, is_win and "胜" or "负", score_str, promo.consecutive_wins, promo.required_consecutive_wins))
        return true, score_str
    end
end

function EsportsGame:addLP(delta)
    local promo = self.player.promo_series
    if promo and promo.active then
        return
    end

    local cur_tier = self.player.rank
    local conf = EsportsGame.PROMO_CONFIG[cur_tier]
    local new_lp = math.max(0, self.player.lp + delta)

    if conf and cur_tier ~= "Challenger" and new_lp >= conf.lp then
        self.player.lp = conf.lp
        self:triggerPromoSeries(conf.next, conf.format)
    else
        self.player.lp = new_lp
        local new_rank = self:calculateRank()
        if new_rank ~= self.player.rank then
            print(string.format("\n🏆 RANK PROMOTION: You are now %s (%d LP)!", new_rank, self.player.lp))
            self.player.rank = new_rank
        end
    end

    if self.player.lp >= 1000 and not self.trophies.challenger then
        self.trophies.challenger = true
        self.unlocked_phases[2] = true
        print("\n============================================================")
        print("🌟 MILESTONE REACHED: 1,000 LP CHALLENGER (HIGHEST RANK)!")
        print("Scouts from Pro Academy have signed you as Starting Team Captain!")
        print("PHASE 2 (THE STAGE: PICK & BAN DRAFT) IS NOW UNLOCKED!")
        print("============================================================\n")
    end
end

function EsportsGame:checkDaily(type_id)
    for _, ch in ipairs(self.daily_challenges) do
        if ch.id == type_id and not ch.claimed then
            ch.current = math.min(ch.target, ch.current + 1)
            if ch.current >= ch.target then
                ch.claimed = true
                self:addLP(ch.reward_lp)
                self.player.money = self.player.money + ch.reward_cash
                print(string.format("\n🎁 DAILY CHALLENGE COMPLETED: [%s]! Claimed +%d LP & +$%d!", ch.title, ch.reward_lp, ch.reward_cash))
            end
        end
    end
end

function EsportsGame:claimLoginStreak()
    local ok, msg, bonus_lp, bonus_cash, skin = self.login_streak:claim(self.player)
    print("\n" .. msg)
    if ok then
        self:addLP(bonus_lp)
        self.player.money = self.player.money + bonus_cash
    end
end

function EsportsGame:viewSkinsWardrobe()
    print("\n=== PRO-GEAR SKINS WARDROBE ===")
    local active_m, active_mt, active_name = self.login_streak:getActiveBuffs()
    print(string.format("Currently Equipped: [%s] (+%d Mechanics, +%d Mental)", active_name, active_m, active_mt))
    
    local list = {}
    for id, skin in pairs(self.login_streak.unlocked_skins) do
        table.insert(list, skin)
    end

    if #list == 0 then
        print("No Pro-Gear skins unlocked yet. Keep your daily login streak active! (Day 3: Neon Keyboard, Day 5: T1 Jersey, Day 7: Golden Mouse)")
        return
    end

    for i, s in ipairs(list) do
        print(string.format("%d. %s [%s] (%s) -> +%d Mech, +%d Mental", i, s.icon, s.name, s.rarity, s.mechanics_bonus, s.mental_bonus))
    end
    io.write("Select skin to equip (0 to cancel): ")
    local sel = tonumber(io.read()) or 0
    if sel > 0 and list[sel] then
        local ok, equip_msg = self.login_streak:equipSkin(list[sel].id, self.player)
        print("\n" .. equip_msg)
    end
end

-- PHASE 1 ACTIONS
function EsportsGame:playRanked()
    if self.player.focus < 15 or self.player.energy < 20 then
        print("\n[-] ⚠️ 专注力涣散与严重疲劳（专注度 < 15%）！操作迟钝极易频繁掉分，请先进行【深度休整 (Rest)】或饮用【特调咖啡 (Coffee)】！")
        return
    end

    self.player.energy = math.max(0, self.player.energy - 20)
    self.player.focus = math.max(0, self.player.focus - 20)
    local mech_buff, ment_buff = self.login_streak:getActiveBuffs()

    if math.random(1, 100) > 40 then
        local ev = Events.getRandom()
        print("\n[ENCOUNTER]: " .. ev.title)
        print(ev.scenario)
        print("1. " .. ev.options[1].label .. " (" .. ev.options[1].risk .. " Risk)")
        if ev.options[2] then print("2. " .. ev.options[2].label .. " (" .. ev.options[2].risk .. " Risk)") end

        io.write("Choose option: ")
        local opt = tonumber(io.read()) or 1
        local choice = ev.options[opt] or ev.options[1]
        local outcome = choice.execute(self.player)

        print("\n" .. outcome.log)
        self:addLP(outcome.lp)
        if outcome.success then self:checkDaily("win3") end
        self.player.mechanics = math.min(100, math.max(10, self.player.mechanics + outcome.mechanics))
        self.player.mental = math.min(100, math.max(5, self.player.mental + outcome.mental))
        self.player.money = self.player.money + outcome.money
    else
        local conf_bonus = self.mvp_engine:getConfidenceBonus(self.player)
        local eff_mech = self.player.mechanics + mech_buff + conf_bonus.bonus_mech
        local eff_ment = self.player.mental + ment_buff + conf_bonus.bonus_mental
        local focus_bonus = self.player.focus >= 70 and 8 or (self.player.focus < 35 and -15 or 0)
        local win_prob = 45 + (eff_mech * 0.25) + (eff_ment * 0.15) + focus_bonus + conf_bonus.bonus_win
        local roll = math.random(1, 100)
        local is_win = (roll <= win_prob)

        if is_win then
            self.player.streak = self.player.streak + 1
            local gain = math.random(22, 28) + (conf_bonus.bonus_lp or 0)
            self:addLP(gain)
            self:checkDaily("win3")
            print(string.format("\n[VICTORY] 操刀本命英雄斩获胜利！+%d LP (连胜: %d). 专注剩余: %d%%", gain, self.player.streak, self.player.focus))

            -- 赛后 MVP 荣誉结算
            local mvp_card = self.mvp_engine:evaluateSoloQueue(self.player, "主力核心", true)
            if mvp_card.is_mvp then
                print(string.format("👑【赛后 MVP 斩获】官方评分 ★ %.1f 分 ★！%s", mvp_card.score, mvp_card.headline))
                print(string.format("   🎙️ 解说金句: %s", mvp_card.caster_quote))
                if mvp_card.buff_desc then print("   " .. mvp_card.buff_desc) end
            end
        else
            self.player.streak = 0
            local loss = math.random(16, 21)
            self:addLP(-loss)
            print(string.format("\n[DEFEAT] 遗憾失利. -%d LP. 消耗精力-20, 专注度-20%% (剩余专注: %d%%)", loss, self.player.focus))

            -- 赛后 SVP 结算
            local mvp_card = self.mvp_engine:evaluateSoloQueue(self.player, "主力核心", false)
            if mvp_card.is_svp then
                print(string.format("💔【赛后 SVP 孤勇战神】官方评分 ★ %.1f 分 ★！%s", mvp_card.score, mvp_card.headline))
                print(string.format("   🎙️ 解说点评: %s", mvp_card.caster_quote))
            end
        end
    end
end

function EsportsGame:watchReplays()
    if self.player.energy < 15 or self.player.focus < 15 then
        print("[-] ⚠️ 精力或专注力不足，无法深度解析录像细节。请先【休整】或饮用【咖啡】！")
        return
    end
    self.player.energy = self.player.energy - 15
    self.player.focus = math.max(0, self.player.focus - 10)
    self.player.mechanics = math.min(100, self.player.mechanics + 2)
    self.player.mental = math.min(100, self.player.mental + 3)
    self:checkDaily("vod2")
    print(string.format("\n[+] 逐帧研读世界赛决赛复盘。(微操+2, 心态+3, 专注-10%%, 剩余专注: %d%%)", self.player.focus))
end

function EsportsGame:streamTwitch()
    if self.player.energy < 20 or self.player.focus < 20 then
        print("[-] ⚠️ 双眼布满血丝，极度疲劳！高强度直播容易红温破防，请先【休整】或饮用【咖啡】！")
        return
    end
    self.player.energy = self.player.energy - 20
    self.player.focus = math.max(0, self.player.focus - 25)
    local cash = math.random(75, 160) + math.floor(self.player.fame * 2)
    self.player.money = self.player.money + cash
    self.player.fame = math.min(100, self.player.fame + 3)
    self:checkDaily("stream")
    print(string.format("\n[+] 高能直播集训圆满完成！打赏收入 +$%d, 知名度: %d (专注消耗-25%%, 剩余专注: %d%%)", cash, self.player.fame, self.player.focus))
end

function EsportsGame:rest()
    self.player.energy = math.min(100, self.player.energy + 45)
    self.player.focus = math.min(100, self.player.focus + 50)
    self.player.mental = math.min(100, self.player.mental + 18)
    print(string.format("\n💤 【深度休整 (Rest)】充足睡眠与健康饮食！精力+45, 专注度+50%%, 心态+18！(当前专注: %d%%)", self.player.focus))
end

function EsportsGame:drinkCoffee()
    if self.player.energy_drinks > 0 then
        self.player.energy_drinks = self.player.energy_drinks - 1
        self.player.focus = math.min(100, self.player.focus + 50)
        self.player.energy = math.min(100, self.player.energy + 25)
        self.player.mental = math.min(100, self.player.mental + 8)
        print(string.format("\n☕ 【特调咖啡 (Coffee)】饮用背包备用冰美式（剩余 %d 罐）！高能咖啡因注入，专注度+50%%，精力+25%%！(当前专注: %d%%)", self.player.energy_drinks, self.player.focus))
        return
    end

    if self.player.money < 20 then
        print("\n[-] ❌ 资金不足以购买特调咖啡（需 $20）。请选择免费的【深度休整 (Rest)】睡眠恢复！")
        return
    end

    self.player.money = self.player.money - 20
    self.player.focus = math.min(100, self.player.focus + 50)
    self.player.energy = math.min(100, self.player.energy + 25)
    self.player.mental = math.min(100, self.player.mental + 6)
    print(string.format("\n☕ 【特调咖啡 (Coffee)】花费 $20 购买特浓双份冰美式！瞬间爆发，专注度+50%%，精力+25%%！(当前专注: %d%%)", self.player.focus))
end

function EsportsGame:quickShop()
    local catalog = {
        { id = "energy_shot",      name = "高能电竞能量弹", cost = 15, focus = 40, energy = 20, mental = 5,  desc = "速效浓缩牛磺酸，秒回疲劳" },
        { id = "premium_coffee",   name = "特调精品现磨冰美式", cost = 30, focus = 70, energy = 35, mental = 10, desc = "冷萃双倍浓缩，驱散漫长直播倦意" },
        { id = "cyber_gum",        name = "超频提神咀嚼薄荷糖", cost = 8,  focus = 25, energy = 12, mental = 4,  desc = "薄荷强劲爆破，经济实惠随取随用" },
        { id = "pro_care_package", name = "职业战备全能补给箱", cost = 65, focus = 100, energy = 60, mental = 20, desc = "顶级豪门理疗营养包，疲劳条全满并重置巅峰！" }
    }
    print("\n================ 🛒 战备应急便利店 (Quick Shop) ================")
    print(string.format("【生涯资金】$%d | 【当前专注度】%d%% | 【背包备用咖啡】%d 罐", self.player.money, self.player.focus, self.player.energy_drinks or 0))
    for i, it in ipairs(catalog) do
        print(string.format("%d. %s ($%d) -> 专注+%d%%, 精力+%d%%, 心态+%d%% (%s)",
            i, it.name, it.cost, it.focus, it.energy, it.mental, it.desc))
    end
    io.write("请选择购买项 (0 取消): ")
    local sel = tonumber(io.read()) or 0
    if sel > 0 and catalog[sel] then
        local it = catalog[sel]
        if self.player.money < it.cost then
            print(string.format("[-] 资金不足！需要 $%d，当前仅有 $%d", it.cost, self.player.money))
        else
            self.player.money = self.player.money - it.cost
            self.player.focus = math.min(100, self.player.focus + it.focus)
            self.player.energy = math.min(100, self.player.energy + it.energy)
            self.player.mental = math.min(100, self.player.mental + it.mental)
            print(string.format("\n[+] 🛒 饮用【%s】！专注度+%d%%，精力+%d%%，疲劳瞬间解除！(当前专注: %d%%)",
                it.name, it.focus, it.energy, self.player.focus))
        end
    end
end

-- PHASE 2: TEAM CAPTAIN ARENA STAGE (EARNING TOWARDS $1,000,000)
function EsportsGame:playStageMatch()
    if not self.unlocked_phases[2] then
        print("\n🔒 LOCKED: Reach 1,000 LP (Challenger) in Solo Queue first to get scouted as Team Captain!")
        return
    end

    print("\n=== ARENA STAGE: 5v5 PICK & BAN DRAFT (CAPTAIN LEADER) ===")
    Draft.autoDraft(self.draft)
    local blue_pct, red_pct = Draft.calculateScores(self.draft, self.esports_engine)

    print(string.format("[DRAFT RATINGS] Blue Team: %d%% | Red Team: %d%%", blue_pct, red_pct))
    local won, logs = MatchSim.run(self.draft.blue_picks, self.draft.red_picks, blue_pct)
    for _, l in ipairs(logs) do print(l) end

    if won then
        local prize = 40000
        local series_bonus = 120000
        local total_earned = prize + series_bonus
        self.player.money = self.player.money + total_earned
        print(string.format("\n💰 STADIUM PURSE EARNED: +$%d! Current Career Savings: $%s / $1,000,000",
            total_earned, string.format("%d", self.player.money)))
        self.trophies.regional_champ = true

        -- 结算版本 S 级 Meta 临时排位 LP 收益提振
        local meta_bonus_lp, s_tier_names = Draft.evaluateMetaLpBonus(self.draft, self.esports_engine)
        if meta_bonus_lp > 0 then
            self:addLP(meta_bonus_lp)
            print(string.format("🔥【版本 Meta 红利结算】阵容选用 %s 等 %d 位 S 级核心！额外斩获 +%d LP 职业排位分！",
                table.concat(s_tier_names, "、"), #s_tier_names, meta_bonus_lp))
        end

        -- 职业赛后 MVP 荣誉评定
        local stage_mvp = self.mvp_engine:evaluateStageMatch(self.player, self.draft.blue_picks, self.draft.red_picks, won)
        if stage_mvp.is_mvp then
            print(string.format("👑【ARENA STAGE 全场 MVP】官方评分 ★ %.1f 分 ★！%s", stage_mvp.score, stage_mvp.headline))
            print(string.format("   🎙️ 官方解说: %s", stage_mvp.caster_quote))
            if stage_mvp.buff_desc then print("   " .. stage_mvp.buff_desc) end
        end

        if self.player.money >= 1000000 and not self.unlocked_phases[3] then
            print("\n============================================================")
            print("👑 $1,000,000 CAREER EARNINGS ACHIEVED!")
            print("You can now RETIRE as active player and BUY your own Esports Org!")
            print("============================================================\n")
        end
    else
        self.mvp_engine:evaluateStageMatch(self.player, self.draft.blue_picks, self.draft.red_picks, won)
    end
end

function EsportsGame:viewActiveMetaInsight()
    Draft.renderMetaInsight(self.draft, self.esports_engine)
end

function EsportsGame:viewGlobalPowerRankings()
    self.power_rankings:renderCLI()
end

function EsportsGame:viewTransferWindow()
    if self.dynasty and self.dynasty.transfer_window then
        if not self.dynasty.transfer_window.is_open then
            self.dynasty:openTransferWindow("夏季赛收官转会期", 2026)
        end
        self.dynasty:renderTransferWindow()
    else
        print("[-] 战队王朝引擎尚未初始化。")
    end
end

function EsportsGame:viewPostMatchMVP()
    if self.player.confidence and self.player.confidence.last_mvp_card then
        self.mvp_engine:renderMVPBanner(self.player.confidence.last_mvp_card, self.player)
    else
        print("\n================ 🏆 POST-MATCH MVP 赛后荣誉殿堂 ================")
        print("暂无近期比赛 MVP 记录，请先进行单排或职业舞台对战！")
        print("================================================================\n")
    end
end

function EsportsGame:viewConfidenceTrait()
    local conf = self.mvp_engine:getConfidenceBonus(self.player)
    print("\n================ 🔥 选手特质: 自信心 (CONFIDENCE TRAIT) ================")
    print(string.format("【当前心境层级】%s %s | 【基础自信度】%d / 100",
        conf.badge, conf.name, self.player.confidence and self.player.confidence.score or 50))
    print(string.format("【特质有效期】剩余有效比赛: %d 场 | 【累计斩获 MVP】%d 次 (单排 %d / 职业 %d)",
        conf.matches_left,
        self.player.mvp_stats and self.player.mvp_stats.total_mvp or 0,
        self.player.mvp_stats and self.player.mvp_stats.solo_mvp or 0,
        self.player.mvp_stats and self.player.mvp_stats.stage_mvp or 0))
    print("------------------------------------------------------------------------")
    print(string.format("【实战属性增益】微操加成: +%d | 心态加成: +%d | 胜率倍率: +%d%% | 胜场额外: +%d LP",
        conf.bonus_mech, conf.bonus_mental, conf.bonus_win, conf.bonus_lp))
    print("【特质效果详述】" .. conf.desc)
    print("------------------------------------------------------------------------")
    print("💡 提示: 每次在天梯单排或职业赛场斩获 MVP，自信心将升级至下一层并重置 3 场有效期！")
    print("========================================================================\n")
end

function EsportsGame:viewCommunityRelations()
    local target = (self.phase == 3 and self.dynasty) or self.player
    local budget_source = (self.phase == 3) and "DYNASTY" or "PLAYER"
    self.community_engine:renderCLI()
    print("请输入要发起的公关企划编号 (1-9，回车跳过): ")
    local c = io.read()
    local idx = tonumber(c)
    if idx and CommunityRelations.CAMPAIGNS[idx] then
        local camp = CommunityRelations.CAMPAIGNS[idx]
        local ok, msg = self.community_engine:executeCampaign(camp.id, target, budget_source)
        print("\n" .. msg)
    end
end

function EsportsGame:viewMatchDanmaku()
    print("\n================ 📺 LIVE MATCH DANMAKU 赛事直播弹幕模拟 ================")
    print("【正在转播】官方最高级别赛事总决赛 · 实时全网热度 9800万")
    print("------------------------------------------------------------------------")
    for i = 1, 6 do
        local kind = (i == 2 and "kill") or (i == 4 and "baron") or (i == 6 and "ace") or "general"
        print(string.format("  [%s] 💬 观众热评: %s", os.date("%H:%M:%S"), self.community_engine:generateRandomDanmaku(kind)))
    end
    print("------------------------------------------------------------------------")
    io.write("发射你的专属赛事应援弹幕 (输入文本回车，留空跳过): ")
    local txt = io.read()
    if txt and #txt > 0 then
        local ok, msg = self.community_engine:sendCustomDanmaku(txt, "宿命先锋")
        print("\n" .. msg)
    end
    print("========================================================================\n")
end

-- RETIREMENT & BUYOUT
function EsportsGame:retireAndBuyOrg()
    if self.player.money < 1000000 then
        print(string.format("\n🔒 LOCKED: You have $%d. Need $1,000,000 to buy an Esports Franchise!", self.player.money))
        return
    end

    self.player.money = self.player.money - 1000000
    self.unlocked_phases[3] = true
    self.phase = 3
    print("\n============================================================")
    print("🎉 RETIREMENT CEREMONY: JERSEY HUNG IN THE RAFTERS!")
    print("You paid $1,000,000 and acquired an official Esports Franchise!")
    print("You are now Team Owner and General Manager. Build your Dynasty!")
    print("============================================================\n")
end

-- PHASE 3: WORLDS GRAND FINALS BEST OF 5
function EsportsGame:playWorldsFinals()
    if not self.unlocked_phases[3] then
        print("\n🔒 LOCKED: Accumulate $1,000,000 in Phase 2 to retire and buy your esports org first!")
        return
    end

    print("\n============================================================")
    print("🏆 THE WORLD CHAMPIONSHIP GRAND FINALS (BEST-OF-5)")
    print("            YOUR DYNASTY  vs  T1 DYNASTY                    ")
    print("============================================================")

    local power = self.dynasty:getTeamPower()
    local win_prob = 50 + ((power - 97) * 4)
    local your_wins = 0
    local opp_wins = 0

    for game = 1, 5 do
        if math.random(1, 100) <= win_prob then
            your_wins = your_wins + 1
            print(string.format("Game %d: VICTORY! (Series: %d - %d)", game, your_wins, opp_wins))
        else
            opp_wins = opp_wins + 1
            print(string.format("Game %d: DEFEAT. (Series: %d - %d)", game, your_wins, opp_wins))
        end

        if your_wins == 3 then
            print("\n👑 WORLD CHAMPIONS! The Summoner's Cup has been hoisted!")
            self.trophies.worlds_cup = true
            self.trophies.mvp_ring = true
            break
        elseif opp_wins == 3 then
            print("\n💔 Defeated in Game 5. Train hard for next Worlds!")
            break
        end
    end
end

-- MAIN CLI MENU
function EsportsGame:run()
    math.randomseed(os.time())
    print("============================================================")
    print("         ESPORTS LEGACY: ROAD TO WORLDS (LUA)               ")
    print("  Solo Q -> 1k LP Challenger (Team Captain) -> $1M Buyout   ")
    print("============================================================")

    while self.running do
        local p2_status = self.unlocked_phases[2] and "UNLOCKED" or "LOCKED (Need 1k LP)"
        local p3_status = self.unlocked_phases[3] and "UNLOCKED" or "LOCKED (Need $1M)"
        local _, _, skin_name = self.login_streak:getActiveBuffs()
        local streak_status = self.login_streak.claimed_today and "CLAIMED" or "READY!"

        print(string.format("\n[STATUS] Phase %d | %s (%d LP) | Savings: $%s | Stage: %s | Org: %s",
            self.phase, self.player.rank, self.player.lp, string.format("%d", self.player.money), p2_status, p3_status))
        print(string.format("[STREAK] Day %d/7 (%s) | Equipped Gear: [%s]",
            self.login_streak.current_streak, streak_status, skin_name))
        print("1. Play Ranked Match (Solo Q)")
        print("2. Study Pro VODs (+Mech)")
        print("3. Twitch Stream (+Money)")
        print("4. Sleep & Rest (+Energy)")
        print("5. Stage: Pick & Ban Match (Team Captain)")
        print("6. Retire & Buy Esports Org ($1,000,000)")
        print("7. Dynasty: Worlds Finals Bo5 (Org Owner)")
        print("8. Claim Daily Login Streak (Bonus LP + Pro-Gear Skins)")
        print("9. Pro-Gear Skins Wardrobe")
        print("10. Active Meta Insight (版本战术雷达 & S级英雄LP提振)")
        print("11. Global Pro Power Rankings (全球战队TOP20战力榜 & 战术刺探)")
        print("12. Off-Season Transfer Window (夏季赛收官转会窗 & 自由人竞价互换)")
        print("13. Post-Match MVP (赛后 MVP 荣誉结算与高光战报)")
        print("14. Confidence Trait (选手特质：狂傲自信心状态详情)")
        print("15. Community Relations (社区公关运营 & 粉丝收益倍率)")
        print("16. Live Match Danmaku (赛事直播弹幕模拟 & 互动应援)")
        print("0. Exit")
        io.write("Select (0-16): ")

        local c = io.read()
        if c == "1" then self:playRanked()
        elseif c == "2" then self:watchReplays()
        elseif c == "3" then self:streamTwitch()
        elseif c == "4" then self:rest()
        elseif c == "5" then self:playStageMatch()
        elseif c == "6" then self:retireAndBuyOrg()
        elseif c == "7" then self:playWorldsFinals()
        elseif c == "8" then self:claimLoginStreak()
        elseif c == "9" then self:viewSkinsWardrobe()
        elseif c == "10" then self:viewActiveMetaInsight()
        elseif c == "11" then self:viewGlobalPowerRankings()
        elseif c == "12" then self:viewTransferWindow()
        elseif c == "13" then self:viewPostMatchMVP()
        elseif c == "14" then self:viewConfidenceTrait()
        elseif c == "15" then self:viewCommunityRelations()
        elseif c == "16" then self:viewMatchDanmaku()
        elseif c == "0" then self.running = false
        else print("Invalid choice.") end
    end
end

if arg and arg[0] then EsportsGame:run() end
return EsportsGame
