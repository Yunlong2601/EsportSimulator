local RivalryNemesis = {}
RivalryNemesis.__index = RivalryNemesis

RivalryNemesis.NEMESIS_THRESHOLD = 3
RivalryNemesis.DEFAULT_BOUNTY_LP = 15

function RivalryNemesis.checkNemesisStatus(opponent)
    local encounters = opponent.encounters or 0
    local rival_wins = opponent.rival_wins or 0
    local is_nemesis = encounters >= RivalryNemesis.NEMESIS_THRESHOLD and rival_wins >= 1
    local bounty = is_nemesis and RivalryNemesis.DEFAULT_BOUNTY_LP or 0
    return is_nemesis, bounty
end

function RivalryNemesis.resolveMatch(opponent, is_player_win)
    opponent.encounters = (opponent.encounters or 0) + 1
    local is_nemesis, bounty = RivalryNemesis.checkNemesisStatus(opponent)

    if is_player_win then
        opponent.player_wins = (opponent.player_wins or 0) + 1
        local extra_lp = is_nemesis and bounty or 0
        if is_nemesis then
            print(string.format("🔥【宿敌斩落】成功终结宿敌【%s】！额外斩获 +%d LP 宿敌悬赏！", opponent.name, extra_lp))
        end
        return 22 + extra_lp, extra_lp
    else
        opponent.rival_wins = (opponent.rival_wins or 0) + 1
        return -16, 0
    end
end

return RivalryNemesis
