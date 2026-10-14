-- Transaction boundary: validate a candidate, durably save it, then publish it.
-- No legacy state or save file is loaded by this module.
local Util = require("career.Util")
local World = require("career.World")
local Actions = require("career.Actions")
local SaveStore = require("career.SaveStore")
local Runtime = {}
local Session = {}
Session.__index = Session

local function signature(value)
    local t = type(value)
    if t == "nil" then return "nil" end
    if t == "string" then return string.format("%q", value) end
    if t == "number" then
        assert(value == value and math.abs(value) < math.huge, "invalid number")
        return string.format("%.17g", value)
    end
    if t == "boolean" then return tostring(value) end
    assert(t == "table", "invalid payload")
    local keys = {}
    for k in pairs(value) do keys[#keys + 1] = k end
    table.sort(keys, function(a, b) return signature(a) < signature(b) end)
    local out = {}
    for _, k in ipairs(keys) do out[#out + 1] = signature(k) .. "=" .. signature(value[k]) end
    return "{" .. table.concat(out, ",") .. "}"
end

function Runtime.New(store)
    local self = setmetatable({}, Session)
    self:init(store or SaveStore.NewCloud())
    return self
end

function Session:init(store)
    self.store = store
    self.busy, self.locked, self.loaded = false, false, false
    ---@type table|nil
    self.world = nil
    ---@type function|nil
    self.onChange = nil
    self.status = { status = "unloaded", message = "读取云存档后继续" }
end

function Session:Get() return self.world and Util.Copy(self.world) or nil end
function Session:IsBusy() return self.busy end
function Session:Status() return Util.Copy(self.status) end
function Session:SetOnChange(callback) self.onChange = callback end
function Session:Notify(ok, message, status)
    self.status = { status = status, message = message, locked = self.locked, busy = self.busy }
    if self.onChange then
        local success, reason = pcall(self.onChange, ok, message, status)
        if not success then print("[Career UI] " .. tostring(reason)) end
    end
end

local function validate(world)
    local called, ok, message = pcall(World.Validate, world)
    if not called then return false, "存档结构损坏，原档已保留" end
    return ok, message
end

function Session:Load()
    if self.busy then return false, "存档操作进行中", "busy" end
    self.busy = true
    local returned
    self:Notify(false, "正在读取云存档…", "pending")
    self.store:LoadAsync(function(world, status, message)
        self.busy = false
        if status == "ok" then
            local ok, reason = validate(world)
            if not ok then status, message = "corrupt", reason
            else self.world, self.loaded, self.locked = world, true, false end
        elseif status == "missing" and not self.world then
            self.loaded, self.locked = true, false
        end
        local ok = status == "ok" or (status == "missing" and not self.world)
        if not ok then self.locked = true end
        message = message or (status == "ok" and "已恢复同一世界的进度" or status == "missing" and "尚未创建统一生涯" or "存档无法读取")
        self:Notify(ok, message, status)
        returned = { ok, message, status }
    end)
    if returned then return table.unpack(returned) end
    return true, "正在读取云存档…", "pending"
end

function Session:Commit(candidate, message)
    local valid, reason = validate(candidate)
    if not valid then return false, reason, "invalid_world" end
    self.busy = true
    local returned
    self:Notify(false, "正在保存，请稍候…", "pending")
    self.store:SaveAsync(candidate, function(ok, err, code)
        self.busy = false
        if ok then
            self.world, self.loaded, self.locked = candidate, true, false
            self:Notify(true, message, "ok")
            returned = { true, message, "ok" }
        else
            if code == "uncertain" or code == "stale" or code == "conflict" or code == "unsupported" or code == "corrupt" then self.locked = true end
            self:Notify(false, err or "保存失败，尚未确认本次操作", code or "save_failed")
            returned = { false, err, code }
        end
    end)
    if returned then return table.unpack(returned) end
    return true, "正在保存，请稍候…", "pending"
end

function Session:Create(options)
    if self.busy then return false, "存档操作进行中", "busy" end
    if self.locked then return false, "请先重新读取并确认存档状态", "locked" end
    if not self.loaded then return false, "请先读取云存档，确认没有已有生涯", "unloaded" end
    if self.world then return false, "已有统一生涯，请继续原存档；当前版本不覆盖存档", "exists" end
    local world, message = World.New(options)
    if not world then return false, message, "invalid_options" end
    return self:Commit(world, "统一生涯已创建并保存")
end

function Session:Dispatch(kind, payload, expectedRevision, commandId)
    if self.busy then return false, "正在保存，请等待结果", "busy" end
    if self.locked then return false, "上次保存状态待确认，请重新读取后继续", "locked" end
    local world = self.world
    if not world then return false, "请先读取或创建生涯", "unloaded" end
    if type(payload or {}) ~= "table" then return false, "操作参数无效", "invalid" end
    local signed, fingerprint = pcall(signature, { kind = kind, payload = payload or {} })
    if not signed then return false, "操作参数无效", "invalid" end
    if commandId then
        local receipt = world.processedCommands[commandId]
        if receipt then
            if receipt.signature ~= fingerprint then return false, "命令编号已用于其他操作", "conflict" end
            return true, receipt.message, "replayed"
        end
    end
    if expectedRevision ~= nil and expectedRevision ~= world.revision then
        return false, "页面状态已经变化，请使用当前页面重新选择", "stale"
    end
    commandId = commandId or (world.worldId .. ":command:" .. tostring(world.revision + 1))
    if type(commandId) ~= "string" or #commandId > 200 then return false, "命令编号无效", "invalid" end
    local candidate = Util.Copy(world)
    local called, ok, message = pcall(Actions.Apply, candidate, world.protagonistId, kind, payload or {})
    if not called then
        print("[Career] rejected command " .. tostring(kind) .. ": " .. tostring(ok))
        return false, "操作无法完成，当前世界未更改", "invalid"
    end
    if not ok then return false, message, "rejected" end
    candidate.revision = world.revision + 1
    candidate.processedCommands[commandId] = { signature = fingerprint, message = message,
        revision = candidate.revision, kind = kind }
    return self:Commit(candidate, message)
end

function Session:Preview(kind, payload)
    if not self.world then return { ok = false, message = "请先读取生涯" } end
    return Actions.Preview(self.world, kind, payload)
end

-- UI-facing singleton; tests instantiate isolated sessions via New(store).
---@type table|nil
local defaultSession
local function current()
    if not defaultSession then defaultSession = Runtime.New() end
    return defaultSession
end
function Runtime.Get() return current():Get() end
function Runtime.IsBusy() return current():IsBusy() end
function Runtime.Status() return current():Status() end
function Runtime.SetOnChange(callback) return current():SetOnChange(callback) end
function Runtime.Load() return current():Load() end
function Runtime.Create(options) return current():Create(options) end
function Runtime.Dispatch(kind, payload, expectedRevision, commandId)
    return current():Dispatch(kind, payload, expectedRevision, commandId)
end
function Runtime.Preview(kind, payload) return current():Preview(kind, payload) end

return Runtime
