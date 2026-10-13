---
name: run-lua-headless
description: "用 UrhoXRuntime 执行一个 Lua 脚本，跑完即退出，拿引擎接口（Image / Scene / Resource / Lua / Physics / FreeType / Navigation）做一次性 CPU 侧工作。Use when (1) 需要程序化生成贴图 / 噪声 / 调色板 / placeholder PNG, (2) 批处理 prefab / scene XML / 配置文件, (3) 需要用引擎接口算一份数据写盘后退出, (4) 用户说\"用引擎跑一段 Lua\" / \"算一下\" / \"批量生成\" / \"离线烘焙\" / \"procedural\" / \"run lua headless\"。SKIP when 用户要看渲染效果、要跑游戏、要联机。"
---

# run-lua-headless — 用引擎跑一段 Lua 然后退出

## 工具路径

```
<项目根>/.cli/UrhoXRuntime
```

## 安装 / 自动更新（每次调用前跑一次）

```bash
python3 <项目根>/.cli/install-urhox-runtime.py --dest <项目根>/.cli
```

脚本自动检测平台，从 CDN 下载 UrhoXRuntime.zip 并原子解压。
幂等：首次下载约 35MB；后续未更新约 50ms 跳过（304）。

默认安装目录：`<项目根>/.cli/`。

**失败处理 = 再跑一次同一条命令**，不要去 rm `<项目根>/.cli/` 或它下面的别的文件（那里还住着其他 CLI）。

## 基本用法

```bash
<项目根>/.cli/UrhoXRuntime <script>.lua -tapcode_dir=<项目根> -tool_mode
```

| 位置/参数 | 说明 |
|---|---|
| `<script>.lua` | 第一个位置参数，**相对 `<项目根>/scripts/`** 的路径。例如 `_proc/bake.lua` 指向 `<项目根>/scripts/_proc/bake.lua` |
| `-tapcode_dir=<项目根>` | 项目根 |
| `-tool_mode` | 必填 |

## Lua 入口模板

入口脚本**必须**实现 `function Start()`，并且**必须**在做完事之后调 `engine:Exit()`——否则脚本不退，被超时 SIGKILL。

```lua
function Start()
    local ok, err = pcall(function()
        -- 你的工作：读资源、算东西、写文件
    end)
    if not ok then
        log:Write(LOG_ERROR, "[run-lua-headless] " .. tostring(err))
    end
    engine:Exit()
end
```

## 产物落盘

正式产物落到 `<项目根>/assets/...`（用绝对路径，例如 `<项目根>/assets/Textures/noise.png`），后续 Lua 游戏脚本就能直接 `cache:GetResource()` 用上。临时中间产物用 `<项目根>/.tmp-headless/...`，使用前需要确保目录存在，如果不存在需要新建一个。

## 标准工作流

### 1. 程序化噪声贴图（最常见）

`<项目根>/scripts/_proc/bake_noise.lua`：

```lua
function Start()
    local ok, err = pcall(function()
        local img = Image()
        local W, H = 256, 256
        img:SetSize(W, H, 4)
        math.randomseed(42)
        for y = 0, H - 1 do
            for x = 0, W - 1 do
                local n = (math.sin(x * 0.05) + math.cos(y * 0.05)) * 0.5 + 0.5
                img:SetPixel(x, y, Color(n, n * 0.6, 1.0 - n, 1.0))
            end
        end
        assert(img:SavePNG("<项目根>/assets/Textures/noise.png"), "SavePNG failed")
        print("[procedural] wrote <项目根>/assets/Textures/noise.png")
    end)
    if not ok then log:Write(LOG_ERROR, "[procedural] " .. tostring(err)) end
    engine:Exit()
end
```

调用：

```bash
<项目根>/.cli/UrhoXRuntime _proc/bake_noise.lua -tapcode_dir=<项目根> -tool_mode
```

期望：进程 < 10s 退出、exit 0、`<项目根>/assets/Textures/noise.png` 存在。

