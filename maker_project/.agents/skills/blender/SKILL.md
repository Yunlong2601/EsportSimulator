---
name: blender
description: "安装和使用 Blender 命令行/headless runtime。适用于：用户要用 Blender 生成场景、创建或修改 .blend 文件、运行 Blender Python 脚本、批量处理 Blender 资产、检查 Blender 场景、把 .blend/blend 场景转换或导出为 UrhoX 可编辑资产、生成 UrhoX Scene.xml、Meshes/*.mdl、Materials、Textures。也匹配这些说法：Blender CLI、headless Blender、bpy、blend 转 UrhoX、Blender 场景进引擎。跳过：用户只是导入已有 FBX/GLB 单模型到 UrhoX；这种情况用 import-fbx/import-glb。"
---

# blender — 使用 Blender 生成场景，并可选导出 UrhoX 资产

## 工具路径

```text
/workspace/.cli/install-blender.py
/workspace/.cli/blender
/workspace/.cli/blend_to_urhox.py
```

这个 skill 有两个独立工作流：

1. **Blender 场景生成/编辑**：用 Blender Python 创建或修改 `.blend`，结果仍然是 Blender 场景。
2. **Blender 转 UrhoX**：把已有 `.blend` 导出为 UrhoX `Scene.xml`、`Meshes/*.mdl`、`Materials/*.xml`、`Textures/*`。

不要默认把所有 Blender 任务都导出到 UrhoX。只有用户明确要“转成 UrhoX / 进引擎 / 生成 Scene.xml / 生成 mdl”时才跑导出器。

## 安装 / 自动更新（每次调用前跑一次）

调用 Blender 前先跑一次安装脚本。脚本幂等：首次从 UrhoX CDN 下载 headless Blender runtime；后续如果已安装同版本会直接复用。安装器内部优先使用 `curl` 下载，因此会读取 `http_proxy` / `https_proxy` 环境变量。

```bash
python3 /workspace/.cli/install-blender.py --print-path
```

安装后命令入口固定为：

```text
/workspace/.cli/blender
```

失败处理：

1. 网络失败或 CDN 404：把 stdout/stderr 报给用户，不要删除 `/workspace/.cli/`。
2. 版本已安装但怀疑损坏：用 `--force` 重装一次。
3. 想只看下载地址不改文件：用 `--dry-run`。

```bash
python3 /workspace/.cli/install-blender.py --dry-run
python3 /workspace/.cli/install-blender.py --force --print-path
```

## 验证 Blender 可用

```bash
/workspace/.cli/blender --background --version
```

期望看到 `Blender 5.1.2` 以及 `build platform: Linux`。这个 runtime 是 headless CPU/Cycles 版本，用于 CLI 和离线处理，不依赖用户安装桌面图形库。

## 工作流 A：生成或修改 Blender 场景

用户只要求“用 Blender 生成场景 / 建模 / 生成 .blend / 修改 .blend”时，用这个工作流。输出是 `.blend` 文件，不生成 UrhoX 资产。

推荐路径：

```text
/workspace/assets/Raw/<SceneId>.blend
/workspace/scripts/_blender/<task>.py
```

最小脚本模板：

```python
# /workspace/scripts/_blender/create_scene.py
import argparse
import bpy
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--out", required=True)
args = parser.parse_args()

# 清空默认场景
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()

# 创建示例几何体
bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0, 0, 1))
cube = bpy.context.object
cube.name = "Cube"

# 材质
mat = bpy.data.materials.new("Cube_Material")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.8, 0.25, 0.12, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.55
cube.data.materials.append(mat)

# 相机和灯光
bpy.ops.object.light_add(type="SUN", location=(0, 0, 6))
bpy.context.object.name = "Sun"

bpy.ops.object.camera_add(location=(5, -7, 4), rotation=(1.1, 0, 0.62))
bpy.context.scene.camera = bpy.context.object

# 保存 .blend
out = Path(args.out)
out.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out))
print(f"[blender] wrote {out}")
```

运行：

```bash
python3 /workspace/.cli/install-blender.py --print-path

/workspace/.cli/blender --background --python /workspace/scripts/_blender/create_scene.py -- \
  --out /workspace/assets/Raw/MyScene.blend
```

修改已有 `.blend`：

