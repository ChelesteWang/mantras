# Mantras：一个可扩展的 AI 智能体框架

Mantras 提供了一个基于 TypeScript 的框架，用于构建在集成开发环境（IDE）中运行的 AI 智能体。其核心理念是使智能体能够学习、管理和应用各种技能或工具（称为“Item”或“Tool”，以 `IMantra` 作为基础接口）。该框架强调模块化，允许清晰地分离智能体逻辑及它们所使用的工具。智能体可以动态配置和管理，利用 IDE 特定的上下文并遵守预定义的规则，以执行复杂的、具有上下文感知和规则指导的任务。

`AgentManager` 是一个关键组件，负责加载智能体配置（例如，从 YAML 文件）、实例化智能体，并使其可供交互。这使得系统具有灵活性，可以在不修改核心框架的情况下定义和扩展智能体及其功能。

## 项目结构

```
/mantras
├── .vscode/
│   └── launch.json         # VSCode 启动配置
├── dist/                   # 编译后的 JavaScript 文件 (tsc 的输出)
├── node_modules/           # 项目依赖
├── src/
│   ├── agents/             # Agent 特定的逻辑和实现
│   │   ├── core/           # Agent 管理的核心组件
│   │   │   └── agent-manager.ts # 管理 Agent 的加载和生命周期
│   │   │   └── base.agent.ts    # Agent 基类 (如果适用)
│   │   ├── interfaces/     # Agent 特定的接口
│   │   │   ├── agent.interface.ts    # 定义 IAgent 契约
│   │   │   └── agent-config.interface.ts # 定义 Agent 配置结构
│   │   ├── advisors/         # 示例：顾问 Agent 目录
│   │   ├── refiners/         # 示例：优化 Agent 目录
│   │   └── .gitkeep
│   ├── core/               # 核心框架组件 (共享)
│   │   └── registry.ts     # 可发现 Item/Tool 的中央注册表
│   ├── interfaces/         # 通用 TypeScript 接口
│   │   ├── ide.interface.ts   # 定义 IDEContext 和 IRule
│   │   ├── index.ts           # 导出所有通用接口
│   │   └── registry.interface.ts # 定义注册表相关的接口
│   ├── tools/              # Tool 实现及相关接口
│   │   ├── interfaces/     # Tool/Item 特定的接口
│   │   │   ├── mantra.interface.ts # 定义基础 IMantra/IItem/ITool 契约
│   │   │   └── item-config.interface.ts  # 定义 Item/Tool 配置结构
│   │   └── code-formatter.tool.ts # 用于代码格式化的示例 Tool
│   └── index.ts            # 主要入口点和演示
├── package.json            # 项目元数据和依赖
├── README.md               # 本文件 (英文版)
├── README_zh.md            # 本文件 (中文版)
└── tsconfig.json           # TypeScript 编译器选项
```

## 核心概念

- **Item/Tool (`IMantra`)**: 代表智能体可以学习和执行的特定技能、能力或工具的基础构建块。基础接口 `IMantra` 定义于 `src/tools/interfaces/mantra.interface.ts`。
  - `id`: 唯一标识符。
  - `name`: 人类可读的名称。
  - `description`: Item/Tool 用途的描述。
  - `execute(ideContext?: IDEContext, rules?: IRule[], params?: any)`: 执行 Item/Tool 功能的方法，可能使用 IDE 上下文、规则和自定义参数。
  - `metadata` (可选): 额外信息，如版本、标签 (例如, 'tool', 'formatter')。

- **ItemConfig (`ItemConfig`)**: 定义 Item/Tool 的配置，例如其 ID、名称、描述，以及可能的执行路径或其他元数据。定义于 `src/tools/interfaces/item-config.interface.ts`。

- **Agent (`IAgent`)**: 代表 IDE 中能够学习和执行 Item/Tool 的 AI 实体。定义于 `src/agents/interfaces/agent.interface.ts`。
  - `id`: 唯一标识符。
  - `name`: 人类可读的名称。
  - `status`: 智能体的当前状态 (例如, 'active', 'idle')。
  - `capabilities`: 智能体可以履行的能力或角色列表。
  - `learnedItems`: 智能体已学习的 Item/Tool 列表 (`IMantra` 的实例)。
  - `learnItem(item: IMantra)`: 智能体获取新 Item/Tool 的方法。
  - `forgetItem(itemId: string)`: 智能体丢弃 Item/Tool 的方法。
  - `executeRegisteredItem(itemId: string, ideContext?: IDEContext, rules?: IRule[], params?: any)`: 智能体执行已学习 Item/Tool 的方法。它也可以访问和执行全局 `Registry` 中的 Item。

