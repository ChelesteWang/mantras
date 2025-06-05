# 智能体: 示例智能体 (ID: sample-agent-001)

一个用于展示Mantras-Next功能的示例智能体

## 元数据

```json
{
  "version": "1.0.0",
  "author": "Mantras Team",
  "tags": [
    "sample",
    "demo",
    "ide"
  ]
}
```

## 工具

### 代码格式化工具 (ID: code-formatter)

格式化代码，使其符合指定的风格规范

- 类别: code
- 所需权限: read_file

### 文件读取工具 (ID: file-reader)

读取文件内容，支持部分读取和行号显示

- 类别: file
- 所需权限: read_file

## 记忆系统

- 名称: 简单记忆系统
- ID: simple-memory-001
- 描述: 一个基本的记忆实现，使用Map存储数据

