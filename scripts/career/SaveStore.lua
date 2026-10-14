-- Unified career snapshots. This module never reads or writes legacy save paths.
-- File API follows engine-docs/recipes/file-storage.md; cjson follows json.md.
-- File storage is NOT persistent across WASM refresh. Use NewCloud for the game.
-- Double snapshots protect the last complete save; this is not a cross-device CAS.
local SaveStore = {}
SaveStore.__index = SaveStore

local FORMAT = "unified_career_snapshot"
local FORMAT_VERSION = 1
local SCHEMA_VERSION = 1
local MAX_INTEGER = 9007199254740991
---@type string[]
local PATHS = {
    "saves/unified_career_v1_slot1_a.json",
    "saves/unified_career_v1_slot1_b.json",
}
local CLOUD_KEYS = {
    [PATHS[1]] = "unified_career_v1_slot1_a",
    [PATHS[2]] = "unified_career_v1_slot1_b",
}

local function integer(value, minimum)
    return type(value) == "number" and value >= minimum and value <= MAX_INTEGER
        and value % 1 == 0
end

-- Adler-32 detects accidental damage, not malicious save editing. Include ordering
-- metadata so a damaged generation cannot make an older payload look newest.
local function checksum(record)
    local text = table.concat({ string.format("%.0f", record.formatVersion), string.format("%.0f", record.schemaVersion),
        string.format("%.0f", record.generation), string.format("%.0f", record.revision),
        record.worldId, record.payload }, "\n")
    local a, b = 1, 0
    for i = 1, #text do
        a = (a + text:byte(i)) % 65521
        b = (b + a) % 65521
    end
    return string.format("%08x", b * 65536 + a)
end

local function same(left, right)
    if type(left) ~= type(right) then return false end
    if type(left) ~= "table" then return left == right end
    for key, value in pairs(left) do
        if not same(value, right[key]) then return false end
    end
    for key in pairs(right) do
        if left[key] == nil then return false end
    end
    return true
end

local function worldHeader(world)
    return type(world) == "table" and world.schemaVersion == SCHEMA_VERSION
        and type(world.worldId) == "string" and #world.worldId > 0
        and integer(world.revision, 0)
end

local function defaultAdapter()
    return {
        read = function(path)
            if not fileSystem:FileExists(path) then return nil, "missing" end
            local file = File(path, FILE_READ)
            if not file or not file:IsOpen() then return nil, "io_error", "无法打开存档" end
            local ok, result = pcall(function() return file:ReadString() end)
            pcall(function() file:Close() end)
            if not ok or type(result) ~= "string" then return nil, "io_error", "读取存档失败" end
            return result, "ok"
        end,
        write = function(path, text)
            fileSystem:CreateDir("saves")
            local file = File(path, FILE_WRITE)
            if not file or not file:IsOpen() then return false, "无法打开存档文件" end
            local ok, result = pcall(function()
                local written = file:WriteString(text)
                file:Flush()
                return written
            end)
            local closed = pcall(function() file:Close() end)
            if not ok or result == false or not closed then return false, "写入存档失败" end
            return true
        end,
    }
end

-- Adapter functions use dot calls. read(path) -> text,status,message;
-- write(path,text) -> ok,message,code. Async variants add a final callback.
-- Optional encode/decode replace global cjson for offline tests.
function SaveStore.New(adapter)
    local self = setmetatable({}, SaveStore)
    self:init(adapter or defaultAdapter())
    return self
end

function SaveStore:init(adapter)
    self.adapter = adapter
    self.busy = false
    ---@type table|nil
    self.pending = nil
    self.encode = adapter.encode or function(value) return cjson.encode(value) end
    self.decode = adapter.decode or function(text) return cjson.decode(text) end
    self.async = adapter.readAsync ~= nil or adapter.writeAsync ~= nil
end

-- Persistent, account-scoped clientCloud backend. No local fallback on failure.
-- Cloud callbacks may arrive after timeout; only their first outcome is accepted.
function SaveStore.NewCloud(client, codec)
    local cloud = client or clientCloud
    local adapter = { encode = codec and codec.encode, decode = codec and codec.decode }
    adapter.readAsync = function(path, done)
        if not cloud then done(nil, "io_error", "云存档不可用，请登录后重试"); return end
        cloud:Get(CLOUD_KEYS[path], {
            ok = function(values)
                if type(values) ~= "table" then done(nil, "io_error", "云存档响应无效"); return end
                local value = values[CLOUD_KEYS[path]]
                if value == nil then done(nil, "missing")
                elseif type(value) ~= "string" then done(nil, "corrupt", "云存档格式错误")
                else done(value, "ok") end
            end,
            error = function(_, reason) done(nil, "io_error", "云存档读取失败：" .. tostring(reason)) end,
            timeout = function() done(nil, "io_error", "云存档读取超时") end,
        })
    end
    adapter.writeAsync = function(path, text, done)
        if not cloud then done(false, "云存档不可用", "io_error"); return end
        cloud:Set(CLOUD_KEYS[path], text, {
            ok = function() done(true) end,
            error = function(code, reason)
                -- client-cloud-score.md documents this exact rate-limit rejection.
                -- Other errors (even a different -429 reason) may have committed.
                if code == -429 and reason == "send failed" then
                    done(false, "云存档暂时限流，本次未保存，请稍后重试", "rejected")
                else done(false, "云存档写入失败：" .. tostring(reason), "uncertain") end
            end,
            timeout = function() done(false, "云存档写入超时，结果待确认", "uncertain") end,
        })
    end
    return SaveStore.New(adapter)