- **AgentConfig (`AgentConfig`)**: 指定智能体的配置，包括其 ID、名称、状态、能力，以及定义其应配备的工具的 `ItemConfig` 对象列表。定义于 `src/agents/interfaces/agent-config.interface.ts`。

- **AgentManager**: 一个核心服务，负责根据配置（例如，从 YAML 文件）发现、加载和管理智能体。它实例化 `IAgent` 对象并使其可供使用。实现于 `src/agents/core/agent-manager.ts`。

- **Registry**: 所有可用 Item/Tool 的中央存储库。智能体可以查询注册表以发现并可能学习新的 Item/Tool。定义于 `src/core/registry.ts`。

- **IDEContext (`IDEContext`)**: 表示来自 IDE 的上下文信息的接口，例如打开的文件、选定的文本、光标位置、项目详细信息等。定义于 `src/interfaces/ide.interface.ts`。

- **Rule (`IRule`)**: 用于定义智能体或 Item/Tool 在执行期间应遵守的特定规则、指南或约束的接口。定义于 `src/interfaces/ide.interface.ts`。

## 开始使用

1.  **安装依赖**: 
    ```bash
    npm install
    ```

2.  **构建项目**: 
    ```bash
    npm run build
    ```
    这将把 `src` 目录中的 TypeScript 代码编译成 JavaScript 到 `dist` 目录。

3.  **运行演示**: 
    ```bash
    npm start
    ```
    这将执行编译后的 `dist/index.js` 文件，该文件演示了注册 Item/Tool、智能体学习并使用示例 `IDEContext` 和 `IRule` 对象执行它的过程。

    或者，在开发过程中直接使用 `ts-node` 运行：
    ```bash
    npm run dev
    ```

## 后续步骤和未来增强

- [ ] **深化 `IDEContext` 和 `IRule` 集成**:
  - 增强现有工具 (例如 `CodeFormatterTool`)，使其能够基于 `ideContext` (例如 `currentFileLanguageId`、项目设置) 做出更复杂的决策，并应用来自 `IRule` 定义的配置。
  - 开发从根本上由 IDE 上下文 (例如 `CurrentFileAnalyzerTool`, `ProjectRefactorAdvisorTool`) 或规则 (例如 `LinterTool`, `StyleGuideEnforcerTool`) 驱动的新工具。
- [ ] **扩展 `Tool` 的多样性和复杂性**:
  - `CodeGenerationTool`: 根据自然语言描述或规范生成代码片段，利用 `IDEContext` 进行准确定位，并利用 `IRule` 遵守编码风格。
  - `AutomatedDocumentationTool`: 为代码元素生成或更新文档 (例如 JSDoc, TSDoc)，遵循 `IRule` 中定义的标准。
  - `SmartRefactoringTool`: 使用详细的 `IDEContext` 执行具有上下文感知的重构操作 (例如，跨项目重命名符号、提取方法)。
- [ ] **增强 `Agent` 的智能和自主性**:
  - 实现更复杂的机制，使智能体能够根据复杂的任务目标、实时 `IDEContext` 和适用的 `IRule` 动态选择、组合和排序 Item/Tool。
  - 探索用于协作解决问题的智能体间通信协议。
  - 开发学习机制，使智能体能够随着时间的推移改进其工具选择和执行策略。
- [ ] **优化 `AgentManager` 和配置**:
  - 支持更复杂的智能体配置场景，可能包括在运行时动态加载/卸载智能体或工具。
  - 为智能体初始化和执行实现强大的错误处理和恢复机制。
- [ ] **强化 `Registry` 功能**:
  - 实现按功能、支持的上下文类型、版本或依赖关系对 Item/Tool 进行高级搜索、过滤和标记。
  - 为 Item/Tool 引入版本控制和依赖管理，以处理兼容性问题。
- [ ] **全面的 IDE 集成**: 
  - 与 IDE API (例如 VS Code Extension API, Language Server Protocol) 深度集成，以提供丰富的 `IDEContext`，实现对 IDE 的直接操作 (文件操作、UI 通知、代码插入)，并监听 IDE 事件。
- [ ] **高级规则管理系统**:
  - 设计一个灵活的系统，用于在不同范围 (全局、项目、用户、智能体特定) 定义、存储、版本控制和检索 `IRule` 配置。
- [ ] **用于管理和交互的用户界面 (UI)**:
  - 在 IDE 中开发一个用户界面，供用户管理智能体 (配置、激活/停用)、分配任务、定义或覆盖规则，以及监控 Item/Tool 的执行。
- [ ] **持久化和状态管理**:
  - 实现强大的机制来保存和加载智能体状态，包括已学习的 Item/Tool、配置和操作历史。
- [ ] **全面的测试套件**: 
  - 开发彻底的单元测试、集成测试和端到端测试，尤其要关注在各种 `IDEContext` 场景和 `IRule` 约束下智能体与工具的交互。