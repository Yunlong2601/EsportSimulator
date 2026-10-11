--[[
    ============================================================================
    TAPTAP MAKE: STREAMING MILESTONES & FAN EMOTES MODULE (直播里程碑与粉丝特权)
    ============================================================================
    Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    Mechanic:
      - Live stream bootcamps generate subscribers (订阅粉丝) and peak viewers.
      - Hitting subscriber thresholds unlocks unique Channel Perks (频道特权)
        and exclusive Fan Emotes (专属粉丝表情/弹幕勋章).
      - Perks boost donations, reduce fatigue drain, protect player mental,
        and provide passive sponsorship multipliers!
--]]

local StreamingMilestones = {}
StreamingMilestones.__index = StreamingMilestones

StreamingMilestones.CATALOG = {
    {
        id = "stream_1k",
        req = 1000,
        title = "千人认证主播 · 破晓启航",
        badge = "🌱 认证新星",
        reward_cash = 150,
        reward_fame = 2,
        perk_id = "perk_donation_boost",
        perk_name = "【弹幕助威仪】",
        perk_summary = "直播打赏收益 +20%，知名度收益 +1",
        perk_desc = "开启公屏粉丝专属守护灯牌与加油助威系统，点燃观众热情，单次直播打赏收益提升 20%。",
        emote_id = "emote_hype_clap",
        emote_name = "掌声雷动",
        emote_char = "👏",
        emote_code = ":hype_clap:",
        emote_rarity = "稀有 (Rare)",
        emote_desc = "全员起立，满屏滚动掌声为选手的绝地操作喝彩！"
    },
    {
        id = "stream_3k",
        req = 3000,
        title = "技术流大V · 天梯名场面",
        badge = "⚡ 技术尖兵",
        reward_cash = 350,
        reward_fame = 3,
        perk_id = "perk_fatigue_shield",
        perk_name = "【神级预判护盾】",
        perk_summary = "直播专注消耗由 -25 降为 -18，精力消耗由 -20 降为 -15",
        perk_desc = "炉火纯青的直播边打边解说节奏，大幅减缓神情倦怠，开播专注力与精力消耗减免约 28%。",
        emote_id = "emote_god_hand",
        emote_name = "神之右手",
        emote_char = "⚡",
        emote_code = ":god_hand:",
        emote_rarity = "稀有 (Rare)",
        emote_desc = "毫秒级闪现反向开团，弹幕刷屏膜拜非人类微操反应！"
    },
    {
        id = "stream_10k",
        req = 10000,
        title = "万人白金牌面 · 银河公会新贵",
        badge = "🌟 万人牌面",
        reward_cash = 850,
        reward_fame = 5,
        perk_id = "perk_super_chat",
        perk_name = "【超级弹幕 (SuperChat) 矩阵】",
        perk_summary = "直播打赏底薪 +$160，35% 几率触发榜一火箭空投 (+$320)",
        perk_desc = "开通金色高亮置顶弹幕与舰长专属坐席，大额打赏连环轰炸，公屏常驻火箭升空特效。",
        emote_id = "emote_rocket_drop",
        emote_name = "榜一大哥火箭",
        emote_char = "🚀",
        emote_code = ":rocket_drop:",
        emote_rarity = "史诗 (Epic)",
        emote_desc = "全服通报超能火箭升空，公屏特效席卷整个直播间！"
    },
    {
        id = "stream_30k",
        req = 30000,
        title = "金牌顶流红人 · 赛区造梗之王",
        badge = "🔥 顶流梗王",
        reward_cash = 1800,
        reward_fame = 8,
        perk_id = "perk_mental_resonance",
        perk_name = "【情绪共鸣抗压磁场】",
        perk_summary = "直播不再扣除心态并保底 +6 心态；单排胜场额外反哺 +180 订阅",
        perk_desc = "直播间充满粉丝真爱护体，无视节奏黑粉狂喷，直播不仅不耗损心态反而能迅速回血自愈。",
        emote_id = "emote_cold_master",
        emote_name = "绝对零度",
        emote_char = "🧊",
        emote_code = ":cold_master:",
        emote_rarity = "史诗 (Epic)",
        emote_desc = "逆风心如止水，冰封一切红温杂音，以绝对理智逆转乾坤！"
    },
    {
        id = "stream_75k",
        req = 75000,
        title = "现象级电竞巨星 · 商业虹吸",
        badge = "👑 现象巨擘",
        reward_cash = 4500,
        reward_fame = 12,
        perk_id = "perk_commercial_syphon",
        perk_name = "【破圈商业虹吸法则】",
        perk_summary = "经纪人所有代言分成与被动分红永久提升 +45%",
        perk_desc = "超巨级私域带货号召力，引得国际顶级超跑、潮牌与旗舰外设竞相抛出超规格商业代言肥约。",
        emote_id = "emote_dynasty_crown",
        emote_name = "封神王冠",
        emote_char = "👑",
        emote_code = ":dynasty_crown:",
        emote_rarity = "传说 (Legendary)",
        emote_desc = "金色神光加身，全网观众见证电竞新帝王诞生！"
    },
    {
        id = "stream_150k",
        req = 150000,
        title = "传奇名人堂殿堂 · 星穹主宰",
        badge = "🌌 殿堂传奇",
        reward_cash = 10000,
        reward_fame = 20,
        perk_id = "perk_galaxy_gravity",
        perk_name = "【永恒星光引力】",
        perk_summary = "单排胜场自动转化 +450 订阅与 +$100 商务提成，且微操上限突破至 105 点",
        perk_desc = "你的每一次排位拉枪都在亿万观众目光中载入电竞史册，超越人体微操极限，化身神话！",
        emote_id = "emote_galaxy_ace",
        emote_name = "星穹主宰",
        emote_char = "🌌",
        emote_code = ":galaxy_ace:",
        emote_rarity = "传说 (Legendary)",
        emote_desc = "星河璀璨至尊神光，铭刻在世界电竞名人堂巅峰的至高徽章！"
    }
}

