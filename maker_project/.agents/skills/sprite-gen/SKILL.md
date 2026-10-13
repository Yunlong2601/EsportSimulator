---
name: sprite-gen
description: 从角色图、对象图或非角色素材图生成 2D 游戏透明精灵表(序列帧)。当用户说"生成序列帧"、"做精灵表"、"生成动画帧"、"sprite gen"、"角色动画生成"、"图生序列帧"、"非角色序列帧"、"做sprite"时使用此技能。
---

# 2D 精灵序列帧生成

生成游戏可用的透明精灵表(图集 PNG + 配置 JSON + WebP 动画预览)。

**流程由状态机工具 `next` 驱动。** 你不再自行编排步骤:循环调用 `next`,它依据当前进度(`_progress.json`)和你回传的事件,返回下一步该做的**唯一**动作(descriptor)。起点定位、门禁、进度记录全部由 `next` 处理。

按需读取(仅查配置字段/图集语义时):`refs/config_options.md`。

## 你的职责

你是执行者:**循环调 `sprite_gen` → 按返回的 descriptor 执行唯一动作 → 用控制动词(`next`/`redo`/…)带决定再调**。★ 门禁由引擎强制——展示产物、停下等用户,不得替用户决定。确定性步骤(预处理/拆帧等)由引擎内部跑,你不碰。

## 铁律

1. **触发本 skill 后,先确认 MCP 工具 `sprite_gen` 是否可用。** 不可用(当前环境未注册该工具)时,只回一句友好提示并立即终止——不进入新开会话提示、不收集参数、不调用任何工具。提示文案: `当前环境尚未支持精灵生成,敬请期待。`
2. **确认工具可用后，仅在当前会话首次触发本 skill 时处理“是否新开会话”。** 若用户已明确表示“已新开/继续/不新开”，或是在新开会话提示后继续提供素材、精灵名、动画需求等任务信息，均视为继续当前会话，否则先停下来询问用户,不能开始生成或调用 `sprite_gen` / MCP 工具。
3. **流程只由 `next` 驱动。** 不得自行编排、跳步,或从用户需求直接跳到生成/拆帧/导出;每一步先问 `next`。
4. **所有 prompt 必须通过 `sprite_gen` 工具合成,不得自行编写。**
5. **所有功能只通过 MCP 工具 `sprite_gen` 调用。** 入参 `method`=控制动词(next/goto/redo/add/update/describe/help),`params`=该动词的 flags 数组;不得绕过工具。本文档中形如 `<method> <params...>` 的命令块/内联命令,均表示一次 `sprite_gen` 调用(首词为 `method`,其余为 `params`)。
6. **门禁不可绕过,是真实停顿点。** `kind=gate` 时原样展示 `gate.present` 逐字内容,停下等用户真实作答,拿到明确决定才按 `gate.accept` 用 `next`/`redo` 继续。"继续/你看着办"不等于审核通过;不替用户决定、不自动选缺省、不一口气跑完;`answer_hint` 的"可用默认"是给用户的提示,不是你的许可。**付费确认例外:`create_video_task` 返回确认要求(结果含 `confirmation_required=true`,即预估消耗超过上游阈值)时,属 agent_task 中的真实停顿点——必须把返回的预估原样告知用户、停下等其明确同意,再以完全相同参数带 `user_confirmed=true` 重发;不得因已选模型、项目偏好、流程需继续或此前别次确认而自动授权。未返回确认要求时不要自行加确认。**
7. **只按 descriptor 执行。** descriptor 给 `gate`/`agent_task`/`done` 中的哪个就只做哪个,不自造步骤、不混流程。确定性步骤由引擎内部跑,不在你的指令面。
8. **对话只呈现成品,机制留在内部。** 用户可见的只有 gate 的 `present` 与 descriptor 的 `say`;实现名词(`next`/descriptor/gate 等)、工具/文件/格式/制作过程都不进对话——只谈成品(动画、精灵表)。**不自创过程旁白:除 descriptor 的 `say` 外,不主动发起工具前导说明、计划或状态播报(Do not emit tool preambles, upfront plans, or status updates)。** `say` 是引擎批准的唯一过程消息——非空即原样说出、说完**同轮继续** `do`(见执行循环第 2 条);`do` 是内部执行细节,照做不复述。
9. **做不到 / 发现不符预期,先停下反馈,不静默处理。** 用户诉求当前无法满足(如流程尚未走到该步)、或结果与预期不符时,如实说明当前状态并给出可行选项;不得擅自改做别的、不带 `--event` 闷头恢复流程、或用近似结果顶替。

## 开始前

