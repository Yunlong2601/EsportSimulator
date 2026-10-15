-- scripts/lua/meta_tier_list.lua
-- Dynamic Patch Meta Tier List & Tactical Strategy Modifiers
-- Ported from Web React prototype (src/data/championTierListData.ts & tacticalMetaTrendData.ts)

local MetaTierList = {}
MetaTierList.__index = MetaTierList

MetaTierList.CURRENT_PATCH = {
    version = "Patch 14.19",
    theme_title = "刺客突脸狂潮 · 上中野绞肉搏杀 (Assassin & Dive Surge)",
    theme_desc = "穿甲刺客核心装备大降价，点控与锁头英雄伤害上限大幅激增。后排脆皮生存空间逼仄，先手强开锁头成为战局决胜杀招。",
    meta_highlight = "刺客/战士技能急速与穿甲爆发 +18%，防御塔前期保护护甲 -10%",
    bp_tactical_tip = "BP阶段首抢「阿卡丽/劫/皇子」突进点杀；若处于红色方，务必一抢「霞/烈娜塔」反制突脸！",
    champions = {
        { name = "阿卡丽", role = "MID", tier = "T0", win_rate = 56.8, pb_rate = 88.5, icon = "🥷", synergy = "多段突进烟雾弹瞬融双C", buff = "+18% 突脸爆发" },
        { name = "劫", role = "MID", tier = "T0", win_rate = 55.4, pb_rate = 82.1, icon = "⚔️", synergy = "影子位移绝命秒杀", buff = "+15% 单杀压制" },
        { name = "皇子", role = "JUG", tier = "T0", win_rate = 54.9, pb_rate = 85.0, icon = "🚩", synergy = "EQ闪天崩地裂强行开团", buff = "+14% 越塔成功率" },
        { name = "亚托克斯", role = "TOP", tier = "T0", win_rate = 54.8, pb_rate = 78.5, icon = "🗡️", synergy = "暗裔重剑大灭先锋坑灭队", buff = "+16% 先锋团战" },
        { name = "李青", role = "JUG", tier = "T1", win_rate = 53.9, pb_rate = 72.0, icon = "🥋", synergy = "野区入侵神龙摆尾踢回C位", buff = "+10% 野区控图" },
        { name = "泰坦", role = "SUP", tier = "T1", win_rate = 52.8, pb_rate = 74.0, icon = "⚓", synergy = "深海巨锚稳定指引集火", buff = "+8% 团战先手" },
        { name = "霞", role = "ADC", tier = "T1", win_rate = 52.5, pb_rate = 69.4, icon = "🪶", synergy = "暴风羽刃绝境无法选中自保", buff = "+10% 反突打反手" },
        { name = "金克丝", role = "ADC", tier = "T3", win_rate = 44.2, pb_rate = 31.0, icon = "🚀", synergy = "无位移易遭突脸秒杀", buff = "-12% 团战存活率" }
    },
    strategies = {
        { id = "dive", name = "强开突脸体系 (Dive Engage)", modifier = 16, status = "BUFFED", desc = "打野辅助无脑先手锁头，刺客切入瞬间秒杀后排", advice = "当前版本绝对T0答案！战队胜率权重提升 +16%！" },
        { id = "split", name = "1-3-1 分推牵制 (Split Push)", modifier = 6, status = "BUFFED", desc = "避开正面团战，由发育超前的单带英雄撕裂防线", advice = "单带能力强队克制硬开团的备用策略，胜率 +6%。" },
        { id = "poke", name = "长手炮击消耗 (Poke & Siege)", modifier = -10, status = "NERFED", desc = "超远距离技能压低血线，推进推塔", advice = "面对突脸刺客易遭侧翼绕后暴毙，胜率大幅受限 (-10%)。" },
        { id = "hyper_carry", name = "四保一后期核弹 (Hyper-Carry)", modifier = -8, status = "NERFED", desc = "经济全力倾斜射手，软辅贴身保护", advice = "射手生存环境恶劣，前中期被冲垮风险极高 (-8%)。" }
    }
}

function MetaTierList.getCurrentPatch()
    return MetaTierList.CURRENT_PATCH
end

function MetaTierList.getStrategyModifier(strategy_id)
    if not strategy_id then return 0 end
    for _, s in ipairs(MetaTierList.CURRENT_PATCH.strategies) do
        if s.id == strategy_id then
            return s.modifier or 0
        end
    end
    return 0
end

function MetaTierList.getChampionTier(champ_name)
    for _, c in ipairs(MetaTierList.CURRENT_PATCH.champions) do
        if c.name == champ_name then
            return c
        end
    end
    return nil
end

return MetaTierList
