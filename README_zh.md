# Mantras

Mantras 将促进您的智能体学习“魔法”。本项目提供了一个基于 TypeScript 的框架，供 IDE 中的 AI 智能体学习和应用不同的技能（Mantras）。这些 Mantras 可以利用 IDE 上下文并遵循特定规则，从而使智能体能够执行具有上下文感知和规则指导的任务。

## 项目结构

```
/mantras
├── .vscode/
│   └── launch.json         # VSCode 启动配置
├── dist/                   # 编译后的 JavaScript 文件 (tsc 的输出)
├── node_modules/           # 项目依赖
├── src/
│   ├── agents/             # Agent 实现
│   │   ├── core/
│   │   │   └── base.agent.ts   # Agent 基类
│   │   ├── advisors/         # 顾问 Agent 目录 (示例)
│   │   ├── refiners/         # 优化 Agent 目录 (示例)
│   │   └── .gitkeep
│   ├── core/               # 核心框架组件
│   │   └── registry.ts     # Item/Tool 的中央注册表
│   ├── interfaces/         # TypeScript 接口
│   │   ├── agent.interface.ts # 定义 IAgent 契约
│   │   ├── ide.interface.ts   # 定义 IDEContext 和 IRule
│   │   ├── index.ts           # 导出所有接口
│   │   └── mantra.interface.ts# 定义基础 IMantra/IItem/ITool 契约
│   ├── tools/              # Tool 实现 (原 Mantras)
│   │   └── code-formatter.tool.ts # 用于代码格式化的示例 Tool
│   └── index.ts            # 主要入口点和演示
├── package.json            # 项目元数据和依赖
├── README.md               # 本文件 (英文版)
├── README_zh.md            # 本文件 (中文版)
└── tsconfig.json           # TypeScript 编译器选项
```

## 核心概念

- **Item/Tool (`IMantra` 作为基础)**: 代表智能体可以学习和使用的特定技能、能力或工具。基础接口 `IMantra` 定义于 `src/interfaces/mantra.interface.ts`，并作为更具体的 Item 或 Tool 的基础。
  - `id`: 唯一标识符。
  - `name`: 人类可读的名称。
  - `description`: Item/Tool 用途的描述。
  - `execute(ideContext?: IDEContext, rules?: IRule[], params?: any)`: 执行 Item/Tool 功能的方法。它可以接收 IDE 上下文、规则列表和自定义参数。
  - `metadata` (可选): 额外信息，如版本、标签 (例如, 'tool', 'formatter')。

- **Agent (`IAgent`)**: 代表 IDE 中的 AI 实体。定义于 `src/interfaces/agent.interface.ts`。
  - `id`: 唯一标识符。
  - `name`: 人类可读的名称。
  - `learnedItems`: 智能体已学习的 Item/Tool 列表。
  - `learnItem(item: IMantra)`: 智能体学习新 Item/Tool 的方法。
  - `forgetItem(itemId: string)`: 智能体忘记 Item/Tool 的方法。
  - `executeRegisteredItem(itemId: string, ideContext?: IDEContext, rules?: IRule[], params?: any)`: 智能体执行已学习 Item/Tool 的方法，传递 IDE 上下文、规则和参数。如果未直接学习，它也可以执行全局注册表中的 Item。

- **Registry**: 一个单例类，负责注册、检索和管理所有可用的 Item/Tool。定义于 `src/core/registry.ts`。

- **IDEContext (`IDEContext`)**: 表示 IDE 环境提供的上下文信息的接口。这可以包括当前工作区、打开的文件、选定的文本、光标位置等详细信息。定义于 `src/interfaces/ide.interface.ts`。

- **Rule (`IRule`)**: 表示智能体或 Mantra 在执行期间应遵守的特定规则、指南或约束的接口。这允许可配置的行为以及对项目标准或用户偏好的遵守。定义于 `src/interfaces/ide.interface.ts`。

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

- [ ] **更深入地利用 `IDEContext` 和 `IRule`**:
  - 增强 `CodeFormatterMantra`，使其能够根据 `ideContext.currentFileLanguageId` 做出决策，或应用源自 `IRule` 定义的格式化选项。
  - 创建新的、从根本上由 IDE 上下文（例如 `CurrentFileAnalyzerMantra`）或规则（例如 `LinterMantra`）驱动的 Mantra。
- [ ] **开发更多样化的 `Tool` 类型**:
  - `CodeGenerationTool`: 根据描述生成代码片段，利用 `IDEContext` 进行放置，并利用 `IRule` 实现样式。
  - `DocStringWriterTool`: 自动为代码元素生成文档，遵守 `IRule` 中定义的文档标准。
  - `CodeRefactorTool`: 使用 `IDEContext`（例如，选定的代码）执行特定的重构操作。
- [ ] **提升 `Agent` 能力**:
  - 使智能体能够根据任务目标、当前的 `IDEContext` 和适用的 `IRule` 动态选择和组合 Item/Tool。
  - 探索智能体间的通信和协作任务执行。
- [ ] **扩展 `Registry` 功能**:
  - 实现按功能、标签或支持的上下文类型搜索/过滤 Item/Tool。
  - 为 Item/Tool 添加版本控制和依赖管理。
- [ ] **真正的 IDE 集成**: 
  - 将框架与实际的 IDE API（例如 VS Code Extension API）连接起来，用实时数据填充 `IDEContext`，并允许 Item/Tool 执行实际的文件操作、显示 UI 通知等。
- [ ] **规则管理系统**:
  - 设计一个用于定义、存储和检索 `IRule` 配置的系统，可能是在项目或用户级别。
- [ ] **用户界面 (UI)**:
  - 开发一个用户界面，供用户管理智能体、分配任务、配置规则和查看 Item/Tool 执行结果。
- [ ] **持久化**: 
  - 实现保存和加载智能体状态（包括已学习的 Item/Tool 和配置）的机制。
- [ ] **全面的测试**: 
  - 编写彻底的单元测试和集成测试，尤其要关注 Item/Tool 如何与各种 `IDEContext` 场景和 `IRule` 集交互。