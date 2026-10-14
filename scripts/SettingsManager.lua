local SettingsManager = {}

local SETTINGS_PATH = "saves/settings.json"

local DEFAULTS = {
    sound = true,
    notify = true,
    matchSpeed = "normal",
}

-- 返回合并默认值后的设置表；文件缺失或损坏时返回默认值
function SettingsManager.Load()
    local result = {}
    for k, v in pairs(DEFAULTS) do result[k] = v end
    if not fileSystem:FileExists(SETTINGS_PATH) then return result end
    local file = File(SETTINGS_PATH, FILE_READ)
    if not file:IsOpen() then return result end
    local text = file:ReadString()
    file:Close()
    local ok, data = pcall(cjson.decode, text)
    if not ok or type(data) ~= "table" then return result end
    for k, v in pairs(data) do
        if DEFAULTS[k] ~= nil then result[k] = v end
    end
    return result
end

function SettingsManager.Save(settings)
    fileSystem:CreateDir("saves")
    local file = File(SETTINGS_PATH, FILE_WRITE)
    if not file:IsOpen() then return false, "无法写入设置文件" end
    file:WriteString(cjson.encode(settings))
    file:Close()
    return true
end

return SettingsManager
