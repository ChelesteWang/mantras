# Mantras-Next API参考文档

## 核心包 (@mantras-next/core)

### 基础接口

#### Component

所有Mantras-Next组件的基础接口，提供基本的标识和元数据属性。

```typescript
interface Component {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}
```

#### Callable

定义可被调用执行的组件，是框架中所有可执行组件的基础。

```typescript
interface Callable<Input = any, Output = any> extends Component {
  call(input: Input, options?: CallOptions): Promise<Output>;
}
```

#### Composable

定义可与其他组件组合的组件，支持链式调用。

```typescript
interface Composable<Input = any, Output = any> extends Callable<Input, Output> {
  pipe<NewOutput>(next: Callable<Output, NewOutput>): Composable<Input, NewOutput>;
}
```

### IDE上下文

#### IDEContext

定义IDE环境提供的上下文信息，包括项目、文件、用户等信息。

```typescript
interface IDEContext {
  workspace?: {
    rootPath: string;
    name?: string;
    files?: string[];
  };
  
  currentFile?: {
    path: string;
    language: string;
    content?: string;
    size?: number;
    modifiedTime?: Date;
  };
  
  selection?: {
    text: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  
  project?: {
    rootPath: string;
    name: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    language?: string;
    framework?: string;
  };
  
  user?: {
    id: string;
    name: string;
    preferences?: Record<string, any>;
  };
  
  [key: string]: any;
}
```

### 规则系统

#### Rule

定义智能体和工具需要遵循的规则或指导方针。

```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  definition: any;
  severity?: 'error' | 'warning' | 'info';
  scope?: string | string[];
}
```

### 组合操作符

#### Compose

提供各种组合组件的操作符函数。

```typescript
namespace Compose {
  function sequence<Input, Intermediate, Output>(
    first: Callable<Input, Intermediate>,
    second: Callable<Intermediate, Output>
  ): Composable<Input, Output>;
  
  function parallel<Input, Output1, Output2>(
    first: Callable<Input, Output1>,
    second: Callable<Input, Output2>
  ): Composable<Input, [Output1, Output2]>;
  
  function condition<Input, Output>(
    condition: (input: Input) => boolean,
    trueCallable: Callable<Input, Output>,
    falseCallable: Callable<Input, Output>
  ): Composable<Input, Output>;
  
  function retry<Input, Output>(
    callable: Callable<Input, Output>,
    options: { maxAttempts: number, delay?: number }
  ): Composable<Input, Output>;
}
```

### 错误处理

#### MantrasError

所有框架特定错误的基类。

```typescript
class MantrasError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any);
}
```

### 注册表与服务定位

#### Registry

定义组件注册和查找的通用接口。

```typescript
interface Registry<T extends Component> {
  register(component: T): void;
  unregister(id: string): boolean;
  get(id: string): T | undefined;
  list(): T[];
  filter(predicate: (component: T) => boolean): T[];
}
```

#### ServiceLocator

提供全局服务注册和查找功能。

```typescript
class ServiceLocator {
  static register<T>(id: string, service: T): void;
  static get<T>(id: string): T | undefined;
  static getOrThrow<T>(id: string): T;
  static has(id: string): boolean;
  static unregister(id: string): boolean;
  static clear(): void;
}
```

## 工具包 (@mantras-next/tools)

### 工具接口

#### Tool

定义工具的基本结构和行为。

```typescript
interface Tool<Input = any, Output = any> extends Callable<Input, Output> {
  category: string;
  requiredPermissions?: string[];
  schema: {
    input: z.ZodType<Input>;
    output: z.ZodType<Output>;
  };
}
```

#### IDETool

定义IDE特定工具的结构和行为。

```typescript
interface IDETool<Input = any, Output = any> extends Tool<Input, Output> {
  supportedLanguages?: string[];
  supportedIDEs?: string[];
  useIDEContext(context: IDEContext): void;
}
```

### 基础工具类

#### BaseTool

提供工具的基本实现。

