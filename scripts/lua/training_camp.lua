local TrainingCamp = {}
TrainingCamp.__index = TrainingCamp

TrainingCamp.COST_PER_SESSION = 50000
TrainingCamp.BOOST_DAYS = 7
TrainingCamp.STAT_INCREMENT = 6

function TrainingCamp.allocateCoachingBudget(player, program_type, club_budget)
    if club_budget < TrainingCamp.COST_PER_SESSION then
        return false, "俱乐部金库不足 $50,000，无法开启特训！"
    end

    local stat_key = program_type or "mechanics"
    player[stat_key] = math.min(100, (player[stat_key] or 80) + TrainingCamp.STAT_INCREMENT)
    player.training_boost = {
        stat = stat_key,
        boost = TrainingCamp.STAT_INCREMENT,
        days_left = TrainingCamp.BOOST_DAYS
    }

    local log = string.format("【特训生效】成功为【%s (%s)】注入 7 天持续增益 (+%d %s)！", player.name, player.role, TrainingCamp.STAT_INCREMENT, stat_key)
    return true, log
end

function TrainingCamp.advanceDay(player)
    if player.training_boost and player.training_boost.days_left > 0 then
        player.training_boost.days_left = player.training_boost.days_left - 1
        if player.training_boost.days_left <= 0 then
            local stat_key = player.training_boost.stat
            player[stat_key] = math.max(60, player[stat_key] - player.training_boost.boost)
            player.training_boost = nil
        end
    end
end

return TrainingCamp
