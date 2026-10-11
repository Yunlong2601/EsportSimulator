--[[
    ============================================================================
    TAPTAP MAKE: COMMUNITY RELATIONS & FANBASE MULTIPLIER ENGINE
    (社区公关关系、粉丝运营与全网赛事直播弹幕引擎)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 社区公关与粉丝运营 (Community Relations):
         - 社交媒体营销 (Social Media Campaigns): 官博整活、赛事高光短视频、微博应援抽奖、纪录片宣发
         - 粉丝线下见面会 (Fan Meetups): 俱乐部基地开放日、城市商圈痛车巡游、千人水友对抗赛
         - 全网破圈直播狂欢 (Live Streaming Events): 联名周边带货首发、跨界名人连麦秀、赛季庆典不打烊
      2. 粉丝基数与倍率成长 (Fanbase Count & Fanbase Multiplier):
         - 粉丝基数从数千人逐步成长至数百万，倍率从 1.0x 梯次晋升至 5.0x
         - 极大幅度提振王朝阶段 (Dynasty Phase) 的商业品牌赞助周薪与签约津贴！
      3. 赛事直播弹幕模拟器 (Live Match Danmaku Simulation):
         - 模拟真实赛事官方直播间中亿万观众的实时弹幕流
         - 支持击杀、抢龙、团灭、逆风翻盘等场景的动态弹幕触发
         - 支持玩家发送自定义专属应援弹幕
--]]

local CommunityRelations = {}
CommunityRelations.__index = CommunityRelations

-- 社区公关活动企划库
CommunityRelations.CAMPAIGNS = {
    -- 1. 社交媒体营销 (Social Media Campaigns)
    {
        id = "social_memes",
        type = "SOCIAL",
        category_name = "社交媒体病毒营销",
        title = "官博整活与超燃高光剪辑 (Viral Memes & Clips)",
        cost = 1500,
        energy_cost = 10,
        fanbase_gain = 8500,
        multiplier_gain = 0.08,
        desc = "剪辑选手赛场极限反杀与幕后花絮梗图，引爆微博超话与B站热门热搜。",
        cooldown_days = 3
    },
    {
        id = "social_lottery",
        type = "SOCIAL",
        category_name = "社交媒体病毒营销",
        title = "全网应援互动大抽奖 (Fan Super-Topic Giveaway)",
        cost = 3800,
        energy_cost = 12,
        fanbase_gain = 24000,
        multiplier_gain = 0.15,
        desc = "官宣送出选手亲笔签名队服与全套顶级外设，转发突破十万次！",
        cooldown_days = 5
    },
    {
        id = "social_docuseries",
        type = "SOCIAL",
        category_name = "社交媒体病毒营销",
        title = "战队官方纪录片《首发之路》上线 (Pro Docuseries)",
        cost = 9500,
        energy_cost = 18,
        fanbase_gain = 68000,
        multiplier_gain = 0.28,
        desc = "纪录片全网播放量破千万，真实呈现选手的拼搏热血与心路历程，吸粉无数路人！",
        cooldown_days = 8
    },

    -- 2. 粉丝线下见面会 (Fan Meetups)
    {
        id = "meetup_house_day",
        type = "MEETUP",
        category_name = "线下粉丝见面会",
        title = "俱乐部基地开放日 & 选手签名会 (Gaming House Fan Day)",
        cost = 5200,
        energy_cost = 20,
        fanbase_gain = 35000,
        multiplier_gain = 0.20,
        desc = "邀请核心铁粉入驻俱乐部基地合影、打卡荣誉奖杯陈列室并共进选手特调下午茶。",
        cooldown_days = 6
    },
    {
        id = "meetup_city_tour",
        type = "MEETUP",
        category_name = "线下粉丝见面会",
        title = "城市商圈痛车巡游与应援快闪店 (City Pop-Up Tour)",
        cost = 14000,
        energy_cost = 25,
        fanbase_gain = 95000,
        multiplier_gain = 0.35,
        desc = "在各大核心一线商圈设立战队应援快闪旗舰店，万人围观排队打卡！",
        cooldown_days = 10
    },
    {
        id = "meetup_lan_party",
        type = "MEETUP",
        category_name = "线下粉丝见面会",
        title = "全国千人粉丝水友对抗大狂欢 (National LAN Party)",
        cost = 28000,
        energy_cost = 30,
        fanbase_gain = 180000,
        multiplier_gain = 0.50,
        desc = "租借大型电竞场馆，全队与水友同台竞技互动，全网同步破圈热议！",
        cooldown_days = 14
    },

    -- 3. 全网破圈直播狂欢 (Live Streaming Events)
    {
        id = "stream_merch_drop",
        type = "STREAM",
        category_name = "全网破圈直播狂欢",
        title = "联名潮牌周边首发带货直播 (Merch Apparel Drop)",
        cost = 3500,
        energy_cost = 15,
        fanbase_gain = 42000,
        multiplier_gain = 0.22,
        desc = "全员开播首发限量款电竞队服、徽章与公仔，直播间热度瞬间登顶全网第一！",
        cooldown_days = 4
    },
    {
        id = "stream_collab_show",
        type = "STREAM",
        category_name = "全网破圈直播狂欢",
        title = "选手连麦顶流主播娱乐跨界赛 (Celebrity Duo Stream Fest)",
        cost = 8000,
        energy_cost = 20,
        fanbase_gain = 88000,
        multiplier_gain = 0.32,
        desc = "与跨圈顶流主播开黑搞怪，节目效果爆炸，粉丝群一夜涌入数万新粉丝！",
        cooldown_days = 7
    },
    {
        id = "stream_mega_festival",
        type = "STREAM",
        category_name = "全网破圈直播狂欢",
        title = "赛季庆典全天候不打烊跨年狂欢 (Season Gala Mega-Stream)",
        cost = 22000,
        energy_cost = 35,
        fanbase_gain = 220000,
        multiplier_gain = 0.65,
        desc = "全俱乐部连续24小时全景直播，全员表演才艺、连麦粉丝，达成全网最高峰在线人数奇迹！",
        cooldown_days = 14
    }
}

