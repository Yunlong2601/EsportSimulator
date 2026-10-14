--[[
    ============================================================================
    TAPTAP MAKE: CAREER MILESTONES & UNIQUE TITLES MODULE
    ============================================================================
    目标平台: TapTap Make (移动端全中文电竞文字模拟器引擎)
    开发语言: 纯 Lua 5.1 / 5.2 / 5.3 / LuaJIT
    功能:
      - 跟踪玩家职业生涯全周期统计阈值 (天梯积分LP、微操、心态、胜场、连胜、总资产、世界冠军等)
      - 解锁独一无二的专属称号 (单排之神 Solo Queue God, 残局大师 Clutch Artist 等)
      - 提供专属实机属性加成与丰厚奖励
      - 支持在 TapTap Make 控制台与界面佩戴称号
--]]

local CareerMilestones = {}
CareerMilestones.__index = CareerMilestones

function CareerMilestones.new()
    local self = setmetatable({}, CareerMilestones)

    self.active_title = nil -- 当前佩戴称号名称

    self.list = {
        {
            id = "solo_queue_god",
            title = "单排之神",
            title_en = "Solo Queue God",
            category = "业余天梯",
            rarity = "神话限定",
            desc = "以极致对线压制力与个人英雄主义，冲破天梯千分屏障，登顶最强王者之巅。",
            stat_key = "lp",
            target = 1000,
            unit = "LP",
            reward_lp = 100,
            reward_cash = 2000,
            reward_fame = 35,
            bonus_desc = "全模式微操上限+5，单排胜场额外结算 +25% LP",
            unlocked = false,
            claimed = false
        },
        {
            id = "clutch_artist",
            title = "残局大师",
            title_en = "Clutch Artist",
            category = "极限微操",
            rarity = "传奇至尊",
            desc = "在命悬一线的极限时刻毫不手软，屡次上演丝血反杀与绝境锁血的不可思议神迹。",
            stat_key = "reflex_wins",
            target = 3,
            unit = "次极限反杀",
            reward_lp = 60,
            reward_cash = 1200,
            reward_fame = 25,
            bonus_desc = "大心脏抗压值+6，极限微操对决判定时间宽限 60ms",
            unlocked = false,
            claimed = false
        },
        {
            id = "streak_dominator",
            title = "连胜主宰",
            title_en = "Streak Dominator",
            category = "业余天梯",
            rarity = "史诗卓越",
            desc = "无论是深夜天梯还是职业赛场，连续斩落对手，战意如虹无可抵挡。",
            stat_key = "win_streak",
            target = 5,
            unit = "连胜",
            reward_lp = 50,
            reward_cash = 800,
            reward_fame = 20,
            bonus_desc = "连胜状态下每次获胜额外获得 +15 LP 连胜悬赏",
            unlocked = false,
            claimed = false
        },
        {
            id = "apex_mechanics",
            title = "微操天花板",
            title_en = "Apex Mechanics",
            category = "极限微操",
            rarity = "传奇至尊",
            desc = "双手法速与神经反射超越人类极限，走位如行云流水，操作帧数精确到毫秒。",
            stat_key = "mechanics",
            target = 80,
            unit = "点操作",
            reward_lp = 75,
            reward_cash = 1500,
            reward_fame = 25,
            bonus_desc = "对线击杀率常驻提升 12%，招牌英雄战力常驻 +8",
            unlocked = false,
            claimed = false
        },
        {
            id = "mind_of_titanium",
            title = "钢铁大心脏",
            title_en = "Mind of Titanium",
            category = "职业赛场",
            rarity = "史诗卓越",
            desc = "泰山崩于前而色不变。任凭局势陷入绝境，依旧拥有最冷酷的绝杀判断。",
            stat_key = "mental",
            target = 80,
            unit = "点心态",
            reward_lp = 60,
            reward_cash = 1200,
            reward_fame = 20,
            bonus_desc = "落后翻盘概率提升 25%，全局免疫红温负面心态惩罚",
            unlocked = false,
            claimed = false
        },
        {
            id = "centurion_veteran",
            title = "百战不殆",
            title_en = "Centurion Veteran",
            category = "职业赛场",
            rarity = "史诗卓越",
            desc = "历经无数次针锋相对的峡谷搏杀，老兵不死，经验化作最锋利的战刃。",
            stat_key = "wins",
            target = 25,
            unit = "场胜场",
            reward_lp = 50,
            reward_cash = 3000,
            reward_fame = 30,
            bonus_desc = "比赛与训练精力消耗减免 15%，全队士气稳定度提升 20%",
            unlocked = false,
            claimed = false
        },
        {
            id = "hardware_geek",
            title = "神装极客",
            title_en = "Gear Master",
            category = "业余天梯",
            rarity = "精锐突破",
            desc = "用电竞级定制磁轴、轻量化鼠标与电竞显示器武装至牙齿，软硬件合一。",
            stat_key = "gear_count",
            target = 2,
            unit = "件顶级外设",
            reward_lp = 30,
            reward_cash = 600,
            reward_fame = 15,
            bonus_desc = "基础操作与心态各永久 +2 点",
            unlocked = false,
            claimed = false
        },
        {
            id = "tycoon_legend",
            title = "电竞巨鳄",
            title_en = "Tycoon Legend",
            category = "传奇豪门",
            rarity = "传奇至尊",
            desc = "从网吧单排少年到资本巨鳄，不仅在赛场封神，更在商业战场建立金权统治。",
            stat_key = "money",
            target = 100000,
            unit = "美金资产",
            reward_cash = 10000,
            reward_fame = 40,
            bonus_desc = "赞助商周薪分成提升 20%，基地设施升级费用立减 15%",
            unlocked = false,
            claimed = false
        },
        {
            id = "dynasty_founder",
            title = "王朝奠基人",
            title_en = "Dynasty Founder",
            category = "传奇豪门",
            rarity = "神话限定",
            desc = "白手起家创建传奇豪门，斥巨资建立现代化基地，战队声望名动天下。",
            stat_key = "reputation",
            target = 75,
            unit = "俱乐部声望",
            reward_cash = 30000,
            reward_fame = 50,
            bonus_desc = "全球星探抽卡 SSS 级选手招募爆率永久翻倍 (+100%)",
            unlocked = false,
            claimed = false
        },
        {
            id = "worlds_champion",
            title = "世界之巅",
            title_en = "King of Worlds",
            category = "职业赛场",
            rarity = "神话限定",
            desc = "跨越五大赛区，在数千万观众注视下捧起银龙召唤师之杯，成为唯一的电竞传奇。",
            stat_key = "worlds_won",
            target = 1,
            unit = "次世界冠军",
            reward_cash = 100000,
            reward_fame = 100,
            bonus_desc = "全战队首发选手五维属性全满增益，粉丝狂热度暴涨 +50%",
            unlocked = false,
            claimed = false
        }
    }

    return self
