local SaveManager = {}

local SAVE_PATH = "saves/esports_tycoon.json"

function SaveManager.Save(state)
    fileSystem:CreateDir("saves")
    local file = File(SAVE_PATH, FILE_WRITE)
    if not file:IsOpen() then return false, "无法打开存档文件" end
    file:WriteString(cjson.encode(state))
    file:Close()
    return true
end

function SaveManager.Load()
    if not fileSystem:FileExists(SAVE_PATH) then return nil end
    local file = File(SAVE_PATH, FILE_READ)
    if not file:IsOpen() then return nil end
    local text = file:ReadString()
    file:Close()
    local ok, state = pcall(cjson.decode, text)
    if not ok or type(state) ~= "table" then return nil end
    if state.game ~= "esports_tycoon" or tonumber(state.schemaVersion) ~= 1 then return nil end
    return state
end

function SaveManager.Exists()
    return fileSystem:FileExists(SAVE_PATH)
end

function SaveManager.Delete()
    if not fileSystem:FileExists(SAVE_PATH) then return false end
    fileSystem:Delete(SAVE_PATH)
    return true
end

return SaveManager
