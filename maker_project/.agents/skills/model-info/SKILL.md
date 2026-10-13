---
name: model-info
description: "查询 MDL 模型文件信息。Use when users need to (1) 查看模型信息, (2) 检查 MDL 文件, (3) 查看模型顶点数/面数/骨骼, (4) 查看 LOD 信息, (5) model info, (6) 排查模型导入结果是否正确。"
---

# MDL 模型信息查询指南

## 工具路径

```
/workspace/.cli/UrhoXCLI
```

## 基本用法

```bash
/workspace/.cli/UrhoXCLI model-info -i <mdl_path> [options]
```

## 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `-i, --input` | 是 | 输入 MDL 文件路径（绝对路径） |
| `--bones` | 否 | 显示完整骨骼列表（骨骼名 + 父骨骼索引） |

## 输出内容

工具会输出以下信息：

| 信息 | 说明 | 示例 |
|------|------|------|
| Bounding Box | 包围盒 Min/Max/Size | `Min: (-0.5, 0, -0.5)  Size: (1, 2, 1)` |
| Geometries | 几何体数量及每个几何体的 LOD 层级 | `Geometry 0 (3 LOD levels)` |
| LOD 详情 | 每级 LOD 的顶点数、三角面数、切换距离 | `LOD0: 5000 verts, 3000 tris, lodDist=0` |
| Vertex Attributes | 顶点属性列表 | `Position Normal Tangent TexCoord BoneWeights BoneIndices` |
| Skeleton | 骨骼数量 | `Skeleton: 65 bones` |
| Bone List | 使用 `--bones` 时显示每根骨骼的名称和父索引 | `[0] Hips (parent=root)` |
| LODGroup | 如果 `.lodgroup` 文件存在，显示 LOD 切换参数 | `screenSize=0.2, maxDeviation=0.01` |

## 标准工作流

### 1. 查看模型基本信息

```bash
/workspace/.cli/UrhoXCLI model-info \
  -i /workspace/assets/Models/character.mdl
```

### 2. 查看模型骨骼结构（用于动画调试）

```bash
/workspace/.cli/UrhoXCLI model-info \
  -i /workspace/assets/Models/character.mdl \
  --bones
```

### 3. 导入后验证

导入 FBX 后，用 model-info 验证导入结果：

```bash
# 先导入
/workspace/.cli/UrhoXCLI import-model \
  -i /workspace/assets/Raw/character.fbx \
  -o /workspace/assets/Models/character.mdl

# 再验证
/workspace/.cli/UrhoXCLI model-info \
  -i /workspace/assets/Models/character.mdl --bones
```

## 输出示例

```
Model: character.mdl

Bounding Box:
  Min: (-0.45, 0, -0.2)
  Max: (0.45, 1.75, 0.2)
  Size: (0.9, 1.75, 0.4)

Geometries: 2
  Geometry 0 (3 LOD levels):
    LOD0: 5832 verts, 3420 tris, lodDist=0
    LOD1: 4957 verts, 2907 tris, lodDist=0.2
    LOD2: 3791 verts, 2223 tris, lodDist=0.08

  Geometry 1 (3 LOD levels):
    LOD0: 1200 verts, 800 tris, lodDist=0
    LOD1: 1020 verts, 680 tris, lodDist=0.2
    LOD2: 780 verts, 520 tris, lodDist=0.08

Vertex Attributes: Position Normal Tangent TexCoord BoneWeights BoneIndices

Skeleton: 65 bones
```

## 典型使用场景

| 场景 | 做法 |
|------|------|
| 导入后验证模型是否正确 | `model-info -i model.mdl` 检查顶点数、面数、骨骼数 |
| 检查 LOD 是否生成 | 查看每个 Geometry 的 LOD levels 数量 |
| 动画重定向前检查骨骼 | `model-info -i model.mdl --bones` 查看骨骼名和层级 |
| 排查模型尺寸问题 | 查看 Bounding Box Size，单位为米 |
| 检查顶点属性是否完整 | 查看 Vertex Attributes 是否包含所需的语义 |

## 注意事项

- MDL 文件路径必须使用**绝对路径**
- `--bones` 会输出完整骨骼列表，骨骼数多时输出较长
- LODGroup 信息需要 `.lodgroup` 文件与 `.mdl` 同名同目录存在才会显示