```bash
/workspace/.cli/blender /workspace/assets/Raw/MyScene.blend --background \
  --python /workspace/scripts/_blender/modify_scene.py -- \
  --out /workspace/assets/Raw/MyScene.blend
```

Blender Python 脚本规则：

- 通过 `bpy.ops.wm.save_as_mainfile(filepath=...)` 显式保存 `.blend`。
- 批处理脚本参数放在 Blender 命令的 `--` 之后。
- 输出目录不存在时脚本自己创建。
- 保持对象、材质、collection 命名稳定，方便后续导出或人工编辑。
- 如果后续可能导出 UrhoX，材质尽量使用常规 Principled BSDF，避免复杂 shader graph。

## 工作流 B：将 .blend 导出为 UrhoX 场景资产

只有当用户明确要把 Blender 场景转成 UrhoX 资产时，才运行导出器。

基本命令：

```bash
python3 /workspace/.cli/install-blender.py --print-path

/workspace/.cli/blender --background --python /workspace/.cli/blend_to_urhox.py -- \
  --blend /workspace/assets/Raw/MyScene.blend \
  --out-dir /workspace/assets/blender/MyScene \
  --scene-id MyScene \
  --resource-prefix blender/MyScene \
  --strict-shader
```

`--resource-prefix` 是写入 `Scene.xml` 的资源引用前缀，必须是相对资源根的路径。不要写成 `/workspace/...`，也不要带 `tmp/` 这类临时目录前缀。

输出结构：

```text
/workspace/assets/blender/MyScene/
├── Scene.xml
├── Meshes/
│   └── *.mdl
├── Materials/
│   └── *.xml
├── Textures/
│   ├── 图片文件
│   └── 纹理 .xml 配置
└── Metadata/
    └── export_manifest.json
```

`Scene.xml` 中会保留 Blender 的节点层级，mesh 对象会生成 `StaticModel` 组件并引用 `Meshes/*.mdl` 和 `Materials/*.xml`。导出的场景用于后续在 UrhoX 内二次编辑，不要把整个场景先合成一个 FBX/GLB。

## 导出器参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--blend <path>` | 否 | 要打开的 `.blend` 文件。批处理时应显式传入。 |
| `--out-dir <dir>` | 是 | 输出资源目录，推荐 `/workspace/assets/blender/<SceneId>`。 |
| `--scene-id <name>` | 是 | 场景 ID，用于命名和默认资源前缀。 |
| `--resource-prefix <path>` | 否 | 写入 XML 的资源引用前缀；推荐显式传 `blender/<SceneId>`。 |
| `--strict-shader` | 否 | 复杂/不支持的 shader graph 直接导出失败。推荐开启。 |
| `--include-disabled` | 否 | 包含隐藏或禁用渲染的对象。默认跳过。 |
| `--no-cameras` | 否 | 不导出 Camera 组件。 |
| `--no-lights` | 否 | 不导出 Light 组件。 |
| `--flip-v` | 否 | 翻转 UV 的 V 分量。只有纹理上下颠倒时再用。 |

## UrhoX 导出规则

| Blender 内容 | UrhoX 输出 |
|---|---|
| Mesh object | `Meshes/<Object>.mdl` + `StaticModel` 组件 |
| Material | `Materials/<Material>.xml` |
| Image texture | `Textures/` 下图片和纹理配置 |
| Camera | `Camera` 组件 |
| Point/Sun/Spot light | `Light` 组件 |
| Scene root | `Scene.xml` |
| 默认环境 | 自动生成 `Zone` 组件 |

导出的默认 `Zone` 会写入环境光、雾效颜色、Bloom 等引擎需要的字段。不要手动删掉 Zone，除非用户明确要求用项目里已有的全局 Zone。

当前不支持范围：

- 不导出动画、骨骼、约束、粒子和物理模拟结果。
- 不导出碰撞体；Blender Collection 只作为场景组织概念，不等价于碰撞。
- Area Light 第一版不支持；Point/Sun/Spot light 可以导出。
- 复杂 shader graph 只在用户接受降级时允许 warning 导出；默认用 `--strict-shader` 失败退出。

## Shader 处理

第一版只支持常见 Principled BSDF 的基础信息和常见贴图。复杂 shader graph 不要静默假装成功。

