--[[
    ============================================================================
    TAPTAP MAKE: ESPORTS EVENT ENGINE & UNIFIED CALENDAR SYSTEM
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 统一赛历时钟 (26周 = 182天真实职业赛年)
         - 第 1-8 周: 春季常规赛 (Spring Split)
         - 第 9-11 周: 季中冠军邀请赛 (MSI International)
         - 第 12-19 周: 夏季常规赛 (Summer Split - 争夺世界赛席位)
         - 第 20-24 周: 全球总决赛 (Worlds Championship)
         - 第 25-26 周: 冬季转会期 & 全明星 (Off-Season & Transfer Window)
      2. 动态版本 Meta 补丁轮替 (Patch 14.19 / 14.21 / 14.24)
         - 动态调控各英雄定位强度 (刺客/重装战士/法核/软辅/超频射手)
         - 匹配选手本命英雄，赋予胜率加成或版本逆风惩罚
      3. 多周环境词条 (Multi-Week Modifiers)
         - 影响当局 LP 获取倍率、体能衰减速度、手腕 RSI 劳损增长
      4. 国际大赛资格准入门槛审查 (Performance Gating for MSI & Worlds)
--]]

local EsportsEventEngine = {}
EsportsEventEngine.__index = EsportsEventEngine

-- 赛季阶段定义
EsportsEventEngine.SPLITS = {
    SPRING_SPLIT = { id = "SPRING_SPLIT", name = "春季赛常规赛", start_week = 1, end_week = 8, banner = "🌱 职业联赛春季赛常规争霸" },
    MSI          = { id = "MSI",          name = "季中冠军赛 (MSI)", start_week = 9, end_week = 11, banner = "🏆 季中冠军赛 - 跨赛区顶级交锋" },
    SUMMER_SPLIT = { id = "SUMMER_SPLIT", name = "夏季赛抢分赛", start_week = 12, end_week = 19, banner = "🔥 夏季赛关键战 - 抢夺世界赛种子" },
    WORLDS       = { id = "WORLDS",       name = "全球总决赛 (Worlds)", start_week = 20, end_week = 24, banner = "👑 全球总决赛 - 终极殿堂之战" },
    OFF_SEASON   = { id = "OFF_SEASON",   name = "休赛转会期", start_week = 25, end_week = 26, banner = "❄️ 冬季休赛整顿与转会风云" }
}

-- 预设版本补丁与英雄强度字典
EsportsEventEngine.PATCHES = {
    {
        version = "14.19",
        headline = "破败重装崛起 · 上中野肉搏时代",
        desc = "战士与重装突进英雄获得大量攻击力与韧性加成，法师生存空间受到严重挤压。",
        start_week = 1,
        end_week = 6,
        buffed = { "Dive/Assassin", "Splitpusher" },
        nerfed = { "Control Mage" },
        s_tier_champs = { "影流之主 (劫)", "离群之刺 (阿卡丽)", "盲僧 (李青)", "武器大师 (贾克斯)" },
        bonus_mechanics = 6
    },
    {
        version = "14.21",
        headline = "下路双核终局 · 射手绝对主权",
        desc = "暴击装价格全面下调，硬控坦克开团价值暴涨，下路对线定乾坤。",
        start_week = 7,
        end_week = 13,
        buffed = { "Hypercarry", "Engage Tank" },
        nerfed = { "Enchanter" },
        s_tier_champs = { "残月之肃 (厄斐琉斯)", "暴走萝莉 (金克丝)", "深海泰坦 (诺提勒斯)" },
        bonus_mechanics = 5
    },
    {
        version = "14.23",
        headline = "全球总决赛决战版本 · 奇迹刺杀与控制链",
        desc = "季后赛与世界赛专属调整，高容错控制法师与极限开团刺客主宰赛场节奏。",
        start_week = 14,
        end_week = 24,
        buffed = { "Control Mage", "Dive/Assassin" },
        nerfed = { "Poke" },
        s_tier_champs = { "暗黑元首 (辛德拉)", "妖姬 (乐芙兰)", "盲僧 (李青)" },
        bonus_mechanics = 7
    }
}

