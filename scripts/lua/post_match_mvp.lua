--[[
    ============================================================================
    TAPTAP MAKE: POST-MATCH MVP & CONFIDENCE TRAIT ENGINE
    (赛后 MVP 荣誉评定系统与狂傲自信心特质增益)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 单排天梯 (Solo Queue) 与 职业舞台 (Stage Match) 赛后数据推演与综合评分评定
      2. 赛后 MVP (最有价值选手) 与 SVP (败方战神) 资格判定与高光记录
      3. 真实电竞解说评语、赛事金句与全网弹幕风味文本 (Flavor Text)
      4. 选手「自信心 (Confidence)」特质临时强化状态机:
         - 层级演进: Lv.1 渐入佳境 -> Lv.2 气势如虹 -> Lv.3 天神霸体 (巅峰自信)
         - 属性加成: 临时微操爆发 (+3~10)、大心脏心态 (+5~12)、胜场率 (+5~14%)、额外 LP 提振
         - 衰减与延展机制: 维持 2~3 场比赛有效性，连续斩获 MVP 自动续期并叠加层级
--]]

local PostMatchMVP = {}
PostMatchMVP.__index = PostMatchMVP

-- 自信心特质层级定义
PostMatchMVP.CONFIDENCE_TIERS = {
    [0] = {
        level = 0,
        name = "平稳从容 (Calm)",
        badge = "⚪",
        bonus_mech = 0,
        bonus_mental = 0,
        bonus_win = 0,
        bonus_lp = 0,
        desc = "心态波澜不惊，常规发挥水平。"
    },
    [1] = {
        level = 1,
        name = "渐入佳境 (Warming Up)",
        badge = "🟢",
        bonus_mech = 3,
        bonus_mental = 5,
        bonus_win = 5,
        bonus_lp = 4,
        desc = "操作手感温热，对线单杀嗅觉显著增强 (+3微操, +5心态, +5%胜率)。"
    },
    [2] = {
        level = 2,
        name = "气势如虹 (High Morale)",
        badge = "🟡",
        bonus_mech = 6,
        bonus_mental = 8,
        bonus_win = 9,
        bonus_lp = 8,
        desc = "自信心爆棚，敢打敢拼！绝境团战敢于闪现开团 (+6微操, +8心态, +9%胜率, +8LP)。"
    },
    [3] = {
        level = 3,
        name = "天神霸体 · 巅峰自信 (Godlike Confidence)",
        badge = "👑",
        bonus_mech = 10,
        bonus_mental = 12,
        bonus_win = 14,
        bonus_lp = 12,
        desc = "狂傲心流合一！全场焦点神级主宰，免疫一切心态受挫负面 (+10微操, +12心态, +14%胜率, +12LP)！"
    }
}

-- 丰富的电竞解说语录与全网弹幕高光文案库
PostMatchMVP.FLAVOR_QUOTES = {
    carry_god = {
        title = "天神下凡 · 狂暴收割",
        quote = "米勒解说狂呼：“这就是通天代！一人抬着四个人往前走！一夫当关，万夫莫开！”",
        danmaku = "【弹幕疯狂刷屏】：“卧槽！这走位直接给对面看傻了！”、“开香槟！建议直接抬进国家队！”、“7777777”"
    },
    clutch_king = {
        title = "大心脏绝杀 · 孤勇逆境",
        quote = "娃娃惊呼：“丝血反杀！极限水银秒解大招！你永远可以相信绝境中的大心脏！”",
        danmaku = "【弹幕疯狂刷屏】：“大心脏拉满！”、“心脏骤停！这敢反打也是没谁了！”、“太燃了兄弟！”"
    },
    lane_dominator = {
        title = "线霸统治 · 窒息压制",
        quote = "管泽元感叹：“对线15分钟压了70刀单吃一血塔，对位经济领先3,500块，这根本没法玩了！”",
        danmaku = "【弹幕疯狂刷屏】：“对面中单已经红温了”、“折磨大师”、“代，就硬代！”"
    },
    macro_mastermind = {
        title = "战术大脑 · 掌控全局",
        quote = "长毛点评：“全图游走无处不在，参团率高达 100%！教科书级别的野区指挥艺术！”",
        danmaku = "【弹幕疯狂刷屏】：“雷达级意识”、“视野艺术大师”、“这大脑领先两个段位”"
    },
    svp_tragic_hero = {
        title = "孤勇战神 · 虽败犹荣 (SVP)",
        quote = "解说叹息：“一个人竭尽全力打出 45% 输出占比，可惜队友连续断节奏，真正的无力回天局！”",
        danmaku = "【弹幕疯狂刷屏】：“尽力了兄弟”、“心疼一秒通天代”、“队友在犯罪，非战之罪！”"
    }
}

