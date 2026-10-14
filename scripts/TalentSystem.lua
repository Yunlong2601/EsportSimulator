-- TalentSystem：选手天赋觉醒（质变点）
-- 每个选手有 1-2 个隐藏天赋槽，属性达标后消耗天赋点解锁被动加成。
-- 天赋点通过青训积分兑换，周限 1 次/人。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local AcademySystem = require("AcademySystem")

local TalentSystem = {}

-- 天赋定义池：按位置分类，每个天赋有前置属性门槛
TalentSystem.TALENTS = {
    -- 上单
    { id = "tank_wall", name = "铜墙铁壁", desc = "前排承伤能力 +10%，团战生存时间延长", role = "top", prereq = { mechanics = 75 }, bonus = { teamfight = 0.10 }, icon = "铁壁" },
    { id = "top_duel", name = "对线压制", desc = "对线期压制力 +8%，补刀优势扩大", role = "top", prereq = { laning = 78 }, bonus = { laning = 0.08 }, icon = "压制" },
    -- 打野
    { id = "jungle_vision", name = "野区掌控", desc = "视野控制 +12%，敌方野区入侵成功率提升", role = "jungle", prereq = { mechanics = 72 }, bonus = { mechanics = 0.12 }, icon = "视野" },
    { id = "jungle_gank", name = "gank 节奏", desc = "前期 gank 成功率 +10%，线上队友受益", role = "jungle", prereq = { teamfight = 70 }, bonus = { teamfight = 0.10 }, icon = "节奏" },
    -- 中单
    { id = "mid_burst", name = "爆发秒杀", desc = "爆发伤害 +12%，对脆皮威胁大幅提升", role = "mid", prereq = { mechanics = 80 }, bonus = { mechanics = 0.12 }, icon = "爆发" },
    { id = "mid_roam", name = "游走支援", desc = "边路支援效率 +10%，全局影响力提升", role = "mid", prereq = { laning = 72 }, bonus = { laning = 0.10 }, icon = "游走" },
    -- 下路
    { id = "adc_kiting", name = "走A 大师", desc = "输出位置优化 +10%，团战存活率提升", role = "adc", prereq = { mechanics = 76 }, bonus = { mechanics = 0.10 }, icon = "走A" },
    { id = "adc_pressure", name = "压制力场", desc = "对线压制力 +8%，敌方下路发育受限", role = "adc", prereq = { laning = 78 }, bonus = { laning = 0.08 }, icon = "强压" },
    -- 辅助
    { id = "sup_vision", name = "视野之眼", desc = "视野覆盖率 +15%，全队防 gank 能力提升", role = "support", prereq = { teamfight = 72 }, bonus = { teamfight = 0.15 }, icon = "视野" },
    { id = "sup_protect", name = "守护天使", desc = "保护能力 +12%，核心输出存活率提升", role = "support", prereq = { mechanics = 70 }, bonus = { mechanics = 0.12 }, icon = "守护" },
    -- 通用
    { id = "clutch", name = "决胜时刻", desc = "关键局（赛点/决胜局）战力 +5%", role = "any", prereq = { form = 75 }, bonus = { form = 0.05 }, icon = "决胜" },
    { id = "leader", name = "领袖气质", desc = "全队士气 +5，队友状态波动降低", role = "any", prereq = { teamfight = 75 }, bonus = { teamfight = 0.05 }, icon = "领袖" },
}

-- 天赋点（Talent Points）：通过青训积分兑换，存储在 state.talents
TalentSystem.TALENT_POINT_COST = 3  -- 每次兑换消耗 3 青训积分
TalentSystem.TALENT_WEEKLY_LIMIT = 1 -- 每人每周限 1 次

-- 获取选手已解锁的天赋
function TalentSystem.GetPlayerTalents(state, playerId)
    if not state then return {} end
    state.talents = state.talents or {}
    return state.talents[playerId] or {}
end

-- 检查选手是否满足天赋前置条件
function TalentSystem.CanUnlock(player, talent)
    if not player or not talent or not talent.prereq then return false end
    for attr, threshold in pairs(talent.prereq) do
        if (tonumber(player[attr]) or 0) < threshold then return false end
    end
    return true
end

