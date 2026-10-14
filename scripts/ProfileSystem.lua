local CompanyState = require("CompanyState")

local ProfileSystem = {}

ProfileSystem.ENDINGS = {
    { id = "champion", title = "冠军之路", desc = "捧起东冠联赛冠军奖杯，获得世界赛资格。", hint = "常规赛进入前四并赢下季后赛" },
    { id = "finished", title = "赛季落幕", desc = "未能夺冠，但俱乐部延续经营，新赛季再战。", hint = "完整打完一个赛季" },
    { id = "bankrupt", title = "资本之殇", desc = "现金流断裂，公司停止运营，一切重来。", hint = "现金流跌破 -50万" },
    { id = "fired", title = "黯然下课", desc = "连续未达董事会 KPI，你被解雇出局。", hint = "教练期连续赛季目标不达标，或战绩/估值跌破红线" },
    { id = "qualifier_failed", title = "草根梦碎", desc = "城市赛预选赛未能出线，网吧队的征途止步于此。", hint = "以网吧队开局并在预选赛中排名垫底" },
    { id = "valuation", title = "商业帝国", desc = "公司估值突破 ¥6000万，资本市场的明星。", hint = "持续提升战绩、粉丝与资产" },
    { id = "fans", title = "粉丝之城", desc = "俱乐部粉丝突破 30 万，成为区域人气之王。", hint = "赢比赛、办活动、签赞助" },
    { id = "world_champion", title = "世界之巅", desc = "捧起世界冠军奖杯，登顶全球赛场。", hint = "夺得东冠联赛冠军后，在世界赛一路夺冠" },
}

ProfileSystem.ENDINGS_ORDER = { "champion", "finished", "bankrupt", "fired", "qualifier_failed", "valuation", "fans", "world_champion" }

ProfileSystem.DYNASTY_MILESTONES = { 3, 5, 10 }
ProfileSystem.VALUATION_MILESTONES = { 1000, 3000, 6000 }
ProfileSystem.HALL_OF_FAME_CAP = 30

function ProfileSystem.IsUnlocked(state, endingId)
    state = CompanyState.Ensure(state)
    return state.profile.endings[endingId] == true
end

function ProfileSystem.GetStats(state)
    state = CompanyState.Ensure(state)
    local unlocked = 0
    for _, id in ipairs(ProfileSystem.ENDINGS_ORDER) do
        if state.profile.endings[id] then unlocked = unlocked + 1 end
    end
    return {
        endings = state.profile.endings,
        unlockedCount = unlocked,
        totalCount = #ProfileSystem.ENDINGS,
        seasons = state.profile.seasons,
        championships = state.profile.championships,
        bestValuation = state.profile.bestValuation,
        peakFans = state.profile.peakFans,
        honors = #(state.profile.hallOfFame and state.profile.hallOfFame.entries or {}),
    }
end

function ProfileSystem.RecordEnding(state, endingId)
    state = CompanyState.Ensure(state)
    if not state.profile.endings[endingId] then
        state.profile.endings[endingId] = true
        CompanyState.RecordTimeline(state, "图鉴解锁",
            "达成结局「" .. tostring(ProfileSystem.GetEndingTitle(endingId)) .. "」！")
    end
    return state
end

function ProfileSystem.GetEndingTitle(endingId)
    for _, ending in ipairs(ProfileSystem.ENDINGS) do
        if ending.id == endingId then return ending.title end
    end
    return endingId
end

function ProfileSystem.UpdatePeaks(state)
    state = CompanyState.Ensure(state)
    state.profile.bestValuation = math.max(tonumber(state.profile.bestValuation) or 0, tonumber(state.finance.valuation) or 0)
    state.profile.peakFans = math.max(tonumber(state.profile.peakFans) or 0, tonumber(state.company.fans) or 0)
    if state.profile.bestValuation >= 6000 then
        ProfileSystem.RecordEnding(state, "valuation")
    end
    if state.profile.peakFans >= 300000 then
        ProfileSystem.RecordEnding(state, "fans")
    end
    ProfileSystem.CheckValuationMilestones(state)
    return state
end

