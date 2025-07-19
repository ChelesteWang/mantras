# Mantra MCP 工具使用指南

## 概述

Mantra MCP 系统提供了一套智能化的工具集，专门为 AI agent 设计，用于提高交互质量和用户体验。

## 🚀 核心工具

### 1. Init Tool - 系统初始化工具

`init` 工具是 Mantra MCP 系统的入口点，提供系统概览和使用指导。

#### 功能特性

- 🚀 **系统概览**: 提供完整的 Mantra MCP 系统介绍
- 📚 **功能说明**: 详细介绍所有可用的核心功能
- 🛠️ **工具列表**: 展示所有可用的 MCP 工具
- 📖 **使用示例**: 提供实际的使用案例和参数示例
- 🏗️ **架构信息**: 可选的系统架构详细信息
- 🎯 **智能引导**: 提供 AI agent 使用建议和最佳实践

#### 使用方法

```typescript
// 获取基本系统概览（包含使用示例，不包含架构详情）
const result = await initTool.execute({});

// 获取完整信息（包含示例和架构详情）
const result = await initTool.execute({
  includeExamples: true,
  includeArchitecture: true
});
```

### 2. Intent Analyzer Tool - 意图分析工具

`analyze_intent` 工具能够智能分析用户输入，推荐最合适的 Mantras 工具和人格。

#### 功能特性

- 🧠 **智能意图识别**: 基于关键词和上下文分析用户意图
- 🎯 **精准推荐**: 推荐最适合的工具和人格组合
- 📊 **置信度评估**: 提供推荐的置信度分数
- 🔄 **替代方案**: 提供多个可选的处理方案
- ⚡ **立即行动**: 生成可直接执行的操作建议

#### 使用方法

```typescript
// 分析用户意图并获取推荐
const result = await intentAnalyzerTool.execute({
  userInput: "我需要帮助优化我的代码性能",
  context: "用户正在开发一个 Web 应用",
  includeAlternatives: true
});
```

#### 支持的意图类型

- **technical**: 技术问题、编程、架构设计
- **creative**: 创意写作、内容创作、营销文案
- **analytical**: 数据分析、统计、报告生成
- **supportive**: 情感支持、理解、沟通建议
- **planning**: 任务规划、项目管理、流程设计
- **critical**: 批评性思维、问题审视、改进建议
- **reflective**: 深度思考、逻辑分析、原理探讨
- **encouraging**: 积极鼓励、优势发现、创新激发
- **business**: 商业策略、产品规划、市场分析

### 3. Smart Recommender Tool - 智能推荐工具

`smart_recommend` 工具基于对话历史和用户模式，主动推荐最合适的 Mantras 工具。

#### 功能特性

- 📈 **上下文分析**: 深度分析对话历史和用户行为模式
- 🎭 **动态推荐**: 根据实时情况调整推荐策略
- 🔮 **前瞻性建议**: 预测用户未来可能需要的工具
- 📊 **优先级排序**: 按紧急程度和相关性排序推荐
- 🎯 **个性化**: 基于用户偏好定制推荐

#### 使用方法

```typescript
// 获取智能推荐
const result = await smartRecommenderTool.execute({
  conversationHistory: [
    { role: "user", content: "我想学习 React", timestamp: "2024-01-01T10:00:00Z" },
    { role: "assistant", content: "我可以帮你制定学习计划", timestamp: "2024-01-01T10:01:00Z" }
  ],
  currentUserInput: "但是我觉得 JavaScript 基础还不够扎实",
  userPreferences: { preferredLearningStyle: "step-by-step" },
  includeProactiveRecommendations: true
});
```

#### 分析维度

- **对话语调**: formal, casual, technical, neutral
- **话题进展**: 跟踪对话中涉及的主题变化
- **用户参与度**: high, medium, low
- **复杂度趋势**: increasing, decreasing, stable
- **情感状态**: positive, negative, frustrated, confused, urgent, neutral
- **任务类型**: problem_solving, learning, creation, analysis, planning
- **专业领域**: technical, creative, analytical, business, psychological

## 🎯 AI Agent 使用建议

### 何时使用 Mantras 工具

1. **用户询问复杂问题时**
   - 使用 `create_execution_plan` 分解任务
   - 使用 `analyze_intent` 识别最佳处理方式

2. **检测到专业需求时**
   - 使用 `summon_by_intent` 激活专业人格
   - 使用 `smart_recommend` 获取个性化建议

3. **用户表达情感或需要支持时**
   - 优先考虑 `summon_by_intent` 激活支持性人格
   - 使用情感分析功能提供适当响应

4. **对话变得复杂或多主题时**
   - 使用 `smart_recommend` 分析对话模式
   - 考虑 `synthesize_persona` 组合多种专业能力

### 主动推荐策略

1. **在 `mantras init` 后立即使用**
   - 调用 `analyze_intent` 分析用户当前需求
   - 根据分析结果主动推荐合适的工具

2. **持续监控对话质量**
   - 定期使用 `smart_recommend` 评估是否需要切换策略
   - 根据用户反馈调整推荐算法

3. **预测性推荐**
   - 基于对话历史预测用户下一步需求
   - 提前准备相关工具和人格

## 🔧 最佳实践

### 1. 工具组合使用

```typescript
// 推荐的工作流程
async function intelligentAssistance(userInput: string, conversationHistory: any[]) {
  // 1. 分析用户意图
  const intentAnalysis = await intentAnalyzerTool.execute({
    userInput,
    context: getContextFromHistory(conversationHistory)
  });
  
  // 2. 获取智能推荐
  const recommendations = await smartRecommenderTool.execute({
    conversationHistory,
    currentUserInput: userInput,
    includeProactiveRecommendations: true
  });
  
  // 3. 执行推荐的主要操作
  if (recommendations.recommendations.immediate.length > 0) {
    const primaryAction = recommendations.recommendations.immediate[0];
    // 执行推荐的工具调用
  }
}
```

### 2. 渐进式增强

- 从简单的意图分析开始
- 根据用户反馈逐步引入更复杂的功能
- 保持推荐的相关性和时效性

### 3. 用户体验优化

- 避免过度推荐，保持适度
- 提供清晰的推荐理由
- 允许用户选择是否接受推荐

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