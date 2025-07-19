# 🔧 灵活 MCP 工具设计原则

## 🎯 核心理念

### MCP 的本质定位
- **MCP 是数据提供者，不是决策者**
- **MCP 是工具箱，不是自动化系统**
- **MCP 的智能体现在灵活性，不是固定逻辑**

### 设计哲学转变

```
从：MCP 内置智能决策
到：MCP 提供灵活接口，外部控制所有决策
```

## 🏗️ 设计原则

### 1. 参数化一切 (Parameterize Everything)

**错误示例**：
```typescript
// 固定的内置逻辑
function analyzeIntent(input: string) {
  const intent = determineIntent(input); // 内置决策
  const persona = selectBestPersona(intent); // 内置选择
  return persona; // 返回决策结果
}
```

**正确示例**：
```typescript
// 完全参数化的接口
function analyzeUserInput(params: {
  input: string;
  analysisOptions: {
    includeKeywords?: boolean;
    includeEmotion?: boolean;
    includeComplexity?: boolean;
    customDimensions?: string[];
  };
  outputFormat?: 'detailed' | 'summary' | 'raw';
}) {
  // 只提供数据，不做决策
  return {
    keywords: params.analysisOptions.includeKeywords ? extractKeywords(params.input) : null,
    emotion: params.analysisOptions.includeEmotion ? analyzeEmotion(params.input) : null,
    complexity: params.analysisOptions.includeComplexity ? assessComplexity(params.input) : null,
    // ... 其他数据
  };
}
```

### 2. 数据与决策分离 (Separate Data from Decisions)

**MCP 职责**：
- ✅ 提供原始数据
- ✅ 执行计算和分析
- ✅ 格式化输出
- ✅ 应用过滤和排序

**MCP 不应该**：
- ❌ 决定"最佳"选择
- ❌ 内置业务逻辑
- ❌ 假设用户意图
- ❌ 自动执行操作

### 3. 接口优先设计 (Interface-First Design)

```typescript
// 设计接口时考虑最大灵活性
interface FlexibleToolInterface {
  // 输入参数完全可配置
  input: {
    data: any;
    options: ConfigurableOptions;
    filters?: FilterOptions;
    sorting?: SortingOptions;
    formatting?: FormattingOptions;
  };
  
  // 输出格式可选择
  output: {
    format: 'raw' | 'structured' | 'summary';
    includeMetadata: boolean;
    customFields?: string[];
  };
}
```

### 4. 组合优于继承 (Composition over Inheritance)

**错误方式**：
```typescript
// 单一大工具，内置所有逻辑
function superAnalyzer(input: string) {
  const keywords = extractKeywords(input);
  const emotion = analyzeEmotion(input);
  const intent = determineIntent(input);
  const persona = selectPersona(intent); // 内置决策
  return { persona, analysis: { keywords, emotion, intent } };
}
```

**正确方式**：
```typescript
// 小而专的工具，可组合使用
function extractKeywords(input: string, options: KeywordOptions): string[] { ... }
function analyzeEmotion(input: string, options: EmotionOptions): EmotionResult { ... }
function calculateScores(items: any[], criteria: ScoringCriteria): ScoredItem[] { ... }
function rankOptions(scores: ScoredItem[], weights: WeightConfig): RankedItem[] { ... }

// 外部组合使用
const keywords = extractKeywords(input, { minLength: 3, maxCount: 10 });
const emotion = analyzeEmotion(input, { includeConfidence: true });
const scores = calculateScores(personas, { domainMatch: 0.4, styleMatch: 0.6 });
const ranked = rankOptions(scores, userWeights);
// 外部决策使用哪个结果
```

## 🛠️ 实际应用示例

### 重新设计的工具对比

#### 旧设计：summon_by_intent
```typescript
// 问题：内置决策逻辑
summon_by_intent(intent: string) → {
  persona: Persona; // MCP 决定了使用哪个人格
  confidence: number;
}
```

#### 新设计：灵活的资源发现
```typescript
// 解决方案：提供数据，外部决策
get_resource_catalog({
  resourceTypes: ['personas'],
  filters: { domain: 'technical', complexity: 'high' },
  sorting: { field: 'relevance', order: 'desc' },
  includeMetrics: true
}) → {
  resources: Persona[]; // 所有符合条件的人格
  metadata: { total: number; filters: any; };
}

calculate_compatibility_scores({
  requirements: { domain: 'technical', style: 'analytical' },
  resources: ['persona1', 'persona2', 'persona3'],
  scoringWeights: { domainMatch: 0.4, styleMatch: 0.6 }
}) → {
  scores: Array<{ resourceId: string; score: number; explanation: string }>;
}

// 外部基于数据做决策
const catalog = await get_resource_catalog(filters);
const scores = await calculate_compatibility_scores(requirements);
const selectedPersona = externalDecisionLogic(catalog, scores);
```