-- 赛事直播动态弹幕文案库
CommunityRelations.MATCH_DANMAKU_POOL = {
    general = {
        "7777777777777",
        "卧槽！这走位也能扭开的？？？",
        "这就是世界第一中单的压迫感吗？",
        "太帅了太帅了！帅我一脸！",
        "给队长磕一个！嘭嘭嘭！",
        "我的速效救心丸呢？？？",
        "解说直接看呆了哈哈哈哈",
        "满屏的6666666",
        "这波细节拉满了！",
        "建议严查！这操作绝对开了天眼！",
        "梦回S赛巅峰！爷青回！",
        "弹幕别叫了，好好看好好学！",
        "全体起立！！！",
        "加油冲冲冲！冠军是我们的！",
        "下饭？这叫米其林三星操作！",
        "兄弟们把公屏打在保护上！"
    },
    kill = {
        "单杀！！！对位单杀！太帅了！",
        "这也敢动手？？？绝境反杀！",
        "神！永远滴神！",
        "线杀！对面已经开始挠头红温了！",
        "杀疯了杀疯了！根本拦不住！",
        "这个Q怎么中的啊？？？魔术师？"
    },
    baron = {
        "大龙坑决战打响！谁抢到谁赢！",
        "抢到了！！！！我的天啊惩戒抢到了！",
        "奇迹大龙！剧本都不敢这么写！",
        "大龙毁一生！对面这波裂开了！",
        "一波了一波了！大龙buff直接平推！"
    },
    ace = {
        "团灭！！！！！ACE！！！！！",
        "推塔推塔推基地！我们要赢了！",
        "金色的雨准备就绪！",
        "无敌！横扫全场！势不可挡！",
        "捧杯吧！这是属于你们的荣耀！"
    }
}

function CommunityRelations.new()
    local self = setmetatable({}, CommunityRelations)

    self.fanbase_count = 12500            -- 初始粉丝基数
    self.fanbase_multiplier = 1.00        -- 初始赞助收益倍率 (1.00x)
    self.total_campaigns_run = 0          -- 累计举办活动次数
    self.active_cooldowns = {}            -- 活动冷却倒计时表 { [campaign_id] = days_left }
    self.recent_activities = {}          -- 最近举办记录
    self.custom_danmaku_history = {}      -- 玩家自定义弹幕历史

    return self
end

-- 获取指定活动信息
function CommunityRelations:getCampaign(campaign_id)
    for _, c in ipairs(CommunityRelations.CAMPAIGNS) do
        if c.id == campaign_id then return c end
    end
    return nil
end

