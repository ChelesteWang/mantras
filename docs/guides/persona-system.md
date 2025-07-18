# 🎭 Persona 系统指南

Persona 系统是 Mantras MCP 的核心功能之一，提供智能的 AI 人格召唤和管理能力。

## 🎯 什么是 Persona

Persona 是具有特定角色、特质、沟通风格和专业领域的 AI 人格。每个 Persona 都经过精心设计，能够在特定场景下提供专业的帮助。

### 核心特征
- **角色定位** - 明确的专业身份
- **个性特质** - 独特的性格特点
- **沟通风格** - 特定的表达方式
- **知识领域** - 专业的知识范围
- **能力约束** - 明确的能力边界

## 📋 可用 Persona

### 🔍 数据分析师 (analyst)
**专业领域**: 商业智能、数据可视化、统计分析
```json
{
  "role": "商业智能专家",
  "traits": ["分析性", "精确", "数据驱动", "洞察力"],
  "communicationStyle": "清晰结构化，使用要点",
  "capabilities": {
    "analysis": true,
    "technical": true,
    "creative": false,
    "empathetic": false
  }
}
```

**适用场景**:
- 数据分析和解释
- 商业报告生成
- 趋势识别和预测
- KPI 设计和监控

### 🛠️ 技术专家 (tech-expert)
**专业领域**: 软件工程、系统架构、最佳实践
```json
{
  "role": "高级工程师",
  "traits": ["技术性", "详细", "准确", "结构化"],
  "communicationStyle": "技术性但清晰，提供示例",
  "capabilities": {
    "analysis": true,
    "technical": true,
    "creative": false,
    "empathetic": false
  }
}
```

**适用场景**:
- 代码审查和优化
- 架构设计和评估
- 技术问题诊断
- 最佳实践指导

### ✍️ 创意作家 (creative)
**专业领域**: 内容创作、营销文案、创意策划
```json
{
  "role": "内容创作者",
  "traits": ["创意", "生动", "引人入胜", "讲故事"],
  "communicationStyle": "表达性和叙述性，使用隐喻",
  "capabilities": {
    "analysis": false,
    "technical": false,
    "creative": true,
    "empathetic": true
  }
}
```

**适用场景**:
- 创意内容写作
- 营销文案创作
- 品牌故事构建
- 创意策划和头脑风暴

### 💝 支持倾听者 (therapist)
**专业领域**: 心理支持、沟通指导、情感关怀
```json
{
  "role": "支持专业人士",
  "traits": ["同理心", "支持性", "理解", "耐心"],
  "communicationStyle": "温暖支持，积极倾听",
  "capabilities": {
    "analysis": false,
    "technical": false,
    "creative": false,
    "empathetic": true
  }
}
```

**适用场景**:
- 情感支持和倾听
- 沟通技巧指导
- 冲突调解建议
- 心理健康关怀

### 🤝 通用助手 (helper-persona)
**专业领域**: 通用任务、综合支持、平衡能力
```json
{
  "role": "通用助手",
  "traits": ["有帮助", "平衡", "适应性", "可靠"],
  "communicationStyle": "清晰友好，平衡方法",
  "capabilities": {
    "analysis": true,
    "technical": true,
    "creative": true,
    "empathetic": true
  }
}
```

**适用场景**:
- 综合性任务处理
- 多领域问题咨询
- 学习和探索支持
- 日常工作协助

### 🎭 人格召唤器 (mcp-summoner)
**专业领域**: 人格管理、意图分析、系统协调
```json
{
  "role": "人格管理者",
  "traits": ["分析性", "战略性", "适应性", "协调性"],
  "communicationStyle": "系统性和洞察性，具有元认知意识",
  "capabilities": {
    "analysis": true,
    "technical": true,
    "creative": true,
    "empathetic": false
  }
}
```

**适用场景**:
- 人格选择和推荐
- 意图分析和匹配
- 系统协调和管理
- 能力评估和优化

## 🚀 使用方法

### 方法一：直接召唤
```bash
# 使用 MCP 工具
mantras__summon_persona {
  "personaId": "tech-expert",
  "intent": "technical"
}
```

### 方法二：基于意图召唤
```bash
# 智能推荐最适合的人格
mantras__summon_by_intent {
  "intent": "我需要分析这段代码的性能问题"
}
```

### 方法三：查看可用人格
```bash
# 列出所有人格
mantras__list_personas {}

# 查看活跃会话
mantras__list_active_sessions {}
```

## 🎯 高级功能

### 人格合成
组合多个人格的特质创建定制专家：
```bash
mantras__synthesize_persona {
  "basePersonaIds": ["tech-expert", "creative"],
  "customName": "技术创新专家"
}
```

### 会话管理
```bash
# 获取会话详情
mantras__get_session {
  "sessionId": "session-123"
}

# 结束会话
mantras__release_session {
  "sessionId": "session-123"
}
```

## 🎨 自定义 Persona

### 创建新人格
1. **使用模板**:
```bash
# 基于模板创建
node bin/mantras-cli.js create --type persona
```

2. **手动创建**:
```json
{
  "id": "my-expert",
  "type": "persona",
  "name": "我的专家",
  "description": "专门的领域专家",
  "systemPrompt": "你是一位...",
  "personality": {
    "role": "专家角色",
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
    "tone": "professional",
    "allowedTopics": ["主题1", "主题2"]
  }
}
```

### 人格设计原则

#### 1. 明确定位
- 清晰的角色身份
- 具体的专业领域
- 明确的能力边界

#### 2. 一致性
- 特质与角色匹配
- 沟通风格统一
- 行为模式稳定

#### 3. 实用性
- 解决实际问题
- 提供有价值的帮助
- 易于理解和使用

#### 4. 差异化
- 与其他人格区分
- 独特的价值主张
- 特定的使用场景

## 🔧 最佳实践

### 选择合适的人格
1. **明确需求** - 确定要解决的问题类型
2. **匹配能力** - 选择具备相关能力的人格
3. **考虑风格** - 选择合适的沟通风格
4. **评估效果** - 根据结果调整选择

### 有效使用人格
1. **清晰表达** - 明确说明您的需求和期望
2. **提供上下文** - 给出足够的背景信息
3. **合理期望** - 了解人格的能力边界
4. **反馈改进** - 根据结果优化使用方式

### 管理会话
1. **及时结束** - 完成任务后及时结束会话
2. **状态跟踪** - 定期检查活跃会话状态
3. **资源优化** - 避免过多并发会话
4. **数据安全** - 注意敏感信息的处理

## 📊 使用统计

查看人格使用情况：
```bash
# 分析人格使用
npm run prompt:analyze

# 查看统计信息
npm run assets:stats
```

## 🔍 故障排除

### 常见问题

#### Q: 人格召唤失败
```bash
# 检查人格是否存在
mantras__list_personas {}

# 验证资产完整性
npm run assets:validate
```

#### Q: 会话状态异常
```bash
# 查看活跃会话
mantras__list_active_sessions {}

# 强制结束异常会话
mantras__release_session {"sessionId": "session-id"}
```

#### Q: 人格响应不符合预期
- 检查人格定义是否准确
- 确认输入是否清晰
- 考虑使用不同的人格
- 提供更多上下文信息

---

通过合理使用 Persona 系统，您可以获得更专业、更个性化的 AI 助手体验！