function StreamingMilestones.newDefaultState()
    return {
        subscribers = 850,
        peak_viewers = 1200,
        total_streams = 0,
        unlocked_milestones = {},
        unlocked_emotes = {},
        active_perks = {},
        equipped_emote = nil
    }
end

function StreamingMilestones.hasPerk(channel, perk_id)
    if not channel or not channel.active_perks then return false end
    for _, p in ipairs(channel.active_perks) do
        if p == perk_id then return true end
    end
    return false
end

function StreamingMilestones.evaluateStreamOutcome(player)
    player.stream_channel = player.stream_channel or StreamingMilestones.newDefaultState()
    local ch = player.stream_channel

    local has_donation_boost = StreamingMilestones.hasPerk(ch, "perk_donation_boost")
    local has_fatigue_shield = StreamingMilestones.hasPerk(ch, "perk_fatigue_shield")
    local has_super_chat     = StreamingMilestones.hasPerk(ch, "perk_super_chat")
    local has_mental_res     = StreamingMilestones.hasPerk(ch, "perk_mental_resonance")
    local has_syphon         = StreamingMilestones.hasPerk(ch, "perk_commercial_syphon")

    -- Subscribers gain
    local base_subs = math.floor(140 + math.random(1, 180) + (player.fame or 0) * 3.5)
    if has_syphon then
        base_subs = math.floor(base_subs * 1.4)
    end
    ch.subscribers = ch.subscribers + base_subs
    ch.total_streams = ch.total_streams + 1

    -- Peak viewers
    local cur_peak = math.floor(ch.subscribers * 1.8 + math.random(100, 800) + (player.fame or 0) * 20)
    ch.peak_viewers = math.max(ch.peak_viewers, cur_peak)

    -- Payout calculation
    local mult = 1.0
    if has_donation_boost then mult = mult + 0.20 end
    if has_syphon then mult = mult + 0.45 end

    local bonus_cash = 0
    local rocket_cash = 0
    if has_super_chat then
        bonus_cash = bonus_cash + 160
        if math.random() < 0.35 then
            rocket_cash = 320
        end
    end

    local focus_drain = has_fatigue_shield and 18 or 25
    local energy_drain = has_fatigue_shield and 15 or 20
    local mental_gain = has_mental_res and 6 or (math.random() > 0.3 and 2 or -4)

    -- Detect newly crossed milestones
    local newly_crossed = {}
    for _, m in ipairs(StreamingMilestones.CATALOG) do
        local already_unlocked = false
        for _, u in ipairs(ch.unlocked_milestones) do
            if u == m.id then already_unlocked = true; break end
        end
        if not already_unlocked and ch.subscribers >= m.req then
            table.insert(newly_crossed, m)
        end
    end

    return {
        subs_gain = base_subs,
        peak_viewers = ch.peak_viewers,
        mult = mult,
        bonus_cash = bonus_cash + rocket_cash,
        rocket_bonus = rocket_cash,
        focus_drain = focus_drain,
        energy_drain = energy_drain,
        mental_gain = mental_gain,
        newly_crossed = newly_crossed
    }
end

