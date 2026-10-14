--[[
    ============================================================================
    LEADERBOARD.LUA (TapTap Make / 全球百强传奇名人堂天梯榜)
    ============================================================================
    Tracks and displays the 'Global Top 100' leaderboard for:
      - Highest Career Earnings (最高生涯总奖金 / 俱乐部估值)
      - Summoner's Cup Wins (召唤师奖杯 / S赛世界总冠军奖杯数)
--]]

local Leaderboard = {}
Leaderboard.__index = Leaderboard

-- Pre-seeded historical & contemporary legends in the esports pantheon
local LEGENDARY_DATA = {
    { rank = 1,  name = "Faker (李相赫)",      region = "LCK", team = "T1",       earnings = 18450000, cups = 5, msi = 2, status = "四冠五冠GOAT", tier = "CHALLENGER" },
    { rank = 2,  name = "Ruler (朴载赫)",      region = "LCK", team = "GEN",      earnings = 9800000,  cups = 1, msi = 1, status = "尺帝绝杀ADC", tier = "CHALLENGER" },
    { rank = 3,  name = "Rookie (宋义进)",     region = "LPL", team = "NIP",      earnings = 8650000,  cups = 1, msi = 0, status = "极境两球一姬", tier = "CHALLENGER" },
    { rank = 4,  name = "Scout (李汭燦)",      region = "LPL", team = "LNG",      earnings = 8120000,  cups = 1, msi = 1, status = "冰岛FMVP", tier = "CHALLENGER" },
    { rank = 5,  name = "Viper (朴到贤)",      region = "LCK", team = "HLE",      earnings = 7900000,  cups = 1, msi = 0, status = "通天代射手", tier = "CHALLENGER" },
    { rank = 6,  name = "TheShy (姜承録)",     region = "LPL", team = "WBG",      earnings = 7600000,  cups = 1, msi = 0, status = "天神下凡剑魔", tier = "CHALLENGER" },
    { rank = 7,  name = "JackeyLove (喻文波)", region = "LPL", team = "TES",      earnings = 7450000,  cups = 1, msi = 1, status = "赌上职业闪现", tier = "CHALLENGER" },
    { rank = 8,  name = "Doinb (金泰相)",      region = "LPL", team = "FPX",      earnings = 7100000,  cups = 1, msi = 0, status = "游走泰坦战术大师", tier = "CHALLENGER" },
    { rank = 9,  name = "Meiko (田野)",        region = "LPL", team = "TES",      earnings = 6980000,  cups = 1, msi = 2, status = "大满贯传奇辅助", tier = "CHALLENGER" },
    { rank = 10, name = "Chovy (郑志勋)",      region = "LCK", team = "GEN",      earnings = 6800000,  cups = 0, msi = 1, status = "绝对兵线支配者", tier = "CHALLENGER" },
    { rank = 11, name = "Knight (卓定)",       region = "LPL", team = "BLG",      earnings = 6500000,  cups = 0, msi = 2, status = "左手黄金左臂", tier = "CHALLENGER" },
    { rank = 12, name = "Bin (陈泽彬)",        region = "LPL", team = "BLG",      earnings = 6350000,  cups = 0, msi = 2, status = "五杀剑姬地火", tier = "CHALLENGER" },
    { rank = 13, name = "Uzi (简自豪)",        region = "LPL", team = "RNG 名宿", earnings = 6200000,  cups = 0, msi = 2, status = "狂小狗薇恩信仰", tier = "CHALLENGER" },
    { rank = 14, name = "Xiaohu (李元浩)",     region = "LPL", team = "WBG",      earnings = 6050000,  cups = 0, msi = 3, status = "春之虎帝三冠MSI", tier = "GRANDMASTER" },
    { rank = 15, name = "Canyon (金建敷)",     region = "LCK", team = "GEN",      earnings = 5900000,  cups = 1, msi = 1, status = "北极熊野区主宰", tier = "GRANDMASTER" },
    { rank = 16, name = "BeryL (原乾熙)",      region = "LCK", team = "KT",       earnings = 5820000,  cups = 2, msi = 0, status = "原神发明家指挥", tier = "GRANDMASTER" },
    { rank = 17, name = "ShowMaker (许秀)",    region = "LCK", team = "DK",       earnings = 5750000,  cups = 1, msi = 0, status = "重铸LCK荣光", tier = "GRANDMASTER" },
    { rank = 18, name = "Deft (金赫奎)",       region = "LCK", team = "KT",       earnings = 5600000,  cups = 1, msi = 1, status = "最后一舞驼峰", tier = "GRANDMASTER" },
    { rank = 19, name = "Ming (史森明)",       region = "LPL", team = "RNG",      earnings = 5200000,  cups = 0, msi = 3, status = "开团开饭双绝", tier = "GRANDMASTER" },
    { rank = 20, name = "Kanavi (徐进赫)",     region = "LPL", team = "JDG",      earnings = 5100000,  cups = 0, msi = 1, status = "核弹野核入侵", tier = "GRANDMASTER" }
}

