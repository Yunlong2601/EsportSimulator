---
name: run-lua-validate
description: "用 UrhoXRuntime 验证 Lua 脚本：检测运行时报错（validate 模式）或截图验证渲染效果（surfaceless 模式）。Use when (1) 需要检查 Lua 脚本是否运行时报错/crash, (2) 需要截图看渲染效果是否正确, (3) 用户说\"验证一下\"/\"跑一下看看\"/\"截个图\"/\"validate\"/\"有没有报错\", (4) 修改了游戏脚本后想确认没有 regression, (5) 需要自动化测试 Lua 游戏逻辑。SKIP when 用户只需要程序化生成/批处理（用 run-lua-headless），或只需要本地 LSP 检查语法。"
---

# run-lua-validate — 验证 Lua 脚本 + 截图

## 两种模式

| 模式 | 用途 | 关键参数 | 产出 |
|------|------|---------|------|
| **validate**（逻辑验证） | 检查脚本是否运行时报错/crash | `-validate` | JSON 报告 + exit code |
| **screenshot**（截图验证） | 看渲染效果是否正确 | `-screenshot=` | PNG 截图文件 |

同一个二进制，运行时用参数选择。

## 安装 / 自动更新（每次调用前跑一次）

```bash
python3 <项目根>/.cli/install-urhox-runtime.py --dest <项目根>/.cli
```

自动识别平台，从 CDN 下载并原子解压（首次约 35MB，之后未更新约 50ms 跳过）。

## 平台差异（只有这三行）

| | Linux | Windows | macOS |
|---|---|---|---|
| 可执行入口 | `<项目根>/.cli/UrhoXRuntime` | `<项目根>\.cli\UrhoXRuntime.exe` | `<项目根>/.cli/UrhoXRuntime` |
| 截图模式额外要求 | 命令前加环境变量 + `-graphicssurfaceless`（见模式 2），**无需桌面/GPU** | 无额外参数，但需要**能开窗口的桌面会话** | 同 Windows |
| 超时 / python | `timeout` / `python3` | `Start-Process` + `WaitForExit` / `python` | `gtimeout`（`brew install coreutils`）/ `python3` |

validate 模式三个平台完全一致，不需要窗口。

## 🔴 限制：仅支持单机模式

联网多人游戏（`@runtime.multiplayer.enabled: true`）**不可用**——validate/screenshot 下没有服务端，网络连接会失败，表现为卡在连接、空场景、逻辑不触发。

```bash
python3 -c "
import json
d = json.load(open(r'<项目根>/.project/settings.json'))
print(d.get('@runtime', {}).get('multiplayer', {}).get('enabled', False))
"
```

`True` = 多人模式，本 skill 不适用；`False`（含字段不存在，多数项目如此）= 继续。不要用 `grep '"enabled"'` 代替——它会命中文件里别的同名字段。

---

## 模式 1: Validate（逻辑验证）

跑 N 帧、收集所有错误、输出 JSON 报告后退出。不产出渲染像素，很快。

```bash
mkdir -p <项目根>/.tmp
timeout 60 <项目根>/.cli/UrhoXRuntime main.lua \
  -tapcode_dir=<项目根> \
  -tool_mode \
  -graphicsheadless \
  -validate \
  -validate-frames=60 \
  -validate-timeout=45 \
  -validate-output=<项目根>/.tmp/validate.json
```

Windows：

```powershell
New-Item -ItemType Directory -Force -Path <项目根>\.tmp | Out-Null
$p = Start-Process -FilePath "<项目根>\.cli\UrhoXRuntime.exe" -NoNewWindow -PassThru `
  -RedirectStandardOutput "<项目根>\.tmp\validate_out.txt" `
  -RedirectStandardError  "<项目根>\.tmp\validate_err.txt" `
  -ArgumentList @(
    "main.lua", "-tapcode_dir=<项目根>", "-tool_mode", "-graphicsheadless",
    "-validate", "-validate-frames=60", "-validate-timeout=45",
    "-validate-output=<项目根>\.tmp\validate.json"
  )