end

function SaveStore:_Read(path, done)
    local completed = false
    local function finish(text, status, message)
        if completed then return end
        completed = true
        if status == "ok" and type(text) ~= "string" then status, message = "io_error", "读取结果无效" end
        if status ~= "ok" and status ~= "missing" and status ~= "corrupt" then status = "io_error" end
        done(text, status, message)
    end
    local ok, reason = pcall(function()
        if self.adapter.readAsync then self.adapter.readAsync(path, finish)
        else finish(self.adapter.read(path)) end
    end)
    if not ok then
        if completed then error(reason, 0) end -- Do not hide caller/programming errors.
        finish(nil, "io_error", tostring(reason))
    end
end

function SaveStore:_Write(path, text, done)
    local completed = false
    local function finish(ok, message, code)
        if completed then return end
        completed = true
        done(ok == true, message, code)
    end
    local ok, reason = pcall(function()
        if self.adapter.writeAsync then self.adapter.writeAsync(path, text, finish)
        else finish(self.adapter.write(path, text)) end
    end)
    if not ok then
        if completed then error(reason, 0) end
        finish(false, tostring(reason), "uncertain")
    end
end

function SaveStore:_Decode(text, status, message)
    if status ~= "ok" then return { status = status, message = message } end
    local ok, record = pcall(self.decode, text)
    if not ok or type(record) ~= "table" or record.format ~= FORMAT then
        return { status = "corrupt", message = "存档包无法解析" }
    end
    -- Never silently select an older supported save over a newer-format slot.
    if (type(record.formatVersion) == "number" and record.formatVersion > FORMAT_VERSION)
        or (type(record.schemaVersion) == "number" and record.schemaVersion > SCHEMA_VERSION) then
        return { status = "unsupported", message = "存档由更新版本创建，请更新游戏" }
    end
    if record.formatVersion ~= FORMAT_VERSION or record.schemaVersion ~= SCHEMA_VERSION
        or not integer(record.generation, 1) or not integer(record.revision, 0)
        or type(record.worldId) ~= "string" or #record.worldId == 0
        or type(record.payload) ~= "string" or record.checksum ~= checksum(record) then
        return { status = "corrupt", message = "存档校验失败" }
    end
    local decoded, world = pcall(self.decode, record.payload)
    if decoded and type(world) == "table" and type(world.schemaVersion) == "number"
        and world.schemaVersion > SCHEMA_VERSION then
        return { status = "unsupported", message = "世界版本不受支持" }
    end
    if not decoded or not worldHeader(world) or world.revision ~= record.revision
        or world.worldId ~= record.worldId then
        return { status = "corrupt", message = "世界与存档头不一致" }
    end
    return { status = "ok", record = record, world = world }
end

function SaveStore:_Scan(done)
    self:_Read(PATHS[1], function(textA, statusA, messageA)
        local a = self:_Decode(textA, statusA, messageA)
        self:_Read(PATHS[2], function(textB, statusB, messageB)
            local b = self:_Decode(textB, statusB, messageB)
            local slots = { a, b }
            for _, slot in ipairs(slots) do
                if slot.status == "unsupported" then done(nil, "unsupported", slot.message); return end
            end
            for _, slot in ipairs(slots) do
                if slot.status == "io_error" then done(nil, "io_error", slot.message); return end
            end
            if a.status == "ok" and b.status == "ok" then
                if a.record.worldId ~= b.record.worldId then
                    done(nil, "corrupt", "两个快照属于不同世界，已保护原档"); return
                end
                if a.record.generation == b.record.generation then
                    if not same(a.world, b.world) then
                        done(nil, "corrupt", "同代快照冲突，已保护原档"); return
                    end
                else
                    local newer = a.record.generation > b.record.generation and a or b
                    local older = newer == a and b or a
                    if newer.record.revision <= older.record.revision then
                        done(nil, "corrupt", "快照版本顺序冲突，已保护原档"); return
                    end
                end
            end
            local index = a.status == "ok" and 1 or (b.status == "ok" and 2 or nil)
            if a.status == "ok" and b.status == "ok" and b.record.generation > a.record.generation then index = 2 end
            if index then
                done({ slots = slots, index = index, head = slots[index] }, "ok",
                    slots[3 - index].status == "corrupt" and "已恢复上一份完整快照" or nil)
            elseif a.status == "missing" and b.status == "missing" then
                done({ slots = slots }, "missing")
            else
                done(nil, "corrupt", "没有完整有效的快照，已保护现有文件")
            end
        end)
    end)
