# 增强任务管理功能使用指南

## 概述

基于 kazuph/mcp-taskmanager 的队列式任务管理功能，我们为 Mantras MCP 项目集成了完整的任务管理系统，包括：

- 🔄 **队列式任务管理** - 自动排序和依赖管理
- 📋 **智能任务分解** - 根据任务类型自动分解为子任务
- 📊 **状态跟踪** - 实时监控任务进度和状态
- 🔗 **依赖管理** - 自动处理任务间的依赖关系
- 📈 **统计分析** - 提供详细的任务统计信息

## 核心功能

### 1. 创建增强执行计划

```bash
mantras__create_execution_plan {
  "userRequest": "调试React应用的性能问题",
  "includeContext": true,
  "autoDecompose": true
}
```

**功能特点：**
- 自动分解复杂任务为可管理的子任务
- 智能识别任务类型（调试、实现、重构等）
- 自动设置任务依赖关系
- 生成优先级排序

**返回结果：**
```json
{
  "success": true,
  "plan": {
    "id": "plan_1234567890_abc123",
    "title": "执行计划: 调试React应用的性能问题",
    "description": "调试React应用的性能问题",
    "tasks": [
      {
        "id": "task_1234567890_def456",
        "title": "问题分析",
        "description": "分析和定位问题根源",
        "status": "pending",
        "priority": "high",
        "dependencies": [],
        "tags": ["analysis", "debugging"]
      },
      {
        "id": "task_1234567890_ghi789",
        "title": "解决方案设计",
        "description": "设计修复方案",
        "status": "pending",
        "priority": "medium",
        "dependencies": ["问题分析"],
        "tags": ["design", "debugging"]
      }
    ],
    "status": "active"
  },
  "recommendations": [
    "建议按照任务依赖顺序执行",
    "定期检查任务状态和进度",
    "遇到阻塞时及时调整计划"
  ],
  "nextActions": [
    "开始执行: 问题分析"
  ]
}
```

### 2. 执行计划

```bash
mantras__execute_plan {
  "planId": "plan_1234567890_abc123",
  "autoProgress": true
}
```

**功能特点：**
- 自动识别当前可执行的任务
- 跟踪执行进度
- 提供下一步行动建议
- 支持自动进度推进

**返回结果：**
```json
{
  "success": true,
  "plan": { /* 计划详情 */ },
  "currentTask": {
    "id": "task_1234567890_def456",
    "title": "问题分析",
    "status": "in_progress"
  },
  "progress": {
    "completed": 0,
    "total": 4,
    "percentage": 0
  },
  "nextSteps": [
    "执行任务: 问题分析",
    "描述: 分析和定位问题根源"
  ]
}
```

### 3. 获取任务状态

```bash
mantras__get_task_status {
  "planId": "plan_1234567890_abc123"
}
```

**功能特点：**
- 查看所有任务或特定任务状态
- 获取详细统计信息
- 查看当前执行队列

**返回结果：**
```json
{
  "success": true,
  "tasks": [ /* 任务列表 */ ],
  "statistics": {
    "total": 4,
    "byStatus": {
      "pending": 3,
      "in_progress": 1,
      "completed": 0,
      "failed": 0,
      "blocked": 0,
      "cancelled": 0
    },
    "byPriority": {
      "urgent": 0,
      "high": 2,
      "medium": 2,
      "low": 0
    },
    "executable": 1,
    "blocked": 0
  },
  "queue": [ /* 当前可执行任务队列 */ ]
}
```

### 4. 更新任务状态

```bash
mantras__update_task_status {
  "taskId": "task_1234567890_def456",
  "status": "completed",
  "notes": "问题已定位，是由于组件重复渲染导致"
}
```

**功能特点：**
- 更新任务状态
- 自动解锁依赖任务
- 提供影响分析
- 记录状态变更备注

## 任务类型和自动分解

### 调试任务 (Debug)
关键词：`debug`, `调试`, `问题`, `错误`

自动分解为：
1. **问题分析** - 分析和定位问题根源
2. **解决方案设计** - 设计修复方案
3. **实施修复** - 实施修复方案
4. **测试验证** - 验证修复效果

