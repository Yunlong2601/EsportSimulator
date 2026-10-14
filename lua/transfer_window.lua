--[[
    ============================================================================
    TAPTAP MAKE: OFF-SEASON TRANSFER WINDOW ENGINE (休赛期转会窗与自由人竞标系统)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 夏季赛收官与休赛期触发机制 (Summer Split End / Off-Season Trigger)
      2. 倒计时压迫感系统 (Time-Pressured Deadline Countdown):
         - 14天转会截止窗口，每次竞价、问询与交易提议推进时间
         - 压哨最后 48 小时紧急红字警报与豪门压哨哄抢事件
      3. S+级全球自由人竞价拍卖 (Free Agent Bidding War):
         - 自由人市场池 (Bin, Canyon, Chovy, Ruler, Keria, Viper 等顶级巨星)
         - 豪门俱乐部竞价 AI (T1, BLG, Gen.G, HLE 参与动态抬价与截胡)
      4. 战队间选手互换交易谈判 (Roster Player Trade & Cash Negotiation):
         - 己方选手 + 现金补偿 换购对手主力/替补
         - 对方俱乐部经理基于战术契合度、战力差与溢价率进行真实评估谈判
      5. 阵容战力即时重构与薪资帽结算 (Roster Realignment & Luxury Tax)
--]]

local TransferWindow = {}
TransferWindow.__index = TransferWindow

-- 顶级自由人市场候选名单
TransferWindow.FREE_AGENTS_POOL = {
    {
        id = "fa_bin",
        name = "Bin (陈泽彬)",
        role = "TOP",
        power = 97,
        asking_salary = 21000,
        base_bid = 380000,
        current_bid = 380000,
        leading_team = "自由人球市",
        traits = "极境单挑 · 战士刀刀见血 · 天神下凡",
        demands = "追求世界冠军与顶级战力阵容",
        signed = false
    },
    {
        id = "fa_canyon",
        name = "Canyon (许秀之友/三叔)",
        role = "JUG",
        power = 97,
        asking_salary = 22000,
        base_bid = 420000,
        current_bid = 420000,
        leading_team = "自由人球市",
        traits = "北极熊控野 · 几何级反野 · 野核天花板",
        demands = "需要战队具备强势对线三路",
        signed = false
    },
    {
        id = "fa_chovy",
        name = "Chovy (郑志勋)",
        role = "MID",
        power = 98,
        asking_salary = 25000,
        base_bid = 480000,
        current_bid = 480000,
        leading_team = "自由人球市",
        traits = "绝对补刀机器 · 极限拉扯对线 · 无解防Gank",
        demands = "争夺全球总决赛第一冠",
        signed = false
    },
    {
        id = "fa_ruler",
        name = "Ruler (朴到贤/尺帝)",
        role = "ADC",
        power = 97,
        asking_salary = 23000,
        base_bid = 450000,
        current_bid = 450000,
        leading_team = "自由人球市",
        traits = "终局大核接管 · 零失误团战走位 · 绝境金身",
        demands = "要求配备强开保护型辅助",
        signed = false
    },
    {
        id = "fa_keria",
        name = "Keria (柳岷析/怪才博士)",
        role = "SUP",
        power = 97,
        asking_salary = 19000,
        base_bid = 390000,
        current_bid = 390000,
        leading_team = "自由人球市",
        traits = "全能黑科技英雄海 · 奇迹开团视野 · 大脑指挥",
        demands = "青睐敢打敢拼的激进打野搭档",
        signed = false
    },
    {
        id = "fa_viper",
        name = "Viper (朴到贤)",
        role = "ADC",
        power = 96,
        asking_salary = 21000,
        base_bid = 410000,
        current_bid = 410000,
        leading_team = "自由人球市",
        traits = "通天代反应速度 · 绝杀残局收割 · 顶尖对线",
        demands = "渴望争冠级中野配置",
        signed = false
    },
    {
        id = "fa_scout",
        name = "Scout (李汭燦)",
        role = "MID",
        power = 95,
        asking_salary = 18000,
        base_bid = 340000,
        current_bid = 340000,
        leading_team = "自由人球市",
        traits = "大场面先生 · 关键局法王杀手 · 丰富国际赛履历",
        demands = "寻求长期三年核心顶薪合约",
        signed = false
    },
    {
        id = "fa_meiko",
        name = "Meiko (田野/大满贯传奇)",
        role = "SUP",
        power = 95,
        asking_salary = 16000,
        base_bid = 320000,
        current_bid = 320000,
        leading_team = "自由人球市",
        traits = "大满贯总指挥 · 严谨开团纪律 · 稳重军心",
        demands = "希望带领年轻新秀夺冠",
        signed = false
    }
}

