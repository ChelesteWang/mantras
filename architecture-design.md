# Mantras-Next 架构设计文档

## 1. 设计理念与目标

Mantras-Next 是对原 Mantras 项目的重构和增强版本，旨在提供一个更加模块化、可扩展且功能丰富的 AI 智能体框架，特别适用于 IDE 集成场景。

### 核心设计理念

- **模块化设计**：采用高度模块化的架构，将不同功能组件分离为独立的包
- **声明式组合**：支持声明式的组件组合方式，类似 LangChain 的 LCEL
- **扩展性优先**：提供丰富的扩展点和插件系统，便于第三方开发者扩展功能
- **IDE 上下文感知**：保留并增强原项目的 IDE 上下文感知特性
- **开发者友好**：提供简洁、一致且文档完善的 API，降低使用门槛

### 目标功能

1. 支持基于 LLM 的任务分解和规划
2. 提供长短期记忆系统
3. 集成向量数据库支持
4. 丰富的工具生态，特别是 IDE 操作工具
5. 完善的错误处理和恢复机制
6. 调试和监控工具支持

## 2. 包结构设计

参考 LangChain 的模块化设计，Mantras-Next 将采用以下包结构：

```
mantras-next/
├── packages/
│   ├── core/               # 核心包，提供基础抽象和接口
│   ├── agents/             # 智能体相关功能
│   ├── memory/             # 记忆系统实现
│   ├── tools/              # 工具集合
│   │   ├── base/           # 基础工具接口和抽象类
│   │   ├── code/           # 代码相关工具
│   │   ├── file/           # 文件操作工具
│   │   ├── ide/            # IDE 特定功能工具
│   ├── chains/             # 链式处理组件
│   ├── llms/               # LLM 集成
│   ├── vectorstores/       # 向量数据库集成
│   ├── retrievers/         # 检索增强组件
│   ├── orchestration/      # 编排和调度系统
│   ├── callbacks/          # 回调和事件系统
│   └── utils/              # 通用工具函数
├── examples/               # 示例项目
├── docs/                   # 文档
└── scripts/                # 构建和开发脚本
```

## 3. 核心组件设计

### 3.1 基础抽象与接口 (core)

```typescript
// 基础组件接口
export interface Component {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

// 可调用组件接口
export interface Callable<Input = any, Output = any> extends Component {
  call(input: Input, options?: CallOptions): Promise<Output>;
}

// 可组合组件接口
export interface Composable<Input = any, Output = any> extends Callable<Input, Output> {
  pipe<NewOutput>(next: Callable<Output, NewOutput>): Composable<Input, NewOutput>;
}

// 调用选项
export interface CallOptions {
  callbacks?: Callbacks;
  runId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

// 回调接口
export interface Callbacks {
  onStart?: (runId: string, input: any) => void | Promise<void>;
  onEnd?: (runId: string, output: any) => void | Promise<void>;
  onError?: (runId: string, error: Error) => void | Promise<void>;
}

// IDE 上下文接口 (增强版)
export interface IDEContext {
  // 基本信息
  workspaceRoot?: string;
  currentFile?: {
    path: string;
    language: string;
    content?: string;
  };
  selection?: {
    text: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  
  // 项目信息
  project?: {
    rootPath: string;
    name: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    language?: string;
    framework?: string;
  };
  
  // 用户信息
  user?: {
    id: string;
    name: string;
    preferences?: Record<string, any>;
  };
  
  // 扩展点: 允许IDE插件提供额外上下文
  [key: string]: any;
}
```

### 3.2 智能体系统 (agents)

```typescript
// 智能体接口
export interface Agent extends Callable<AgentInput, AgentOutput> {
  // 基本属性
  tools: Tool[];
  memory?: Memory;
  
  // 智能体方法
  addTool(tool: Tool): void;
  removeTool(toolId: string): boolean;
  setMemory(memory: Memory): void;
}

// 智能体输入
export interface AgentInput {
  task: string;
  ideContext?: IDEContext;
  rules?: Rule[];
  maxIterations?: number;
  stopCriteria?: StopCriteria;
}

// 智能体输出
export interface AgentOutput {
  result: any;
  steps: AgentStep[];
  metrics: {
    totalTokens?: number;
    duration: number;
    iterations: number;
  };
}

// 智能体步骤
export interface AgentStep {
  thought?: string;
  action: {
    tool: string;
    input: any;
  };
  observation: any;
  timestamp: number;
}

// 规则接口
export interface Rule {
  id: string;
  name: string;
  description: string;
  definition: any;
  severity?: 'error' | 'warning' | 'info';
  scope?: string | string[];
}
```

