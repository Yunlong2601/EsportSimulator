local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local MetaSystem = require("MetaSystem")
local StaffSystem = require("StaffSystem")
local MarketSystem = require("MarketSystem")

local RosterSystem = {}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function RosterSystem.GetPlayerPower(player, metaRole)
    if not player then return 0 end
    local recentForm = tonumber(player.recentForm) or 0
    local MoraleSystem = require("MoraleSystem")
    local base = 0.35 * player.mechanics + 0.3 * player.teamfight + 0.2 * player.laning + 0.15 * player.form + 0.15 * recentForm + MoraleSystem.GetPowerMod(player) + MetaSystem.GetRoleBonus(player, metaRole)
    -- 天赋觉醒加成（P1-6）
    local TalentSystem = require("TalentSystem")
    local talentBonus = TalentSystem.GetTalentBonus(CompanyState.GetState(), player.id)
    return math.floor(base + talentBonus + 0.5)
end

function RosterSystem.GetRosterPlayers(state)
    state = CompanyState.Ensure(state)
    local players = {}
    for role, playerId in pairs(state.roster.players) do
        if playerId == "" then goto continue end
        local player = LeagueCatalog.GetPlayer(playerId)
        if not player then goto continue end
        table.insert(players, {
            role = role,
            player = player,
        })
        ::continue::
    end
    return players
end

-- 替补席选手（bench.slot1 / slot2）
function RosterSystem.GetBenchPlayers(state)
    state = CompanyState.Ensure(state)
    local entries = {}
    for slot, playerId in pairs(state.roster.bench) do
        if playerId and playerId ~= "" then
            local player = LeagueCatalog.GetPlayer(playerId)
            if player then
                table.insert(entries, { slot = slot, player = player })
            else
                state.roster.bench[slot] = ""
            end
        end
    end
    return entries
end

-- 全部选手：首发 + 替补（训练/状态统一遍历）
function RosterSystem.GetAllPlayers(state)
    state = CompanyState.Ensure(state)
    local entries = RosterSystem.GetRosterPlayers(state)
    for _, entry in ipairs(RosterSystem.GetBenchPlayers(state)) do
        table.insert(entries, { role = entry.player.role, slot = entry.slot, player = entry.player, bench = true })
    end
    return entries
end

function RosterSystem.IsBenched(state, playerId)
    state = CompanyState.Ensure(state)
    for _, pid in pairs(state.roster.bench) do
        if pid == playerId then return true end
    end
    return false
end

function RosterSystem.GetBenchCapacity(state)
    state = CompanyState.Ensure(state)
    return 2
end

-- 替补升入首发：同位置互换，位置空缺则直接提拔
function RosterSystem.SwapToStarter(state, playerId)
    state = CompanyState.Ensure(state)
    local slot = nil
    for s, pid in pairs(state.roster.bench) do
        if pid == playerId then slot = s break end
    end
    if not slot then return false, "该选手不在替补席" end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    local starterId = state.roster.players[player.role]
    if starterId and starterId ~= "" then
        state.roster.bench[slot] = starterId
        local old = LeagueCatalog.GetPlayer(starterId)
        CompanyState.RecordTimeline(state, "阵容轮换",
            player.name .. " 升入首发，" .. (old and old.name or "原首发") .. " 转入替补。")
    else
        state.roster.bench[slot] = ""
        CompanyState.RecordTimeline(state, "阵容轮换", player.name .. " 升入首发。")
    end
    state.roster.players[player.role] = playerId
    return true
end

