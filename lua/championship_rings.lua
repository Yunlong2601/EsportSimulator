-- scripts/lua/championship_rings.lua
-- Championship Rings Collection & Trophy Hall Showcase
-- Ported from Web React prototype (src/data/championshipRingsData.ts)

local ChampionshipRings = {}
ChampionshipRings.__index = ChampionshipRings

ChampionshipRings.RINGS = {
    {
        id = "ring_s10_origin",
        season = "S10",
        name = "S10 幽蓝起源之戒 (Origin of Azure)",
        title = "首冠破晓 · 逆转宿命",
        year = 2020,
        rarity = "MYTHIC",
        gem_emoji = "💎",
        primary_color = "#00F0FF",
        material = "冷冽纯白钛金基底 · 5.2克拉极光海蓝宝 · 18K精金镶边",
        engraving = "镌刻: 战队首发五虎 · FMVP 决境五杀",
        lore = "初登世界之巅的破晓一战。面对全胜外卡与韩国豪强，落后两局绝地翻盘。这枚戒指凝结了俱乐部历史上首座召唤师之杯的滚烫泪水。",
        stats_buff = {
            clutch_rate_bonus = 12,
            fan_appeal_bonus = 20,
            morale_retention = 10,
            title = "破晓之心 (Awakening Will)",
            desc = "绝境决胜胜率 +12% · 粉丝好评吸附 +20% · 连败士气保留 +10%"
        }
    },
    {
        id = "ring_s11_dragon",
        season = "S11",
        name = "S11 破晓龙魂之戒 (Dawn Dragonfire)",
        title = "不破不立 · 银龙狂啸",
        year = 2021,
        rarity = "IMMORTAL",
        gem_emoji = "🔥",
        primary_color = "#EF4444",
        material = "火山黑曜星陨金 · 6.0克拉赤炼龙晶 · 熔岩微雕龙鳞戒圈",
        engraving = "镌刻: 不破不立 · 鏖战BO5三局大龙坑逆风神抢",
        lore = "在冰岛冰火交融的黑夜，银龙骑士顶着刺骨严寒力克王朝强敌。戒面微雕双龙盘旋，象征永不熄灭的团战意志。",
        stats_buff = {
            clutch_rate_bonus = 15,
            fan_appeal_bonus = 25,
            morale_retention = 15,
            title = "龙魂狂怒 (Dragonfire Heart)",
            desc = "绝境决胜胜率 +15% · 粉丝好评吸附 +25% · 连败士气保留 +15%"
        }
    },
    {
        id = "ring_s12_astral",
        season = "S12",
        name = "S12 弑神星穹之戒 (Deicide Astral)",
        title = "最后一舞 · 登峰造极",
        year = 2022,
        rarity = "IMMORTAL",
        gem_emoji = "🔮",
        primary_color = "#A855F7",
        material = "天青秘银星轨基座 · 6.5克拉星穹深空紫钻 · 碎钻星云浮雕",
        engraving = "镌刻: 重铸荣光 · 孤勇者登峰造极之路",
        lore = "从入围赛一路披荆斩棘杀入决胜夜，书写全球电竞赛事最震撼的黑马童话。戒面星轨寓意每一颗不屈的星辰皆能点亮夜空。",
        stats_buff = {
            clutch_rate_bonus = 18,
            fan_appeal_bonus = 30,
            morale_retention = 18,
            title = "星穹引力 (Astral Resonance)",
            desc = "绝境决胜胜率 +18% · 粉丝好评吸附 +30% · 连败士气保留 +18%"
        }
    },
    {
        id = "ring_s13_sovereign",
        season = "S13",
        name = "S13 诛神不朽至尊戒 (Immortal Sovereign)",
        title = "四冠传奇 · 万神之巅",
        year = 2023,
        rarity = "ETERNAL",
        gem_emoji = "👑",
        primary_color = "#EAB308",
        material = "至臻辉金 · 7.2克拉永恒帝王白钻 · 冠军圣杯微缩浮雕",
        engraving = "镌刻: 神话不灭 · 传奇永不落幕",
        lore = "一夫当关万夫莫开，在主场亿万观众瞩目下以摧枯拉朽之势完成四冠神话加冕。这枚戒指代表着电竞赛事无可撼动的绝对统治力。",
        stats_buff = {
            clutch_rate_bonus = 22,
            fan_appeal_bonus = 35,
            morale_retention = 22,
            title = "帝王加冕 (Sovereign Authority)",
            desc = "绝境决胜胜率 +22% · 粉丝好评吸附 +35% · 连败士气保留 +22%"
        }
    },
    {
        id = "ring_s14_inferno",
        season = "S14",
        name = "S14 碧霄天火之戒 (Azure Inferno)",
        title = "宿命加冕 · 烈焰涅槃",
        year = 2024,
        rarity = "ETERNAL",
        gem_emoji = "✨",
        primary_color = "#10B981",
        material = "流火赤金合金 · 7.8克拉碧霄天火双色碧玺 · 凤凰翎羽雕饰",
        engraving = "镌刻: 浴火重生 · 战队五人名字纳米雕刻",
        lore = "经历人员迭代与赛季磨难后再次浴火重生的至尊加冕之作。戒身内部嵌入比赛决胜时刻的声音音波纳米波纹。",
        stats_buff = {
            clutch_rate_bonus = 25,
            fan_appeal_bonus = 40,
            morale_retention = 25,
            title = "天火涅槃 (Azure Rebirth)",
            desc = "绝境决胜胜率 +25% · 粉丝好评吸附 +40% · 连败士气保留 +25%"
        }
    },
    {
        id = "ring_s15_dynasty",
        season = "S15",
        name = "S15 终焉全满贯神迹之戒 (Crown of Oblivion)",
        title = "王朝大满贯 · 千古一队",
        year = 2025,
        rarity = "ETERNAL",
        gem_emoji = "💍",
        primary_color = "#EC4899",
        material = "星界超导黑金 · 8.8克拉幻彩日冕钻 · 镶嵌四赛区冠军碎片",
        engraving = "镌刻: 千古一队 · 春夏MSI全球总决赛全满贯金身",
        lore = "实现一年内包揽春季赛、MSI、夏季赛、全球总决赛全部桂冠的神迹之戒。凡佩戴者，皆为电子竞技历史丰碑的核心缔造者。",
        stats_buff = {
            clutch_rate_bonus = 30,
            fan_appeal_bonus = 50,
            morale_retention = 30,
            title = "终焉神迹 (Crown of Eternity)",
            desc = "绝境决胜胜率 +30% · 粉丝好评吸附 +50% · 连败士气保留 +30%"
        }
    }
}

function ChampionshipRings.getAllRings()
    return ChampionshipRings.RINGS
end

function ChampionshipRings.getRingById(ring_id)
    if not ring_id then return nil end
    for _, ring in ipairs(ChampionshipRings.RINGS) do
        if ring.id == ring_id then
            return ring
        end
    end
    return nil
end

function ChampionshipRings.getDefaultUnlockedRings(championships_won)
    local won = championships_won or 0
    if won <= 0 then
        return { "ring_s10_origin" }
    end
    local unlocked = {}
    local max_count = math.min(won, #ChampionshipRings.RINGS)
    for i = 1, max_count do
        table.insert(unlocked, ChampionshipRings.RINGS[i].id)
    end
    return unlocked
end

function ChampionshipRings.calculateEquippedRingBuff(ring_id)
    local ring = ChampionshipRings.getRingById(ring_id)
    if not ring then
        return {
            clutch_rate_bonus = 0,
            fan_appeal_bonus = 0,
            morale_retention = 0,
            title = "无佩戴",
            desc = "暂未佩戴冠军神戒"
        }
    end
    return ring.stats_buff
end

return ChampionshipRings