精灵生成是独立任务(耗时长、多次交互),不要用 subagent。向用户提示(本段即首轮回复的完整内容):
```
你可能希望使用 sprite-gen 工具生成精灵/序列帧动画。
本工具工作流程较长，建议新开会话来执行精灵生成，避免占用当前对话上下文。
如需新开，复制以下内容发给新会话：

---
请使用 sprite-gen 帮我生成精灵/序列帧动画。
我已新开会话,请在当前会话继续执行。
素材类型: [角色/对象动画 或 通用序列帧]
素材参考图: [粘贴路径或拖入]
精灵名: [填写]
---

若继续当前会话,请补充后三项。
```

**入口规则:**
- 当前会话首次触发本 skill、尚未展示过上述模板，且用户未表明会话归属 → 只原样回复模板并停。
- 必填槽位(素材类型 / 参考图 / 精灵名)缺任一 → 只追问缺项,集齐前不进流程、不调工具。
- 三项齐全 → 调 `next --sprite-name <精灵名> --sprite-type <character|generic>` 启动状态机,按返回的 descriptor 执行(视角/基础项由 collect_input 门禁展示,三项已有则不重复问)。

## 执行循环

> 以下是你**内部**如何驱动流程,对用户不可见(见铁律 8):把 descriptor 翻译成自然的用户交互,别把机制本身说出来。

1. 调 `sprite_gen`:`method` = 控制动词,`params` = 该动词的 flags。**首轮** `next --sprite-name <名> --sprite-type <character|generic>` 启动;之后**每次都带 `--sprite-name <名>`**(身份句柄);恢复会话直接 `next --sprite-name <名>`(无 payload)。当前可用的全部指令见**首轮 descriptor 的 `commands`**(或随时 `help`),签名不用背。
2. descriptor 只有三种 kind(`gate` / `agent_task` / `done`),按它执行**唯一**动作。`say` 是对用户的附带提示(非空→说这一句,null→静默),**不是停顿点**;`do` 是内部执行动作,照做不复述;**do not emit tool preambles, plans, or status updates**(见铁律 8)。
   - `gate`(要用户决定):**原样**展示 `gate.present`(逐字 `content` / `reference` / `artifacts` / `tool_checklist`),停下等用户。`gate.accept` 是这一步的出路(每个动词带人话 `label` + 要填的 payload schema):照用户决定选动词提交——`next --payload <...>`(确认表单 / 选定候选 / 审核通过;审核通过无 `--payload`)、或 `redo`(重出 / 重做本步)。`gate.answer_hint` 存在时**必须据它引导用户作答、不得省略或漏掉**,可自然融入、不必逐字硬贴。逐字内容不得改写。
   - `agent_task`(要你做一次外部创意):按 `do` 调 descriptor 点名的那**一个**外部工具(`edit_image`/`generate_image` 出候选、`create_video_task` 生成),完成后 `next --payload <produce 要的字段>`(如 video_ref)。`say` 非空就先说这一句(如"正在生成动画,请稍候"),说完**同轮继续**、不停顿。**例外:该工具返回确认要求(`confirmation_required=true`)时,按 `do` 先向用户展示返回的预估并停下等明确同意,再以相同参数带 `user_confirmed=true` 重发(见铁律 6 付费确认例外)。**
   - `done`:流程结束。
3. 回到 1。

**确定性步骤(预处理 / 建提示词 / 拆帧导出等)由引擎内部自动跑,你看不到、也不用调**——`ask`/`act` 之间引擎已把它们跑完,产物(如拆帧验收清单)会出现在下一个 `ask` 的 `present` 里。

**重做 / 回退 / 改参(随时)**:`redo`(重做本步,或 `--anim-id <动画>`)/ `add --anims '<json>'`(新增动画)/ `goto --stage <阶段> | --anim-id <动画>`(跳回)/ `update --set '<json>'`(改精灵参数)或 `update --anim-id <动画> --set '<json>'`(改某动画参数)。`update` 会**先停在确认门**展示这次改动的影响面(逐字 `present`,原样给用户看),`next` 才真正应用并重跑、`redo` 取消——与其它门一样等用户真实作答。可改字段见 `help`/首轮 `commands`。节点**幂等覆盖**——即使产物已存在也照做,不要因"已经生成过"而拒绝用户。

`next` 自动维护 `_progress.json` 与起点定位。门禁未收到有效决定不推进(代码强制)。

## 工作目录与输出目录

`work_dir` 是 sprite-gen 工作目录,用于保存配置、提示词、中间产物、参考图和预览。
`output_dir` 是游戏资产输出目录,最终精灵表写到这里。

目录参数一律用不透明句柄 `--sprite-name <名>`;真实 `work_dir` / `output_dir` 由工具据运行环境解析,你既不传也不改写字面路径(本地不友好)。不要根据素材路径推断或改写这两个目录。

## 产出结构