### 参数化配置示例

```typescript
// 高度可配置的分析工具
analyze_user_input({
  input: "我希望优化项目架构",
  analysisOptions: {
    includeKeywords: true,
    includeEmotion: true,
    includeComplexity: true,
    includeDomain: true,
    customAnalysis: ['technical_depth', 'urgency_level']
  },
  outputFormat: 'detailed'
}) → {
  keywords: ['优化', '项目', '架构'],
  emotion: { tone: 'constructive', confidence: 0.8 },
  complexity: { level: 'high', factors: ['technical_terms'] },
  domain: { primary: 'technical', confidence: 0.9 },
  customAnalysis: {
    technical_depth: { score: 0.8, indicators: ['架构'] },
    urgency_level: { score: 0.6, indicators: ['希望'] }
  }
}
```

## 📊 灵活性评估标准

### 工具灵活性检查清单

- [ ] **参数完整性**：所有行为都可以通过参数控制
- [ ] **输出可配置**：输出格式和内容可以定制
- [ ] **无内置决策**：工具不做任何"最佳"选择
- [ ] **组合友好**：可以与其他工具组合使用
- [ ] **扩展性**：支持自定义参数和分析维度

### 接口设计评分

| 标准 | 权重 | 评分方式 |
|------|------|----------|
| 参数化程度 | 30% | 可配置选项数量 / 总功能数量 |
| 输出灵活性 | 25% | 支持的输出格式数量 |
| 决策中立性 | 25% | 是否包含内置决策逻辑 |
| 组合能力 | 20% | 与其他工具的集成难度 |

## 🚀 实施策略

### 阶段 1：识别决策点
1. 审查现有工具
2. 标识内置决策逻辑
3. 分离数据提供和决策制定

### 阶段 2：参数化重构
1. 将固定逻辑转换为可配置参数
2. 增加输出格式选项
3. 移除"智能"默认值

### 阶段 3：接口标准化
1. 建立统一的参数模式
2. 标准化错误处理
3. 文档化所有配置选项

### 阶段 4：验证和优化
1. 测试极端配置场景
2. 收集外部使用反馈
3. 持续优化接口设计

## 💡 最佳实践

### 1. 默认值策略
```typescript
// 提供合理默认值，但允许完全覆盖
function analyzeInput(params: {
  input: string;
  options?: {
    includeKeywords?: boolean; // 默认 true
    maxKeywords?: number;      // 默认 10
    minKeywordLength?: number; // 默认 3
  };
}) {
  const opts = {
    includeKeywords: true,
    maxKeywords: 10,
    minKeywordLength: 3,
    ...params.options // 用户可以覆盖任何默认值
  };
  // ...
}
```

### 2. 渐进式配置
```typescript
// 支持简单和复杂两种使用方式
function getResources(
  simpleFilter?: string,  // 简单使用：getResources('technical')
  advancedConfig?: {      // 高级使用：完全控制
    filters: FilterConfig;
    sorting: SortConfig;
    pagination: PaginationConfig;
  }
) {
  // 内部转换简单参数为高级配置
}
```

### 3. 类型安全
```typescript
// 使用 TypeScript 确保参数类型安全
interface AnalysisOptions {
  includeKeywords?: boolean;
  includeEmotion?: boolean;
  customDimensions?: Array<'urgency' | 'complexity' | 'sentiment'>;
}

// 编译时检查参数有效性
function analyze(input: string, options: AnalysisOptions): AnalysisResult {
  // 类型安全的实现
}
```

## 🎯 成功指标

### 量化指标
- **配置覆盖率**: 可配置功能 / 总功能 > 90%
- **决策中立性**: 内置决策数量 = 0
- **接口一致性**: 统一参数模式使用率 > 95%
- **组合使用率**: 多工具组合场景 / 总使用场景 > 60%

### 质性指标
- **外部满意度**: 调用方对灵活性的满意度
- **集成难度**: 新系统集成的复杂度
- **维护成本**: 接口变更的影响范围
- **扩展能力**: 新需求的适应速度

---

**核心原则**：MCP 工具应该像瑞士军刀一样灵活多用，而不是像自动售货机一样固定选择。