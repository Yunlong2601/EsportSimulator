local CompanyState = require("CompanyState")

local MetaSystem = {}

MetaSystem.PATCHES = {
    { role = "top", roleLabel = "上单", name = "先锋版本", desc = "上单对线与先锋团战权重提升" },
    { role = "jungle", roleLabel = "打野", name = "野核版本", desc = "打野节奏与资源控制权重提升" },
    { role = "mid", roleLabel = "中单", name = "法术核心版本", desc = "中单操作与团战输出权重提升" },
    { role = "adc", roleLabel = "下路", name = "下路版本", desc = "下路对线与后期输出权重提升" },
    { role = "support", roleLabel = "辅助", name = "辅助游走版本", desc = "辅助联动与视野控制权重提升" },
    { role = nil, roleLabel = "全位置", name = "运营均衡版本", desc = "各位置权重均衡，无额外加成" },
}

function MetaSystem.GetMeta(state)
    state = CompanyState.Ensure(state)
    return state.meta
end

function MetaSystem.GetRoleBonus(player, metaRole)
    if not player or not metaRole then return 0 end
    if player.role == metaRole then return 8 end
    return 0
end

function MetaSystem.GetMetaLabel(state)
    local meta = MetaSystem.GetMeta(state)
    if not meta or not meta.name then return "运营均衡版本" end
    return meta.name
end

function MetaSystem.GetMetaRoleLabel(state)
    local meta = MetaSystem.GetMeta(state)
    if not meta or not meta.role then return "全位置均衡" end
    return "利好" .. (meta.roleLabel or "对应位置")
end

function MetaSystem.RollNext(state)
    state = CompanyState.Ensure(state)
    local current = state.meta and state.meta.role
    local candidates = {}
    for _, patch in ipairs(MetaSystem.PATCHES) do
        if patch.role ~= current then table.insert(candidates, patch) end
    end
    local patch = candidates[math.random(#candidates)]
    state.meta = { role = patch.role, name = patch.name, desc = patch.desc }
    CompanyState.RecordTimeline(state, "版本更新", "新版本「" .. patch.name .. "」上线：" .. patch.desc .. "。")
    return state.meta
end

return MetaSystem
