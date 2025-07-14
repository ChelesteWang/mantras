# Mantras-Next 入门指南

## 简介

Mantras-Next是一个模块化、可扩展的AI智能体框架，特别适用于IDE集成场景。它提供了丰富的功能和灵活的扩展机制，帮助开发者构建智能的代码辅助工具。

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

## 基本概念

### 智能体（Agent）

智能体是框架的核心概念，它负责协调工具执行和处理任务。智能体可以学习和使用各种工具，根据任务需求选择合适的工具执行。

### 工具（Tool）

工具是智能体可以使用的功能单元，每个工具都有特定的功能和用途。框架提供了丰富的内置工具，如代码格式化工具、文件读取工具等，同时也支持自定义工具。

### 记忆（Memory）

记忆系统用于存储和检索上下文信息，提高智能体的连续交互能力。框架支持短期记忆和长期记忆，可以根据需要选择合适的记忆系统。

### IDE上下文（IDEContext）

IDE上下文是框架的特色功能，它提供了IDE环境的上下文信息，如当前文件、选中的代码、项目结构等，帮助智能体更好地理解和处理任务。

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
      description: '直接传递输入',
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

## 下一步

- 查看[API参考文档](./api-reference.md)了解详细的API说明
- 查看[示例](../examples)获取更多使用示例
- 查看[架构设计](../architecture-design.md)了解框架的设计理念和实现细节