### 2. Prefab 批处理 / Scene 字段迁移

```lua
function Start()
    local ok, err = pcall(function()
        local files = {"Prefabs/enemy.xml", "Prefabs/boss.xml"}
        for _, f in ipairs(files) do
            local scene = Scene()
            scene:LoadXML(cache:GetFile(f))
            -- 修改 scene…
            scene:SaveXML(File(context, "<项目根>/assets/" .. f, FILE_WRITE))
        end
    end)
    if not ok then log:Write(LOG_ERROR, tostring(err)) end
    engine:Exit()
end
```

### 3. Navigation mesh 烘焙

调用同上，脚本里用 `NavigationMesh:Build()` 把烘焙结果挂到 scene 然后 `SaveXML`。

## 能用 / 不能用

这个 skill 是离线/批处理用途，**不产出渲染像素**。

| ✅ 能用 | ❌ 不能用 |
|---|---|
| `Image` 全套 CPU 接口（SetPixel / Resize / SavePNG / SaveJPG / Clear / GetSubimage） | 任何需要看到屏幕渲染结果的能力 |
| `Scene` / `Node` / `Prefab` 序列化反序列化 | RenderToTexture、shader 后处理、compute、skybox 卷积 |
| Lua 全套，包括 `require` 项目 `urhox-libs/` | UI 真正渲染（创建 UIElement 不报错，看不到结果） |
| `Physics` 模拟（CPU step） | `Audio` 播放 |
| `Navigation` mesh 烘焙 | 任何对 `Renderer` 输出做截图 |
| `FreeType` 字体光栅化（产文字到 `Image`） | |
| `cache:GetFile` 读 `<项目根>/assets/` 下任何资源 | |

判别口诀：**接口名带 "GPU / Render / Shader / Texture upload" 的多半出不来结果，带 "Image / Scene / File / Resource" 的多半能用。**

## 输出 / 日志 / 错误

**stdout 就是完整日志**——不写文件，全部走 stdout：

| stdout 行格式 | 来源 |
|---|---|
| `[ts][N] WARNING: ...` / `[ts][N] ERROR: ...` | 引擎自身日志 |
| `[ts][N][Script] ...` | Lua `print(...)`（总是输出） |
| `[ts][N]WARNING/ERROR<msg>` | Lua `log:Write(LOG_WARNING/ERROR, msg)` |

默认日志级别 = **WARNING**——`INFO` 级别（包括引擎 init chatter 和 Lua `log:Write(LOG_INFO, ...)`）会被过滤。所以脚本写进度提示**用 `print(...)`**（永远显示），不要用 `log:Write(LOG_INFO, ...)`（会被吞）。

调用方直接捕获子进程 stdout 即可（`subprocess.run(..., capture_output=True)`、`bash $(...)` 都行），**不要**去 `~/logs/`、`/var/log/` 之类位置追文件——没有。

跑完报上游：

1. **exit code**：`0` = 成功；`124` = 超时（脚本漏调 `engine:Exit()`）；`139` = 调用形态错了。
2. **stdout 最后 ~30 行**：取尾，里面有 Lua `log:Write` / `print` 报错和引擎 WARNING/ERROR。
3. **产物**：调用方 prompt 里声明的输出路径下文件存不存在、大小合不合理。

## 常见坑

- **忘了 `engine:Exit()`** → 脚本不退，命中超时。
- **`<script>.lua` 写成绝对路径** → 报 `Usage` 退出。第一个位置参数必须是相对 `<项目根>/scripts/` 的相对路径。

## 超时建议

| 任务类型 | 默认超时 |
|---|---|
| 小图（≤ 1024×1024）/ 一次性数据生成 | 30s |
| 大量 Prefab 批处理 / Navigation 烘焙 | 120s |
| 不确定 | 60s |

超时用 `timeout --foreground <Ns> <项目根>/.cli/UrhoXRuntime ...` 包一层，避免脚本 bug 把整个调用挂死。
