-- secondline/Bridge.lua — 交叉共生桥接层（§5.6）
-- 铁律：单向只读主线 CompanyState，绝不回写。本模块只暴露 getter，不暴露 setter。
-- 若任何调用方试图修改返回的主线表，视为 P0 缺陷（运行期不强制，靠注释 + code review 约束）。
local Bridge = {}

-- 只读引用主线快照。无主线存档时返回虚构战队，不强制依赖主线。
function Bridge.GetMainLineSnapshot()
    local CompanyState = require("CompanyState")
    local main = CompanyState.GetState()
    if not main or not main.company then
        -- 缺失兜底：纯生涯模式开局，返回虚构战队「星环学院队」
        return {
            hasMain = false,
            teamName = "星环学院队",
            league = "次级联赛",
            week = 1,
            seasonState = "regular",
            roster = {},
            latestResult = nil,
        }
    end
    local LeagueCatalog = require("LeagueCatalog")
    local rosterIds = main.roster and main.roster.players or {}
    local rosterNames = {}
    for role, pid in pairs(rosterIds) do
        if pid and pid ~= "" then
            local pl = (LeagueCatalog.GetPlayer and type(LeagueCatalog.GetPlayer) == "function")
                and LeagueCatalog.GetPlayer(pid) or nil
            table.insert(rosterNames, { role = role, name = pl and pl.name or pid })
        end
    end
    -- 只读取最近一条赛果（results 末位），供叙事呈现
    local results = main.league and main.league.results or {}
    local latest = results[#results]
    return {
        hasMain = true,
        teamName = main.company.name or "Legacy Gaming",
        league = main.company.league or "pro",
        week = main.company.week or 1,
        seasonState = main.company.seasonState or "regular",
        roster = rosterNames,
        latestResult = latest or nil,
    }
end

return Bridge