-- 竞争对手俱乐部报价偏好与购买力
TransferWindow.RIVAL_TEAMS = {
    { id = "t1",  name = "T1",  budget = 1200000, target_roles = { "MID", "TOP", "SUP" }, aggressiveness = 0.85 },
    { id = "blg", name = "BLG", budget = 1500000, target_roles = { "TOP", "JUG", "ADC" }, aggressiveness = 0.90 },
    { id = "gen", name = "GEN", budget = 1350000, target_roles = { "MID", "JUG", "SUP" }, aggressiveness = 0.88 },
    { id = "hle", name = "HLE", budget = 1600000, target_roles = { "ADC", "MID", "TOP" }, aggressiveness = 0.95 },
    { id = "tes", name = "TES", budget = 1100000, target_roles = { "JUG", "ADC", "SUP" }, aggressiveness = 0.78 },
    { id = "jdg", name = "JDG", budget = 1250000, target_roles = { "ADC", "MID", "JUG" }, aggressiveness = 0.82 }
}

function TransferWindow.new(dynasty_engine)
    local self = setmetatable({}, TransferWindow)
    self.dynasty = dynasty_engine
    self.is_open = false
    self.days_total = 14
    self.days_left = 14
    self.hours_left = 336        -- 14 * 24 小时
    self.transfer_year = 2026
    self.split_source = "SUMMER_SPLIT"
    self.free_agents = {}
    self.trade_logs = {}
    self.player_bids = {}        -- [fa_id] = current_player_bid
    self.rival_rumors = {}

    -- 深度复制自由人池
    for _, fa in ipairs(TransferWindow.FREE_AGENTS_POOL) do
        local copy = {}
        for k, v in pairs(fa) do copy[k] = v end
        table.insert(self.free_agents, copy)
    end

    return self
end

-- 触发开启夏季赛末/冬季转会窗口
function TransferWindow:open(split_name, year)
    self.is_open = true
    self.days_left = 14
    self.hours_left = 336
    self.split_source = split_name or "夏季赛收官"
    self.transfer_year = year or 2026
    self.player_bids = {}
    self.trade_logs = {
        string.format("🔔【冬季全球转会窗口重磅开启】%d 赛季夏季赛大幕落下！各大联赛 14 天压哨竞价倒计时开始！", self.transfer_year)
    }
    self.rival_rumors = {
        "📰【电竞体坛快讯】HLE 资本巨鳄已备妥 160 万美金，誓要在转会窗砸下银河战舰！",
        "📰【LPL 经理人爆料】BLG 正在紧急接触 Bin 与顶级野核，多支战队进入二级战备！"
    }
    return true
end

-- 检查转会窗是否已关闭
function TransferWindow:checkStatus()
    if self.days_left <= 0 or self.hours_left <= 0 then
        self.is_open = false
        self.days_left = 0
        self.hours_left = 0
        table.insert(self.trade_logs, "🔒【转会窗口正式关闭】所有签约合同已锁定！祝各队新赛季武运昌隆！")
        return false, "转会窗已关闭"
    end
    return true, "转会窗开启中"
end

-- 获取紧急倒计时预警级别
function TransferWindow:getUrgency()
    if not self.is_open or self.days_left <= 0 then
        return "CLOSED", "🔴 转会期已结束"
    elseif self.days_left <= 2 then
        return "CRITICAL", string.format("🚨 压哨最后 %d 小时！各大豪门进入疯狂抢人冲刺！", self.hours_left)
    elseif self.days_left <= 5 then
        return "HIGH", string.format("⚡ 白热化交锋期 (剩余 %d 天 / %d 小时)", self.days_left, self.hours_left)
    else
        return "NORMAL", string.format("⏳ 稳步磋商期 (剩余 %d 天 / %d 小时)", self.days_left, self.hours_left)
    end
end

-- 推进时间 (对局/竞价/谈判消耗时间)
function TransferWindow:advanceHours(hours)
    if not self.is_open then return false end
    hours = hours or 24
    self.hours_left = math.max(0, self.hours_left - hours)
    self.days_left = math.ceil(self.hours_left / 24)

    -- 模拟其他战队竞价 AI
    self:simulateRivalBidding(hours)

    if self.hours_left <= 0 then
        self.is_open = false
        table.insert(self.trade_logs, "🔒【转会窗口压哨压轴关闭】传真机截止时间已过，签约大门正式锁死！")
    end
    return true
end

