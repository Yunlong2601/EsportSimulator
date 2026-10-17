--[[
    ============================================================================
    HALL OF FAME & RETIRED JERSEY GALLERY (传奇名人堂与退役战袍展厅)
    ============================================================================
    Target Platform: TapTap Maker (Pure Lua 5.4)
    Design Philosophy:
      1. 永恒荣誉铭刻：见证电竞历史上不朽传奇，举办退役战袍封神仪式
      2. 战袍展厅：专属号码球衣悬挂穹顶 (例如 #7, #1, #99, #11)
      3. 名宿庇佑特权 (Aura Buffs)：激活名宿意志，赋予战队全维被动加成
    ============================================================================
--]]

local HallOfFame = {}

HallOfFame.DEFAULT_LEGENDS = {
    {
        id = "legend_faker",
        name = "李相赫 (Faker)",
        title = "大魔王 · 不死神话",
        role = "MID",
        years = "2013 - 2025",
        jerseyNumber = "#1",
        signatureChamps = "影流之主 / 诡术妖姬 / 沙漠皇帝",
        goatScore = 99.9,
        trophiesCount = 5,
        careerKDA = "6.8",
        lore = "四冠王三连冠建立王朝，电竞历史唯一的GOAT。只要他在中路，那座山便无人能够逾越。",
        aura = {
            id = "aura_demon_king",
            name = "魔王神威庇佑 (Aura of the Demon King)",
            desc = "全队大赛决胜局心态永不崩溃，关键龙坑争夺胜率 +16%",
            winRateBonus = 16,
            mentalBonus = 10
        }
    },
    {
        id = "legend_uzi",
        name = "简自豪 (Uzi)",
        title = "狂小狗 · 极限走A艺术",
        role = "ADC",
        years = "2013 - 2023",
        jerseyNumber = "#7",
        signatureChamps = "暗夜猎手 (薇恩) / 虚空之女 (卡莎)",
        goatScore = 96.5,
        trophiesCount = 3,
        careerKDA = "7.2",
        lore = "下路对线绝对统治力的代名词，红怒薇恩绝境绕后五杀，载入世界赛史册的传奇射手。",
        aura = {
            id = "aura_ferocious_carry",
            name = "狂暴收割之印 (Mark of the Ferocious Carry)",
            desc = "首发 ADC 残血输出 +22%，第一滴血爆发率加倍",
            winRateBonus = 14,
            mechanicsBonus = 8
        }
    },
    {
        id = "legend_rookie",
        name = "宋义进 (Rookie)",
        title = "仁川奇迹 · 绝对真主",
        role = "MID",
        years = "2014 - 2024",
        jerseyNumber = "#99",
        signatureChamps = "暗黑元首 (辛德拉) / 诡术妖姬",
        goatScore = 95.8,
        trophiesCount = 2,
        careerKDA = "6.4",
        lore = "你永远可以相信宋义进。以绝对压制力击碎对手防线，带领队伍登顶世界之巅斩获首座银龙杯。",
        aura = {
            id = "aura_inchon_miracle",
            name = "仁川极光祝福 (Blessing of Inchon)",
            desc = "对线期击杀率 +15%，中野联动抓人成功率大幅提升",
            winRateBonus = 12,
            mechanicsBonus = 6
        }
    },
    {
        id = "legend_clearlove",
        name = "明凯 (Clearlove)",
        title = "暗凯教父 · 7之意志",
        role = "JUG",
        years = "2012 - 2021",
        jerseyNumber = "#77",
        signatureChamps = "伊芙琳 / 寡妇制造者 / 猪妹",
        goatScore = 93.2,
        trophiesCount = 2,
        careerKDA = "5.9",
        lore = "野区节奏大师与控图教父。当7的意志在屏幕亮起，全世界观众都在为你呐喊。",
        aura = {
            id = "aura_will_of_seven",
            name = "7之意志光环 (Will of 7)",
            desc = "野区控龙率提升至 85%，顺风局滚雪球失误率清零",
            winRateBonus = 12,
            macroBonus = 10
        }
    }
}

function HallOfFame.initState()
    return {
        inductedLegends = {},
        equippedAuraId = "aura_demon_king",
        totalInducted = 0
    }
end

function HallOfFame.getAllLegends(hofState)
    local all = {}
    -- Add default legends
    for _, l in ipairs(HallOfFame.DEFAULT_LEGENDS) do
        table.insert(all, l)
    end
    -- Add inducted player legends
    if hofState and hofState.inductedLegends then
        for _, l in ipairs(hofState.inductedLegends) do
            table.insert(all, l)
        end
    end
    return all
end

function HallOfFame.inductPlayer(hofState, player, trophies, jerseyNumber)
    if not hofState then return false, "No HOF state" end
    jerseyNumber = jerseyNumber or "#10"

    local trophyCnt = 0
    if trophies then
        if trophies.challenger then trophyCnt = trophyCnt + 1 end
        if trophies.regional_champ or trophies.regional_cup then trophyCnt = trophyCnt + 1 end
        if trophies.worlds_cup then trophyCnt = trophyCnt + 1 end
        if trophies.mvp_ring then trophyCnt = trophyCnt + 1 end
    end

    local goatScore = math.min(99.9, math.max(75.0, 65.0 + (trophyCnt * 7.5) + ((player.mechanics - 70) * 0.25)))

    local newLegend = {
        id = "legend_player_" .. tostring(os.time and os.time() or 1),
        name = player.name or "Prodigy",
        title = "王朝开创者 · 传奇新神",
        role = player.role or "MID",
        years = "2024 - 2026",
        jerseyNumber = jerseyNumber,
        signatureChamps = "影流之主 / 疾风剑豪 / 阿卡丽",
        goatScore = goatScore,
        trophiesCount = trophyCnt,
        careerKDA = "8.2",
        lore = string.format("从破旧出租屋单排路人王一路斩将夺旗，率队捧起世界冠军，注资收购战队打造不朽王朝的旷世传奇！"),
        aura = {
            id = "aura_dynasty_founder",
            name = "王朝开创者神圣光环 (Dynasty Founder Aura)",
            desc = "全队战力 +8%，大赛决胜局极限翻盘率 +20%，俱乐部商业声望翻倍！",
            winRateBonus = 18,
            mechanicsBonus = 10,
            fameBonus = 25
        }
    }

    table.insert(hofState.inductedLegends, newLegend)
    hofState.totalInducted = hofState.totalInducted + 1
    hofState.equippedAuraId = newLegend.aura.id

    return true, newLegend, string.format("👑【退役封神仪式】恭喜【%s】荣膺入驻电竞名人堂！专属战袍【%s】永久悬挂于俱乐部穹顶，激活名宿光环【%s】！",
        newLegend.name, newLegend.jerseyNumber, newLegend.aura.name)
end

function HallOfFame.getEquippedAura(hofState)
    local all = HallOfFame.getAllLegends(hofState)
    local activeId = hofState and hofState.equippedAuraId or "aura_demon_king"
    for _, l in ipairs(all) do
        if l.aura and l.aura.id == activeId then
            return l.aura, l
        end
    end
    return HallOfFame.DEFAULT_LEGENDS[1].aura, HallOfFame.DEFAULT_LEGENDS[1]
end

function HallOfFame.equipAura(hofState, auraId)
    if not hofState then return false, "No HOF state" end
    hofState.equippedAuraId = auraId
    local aura, legend = HallOfFame.getEquippedAura(hofState)
    return true, string.format("✨【名宿庇佑激活】已切换佩戴【%s】之名宿光环：%s！", legend.name, aura.name)
end

return HallOfFame
