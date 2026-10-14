# 按钮玩法体检报告（逐屏 · 全量）

> 体检范围：44 个 screen 文件中的 action 按钮（交互型玩法屏），对照 `scripts/*.lua` 系统函数实现逐一核对。
> 方法：`grep ^function X.Y(` 签名 → 比对屏内按钮 `onClick` 调用 → 读函数体确认是否真生效/持久化/给反馈。
> 结论先行：**系统函数实现度约 95%，不存在"函数不存在"类硬报错。"点了没反应/玩法不完善"由三类根因造成。**

---

## 图例

| 标记 | 含义 |
|------|------|
| ✅ | 生效：按钮→系统→状态变更→持久化→有反馈，全链路通 |
| ⚠️ | 被门槛卡死（设计层，非 bug，需你定方向） |
| ❌ | 抛错且无副作用 |
| 🐛 | 声明≠生效（逻辑 bug，函数跑了对但结果错/恒无效） |
| 🚫 | 函数已实现但 UI 未接按钮（功能不可达） |

---

## TL;DR 三大根因

1. **反馈缺失（主因）**：仅 **4 个屏**有 `lastMsg` 操作反馈（Rivalry / StarRecruit / CareerArc / Region）。其余 ~40 屏的 action 按钮点下去**没有任何可见提示**——即便系统改了 state，玩家也看不到变化，体感即"没反应 / 玩法不完善"。
2. **逻辑 Bug（🐛）两处**：`RivalrySystem.TrashTalk` 的 `form` 加成恒不生效；`RivalrySystem.TryPoach` 满阵容下 100% 失败。
3. **UI 接线缺口（🚫）三处**：Academy 无"晋升梯队"、Draft 无"签约新秀"、Tactics 纯只读。

---

## A. 逻辑 Bug（🐛）—— 必须修

### A1. `RivalrySystem.TrashTalk` 的 `form` 加成是 no-op
- **位置**：`scripts/RivalrySystem.lua` **L160–201**
- **现象**：`TRASH_TALK` 表中 `mindgame` 选项声明 `form = 0.06`（下场对位战意 +6%），但函数体只处理 `opt.morale` / `opt.fans` / `opt.score`（L168–186），**从不读取 `opt.form`** → 该加成恒不生效。
- **影响**：嘴炮"心理战"选项形同装饰，玩家看不到战意变化，玩法深度打折。
- **修复**：在 L186 后加入 `opt.form` 处理（写入赛季战意 / 下场对位加成），并追加到 `effects` 文案。

### A2. `RivalrySystem.TryPoach` 满阵容下永远失败
- **位置**：`scripts/RivalrySystem.lua` **L208**
- **现象**：调用 `MarketSystem.SignPlayer(state, playerId, "premium")`。`SignPlayer` 强制 `state.roster.players[player.role] = playerId`，首发满员时返回 `{ok=false, "该位置已有选手"}`。常规满阵容下 **100% 失败** → 挖角实质不可用。
- **附带叙事失真**：把任意自由球员签下都归因为"从宿敌阵营挖来"（`L210` "从 X 阵营挖来"），未校验该自由球员真来自该宿敌势力。
- **修复**：先尝试 `SignPlayer`；若首发满员则**回退 `MarketSystem.SignToBench`**；文案仅在球员确实源自该宿敌势力时才写"挖角"。

---

## B. 死按钮反馈缺陷（RivalryScreen）

- **位置**：`scripts/ui/screens/RivalryScreen.lua` **L57–65（嘴炮）**、**L88–92（挖角）**
- **现象**：
  ```lua
  local res = nil
  pcall(function() res = RivalrySystem.TrashTalk(...) end)   -- 内部异常被吞
  if res and res.ok then lastMsg = ...
  elseif res then lastMsg = res.text end                       -- res 为 nil 时两分支都不命中
  ```
  当 `pcall` 吞掉 `TrashTalk` 内部异常时 `res` 仍为 `nil` → 不写 `lastMsg` → 屏重渲染无反馈 → 按钮"像死的"。**这就是你真机看到的"反馈不弹"根因之一。**
- **修复**：增加 `else` 分支捕获 `pcall` 第二返回值，至少 `lastMsg = "（操作未完成，请重试）"`，避免静默死按钮。

---

