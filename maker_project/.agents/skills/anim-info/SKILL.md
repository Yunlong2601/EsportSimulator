---
name: anim-info
description: "查询 ANI 动画文件信息。Use when users need to (1) 查看动画信息, (2) 检查 ANI 文件, (3) 查看动画时长/轨道/关键帧, (4) 查看动画骨骼轨道, (5) anim info, (6) 验证动画导入结果, (7) 排查动画重定向问题。"
---

# ANI 动画信息查询指南

## 工具路径

```
/workspace/.cli/UrhoXCLI
```

## 基本用法

```bash
/workspace/.cli/UrhoXCLI anim-info -i <ani_path> [options]
```

## 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `-i, --input` | 是 | 输入 ANI 文件路径（绝对路径） |
| `--tracks` | 否 | 显示每个轨道的详细信息（骨骼名、通道类型、关键帧数） |

## 输出内容

工具会输出以下信息：

| 信息 | 说明 | 示例 |
|------|------|------|
| Animation | 动画名称 | `Animation: idle` |
| File | 文件名 | `File: idle.ani` |
| Length | 动画时长（秒） | `Length: 2.5s` |
| Tracks | 轨道数（通常等于骨骼数） | `Tracks: 65` |
| Keyframes | 所有轨道的关键帧总数 | `Keyframes: 3900` |
| Channels | 通道统计（多少轨道包含位移/旋转/缩放） | `Channels: 65 rotation, 20 position, 5 scale` |
| Triggers | 触发点数量及时间 | `Triggers: 2` |
| Track Details | 使用 `--tracks` 时显示每个轨道的骨骼名、通道和帧数 | `[0] Hips: P+R+S, 60 keyframes` |

**通道缩写**：`P` = Position（位移），`R` = Rotation（旋转），`S` = Scale（缩放）。

## 标准工作流

### 1. 查看动画基本信息

```bash
/workspace/.cli/UrhoXCLI anim-info \
  -i /workspace/assets/Animations/character/idle.ani
```

### 2. 查看轨道详情（骨骼级别）

```bash
/workspace/.cli/UrhoXCLI anim-info \
  -i /workspace/assets/Animations/character/idle.ani \
  --tracks
```

### 3. 导入后验证动画

导入 FBX 动画后，用 anim-info 验证导入结果：

```bash
# 先导入
/workspace/.cli/UrhoXCLI import-model \
  -i /workspace/assets/Raw/character.fbx \
  -o /workspace/assets/Models/character.mdl \
  --import-anim /workspace/assets/Animations/character

# 再验证
/workspace/.cli/UrhoXCLI anim-info \
  -i /workspace/assets/Animations/character/idle.ani --tracks
```

### 4. 动画重定向前对比

对比源动画和目标模型的骨骼是否匹配：

```bash
# 查看动画的骨骼轨道
/workspace/.cli/UrhoXCLI anim-info \
  -i /workspace/assets/Animations/walk.ani --tracks

# 对比目标模型的骨骼
/workspace/.cli/UrhoXCLI model-info \
  -i /workspace/assets/Models/target.mdl --bones
```

## 输出示例

```
Animation: idle
  File:     idle.ani
  Length:   2.5s
  Tracks:   65
  Keyframes: 3900
  Channels: 65 rotation, 20 position, 5 scale
  Triggers: 2
    [0] time=0.8s
    [1] time=1.6s

Track Details:
  [0] Hips: P+R+S, 60 keyframes
  [1] Spine: R, 60 keyframes
  [2] Spine1: R, 60 keyframes
  [3] Spine2: R, 60 keyframes
  [4] Neck: R, 60 keyframes
  [5] Head: R, 60 keyframes
  ...
```

## 典型使用场景

| 场景 | 做法 |
|------|------|
| 验证动画是否正确导入 | `anim-info -i anim.ani` 检查时长和轨道数 |
| 检查动画包含哪些骨骼 | `anim-info -i anim.ani --tracks` 查看轨道名称 |
| 排查动画重定向失败 | 对比 `anim-info --tracks` 和 `model-info --bones` 的骨骼名 |
| 检查动画数据量 | 查看关键帧总数，评估文件大小是否合理 |
| 确认动画通道 | 查看 Channels 统计，确认是否包含位移/缩放数据 |

## 注意事项

- ANI 文件路径必须使用**绝对路径**
- `--tracks` 会输出所有轨道信息，骨骼多时输出较长
- 通道统计中，纯旋转动画（只有 R）是最常见的，位移（P）通常只有根骨骼有