### 3.3 记忆系统 (memory)

```typescript
// 记忆接口
export interface Memory extends Component {
  // 存储和检索方法
  save(key: string, value: any): Promise<void>;
  load(key: string): Promise<any>;
  
  // 上下文管理
  addContext(context: any): Promise<void>;
  getRelevantContext(query: string, k?: number): Promise<any[]>;
  
  // 记忆清理
  clear(): Promise<void>;
}

// 短期记忆 (会话内)
export interface ShortTermMemory extends Memory {
  // 会话管理
  startSession(): Promise<string>;
  endSession(sessionId: string): Promise<void>;
}

// 长期记忆 (持久化)
export interface LongTermMemory extends Memory {
  // 向量存储支持
  vectorStore?: VectorStore;
  
  // 记忆检索
  search(query: string, k?: number): Promise<any[]>;
  
  // 记忆整合
  consolidate(): Promise<void>;
}
```

### 3.4 工具系统 (tools)

```typescript
// 工具接口
export interface Tool<Input = any, Output = any> extends Callable<Input, Output> {
  // 工具属性
  category: string;
  requiredPermissions?: string[];
  
  // 工具元数据
  schema: {
    input: JSONSchema;
    output: JSONSchema;
  };
}

// IDE工具接口
export interface IDETool<Input = any, Output = any> extends Tool<Input, Output> {
  // IDE特定功能
  supportedLanguages?: string[];
  supportedIDEs?: string[];
  
  // IDE上下文感知
  useIDEContext(context: IDEContext): void;
}

// 代码工具
export interface CodeTool extends IDETool {
  // 代码特定功能
  language: string;
  supportedFrameworks?: string[];
}

// 文件工具
export interface FileTool extends IDETool {
  // 文件操作特定功能
  supportedFileTypes?: string[];
}
```

### 3.5 链式处理 (chains)

```typescript
// 链接口
export interface Chain<Input = any, Output = any> extends Composable<Input, Output> {
  // 链组件
  steps: Callable[];
  
  // 链执行方法
  execute(input: Input, options?: CallOptions): Promise<Output>;
  
  // 链组合方法
  append<NewOutput>(next: Callable<Output, NewOutput>): Chain<Input, NewOutput>;
  branch(condition: (input: Output) => boolean, trueChain: Chain, falseChain: Chain): Chain;
}
```

### 3.6 声明式组合系统

```typescript
// 组合操作符
export const compose = {
  // 顺序执行
  sequence: <Input, Intermediate, Output>(
    first: Callable<Input, Intermediate>,
    second: Callable<Intermediate, Output>
  ): Composable<Input, Output> => {
    // 实现顺序组合
    return new SequenceComposable(first, second);
  },
  
  // 并行执行
  parallel: <Input, Output1, Output2>(
    first: Callable<Input, Output1>,
    second: Callable<Input, Output2>
  ): Composable<Input, [Output1, Output2]> => {
    // 实现并行组合
    return new ParallelComposable(first, second);
  },
  
  // 条件执行
  condition: <Input, Output>(
    condition: (input: Input) => boolean,
    trueCallable: Callable<Input, Output>,
    falseCallable: Callable<Input, Output>
  ): Composable<Input, Output> => {
    // 实现条件组合
    return new ConditionalComposable(condition, trueCallable, falseCallable);
  },
  
  // 重试逻辑
  retry: <Input, Output>(
    callable: Callable<Input, Output>,
    options: { maxAttempts: number, delay?: number }
  ): Composable<Input, Output> => {
    // 实现重试逻辑
    return new RetryComposable(callable, options);
  }
};
```

### 3.7 LLM 集成 (llms)

```typescript
// LLM接口
export interface LLM extends Callable<LLMInput, LLMOutput> {
  // LLM属性
  provider: string;
  modelName: string;
  
  // LLM方法
  generate(prompts: string[]): Promise<LLMOutput>;
  tokenCount(text: string): number;
}

// LLM输入
export interface LLMInput {
  prompt?: string;
  messages?: Message[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

// LLM输出
export interface LLMOutput {
  text: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason: string;
}

// 消息接口
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}
```

### 3.8 向量数据库集成 (vectorstores)

