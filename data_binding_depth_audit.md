# 取数深度逐屏审计（44 屏）

> 背景：用户要求"继续绑定 27 个内层 wireframe 屏（finance/stock/negotiation/player_* 详情页）"。
> 实测结论：**那 27 屏已全部是真数据绑定**，不存在待绑的 wireframe。
> 本审计对全部 44 个屏做取数深度评级，并定位当前唯一真 wireframe 缺口。

## 方法

1. 读 `main.lua` 路由：`SCREENS[id].Build(navigate)` —— 真实渲染的是 `ui/screens/*.lua` 模块，不是 `ScreenFactory`。
2. 检测哪些屏 `Build` 直接 `return Factory.Build(id, navigate)`（走 `ScreenFactory` 的 `SPEC[id]` 假数据）。
3. 对每个自带 `buildBlocks` 的屏，核查是否 `pcall` 读 `CompanyState` / `*System` / `*Catalog` / `PlayerFocus` 真实 getter。
4. 静态启发式扫描数据块（table/standings/ztable/playertable/benchlist/kvrows…）是否 100% 字面量；对命中项逐屏人工读源码判定（确认全是筛选 chip / 列头 / 分段标题 / 导航 CTA 等 UI chrome，非假数据）。

## 结论

- **38 屏 = 真数据绑定（FULL）**，其中部分屏的数据要等存档推进到对应阶段才生成（见"推进后填充"列），属**取数门控**而非绑定缺失。
- **6 屏 = 仍走 `ScreenFactory` 假数据 SPEC**（系统/聚合屏）：`menu` `more` `setup` `settings` `savemanager` `adcenter`。这是当前**唯一真 wireframe 缺口**。
- **唯一功能性断点**：`more`（深度/系统 hub）的 `actiongrid` 财务/股权/设施/周边/媒体/图鉴/名人堂/目标/地区/分析/排行/设置 **全部空 `onClick`** → 真机点了无反应。

> 注：旧 `2026-08-28.md` 笔记"finance/stock/negotiation/transferboard/starrecruit/player_* 等 27 屏 stub"已严重过时，以本审计为准。

## 取数深度评级表（44 屏）

符号：✅ FULL（真数据，始终有内容）｜⏳ FULL-门控（绑定真数据，但需存档推进才填充）｜🟡 设计性占位（明确延后，非 bug）｜🔲 WIREFRAME（走 ScreenFactory 假数据）

### 经营 / 市场（用户点名区）
| 屏 | 评级 | 绑定来源 | 备注 |
|----|------|----------|------|
| FinanceScreen | ✅ | `CompanyState`/现金流/估值/周薪/收支历史 | 本会话已复核 |
| StockScreen | ✅ | `StockSystem` 行情/做空/收购/分红 | 本会话已复核 |
| NegotiationScreen | ✅ | 进行中/历史谈判 | 本会话已复核 |
| MarketScreen | ✅ | 转会窗/我的挂牌/报价/自由市场 | 本会话已复核 |
| TransferBoardScreen | ⏳ | 成交榜/传闻/标王 | 真数据；需发生转会才填充 |
| ShareScreen | ✅ | 持股比例/融资轮次/回购 | — |
| MerchScreen | ✅ | 商品/收入 | — |
| PressScreen | ✅ | 发布会邀请/回应 | 本会话已复核 |
| RegionScreen | ✅ | `MultiRegionSystem` 分部/预开设 | — |
| RivalryScreen | ✅ | 宿敌/嘴炮/挖角 | — |

### 战队 / 选手详情（用户点名区）
| 屏 | 评级 | 绑定来源 | 备注 |
|----|------|----------|------|
| RosterScreen | ✅ | `RosterSystem.GetRosterPlayers` | — |
| PlayerProfileScreen | ✅ | `PlayerFocus`+真实选手 | 本会话已复核 |
| PlayerAttrsScreen | ✅ | 真实属性 0-100 | — |
| PlayerContractScreen | ✅ | 合同/周薪/挂牌状态 | — |
| PlayerStatsScreen | ⏳ | 体能/士气/时间线 | 赛季数据需打比赛后填充 |
| TacticsScreen | ✅ | 战术/首发/替补（真实） | 本会话已复核 |
| PersonalTrainScreen | ✅ | `TrainingSystem` 侧重/预览 | 本会话已复核 |
| AcademyScreen | ✅ | 青训候选（真实） | — |
| CoachScreen | ✅ | 教练组（真实） | — |
| DraftScreen | ✅ | 新秀池（真实） | — |
| LockerRoomScreen | ✅ | 关系/矛盾（真实） | — |