-- 获取选手可解锁的天赋列表（前置条件已达标，尚未解锁）
function TalentSystem.GetUnlockableTalents(state, playerId)
    if not state then return {} end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return {} end
    local unlocked = TalentSystem.GetPlayerTalents(state, playerId)
    local unlockable = {}
    for _, talent in ipairs(TalentSystem.TALENTS) do
        if talent.role == player.role or talent.role == "any" then
            local already = false
            for _, tid in ipairs(unlocked) do
                if tid == talent.id then already = true; break end
            end
            if not already and TalentSystem.CanUnlock(player, talent) then
                table.insert(unlockable, talent)
            end
        end
    end
    return unlockable
end

-- 解锁选手天赋：消耗天赋点
function TalentSystem.UnlockTalent(state, playerId, talentId)
    if not state then return false, "state 未初始化" end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    local talent = nil
    for _, t in ipairs(TalentSystem.TALENTS) do
        if t.id == talentId then talent = t; break end
    end
    if not talent then return false, "天赋不存在" end
    if not TalentSystem.CanUnlock(player, talent) then return false, "属性未达标" end
    state.talents = state.talents or {}
    local unlocked = state.talents[playerId] or {}
    for _, tid in ipairs(unlocked) do
        if tid == talentId then return false, "天赋已解锁" end
    end
    -- 检查每周限制
    state.talents.weekly = state.talents.weekly or {}
    state.talents.weekly[playerId] = (state.talents.weekly[playerId] or 0)
    if state.talents.weekly[playerId] >= TalentSystem.TALENT_WEEKLY_LIMIT then
        return false, "本周已达上限（每人每周限 1 次）"
    end
    -- 消耗青训积分
    state.talents.points = (state.talents.points or 0)
    if state.talents.points < TalentSystem.TALENT_POINT_COST then
        return false, "天赋点不足（需要 " .. tostring(TalentSystem.TALENT_POINT_COST) .. " 点）"
    end
    state.talents.points = state.talents.points - TalentSystem.TALENT_POINT_COST
    state.talents.weekly[playerId] = state.talents.weekly[playerId] + 1
    table.insert(unlocked, talentId)
    state.talents[playerId] = unlocked
    local CompanyState = require("CompanyState")
    CompanyState.RecordTimeline(state, "天赋觉醒",
        player.name .. " 觉醒天赋「" .. talent.name .. "」！" .. talent.desc)
    return true
end

-- 兑换天赋点：消耗青训积分
function TalentSystem.ExchangePoints(state, amount)
    if not state then return false, "state 未初始化" end
    state.talents = state.talents or {}
    state.talents.points = (state.talents.points or 0)
    local cost = amount * TalentSystem.TALENT_POINT_COST
    if (state.talents.points or 0) + amount > 99 then return false, "天赋点已达上限" end
    state.talents.points = state.talents.points + amount
    return true, "兑换成功，获得 " .. tostring(amount) .. " 天赋点"
end

-- 周结算：重置每周限制
function TalentSystem.ResetWeekly(state)
    if not state then return end
    if state.talents and state.talents.weekly then
        state.talents.weekly = {}
    end
end

-- 计算选手天赋加成（叠加到战力公式）
function TalentSystem.GetTalentBonus(state, playerId)
    if not state then return 0 end
    local unlocked = TalentSystem.GetPlayerTalents(state, playerId)
    if not unlocked or #unlocked == 0 then return 0 end
    local total = 0
    for _, tid in ipairs(unlocked) do
        for _, talent in ipairs(TalentSystem.TALENTS) do
            if talent.id == tid and talent.bonus then
                -- 取 bonus 中最高的一项作为加成（简化：取第一个数值）
                for _, val in pairs(talent.bonus) do
                    total = total + val
                    break
                end
            end
        end
    end
    return total
end

-- 获取选手天赋加成描述（用于 UI 显示）
function TalentSystem.GetTalentDesc(state, playerId)
    if not state then return nil end
    local unlocked = TalentSystem.GetPlayerTalents(state, playerId)
    if not unlocked or #unlocked == 0 then return nil end
    local parts = {}
    for _, tid in ipairs(unlocked) do
        for _, talent in ipairs(TalentSystem.TALENTS) do
            if talent.id == tid then
                table.insert(parts, talent.icon .. talent.name)
                break
            end
        end
    end
    return table.concat(parts, " · ")
end

return TalentSystem