-- 举办社区公关活动
function CommunityRelations:executeCampaign(campaign_id, player_or_dynasty, budget_source)
    local camp = self:getCampaign(campaign_id)
    if not camp then return false, "未找到指定的社区公关活动企划" end

    -- 检查冷却
    local cd = self.active_cooldowns[campaign_id] or 0
    if cd > 0 then
        return false, string.format("活动【%s】仍在策划筹备冷却中，请在 %d 天后再举办！", camp.title, cd)
    end

    -- 检查资金 (可从个人钱包或俱乐部金库扣除)
    local available_money = 0
    if budget_source == "DYNASTY" and player_or_dynasty.budget then
        available_money = player_or_dynasty.budget
    elseif player_or_dynasty.money then
        available_money = player_or_dynasty.money
    end

    if available_money < camp.cost then
        return false, string.format("运营预算不足！举办【%s】需要 $%d，当前仅有 $%d！",
            camp.title, camp.cost, available_money)
    end

    -- 检查精力
    if player_or_dynasty.energy and player_or_dynasty.energy < camp.energy_cost then
        return false, string.format("选手精力不足！活动需要消耗 %d 点精力，当前仅剩 %d 点！",
            camp.energy_cost, player_or_dynasty.energy)
    end

    -- 扣除消耗
    if budget_source == "DYNASTY" and player_or_dynasty.budget then
        player_or_dynasty.budget = player_or_dynasty.budget - camp.cost
    elseif player_or_dynasty.money then
        player_or_dynasty.money = player_or_dynasty.money - camp.cost
    end

    if player_or_dynasty.energy then
        player_or_dynasty.energy = math.max(0, player_or_dynasty.energy - camp.energy_cost)
    end

    -- 提升粉丝总数与赞助倍率
    self.fanbase_count = self.fanbase_count + camp.fanbase_gain
    self.fanbase_multiplier = math.floor((self.fanbase_multiplier + camp.multiplier_gain) * 100) / 100
    self.total_campaigns_run = self.total_campaigns_run + 1
    self.active_cooldowns[campaign_id] = camp.cooldown_days

    -- 联动俱乐部知名度与热度
    if player_or_dynasty.fan_hype then
        player_or_dynasty.fan_hype = player_or_dynasty.fan_hype + math.floor(camp.fanbase_gain * 0.4)
    end
    if player_or_dynasty.fame then
        player_or_dynasty.fame = math.min(100, player_or_dynasty.fame + 4)
    end

    local record = {
        campaign_id = camp.id,
        title = camp.title,
        fanbase_gain = camp.fanbase_gain,
        multiplier_now = self.fanbase_multiplier,
        time_stamp = os.date("%Y-%m-%d %H:%M:%S")
    }
    table.insert(self.recent_activities, 1, record)
    if #self.recent_activities > 10 then
        table.remove(self.recent_activities)
    end

    local success_msg = string.format("🎉【公关活动圆满成功】成功举办【%s】！全网新增关注粉丝 +%s 人，赞助收益倍率提升至【%.2fx】！",
        camp.title, string.format("%d", camp.fanbase_gain), self.fanbase_multiplier)

    return true, success_msg, record
end

-- 赛历推移推进公关活动冷却
function CommunityRelations:tickDays(days)
    days = days or 1
    for id, remaining in pairs(self.active_cooldowns) do
        if remaining > 0 then
            self.active_cooldowns[id] = math.max(0, remaining - days)
        end
    end
end

-- 计算王朝阶段经过粉丝倍率加成后的赞助收入
function CommunityRelations:calculateSponsoredPayout(base_payout)
    base_payout = base_payout or 0
    local boosted = math.floor(base_payout * self.fanbase_multiplier)
    local bonus = boosted - base_payout
    return boosted, bonus
end

-- 发送自定义应援弹幕
function CommunityRelations:sendCustomDanmaku(text, sender_name)
    text = tostring(text or ""):gsub("^%s*(.-)%s*$", "%1")
    if #text == 0 then return false, "弹幕内容不能为空" end
    sender_name = sender_name or "宿命先锋"

    local item = {
        text = text,
        sender = sender_name,
        color = "#F59E0B", -- 金色高亮VIP弹幕
        time = os.date("%H:%M:%S")
    }
    table.insert(self.custom_danmaku_history, 1, item)
    if #self.custom_danmaku_history > 20 then
        table.remove(self.custom_danmaku_history)
    end

    return true, string.format("【赛事直播间】[%s] 发送专属弹幕: %s", sender_name, text), item
end

-- 随机生成一条赛事弹幕流
function CommunityRelations:generateRandomDanmaku(event_context)
    local pool = self.MATCH_DANMAKU_POOL[event_context] or self.MATCH_DANMAKU_POOL.general
    local msg = pool[math.random(1, #pool)]
    return msg
end

-- 终端界面渲染社区公关与粉丝面板 (TapTap Make 移动竖屏风格)
function CommunityRelations:renderCLI()
    print("\n================ 📢 COMMUNITY RELATIONS 社区公关与粉丝运营 ================")
    print(string.format("【全网粉丝基数】%s 人 | 【商业赞助收益倍率】★ %.2fx ★",
        string.format("%d", self.fanbase_count), self.fanbase_multiplier))
    print(string.format("【已办活动总计】%d 次 | 【赞助提振效果】王朝签约金与周薪提振 +%d%%！",
        self.total_campaigns_run, math.floor((self.fanbase_multiplier - 1.0) * 100)))
    print("-------------------------------------------------------------------------")
    print("📋【三大专属粉丝运营企划库】:")

    for i, camp in ipairs(CommunityRelations.CAMPAIGNS) do
        local cd = self.active_cooldowns[camp.id] or 0
        local cd_str = cd > 0 and string.format("[冷却中: 剩余 %d 天]", cd) or "[随时可发起]"
        print(string.format("[%d] %s (%s)", i, camp.title, camp.category_name))
        print(string.format("    预算成本: $%d | 精力: %d | 粉丝涨幅: +%d | 倍率: +%.2fx | %s",
            camp.cost, camp.energy_cost, camp.fanbase_gain, camp.multiplier_gain, cd_str))
        print("    " .. camp.desc)
    end

    print("-------------------------------------------------------------------------")
    print("💬【官方赛事直播弹幕模拟 (实时弹幕热词切片)】:")
    for i = 1, 3 do
        print("   " .. self:generateRandomDanmaku("general"))
    end
    print("=========================================================================\n")
end

return CommunityRelations