```typescript
// 向量存储接口
export interface VectorStore extends Component {
  // 基本操作
  addDocuments(documents: Document[]): Promise<void>;
  search(query: string, k?: number): Promise<Document[]>;
  delete(ids: string[]): Promise<void>;
  
  // 批量操作
  addTexts(texts: string[], metadatas?: Record<string, any>[]): Promise<string[]>;
  
  // 高级查询
  similaritySearch(query: string, k?: number): Promise<Document[]>;
  maxMarginalRelevanceSearch(query: string, k?: number): Promise<Document[]>;
}

// 文档接口
export interface Document {
  id?: string;
  pageContent: string;
  metadata: Record<string, any>;
}

// 嵌入模型接口
export interface Embeddings extends Component {
  embed(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}
```

### 3.9 回调和事件系统 (callbacks)

```typescript
// 事件类型
export enum EventType {
  START = 'start',
  END = 'end',
  ERROR = 'error',
  TOOL_START = 'tool_start',
  TOOL_END = 'tool_end',
  AGENT_ACTION = 'agent_action',
  AGENT_OBSERVATION = 'agent_observation',
  LLM_NEW_TOKEN = 'llm_new_token',
  MEMORY_UPDATE = 'memory_update',
}

// 事件接口
export interface Event {
  type: EventType;
  timestamp: number;
  runId: string;
  data: any;
}

// 处理器接口
export interface Handler {
  handleEvent(event: Event): void | Promise<void>;
}

// 可观察接口
export interface Observable {
  addHandler(handler: Handler): void;
  removeHandler(handler: Handler): void;
  notify(event: Event): void | Promise<void>;
}
```

### 3.10 注册表与服务定位 (core)

```typescript
// 注册表接口
export interface Registry<T extends Component> {
  register(component: T): void;
  unregister(id: string): boolean;
  get(id: string): T | undefined;
  list(): T[];
  filter(predicate: (component: T) => boolean): T[];
}

// 服务定位器
export class ServiceLocator {
  private static services: Map<string, any> = new Map();
  
  static register<T>(id: string, service: T): void {
    ServiceLocator.services.set(id, service);
  }
  
  static get<T>(id: string): T | undefined {
    return ServiceLocator.services.get(id) as T | undefined;
  }
  
  static has(id: string): boolean {
    return ServiceLocator.services.has(id);
  }
}
```

## 4. 扩展点系统

Mantras-Next 提供了一个完善的扩展点系统，允许开发者在不同层面扩展框架功能：

### 4.1 扩展点类型

1. **组件扩展点**：允许注册新的组件实现
   - 工具扩展点：注册新的工具
   - 智能体扩展点：注册新的智能体实现
   - 记忆扩展点：注册新的记忆系统实现
   - LLM扩展点：注册新的语言模型集成

2. **钩子扩展点**：允许在特定流程中插入自定义逻辑
   - 前置钩子：在操作执行前调用
   - 后置钩子：在操作执行后调用
   - 错误钩子：在发生错误时调用

3. **中间件扩展点**：允许在组件调用链中插入处理逻辑
   - 智能体中间件：修改智能体的输入/输出
   - 工具中间件：修改工具的输入/输出
   - LLM中间件：修改LLM的输入/输出

4. **上下文增强扩展点**：允许增强IDE上下文信息
   - 项目分析器：提供项目结构分析
   - 代码理解器：提供代码语义理解
   - 用户偏好分析器：提供用户行为分析

### 4.2 扩展点实现

```typescript
// 扩展点接口
export interface ExtensionPoint<T> {
  register(extension: T): void;
  unregister(id: string): boolean;
  getExtensions(): T[];
}

// 钩子扩展点
export interface HookExtensionPoint<T> extends ExtensionPoint<HookFunction<T>> {
  execute(context: T): Promise<T>;
}

// 钩子函数类型
export type HookFunction<T> = (context: T) => Promise<T>;

// 中间件扩展点
export interface MiddlewareExtensionPoint<Input, Output> extends ExtensionPoint<Middleware<Input, Output>> {
  execute(input: Input, next: (input: Input) => Promise<Output>): Promise<Output>;
}

// 中间件类型
export type Middleware<Input, Output> = (
  input: Input,
  next: (input: Input) => Promise<Output>
) => Promise<Output>;
```

## 5. 配置系统

Mantras-Next 提供了一个灵活的配置系统，支持多种配置方式：

### 5.1 配置层次

