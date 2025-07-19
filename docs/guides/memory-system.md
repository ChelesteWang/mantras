# 🧠 Agent 记忆系统使用指南

## 概述

Mantra MCP 系统现在包含了强大的 agent 记忆能力，支持对话历史、上下文记忆、长期记忆存储和智能检索。

## 🎯 核心功能

### 1. 对话历史管理
- 自动记录用户和助手的对话
- 支持时间范围查询
- 智能对话重要性评估

### 2. 上下文记忆
- 当前话题跟踪
- 活跃项目管理
- 最近文件记录
- 用户偏好设置

### 3. 长期记忆存储
- 分类记忆存储（事实、任务、偏好等）
- 重要性评分系统
- 标签化组织
- 智能检索算法

### 4. 记忆分析
- 模式识别
- 连接发现
- 时间线分析
- 洞察生成

## 🚀 使用示例

### 基础记忆操作

#### 添加记忆
```javascript
// 添加一个重要事实
await mcp_mantras_manage_memory({
  action: "add_memory",
  sessionId: "session_123",
  memoryType: "fact",
  content: "用户偏好使用 TypeScript 进行开发",
  importance: 8,
  tags: ["preference", "typescript", "development"],
  metadata: { source: "conversation" }
});
```

#### 搜索记忆
```javascript
// 搜索相关记忆
await mcp_mantras_manage_memory({
  action: "search_memories",
  query: "typescript development",
  sessionId: "session_123"
});
```

#### 获取记忆统计
```javascript
// 获取会话记忆统计
await mcp_mantras_manage_memory({
  action: "get_stats",
  sessionId: "session_123"
});
```

### 对话历史管理

#### 添加对话记录
```javascript
// 记录用户消息
await mcp_mantras_manage_memory({
  action: "add_conversation",
  sessionId: "session_123",
  role: "user",
  content: "我想学习如何优化 React 应用的性能",
  metadata: { important: true, topic: "react_optimization" }
});

// 记录助手回复
await mcp_mantras_manage_memory({
  action: "add_conversation",
  sessionId: "session_123",
  role: "assistant",
  content: "我可以帮你了解 React 性能优化的最佳实践...",
  metadata: { topic: "react_optimization" }
});
```

#### 获取对话历史
```javascript
// 获取最近10条对话
await mcp_mantras_manage_memory({
  action: "get_conversation_history",
  sessionId: "session_123",
  limit: 10
});
```

### 上下文管理

#### 设置上下文
```javascript
// 更新会话上下文
await mcp_mantras_manage_memory({
  action: "set_context",
  sessionId: "session_123",
  contextUpdates: {
    currentTopic: "React 性能优化",
    activeProjects: ["电商网站", "管理后台"],
    workingDirectory: "/Users/dev/react-project",
    preferences: {
      codeStyle: "functional",
      testFramework: "jest"
    }
  }
});
```

#### 获取上下文
```javascript
// 获取当前上下文
await mcp_mantras_manage_memory({
  action: "get_context",
  sessionId: "session_123"
});
```

### 记忆分析

#### 分析记忆模式
```javascript
// 分析会话记忆模式
await mcp_mantras_analyze_memory({
  action: "analyze_patterns",
  sessionId: "session_123"
});
```

#### 获取洞察
```javascript
// 获取重要记忆洞察
await mcp_mantras_analyze_memory({
  action: "get_insights",
  sessionId: "session_123",
  minImportance: 7
});
```

#### 查找连接
```javascript
// 查找标签相关的记忆连接
await mcp_mantras_analyze_memory({
  action: "find_connections",
  sessionId: "session_123",
  tags: ["typescript", "react", "performance"]
});
```

#### 生成记忆时间线
```javascript
// 生成记忆时间线
await mcp_mantras_analyze_memory({
  action: "memory_timeline",
  sessionId: "session_123",
  timeRange: {
    start: "2024-01-01T00:00:00Z",
    end: "2024-01-31T23:59:59Z"
  }
});
```

## 🎭 与 Persona 系统集成

### 自动记忆初始化
当召唤 persona 时，系统会自动：
1. 创建会话记忆实例
2. 设置初始上下文
3. 从全局记忆中继承相关记忆

```javascript
// 召唤技术专家 persona
const session = await mcp_mantras_summon_persona({
  personaId: "tech-expert",
  intent: "React 性能优化咨询",
  customParams: {
    expertise: "frontend_performance"
  }
});

// 系统会自动：
// - 设置当前话题为 "React 性能优化咨询"
// - 从全局记忆中获取相关的 React 和性能优化记忆
// - 创建初始化记忆条目
```

### 会话结束时的记忆转移
```javascript
// 释放会话时，重要记忆会自动转移到全局记忆
await mcp_mantras_release_session({
  sessionId: "session_123"
});

// 系统会自动：
// - 将重要性 >= 7 的记忆转移到全局记忆
// - 为转移的记忆添加 "transferred" 标签
// - 保留原始会话信息
```

## 📊 记忆类型说明

### 1. conversation（对话）
- 用户和助手的对话记录
- 自动重要性评估
- 支持元数据标注

### 2. context（上下文）
- 当前话题、项目、文件等上下文信息
- 环境状态记录
- 工作流程跟踪

### 3. preference（偏好）
- 用户偏好设置
- 工作习惯记录
- 个性化配置

### 4. fact（事实）
- 重要事实信息
- 知识点记录
- 学习内容存储

### 5. task（任务）
- 任务记录
- 待办事项
- 目标跟踪

## 🔧 高级功能

### 智能记忆检索
系统使用多因素评分算法进行智能记忆检索：

1. **重要性分数**：基础分数
2. **内容匹配**：关键词匹配加分
3. **标签匹配**：相关标签加分
4. **时间衰减**：新记忆优先

### 记忆清理
```javascript
// 清理30天前的低重要性记忆
const cleanedCount = sessionMemory.cleanupOldMemories(30);
```

### 记忆导出导入
```javascript
// 导出记忆数据
const memoryData = sessionMemory.exportMemory();

// 导入记忆数据
const newSession = new SessionMemory();
newSession.importMemory(memoryData);
```

## 🎯 最佳实践

### 1. 重要性评分指南
- **1-3**：临时信息，可随时清理
- **4-6**：一般重要，短期保留
- **7-8**：重要信息，长期保留
- **9-10**：关键信息，永久保留

### 2. 标签使用建议
- 使用一致的标签命名规范
- 结合功能和内容标签
- 避免过度标签化

### 3. 上下文管理
- 及时更新当前话题
- 维护活跃项目列表
- 记录重要的环境变化

### 4. 记忆分析
- 定期分析记忆模式
- 查找知识连接
- 生成学习洞察

## 🔍 故障排除

### 常见问题

1. **记忆检索结果不准确**
   - 检查查询关键词
   - 验证标签设置
   - 调整重要性阈值

2. **记忆过多影响性能**
   - 定期清理旧记忆
   - 调整重要性评分
   - 使用更精确的标签

3. **上下文信息丢失**
   - 确保及时更新上下文
   - 检查会话状态
   - 验证记忆转移设置

通过这个强大的记忆系统，你的 agent 现在具备了真正的"记忆"能力，能够：
- 记住重要的对话内容
- 理解用户的偏好和习惯
- 维护工作上下文
- 提供个性化的服务
- 从历史经验中学习

开始使用这些功能，让你的 agent 变得更加智能和个性化！