-- 阵容轮休：把首发降到替补（与某替补互换，无空位则直接降替补），即时降低疲劳
-- P2 完善：让玩家主动降疲劳，把被动 -10 变成可控操作
function RosterSystem.BenchPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    local role = nil
    for r, pid in pairs(state.roster.players) do
        if pid == playerId then role = r break end
    end
    if not role then return false, "该选手不在首发" end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    local MedicalSystem = require("MedicalSystem")
    -- 优先与某个替补互换（满则互换，空则直接降）
    local slot, otherId
    for _, s in ipairs({ "slot1", "slot2" }) do
        if state.roster.bench[s] and state.roster.bench[s] ~= "" then
            slot = s
            otherId = state.roster.bench[s]
            break
        end
    end
    if slot then
        state.roster.bench[slot] = playerId
        state.roster.players[role] = otherId
        CompanyState.RecordTimeline(state, "阵容轮休",
            player.name .. " 本轮轮休降入替补，" .. (LeagueCatalog.GetPlayer(otherId).name) .. " 顶替首发。")
    else
        for _, s in ipairs({ "slot1", "slot2" }) do
            if not state.roster.bench[s] or state.roster.bench[s] == "" then
                state.roster.bench[s] = playerId
                state.roster.players[role] = ""
                CompanyState.RecordTimeline(state, "阵容轮休", player.name .. " 本轮轮休。")
                break
            end
        end
    end
    MedicalSystem.AddFatigue(state, playerId, -15)
    return true
end

-- 自动状态轮换：首发状态低迷（≤55）且同位置替补战力不差（≥ 首发-8）时，下轮顶替
-- P1-③：首发伤停 → 无条件由健康替补顶替（伤病轮换优先于状态轮换）
function RosterSystem.AutoRotate(state)
    state = CompanyState.Ensure(state)
    local metaRole = state.meta and state.meta.role
    local MedicalSystem = require("MedicalSystem")
    for slot, benchId in pairs(state.roster.bench) do
        if benchId and benchId ~= "" then
            local benchPlayer = LeagueCatalog.GetPlayer(benchId)
            if not benchPlayer then
                state.roster.bench[slot] = ""
            else
                local starterRole = benchPlayer.role
                local starterId = state.roster.players[starterRole]
                local starter = starterId and LeagueCatalog.GetPlayer(starterId)
                if starter and MedicalSystem.IsInjured(starter) and not MedicalSystem.IsInjured(benchPlayer) then
                    state.roster.players[starterRole] = benchId
                    state.roster.bench[slot] = starterId
                    CompanyState.RecordTimeline(state, "伤病轮换",
                        starter.name .. " 伤停，由 " .. benchPlayer.name .. " 顶替首发（" .. starter.name .. " 转入替补养伤）。")
                elseif starter and (tonumber(starter.form) or 70) <= 55 then
                    local benchPower = RosterSystem.GetPlayerPower(benchPlayer, metaRole)
                    local starterPower = RosterSystem.GetPlayerPower(starter, metaRole)
                    if benchPower >= starterPower - 8 then
                        state.roster.players[starterRole] = benchId
                        state.roster.bench[slot] = starterId
                        CompanyState.RecordTimeline(state, "状态轮换",
                            benchPlayer.name .. " 状态更佳，顶替 " .. starter.name .. " 进入首发（" .. starter.name .. " 转任替补）。")
                    end
                end
            end
        end
    end
    return state
end

function RosterSystem.GetTeamPower(state)
    state = CompanyState.Ensure(state)
    local metaRole = state.meta and state.meta.role
    local total = 0
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        total = total + RosterSystem.GetPlayerPower(entry.player, metaRole)
    end
    local chemistryBonus = 1 + state.roster.chemistry / 200
    local coachBonus = StaffSystem.GetCoachBonus(state)
    -- 选手生态：关系网 / 心态 对阵容战力的轻量反映（比赛内影响见 MatchSimulator）
    local PlayerEcoSystem = require("PlayerEcoSystem")
    local ecoBonus = PlayerEcoSystem.GetTeamEcoBonus(state)
    return math.floor(total * ecoBonus * chemistryBonus * coachBonus + 0.5)
end

