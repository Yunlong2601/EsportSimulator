--[[
    ============================================================================
    TAPTAP MAKE: DYNASTY & ORG TYCOON SYSTEM (王朝经营与战队经理引擎)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 王朝战队首发五人组阵容维护 (Top, Jug, Mid, Adc, Sup)
      2. 基地训练设施建设与升级 (Facilities Upgrade)
      3. 商业品牌冠名赞助签署 (Enterprise Sponsors)
      4. 夏季赛收官与冬季转会期系统联动 (Off-Season Transfer Window Integration)
      5. 全球自由人竞标 (FA Bidding) 与 跨队选手交易谈判 (Roster Trades)
--]]

local ok, TransferWindow = pcall(require, "transfer_window")
if not ok or type(TransferWindow) ~= "table" then
    TransferWindow = require("lua.transfer_window")
end

local ok2, CommunityRelations = pcall(require, "community_relations")
if not ok2 or type(CommunityRelations) ~= "table" then
    CommunityRelations = require("lua.community_relations")
end

local Dynasty = {}
Dynasty.__index = Dynasty

function Dynasty.new()
    local self = setmetatable({}, Dynasty)

    self.budget = 240000
    self.fan_hype = 14500
    self.world_rank = 8
    self.season_year = 2026
    self.season_wins = 12
    self.season_losses = 4

    self.roster = {
        { name = "Vortex", role = "TOP", power = 89, salary = 8500, value = 120000 },
        { name = "Phantom", role = "JUG", power = 91, salary = 9200, value = 135000 },
        { name = "Prodigy (You)", role = "MID", power = 96, salary = 15000, value = 280000 },
        { name = "SniperAce", role = "ADC", power = 93, salary = 11000, value = 190000 },
        { name = "Oracle", role = "SUP", power = 90, salary = 9500, value = 140000 }
    }

    self.facilities = {
        { name = "Gaming House Scrim Lab", tier = 2, max = 4, cost = 45000, effect = "+10% Macro Growth" },
        { name = "AI Analytics Suite",      tier = 2, max = 4, cost = 65000, effect = "+15% Draft Advantage" },
        { name = "Chef & Wellness Gym",     tier = 1, max = 3, cost = 35000, effect = "+20 Morale / Anti-Fatigue" },
        { name = "Broadcast Media Studio",  tier = 0, max = 3, cost = 120000, effect = "+40% Fan Hype" }
    }

    self.sponsors = {
        { name = "HyperGear Audio", payout = 4500, bonus = 25000, active = true },
        { name = "Apex Energy Drinks", payout = 9000, bonus = 60000, active = false },
        { name = "Omega Gaming Chairs", payout = 7000, bonus = 40000, active = false },
        { name = "Aether Automotive", payout = 22000, bonus = 180000, active = false }
    }

    self.scouts = {
        { name = "Zephyr (KR)", role = "TOP", power = 94, salary = 14000, cost = 250000 },
        { name = "ShadowFang (CN)", role = "JUG", power = 96, salary = 16500, cost = 310000 },
        { name = "Eclipse (KR)", role = "MID", power = 97, salary = 22000, cost = 450000 },
        { name = "HyperGuns (EU)", role = "ADC", power = 95, salary = 17000, cost = 320000 }
    }

    -- 挂载转会窗子系统
    self.transfer_window = TransferWindow.new(self)

    -- 挂载社区公关与粉丝运营子系统
    self.community = CommunityRelations.new()

    return self
end