-- 周期性多周环境事件池
EsportsEventEngine.GLOBAL_EVENTS = {
    {
        id = "event_spring_frenzy",
        name = "开年定级狂热 (Spring Kickoff)",
        category = "COMMUNITY_HYPE",
        start_week = 1,
        end_week = 4,
        lp_mult = 1.30,         -- LP 获取增加 30%
        strain_mult = 1.0,      -- 劳损正常
        focus_drain_mult = 1.05,
        desc = "赛季初全员冲分狂热，胜场积分大幅上浮！",
        flavor = "直播间弹幕刷屏，各路青训与路人王疯狂撞车抢占第一批天梯榜单。"
    },
    {
        id = "event_msi_pressure",
        name = "MSI 国际高压封锁 (MSI Lockdown)",
        category = "TOURNAMENT",
        start_week = 9,
        end_week = 11,
        lp_mult = 1.20,
        strain_mult = 1.35,     -- 国际对抗高压，手腕负荷加重 35%
        focus_drain_mult = 1.25,
        desc = "国际赛高强度博弈，失误惩罚严重，精神与手腕负荷急剧攀升。",
        flavor = "外卡与四大赛区精英集结，每一盘训练赛都在考验选手的神经耐受极限。"
    },
    {
        id = "event_summer_sprint",
        name = "夏季生死抢分周 (Summer Super Week)",
        category = "COMMUNITY_HYPE",
        start_week = 15,
        end_week = 18,
        lp_mult = 1.40,
        strain_mult = 1.15,
        focus_drain_mult = 1.10,
        desc = "通往世界赛的最后积分窗口，连胜奖赏极为丰厚。",
        flavor = "管理层与教练组全体督战，胜利不仅带来高额积分，更能吸引全球星探聚焦。"
    },
    {
        id = "event_worlds_climax",
        name = "全球总决赛巅峰极境 (Worlds Pinnacle)",
        category = "TOURNAMENT",
        start_week = 20,
        end_week = 24,
        lp_mult = 1.50,
        strain_mult = 1.40,
        focus_drain_mult = 1.30,
        desc = "召唤师之杯近在咫尺！胜场收益拉满，但极度消耗选手的精力与体能。",
        flavor = "万人场馆金色的雨，举世瞩目的聚光灯下，每一场对局都将载入电竞名人堂。"
    },
    {
        id = "event_winter_respite",
        name = "冬季温情休整期 (Winter Respite)",
        category = "FATIGUE_CRISIS",
        start_week = 25,
        end_week = 26,
        lp_mult = 0.85,
        strain_mult = 0.60,     -- 劳损减轻40%
        focus_drain_mult = 0.70,
        desc = "赛季收官，转会期到来。高强度竞争放缓，选手休假与理疗效果翻倍。",
        flavor = "选手们回到家乡或在基地休假，直播开播氛围欢乐，伤病恢复速度显著提升。"
    }
}

function EsportsEventEngine.new()
    local self = setmetatable({}, EsportsEventEngine)
    self.state = {
        season_year = 2026,
        current_week = 1,
        current_day = 1,
        current_split = "SPRING_SPLIT",
        split_matches = 0,
        split_wins = 0,
        split_losses = 0,
        msi_qualified = false,
        msi_cleared = false,
        worlds_qualified = false,
        worlds_cleared = false,
        history_logs = { "2026 赛季职业赛历正式开启，春季常规赛打响第一枪！" }
    }
    return self
end