### 联赛 / 比赛
| 屏 | 评级 | 绑定来源 | 备注 |
|----|------|----------|------|
| LeagueScreen | ⏳ | `CompetitionSystem` 积分榜/战力榜 | 本会话已复核；积分榜需推进≥1周 |
| MatchScreen | ✅ | 赛前准备/对手 | — |
| BpScreen | ✅ | 地图/英雄 BP | — |
| MatchResultScreen | ⏳ | 战报 | 需打完比赛 |
| MatchAnalyticsScreen | ⏳ | `MatchAnalytics` 近期/对手情报 | 本会话已复核；需 Lv3 解锁+打比赛 |

### 叙事 / 系统 / 聚合
| 屏 | 评级 | 绑定来源 | 备注 |
|----|------|----------|------|
| DashboardScreen | ✅ | 摘要+目标（已修 goal tip） | — |
| StarRecruitScreen | ✅ | 五步流程（含公关造势 CTA） | — |
| CareerArcScreen | ✅ | 生涯剧情 | — |
| DynastyScreen | ✅ | 王朝点/编年史 | — |
| ReputationScreen | ✅ | 声望/粉丝环 | — |
| GoalCenterScreen | ✅ | `state.goals.season` | — |
| HallOfFameScreen | ✅ | 荣誉墙 | — |
| HighlightScreen | ✅ | 高光纪念 | — |
| GalleryHubScreen | 🟡 | 结局收集（真实） | 选手/英雄图鉴按设计延后（占位说明已写明） |
| LeaderboardScreen | ✅ | `LeaderboardSystem` 实力榜 | 本会话已复核 |
| FacilitiesScreen | ✅ | 设施列表 | — |

### 系统 / 聚合（真 wireframe 缺口）
| 屏 | 评级 | 走 SPEC | 问题 |
|----|------|---------|------|
| MoreScreen | 🔲 | `SPEC.more` | **actiongrid 12 项全空 onClick → 导航断** |
| MenuScreen | 🔲 | `SPEC.menu` | CTA 继续游戏/存档/设置 均无 onClick |
| SetupScreen | 🔲 | `SPEC.setup` | 开始新游戏 CTA 无 onClick |
| SettingsScreen | 🔲 | `SPEC.settings` | 列表无真实开关 |
| SaveManagerScreen | 🔲 | `SPEC.savemanager` | 存档槽无载入/删除动作 |
| AdCenterScreen | 🔲 | `SPEC.adcenter` | 观看/领取 CTA 无功能（setup-ads 已定延后发布后） |

## 关键判断口径

- **真机上看到某屏"空/像假数据"** 通常是 `⏳ 门控`：存档还没推进到生成该数据的阶段（排行榜要打比赛、战报要推进赛程、转会榜要发生交易、选手赛季数据要出场）。**不是绑定缺失**，推进几周自然填充。
- **`🟡 GalleryHub` 选手/英雄图鉴** 是按设计延后的统一入口（结局收集已真），非 bug。
- **`🔲` 6 屏** 才是真正需要动手的：其中 `more` hub 导航断裂影响最大（它本应串起财务/股权/设施/周边/媒体/图鉴/名人堂/目标/地区/分析/排行/设置 12 个入口）。

## 建议下一步（待你拍板）

1. **修 `more` hub 导航**（最小、最高体感）：把 12 项 actiongrid 接上 `ctx.nav(...)`。
2. **6 屏转真数据/可用**：menu/setup/settings/savemanager 从 `SPEC` 改为真实可用；adcenter 留待 setup-ads。
3. 维持现状（审计已完成，确认 27 屏早已绑定，无需再动）。