## C. UI 接线缺口（🚫）

### C1. `AcademyScreen` 无"晋升梯队"按钮
- `AcademySystem.PromoteTrainee(state, role)` 已实现（`scripts/AcademySystem.lua` **L115**），但 `AcademyScreen` 未接按钮 → 青训永远无法升一队。
- **修复**：在梯队列表加 `PromoteTrainee` CTA（含梯队空位校验）。

### C2. `DraftScreen` 无"签约新秀"按钮
- `DraftSystem.PickRookie(state, playerId)` 已实现（`scripts/DraftSystem.lua` **L137**），但 `DraftScreen` 只展示池 + `CloseDraft` → 选秀不可签约。
- **修复**：在候选列表加 `PickRookie` CTA（含空位校验）。

### C3. `TacticsScreen` 纯只读
- `TacticsSystem.SetTactics(state, id)` 已实现（`scripts/TacticsSystem.lua` **L103**），但屏只读展示 → 玩家无法在屏内切换战术。
- **修复**：加 `SetTactics` 选择 CTA + 反馈。

---

## D. 系统性反馈 / 持久化缺口（体感主因）

- 仅 **7 个屏文件**调用 `SaveManager.Save`（Academy / Coach / CareerArc / Draft / Rivalry / Region / StarRecruit），仅 **4 个**有 `lastMsg` 反馈（CareerArc / Region / Rivalry / StarRecruit）。
- 其余 ~40 屏的 action 按钮：点下去即便系统改了 state，玩家也**看不到任何提示**，体感即"没反应 / 玩法不完善"。
- 注意：部分系统（Negotiation / Market 等）内部自带 `Save`，故"屏内无 `SaveManager.Save`"不等于"不持久"；但**"无反馈"是实打实的 UX 缺陷**。
- **低风险批量修复**：为这些屏的 action 按钮统一补 `lastMsg` / `alert` 反馈（从系统返回 `res.text` 取文案），必要时补 `SaveManager.Save`（系统不自存时）。

---

## E. 已验证完整（✅）

`NegotiationSystem` 状态机（Start/Counter/Accept/Delegate/Cancel/Conclude）· `CareerArcSystem.Resolve` · `MarketSystem`（SignToBench / AcceptOffer / RejectOffer / ListPlayer / UnlistPlayer）· `FacilitiesSystem` · `StaffSystem.UpgradeStaff` · `MerchSystem`（Produce / SetPrice / ToggleListing）· `MultiRegionSystem`（CanOpen / Open / SetTier）· `ShareSystem`（RaiseRound / BuyBack）· `StockSystem`（Ipo / Short / Secondary / BuyBack / Merge / Acquisition）· `PressSystem`（CheckTrigger / Respond）· `TrainingSystem.PersonalTrain` · `RosterSystem.RenewContract` · `HeroSystem` BP（StartMapVeto / BanMap / PickMap / StartBp / BanHero）· `CompetitionSystem` 赛果结算 · `HighlightScreen` / `MatchResultScreen` "收下荣耀" `seen` 持久化。

---

## F. 门槛起 click 多步流（⚠️，需你拍板）

- **StarRecruitScreen 五步**：`GrantCredential` 需 `声望 ≥ 30 + 评级*8`，常不满足 → 卡门槛（设计）。建议屏内给明确进度提示"还差 X 声望"。
- **RegionScreen 开新区**：受联赛 / Pro 级 / 现金门槛限制（设计）。
- **StockScreen 做空 / 并购**：门槛与风险高（设计）。
- 这些是要"更深的玩法"还是"更清晰的引导"，属设计决策，**不擅自改**。

---

## G. 分批改计划（待你 go-decision）

| 批次 | 内容 | 风险 | 建议 |
|------|------|------|------|
| **批次 1** | A1 + A2 + B + C1 + C2 + C3（6 处确定性修复） | 低，零设计风险 | **建议先全做** |
| **批次 2** | D 系统性补 `lastMsg` 反馈，覆盖 ~40 屏 action 按钮 | 低，高体感收益 | 紧随批次 1 |
| **批次 3** | F 门槛起 click 流的引导 / 深度 | 需设计决策 | 你定方向后做 |

> 广告体系（setup-ads）按原约定**延后至发布后**，不在本轮范围。