function PostMatchMVP.new()
    local self = setmetatable({}, PostMatchMVP)
    return self
end

-- 初始化玩家的自信心特质状态
function PostMatchMVP.newDefaultPlayerConfidence()
    return {
        level = 0,
        score = 50,          -- 0 - 100 基础自信心数值
        matches_left = 0,    -- 增益剩余有效局数
        current_streak = 0,  -- 连续荣获 MVP 次数
        last_mvp_card = nil  -- 最近一次 MVP 结算详情
    }
end

-- 获取玩家当前自信心特质的属性增益
function PostMatchMVP:getConfidenceBonus(player)
    local conf = (player and player.confidence) or PostMatchMVP.newDefaultPlayerConfidence()
    local tier = PostMatchMVP.CONFIDENCE_TIERS[conf.level] or PostMatchMVP.CONFIDENCE_TIERS[0]

    if conf.matches_left <= 0 and conf.level > 0 then
        -- 增益已过期
        tier = PostMatchMVP.CONFIDENCE_TIERS[0]
    end

    return {
        level = tier.level,
        name = tier.name,
        badge = tier.badge,
        bonus_mech = tier.bonus_mech,
        bonus_mental = tier.bonus_mental,
        bonus_win = tier.bonus_win,
        bonus_lp = tier.bonus_lp,
        desc = tier.desc,
        matches_left = conf.matches_left or 0,
        is_active = (conf.matches_left or 0) > 0 and tier.level > 0
    }
end

-- 对局结束后推进自信心衰减（若没有蝉联 MVP 则倒数 1 场）
function PostMatchMVP:tickMatchConfidence(player)
    if not player or not player.confidence then return end
    local conf = player.confidence
    if conf.matches_left > 0 then
        conf.matches_left = conf.matches_left - 1
        if conf.matches_left <= 0 then
            conf.level = 0
            conf.current_streak = 0
        end
    end
end

