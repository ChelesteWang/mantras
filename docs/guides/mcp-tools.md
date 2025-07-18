# Mantra MCP Init Tool 使用指南

## 概述

`init` 工具是 Mantra MCP 系统的入口点，专门为 AI agent 设计，用于快速了解和初始化整个系统。

## 功能特性

- 🚀 **系统概览**: 提供完整的 Mantra MCP 系统介绍
- 📚 **功能说明**: 详细介绍所有可用的核心功能
- 🛠️ **工具列表**: 展示所有可用的 MCP 工具
- 📖 **使用示例**: 提供实际的使用案例和参数示例
- 🏗️ **架构信息**: 可选的系统架构详细信息
- 🎯 **快速开始**: 提供清晰的使用步骤指导

## 使用方法

### 基本用法

```typescript
// 获取基本系统概览（包含使用示例，不包含架构详情）
const result = await initTool.execute({});
```

### 高级用法

```typescript
// 获取完整信息（包含示例和架构详情）
const result = await initTool.execute({
  includeExamples: true,
  includeArchitecture: true
});

// 只获取系统概览，不包含示例
const result = await initTool.execute({
  includeExamples: false
});

// 获取架构信息但不包含示例
const result = await initTool.execute({
  includeExamples: false,
  includeArchitecture: true
});
```

## 通过 MCP 协议调用

当通过 MCP 协议调用时，使用以下格式：

```json
{
  "method": "tools/call",
  "params": {
    "name": "init",
    "arguments": {
      "includeExamples": true,
      "includeArchitecture": false
    }
  }
}
```

## 返回结果结构

```typescript
{
  status: "Mantra MCP System Initialized",
  timestamp: "2024-01-01T00:00:00.000Z",
  overview: {
    name: "Mantra MCP (Model Context Protocol) System",
    version: "2.0.0",
    description: "A comprehensive AI asset management and persona summoning system",
    coreCapabilities: {
      assetManagement: { ... },
      personaSystem: { ... },
      mantraTemplates: { ... },
      executionPlanning: { ... }
    },
    quickStart: { ... },
    commonWorkflows: [ ... ]
  },
  examples?: { ... },      // 当 includeExamples = true
  architecture?: { ... },  // 当 includeArchitecture = true
  nextSteps: [ ... ]
}
```

## 核心功能介绍

### 1. 资产管理 (Asset Management)
- 管理 personas、prompts、tools、prompt-templates
- 工具: `list_assets`, `get_asset`

### 2. Persona 系统 (Persona System)
- AI persona 召唤和会话管理
- 工具: `summon_persona`, `summon_by_intent`, `list_active_sessions` 等

### 3. Mantra 模板 (Mantra Templates)
- 提示工程模板应用
- 工具: `list_mantras`, `apply_mantra`

### 4. 执行计划 (Execution Planning)
- 复杂任务的计划创建和执行
- 工具: `create_execution_plan`, `execute_plan`, `get_project_context`

## 推荐工作流程

### 对于新用户
1. 调用 `init` 工具了解系统
2. 调用 `list_assets` 查看可用资源
3. 调用 `list_personas` 查看可用 AI personas
4. 根据需求使用 `summon_persona` 或其他工具

### 对于开发者
1. 调用 `init` 工具并设置 `includeArchitecture: true`
2. 了解系统架构和扩展点
3. 查看现有工具实现作为参考
4. 开发自定义工具或 personas

## 注意事项

- `includeExamples` 默认为 `true`
- `includeArchitecture` 默认为 `false`
- 返回的时间戳为 ISO 8601 格式
- 所有参数都是可选的

## 示例输出

调用 `init` 工具后，你将获得类似以下的结构化信息，帮助你快速了解和使用整个 Mantra MCP 系统。

这个工具特别适合：
- 🤖 AI agents 初次接触系统时的自我介绍
- 📋 系统功能的快速查询
- 🔍 可用工具和功能的发现
- 📚 使用方法的学习和参考