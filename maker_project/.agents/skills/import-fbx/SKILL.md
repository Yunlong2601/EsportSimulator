---
name: import-fbx
description: "将 FBX 模型导入为引擎 MDL 格式。Use when users need to (1) 导入 FBX 模型, (2) 转换 FBX 为 MDL, (3) 将 3D 模型加入项目, (4) import model, (5) 用户提供了 .fbx 文件并希望在场景中使用。"
---

# FBX 模型导入指南

## 工具路径

```
/workspace/.cli/UrhoXCLI
```

## 基本用法

```bash
/workspace/.cli/UrhoXCLI import-model -i <fbx_path> -o <mdl_path> [options]
```

工具会自动处理坐标系转换和单位转换，输出符合 UrhoX 引擎规范的 MDL 文件，无需手动指定。

## 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `-i, --input` | 是 | 输入 FBX 文件路径 |
| `-o, --output` | 否 | 输出 MDL 文件路径（不填则跳过模型导出） |
| `--material-dir <dir>` | 否 | 材质输出目录（不填则跳过材质生成） |
| `--texture-dir <dir>` | 否 | 纹理输出目录（不填则跳过纹理复制） |
| `--prefab <path>` | 否 | 预制体输出路径（不填则跳过预制体生成） |
| `--import-anim <dir>` | 否 | 动画输出目录（不填则跳过动画导入） |
| `--no-lod` | 否 | 关闭 LOD 自动生成（默认开启） |
| `--lod-levels <n>` | 否 | LOD 层级数 1-4（默认 3） |
| `--merge-meshes` | 否 | 合并所有网格为一个 |

**核心规则：不传路径 = 不生成对应产物。** 每个输出路径都是独立的，按需组合。

## 输出文件命名规则

所有输出文件以模型名（MDL 文件名或 FBX 文件名）为前缀，格式如下：

| 产物 | 命名格式 | 示例 |
|------|---------|------|
| 模型 | `{模型名}.mdl` | `character.mdl` |
| 材质 | `{模型名}_{序号}_{FBX材质名}.xml` | `character_00_Lambert.xml` |
| 纹理图片 | `{模型名}_{序号}_{类型后缀}.{ext}` | `character_00_D.jpg` |
| 纹理配置 | `{模型名}_{序号}_{类型后缀}.xml` | `character_00_D.xml` |
| 预制体 | `{模型名}.prefab` | `character.prefab` |

**序号**：从 00 开始，对应 FBX 中的材质索引。

**类型后缀**：`D` = Diffuse, `N` = Normal, `S` = Specular, `E` = Emissive。

**FBX 材质名**：来自 FBX 文件内部的材质命名，如 `Lambert`、`StandardSurface`、`tripo_material_xxx` 等。

## 路径规范

### 推荐目录结构

```
assets/
├── Meshes/
│   └── MyModel.mdl
├── Materials/
│   └── MyModel_00_Lambert.xml
├── Textures/
│   ├── MyModel_00_D.xml        ← 纹理配置（sRGB、压缩格式）
│   └── MyModel_00_D.png
├── Prefabs/
│   └── MyModel.prefab
└── Animations/
    └── MyModel/
        ├── idle.ani
        └── walk.ani
```

## 标准工作流

### 1. 完整导入（模型 + 材质 + 纹理 + 预制体）

```bash
/workspace/.cli/UrhoXCLI import-model \
  -i /workspace/assets/Raw/character.fbx \
  -o /workspace/assets/Meshes/character.mdl \
  --material-dir /workspace/assets/Materials \
  --texture-dir /workspace/assets/Textures \
  --prefab /workspace/assets/Prefabs/character.prefab
```

### 2. 完整导入 + 动画

```bash
/workspace/.cli/UrhoXCLI import-model \
  -i /workspace/assets/Raw/character.fbx \
  -o /workspace/assets/Meshes/character.mdl \
  --material-dir /workspace/assets/Materials \
  --texture-dir /workspace/assets/Textures \
  --prefab /workspace/assets/Prefabs/character.prefab \
  --import-anim /workspace/assets/Animations/character
```

### 3. 只导出模型（不生成材质/纹理/预制体）

```bash
/workspace/.cli/UrhoXCLI import-model \
  -i /workspace/assets/Raw/character.fbx \
  -o /workspace/assets/Meshes/character.mdl
```

### 4. 只提取纹理（不导出模型）

```bash
/workspace/.cli/UrhoXCLI import-model \
  -i /workspace/assets/Raw/character.fbx \
  --texture-dir /workspace/assets/Textures
```

### 3. 导入后在 Lua 中使用

```lua
-- 加载模型
local node = scene_:CreateChild("Character")
local model = node:CreateComponent("StaticModel")
model:SetModel(cache:GetResource("Model", "Meshes/character.mdl"))

-- 如果有骨骼动画，使用 AnimatedModel
local animModel = node:CreateComponent("AnimatedModel")
animModel:SetModel(cache:GetResource("Model", "Meshes/character.mdl"))
local animCtrl = node:CreateComponent("AnimationController")
animCtrl:PlayExclusive("Animations/character/idle.ani", 0, true, 0.2)
```

## LOD 自动生成

- 默认开启 3 级 LOD，使用保守简化比例（85%/65%/45%）
- 使用固定 screenSize 阈值（0.2/0.08/0.03）控制 LOD 切换距离
- 使用 `--no-lod` 关闭，`--lod-levels <n>` 调整级数

## 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 模型朝向不对 | Tripo/Blender 等工具导出的 FBX 朝向特殊 | 工具已默认开启自动校正，通常无需处理 |
| 模型太大/太小 | 源文件单位与引擎不同 | 工具已自动转换单位为米，检查源文件是否使用了非标准缩放 |
| 动画没导出 | 未指定动画输出目录 | 添加 `--import-anim <dir>` 参数 |

## 纹理处理

- 纹理复制时会自动生成同名 `.xml` 配置文件（sRGB、平台压缩格式）
- `.xml` 配置会在图片之前写入，避免编辑器自动生成的默认配置覆盖
- 材质引用的是纹理图片的 UUID，`.xml` 配置作为 sidecar 文件自动生效

## 注意事项

- FBX 文件路径和输出路径都必须使用**绝对路径**
- 输出目录不存在时会自动创建
- 不传的路径参数对应的产物会被跳过，不会生成
- 默认开启 LOD 自动生成（3 级），大幅提升运行时性能
