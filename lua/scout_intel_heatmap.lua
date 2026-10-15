-- ============================================================================
-- SCOUT INTEL HEATMAP & 5-CLUSTER TACTICAL RADAR (战术情报五维聚类雷达与三模对标)
-- Ported from Web: src/components/features/ScoutIntelHeatmap.tsx & opponentScoutingData.ts
-- ============================================================================

local ScoutIntelHeatmap = {}

-- Global Baseline Average for Top 20 Teams
ScoutIntelHeatmap.GLOBAL_LEAGUE_AVERAGE = {
    mechanics = 91,
    macro = 90,
    teamfight = 91,
    vision = 89,
    adaptability = 90
}

-- Team Tactical Clusters Archetypes
ScoutIntelHeatmap.ARCHETYPES = {
    t1 = { mechanics = 97, macro = 99, teamfight = 98, vision = 96, adaptability = 99 },
    blg = { mechanics = 98, macro = 93, teamfight = 97, vision = 91, adaptability = 94 },
    gen = { mechanics = 95, macro = 99, teamfight = 94, vision = 98, adaptability = 93 },
    tes = { mechanics = 97, macro = 91, teamfight = 93, vision = 89, adaptability = 90 },
    g2 = { mechanics = 92, macro = 94, teamfight = 91, vision = 90, adaptability = 97 },
    wbg = { mechanics = 93, macro = 92, teamfight = 95, vision = 90, adaptability = 95 }
}

function ScoutIntelHeatmap.getTeamClusters(teamId, pwr)
    local tId = string.lower(teamId or "t1")
    if ScoutIntelHeatmap.ARCHETYPES[tId] then
        return ScoutIntelHeatmap.ARCHETYPES[tId]
    end
    local base = pwr or 88
    return {
        mechanics = math.min(99, math.max(65, math.floor(base * 0.98))),
        macro = math.min(99, math.max(65, math.floor(base * 0.95))),
        teamfight = math.min(99, math.max(65, math.floor(base * 0.96))),
        vision = math.min(99, math.max(65, math.floor(base * 0.92))),
        adaptability = math.min(99, math.max(65, math.floor(base * 0.93)))
    }
end

function ScoutIntelHeatmap.getUserTeamClusters(playerStats)
    local mech = playerStats and playerStats.mechanics or 75
    local mac = playerStats and playerStats.macro or 72
    local mental = playerStats and playerStats.mental or 70
    return {
        mechanics = math.min(99, math.max(50, mech)),
        macro = math.min(99, math.max(50, mac)),
        teamfight = math.min(99, math.max(50, math.floor(mech * 0.55 + mental * 0.45))),
        vision = math.min(99, math.max(50, math.floor(mac * 0.85 + 10))),
        adaptability = math.min(99, math.max(50, math.floor((mech + mental) / 2)))
    }
end

function ScoutIntelHeatmap.getHeatmapGrade(score)
    if score >= 96 then return "S+ 统治" end
    if score >= 92 then return "S 巅峰" end
    if score >= 88 then return "A+ 强项" end
    if score >= 80 then return "A 均衡" end
    return "B 突破口"
end

function ScoutIntelHeatmap.computeDelta(targetClusters, benchmarkClusters)
    local dims = {
        { key = "mechanics", name = "微操对线" },
        { key = "macro", name = "兵线大局" },
        { key = "teamfight", name = "团战集火" },
        { key = "vision", name = "视野控图" },
        { key = "adaptability", name = "战术韧性" }
    }

    local maxAdv = -999
    local maxAdvName = "微操对线"
    local maxWeak = 999
    local maxWeakName = "视野控图"

    for _, d in ipairs(dims) do
        local diff = targetClusters[d.key] - benchmarkClusters[d.key]
        if diff > maxAdv then
            maxAdv = diff
            maxAdvName = d.name
        end
        if diff < maxWeak then
            maxWeak = diff
            maxWeakName = d.name
        end
    end

    return {
        advantage = { name = maxAdvName, diff = maxAdv },
        weakness = { name = maxWeakName, diff = maxWeak }
    }
end

return ScoutIntelHeatmap
