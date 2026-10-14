--[[
    SOLO QUEUE EVENTS & BRANCHING LOGIC
--]]

local Events = {
    {
        id = "baron_coinflip",
        title = "36-Minute Baron Standoff",
        tag = "Baron Fight",
        scenario = "Enemy team rushed Baron in fog of war (3,200 HP). Your jungler is dead, but Flash and Ultimate are off cooldown!",
        options = {
            {
                label = "Blind Flash-In for 50/50 Steal",
                risk = "High",
                execute = function(player)
                    local chance = (player.mechanics * 0.8) + (player.mental * 0.2)
                    if math.random(1, 100) <= chance then
                        return {
                            success = true,
                            log = "HOLY S***! Flashed the wall, smite-burst Baron at 400 HP, and killed their ADC! Solo carry pentakill!",
                            lp = 28, mechanics = 2, mental = 5, fame = 6, money = 30
                        }
                    else
                        return {
                            success = false,
                            log = "Flashed directly into 4 CC skillshots and got vaporized. Enemy took Baron and closed the game.",
                            lp = -20, mechanics = 1, mental = -6, fame = -2, money = 0
                        }
                    end
                end
            },
            {
                label = "Zone From River & Poke Safely",
                risk = "Medium",
                execute = function(player)
                    local chance = (player.mental * 0.7) + (player.mechanics * 0.3)
                    if math.random(1, 100) <= chance then
                        return {
                            success = true,
                            log = "Disciplined zoning! Forced 2 squishies off Baron, allowing your team to counter-wipe them.",
                            lp = 22, mechanics = 1, mental = 4, fame = 3, money = 15
                        }
                    else
                        return {
                            success = false,
                            log = "Enemy tank flashed with point-and-click CC. Burned Flash and they cleanly took Baron.",
                            lp = -16, mechanics = 0, mental = -3, fame = 0, money = 0
                        }
                    end
                end
            },
            {
                label = "Cross-Map Base Inhibit Rush",
                risk = "Low",
                execute = function(player)
                    return {
                        success = true,
                        log = "Macro trade! Rushed bot inhibitor, forcing recalls and keeping your base safe.",
                        lp = 18, mechanics = 0, mental = 2, fame = 1, money = 10
                    }
                end
            }
        }
    },
    {
        id = "toxic_teammate",
        title = "Teammate Mental Boom in Chat",
        tag = "Team Comms",
        scenario = "Top laner died twice before 4 minutes, pinged your summoner spells 20 times, and is typing: 'FF 15 open mid rep jungle'.",
        options = {
            {
                label = "/mute all & 1v9 Solo Carry",
                risk = "Medium",
                execute = function(player)
                    local chance = (player.mental * 0.8) + 20
                    if math.random(1, 100) <= chance then
                        return {
                            success = true,
                            log = "Stone cold focus! Muted toxic chat, farmed 10 CS/min, and closed game 11/1/6 in 27m!",
                            lp = 24, mechanics = 2, mental = 6, fame = 4, money = 20
                        }
                    else
                        return {
                            success = false,
                            log = "Played your heart out, but the 0/9 feeder gifted enemy hypercarry too many bounties.",
                            lp = -15, mechanics = 1, mental = -4, fame = 0, money = 0
                        }
                    end
                end
            },
            {
                label = "Motivational Leader Speech",
                risk = "Low",
                execute = function(player)
                    if math.random(1, 100) > 40 then
                        return {
                            success = true,
                            log = "Leadership masterclass! Teammate locked in, stopped griefing, and landed a game-winning teamfight ult!",
                            lp = 25, mechanics = 0, mental = 8, fame = 5, money = 25
                        }
                    else
                        return {
                            success = false,
                            log = "They replied: 'ok clown enjoy losing LP' and went AFK at fountain.",
                            lp = -18, mechanics = 0, mental = -8, fame = 0, money = 0
                        }
                    end
                end
            }
        }
    },
    {
        id = "scout_spectating",
        title = "Pro Scout Spectating Your Stream",
        tag = "Pro Notice",
        scenario = "Twitch chat informs you: 'OMG BRO CLOUD9 AND T1 SCOUTS ARE IN CHAT WATCHING YOUR GAME RIGHT NOW!'",
        options = {
            {
                label = "Lock In Signature High-APM Assassin",
                risk = "High",
                execute = function(player)
                    if math.random(1, 100) <= (player.mechanics * 0.85) then
                        return {
                            success = true,
                            log = "HIGHLIGHT VIRAL CLIP! Dropped a 17/2/8 masterclass. The scouts immediately sent a direct message!",
                            lp = 32, mechanics = 4, mental = 8, fame = 15, money = 100
                        }
                    else
                        return {
                            success = false,
                            log = "Stage fright! Over-forced aggressive plays, got ganked 4 times, chat spammed 'SCOUT DIFF'.",
                            lp = -19, mechanics = 1, mental = -10, fame = 2, money = 0
                        }
                    end
                end
            },
            {
                label = "Play Disciplined Macro Roaming Champ",
                risk = "Low",
                execute = function(player)
                    return {
                        success = true,
                        log = "Solid fundamentals! Scouts noted: 'Extremely reliable shotcalling and calm temperament under pressure.'",
                        lp = 24, mechanics = 1, mental = 6, fame = 8, money = 40
                    }
                end
            }
        }
    }
}

function Events.getRandom()
    return Events[math.random(1, #Events)]
end

return Events
