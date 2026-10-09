--[[
    LIVE STADIUM MATCH SIMULATION & COMMENTARY
--]]

local MatchSim = {}

function MatchSim.run(blue_picks, red_picks, win_pct)
    local logs = {}
    table.insert(logs, "[00:00] BROADCAST: Teams take the stage! Crowd chants fill the arena.")
    table.insert(logs, "[04:15] Early Gank: Jungler secures FIRST BLOOD in river brush!")
    table.insert(logs, "[14:30] Herald Skirmish: 5v5 teamfight breaks out over pit priority!")
    table.insert(logs, "[24:00] 24m Baron Standoff: High-intensity standoff in river choke!")

    local roll = math.random(1, 100)
    local is_win = roll <= win_pct

    if is_win then
        table.insert(logs, "[31:20] ACE! Clean 5-man ace wipe! Storming base gates!")
        table.insert(logs, "[32:10] VICTORY! Nexus destroyed! Crowd erupts into cheers!")
    else
        table.insert(logs, "[31:40] Enemy counter-engaged with Baron buff!")
        table.insert(logs, "[32:15] DEFEAT. Base fallen in 32 minutes.")
    end

    return is_win, logs
end

return MatchSim