end

-- 检查并更新全生涯里程碑进度
function CareerMilestones:evaluate(player, dynasty, stats_extra)
    stats_extra = stats_extra or {}
    local reflex_wins = stats_extra.reflex_wins or 0
    local worlds_won = stats_extra.worlds_won or 0
    local gear_count = stats_extra.gear_count or (#(player.inventory_gear or {}))
    local reputation = dynasty and dynasty.reputation or 50

    local newly_unlocked = {}

    for _, m in ipairs(self.list) do
        local cur_val = 0
        if m.stat_key == "lp" then
            cur_val = player.lp or 0
        elseif m.stat_key == "reflex_wins" then
            cur_val = reflex_wins
        elseif m.stat_key == "win_streak" then
            cur_val = player.win_streak or 0
        elseif m.stat_key == "mechanics" then
            cur_val = player.mechanics or 0
        elseif m.stat_key == "mental" then
            cur_val = player.mental or 0
        elseif m.stat_key == "wins" then
            cur_val = player.wins or 0
        elseif m.stat_key == "gear_count" then
            cur_val = gear_count
        elseif m.stat_key == "money" then
            cur_val = player.money or 0
        elseif m.stat_key == "reputation" then
            cur_val = reputation
        elseif m.stat_key == "worlds_won" then
            cur_val = worlds_won
        end

        m.current_val = cur_val

        if not m.unlocked and cur_val >= m.target then
            m.unlocked = true
            table.insert(newly_unlocked, m)
            if not self.active_title then
                self.active_title = m.title
            end
        end
    end

    return newly_unlocked
end

-- 佩戴或卸下称号
function CareerMilestones:equip(title_name)
    if not title_name or title_name == "" then
        self.active_title = nil
        return true, "已卸下当前佩戴称号。"
    end

    for _, m in ipairs(self.list) do
        if m.title == title_name or m.title_en == title_name or m.id == title_name then
            if not m.unlocked then
                return false, "【权限未达成】称号尚未解锁，请先达成成就阈值！"
            end
            self.active_title = m.title
            return true, "【佩戴成功】当前已生效至尊称号: " .. m.title .. " (" .. m.bonus_desc .. ")"
        end
    end

    return false, "未找到该称号！"
end

-- 领取指定里程碑奖励
function CareerMilestones:claim(milestone_id, player)
    for _, m in ipairs(self.list) do
        if m.id == milestone_id or m.title == milestone_id then
            if not m.unlocked then
                return false, "尚未解锁该里程碑！"
            end
            if m.claimed then
                return false, "该成就奖励已领取，不可重复领取！"
            end

            m.claimed = true
            if m.reward_lp and player then
                player.lp = (player.lp or 0) + m.reward_lp
            end
            if m.reward_cash and player then
                player.money = (player.money or 0) + m.reward_cash
            end
            if m.reward_fame and player then
                player.fame = math.min(100, (player.fame or 0) + m.reward_fame)
            end

            return true, "成功领取称号奖励: " .. m.title .. "！"
        end
    end
    return false, "未找到对应成就！"
end

-- 控制台界面渲染
function CareerMilestones:renderCLI()
    print("================================================================================")
    print(" [TapTap Make 生涯里程碑 · 专属称号殿堂 (Career Milestone Tracker)]")
    print("================================================================================")
    
    if self.active_title then
        print(string.format(" ★ 当前佩戴称号: [👑 %s] (实装特权加成已生效)", self.active_title))
    else
        print(" ★ 当前佩戴称号: [未佩戴] (输入称号名称可立即佩戴)")
    end
    print("--------------------------------------------------------------------------------")

    local unlocked_count = 0
    for _, m in ipairs(self.list) do
        if m.unlocked then unlocked_count = unlocked_count + 1 end
    end
    print(string.format(" 全服荣誉收集进度: %d / %d (%.1f%%)", unlocked_count, #self.list, (unlocked_count / #self.list) * 100))
    print("--------------------------------------------------------------------------------")

    for idx, m in ipairs(self.list) do
        local status_str = "[🔒 未达成]"
        if m.unlocked then
            if m.claimed then
                status_str = "[✓ 已达成|已领奖]"
            else
                status_str = "[🎁 达成待领奖]"
            end
        end

        local cur = m.current_val or 0
        local pct = math.min(100, math.floor((cur / m.target) * 100))
        local equip_mark = (self.active_title == m.title) and " [👑 当前佩戴]" or ""

        print(string.format("[%d] %s (%s) %s%s", idx, m.title, m.title_en, status_str, equip_mark))
        print(string.format("    品质: %s | 分类: %s", m.rarity, m.category))
        print(string.format("    条件: 达到 %s%s (当前进度: %s / %s - %d%%)", tostring(m.target), m.unit, tostring(cur), tostring(m.target), pct))
        print(string.format("    特权: %s", m.bonus_desc))
        print("--------------------------------------------------------------------------------")
    end
end

return CareerMilestones