function Leaderboard.new()
    local self = setmetatable({}, Leaderboard)
    self.entries = {}
    self:initEntries()
    return self
end

function Leaderboard:initEntries()
    self.entries = {}
    for i, item in ipairs(LEGENDARY_DATA) do
        table.insert(self.entries, {
            rank = item.rank,
            name = item.name,
            region = item.region,
            team = item.team,
            earnings = item.earnings,
            cups = item.cups,
            msi = item.msi,
            status = item.status,
            tier = item.tier,
            is_player = false
        })
    end

    -- Generate rank 21 to 100 dynamically
    local teams = { "BLG", "TES", "JDG", "WBG", "EDG", "RNG", "T1", "GEN", "DK", "HLE", "G2", "FNC", "FLY", "C9" }
    local roles = { "上单", "打野", "中单", "ADC", "辅助" }
    local names = { "Shadow", "Flame", "Storm", "Frost", "Reaper", "Nova", "Zenith", "Apex", "Ghost", "Titan", "Blaze", "Viper-X", "Echo", "Phantom", "Pulse", "Cyber", "Zero" }

    for r = 21, 100 do
        local team = teams[(r % #teams) + 1]
        local name = names[(r % #names) + 1] .. "_" .. r
        local earnings = math.floor(4800000 * math.pow(0.97, r - 20) + math.random(50000, 150000))
        local cups = (r <= 25 and math.random(0, 1) or 0)
        table.insert(self.entries, {
            rank = r,
            name = name .. " (" .. roles[(r % #roles) + 1] .. ")",
            region = (r % 3 == 0) and "LCK" or ((r % 3 == 1) and "LPL" or "LEC"),
            team = team,
            earnings = earnings,
            cups = cups,
            msi = (cups > 0 and math.random(0, 1) or 0),
            status = "天梯巅峰高分职业",
            tier = (r <= 40) and "MASTER" or "DIAMOND",
            is_player = false
        })
    end
end

-- Refresh / update player standing based on player cash and worlds cups
function Leaderboard:updatePlayer(player_name, player_earnings, player_cups, player_tier)
    -- Remove any old player entry
    for i = #self.entries, 1, -1 do
        if self.entries[i].is_player then
            table.remove(self.entries, i)
        end
    end

    -- Insert current player
    local player_entry = {
        rank = 101,
        name = "★ " .. (player_name or "宿命召唤者") .. " (你)",
        region = "LPL / 全球总决赛",
        team = "自建传奇俱乐部",
        earnings = player_earnings or 0,
        cups = player_cups or 0,
        msi = 0,
        status = (player_cups and player_cups > 0) and "世界新王统治者" or "冲击S赛王座新星",
        tier = player_tier or "CHALLENGER",
        is_player = true
    }
    table.insert(self.entries, player_entry)

    -- Re-sort by earnings (default) or cups
    self:sortByEarnings()
end

function Leaderboard:sortByEarnings()
    table.sort(self.entries, function(a, b)
        if a.earnings == b.earnings then
            return a.cups > b.cups
        end
        return a.earnings > b.earnings
    end)
    for i, e in ipairs(self.entries) do
        e.rank = i
    end
end

function Leaderboard:sortByCups()
    table.sort(self.entries, function(a, b)
        if a.cups == b.cups then
            return a.earnings > b.earnings
        end
        return a.cups > b.cups
    end)
    for i, e in ipairs(self.entries) do
        e.rank = i
    end
end

function Leaderboard:getPlayerRank()
    for _, e in ipairs(self.entries) do
        if e.is_player then
            return e.rank, e
        end
    end
    return 101, nil
end

function Leaderboard:getTop(limit)
    local max_n = math.min(limit or 100, #self.entries)
    local res = {}
    for i = 1, max_n do
        table.insert(res, self.entries[i])
    end
    return res
end

return Leaderboard
