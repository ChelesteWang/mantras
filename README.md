# Mantras-Next

一个模块化、可扩展的AI智能体框架，特别适用于IDE集成场景。

## 简介

Mantras-Next是[Mantras](https://github.com/ChelesteWang/mantras)项目的增强版，旨在提供一个更加模块化、可扩展且功能丰富的AI智能体框架。它保留了原项目的IDE上下文感知特性，同时借鉴了LangChain等成熟框架的优秀实践，提供了更强大的功能和更好的开发体验。

### 核心特性

- **模块化架构**：采用高度模块化的设计，将不同功能组件分离为独立的包
- **声明式组合**：支持声明式的组件组合方式，类似LangChain的LCEL
- **扩展性优先**：提供丰富的扩展点和插件系统，便于第三方开发者扩展功能
- **IDE上下文感知**：深度集成IDE环境，提供上下文感知的智能辅助
- **记忆系统**：支持短期和长期记忆，提高智能体的连续交互能力
- **健壮的错误处理**：提供完善的错误处理和恢复机制，增强系统稳定性

## 安装

### 使用pnpm（推荐）

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build
```

### 使用npm

```bash
# 安装所有依赖
npm install

# 构建所有包
npm run build
```

## 包结构

Mantras-Next采用monorepo结构，包含以下主要包：

- **@mantras-next/core**：核心包，提供基础抽象和接口
- **@mantras-next/agents**：智能体包，提供智能体系统的核心组件
- **@mantras-next/tools**：工具包，提供各种工具实现
- **@mantras-next/memory**（计划中）：记忆包，提供记忆系统的实现
- **@mantras-next/llms**（计划中）：LLM集成包，提供与各种LLM的集成
- **@mantras-next/vectorstores**（计划中）：向量存储包，提供向量数据库的集成

## 快速开始

### 创建一个简单的智能体

```typescript
import { logger } from '@mantras-next/core';
import { CodeFormatterTool, FileReaderTool } from '@mantras-next/tools';
import { SimpleAgent, SimpleMemory } from '@mantras-next/agents';

// 创建工具
const codeFormatter = new CodeFormatterTool();
const fileReader = new FileReaderTool();

// 创建记忆系统
const memory = new SimpleMemory({
  id: 'memory-001',
  name: '简单记忆',
  maxSize: 100
});

// 创建智能体
const agent = new SimpleAgent({
  id: 'agent-001',
  name: '代码助手',
  description: '帮助格式化和阅读代码的智能体',
  tools: [codeFormatter, fileReader],
  memory
});

// 执行智能体
async function run() {
  const result = await agent.call({
    task: '格式化当前文件中的代码',
    ideContext: {
      currentFile: {
        path: '/path/to/file.ts',
        language: 'typescript',
        content: 'console.log("Hello");'
      }
    }
  });
  
  logger.info('执行结果:', result);
}

run().catch(console.error);
```

### 使用声明式组合

```typescript
import { Compose } from '@mantras-next/core';
import { CodeFormatterTool, FileReaderTool } from '@mantras-next/tools';

// 创建工具
const codeFormatter = new CodeFormatterTool();
const fileReader = new FileReaderTool();

// 创建组合链
const chain = Compose.sequence(
  fileReader,
  Compose.condition(
    (result) => result.info.fileType === 'ts' || result.info.fileType === 'js',
    codeFormatter,
    // 如果不是TS/JS文件，则直接返回原内容
    {
      id: 'passthrough',
      name: 'Passthrough',
      description: 'Pass through the input',
      async call(input) {
        return input;
      }
    }
  )
);

// 执行链
async function run() {
  const result = await chain.call({
    filePath: '/path/to/file.ts'
  });
  
  console.log('处理结果:', result);
}

run().catch(console.error);
```

### 从配置文件加载智能体

```typescript
import { AgentManager } from '@mantras-next/agents';

// 创建智能体管理器
const agentManager = new AgentManager('./configs');

// 获取智能体
const agent = agentManager.getAgent('sample-agent-001');

if (agent) {
  // 执行智能体
  const result = await agent.call({
    task: '分析当前项目结构'
  });
  
  console.log('执行结果:', result);
}
```

## 示例

查看[examples](./examples)目录获取更多示例：

- [simple-app.ts](./examples/simple-app.ts)：一个简单的示例应用，展示如何使用框架的核心功能

## 文档

详细文档请参考[docs](./docs)目录：

- [架构设计](./architecture-design.md)：框架的架构设计文档

## 贡献

欢迎贡献代码、报告问题或提出建议！请参考[贡献指南](./CONTRIBUTING.md)。

## 许可证

MIT