```
{work_dir}/{精灵名}/                    ← sprite-gen 工作目录下的本精灵子目录
├── _meta.json
├── _progress.json
├── _user_anims.json                   ← 来自用户指定的动画清单
├── _gen_images/
│   ├── ready.png
│   ├── ready.prompt.txt
│   ├── cutout_ref.png                  (非透明输入的抠图参考)
│   ├── cutout.prompt.txt               (非透明输入的抠图提示词)
│   ├── cutout_cand_{cnt}.png
│   ├── cutout.png
│   └── ready_cand_{cnt}.png
├── _gen_videos/
│   ├── <动画id>/
│   │   ├── anim.prompt.json
│   │   ├── anim.mp4
│   │   ├── frames/                    (临时中间帧,成功导出后自动清理)
│   │   ├── frames_key/                (K 模式临时中间帧,成功导出后自动清理)
│   │   └── frames_preview.webp
│   └── ...

{output_dir}/{精灵名}/                  ← 最终游戏资产输出目录
├── sprite.json                         (精灵入口;列各动画入口 spritesheet.json)
├── <动画id>/
│   ├── spritesheet.json + .png         (首页无编号)
│   ├── spritesheet-1.json + .png       (额外分页;由入口 relatedMultiPacks 关联)
│   └── ...
└── ...

assets/image/                           ← 云端精灵预览(工具自动生成,仅云端环境)
├── {精灵名}_{动画id}_frames_preview.webp
└── ...
```

## 配置与图集语义

普通生成只在用户要求解释配置项或展开更多选项时读取 `refs/config_options.md` 的配置字段部分。`sourceSize`/`pivot`/图集 JSON 语义仅在接入播放器、解释导出格式或排查运行时对齐问题时读取;自行开发播放器时再参考 `refs/spritesheet.schema.json`。需要解释某字段时,用 `rg -n "<字段名>|sourceSize|pivot|schema" refs/config_options.md` 精确读取,不要整读长文档。

配置优先级: `_user_anims.json`(动画级) > `_meta.json`(精灵级) > `config.json`(全局)。

用户可在**任何阶段**独立要求"展开更多选项":`describe --sprite-name <名>`(引擎按有无 `_meta.json` 自动选"类型缺省"或"实际覆盖",你不用管)。返回的 `config_text` 是给用户看的完整配置分组,必须**原样展示**,不得摘要、改写、过滤或只列字段名。

## 指令一览(`sprite_gen` 的 method = 控制动词)

> 权威指令集以**首轮 descriptor 的 `commands` / `help`** 为准(脚本层实时生成,不怕文档滞后);下面只是速览。

| method | 职责 |
|--------|------|
| `next` | 推进:提交当前 `ask`/`act` 的决定,前进到下一停顿点(启动也用它) |
| `goto` | 跳转:回到某前置阶段(`--stage`)或某条动画(`--anim-id`) |
| `redo` | 重做:当前步,或指定动画(`--anim-id`) |
| `add` | 新增动画(`--anims '<json 数组>'`) |
| `update` | 改参数并重跑(`--set '<json>'` 改精灵;加 `--anim-id` 改某动画)。先停确认门展示影响、`next` 应用 / `redo` 取消。`--video-model 2.0|wan` 直接指定并记住本项目的视频模型(不走确认门) |
| `describe` | 只读:展开当前全部可调配置 |
| `help` | 只读:返回全量指令集 |

调用形如 `<method> <params...>` = 一次 `sprite_gen` 调用(`method`=动词,`params`=flags 数组)。确定性子命令(预处理 / 姿态 / 提示词 / 拆帧)由**引擎内部**执行,不在 agent 指令面。

## 依赖

- MCP 工具: edit_image / generate_image、create_video_task
- 视频生成模型:同一项目首次(且开发者未明确指定)由流程中的「模型选择」门询问一次,二选一 **Seedance 2.0 Fast** / **Wan 3.0**;选定后写入该项目 sprite-gen 工作根的偏好,后续不同精灵、新任务、会话恢复都沿用,不再重复问。开发者明确指定时用 `update --video-model 2.0|wan`(2.0=Seedance 2.0 Fast,wan=Wan 3.0):更新项目偏好与当前任务记录,不走选择门;待生成动画的配方在下一次进入生成前按新模型重建,已完成动画的配方与来源不变。生成动画时按该动画 `anim.prompt.json` 的 `video_model` 原值传给 `create_video_task` 的 `model`,不得自行改写或换模型。`create_video_task` 返回确认要求(`confirmation_required=true`,即预估消耗超过上游阈值)时,必须停下等用户明确同意后再带 `user_confirmed=true` 重发(见铁律 6 付费确认例外);模型选择本身不是付费授权,不按型号额外加确认。
