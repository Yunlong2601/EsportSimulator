local LegacyLore = {}
LegacyLore.__index = LegacyLore

LegacyLore.CHRONICLES = {
    { id = "2016_semi", title = "神魔大战世纪鏖战 (SKT vs ROX)", min_gen = 1, score = "3 - 2", mvp = "Faker" },
    { id = "2018_worlds", title = "仁川登顶金色之雨 (iG vs FNC)", min_gen = 1, score = "3 - 0", mvp = "TheShy" },
    { id = "2021_rivalry", title = "冰岛长夜决战 (EDG vs DK)", min_gen = 2, score = "3 - 2", mvp = "Scout" },
    { id = "2022_miracle", title = "最后一舞重奏奇迹 (DRX vs T1)", min_gen = 2, score = "3 - 2", mvp = "Deft" },
    { id = "2023_god_faker", title = "大魔王第四座王冠 (T1 vs WBG)", min_gen = 3, score = "3 - 0", mvp = "Zeus" }
}

function LegacyLore.getUnlockedChronicles(prestige_generation)
    local gen = prestige_generation or 1
    local list = {}
    for _, item in ipairs(LegacyLore.CHRONICLES) do
        local unlocked = gen >= item.min_gen
        table.insert(list, {
            id = item.id,
            title = item.title,
            unlocked = unlocked,
            score = item.score,
            mvp = item.mvp
        })
    end
    return list
end

return LegacyLore