end

function SaveStore:LoadAsync(done)
    if self.busy then done(nil, "io_error", "存档操作进行中"); return end
    self.busy = true
    self:_Scan(function(scan, status, message)
        self.busy = false
        if status ~= "ok" and status ~= "missing" then done(nil, status, message); return end
        if self.pending then
            local head = scan and scan.head
            if not head or head.record.worldId ~= self.pending.worldId
                or head.record.generation < self.pending.generation
                or (head.record.generation == self.pending.generation and head.record.checksum ~= self.pending.checksum) then
                done(nil, "io_error", "上次保存结果尚未确认，请稍后重新读取；期间不能继续操作")
                return
            end
            self.pending = nil
        end
        done(scan and scan.head and scan.head.world or nil, status, message)
    end)
end

function SaveStore:Load()
    if self.async then return nil, "io_error", "云存档必须使用 LoadAsync" end
    local result = {}
    self:LoadAsync(function(...) result = table.pack(...) end)
    return table.unpack(result, 1, result.n)
end

function SaveStore:SaveAsync(world, done)
    if self.busy then done(false, "存档操作进行中", "busy"); return end
    if self.pending then done(false, "上次保存结果待确认，请重新读取", "uncertain"); return end
    if not worldHeader(world) then done(false, "世界存档头无效", "invalid_world"); return end
    local encoded, payload = pcall(self.encode, world)
    if not encoded or type(payload) ~= "string" then done(false, "世界无法序列化", "encode_error"); return end
    local decoded, candidate = pcall(self.decode, payload)
    if not decoded or not worldHeader(candidate) or candidate.worldId ~= world.worldId
        or candidate.revision ~= world.revision then
        done(false, "序列化后的世界无效", "encode_error"); return
    end
    self.busy = true
    local function finish(ok, message, code)
        self.busy = false
        done(ok, message, code)
    end
    self:_Scan(function(scan, status, message)
        if status ~= "ok" and status ~= "missing" then finish(false, message, status); return end
        local head = scan.head
        if head then
            if head.record.worldId ~= candidate.worldId then finish(false, "不能覆盖另一个世界", "conflict"); return end
            if candidate.revision < head.record.revision then finish(false, "内存状态已落后，请重新读取", "stale"); return end
            if candidate.revision == head.record.revision then
                if same(candidate, head.world) then finish(true)
                else finish(false, "相同版本包含不同状态，请重新读取", "conflict") end
                return
            end
            if head.record.generation >= MAX_INTEGER then finish(false, "快照编号已达上限", "unsupported"); return end
        end
        local record = {
            format = FORMAT, formatVersion = FORMAT_VERSION, schemaVersion = SCHEMA_VERSION,
            generation = head and head.record.generation + 1 or 1,
            revision = candidate.revision, worldId = candidate.worldId, payload = payload,
        }
        record.checksum = checksum(record)
        local packaged, text = pcall(self.encode, record)
        if not packaged or type(text) ~= "string" then finish(false, "快照无法序列化", "encode_error"); return end
        local target = scan.index and 3 - scan.index or 1
        self:_Write(PATHS[target], text, function(written, writeMessage, writeCode)
            -- Even a write reporting failure can have committed. Always reconcile.
            self:_Read(PATHS[target], function(readText, readStatus, readMessage)
                local verified = self:_Decode(readText, readStatus, readMessage)
                if verified.status == "ok" and verified.record.generation == record.generation
                    and verified.record.checksum == record.checksum then
                    finish(true); return
                end
                local conflicting = verified.status == "ok"
                    and (verified.record.worldId ~= record.worldId or verified.record.generation >= record.generation)
                -- A documented request rejection cannot have a late commit. A
                -- failed verification read must not create an unresolvable lock.
                -- Still protect unexpected newer/foreign snapshots as below.
                if writeCode == "rejected" and verified.status ~= "unsupported" and not conflicting then
                    finish(false, writeMessage, "write_failed"); return
                end
                if verified.status == "io_error" or writeCode == "uncertain"
                    or verified.status == "unsupported" or conflicting then
                    self.pending = record
                    finish(false, "保存结果待确认，请重新读取后继续", "uncertain"); return
                end
                finish(false, written and "写入后的快照校验失败" or (writeMessage or "存档写入失败"), "write_failed")
            end)
        end)
    end)
end

function SaveStore:Save(world)
    if self.async then return false, "云存档必须使用 SaveAsync", "async_required" end
    local result = {}
    self:SaveAsync(world, function(...) result = table.pack(...) end)
    return table.unpack(result, 1, result.n)
end

return SaveStore