function ProfileSystem.InsertHonor(state, entry)
    state = CompanyState.Ensure(state)
    table.insert(state.profile.hallOfFame.entries, 1, entry)
    while #state.profile.hallOfFame.entries > ProfileSystem.HALL_OF_FAME_CAP do
        table.remove(state.profile.hallOfFame.entries)
    end
    return state
end

function ProfileSystem.CheckDynasty(state)
    state = CompanyState.Ensure(state)
    local championships = tonumber(state.profile.championships) or 0
    local labels = { [3] = "三冠王朝", [5] = "五冠王朝", [10] = "十冠王朝" }
    for _, milestone in ipairs(ProfileSystem.DYNASTY_MILESTONES) do
        if championships >= milestone and not state.profile.hallOfFame.dynastyUnlocked[milestone] then
            state.profile.hallOfFame.dynastyUnlocked[milestone] = true
            ProfileSystem.InsertHonor(state, {
                type = "dynasty",
                title = labels[milestone],
                detail = "累计捧起 " .. tostring(championships) .. " 座联赛冠军奖杯，王朝屹立不倒",
                at = tonumber(state.profile.seasons) or 0,
            })
        end
    end
    return state
end

function ProfileSystem.CheckValuationMilestones(state)
    state = CompanyState.Ensure(state)
    local best = tonumber(state.profile.bestValuation) or 0
    for _, milestone in ipairs(ProfileSystem.VALUATION_MILESTONES) do
        if best >= milestone and not state.profile.hallOfFame.valuationUnlocked[milestone] then
            state.profile.hallOfFame.valuationUnlocked[milestone] = true
            ProfileSystem.InsertHonor(state, {
                type = "valuation",
                title = "估值里程碑 · ¥" .. tostring(milestone) .. "万",
                detail = "公司估值首次突破 ¥" .. tostring(milestone) .. "万，资本市场的新贵",
                at = tonumber(state.profile.seasons) or 0,
            })
        end
    end
    return state
end

function ProfileSystem.RecordWorldChampion(state)
    state = CompanyState.Ensure(state)
    state.profile.hallOfFame.worldChampionships = tonumber(state.profile.hallOfFame.worldChampionships) + 1
    local count = state.profile.hallOfFame.worldChampionships
    local season = tonumber(state.company.seasons) or 0
    ProfileSystem.InsertHonor(state, {
        type = "world_champion",
        title = count == 1 and "首次世界之巅" or ("世界之巅 · 第 " .. tostring(count) .. " 冠"),
        detail = state.company.name .. " · 第 " .. tostring(season) .. " 个赛季捧起世界冠军奖杯",
        at = season,
    })
    return state
end

function ProfileSystem.MarkSeasonComplete(state, champion)
    state = CompanyState.Ensure(state)
    state.profile.seasons = tonumber(state.profile.seasons) + 1
    if champion then
        state.profile.championships = tonumber(state.profile.championships) + 1
        ProfileSystem.RecordEnding(state, "champion")
        ProfileSystem.CheckDynasty(state)
    else
        ProfileSystem.RecordEnding(state, "finished")
    end
    ProfileSystem.UpdatePeaks(state)
    return state
end

function ProfileSystem.MarkGlobalChampion(state)
    state = CompanyState.Ensure(state)
    ProfileSystem.RecordEnding(state, "world_champion")
    ProfileSystem.RecordWorldChampion(state)
    ProfileSystem.UpdatePeaks(state)
    return state
end

function ProfileSystem.MarkBankrupt(state)
    state = CompanyState.Ensure(state)
    state.profile.seasons = tonumber(state.profile.seasons) + 1
    ProfileSystem.RecordEnding(state, "bankrupt")
    ProfileSystem.UpdatePeaks(state)
    return state
end

function ProfileSystem.MarkEliminated(state)
    state = CompanyState.Ensure(state)
    state.profile.seasons = tonumber(state.profile.seasons) + 1
    ProfileSystem.RecordEnding(state, "qualifier_failed")
    ProfileSystem.UpdatePeaks(state)
    return state
end

function ProfileSystem.MarkFired(state)
    state = CompanyState.Ensure(state)
    ProfileSystem.RecordEnding(state, "fired")
    ProfileSystem.UpdatePeaks(state)
    return state
end

return ProfileSystem