### 实现任务 (Implementation)
关键词：`implement`, `实现`, `开发`, `构建`

自动分解为：
1. **需求分析** - 分析功能需求和技术要求
2. **架构设计** - 设计系统架构和接口
3. **核心实现** - 实现核心功能逻辑
4. **测试编写** - 编写单元测试和集成测试
5. **文档更新** - 更新相关文档

### 通用任务 (General)
其他类型任务的默认分解：
1. **任务分析** - 分析任务要求和约束条件
2. **方案设计** - 设计实施方案
3. **执行实施** - 执行具体实施步骤
4. **结果验证** - 验证执行结果

## 任务状态说明

| 状态 | 描述 | 可转换状态 |
|------|------|------------|
| `pending` | 待处理 | `in_progress`, `cancelled` |
| `in_progress` | 进行中 | `completed`, `failed`, `blocked` |
| `completed` | 已完成 | - |
| `failed` | 失败 | `pending`, `cancelled` |
| `blocked` | 被阻塞 | `pending`, `cancelled` |
| `cancelled` | 已取消 | `pending` |

## 优先级系统

| 优先级 | 描述 | 队列权重 |
|--------|------|----------|
| `urgent` | 紧急 | 4 |
| `high` | 高 | 3 |
| `medium` | 中等 | 2 |
| `low` | 低 | 1 |

## 使用场景示例

### 场景1：调试性能问题

```bash
# 1. 创建调试计划
mantras__create_execution_plan {
  "userRequest": "调试React应用首页加载缓慢的问题",
  "autoDecompose": true
}

# 2. 执行计划
mantras__execute_plan {
  "planId": "返回的计划ID",
  "autoProgress": true
}

# 3. 更新任务状态
mantras__update_task_status {
  "taskId": "问题分析任务ID",
  "status": "completed",
  "notes": "发现是大量组件重复渲染导致"
}

# 4. 检查进度
mantras__get_task_status {
  "planId": "计划ID"
}
```

### 场景2：实现新功能

```bash
# 1. 创建实现计划
mantras__create_execution_plan {
  "userRequest": "实现用户认证和权限管理系统",
  "includeContext": true,
  "autoDecompose": true
}

# 2. 逐步执行和更新状态
mantras__update_task_status {
  "taskId": "需求分析任务ID",
  "status": "completed"
}

mantras__update_task_status {
  "taskId": "架构设计任务ID", 
  "status": "in_progress"
}
```

## 最佳实践

### 1. 计划创建
- 使用描述性的任务请求
- 启用自动分解以获得更好的任务结构
- 包含上下文信息以获得更准确的分解

### 2. 执行管理
- 定期检查任务状态和队列
- 及时更新任务状态以解锁依赖任务
- 使用备注记录重要信息

### 3. 状态跟踪
- 利用统计信息监控整体进度
- 关注被阻塞的任务并及时处理
- 使用队列信息优化工作流程

### 4. 依赖管理
- 理解任务间的依赖关系
- 优先完成阻塞其他任务的关键任务
- 合理设置任务优先级

## 与原有功能的集成

新的增强任务管理功能完全兼容原有的 Mantras MCP 系统：

- **人格系统** - 可以召唤特定人格来执行不同类型的任务
- **提示模板** - 结合提示工程模板优化任务执行
- **记忆系统** - 任务执行过程和结果会被记录到记忆系统
- **资产管理** - 任务可以引用和使用系统中的各种资产

## 技术实现特点

### 队列管理
- 基于优先级和依赖关系的智能排序
- 实时更新可执行任务队列
- 自动处理任务状态变更的连锁反应

### 依赖跟踪
- 支持任务ID和任务标题的依赖引用
- 自动检测循环依赖
- 智能解锁机制

### 状态管理
- 完整的任务生命周期管理
- 时间戳跟踪（创建、开始、完成时间）
- 元数据支持扩展信息

### 统计分析
- 实时统计信息计算
- 多维度数据分析
- 性能指标跟踪

这个增强的任务管理系统为 Mantras MCP 项目提供了企业级的任务管理能力，让AI助手能够更好地处理复杂的多步骤任务。