function RosterSystem.GetFreeAgents(state)
    state = CompanyState.Ensure(state)
    local owned = {}
    for _, playerId in pairs(state.roster.players) do owned[playerId] = true end
    for _, playerId in pairs(state.roster.bench) do
        if playerId and playerId ~= "" then owned[playerId] = true end
    end
    local agents = {}
    for _, player in pairs(LeagueCatalog.PLAYERS) do
        if not owned[player.id] then table.insert(agents, player) end
    end
    return agents
end

function RosterSystem.SignPlayer(state, playerId)
    return MarketSystem.SignPlayer(state, playerId, "asking")
end

function RosterSystem.IsOwned(state, playerId)
    state = CompanyState.Ensure(state)
    for _, pid in pairs(state.roster.players) do
        if pid == playerId then return true end
    end
    return false
end

function RosterSystem.GetTransferValue(state, playerId)
    return MarketSystem.GetMarketValue(state, playerId)
end

-- 改名：读取 per-save 覆盖名（避免直接改全局静态 LeagueCatalog.PLAYERS 污染所有存档）
function RosterSystem.GetDisplayName(state, player)
    state = CompanyState.Ensure(state)
    local ov = state.roster.nameOverrides and state.roster.nameOverrides[player.id]
    if ov and ov ~= "" then return ov end
    return player.name
end

function RosterSystem.SetPlayerName(state, playerId, name)
    state = CompanyState.Ensure(state)
    state.roster.nameOverrides = state.roster.nameOverrides or {}
    state.roster.nameOverrides[playerId] = name
end

-- 改名并扣费：每次 ¥10万（cash 单位：万元，故扣 10）
function RosterSystem.RenamePlayer(state, playerId, name)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    name = (name or ""):match("^%s*(.-)%s*$") or ""
    if name == "" then return false, "名字不能为空" end
    if #name > 12 then return false, "名字过长（≤12字）" end
    local cost = 10
    if state.company.cash < cost then return false, "现金不足，需 ¥" .. tostring(cost) .. "万" end
    state.company.cash = state.company.cash - cost
    RosterSystem.SetPlayerName(state, playerId, name)
    CompanyState.RecordTimeline(state, "选手改名", player.name .. " 更名为 " .. name .. "，花费 ¥" .. tostring(cost) .. "万。")
    return true, cost
end

