---
name: convert-panorama
description: "将全景图转换为引擎可用的 Cubemap 天空盒/天空球贴图。Use when users need to (1) 全景图转 cubemap, (2) 生成天空盒/天空球, (3) 导入 HDR 环境贴图, (4) convert panorama to skybox/skydome, (5) 将全景照片用作天空, (6) 用户提供了 .hdr/.jpg/.png 全景图并希望作为天空盒或天空球使用, (7) 制作 skysphere/skybox 贴图。"
---

# 全景图转 Cubemap 天空盒/天空球

## 前置检查

**执行转换前，必须确认输入图片路径**：

- 如果用户在对话中提供了具体的图片路径 → 直接使用
- 如果用户的 `assets/` 目录下有明显的全景图文件 → 确认后使用
- **如果用户没有指定图片** → **必须询问用户全景图的文件路径**，不要猜测

## 工具路径

```
/workspace/.cli/UrhoXCLI
```

## 基本用法

```bash
/workspace/.cli/UrhoXCLI convert-panorama -i <input> -o <output> [options]
```

工具会自动检测输入图片的布局格式（等距柱状投影 2:1 或横条 6:1），转换为 6 面 Cubemap 贴图，输出 DDS 或 KTX 格式。

## 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `-i, --input` | 是 | 输入全景图路径（支持 HDR, PNG, JPG, TGA 等） |
| `-o, --output` | 是 | 输出 Cubemap 文件路径（.dds 或 .ktx） |
| `--size <n>` | 否 | 每个 Face 的尺寸（默认: 自动从输入图推算） |
| `--strip` | 否 | 强制使用横条模式（6:1 布局） |
| `--mips` | 否 | 生成 Mipmap 链 |

## 支持的输入布局

| 布局 | 宽高比 | 示例尺寸 | 说明 |
|------|--------|---------|------|
| 等距柱状投影（Equirectangular） | 2:1 | 4096×2048 | 最常见的全景图格式 |
| 横条（Horizontal Strip） | 6:1 | 6144×1024 | 6 个面横向排列 |

工具自动根据宽高比检测布局。如果图片比例不精确，默认按等距柱状投影处理，可用 `--strip` 强制指定横条模式。

## 标准工作流

### 1. 全景图转天空盒 Cubemap（推荐带 Mipmap）

```bash
/workspace/.cli/UrhoXCLI convert-panorama \
  -i /workspace/assets/Raw/sky_panorama.hdr \
  -o /workspace/assets/Textures/Skybox.dds \
  --mips
```

### 2. 指定 Face 尺寸（如 512×512）

```bash
/workspace/.cli/UrhoXCLI convert-panorama \
  -i /workspace/assets/Raw/sky_panorama.jpg \
  -o /workspace/assets/Textures/Skybox.dds \
  --size 512 --mips
```

### 3. 横条格式输入

```bash
/workspace/.cli/UrhoXCLI convert-panorama \
  -i /workspace/assets/Raw/sky_strip.png \
  -o /workspace/assets/Textures/Skybox.dds \
  --strip --mips
```

### 4. 在 Lua 中使用生成的 Cubemap 作为天空盒

```lua
-- 创建天空盒节点
local skyNode = scene_:CreateChild("Sky")
local skybox = skyNode:CreateComponent("Skybox")
skybox:SetModel(cache:GetResource("Model", "Models/Box.mdl"))

-- 加载 Cubemap 材质
local skyMat = Material:new()
skyMat:SetTechnique(0, cache:GetResource("Technique", "Techniques/DiffSkybox.xml"))
skyMat:SetTexture(0, cache:GetResource("TextureCube", "Textures/Skybox.dds"))
skyMat:SetCullMode(CULL_NONE)
skybox:SetMaterial(skyMat)
```

## 输出格式

| 格式 | 特点 | 适用场景 |
|------|------|---------|
| `.dds` | DirectDraw Surface，GPU 原生格式 | Windows / 通用（推荐） |
| `.ktx` | Khronos Texture，支持更多压缩格式 | 移动端 / 跨平台 |

## Face 尺寸说明

- 不指定 `--size` 时，自动从输入图推算：
  - 等距柱状投影：`输入高度 / 2`（如 2048 高 → 1024×1024 每面）
  - 横条：`输入高度`（如 1024 高 → 1024×1024 每面）
- 常用尺寸：256, 512, 1024, 2048

## 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 输出全黑 | 输入图是 LDR 但内部未转回 RGBA8 | 已修复，工具自动处理 |
| 显示为 2D 而非 Cubemap | DDS 缺少 cubemap 标志位 | 已修复，工具自动补丁 |
| 接缝明显 | Face 尺寸太小 | 使用 `--size 1024` 或更大 |
| 图片比例不是 2:1 | 非标准全景图 | 工具自动缩放适配，可正常使用 |

## 注意事项

- 输入和输出路径都必须使用**绝对路径**
- HDR 全景图（.hdr）输出保持 RGBA32F 浮点精度，适合 IBL 光照
- LDR 全景图（.jpg/.png）输出为 RGBA8，适合天空盒背景
- 建议带 `--mips` 生成 Mipmap，提升运行时渲染质量