推荐默认加：

```bash
--strict-shader
```

如果导出失败，向用户报告具体材质名和不支持的节点/输入。只有用户接受降级时，才移除 `--strict-shader`，让工具以 warning 方式导出近似材质。

## 坐标和路径规则

- Blender 是 Z-Up；UrhoX 导出器会转换到 UrhoX 使用的坐标系。
- 生成 `.blend` 时可以保持 Blender 原生坐标习惯；只有导出 UrhoX 时才关心引擎坐标转换。
- 输出目录用绝对路径；UrhoX 资源引用用相对资源根路径。
- UrhoX 资产推荐目录名用 `blender/<SceneId>`，模型目录固定叫 `Meshes`，不要叫 `Models`。
- UrhoX 导出不生成 `.meta`。cooking 阶段会补默认 `.meta`。

## 验证清单

### 只生成 Blender 场景

```bash
test -f /workspace/assets/Raw/MyScene.blend
/workspace/.cli/blender /workspace/assets/Raw/MyScene.blend --background --python-expr "import bpy; print(len(bpy.data.objects))"
```

确认：

1. `.blend` 文件存在且大小合理。
2. Blender 能重新打开文件。
3. 关键对象、材质、相机或灯光存在。

### 导出 UrhoX 资产

```bash
test -f /workspace/assets/blender/MyScene/Scene.xml
test -d /workspace/assets/blender/MyScene/Meshes
test -d /workspace/assets/blender/MyScene/Materials
test -f /workspace/assets/blender/MyScene/Metadata/export_manifest.json
```

快速看资源引用是否写错：

```bash
rg "tmp/" /workspace/assets/blender/MyScene/Scene.xml || true
rg "blender/MyScene/Meshes" /workspace/assets/blender/MyScene/Scene.xml
```

`Scene.xml` 中应该能看到：

```text
blender/MyScene/Meshes/...
blender/MyScene/Materials/...
```

不应该看到：

```text
/workspace/...
tmp/...
Models/
```

## 输出 / 日志 / 错误

Blender、生成脚本和导出器日志都在 stdout/stderr。调用方需要给用户报告：

1. exit code：`0` = 成功；非 0 = 安装/Blender/脚本/导出器失败。
2. stdout/stderr 最后约 50 行，尤其是 `[urhox-export][warn]` 和 `[urhox-export][error]`。
3. 产物：`.blend` 路径，或 UrhoX 的 `Scene.xml`、`Meshes/*.mdl`、`Materials/*.xml`、`Textures/*` 数量。

## 常见坑

| 问题 | 原因 | 处理 |
|---|---|---|
| `/workspace/.cli/blender` 不存在 | 没跑安装器或安装失败 | 先跑 `python3 /workspace/.cli/install-blender.py --print-path` |
| CDN 404 | Blender runtime 尚未部署到 CDN | 报告 URL，等待运维/CI 发布 |
| 生成脚本跑完没有 `.blend` | 脚本没调用 `bpy.ops.wm.save_as_mainfile` | 补保存逻辑后重跑 |
| 脚本参数没生效 | 参数没有放在 Blender 命令的 `--` 后面 | 把业务参数移到 `--` 后 |
| `Scene.xml` 引用带 `tmp/` | `--resource-prefix` 传错 | 改为 `blender/<SceneId>` 后重导 |
| 引擎找不到模型 | 输出目录不在资源搜索目录下，或资源前缀不匹配 | 输出到 `/workspace/assets/blender/<SceneId>`，资源前缀同名 |
| 材质和预期差距大 | Blender shader graph 太复杂 | 用 `--strict-shader` 暴露问题，要求用户简化材质或接受降级 |
| 只想导入单个 FBX/GLB | 这不是 Blender scene 工作流 | 改用 `import-fbx` 或 `import-glb` skill |

## 超时建议

| 任务类型 | 默认超时 |
|---|---|
| 验证 Blender / 小脚本 | 60s |
| 生成小场景 / 少量模型 | 120s |
| 中等场景 / 含纹理复制或 UrhoX 导出 | 300s |
| 大场景 / 首次安装 Blender | 900s |

外层可以用 `timeout --foreground <Ns> ...` 包住 Blender 命令，避免坏文件或脚本问题让任务长时间挂住。