if (-not $p.WaitForExit(60000)) { $p.Kill() }
```

> Windows + Codex CLI：若 `-validate-output` 的报告文件没产出，sandbox 掐掉 runtime 落盘通道是这个组合下的常见原因（和截图那节一样），可以先用完全相同的命令以 `sandbox_permissions: "require_escalated"` 重跑一次。但它不是唯一原因——提权后仍然没有报告，就按「没有报告文件时怎么判」逐项看。

### 参数说明

| 参数 | 说明 |
|------|------|
| `main.lua` | **必须是第一个位置参数**，相对 `<项目根>/scripts/` 的入口脚本 |
| `-tapcode_dir=<项目根>` | 项目根目录（自动挂载 `scripts/` 和 `assets/`） |
| `-tool_mode` | 资源从随包 pak 加载，不依赖散文件目录（必须） |
| `-graphicsheadless` | 不渲染像素，最快（**只用于 validate；截图模式不能带**） |
| `-validate -validate-frames=60` | 跑 60 帧后退出（默认 60，约 1-3 秒） |
| `-validate-timeout=45` | 引擎内部 wall-clock 硬超时，**默认只有 30 秒**。超时会被记成错误并写进报告。设成略小于外层 `timeout` |
| `-validate-output=<path>` | 报告写文件。**建议总是带上**：不带则报告打到 stdout 和日志混在一起 |
| `-validate-test=<path>` | 可选：额外加载一个断言脚本（里面用 `V.assert` / `V.assertNodeExists` / `V.atFrame` / `V.finish`），结果进报告的 `test_result` / `test_assertions` |
| `-skip_login` | `-tool_mode` / `-validate` 已隐含，可省 |

### 判断结果

只信报告，并且**先过滤已知噪音**。原始 `result` / exit code 会骗你：一个只创建 Scene + 一个 Box 的空白脚本，实测也会因为环境噪音得到 `result: FAIL` / exit 1。

```bash
python3 -c "
import json, sys
r = json.load(open('<项目根>/.tmp/validate.json'))
s = r['summary']
NOISE = ('[ShaderError]', 'Frame time spike', 'Could not initialize audio output')
real = [(ph, e) for ph, v in r['phases'].items() for e in v.get('errors', [])
        if not any(n in e['message'] for n in NOISE)]