function Dynasty:getTeamPower()
    local total = 0
    for _, p in ipairs(self.roster) do
        total = total + p.power
    end
    return math.floor(total / #self.roster)
end

function Dynasty:upgradeFacility(index)
    local fac = self.facilities[index]
    if not fac then return false, "Invalid facility" end
    if fac.tier >= fac.max then return false, "Already max tier" end
    if self.budget < fac.cost then return false, "Insufficient funds" end

    self.budget = self.budget - fac.cost
    fac.tier = fac.tier + 1
    fac.cost = math.floor(fac.cost * 1.5)
    self.fan_hype = self.fan_hype + 2500
    return true, "Upgraded " .. fac.name
end

function Dynasty:signSponsor(index)
    local sp = self.sponsors[index]
    if not sp then return false, "Invalid sponsor" end
    if sp.active then return false, "Already signed" end

    sp.active = true
    -- 结合粉丝倍率进行签约金提振加成
    local boosted_bonus, bonus_extra = self.community:calculateSponsoredPayout(sp.bonus)
    self.budget = self.budget + boosted_bonus
    self.fan_hype = self.fan_hype + 1500
    return true, string.format("成功签约商业品牌【%s】！基础签约金 $%d，获粉丝倍率加成 +$%d，实收金库 +$%d！",
        sp.name, sp.bonus, bonus_extra, boosted_bonus)
end

-- 获取每周所有激活赞助商的粉丝倍率加成周薪收益
function Dynasty:getWeeklySponsorPayout()
    local total_base = 0
    for _, sp in ipairs(self.sponsors) do
        if sp.active then
            total_base = total_base + sp.payout
        end
    end
    local boosted_total, bonus_diff = self.community:calculateSponsoredPayout(total_base)
    return boosted_total, bonus_diff, total_base
end

-- 发起公关营销活动
function Dynasty:runCommunityCampaign(campaign_id)
    return self.community:executeCampaign(campaign_id, self, "DYNASTY")
end

-- 终端界面渲染公关面板
function Dynasty:renderCommunityRelations()
    self.community:renderCLI()
end

function Dynasty:signScout(scout_index)
    local scout = self.scouts[scout_index]
    if not scout then return false, "Invalid scout" end
    if self.budget < scout.cost then return false, "Insufficient funds" end

    self.budget = self.budget - scout.cost
    -- Replace player in roster with same role
    for i, p in ipairs(self.roster) do
        if p.role == scout.role then
            self.roster[i] = {
                name = scout.name,
                role = scout.role,
                power = scout.power,
                salary = scout.salary,
                value = scout.cost
            }
            break
        end
    end
    self.fan_hype = self.fan_hype + 4000
    return true, "Transferred " .. scout.name .. " into starting roster!"
end

-- ============================================================================
-- OFF-SEASON TRANSFER WINDOW DELEGATES (转会窗接口代理)
-- ============================================================================

-- 手动或赛季事件驱动开启转会窗 (例如夏季赛结束时触发)
function Dynasty:openTransferWindow(split_name, year)
    split_name = split_name or "夏季赛收官转会期"
    year = year or self.season_year
    local ok = self.transfer_window:open(split_name, year)
    return ok
end

-- 自由人出价
function Dynasty:bidFreeAgent(fa_id, bid_amount)
    return self.transfer_window:bidFreeAgent(fa_id, bid_amount)
end

-- 自由人一口价买断
function Dynasty:instantSignFreeAgent(fa_id)
    return self.transfer_window:instantSignFreeAgent(fa_id)
end

-- 跨俱乐部交易选手
function Dynasty:tradePlayer(my_player_role, target_team_id, target_player_name, target_player_power, cash_compensation)
    return self.transfer_window:proposeTrade(my_player_role, target_team_id, target_player_name, target_player_power, cash_compensation)
end

-- 快进转会天数
function Dynasty:advanceTransferDays(days)
    return self.transfer_window:skipDays(days)
end

-- 终端界面渲染转会窗
function Dynasty:renderTransferWindow()
    self.transfer_window:renderCLI()
end

-- 赛季周期监测：在夏季赛结束 (第19周后) 或进入冬季休赛期 (第25周) 自动触发
function Dynasty:checkSeasonTransferTrigger(current_week, current_split_id)
    if not self.transfer_window.is_open then
        if current_split_id == "OFF_SEASON" or current_week == 19 or current_week == 25 then
            self:openTransferWindow("夏季赛收官大狂欢", self.season_year)
            return true, "夏季赛已落下帷幕，休赛期转会窗口已正式激活开启！各大俱乐部已开始紧急哄抢自由人！"
        end
    end
    return false, nil
end

return Dynasty
