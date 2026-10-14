--[[
    DRAFTING ENGINE: 5v5 PICK & BAN FOR ARENA STAGE
--]]

local Champions = require("champions")

local Draft = {}

function Draft.new()
    return {
        roles = {"TOP", "JUG", "MID", "ADC", "SUP"},
        blue_picks = {nil, nil, nil, nil, nil},
        red_picks = {nil, nil, nil, nil, nil},
        current_index = 1
    }
end

function Draft.calculateScores(draft, esports_engine)
    local blue_score = 50
    local red_score = 50

    for i = 1, 5 do
        local b = draft.blue_picks[i]
        local r = draft.red_picks[i]

        if b then
            local meta_bonus = 0
            if esports_engine and esports_engine.evaluateChampionMetaBonus then
                local meta = esports_engine:evaluateChampionMetaBonus(b.name, b.archetype)
                meta_bonus = meta.power_delta or 0
            end

            blue_score = blue_score + ((b.power - 85) * 1.2) + meta_bonus
            if r then
                for _, target in ipairs(b.counters) do
                    if target == r.id then blue_score = blue_score + 7 end
                end
                for _, target in ipairs(b.countered_by) do
                    if target == r.id then blue_score = blue_score - 7 end
                end
            end
        end

        if r then
            red_score = red_score + ((r.power - 85) * 1.2)
            if b then
                for _, target in ipairs(r.counters) do
                    if target == b.id then red_score = red_score + 7 end
                end
                for _, target in ipairs(r.countered_by) do
                    if target == b.id then red_score = red_score - 7 end
                end
            end
        end
    end

    local total = blue_score + red_score
    local blue_pct = math.min(88, math.max(15, math.floor((blue_score / total) * 100)))
    return blue_pct, 100 - blue_pct
end

function Draft.pickChampion(draft, role_index, champ)
    draft.blue_picks[role_index] = champ

    -- Enemy AI counter-picks for the same role
    local role = draft.roles[role_index]
    local pool = Champions.getByRole(role)
    local enemy_choice = nil

    for _, c in ipairs(pool) do
        if c.id ~= champ.id then
            -- Prefer counter pick
            for _, counter_id in ipairs(c.counters) do
                if counter_id == champ.id then
                    enemy_choice = c
                    break
                end
            end
            if enemy_choice then break end
        end
    end

    if not enemy_choice then
        for _, c in ipairs(pool) do
            if c.id ~= champ.id then
                enemy_choice = c
                break
            end
        end
    end

    draft.red_picks[role_index] = enemy_choice
end

function Draft.autoDraft(draft)
    for i = 1, 5 do
        if not draft.blue_picks[i] then
            local role = draft.roles[i]
            local pool = Champions.getByRole(role)
            draft.blue_picks[i] = pool[1]
            draft.red_picks[i] = pool[2] or pool[1]
        end
    end
end

-- 获取当前对局的 Active Meta Insight 战术洞察数据
function Draft.getActiveMetaInsight(draft, esports_engine)
    if not esports_engine then return nil end
    local patch = esports_engine:getCurrentPatch()
    local lp_boost = esports_engine:evaluateDraftMetaLpBoost(draft.blue_picks)

    return {
        patch_version = patch.version,
        headline = patch.headline,
        description = patch.desc,
        s_tier_champs = patch.s_tier_champs,
        buffed = patch.buffed,
        nerfed = patch.nerfed,
        s_tier_count = lp_boost.s_tier_count,
        bonus_lp_pct = lp_boost.bonus_lp_pct,
        total_bonus_lp = lp_boost.total_bonus_lp,
        s_tier_names = lp_boost.s_tier_names,
        is_boost_active = lp_boost.is_active
    }
end

-- 结算胜场时的 Meta LP 提振奖励
function Draft.evaluateMetaLpBonus(draft, esports_engine)
    if not esports_engine then return 0, {} end
    local lp_boost = esports_engine:evaluateDraftMetaLpBoost(draft.blue_picks)
    return lp_boost.total_bonus_lp, lp_boost.s_tier_names
end

-- 终端界面渲染 Active Meta Insight 战术版本雷达
function Draft.renderMetaInsight(draft, esports_engine)
    local meta = Draft.getActiveMetaInsight(draft, esports_engine)
    if not meta then
        print("⚠️ 未加载赛事引擎与赛历版本数据。")
        return
    end

    print("\n================ ⚡ 版本战术雷达 (ACTIVE META INSIGHT) ================")
    print(string.format("【当前职业版本】Patch %s · %s", meta.patch_version, meta.headline))
    print("【版本环境综述】" .. meta.description)
    print("----------------------------------------------------------------------")
    print("🔥【S-Tier 核心 T0 英雄池 (选用即可激活胜场高额 LP 提振)】:")
    for _, champ in ipairs(meta.s_tier_champs) do
        print("   ★ " .. champ .. " (+20% LP 提振 · 微操强化)")
    end
    print(string.format("🟢 版本增强定位: %s", table.concat(meta.buffed, ", ")))
    print(string.format("🔴 版本削弱定位: %s", table.concat(meta.nerfed, ", ")))
    print("----------------------------------------------------------------------")
    if meta.is_boost_active then
        print(string.format("✨【当前阵容 Meta 红利已激活】选用 %d 位 S-Tier 英雄 (%s)",
            meta.s_tier_count, table.concat(meta.s_tier_names, "、")))
        print(string.format("   🏆 本场若获胜将直接额外斩获: +%d LP (提振倍率: +%d%%)！",
            meta.total_bonus_lp, meta.bonus_lp_pct))
    else
        print("💡 战术建议: 在选人环节至少选择 1 位版本 S-Tier 英雄以激活 +25~60 LP 胜场加成！")
    end
    print("======================================================================\n")
end

return Draft