-- 模拟对手豪门 AI 竞价逻辑
function TransferWindow:simulateRivalBidding(hours_passed)
    local trigger_chance = math.min(90, hours_passed * 3.5)
    if math.random(1, 100) > trigger_chance then return end

    -- 随机挑选一个尚未被最终签约的自由人
    local available = {}
    for _, fa in ipairs(self.free_agents) do
        if not fa.signed then table.insert(available, fa) end
    end
    if #available == 0 then return end

    local target_fa = available[math.random(1, #available)]
    local rival = TransferWindow.RIVAL_TEAMS[math.random(1, #TransferWindow.RIVAL_TEAMS)]

    -- 抬价 20,000 ~ 60,000
    local hike = math.random(2, 6) * 10000
    target_fa.current_bid = target_fa.current_bid + hike
    target_fa.leading_team = rival.name

    local rumor = string.format("⚡【豪门出手】%s 刚刚向【%s】抛出重磅报价 $%d！反超当前球市领跑！",
        rival.name, target_fa.name, target_fa.current_bid)
    table.insert(self.trade_logs, rumor)
    table.insert(self.rival_rumors, rumor)
    if #self.rival_rumors > 5 then table.remove(self.rival_rumors, 1) end
end

-- 玩家对自由人进行加价竞标 (Free Agent Bid)
function TransferWindow:bidFreeAgent(fa_id, bid_amount)
    local ok, status = self:checkStatus()
    if not ok then return false, status end

    local target_fa = nil
    for _, fa in ipairs(self.free_agents) do
        if fa.id == fa_id or fa.name == fa_id then
            target_fa = fa
            break
        end
    end
    if not target_fa then return false, "未找到该自由人选手" end
    if target_fa.signed then return false, "该选手已经完成签约锁定" end

    local min_bid = target_fa.current_bid + 15000
    if bid_amount < min_bid then
        return false, string.format("报价过低！当前最高价为 $%d，最低需加价至 $%d", target_fa.current_bid, min_bid)
    end

    if not self.dynasty or self.dynasty.budget < bid_amount then
        local my_budget = self.dynasty and self.dynasty.budget or 0
        return false, string.format("俱乐部转会预算不足！当前预算仅 $%d，出价需 $%d", my_budget, bid_amount)
    end

    -- 成功出价，成为领跑者
    target_fa.current_bid = bid_amount
    target_fa.leading_team = "我方战队 (You)"
    self.player_bids[target_fa.id] = bid_amount

    -- 消耗时间 12 小时
    self:advanceHours(12)

    local msg = string.format("💼【竞价出价成功】你为【%s】开出了 $%d 的领跑报价！消耗 12 小时转会时间！", target_fa.name, bid_amount)
    table.insert(self.trade_logs, msg)
    return true, msg
end

-- 一口价买断签约自由人 (Buyout Instant Sign)
function TransferWindow:instantSignFreeAgent(fa_id)
    local ok, status = self:checkStatus()
    if not ok then return false, status end

    local target_fa = nil
    for _, fa in ipairs(self.free_agents) do
        if fa.id == fa_id or fa.name == fa_id then
            target_fa = fa
            break
        end
    end
    if not target_fa then return false, "未找到该自由人选手" end
    if target_fa.signed then return false, "该选手已经完成签约锁定" end

    -- 一口价为当前竞价的 1.15 倍或 base_bid 的 1.25 倍
    local buyout_price = math.max(math.floor(target_fa.current_bid * 1.15), math.floor(target_fa.base_bid * 1.25))
    if not self.dynasty or self.dynasty.budget < buyout_price then
        return false, string.format("预算不足买断！需要一次性买断资金 $%d，当前仅有 $%d", buyout_price, self.dynasty and self.dynasty.budget or 0)
    end

    -- 扣款并签约入队
    self.dynasty.budget = self.dynasty.budget - buyout_price
    target_fa.signed = true
    target_fa.leading_team = "我方战队 (签约完成)"

    -- 替换己方首发阵容中同位置选手
    local replaced_player = nil
    for i, p in ipairs(self.dynasty.roster or {}) do
        if p.role == target_fa.role then
            replaced_player = p
            self.dynasty.roster[i] = {
                name = target_fa.name,
                role = target_fa.role,
                power = target_fa.power,
                salary = target_fa.asking_salary,
                value = buyout_price
            }
            break
        end
    end

    -- 增加粉丝狂热度与转会新闻
    self.dynasty.fan_hype = (self.dynasty.fan_hype or 10000) + 8000
    self:advanceHours(18)

    local rep_name = replaced_player and replaced_player.name or "旧队员"
    local sign_msg = string.format("🎉【重磅官宣达成】耗资 $%d 顶级买断【%s】(战力 %d)！替换原首发【%s】！俱乐部粉丝狂欢 +8,000 Hype！",
        buyout_price, target_fa.name, target_fa.power, rep_name)
    table.insert(self.trade_logs, sign_msg)
    return true, sign_msg
end

-- 战队间选手交易协商 (Roster Trade Negotiation)
-- offer_role: 己方给出的选手位置 (如 "ADC")
-- target_team_id: 目标俱乐部 id ("blg", "t1", etc.)
-- target_player_name: 想要引进的对方选手名字
-- cash_compensation: 己方追加的现金补贴 ($0 - $500,000)
function TransferWindow:proposeTrade(offer_role, target_team_id, target_player_name, target_player_power, cash_compensation)
    local ok, status = self:checkStatus()
    if not ok then return false, status end

    cash_compensation = cash_compensation or 0
    if not self.dynasty then return false, "俱乐部引擎未就绪" end

    -- 寻找己方提出的选手
    local my_player_idx = nil
    local my_player = nil
    for idx, p in ipairs(self.dynasty.roster or {}) do
        if p.role == offer_role or p.name == offer_role then
            my_player_idx = idx
            my_player = p
            break
        end
    end
    if not my_player then
        return false, string.format("己方阵容中未找到位置为 %s 的选手", offer_role)
    end

    if self.dynasty.budget < cash_compensation then
        return false, string.format("现金补偿超额！你承诺补贴 $%d，但预算仅 $%d", cash_compensation, self.dynasty.budget)
    end

    -- 评估战力差与交易合理性
    local target_pwr = target_player_power or (my_player.power + 4)
    local power_gap = target_pwr - my_player.power
    local required_cash = math.max(0, power_gap * 40000)

    -- 交易判定：现金是否足以弥补战力差
    local accept_threshold = required_cash * 0.90
    local negotiation_success = (cash_compensation >= accept_threshold)

    -- 消耗时间 24 小时进行法务合同审核与双方总经理沟通
    self:advanceHours(24)

    if negotiation_success then
        -- 扣除现金，互换阵容
        self.dynasty.budget = self.dynasty.budget - cash_compensation
        self.dynasty.roster[my_player_idx] = {
            name = target_player_name,
            role = my_player.role,
            power = target_pwr,
            salary = math.floor(my_player.salary * 1.3),
            value = my_player.value + cash_compensation
        }
        self.dynasty.fan_hype = (self.dynasty.fan_hype or 10000) + 5000

        local trade_msg = string.format("🤝【战队交易达成】双方俱乐部达成一致！送出【%s】+ $%d 现金补贴，成功迎回王牌【%s】(战力 %d)！",
            my_player.name, cash_compensation, target_player_name, target_pwr)
        table.insert(self.trade_logs, trade_msg)
        return true, trade_msg
    else
        local reject_msg = string.format("❌【交易提案遭拒】对方经理表示：【%s】战力 (%d) 明显高于【%s】(%d)，当前追加补贴 $%d 未达估值底线 (需约 $%d)！",
            target_player_name, target_pwr, my_player.name, my_player.power, cash_compensation, math.floor(required_cash))
        table.insert(self.trade_logs, reject_msg)
        return false, reject_msg
    end
end

-- 快速跳过当前转会日，推进转会截止日
function TransferWindow:skipDays(days)
    days = days or 1
    self:advanceHours(days * 24)
    local msg = string.format("⏩ 转会窗口快进 %d 天，距离关窗仅剩 %d 天 (%d 小时)！", days, self.days_left, self.hours_left)
    table.insert(self.trade_logs, msg)
    return true, msg
end

-- 终端界面渲染 (TapTap Make 移动竖屏风格)
function TransferWindow:renderCLI()
    local urgency_code, urgency_text = self:getUrgency()
    print("\n================ ❄️ 休赛期转会窗口与自由人球市 (OFF-SEASON TRANSFER) ================")
    print(string.format("【所属赛季】%d %s | 【窗口状态】%s", self.transfer_year, self.split_source, urgency_text))
    print(string.format("【剩余时间】%d 天 %d 小时 (总计 336 小时) | 【俱乐部预算】$%d",
        self.days_left, self.hours_left % 24, self.dynasty and self.dynasty.budget or 0))
    print("--------------------------------------------------------------------------------------")
    print("🔥【球市自由人名单 (Free Agents)】:")
    for idx, fa in ipairs(self.free_agents) do
        local status_str = fa.signed and "[已签约锁定]" or string.format("[最高出价: $%d | 领跑: %s]", fa.current_bid, fa.leading_team)
        print(string.format("  %d. [%s] %s (战力 %d) - 薪水: $%d/月 %s",
            idx, fa.role, fa.name, fa.power, fa.asking_salary, status_str))
        print(string.format("     特质: %s | 诉求: %s", fa.traits, fa.demands))
    end
    print("--------------------------------------------------------------------------------------")
    print("📰【转会窗一线流言速递 (Transfer Rumors)】:")
    for _, r in ipairs(self.rival_rumors) do
        print("  " .. r)
    end
    print("--------------------------------------------------------------------------------------")
    print("📜【近期转会与签约动态 (Transfer Logs)】:")
    local start_idx = math.max(1, #self.trade_logs - 4)
    for i = start_idx, #self.trade_logs do
        print("  " .. self.trade_logs[i])
    end
    print("======================================================================================\n")
end

return TransferWindow
