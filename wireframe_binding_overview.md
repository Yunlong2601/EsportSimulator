# 内层 Wireframe 屏真数据绑定收尾（9 屏）

## 范围
继续「写 → 验 → 部署」节奏，完成最后 9 个内层 wireframe 屏的真数据绑定，使 27 个内层屏（财务/股权/股票/周边/设施/转会/谈判/选手详情/媒体声望/比赛线/深度玩法/经营综合）全部接入真实系统。广告体系（setup-ads）按用户要求延后到发布后，本批未处理。

## 本次新增/改写（9 屏）

### 深度玩法 4 屏
- `DynastyScreen.lua` — DynastySystem：传奇点 / 王朝评级环 / 跨赛季目标 / 特权解锁 / 编年史。
- `RivalryScreen.lua` — RivalrySystem：宿敌列表（恩怨值·对位胜）+ 嘴炮（作用于等级最高宿敌）+ 挖角战（自由市场前 6）；反馈走模块级 `lastMsg`。
- `CareerArcScreen.lua` — CareerArcSystem：进行中剧情卡 + 选项结算（爆发/低谷/伤愈/续约）+ 生涯档案。
- `HighlightScreen.lua` — state.highlight 全屏纪念卡（宿敌战胜利等），收下荣耀后标记 seen。

### 经营综合 5 屏
- `GoalCenterScreen.lua` — GoalSystem：本季目标进度 + 董事会支持度 + 类型分级。
- `RegionScreen.lua` — MultiRegionSystem：分部摘要（战绩/战力/下场）+ 开设 / 切换投入档位。
- `StarRecruitScreen.lua` — StarRecruitSystem：五步招募流程（问答→凭证→击败宿敌→谈判→签约），按当前步推进。
- `GalleryHubScreen.lua` — ProfileSystem：结局图鉴收集度环 + 结局清单。
- `HallOfFameScreen.lua` — ProfileSystem：荣誉墙条目（夺冠/区域冠军/连续董事会达标/估值里程碑）。

## 关键修复
- 4 屏 `alert` 反馈块 `lines = { { msg, color } }` 漏一个闭合 `}`（缺外层 table 收尾）——全量 `check_all_lua.js` 抓出 `'}' expected near ')'`，已补齐。教训：单文件 `check_lua54.js` 仅回显末文件状态会漏报，以全量扫描为准。
- 反馈显示：点击回调闭包捕获的 `ctx.flash` 在 `ctx.nav` 重新 Build 后丢失，改为模块级 `lastMsg` 缓冲跨渲染周期保留。

## 验证
- `check_all_lua.js`：101 文件，真错 0（仅 HeroSystem.lua 中文键误报，已知 false positive）。
- `check_forward_refs.py`：0 可疑；`check_agent_name_access.py`：0 可疑。
- 运行时日志：无 LoadChunk / error。

## 部署
- 安全 git 流：`fetch origin main && merge FETCH_HEAD --no-edit` → push（无竞态）。
- `maker_build_current_directory(target_dir=工程根)`：远端 100% 完成，preview_refresh 200，设备已拿到新构建。