```typescript
abstract class BaseTool<Input = any, Output = any> implements Tool<Input, Output> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly requiredPermissions: string[];
  readonly metadata: Record<string, any>;
  abstract readonly schema: {
    input: z.ZodType<Input>;
    output: z.ZodType<Output>;
  };
  
  constructor(config: ToolConfig);
  
  async call(input: Input, options?: CallOptions): Promise<Output>;
  
  protected abstract execute(input: Input, context: ToolContext): Promise<Output>;
}
```

### 具体工具实现

#### CodeFormatterTool

格式化代码的工具实现。

```typescript
class CodeFormatterTool extends BaseCodeTool<CodeFormatterInput, CodeFormatterOutput> {
  // 实现见源码
}
```

#### FileReaderTool

读取文件内容的工具实现。

```typescript
class FileReaderTool extends BaseFileTool<FileReaderInput, FileReaderOutput> {
  // 实现见源码
}
```

## 智能体包 (@mantras-next/agents)

### 智能体接口

#### Agent

定义智能体的基本结构和行为。

```typescript
interface Agent extends Callable<AgentInput, AgentOutput> {
  tools: Tool[];
  memory?: Memory;
  
  addTool(tool: Tool): void;
  removeTool(toolId: string): boolean;
  setMemory(memory: Memory): void;
}
```

#### AgentInput

定义智能体执行的输入数据。

```typescript
interface AgentInput {
  task: string;
  ideContext?: IDEContext;
  rules?: Rule[];
  maxIterations?: number;
  stopCriteria?: StopCriteria;
  [key: string]: any;
}
```

#### AgentOutput

定义智能体执行的输出数据。

```typescript
interface AgentOutput {
  result: any;
  steps: AgentStep[];
  metrics: {
    totalTokens?: number;
    duration: number;
    iterations: number;
  };
}
```

### 记忆接口

#### Memory

定义记忆系统的基本结构和行为。

```typescript
interface Memory extends Component {
  save(key: string, value: any): Promise<void>;
  load(key: string): Promise<any>;
  addContext(context: any): Promise<void>;
  getRelevantContext(query: string, k?: number): Promise<any[]>;
  clear(): Promise<void>;
}
```

### 基础智能体类

#### BaseAgent

提供智能体的基本实现。

```typescript
abstract class BaseAgent implements Agent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly metadata: Record<string, any>;
  tools: Tool[];
  memory?: Memory;
  
  constructor(config: AgentConfig);
  
  addTool(tool: Tool): void;
  removeTool(toolId: string): boolean;
  setMemory(memory: Memory): void;
  
  async call(input: AgentInput, options?: CallOptions): Promise<AgentOutput>;
  
  protected abstract execute(
    input: AgentInput,
    runId: string,
    maxIterations: number,
    stopCriteria?: StopCriteria
  ): Promise<{
    result: any;
    steps: AgentStep[];
    totalTokens?: number;
  }>;
}
```

### 智能体管理器

#### AgentManager

负责管理和协调多个智能体。

```typescript
class AgentManager {
  constructor(configDirectoryPath?: string);
  
  loadAgentsFromDirectory(directoryPath: string): void;
  loadAgentConfigFromYaml(filePath: string): AgentConfig;
  createAgentFromConfig(config: AgentConfig): Agent;
  registerAgent(agent: Agent, config: AgentConfig): void;
  unregisterAgent(agentId: string): boolean;
  getAgent(agentId: string): Agent | undefined;
  getAgentOrThrow(agentId: string): Agent;
  getAllAgents(): Agent[];
  getAgentConfig(agentId: string): AgentConfig | undefined;
  getAllAgentConfigs(): AgentConfig[];
  generateAgentMarkdown(agentId: string): string;
  generateAllAgentsMarkdown(outputDirectoryPath: string): void;
}
```

## 更多包（计划中）

### 记忆包 (@mantras-next/memory)

提供记忆系统的实现，包括短期记忆和长期记忆。

### LLM集成包 (@mantras-next/llms)

提供与各种LLM的集成，支持OpenAI、Anthropic、本地模型等。

### 向量存储包 (@mantras-next/vectorstores)

提供向量数据库的集成，支持Chroma、Pinecone、Milvus等。