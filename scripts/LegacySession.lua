-- Legacy lifecycles are activated only by a legacy entry. The new career never
-- initializes, saves, or advances either old world.
local LegacySession = {}
local mode_ = "none"

function LegacySession.Mode() return mode_ end

---@return boolean ok
---@return string? reason
function LegacySession.Leave()
    if mode_ == "management" then
        local state = require("CompanyState").GetState()
        local save = require("SaveManager")
        if state and save.Exists() then
            local ok, reason = save.Save(state)
            if not ok then return false, reason or "旧管理模式保存失败" end
        end
        require("CompanyState").SetState(nil)
    elseif mode_ == "secondline" then
        local state = require("secondline.State")
        if state.GetState() then
            local ok, reason = state.Save()
            if not ok then return false, reason or "旧选手生涯保存失败" end
        end
        state.SetState(nil)
    end
    mode_ = "none"
    return true
end

---@param mode string
---@return boolean ok
---@return string? reason
function LegacySession.Enter(mode)
    if mode == mode_ then return true end
    local left, reason = LegacySession.Leave()
    if not left then return false, reason end
    if mode == "management" then
        local State, Save = require("CompanyState"), require("SaveManager")
        local existed = Save.Exists()
        local loaded = Save.Load()
        -- Never turn an unreadable old save into a fresh autosave.
        if existed and not loaded then return false, "旧管理存档无法读取，原文件已保留。" end
        local state = State.Ensure(loaded or State.NewGame())
        if loaded and #(state.goals and state.goals.season or {}) == 0 then
            require("GoalSystem").GenerateSeasonGoals(state)
        end
        local catalog = require("LeagueCatalog")
        for _, player in pairs(state.roster.customPlayers or {}) do catalog.RegisterPlayer(player) end
        for _, player in pairs(state.scouting and state.scouting.prospects or {}) do catalog.RegisterPlayer(player) end
        require("DraftSystem").Rehydrate(state)
        require("AISystem").EnsureAgents(state)
        State.SetState(state)
    elseif mode == "secondline" then
        local State = require("secondline.State")
        local existed = State.Exists()
        local loaded = State.Load()
        if existed and not loaded then return false, "旧选手生涯存档无法读取，原文件已保留。" end
    end
    mode_ = mode
    return true
end

return LegacySession