function StreamingMilestones.actionClaim(player, milestone_id)
    player.stream_channel = player.stream_channel or StreamingMilestones.newDefaultState()
    local ch = player.stream_channel

    local target_m = nil
    for _, m in ipairs(StreamingMilestones.CATALOG) do
        if m.id == milestone_id then target_m = m; break end
    end
    if not target_m then
        return false, "❌ 未找到对应直播里程碑！"
    end

    if ch.subscribers < target_m.req then
        return false, string.format("❌ 粉丝订阅数未达标：需达到 %d 订阅，当前仅有 %d 订阅！",
            target_m.req, ch.subscribers)
    end

    for _, u in ipairs(ch.unlocked_milestones) do
        if u == milestone_id then
            return false, "❌ 该里程碑特权已领取，无需重复领取！"
        end
    end

    table.insert(ch.unlocked_milestones, milestone_id)
    table.insert(ch.active_perks, target_m.perk_id)
    table.insert(ch.unlocked_emotes, target_m.emote_id)
    if not ch.equipped_emote then
        ch.equipped_emote = target_m.emote_id
    end

    player.money = player.money + target_m.reward_cash
    player.fame = math.min(100, (player.fame or 0) + target_m.reward_fame)

    local msg = string.format("🎁【直播里程碑达成】突破 %d 粉丝订阅！奖金 +$%d，知名度 +%d！永久激活特权【%s】并解锁专属粉丝表情【%s %s (%s)】！",
        target_m.req, target_m.reward_cash, target_m.reward_fame,
        target_m.perk_name, target_m.emote_char, target_m.emote_name, target_m.emote_code)
    return true, msg
end

function StreamingMilestones.actionEquipEmote(player, emote_id)
    player.stream_channel = player.stream_channel or StreamingMilestones.newDefaultState()
    local ch = player.stream_channel

    if not emote_id or emote_id == "" then
        ch.equipped_emote = nil
        return true, "已卸下当前专属粉丝表情勋章。"
    end

    local emote_found = nil
    for _, m in ipairs(StreamingMilestones.CATALOG) do
        if m.emote_id == emote_id then
            emote_found = m; break
        end
    end
    if not emote_found then
        return false, "❌ 未找到指定表情勋章！"
    end

    local is_unlocked = false
    for _, u in ipairs(ch.unlocked_emotes) do
        if u == emote_id then is_unlocked = true; break end
    end
    if not is_unlocked then
        return false, string.format("❌ 专属表情【%s】尚未解锁（需达成 %d 订阅）！", emote_found.emote_name, emote_found.req)
    end

    ch.equipped_emote = emote_id
    local msg = string.format("✨ 已佩戴专属粉丝表情勋章【%s %s (%s)】！将在每次直播开播与弹幕中高亮展示！",
        emote_found.emote_char, emote_found.emote_name, emote_found.emote_code)
    return true, msg
end

function StreamingMilestones.renderCLI(player)
    player.stream_channel = player.stream_channel or StreamingMilestones.newDefaultState()
    local ch = player.stream_channel

    local equipped_str = "暂无"
    if ch.equipped_emote then
        for _, m in ipairs(StreamingMilestones.CATALOG) do
            if m.emote_id == ch.equipped_emote then
                equipped_str = string.format("%s %s (%s)", m.emote_char, m.emote_name, m.emote_code)
                break
            end
        end
    end

    print("\n================== 📺 直播间订阅里程碑与粉丝特权 (STREAMING MILESTONES) ==================")
    print(string.format("【当前粉丝订阅】%d 人 | 【历史最高人气】%d 在线 | 【累计开播】%d 场",
        ch.subscribers, ch.peak_viewers, ch.total_streams))
    print(string.format("【佩戴弹幕勋章】%s | 【已激活特权数】%d / %d 项",
        equipped_str, #ch.unlocked_milestones, #StreamingMilestones.CATALOG))
    print("----------------------------------------------------------------------------------------")

    for i, m in ipairs(StreamingMilestones.CATALOG) do
        local is_claimed = false
        for _, u in ipairs(ch.unlocked_milestones) do
            if u == m.id then is_claimed = true; break end
        end

        local status_tag
        if is_claimed then
            status_tag = "✅ [特权生效中]"
        elseif ch.subscribers >= m.req then
            status_tag = "🎁 [目标达成·待领取!]"
        else
            status_tag = string.format("🔒 [尚缺 %d 订阅]", m.req - ch.subscribers)
        end

        print(string.format("%d. [%s] 目标: %d 订阅 -> %s", i, m.title, m.req, status_tag))
        print(string.format("   • 专属特权: %s (%s)", m.perk_name, m.perk_summary))
        print(string.format("   • 粉丝表情: %s %s [%s] -> %s", m.emote_char, m.emote_name, m.emote_code, m.emote_rarity))
        print(string.format("   • 达成奖励: +$%d 奖金, +%d 知名度", m.reward_cash, m.reward_fame))
    end
    print("========================================================================================\n")
end

return StreamingMilestones
