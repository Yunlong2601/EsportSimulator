--[[
    SOCIAL MEDIA BANTER & REDDIT POST-MATCH DISCUSSIONS FOR ESPORTS LEGACY
--]]

local Social = {
    feed = {
        {
            author = "Caedrel (@Caedrel)",
            content = "NAHH HE REALLY PULLED OFF THE INSEC KICK IN COMPETITIVE PLAY! THAT WAS ABSOLUTELY ILLEGAL!! MY GOAT!",
            likes = 48200
        },
        {
            author = "r/leagueoflegends (u/WorldsObserver)",
            content = "[Post-Match Discussion] Prodigy just dropped 14 kills in Game 1. Best rookie since Faker in 2013?",
            likes = 14500
        },
        {
            author = "T1 Official (@T1LoL)",
            content = "A formidable draft and exceptional mechanical execution. See you on the Grand Finals stage. 🤝",
            likes = 89100
        }
    }
}

function Social.printRandom()
    local post = Social.feed[math.random(1, #Social.feed)]
    print("\n[TWITTER / REDDIT VIRAL FEED]")
    print(post.author .. ":")
    print('"' .. post.content .. '"')
    print("❤️ " .. post.likes .. " Likes\n")
end

return Social
