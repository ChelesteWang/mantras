# Mantras

Mantras will facilitate your agent's learning of the magic. This project provides a TypeScript-based framework for AI agents within an IDE to learn and apply different skills (Mantras). These Mantras can leverage IDE context and follow specific rules, allowing agents to perform context-aware and rule-guided tasks.

## Project Structure

```
/mantras
├── .vscode/
│   └── launch.json         # VSCode launch configuration
├── dist/                   # Compiled JavaScript files (output of tsc)
├── node_modules/           # Project dependencies
├── src/
│   ├── agents/             # Agent implementations
│   │   ├── core/
│   │   │   └── base.agent.ts   # Base class for agents
│   │   ├── advisors/         # Directory for advisor agents (example)
│   │   ├── refiners/         # Directory for refiner agents (example)
│   │   └── .gitkeep
│   ├── core/               # Core framework components
│   │   └── registry.ts     # Central registry for Items/Tools
│   ├── interfaces/         # TypeScript interfaces
│   │   ├── agent.interface.ts # Defines the IAgent contract
│   │   ├── ide.interface.ts   # Defines IDEContext and IRule
│   │   ├── index.ts           # Exports all interfaces
│   │   └── mantra.interface.ts# Defines the base IMantra/IItem/ITool contract
│   ├── tools/              # Tool implementations (formerly Mantras)
│   │   └── code-formatter.tool.ts # Example Tool for code formatting
│   └── index.ts            # Main entry point and demo
├── package.json            # Project metadata and dependencies
├── README.md               # This file
└── tsconfig.json           # TypeScript compiler options
```

## Core Concepts

- **Item/Tool (`IMantra` as base)**: Represents a specific skill, capability, or tool an Agent can learn and use. The base interface `IMantra` is defined in `src/interfaces/mantra.interface.ts` and serves as a foundation for more specific items or tools.
  - `id`: Unique identifier.
  - `name`: Human-readable name.
  - `description`: Description of the Item/Tool's purpose.
  - `execute(ideContext?: IDEContext, rules?: IRule[], params?: any)`: Method to execute the Item/Tool's function. It can receive IDE context, a list of rules, and custom parameters.
  - `metadata` (optional): Additional information like version, tags (e.g., 'tool', 'formatter').

- **Agent (`IAgent`)**: Represents an AI entity within the IDE. Defined in `src/interfaces/agent.interface.ts`.
  - `id`: Unique identifier.
  - `name`: Human-readable name.
  - `learnedItems`: List of Items/Tools the Agent has learned.
  - `learnItem(item: IMantra)`: Method for the Agent to learn a new Item/Tool.
  - `forgetItem(itemId: string)`: Method for the Agent to forget an Item/Tool.
  - `executeRegisteredItem(itemId: string, ideContext?: IDEContext, rules?: IRule[], params?: any)`: Method for the Agent to execute a learned Item/Tool, passing along IDE context, rules, and parameters. It can also execute items from the global registry if not learned directly.

- **Registry**: A singleton class responsible for registering, retrieving, and managing all available Items/Tools. Defined in `src/core/registry.ts`.

- **IDEContext (`IDEContext`)**: An interface representing the contextual information provided by the IDE environment. This can include details like the current workspace, open files, selected text, cursor position, etc. Defined in `src/interfaces/ide.interface.ts`.

- **Rule (`IRule`)**: An interface representing a specific rule, guideline, or constraint that an Agent or Mantra should adhere to during its execution. This allows for configurable behavior and adherence to project standards or user preferences. Defined in `src/interfaces/ide.interface.ts`.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build the Project**:
    ```bash
    npm run build
    ```
    This compiles the TypeScript code from `src` to JavaScript in the `dist` directory.

3.  **Run the Demo**:
    ```bash
    npm start
    ```
    This executes the compiled `dist/index.js` file, which demonstrates registering an Item/Tool, an Agent learning and executing it with sample `IDEContext` and `IRule` objects.

    Alternatively, to run directly with `ts-node` during development:
    ```bash
    npm run dev
    ```

## Next Steps & Future Enhancements

- [ ] **Utilize `IDEContext` and `IRule` More Deeply**:
  - Enhance `CodeFormatterMantra` to make decisions based on `ideContext.currentFileLanguageId` or apply formatting options derived from `IRule` definitions.
  - Create new Mantras that are fundamentally driven by IDE context (e.g., `CurrentFileAnalyzerMantra`) or rules (e.g., `LinterMantra`).
- [ ] **Develop More Diverse `Mantra` Types**:
  - `CodeGenerationTool`: Generates code snippets based on descriptions, leveraging `IDEContext` for placement and `IRule` for style.
  - `DocStringWriterTool`: Automatically generates documentation for code elements, adhering to documentation standards defined in `IRule`.
  - `CodeRefactorTool`: Performs specific refactoring operations using `IDEContext` (e.g., selected code).
- [ ] **Advance `Agent` Capabilities**:
  - Enable Agents to dynamically select and combine Items/Tools based on task goals, current `IDEContext`, and applicable `IRule`s.
  - Explore inter-Agent communication and collaborative task execution.
- [ ] **Expand `Registry` Features**:
  - Implement searching/filtering Items/Tools by capabilities, tags, or supported context types.
  - Add versioning and dependency management for Items/Tools.
- [ ] **Real IDE Integration**: 
  - Connect the framework with actual IDE APIs (e.g., VS Code Extension API) to populate `IDEContext` with live data and allow Items/Tools to perform real file operations, show UI notifications, etc.
- [ ] **Rule Management System**:
  - Design a system for defining, storing, and retrieving `IRule` configurations, perhaps at a project or user level.
- [ ] **User Interface (UI)**:
  - Develop a UI for users to manage Agents, assign tasks, configure rules, and view Item/Tool execution results.
- [ ] **Persistence**:
  - Implement mechanisms to save and load Agent states, including learned Items/Tools and configurations.
- [ ] **Comprehensive Testing**: 
  - Write thorough unit and integration tests, especially focusing on how Items/Tools interact with various `IDEContext` scenarios and `IRule` sets.