-- 结算单排排位对局的 MVP 评定
function PostMatchMVP:evaluateSoloQueue(player, champ_name, is_win, score_factor)
    champ_name = champ_name or "本命英雄"
    score_factor = score_factor or 1.0

    local mech = player.mechanics or 60
    local ment = player.mental or 60
    local focus = player.focus or 80

    -- 生成赛后综合 KDA
    local kills, deaths, assists
    if is_win then
        kills = math.random(7, 14)
        deaths = math.random(0, 3)
        assists = math.random(6, 12)
    else
        kills = math.random(4, 9)
        deaths = math.random(3, 6)
        assists = math.random(3, 7)
    end

    local kda_ratio = (deaths == 0) and (kills + assists) or ((kills + assists) / deaths)
    local raw_score = 6.0 + (kda_ratio * 0.45) + (mech * 0.02) + (ment * 0.015)
    if is_win then raw_score = raw_score + 1.2 end
    raw_score = math.min(10.0, math.max(6.0, raw_score * score_factor))
    local rounded_score = math.floor(raw_score * 10) / 10

    local is_mvp = is_win and (rounded_score >= 8.8 or math.random(1, 100) <= 75)
    local is_svp = (not is_win) and (rounded_score >= 7.8 and math.random(1, 100) <= 45)

    -- 挑选高光文案风格
    local flavor_key = "carry_god"
    if is_svp then
        flavor_key = "svp_tragic_hero"
    elseif rounded_score >= 9.6 then
        flavor_key = (math.random(1, 2) == 1) and "carry_god" or "clutch_king"
    elseif mech >= ment then
        flavor_key = "lane_dominator"
    else
        flavor_key = "macro_mastermind"
    end
    local flavor = PostMatchMVP.FLAVOR_QUOTES[flavor_key]

    local kda_str = string.format("%d / %d / %d", kills, deaths, assists)
    local damage_pct = math.random(32, 44)
    local kill_part_pct = math.random(72, 94)

    local record = {
        match_type = "SOLO_QUEUE",
        champ_name = champ_name,
        is_win = is_win,
        is_mvp = is_mvp,
        is_svp = is_svp,
        score = rounded_score,
        kda = kda_str,
        damage_share = string.format("%d%%", damage_pct),
        kill_participation = string.format("%d%%", kill_part_pct),
        headline = is_mvp and string.format("👑【赛后 MVP 斩获 · %.1f 分】%s", rounded_score, flavor.title)
                 or (is_svp and string.format("💔【赛后 SVP 孤勇战神 · %.1f 分】%s", rounded_score, flavor.title)
                 or string.format("⚔️【赛后表现评定 · %.1f 分】%s 打出稳健数据", rounded_score, champ_name)),
        caster_quote = flavor.quote or "",
        danmaku = flavor.danmaku
    }

    -- 判定是否赋予自信心特质强化
    local buff_awarded = false
    local buff_desc = nil
    if is_mvp then
        buff_awarded, buff_desc = self:applyConfidenceBuff(player, true, is_win)
    else
        self:tickMatchConfidence(player)
    end

    record.buff_awarded = buff_awarded
    record.buff_desc = buff_desc
    player.confidence = player.confidence or PostMatchMVP.newDefaultPlayerConfidence()
    player.confidence.last_mvp_card = record

    if is_mvp then
        player.mvp_stats = player.mvp_stats or { total_mvp = 0, solo_mvp = 0, stage_mvp = 0 }
        player.mvp_stats.total_mvp = (player.mvp_stats.total_mvp or 0) + 1
        player.mvp_stats.solo_mvp = (player.mvp_stats.solo_mvp or 0) + 1
    end

    return record
end

-- 结算职业 5v5 舞台对决 (Stage Match) 的 MVP 评定
function PostMatchMVP:evaluateStageMatch(player, blue_picks, red_picks, won)
    local my_champ = (blue_picks and blue_picks[3] and blue_picks[3].name) or "主力中单 (Prodigy)"
    local kills, deaths, assists
    if won then
        kills = math.random(9, 16)
        deaths = math.random(0, 2)
        assists = math.random(8, 15)
    else
        kills = math.random(4, 8)
        deaths = math.random(3, 5)
        assists = math.random(5, 9)
    end

    local kda_ratio = (deaths == 0) and (kills + assists) or ((kills + assists) / deaths)
    local raw_score = won and (8.6 + math.min(1.4, kda_ratio * 0.15)) or (7.2 + math.min(1.2, kda_ratio * 0.1))
    local rounded_score = math.floor(raw_score * 10) / 10

    local is_mvp = won -- 职业场次胜利主力队长优先斩获 MVP
    local is_svp = not won and (rounded_score >= 8.0)

    local flavor_key = is_svp and "svp_tragic_hero" or "carry_god"
    if won and rounded_score >= 9.8 then
        flavor_key = "clutch_king"
    end
    local flavor = PostMatchMVP.FLAVOR_QUOTES[flavor_key]

    local kda_str = string.format("%d / %d / %d", kills, deaths, assists)
    local damage_pct = math.random(35, 48)
    local kill_part_pct = math.random(80, 98)

    local record = {
        match_type = "STAGE_MATCH",
        champ_name = my_champ,
        is_win = won,
        is_mvp = is_mvp,
        is_svp = is_svp,
        score = rounded_score,
        kda = kda_str,
        damage_share = string.format("%d%%", damage_pct),
        kill_participation = string.format("%d%%", kill_part_pct),
        headline = is_mvp and string.format("👑【ARENA STAGE 全场 MVP 登顶 · %.1f 分】%s", rounded_score, flavor.title)
                 or string.format("💔【STAGE 惜败告负 · %.1f 分】%s", rounded_score, flavor.title),
        caster_quote = flavor.quote or "",
        danmaku = flavor.danmaku
    }

    local buff_awarded = false
    local buff_desc = nil
    if is_mvp then
        buff_awarded, buff_desc = self:applyConfidenceBuff(player, true, won)
    else
        self:tickMatchConfidence(player)
    end

    record.buff_awarded = buff_awarded
    record.buff_desc = buff_desc
    player.confidence = player.confidence or PostMatchMVP.newDefaultPlayerConfidence()
    player.confidence.last_mvp_card = record

    if is_mvp then
        player.mvp_stats = player.mvp_stats or { total_mvp = 0, solo_mvp = 0, stage_mvp = 0 }
        player.mvp_stats.total_mvp = (player.mvp_stats.total_mvp or 0) + 1
        player.mvp_stats.stage_mvp = (player.mvp_stats.stage_mvp or 0) + 1
    end

    return record
