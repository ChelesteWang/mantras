# Mantras 架构演进计划

**版本**: 1.0
**作者**: Technical Expert (AI Assistant)

## 1. 概述

本文档旨在为 `mantras` 项目规划一条清晰、务实的技术演进路线。当前，`mantras` 是一个功能专注的、用于管理和召唤人格（Persona）的MCP服务器。为了释放其更大潜力，我们将借鉴历史文档 `Mantras-Next` 的核心思想，分阶段地将其从一个“人格管理工具”演进为一个更通用的、具备“思考-行动”能力的轻量级AI智能体（Agent）框架。

我们的核心原则是**增量演进，而非推倒重来**。每一步改造都应是独立的、可验证的，并能立即为项目带来价值。

## 2. 演进蓝图：三阶段计划

我们将分三个主要阶段来完成此次架构升级。

### **第一阶段：增强人格的会话能力 (已完成)**

- **目标**: 让人格具备上下文记忆，使会话变得连贯。
- **已完成工作**:
  1.  **引入 `SessionMemory`**: 创建了独立的 `src/memory.ts` 模块，提供了一个基于Map的短期记忆系统。
  2.  **关联会话**: 在 `src/types.ts` 的 `SummonedPersona` 接口中加入了 `memory` 属性，并在 `PersonaSummoner` 中确保每次召唤人格时，都为其分配一个全新的 `SessionMemory` 实例。

此阶段为后续的功能扩展奠定了数据基础。

### **第二阶段：扩展工具（Tool）的执行能力 (当前阶段)**

- **目标**: 赋予人格执行具体“动作”的能力，使其能与外部环境（如文件系统）交互。
- **新架构设计**:
  1.  **定义 `ActionableTool` 接口**: 我们将在 `src/types.ts` 中定义一个新的核心接口 `ActionableTool`。
      ```typescript
      export interface ActionableTool {
        // 工具的唯一名称，用于调用
        name: string;
        // 工具功能的详细描述，供AI理解其用途
        description: string;
        // 定义工具的输入参数，使用JSON Schema格式，便于校验和AI理解
        parameters: object; 
        // 工具的执行入口
        execute(args: any): Promise<any>;
      }
      ```
  2.  **创建工具注册表与执行器**: 
      - 新建 `src/tools/` 目录，用于存放所有可执行工具的实现（如 `file-reader.tool.ts`）。
      - 新建 `src/tool-executor.ts` 模块，它将负责：
        - 维护一个“工具注册表”，在启动时自动加载 `src/tools/` 目录下的所有工具。
        - 提供一个 `executeTool(name: string, args: any)` 方法，根据工具名和参数调用相应的工具。
  3.  **连接人格与工具**: 修改 `PersonaSummoner` 或 `server.ts`，使得处于活动状态的会话（Session）可以访问 `ToolExecutor` 并执行工具。

- **开发步骤**:
  1.  在 `src/types.ts` 中添加 `ActionableTool` 接口定义。
  2.  创建 `src/tools/` 目录。
  3.  实现第一个工具作为概念验证：`FileReaderTool` (`src/tools/file-reader.tool.ts`)。
  4.  创建 `ToolExecutor` (`src/tool-executor.ts`) 并实现工具的注册与执行逻辑。

### **第三阶段：优化架构与开发者体验 (未来规划)**

- **目标**: 提升项目的可配置性、可维护性和可观测性。
- **规划中的改进**:
  1.  **引入专业配置管理**: 使用 `cosmiconfig` 库替换现有的 `minimist`，支持从 `.mantrasrc.json` 或 `package.json` 中读取复杂配置（如服务端口、日志级别、工具开关等）。
  2.  **实现结构化日志**: 升级 `src/log-to-file.ts`，引入 `pino` 或类似的日志库。所有日志都应是结构化的JSON格式，并强制包含 `sessionId` 和 `requestId`，以便于追踪和调试。
  3.  **依赖注入（DI）**: 考虑引入一个轻量级的依赖注入容器（如 `tsyringe`），来解耦 `PersonaSummoner`、`AssetRepository` 和 `ToolExecutor` 之间的强依赖关系，使单元测试更简单。

## 3. 目标架构下的项目结构

完成上述演进后，项目结构将大致如下：

```
. (root)
├── src/
│   ├── asset-repository.ts   # (不变) 资产仓库
│   ├── asset-sources.ts      # (不变) 资产源
│   ├── log-to-file.ts        # (升级) 结构化日志模块
│   ├── memory.ts             # (已新增) 会话记忆
│   ├── persona-summoner.ts   # (修改) 可能需要与ToolExecutor交互
│   ├── server.ts             # (修改) 集成ToolExecutor
│   ├── tool-executor.ts      # (新增) 工具执行器
│   ├── tools/                # (新增) 可执行工具目录
│   │   └── file-reader.tool.ts
│   └── types.ts              # (修改) 新增ActionableTool等类型
├── test/
│   └── tool-executor.test.ts # (新增) 相应的单元测试
├── docs/
│   └── ARCHITECTURE_EVOLUTION.md # (本文档)
└── .mantrasrc.json         # (新增) 配置文件
```

## 4. 总结

此演进计划旨在将 `mantras` 项目提升到一个新的高度，使其不仅是一个强大的MCP服务器，更是一个具备高度扩展性的AI智能体框架的雏形。通过分阶段实施，我们可以在控制风险的同时，稳步地为项目增加核心功能。