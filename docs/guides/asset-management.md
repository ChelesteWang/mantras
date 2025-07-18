# 资产维护指南

## 📋 概述

本指南提供了 Mantras MCP 系统资产维护的最佳实践和工具使用方法。

## 🏗️ 新的资产组织结构

### 目录结构
```
mantras/
├── assets/                    # 资产存储目录
│   ├── personas/             # 人格资产
│   │   ├── analyst.json
│   │   ├── tech-expert.json
│   │   └── creative.json
│   ├── prompt-templates/     # 提示模板
│   │   ├── role-prompting.json
│   │   └── debug-simulation.json
│   └── tools/               # 工具资产
├── templates/               # 资产模板
│   ├── persona.template.json
│   ├── prompt-template.template.json
│   └── tool.template.json
├── bin/
│   └── mantras-cli.js      # CLI管理工具
└── backups/                # 备份目录
```

## 🛠️ CLI工具使用

### 基础命令

#### 1. 查看所有资产
```bash
npm run assets:list
# 或
node bin/mantras-cli.js list
```

#### 2. 按类型过滤
```bash
node bin/mantras-cli.js list --type persona
node bin/mantras-cli.js list --type prompt-template
```

#### 3. 验证资产完整性
```bash
npm run assets:validate
# 或
node bin/mantras-cli.js validate
```

#### 4. 查看统计信息
```bash
npm run assets:stats
```

#### 5. 搜索资产
```bash
node bin/mantras-cli.js search "技术专家"
node bin/mantras-cli.js search "debugging" --type prompt-template
```

### 高级操作

#### 1. 创建新资产
```bash
# 基于模板创建
node bin/mantras-cli.js create --type persona
node bin/mantras-cli.js create --type prompt-template

# 交互式创建
node bin/mantras-cli.js create --interactive
```

#### 2. 导入导出
```bash
# 导出所有资产
npm run assets:export

# 导出特定类型
node bin/mantras-cli.js export ./exports --type persona --split

# 导入资产
node bin/mantras-cli.js import ./new-assets.json
node bin/mantras-cli.js import ./assets-directory/
```

#### 3. 备份和恢复
```bash
# 创建备份
npm run assets:backup

# 从备份恢复
node bin/mantras-cli.js restore ./backups/assets-backup-2025-01-18/
```

## 📝 资产创建最佳实践

### 1. 人格资产 (Persona)

#### 标准结构
```json
{
  "id": "unique-id",
  "type": "persona",
  "name": "显示名称",
  "description": "简短描述",
  "version": "1.0.0",
  "author": "作者",
  "tags": ["标签1", "标签2"],
  "systemPrompt": "系统提示",
  "personality": {
    "role": "角色定义",
    "traits": ["特质1", "特质2"],
    "communicationStyle": "沟通风格",
    "knowledgeDomains": ["领域1", "领域2"]
  },
  "capabilities": {
    "analysis": true,
    "creative": false,
    "technical": true,
    "empathetic": false
  },
  "constraints": {
    "maxResponseLength": 2000,
    "tone": "formal",
    "allowedTopics": ["主题1", "主题2"]
  },
  "metadata": {
    "created": "2025-01-18",
    "lastModified": "2025-01-18",
    "usageCount": 0,
    "rating": 5.0
  }
}
```

#### 命名规范
- **ID**: 使用kebab-case，如 `tech-expert`, `data-analyst`
- **文件名**: 与ID相同，如 `tech-expert.json`
- **名称**: 使用友好的显示名称，如 "Technical Expert"

### 2. 提示模板资产 (Prompt Template)

#### 标准结构
```json
{
  "id": "template-id",
  "type": "prompt-template",
  "name": "模板名称",
  "description": "模板描述",
  "technique": "技术名称",
  "template": "模板内容 {参数1} {参数2}",
  "parameters": ["参数1", "参数2"],
  "category": "分类",
  "examples": [
    {
      "name": "示例名称",
      "inputs": {"参数1": "值1", "参数2": "值2"},
      "expectedOutput": "期望输出"
    }
  ]
}
```

#### 参数规范
- 使用 `{参数名}` 格式
- 参数名使用camelCase
- 提供完整的示例

## 🔧 维护工作流

### 日常维护

#### 1. 每日检查
```bash
# 验证资产完整性
npm run assets:validate

# 查看使用统计
npm run assets:stats
```

#### 2. 每周维护
```bash
# 创建备份
npm run assets:backup

# 清理未使用的资产（预览）
node bin/mantras-cli.js cleanup --dry-run

# 生成使用报告
node bin/mantras-cli.js report
```

### 版本管理

#### 1. 资产版本控制
- 每次修改资产时更新 `version` 字段
- 在 `metadata.lastModified` 中记录修改时间
- 重大变更时创建备份

#### 2. Git集成
```bash
# 提交资产变更
git add assets/
git commit -m "feat: add new technical expert persona"

# 创建标签
git tag -a v2.1.0 -m "Added enhanced personas"
```

## 🚨 故障排除

### 常见问题

#### 1. 资产验证失败
```bash
# 查看详细错误
node bin/mantras-cli.js validate --verbose

# 修复常见问题
node bin/mantras-cli.js fix --auto
```

#### 2. 导入失败
```bash
# 检查文件格式
node bin/mantras-cli.js validate --file ./problematic-asset.json

# 强制导入（跳过验证）
node bin/mantras-cli.js import ./assets.json --force
```

#### 3. 性能问题
```bash
# 清理缓存
node bin/mantras-cli.js cache --clear

# 重建索引
node bin/mantras-cli.js reindex
```

## 📊 监控和分析

### 使用分析
```bash
# 生成详细报告
node bin/mantras-cli.js report --detailed

# 导出使用数据
node bin/mantras-cli.js export-usage ./usage-data.json
```

### 性能监控
```bash
# 检查加载时间
node bin/mantras-cli.js benchmark

# 内存使用分析
node bin/mantras-cli.js memory-usage
```

## 🔄 迁移指南

### 从旧格式迁移

#### 1. 自动迁移
```bash
# 从asset-sources.ts迁移
node bin/mantras-cli.js migrate --from legacy --to structured

# 验证迁移结果
npm run assets:validate
```

#### 2. 手动迁移
1. 从 `asset-sources.ts` 复制资产定义
2. 使用模板创建新的JSON文件
3. 添加元数据字段
4. 验证并导入

## 🎯 最佳实践总结

### ✅ 推荐做法
- 使用结构化目录存储资产
- 定期创建备份
- 为每个资产添加完整的元数据
- 使用CLI工具进行批量操作
- 遵循命名规范
- 定期验证资产完整性

### ❌ 避免做法
- 直接修改 `asset-sources.ts`
- 跳过资产验证
- 忽略版本控制
- 硬编码资产配置
- 缺少文档和示例

## 🔗 相关资源

- [架构文档](./ARCHITECTURE.md)
- [API参考](./api-reference.md)
- [开发指南](./getting-started.md)
- [故障排除](./troubleshooting.md)