end

-- 赋予/升级玩家的「自信心 (Confidence)」特质增益
function PostMatchMVP:applyConfidenceBuff(player, is_mvp, is_win)
    if not player then return false, nil end
    player.confidence = player.confidence or PostMatchMVP.newDefaultPlayerConfidence()
    local conf = player.confidence

    if is_mvp then
        conf.current_streak = (conf.current_streak or 0) + 1
        conf.level = math.min(3, conf.level + 1)
        conf.matches_left = 3 -- 持续生效接下来的 3 场比赛
        conf.score = math.min(100, conf.score + 15)

        local tier = PostMatchMVP.CONFIDENCE_TIERS[conf.level]
        local desc = string.format("✨【自信心特质暴涨】荣膺全场 MVP！狂傲自信心升至【%s %s】！微操+%d, 心态+%d, 胜率+%d%% (剩余有效期: %d 场比赛)！",
            tier.badge, tier.name, tier.bonus_mech, tier.bonus_mental, tier.bonus_win, conf.matches_left)
        return true, desc
    end
    return false, nil
end

-- 终端界面渲染 MVP 赛后荣誉面板 (TapTap Make 移动竖屏风格)
function PostMatchMVP:renderMVPBanner(record, player)
    if not record then return end

    print("\n================ 🏆 POST-MATCH MVP 赛后荣誉殿堂 ================")
    print(string.format("【赛事定位】%s | 【官方评分】★ %.1f 分 ★",
        record.match_type == "STAGE_MATCH" and "职业赛场 5v5 决战" or "天梯巅峰单排", record.score))
    print(string.format("【本场殊荣】%s", record.headline))
    print(string.format("【使用英雄】%s | 【数据KDA】%s", record.champ_name, record.kda))
    print(string.format("【团战贡献】伤害占比: %s | 参团率: %s", record.damage_share, record.kill_participation))
    print("----------------------------------------------------------------")
    print("🎙️【解说席金句点评】:")
    print("   " .. record.caster_quote)
    print("💬【全网赛事直播弹幕】:")
    print("   " .. record.danmaku)
    print("----------------------------------------------------------------")

    if player and player.confidence then
        local bonus = self:getConfidenceBonus(player)
        if bonus.is_active then
            print(string.format("🔥【激活特质】「自信心 (Confidence)」-> %s %s (生效中: 剩余 %d 场)",
                bonus.badge, bonus.name, bonus.matches_left))
            print(string.format("   增益效果: 微操+%d | 心态+%d | 对局胜率+%d%% | 胜场额外+%d LP",
                bonus.bonus_mech, bonus.bonus_mental, bonus.bonus_win, bonus.bonus_lp))
            print("   " .. bonus.desc)
        end
    end
    print("================================================================\n")
end

return PostMatchMVP