print(f\"raw={r['result']} frames={r['frames_completed']} \"
      f\"lua={s['lua_errors']} res={s['resource_errors']} engine={s['engine_errors']}\")
for ph, e in real:
    print(f\"  [{ph}/{e['category']}] frame {e['frame']}: {e['message']}\")
if r.get('missing_resources'): print('  missing:', r['missing_resources'])
bad = bool(real) or bool(r.get('missing_resources')) or r['result'] == 'TIMEOUT' \
      or r.get('test_result') == 'FAILED'
print('❌ 有真实问题' if bad else '✅ 无脚本层问题（仅环境噪音）')
sys.exit(1 if bad else 0)
"
```

**真实问题**只有这几种：过滤后仍在的 error、`summary.lua_errors > 0`、`missing_resources` 非空、`result == "TIMEOUT"`、`test_result == "FAILED"`、以及**报告文件没产出**（不一定是 crash，按下面分流）。

**已知噪音**，出现了不要汇报成 bug：

| 噪音 | 含义 | 想消掉 |
|------|------|------|
| `[ShaderError] shadercache_runtime/...` | 不渲染时的着色器缓存不匹配，每次必有 | 忽略 |
| `Frame time spike: Nms` | 软渲染 / 首帧编译着色器，阈值默认 100ms | `-validate-spike-threshold=500` |
| `Could not initialize audio output` | 环境无声卡 | `-nosound` |
| `scene_stalled: true` | 场景没有逐帧变化（静态展示、纯 UI），**不是**卡死 | 忽略 |

### 没有报告文件时怎么判

**`exit 1` 不携带任何信息**——干净 run（环境噪音）、脚本报错、报告写盘失败，全都是 1。只有 `139`（段错误）和外层 `timeout` 的 `124` 有意义。所以按日志证据分流：

| 日志/现象 | 结论 | 处理 |
|---|---|---|
| 有 `[Validate] Failed to write report to <path>` | 引擎跑完了，只是写不出去 | 先确认输出目录已建好（实测目录不存在就是这条）；目录没问题就是写权限/sandbox 拦截 → 用相同命令提权重跑 |
| 日志根本没生成，或生成了但是空的（连 stdout 重定向文件都没落地） | 落盘通道被限（sandbox 常见） | 相同命令提权重跑（Windows + Codex CLI 见上文） |
| 日志有内容，但尾部有栈、或在 `[Validate] Mode enabled: frames=...` 之后戛然而止（这行是 INFO，需 `-log info` 才可见） | 进程提前死，**真 crash** | 看日志最后 30 行定位；提权没用 |
| 外层 `timeout` 触发（bash 里是 124） | 卡死，或压根没进 validate | 检查 `-validate` 是否拼对、帧数是否过大、脚本有没有死循环 |

提权重跑一次仍然没有报告，就别再提权了，回到上面另外两行。

报告字段速查：`result`（PASS/FAIL/TIMEOUT）、`frames_completed`、`summary.{lua,resource,engine,total}_errors`、`missing_resources`、`phases.{load,init,run,scene}.errors[]`、`max_frame_time_ms`、`test_result` / `test_assertions`（仅在带 `-validate-test` 时有意义）。

另有 `missing_engine_resources`（较新引擎才有）：引擎壳自身的启动资产（bootstrap 的本地化 JSON、加载动画贴图、默认字体那几个），裸项目必然缺，**仅供观察、不参与判级**——不要当成问题上报。旧二进制没这个字段，读的时候用 `r.get('missing_engine_resources', [])`。判成败仍然只看 `missing_resources`。

> 想让 `result` / exit code 直接当判据（不必过滤）：Linux 上改用真实渲染跑 validate——把 `-graphicsheadless` 换成 `-graphicssurfaceless` + 三个 Mesa 环境变量，并加 `-validate-spike-threshold=500`。实测干净脚本得到 `PASS` / exit 0（见场景 C）。代价是慢一些。

日志（stdout）只用来看细节：`[Script] ERROR:` / `Lua runtime error:` / `stack traceback:`。

---

## 模式 2: Screenshot（截图验证）

输出真实像素，再用视觉能力判断效果。

```bash
mkdir -p <项目根>/screenshots
LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe EGL_PLATFORM=surfaceless \
timeout 60 <项目根>/.cli/UrhoXRuntime main.lua \
  -tapcode_dir=<项目根> \
  -tool_mode \
  -graphicssurfaceless \
  -screenshot=<项目根>/screenshots/shot.png \
  -screenshot-frame=120 \
  -x 800 -y 600
```

**Windows / macOS**：去掉那三个环境变量和 `-graphicssurfaceless`（它们是 Linux 的离屏渲染开关，在别的平台只会打一条 `ignored` 的 warning 干扰判断），其余参数不变：

```powershell
New-Item -ItemType Directory -Force -Path <项目根>\screenshots | Out-Null
$p = Start-Process -FilePath "<项目根>\.cli\UrhoXRuntime.exe" -NoNewWindow -PassThru `
  -ArgumentList @(
    "main.lua", "-tapcode_dir=<项目根>", "-tool_mode",
    "-screenshot=<项目根>\screenshots\shot.png", "-screenshot-frame=120",
    "-x", "1080", "-y", "1920"
  )
if (-not $p.WaitForExit(60000)) { $p.Kill() }
Test-Path <项目根>\screenshots\shot.png
```

> **Windows + Codex CLI：这条命令用 `require_escalated` 跑**（`functions.shell_command` 的 `sandbox_permissions: "require_escalated"`）。默认 sandbox 下常见表现是进程 exit 0、脚本正常启动、日志也正常，但 PNG 没落盘。一开始就提权，能省掉一轮对参数的无效怀疑。

| 参数 | 说明 |
|------|------|
| `-screenshot=<path>` | 截图输出路径（相对路径按当前工作目录解析，用绝对路径最稳）。**目录必须先建好**，否则静音失败：exit 0、日志还写着 `captured`，但没有文件 |
| `-screenshot-frame=120` | 第几帧截（默认 30 太早，会截到 loading 画面；**用 ≥ 120**），截完自动退出 |
| `-x 800 -y 600` | 渲染分辨率，竖屏游戏用 `-x 1080 -y 1920` |
| `-graphicssurfaceless` | **仅 Linux**：无需 GPU / 桌面的离屏渲染，配合上面三个 Mesa 环境变量 |

### 判断结果

exit code 0 **不保证**有 PNG。先确认文件存在且非空，再用 `Read` 工具读图，用视觉能力判断。

```bash
ls -la <项目根>/screenshots/shot.png
```

### 没有 PNG 时按顺序排查

**先看一眼（Windows + Codex CLI）**：这条命令是以 `require_escalated` 跑的吗？如果不是，先提权重跑一次再继续——这个组合下最常见的原因就是它，往下逐项排查通常是白费一轮。

**然后加 `-log info` 重跑一次**：`[Screenshot] ...` 这些标记是 INFO 级，而 `-tool_mode` 默认只输出 WARNING 及以上，所以默认命令的日志里**一条 `[Screenshot]` 都看不到**——那不代表参数没生效。

看到了也别当成功依据：`[Screenshot] captured at frame N` 只表示"发出了截图请求"。实测把 `-screenshot=` 指向一个不存在的目录时，日志照样打 `captured at frame 120`、exit code 0，而文件根本没写出来。

| 顺序 | 检查 | 处理 |
|---|---|---|
| 1 | 输出目录存在吗？ | 先建目录。写盘失败是静音的 |
| 2 | 命令里有 `-graphicsheadless` 吗？ | 删掉，它明确表示"不渲染像素" |
| 3 | Linux：`-graphicssurfaceless` 和三个 Mesa 环境变量都带了吗？ | 缺任一个都可能拿不到像素 |
| 4 | 加了 `-log info` 后，日志里有 `[Screenshot] enabled: frame=... -> ...` 吗？ | 没有 = 参数真的没生效（写成了 `-screenshot <path>` 而不是 `-screenshot=<path>`、位置参数不是第一个、路径拼错） |
| 5 | 日志里有 `no Graphics subsystem` / `ignored` 类 warning，或 Windows/macOS 上当前没有桌面会话（service / SSH-only / CI runner）？ | 这台机器出不了图，换有桌面会话的机器，或改用 Linux 离屏方案。这种情况提权也帮不上 |
| 6 | 其它平台/其它 agent，shell 工具是不是也跑在受限 sandbox 里？ | 症状同第 0 步（exit 0、日志正常、无 PNG，常伴随 `Could not open file .../.cli/logs/...`）。sandbox 掐掉了 runtime 的日志/截图/缓存写入通道，不是参数错。用**完全相同**的命令提权重跑一次 |

不要在排除这些之前就去改 `-x/-y`、`-screenshot-frame`、相对/绝对路径或 `-validate` 组合。反过来，提权也不是万能的：第 5 步那种"没有桌面会话"的情况，提权一万次也不会有 PNG。

---

## 序列帧 / 运动验证（旋转、动画、物理轨迹）

**单帧判不了运动。** 凡是"随时间/角度变化"的问题——旋转朝哪转、是"左右摆"还是"360°公转"、动画播得对不对、物理轨迹——都要**多帧**：跑 N 次、每次渲染一个**受控值**，再拼成 GIF（给用户看）+ contact sheet（给你自己 Read 判断）。

**两条必须记住的点：**

1. **contact sheet（网格拼图）给 AI 自己看，GIF 给用户看。** 你能 `Read` 一张 PNG 判断，但**看不了 GIF 动**（读进来只是静态）。所以要判运动对错，**必须**把 N 帧拼成一张 contact sheet PNG 再 `Read`。
2. **用"确定性扫参"，别靠实时帧计时。** 渲染速度不定，"第 N 帧是什么状态"不可复现。把要变的量（角度/状态）**冻结**在受控值、每次 run 截一帧，才对得齐、可复现。

```bash
ROOT="<项目根>"                      # 路径含空格时全程带引号
mkdir -p "$ROOT/screenshots/frames"
for A in $(seq 0 15 345); do        # 例：一整圈 24 帧，脚本里 local ANGLE = 0.0 逐值替换
  sed "s/^local ANGLE = 0.0/local ANGLE = ${A}.0/" "$ROOT/scripts/scene.lua" > "$ROOT/scripts/_seq.lua"
  LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe EGL_PLATFORM=surfaceless \
    timeout 60 "$ROOT/.cli/UrhoXRuntime" _seq.lua -tapcode_dir="$ROOT" -tool_mode \
    -graphicssurfaceless -screenshot="$(printf "$ROOT/screenshots/frames/f%03d.png" "$A")" \
    -screenshot-frame=120 >/dev/null 2>&1
done
rm -f "$ROOT/scripts/_seq.lua"      # 🔴 必须清理：留在 scripts/ 会被后续构建打包进产物
```

```python
# 拼接：GIF（人）+ contact sheet（AI 自己 Read）
from PIL import Image; import glob
fs=sorted(glob.glob('<项目根>/screenshots/frames/f*.png')); ims=[Image.open(f).convert('RGB') for f in fs]
g=[im.resize((420,322)) for im in ims]
g[0].save('<项目根>/screenshots/motion.gif', save_all=True, append_images=g[1:], duration=90, loop=0, optimize=True)
c,r,tw,th=6,(len(ims)+5)//6,210,161
sheet=Image.new('RGB',(c*tw,r*th),(20,20,28))
for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),((i%c)*tw,(i//c)*th))
sheet.save('<项目根>/screenshots/motion_sheet.png', optimize=True)   # <- Read 这张判运动
```

给追踪点一个亮色 marker，看它在各帧的轨迹：画一整圈=公转；只在一条线上来回=摆。

> ⚠️ 这套只覆盖**单机/单场景**的运动。**联机后的运动**（网络插值、client/server 分裂导致的抖/摆）在单机截图里复现不出来，不在本 skill 覆盖范围内。

---

## ⚠️ 陷阱

| 陷阱 | 说明 |
|------|------|
| 🔴 **`result: FAIL` / exit≠0 是常态** | 空白脚本也会 FAIL（着色器缓存、帧时间尖刺等环境噪音）。**必须先按"判断结果"过滤噪音**，否则每个项目都会被误报成坏的 |
| **grep stdout 判成败必然误报** | 不带 `-validate-output` 时报告打在 stdout，报告里就有 `"errors"` / `"lua_errors"` 等字段名，`grep -i ERROR` 干净 run 也命中。把报告写文件再解析 |
| **`exit 1` 不携带信息** | 干净 run（环境噪音）、脚本报错、写盘失败全都是 1。只有 `139`（段错误）和外层 `timeout` 的 `124` 有意义 |
| **"没有报告 = crash"是错的** | 写盘失败、sandbox 拦截、外层超时都会没有报告。按「没有报告文件时怎么判」看日志分流，不要按 exit code 猜 |
| **`-validate-timeout` 默认只有 30 秒** | 帧数一多（尤其配合截图）很容易撞上 → 报告 `TIMEOUT` + exit≠0，看着像 crash。显式设置，并让外层 `timeout` 更大 |
| **截图目录不存在 = 静音失败** | 没有 PNG 也没有报错。截图前必须建目录 |
| **`[Screenshot] captured` 不代表落盘** | 这行在发出请求时就打了（实测目录不存在时照样打）。判成败只看 PNG 文件本身 |
| **默认日志里看不到 `[Screenshot]` 标记** | 它们是 INFO 级，`-tool_mode` 只输出 WARNING 以上。排查截图问题时加 `-log info` 重跑，别误判成"参数没生效" |
| **validate 和截图的渲染参数搞混** | `-graphicsheadless` = 不出像素，只用于 validate；截图在 Linux 需要 `-graphicssurfaceless` + Mesa 环境变量 |
| **`screenshot-frame` 太小** | 默认 30，< 100 会截到 bootstrap loading 画面（深色 + spinner）。用 ≥ 120 |
| **两者组合** | 可以同时传，但 `screenshot-frame < validate-frames`，且 `-validate-timeout` 要覆盖总耗时 |
| **一次只截一帧** | 动画/物理要多帧对比，见"序列帧"一节 |
| **PNG 无压缩** | 800×600 约 1.9MB（裸 RGBA），正常现象 |
| **超时估算** | 软渲染是 CPU 渲染，120 帧约 5-15 秒；外层 timeout 给 60s |
| **`grep '"enabled"'` 判多人模式** | 会命中文件里别的同名字段。用 json 解析 `@runtime.multiplayer.enabled` |
| **Windows 用 `.cmd` 入口做超时 kill** | `.cmd` 只是外壳，`Kill()` 杀不到真正的进程。要超时控制就直接调 `UrhoXRuntime.exe` |
| **Windows 上写 `python3`** | 常命中 Store 的空壳 alias 直接弹应用商店。用 `python` |
| **Windows + Codex CLI 截图先提权** | 默认 sandbox 下 PNG 常常不落盘（exit 0、日志正常）。截图命令直接用 `sandbox_permissions: "require_escalated"`，省掉一轮参数排查 |
| **其它环境的 sandbox 也可能掐写入** | exit 0 + 无 PNG + `Could not open file ...` 是写入通道受限的信号。先用**完全相同**的命令提权重跑，再考虑改参数 |

---

## 标准工作流

### 场景 A：改完脚本，快速检查有没有报错

```bash
ROOT="<项目根>"
python3 "$ROOT/.cli/install-urhox-runtime.py" --dest "$ROOT/.cli"
mkdir -p "$ROOT/.tmp"

timeout 60 "$ROOT/.cli/UrhoXRuntime" main.lua \
  -tapcode_dir="$ROOT" -tool_mode -graphicsheadless -validate \
  -validate-frames=60 -validate-timeout=45 \
  -validate-output="$ROOT/.tmp/validate.json" > "$ROOT/.tmp/validate.log" 2>&1
ec=$?

if [ ! -s "$ROOT/.tmp/validate.json" ]; then
  # 没有报告 ≠ crash：先用两个有信息量的 exit code 短路，其余按日志证据分流
  if [ "$ec" -eq 124 ]; then
    echo "⏱️ 外层 timeout 触发：卡死或压根没进 validate，检查 -validate 拼写 / 帧数 / 死循环"
    tail -30 "$ROOT/.tmp/validate.log"
  elif [ "$ec" -eq 139 ]; then
    echo "💥 段错误（exit 139）= 真 crash，提权没用"
    tail -30 "$ROOT/.tmp/validate.log"
  elif grep -q "Failed to write report" "$ROOT/.tmp/validate.log" 2>/dev/null; then
    echo "⚠️ 引擎跑完了但报告写不出去（exit $ec）：确认输出目录已建好；目录没问题则是写权限/sandbox 拦截"
  elif [ ! -s "$ROOT/.tmp/validate.log" ]; then
    echo "⚠️ 连日志都没落地（exit $ec）：落盘通道被限，用相同命令提权重跑"
  else
    echo "❓ 有日志但没有报告（exit $ec）：看尾部是否异常终止，按「没有报告文件时怎么判」分流"
    tail -30 "$ROOT/.tmp/validate.log"
  fi
fi
# 有报告 → 用「模式 1 · 判断结果」里的解析脚本判定（务必过滤噪音）
```

Windows 用上面模式 1 的 PowerShell 版本；**报告解析照旧用那段 python**，不要换成 `Select-String`（同样会被报告里的字段名误伤）。

### 场景 B：截图验证渲染效果

```bash
ROOT="<项目根>"
python3 "$ROOT/.cli/install-urhox-runtime.py" --dest "$ROOT/.cli"
mkdir -p "$ROOT/screenshots" "$ROOT/.tmp"

LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe EGL_PLATFORM=surfaceless \
timeout 60 "$ROOT/.cli/UrhoXRuntime" main.lua \
  -tapcode_dir="$ROOT" -tool_mode -graphicssurfaceless \
  -screenshot="$ROOT/screenshots/shot.png" -screenshot-frame=120 \
  -x 800 -y 600 > "$ROOT/.tmp/shot.log" 2>&1

if [ -s "$ROOT/screenshots/shot.png" ]; then
  echo "✅ $(ls -lh "$ROOT/screenshots/shot.png" | awk '{print $5}')"   # 然后 Read 这张图
else
  echo "❌ 没有 PNG——按「没有 PNG 时按顺序排查」逐项查"
  grep -i "\[Screenshot\]" "$ROOT/.tmp/shot.log"
fi
```

### 场景 C：validate + 同时截图

```bash
ROOT="<项目根>"
mkdir -p "$ROOT/screenshots" "$ROOT/.tmp"

LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe EGL_PLATFORM=surfaceless \
timeout 120 "$ROOT/.cli/UrhoXRuntime" main.lua \
  -tapcode_dir="$ROOT" -tool_mode -graphicssurfaceless \
  -validate -validate-frames=200 -validate-timeout=100 \
  -validate-spike-threshold=500 \
  -validate-output="$ROOT/.tmp/validate.json" \
  -screenshot="$ROOT/screenshots/shot.png" -screenshot-frame=120 \
  -x 800 -y 600 2>&1 | tail -20
```

三个数一起调：`screenshot-frame(120) < validate-frames(200)`，`-validate-timeout(100)` 要盖住 200 帧的实际耗时，外层 `timeout(120)` 再大一档。**沿用默认 30s 内部超时的话这个组合几乎必然 TIMEOUT。**

---

## 与 run-lua-headless 的区别

| 维度 | run-lua-headless | run-lua-validate |
|------|-----------------|-----------------|
| 用途 | 程序化生成/批处理 | 测试游戏脚本 |
| 退出方式 | 脚本做完事自己调 `engine:Exit()` | `-validate` 跑 N 帧自动退出 |
| 渲染 | 无 | 可选：不渲染（逻辑验证）或真实渲染（截图） |
| 典型产物 | PNG/JSON/XML 文件 | JSON 报告 + exit code + 可选截图 |
| 脚本要求 | 必须有 `engine:Exit()` | 普通游戏脚本即可（`Start()` + Update 循环） |

---

## 超时建议

外层进程超时 > `-validate-timeout` > 实际耗时。

| 场景 | `-validate-timeout` | 外层超时 |
|------|------|------|
| validate 60 帧 | 默认 30 够用 | 60s |
| validate 200 帧 | 45 | 60s |
| screenshot 120 帧 | —（无 validate） | 60s |
| screenshot 300 帧 | —（无 validate） | 120s |
| validate 200 帧 + 截图 | 100 | 120s |
