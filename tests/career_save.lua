-- Offline persistence fault-injection tests. Requires Lua 5.4 + cjson (or the
-- test runner's real JSON bridge). All I/O is in-memory; no player saves touched.
local SaveStore = require("career.SaveStore")
assert(cjson and cjson.encode and cjson.decode, "Tests require a JSON codec")
local A = "saves/unified_career_v1_slot1_a.json"
local B = "saves/unified_career_v1_slot1_b.json"
local CA, CB = "unified_career_v1_slot1_a", "unified_career_v1_slot1_b"
local passed = 0
local function check(value, label) assert(value, label); passed = passed + 1 end
local function copy(value) return cjson.decode(cjson.encode(value)) end
local function world(revision)
    return {
        schemaVersion = 1, worldId = "world-save-test", revision = revision,
        protagonistId = "person-original", rngState = 34563,
        people = { ["person-original"] = { name = "李梓轩", clubId = "club-existing" } },
        clubs = { ["club-existing"] = { ownerId = "owner-existing", cash = 431000 } },
        contracts = { { personId = "person-original", clubId = "club-existing", wage = 12000 } },
        history = { { kind = "match", matchId = "match-old" } },
        processedCommands = { purchase1 = { ok = true } },
    }
end
local function memory()
    local adapter = { files = {}, writes = {}, faults = {} }
    adapter.read = function(path)
        if adapter.faults.read then return nil, "io_error", "injected read fault" end
        if adapter.files[path] == nil then return nil, "missing" end
        return adapter.files[path], "ok"
    end
    adapter.write = function(path, text)
        table.insert(adapter.writes, path)
        if adapter.faults.partial then adapter.files[path] = text:sub(1, 12); return false, "partial" end
        if adapter.faults.noWrite then return false, "not written" end
        adapter.files[path] = text
        if adapter.faults.verifyRead then adapter.faults.read = true end
        if adapter.faults.reportFailure then return false, "reported failure after commit" end
        return true
    end
    return adapter
end
local function status(store, expected)
    local loaded, result = store:Load()
    check(result == expected, "Expected status " .. expected .. ", got " .. tostring(result))
    return loaded
end

do
    local adapter = memory()
    adapter.files["saves/esports_tycoon.json"] = "legacy-management"
    adapter.files["saves/secondline_slot.json"] = "legacy-career"
    local store = SaveStore.New(adapter)
    status(store, "missing")
    check(store:Save(world(0)), "Initial snapshot saves")
    local loaded = status(SaveStore.New(adapter), "ok")
    check(loaded.protagonistId == "person-original" and loaded.history[1].matchId == "match-old", "World identity/history survive cold load")
    check(loaded.people["person-original"].name == "李梓轩", "Chinese text survives JSON")
    check(loaded.processedCommands.purchase1.ok, "Command receipt survives JSON")
    check(store:Save(world(1)), "Second snapshot saves")
    check(adapter.writes[1] == A and adapter.writes[2] == B, "Alternates without overwriting sole snapshot")
    check(store:Save(world(2)) and adapter.writes[3] == A, "Third save replaces oldest snapshot")
    check(status(SaveStore.New(adapter), "ok").revision == 2, "Select latest generation")
    check(adapter.files["saves/esports_tycoon.json"] == "legacy-management"
        and adapter.files["saves/secondline_slot.json"] == "legacy-career", "Legacy files untouched")
    local count = #adapter.writes
    check(store:Save(world(2)) and #adapter.writes == count, "Same state revision is no-op")
    local altered = world(2); altered.rngState = 987
    local ok, _, code = store:Save(altered)
    check(not ok and code == "conflict", "Same revision divergent state rejected")
    ok, _, code = store:Save(world(1))
    check(not ok and code == "stale", "Older revision rejected")
    altered = world(3); altered.worldId = "unrelated-world"
    ok, _, code = store:Save(altered)
    check(not ok and code == "conflict" and #adapter.writes == count, "Different world cannot overwrite slot")
end

do
    local adapter = memory(); local store = SaveStore.New(adapter)
    check(store:Save(world(0)), "Seed snapshot")
    local previous = adapter.files[A]
    adapter.faults.partial = true
    local ok, _, code = store:Save(world(1))
    check(not ok and code == "write_failed", "Partial write is failure")
    check(adapter.files[A] == previous, "Partial write preserves sole valid snapshot")
    check(status(SaveStore.New(adapter), "ok").revision == 0, "Cold load recovers older complete world")
    adapter.faults.partial = nil
    check(store:Save(world(1)), "Retry replaces incomplete destination")
    local record = cjson.decode(adapter.files[B]); record.revision = 600
    adapter.files[B] = cjson.encode(record)
    check(status(SaveStore.New(adapter), "ok").revision == 0, "Metadata tamper fails checksum")
    adapter.files[A] = "broken"
    status(SaveStore.New(adapter), "corrupt")
    local count = #adapter.writes
    check(not SaveStore.New(adapter):Save(world(0)) and #adapter.writes == count, "Corrupt files never silently overwritten")
end

do
    local adapter = memory(); local store = SaveStore.New(adapter)
    check(store:Save(world(0)), "Seed supported world")
    local record = cjson.decode(adapter.files[A]); record.schemaVersion = 2
    adapter.files[B] = cjson.encode(record)
    status(store, "unsupported")
    local count = #adapter.writes
    local ok, _, code = store:Save(world(1))
    check(not ok and code == "unsupported" and #adapter.writes == count, "Newer schema blocks both read fallback and writes")
    record.schemaVersion = 1; record.formatVersion = 2; adapter.files[B] = cjson.encode(record)
    status(store, "unsupported")
    adapter.faults.read = true
    status(store, "io_error")
end

do
    local adapter = memory(); local store = SaveStore.New(adapter)
    check(store:Save(world(0)), "Seed uncertain-write world")
    adapter.faults.verifyRead = true
    local ok, _, code = store:Save(world(1))
    check(not ok and code == "uncertain", "Cannot claim success when verification read fails")
    local count = #adapter.writes
    check(not store:Save(world(2)) and #adapter.writes == count, "Uncertain save locks later mutations")
    adapter.faults.read, adapter.faults.verifyRead = nil, nil
    check(status(store, "ok").revision == 1, "Reload reconciles committed candidate")
    adapter.faults.reportFailure = true
    check(store:Save(world(2)), "Readback proves commit despite write error")
    check(status(SaveStore.New(adapter), "ok").revision == 2, "Reconciled result survives restart")
    adapter.faults.reportFailure, adapter.faults.noWrite = nil, true
    ok, _, code = store:Save(world(3))
    check(not ok and code == "write_failed", "Synchronous rejected write over old slot is a definite failure")
    adapter.faults.noWrite = nil
    check(store:Save(world(3)), "Definite rejected write can be retried without uncertainty deadlock")
end

do
    local first, second = memory(), memory()
    check(SaveStore.New(first):Save(world(0)), "First conflicting snapshot seed")
    local different = world(0); different.rngState = 999
    check(SaveStore.New(second):Save(different), "Second conflicting snapshot seed")
    first.files[B] = second.files[A]
    status(SaveStore.New(first), "corrupt")
    local count = #first.writes
    check(not SaveStore.New(first):Save(world(1)) and #first.writes == count, "Equal-generation divergent snapshots protected")
    local other = memory(); different.worldId = "other-world"
    check(SaveStore.New(other):Save(different), "Other-world seed")
    first.files[B] = other.files[A]
    status(SaveStore.New(first), "corrupt")
end

do
    -- Exercise the production File adapter against API-shaped objects as well as
    -- injected adapters. This checks calls, not physical disk or Maker behavior.
    local previousFile, previousSystem = File, fileSystem
    local previousRead, previousWrite = FILE_READ, FILE_WRITE
    local files, closes, flushes = {}, 0, 0
    FILE_READ, FILE_WRITE = 0, 1
    fileSystem = {
        FileExists = function(_, path) return files[path] ~= nil end,
        CreateDir = function(_, path) check(path == "saves", "File adapter uses relative save directory"); return true end,
    }
    File = function(path, mode)
        return {
            IsOpen = function() return true end,
            ReadString = function() check(mode == FILE_READ, "Read mode correct"); return files[path] end,
            WriteString = function(_, text) check(mode == FILE_WRITE, "Write mode correct"); files[path] = text; return true end,
            Flush = function() flushes = flushes + 1 end,
            Close = function() closes = closes + 1 end,
        }
    end
    check(SaveStore.New():Save(world(0)), "Default File adapter saves verified snapshot")
    check(status(SaveStore.New(), "ok").revision == 0, "Default File adapter loads")
    check(closes >= 3 and flushes == 1, "File handles closed and write flushed")
    File, fileSystem, FILE_READ, FILE_WRITE = previousFile, previousSystem, previousRead, previousWrite
end

-- Deferred cloud fake exercises actual async boundaries and duplicate callbacks.
local function fakeCloud()
    local cloud = { values = {}, queue = {}, writes = 0, timeout = false, commitOnTimeout = false }
    function cloud:Get(key, events)
        table.insert(self.queue, function()
            if self.readFailure then events.error(-1, "offline"); return end
            if self.readError then events.error(self.readError.code, self.readError.reason); return end
            events.ok({ [key] = self.values[key] })
            if self.duplicate then events.ok({ [key] = self.values[key] }) end
        end)
    end
    function cloud:Set(key, text, events)
        self.writes = self.writes + 1
        table.insert(self.queue, function()
            if self.writeError then
                local failure = self.writeError
                if failure.commit then self.values[key] = text end
                if failure.verifyReadError then self.readError = failure.verifyReadError end
                events.error(failure.code, failure.reason)
                return
            end
            if self.timeout then
                if self.commitOnTimeout then self.values[key] = text end
                self.lastTimedOut = { key = key, text = text, events = events }
                events.timeout()
            else self.values[key] = text; events.ok() end
        end)
    end
    function cloud:Drain()
        local steps = 0
        while #self.queue > 0 do
            steps = steps + 1; assert(steps < 100, "Async loop did not settle")
            table.remove(self.queue, 1)()
        end
    end
    return cloud
end

do
    local cloud = fakeCloud(); local store = SaveStore.NewCloud(cloud)
    local calls, loadStatus = 0, "pending"
    store:LoadAsync(function(_, result) calls = calls + 1; loadStatus = result end)
    check(loadStatus == "pending", "Cloud load waits for asynchronous callback")
    cloud:Drain(); check(loadStatus == "missing" and calls == 1, "Cloud distinguishes missing")
    local result, code
    store:SaveAsync(world(0), function(ok, _, failure) result, code = ok, failure end)
    local busyCode
    store:SaveAsync(world(0), function(_, _, failure) busyCode = failure end)
    check(busyCode == "busy", "Cloud store rejects overlapping commands")
    cloud:Drain(); check(result == true and cloud.values[CA] ~= nil, "Cloud writes and verifies snapshot")
    cloud.duplicate = true; calls = 0
    SaveStore.NewCloud(cloud):LoadAsync(function(loaded, st)
        calls = calls + 1; check(st == "ok" and loaded.revision == 0, "Cloud cold load keeps state")
    end)
    cloud:Drain(); check(calls == 1, "Repeated SDK callback delivered once")
    cloud.timeout, cloud.commitOnTimeout = true, true
    store:SaveAsync(world(1), function(ok) result = ok end)
    cloud:Drain(); check(result == true and cloud.values[CB] ~= nil, "Timed-out write reconciles when already committed")
    cloud.commitOnTimeout = false
    store:SaveAsync(world(2), function(ok, _, failure) result, code = ok, failure end)
    cloud:Drain(); check(not result and code == "uncertain", "Unacknowledged cloud write stays uncertain")
    store:LoadAsync(function(_, st) loadStatus = st end)
    cloud:Drain(); check(loadStatus == "io_error", "Old snapshot cannot unlock a possibly pending cloud write")
    local late = cloud.lastTimedOut
    cloud.values[late.key] = late.text; late.events.ok()
    store:LoadAsync(function(loaded, st) loadStatus = st; result = loaded and loaded.revision end)
    cloud:Drain(); check(loadStatus == "ok" and result == 2, "Late commit is reconciled by explicit reload")
    cloud.readFailure = true
    SaveStore.NewCloud(cloud):LoadAsync(function(_, st) loadStatus = st end)
    cloud:Drain(); check(loadStatus == "io_error", "Cloud outage is not a missing save")
    local count = cloud.writes
    SaveStore.NewCloud(cloud):SaveAsync(world(3), function(ok) result = ok end)
    cloud:Drain(); check(not result and cloud.writes == count, "Cloud read failure prevents writes")
    cloud.readFailure = false
    local newer = cjson.decode(cloud.values[CA]); newer.schemaVersion = 2
    cloud.values[CA] = cjson.encode(newer)
    SaveStore.NewCloud(cloud):LoadAsync(function(_, st) loadStatus = st end)
    cloud:Drain(); check(loadStatus == "unsupported", "Cloud upgrade slot blocks older fallback")
    count = cloud.writes
    SaveStore.NewCloud(cloud):SaveAsync(world(3), function(ok, _, failure) result, code = ok, failure end)
    cloud:Drain(); check(not result and code == "unsupported" and cloud.writes == count, "Cloud upgrade never overwritten")
end

do
    local cloud = fakeCloud(); local store = SaveStore.NewCloud(cloud)
    local result, code, loadedRevision
    store:SaveAsync(world(0), function(ok) result = ok end)
    cloud:Drain(); check(result, "Seed cloud before rate-limit rejection")
    local firstSnapshot = cloud.values[CA]
    cloud.writeError = { code = -429, reason = "send failed" }
    store:SaveAsync(world(1), function(ok, _, failure) result, code = ok, failure end)
    cloud:Drain()
    check(not result and code == "write_failed" and store.pending == nil,
        "Documented rate-limit rejection is retryable after missing readback")
    check(cloud.values[CA] == firstSnapshot and cloud.values[CB] == nil,
        "Rejected cloud write leaves prior world unchanged")
    cloud.writeError = nil
    store:SaveAsync(world(1), function(ok) result = ok end)
    cloud:Drain(); check(result, "Same cloud store retries successfully after rate limit clears")

    cloud.writeError = { code = -429, reason = "send failed",
        verifyReadError = { code = -429, reason = "send failed" } }
    store:SaveAsync(world(2), function(ok, _, failure) result, code = ok, failure end)
    cloud:Drain()
    check(not result and code == "write_failed" and store.pending == nil,
        "Rejected write plus rate-limited readback does not wait for nonexistent generation")
    cloud.writeError, cloud.readError = nil, nil
    store:LoadAsync(function(loaded) loadedRevision = loaded and loaded.revision end)
    cloud:Drain(); check(loadedRevision == 1, "Reload recovers confirmed generation after rejected write")
    store:SaveAsync(world(2), function(ok) result = ok end)
    cloud:Drain(); check(result, "Retry succeeds after both write and read rate limits clear")

    -- Defensive reconciliation wins even over a contradictory rejection callback.
    cloud.writeError = { code = -429, reason = "send failed", commit = true }
    store:SaveAsync(world(3), function(ok) result = ok end)
    cloud:Drain(); check(result, "Exact committed snapshot still proves success after rate-limit callback")
end

for _, failure in ipairs({ { code = -1, reason = "send failed" }, { code = -429, reason = "unknown failure" } }) do
    local cloud = fakeCloud(); local store = SaveStore.NewCloud(cloud)
    cloud.writeError = failure
    local result, code, loadStatus
    store:SaveAsync(world(0), function(ok, _, err) result, code = ok, err end)
    cloud:Drain()
    check(not result and code == "uncertain" and store.pending ~= nil,
        "Undocumented error combination retains possible late-write protection")
    cloud.writeError = nil
    store:LoadAsync(function(_, status) loadStatus = status end)
    cloud:Drain(); check(loadStatus == "io_error", "Missing snapshot cannot unlock unknown write outcome")
end

print("career_save: " .. passed .. " assertions passed (in-memory I/O and fake cloud)")
return passed
