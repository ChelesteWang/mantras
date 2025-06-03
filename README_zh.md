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
│   │   ├── base.agent.ts   # Agent 基类
│   │   └── .gitkeep
│   ├── core/               # 核心框架组件
│   │   └── mantra-registry.ts # Mantra 的中央注册表
│   ├── interfaces/         # TypeScript 接口
│   │   ├── agent.interface.ts # 定义 IAgent 契约
│   │   ├── ide.interface.ts   # 定义 IDEContext 和 IRule
│   │   └── mantra.interface.ts# 定义 IMantra 契约
│   ├── mantras/            # Mantra 实现
│   │   ├── code-formatter.mantra.ts # 用于代码格式化的示例 Mantra
│   │   └── .gitkeep
│   └── index.ts            # 主要入口点和演示
├── package.json            # 项目元数据和依赖
├── README.md               # 本文件 (英文版)
├── README_zh.md            # 本文件 (中文版)
└── tsconfig.json           # TypeScript 编译器选项
```

## 核心概念

- **Mantra (`IMantra`)**: 代表智能体可以学习的特定技能或能力。定义于 `src/interfaces/mantra.interface.ts`。
  - `id`: 唯一标识符。
  - `name`: 人类可读的名称。
  - `description`: Mantra 用途的描述。
  - `execute(ideContext?: IDEContext, rules?: IRule[], params?: any)`: 执行 Mantra 技能的方法。它可以接收 IDE 上下文、规则列表和自定义参数。

- **Agent (`IAgent`)**: 代表 IDE 中的 AI 实体。定义于 `src/interfaces/agent.interface.ts`。
  - `id`: 唯一标识符。
  - `name`: 人类可读的名称。
  - `learnedMantras`: 智能体已学习的 Mantra 列表。
  - `learnMantra(mantra: IMantra)`: 智能体学习新 Mantra 的方法。
  - `forgetMantra(mantraId: string)`: 智能体忘记 Mantra 的方法。
  - `executeMantra(mantraId: string, ideContext?: IDEContext, rules?: IRule[], params?: any)`: 智能体执行已学习 Mantra 的方法，传递 IDE 上下文、规则和参数。

- **MantraRegistry**: 一个单例类，负责注册、检索和管理所有可用的 Mantra。定义于 `src/core/mantra-registry.ts`。

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
    这将执行编译后的 `dist/index.js` 文件，该文件演示了注册 Mantra、智能体学习并使用示例 `IDEContext` 和 `IRule` 对象执行它的过程。

    或者，在开发过程中直接使用 `ts-node` 运行：
    ```bash
    npm run dev
    ```

## 后续步骤和未来增强

- [ ] **更深入地利用 `IDEContext` 和 `IRule`**:
  - 增强 `CodeFormatterMantra`，使其能够根据 `ideContext.currentFileLanguageId` 做出决策，或应用源自 `IRule` 定义的格式化选项。
  - 创建新的、从根本上由 IDE 上下文（例如 `CurrentFileAnalyzerMantra`）或规则（例如 `LinterMantra`）驱动的 Mantra。
- [ ] **开发更多样化的 `Mantra` 类型**:
  - `CodeGenerationMantra`: 根据描述生成代码片段，利用 `IDEContext` 进行放置，并利用 `IRule` 实现样式。
  - `DocStringWriterMantra`: 自动为代码元素生成文档，遵守 `IRule` 中定义的文档标准。
  - `CodeRefactorMantra`: 使用 `IDEContext`（例如，选定的代码）执行特定的重构操作。
- [ ] **提升 `Agent` 能力**:
  - 使智能体能够根据任务目标、当前的 `IDEContext` 和适用的 `IRule` 动态选择和组合 Mantra。
  - 探索智能体间的通信和协作任务执行。
- [ ] **扩展 `MantraRegistry` 功能**:
  - 实现按功能、标签或支持的上下文类型搜索/过滤 Mantra。
  - 为 Mantra 添加版本控制和依赖管理。
- [ ] **真正的 IDE 集成**: 
  - 将框架与实际的 IDE API（例如 VS Code Extension API）连接起来，用实时数据填充 `IDEContext`，并允许 Mantra 执行实际的文件操作、显示 UI 通知等。
- [ ] **规则管理系统**:
  - 设计一个用于定义、存储和检索 `IRule` 配置的系统，可能是在项目或用户级别。
- [ ] **用户界面 (UI)**:
  - 开发一个用户界面，供用户管理智能体、分配任务、配置规则和查看 Mantra 执行结果。
- [ ] **持久化**: 
  - 实现保存和加载智能体状态（包括已学习的 Mantra 和配置）的机制。
- [ ] **全面的测试**: 
  - 编写彻底的单元测试和集成测试，尤其要关注 Mantra 如何与各种 `IDEContext` 场景和 `IRule` 集交互。