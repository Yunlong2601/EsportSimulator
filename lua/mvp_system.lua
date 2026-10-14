local MvpSystem = {}
MvpSystem.__index = MvpSystem

function MvpSystem.calculateMvp(stats)
    local kills = stats.kills or 12
    local deaths = math.max(1, stats.deaths or 1)
    local assists = stats.assists or 7
    local kda_ratio = (kills + assists) / deaths

    local dmg = stats.damage or 36800
    local total_dmg = stats.team_total_damage or 98000
    local dmg_share = dmg / math.max(1, total_dmg)

    local raw_score = (kda_ratio * 0.45) + (dmg_share * 10 * 0.4) + 2.0
    local final_score = math.min(10.0, math.floor(raw_score * 10) / 10)
    local is_mvp = final_score >= 9.0

    local legacy_boost = nil
    if is_mvp then
        legacy_boost = {
            stat = "mechanics",
            amount = 1,
            desc = "关键Carry表现永久传承加成 (+1 极限微操)"
        }
    end

    return {
        score = final_score,
        is_mvp = is_mvp,
        headline = is_mvp and "天神下凡 · 孤胆斩破千军" or "核心中流砥柱",
        kda = string.format("%d / %d / %d", kills, deaths, assists),
        damage_share = string.format("%.1f%%", dmg_share * 100),
        legacy_boost = legacy_boost
    }
end

function MvpSystem.applyLegacyBoost(player_stats, boost)
    if not boost then return false end
    player_stats[boost.stat] = (player_stats[boost.stat] or 80) + boost.amount
    print("🌟【TapTap Make】成功注入荣耀传承: " .. boost.desc)
    return true
end

return MvpSystem
