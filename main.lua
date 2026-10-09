-- Master Entry Point: esports_legacy
local EsportsGame = require("lua.main")
if arg and arg[0] then
    EsportsGame:run()
end
return EsportsGame