function RosterSystem.RenewContract(state, playerId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if not RosterSystem.IsOwned(state, playerId) then return false, "该选手不在阵中" end
    if MarketSystem.IsLoaned(state, playerId) then return false, "租借中的选手无法续约" end
    if (state.roster.contracts[playerId] or 0) >= 3 then return false, "合同已是最长年限" end
    local yearsLeft = tonumber(state.roster.contracts[playerId]) or LeagueCatalog.GetContractYears(playerId)
    if yearsLeft > 1 then return false, "合同剩余 " .. tostring(yearsLeft) .. " 年——最后一年才开放续约窗口" end
    local MoraleSystem = require("MoraleSystem")
    if not MoraleSystem.WantsRenew(player) then
        return false, player.name .. " 对现状不满，拒绝谈续约——先通过谈话/胜利提振士气"
    end
    local cost = MoraleSystem.GetRenewCost(state, player)
    -- 选手生态：野心高续约更贵、忠诚高更便宜
    local PlayerEcoSystem = require("PlayerEcoSystem")
    cost = math.floor(cost * PlayerEcoSystem.GetRenewalFactor(state, playerId) + 0.5)
    if state.company.cash < cost then return false, "现金不足，无法完成续约" end
    state.company.cash = state.company.cash - cost
    state.roster.contracts[playerId] = 3
    CompanyState.RecordTimeline(state, "选手续约", player.name .. " 续约至 3 年，合同稳定。")
    return true, cost
end

function RosterSystem.SellPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if not MarketSystem.IsTransferWindow(state) then return false, "转会窗已关闭：休市期无法出售，可外租或等待开窗" end
    if MarketSystem.IsLoaned(state, playerId) then return false, "租借中的选手无法出售" end
    local role = nil
    for r, pid in pairs(state.roster.players) do
        if pid == playerId then role = r end
    end
    if not role then return false, "该选手不在阵中" end
    local fee = MarketSystem.GetQuickSaleValue(state, playerId)
    state.company.cash = state.company.cash + fee
    MarketSystem.AddTransferIncome(state, fee)
    state.roster.players[role] = ""
    state.roster.contracts[playerId] = nil
    state.roster.chemistry = math.max(0, state.roster.chemistry - 5)
    state.market.listed[playerId] = nil
    state.roster.buyouts[playerId] = nil
    state.roster.desire[playerId] = nil
    CompanyState.RecordTimeline(state, "快速套现", player.name .. " 以 ¥" .. tostring(fee) .. "万 快速转会离队，阵容出现空缺。")
    return true, fee
end

function RosterSystem.Train(state)
    state = CompanyState.Ensure(state)
    local cost = 15
    if state.company.cash < cost then return false, "现金不足，无法支付训练开支" end
    state.company.cash = state.company.cash - cost
    local formGain = StaffSystem.GetTrainFormGain(state)
    local statGain = StaffSystem.GetTrainStatGain(state)
    for _, entry in ipairs(RosterSystem.GetAllPlayers(state)) do
        local player = entry.player
        player.form = clamp(player.form + formGain, 0, 100)
        player.recentForm = clamp((tonumber(player.recentForm) or 0) + 1, -20, 20)
        -- 属性成长隔周生效；按生涯阶段修正收益并受年龄上限约束（新秀快、暮年慢）
        if (state.company.week or 1) % 2 == 1 then
            local CareerSystem = require("CareerSystem")
            local careerGain = math.max(0, math.floor(statGain * CareerSystem.GetTrainingModifier(player) + 0.5))
            local cap = CareerSystem.GetAttributeCap(player)
            -- 只在低于年龄上限时成长，绝不削减已有属性
            local mech, team, lane = tonumber(player.mechanics) or 50, tonumber(player.teamfight) or 50, tonumber(player.laning) or 50
            if mech < cap then player.mechanics = math.min(cap, mech + careerGain) end
            if team < cap then player.teamfight = math.min(cap, team + careerGain) end
            if lane < cap then player.laning = math.min(cap, lane + careerGain) end
        end
    end
    state.roster.chemistry = clamp(state.roster.chemistry + 2, 0, 100)
    state.roster.trainedThisWeek = true
    CompanyState.RecordTimeline(state, "战队训练",
        "教练团队组织专项训练，全员状态提升，配合更加默契。")
    return true
end

-- 比赛结束后更新一线队近期状态：胜负波动 + 向平稳回归，MVP 额外 +1
function RosterSystem.UpdatePlayerForms(state, won, mvpId)
    state = CompanyState.Ensure(state)
    local delta = won and math.random(1, 3) or math.random(-3, -1)
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local player = entry.player
        local rf = tonumber(player.recentForm) or 0
        if rf > 0 then
            rf = rf - 1
        elseif rf < 0 then
            rf = rf + 1
        end
        rf = clamp(rf + delta + (player.id == mvpId and 1 or 0), -20, 20)
        player.recentForm = rf
    end
    -- 替补未上场：近期状态向平稳回归，保持出战欲望
    for _, entry in ipairs(RosterSystem.GetBenchPlayers(state)) do
        local player = entry.player
        local rf = tonumber(player.recentForm) or 0
        if rf > 0 then
            rf = rf - 1
        elseif rf < 0 then
            rf = rf + 1
        end
        player.recentForm = clamp(rf, -20, 20)
    end
    return state
end

-- 近期状态描述（UI 层根据 mood 映射颜色）
function RosterSystem.GetFormState(player)
    local rf = tonumber(player and player.recentForm) or 0
    if rf >= 6 then return " 火热", rf, "hot" end
    if rf <= -6 then return " 低迷", rf, "cold" end
    return "平稳", rf, "flat"
end

function RosterSystem.UpgradeCoach(state)
    return StaffSystem.UpgradeStaff(state, "coach")
end

return RosterSystem