1. **默认配置**：框架内置的默认配置
2. **项目配置**：项目级别的配置文件
3. **环境配置**：基于环境变量的配置
4. **运行时配置**：通过API在运行时设置的配置

### 5.2 配置格式

支持多种配置格式：
- YAML 文件
- JSON 文件
- TypeScript/JavaScript 配置文件
- 环境变量

### 5.3 配置接口

```typescript
// 配置管理器
export interface ConfigManager {
  // 获取配置
  get<T>(key: string, defaultValue?: T): T;
  
  // 设置配置
  set<T>(key: string, value: T): void;
  
  // 加载配置
  loadFromFile(path: string): Promise<void>;
  loadFromEnv(prefix?: string): void;
  
  // 导出配置
  export(): Record<string, any>;
}
```

## 6. 错误处理与恢复机制

Mantras-Next 实现了一个健壮的错误处理和恢复机制：

### 6.1 错误类型

```typescript
// 基础错误
export class MantrasError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }
}

// 具体错误类型
export class ToolExecutionError extends MantrasError {}
export class AgentExecutionError extends MantrasError {}
export class LLMError extends MantrasError {}
export class ValidationError extends MantrasError {}
export class ConfigurationError extends MantrasError {}
```

### 6.2 重试机制

```typescript
// 重试选项
export interface RetryOptions {
  maxAttempts: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

// 重试装饰器
export function withRetry<Input, Output>(
  callable: Callable<Input, Output>,
  options: RetryOptions
): Callable<Input, Output> {
  // 实现重试逻辑
  return new RetryDecorator(callable, options);
}
```

### 6.3 故障恢复

```typescript
// 故障恢复选项
export interface RecoveryOptions {
  fallbackValue?: any;
  fallbackCallable?: Callable;
  onError?: (error: Error) => void | Promise<void>;
}

// 故障恢复装饰器
export function withRecovery<Input, Output>(
  callable: Callable<Input, Output>,
  options: RecoveryOptions
): Callable<Input, Output> {
  // 实现故障恢复逻辑
  return new RecoveryDecorator(callable, options);
}
```

## 7. 调试和监控工具

Mantras-Next 提供了一套完整的调试和监控工具：

### 7.1 日志系统

```typescript
// 日志级别
export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

// 日志接口
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
}
```

### 7.2 追踪系统

```typescript
// 追踪接口
export interface Tracer {
  startSpan(name: string, options?: SpanOptions): Span;
  getCurrentSpan(): Span | undefined;
}

// 跨度接口
export interface Span {
  name: string;
  context(): SpanContext;
  setAttribute(key: string, value: any): this;
  setStatus(status: SpanStatus): this;
  end(endTime?: number): void;
}
```

### 7.3 性能监控

```typescript
// 性能指标
export interface Metrics {
  // 计数器
  counter(name: string, value?: number): Counter;
  
  // 计量器
  gauge(name: string, value?: number): Gauge;
  
  // 直方图
  histogram(name: string, value?: number): Histogram;
}

// 计数器
export interface Counter {
  inc(value?: number): void;
  value(): number;
}
```

## 8. 实现路线图

Mantras-Next 的实现将分为以下几个阶段：

### 阶段 1：核心架构与基础组件

- 实现核心包和基础抽象
- 重构智能体系统
- 实现基本工具集
- 建立扩展点系统框架

### 阶段 2：增强功能与集成

- 实现记忆系统
- 集成LLM支持
- 添加向量数据库支持
- 开发声明式组合系统

### 阶段 3：开发者体验与工具

- 实现调试和监控工具
- 完善配置系统
- 开发IDE插件和集成
- 编写详细文档和示例

### 阶段 4：稳定性与性能优化

- 实现错误处理与恢复机制
- 性能优化
- 安全性增强
- 兼容性测试

## 9. 总结

Mantras-Next 架构设计旨在提供一个模块化、可扩展且功能丰富的 AI 智能体框架，特别适用于 IDE 集成场景。通过借鉴 LangChain 等成熟框架的优秀实践，同时保留原 Mantras 项目的 IDE 上下文感知特性，Mantras-Next 将为开发者提供一个强大而灵活的工具，用于构建 AI 辅助的开发体验。

该架构设计注重：
1. 模块化和可组合性
2. 扩展性和插件生态
3. 开发者友好的API
4. 健壮的错误处理
5. 全面的调试和监控支持

通过这些设计，Mantras-Next 将成为一个功能完备、易于使用且高度可定制的 AI 智能体框架。