-- 获取当前赛季阶段
function EsportsEventEngine:getCurrentSplit()
    local week = self.state.current_week
    if week >= 1 and week <= 8 then
        return EsportsEventEngine.SPLITS.SPRING_SPLIT
    elseif week >= 9 and week <= 11 then
        return EsportsEventEngine.SPLITS.MSI
    elseif week >= 12 and week <= 19 then
        return EsportsEventEngine.SPLITS.SUMMER_SPLIT
    elseif week >= 20 and week <= 24 then
        return EsportsEventEngine.SPLITS.WORLDS
    else
        return EsportsEventEngine.SPLITS.OFF_SEASON
    end
end

-- 获取当前版本补丁
function EsportsEventEngine:getCurrentPatch()
    local week = self.state.current_week
    for _, patch in ipairs(EsportsEventEngine.PATCHES) do
        if week >= patch.start_week and week <= patch.end_week then
            return patch
        end
    end
    return EsportsEventEngine.PATCHES[#EsportsEventEngine.PATCHES]
end

-- 获取当前生效的环境事件
function EsportsEventEngine:getActiveModifiers()
    local week = self.state.current_week
    local active = {}
    for _, evt in ipairs(EsportsEventEngine.GLOBAL_EVENTS) do
        if week >= evt.start_week and week <= evt.end_week then
            table.insert(active, evt)
        end
    end
    return active
end

-- 计算复合环境增益乘数
function EsportsEventEngine:getCompoundMultipliers()
    local active = self:getActiveModifiers()
    local lp_mult = 1.0
    local strain_mult = 1.0
    local focus_drain_mult = 1.0

    for _, evt in ipairs(active) do
        lp_mult = lp_mult * evt.lp_mult
        strain_mult = strain_mult * evt.strain_mult
        focus_drain_mult = focus_drain_mult * evt.focus_drain_mult
    end

    return {
        lp_mult = lp_mult,
        strain_mult = strain_mult,
        focus_drain_mult = focus_drain_mult
    }
end

-- 检查英雄是否在当前版本属于 S/S+ 梯队并返回 Meta 增益与 LP 提振
function EsportsEventEngine:evaluateChampionMetaBonus(champ_name, archetype)
    local patch = self:getCurrentPatch()
    local is_s_tier = false

    if champ_name then
        for _, c in ipairs(patch.s_tier_champs) do
            if c == champ_name or string.find(champ_name, c, 1, true) or string.find(c, champ_name, 1, true) then
                is_s_tier = true
                break
            end
        end
    end

    local is_buffed_archetype = false
    if archetype then
        for _, arch in ipairs(patch.buffed) do
            if arch == archetype then
                is_buffed_archetype = true
                break
            end
        end
    end

    local is_nerfed_archetype = false
    if archetype then
        for _, arch in ipairs(patch.nerfed) do
            if arch == archetype then
                is_nerfed_archetype = true
                break
            end
        end
    end

    local power_delta = 0
    local lp_boost_pct = 0
    if is_s_tier then
        power_delta = power_delta + patch.bonus_mechanics
        lp_boost_pct = 20
    elseif is_buffed_archetype then
        power_delta = power_delta + math.floor(patch.bonus_mechanics * 0.7)
        lp_boost_pct = 10
    elseif is_nerfed_archetype then
        power_delta = power_delta - 4
        lp_boost_pct = -5
    end

    return {
        is_s_tier = is_s_tier,
        is_buffed = is_buffed_archetype,
        is_nerfed = is_nerfed_archetype,
        power_delta = power_delta,
        lp_boost_pct = lp_boost_pct,
        patch_version = patch.version
    }
end

-- 计算完整 BP 阵容中选用的 S 级英雄数量及临时 LP 胜场红利
function EsportsEventEngine:evaluateDraftMetaLpBoost(picks)
    local s_tier_count = 0
    local total_lp_boost_pct = 0
    local s_tier_names = {}

    for _, p in ipairs(picks or {}) do
        if p and p.name then
            local meta = self:evaluateChampionMetaBonus(p.name, p.archetype)
            if meta.is_s_tier then
                s_tier_count = s_tier_count + 1
                total_lp_boost_pct = total_lp_boost_pct + meta.lp_boost_pct
                table.insert(s_tier_names, p.name)
            end
        end
    end

    local bonus_lp_base = s_tier_count * 25
    local capped_pct = math.min(60, total_lp_boost_pct)
    local total_bonus_lp = math.floor(bonus_lp_base * (1 + capped_pct / 100))

    return {
        s_tier_count = s_tier_count,
        bonus_lp_pct = capped_pct,
        bonus_lp_base = bonus_lp_base,
        total_bonus_lp = total_bonus_lp,
        s_tier_names = s_tier_names,
        is_active = s_tier_count > 0
    }
end

-- 资格审查：MSI与世界赛准入门槛判定
function EsportsEventEngine:checkQualifications(player)
    local week = self.state.current_week
    local rate = self.state.split_matches > 0 and (self.state.split_wins / self.state.split_matches) or 0

    -- MSI 判定 (第8周末考核)
    if week >= 8 and not self.state.msi_qualified then
        if (self.state.split_matches >= 6 and rate >= 0.55) or (player and player.lp and player.lp >= 450) then
            self.state.msi_qualified = true
            table.insert(self.state.history_logs, "【国际资格通报】春季赛表现优异！成功斩获季中冠军赛 (MSI) 入场资格！")
        end
    end

    -- Worlds 判定 (第19周末考核)
    if week >= 19 and not self.state.worlds_qualified then
        if (self.state.split_matches >= 12 and rate >= 0.58) or (player and player.lp and player.lp >= 750) then
            self.state.worlds_qualified = true
            table.insert(self.state.history_logs, "【巅峰资格通报】夏季赛积分登顶！获得代表赛区出征全球总决赛 (Worlds) 头号种子席位！")
        end
    end
end

-- 推进时间 (对局+2天，直播+1天，休整+1天，复盘+1天)
function EsportsEventEngine:advanceDays(days, player)
    days = days or 1
    local old_week = self.state.current_week
    local old_split = self:getCurrentSplit().id

    self.state.current_day = self.state.current_day + days
    self.state.current_week = math.floor((self.state.current_day - 1) / 7) + 1

    -- 年终结转新赛季 (26周一循环)
    if self.state.current_week > 26 then
        self.state.season_year = self.state.season_year + 1
        self.state.current_week = 1
        self.state.current_day = 1
        self.state.split_matches = 0
        self.state.split_wins = 0
        self.state.split_losses = 0
        self.state.msi_qualified = false
        self.state.msi_cleared = false
        self.state.worlds_qualified = false
        self.state.worlds_cleared = false
        table.insert(self.state.history_logs, string.format("【新赛季开启】欢迎来到 %d 电竞年！全赛区战队整装待发。", self.state.season_year))
    end

    local new_split = self:getCurrentSplit()
    self.state.current_split = new_split.id

    -- 阶段变更通知
    if old_split ~= new_split.id then
        table.insert(self.state.history_logs, string.format("【赛历更替】正式步入全新阶段：%s！", new_split.name))
        -- 重置阶段比赛战绩
        self.state.split_matches = 0
        self.state.split_wins = 0
        self.state.split_losses = 0
    end

    -- 资格门槛审查
    self:checkQualifications(player)

    return {
        days_passed = days,
        current_day = self.state.current_day,
        current_week = self.state.current_week,
        split = new_split,
        patch = self:getCurrentPatch(),
        active_events = self:getActiveModifiers(),
        msi_qualified = self.state.msi_qualified,
        worlds_qualified = self.state.worlds_qualified
    }
end

-- 记录比赛战果到当前赛季阶段
function EsportsEventEngine:recordMatchResult(is_win)
    self.state.split_matches = self.state.split_matches + 1
    if is_win then
        self.state.split_wins = self.state.split_wins + 1
    else
        self.state.split_losses = self.state.split_losses + 1
    end
end

return EsportsEventEngine
