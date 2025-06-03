# Mantras: An Extensible AI Agent Framework

Mantras provides a TypeScript-based framework for building AI agents designed to operate within an Integrated Development Environment (IDE). The core philosophy is to enable agents to learn, manage, and apply a diverse set of skills or tools (referred to as "Items" or "Tools", with `IMantra` as a foundational interface). This framework emphasizes modularity, allowing for clear separation between agent logic and the tools they utilize. Agents can be dynamically configured and managed, leveraging IDE-specific context and adhering to predefined rules to perform complex, context-aware, and rule-guided tasks.

The `AgentManager` is a key component responsible for loading agent configurations (e.g., from YAML files), instantiating agents, and making them available for interaction. This allows for a flexible system where agents and their capabilities can be defined and extended without modifying the core framework.

## Project Structure

```
/mantras
├── .vscode/
│   └── launch.json         # VSCode launch configuration
├── dist/                   # Compiled JavaScript files (output of tsc)
├── node_modules/           # Project dependencies
├── src/
│   ├── agents/             # Agent-specific logic and implementations
│   │   ├── core/           # Core components for agent management
│   │   │   └── agent-manager.ts # Manages loading and lifecycle of agents
│   │   │   └── base.agent.ts    # Base class for agents (if applicable)
│   │   ├── interfaces/     # Interfaces specific to agents
│   │   │   ├── agent.interface.ts    # Defines the IAgent contract
│   │   │   └── agent-config.interface.ts # Defines Agent configuration structure
│   │   ├── advisors/         # Example: Directory for advisor agents
│   │   ├── refiners/         # Example: Directory for refiner agents
│   │   └── .gitkeep
│   ├── core/               # Core framework components (shared)
│   │   └── registry.ts     # Central registry for discoverable Items/Tools
│   ├── interfaces/         # Common TypeScript interfaces
│   │   ├── ide.interface.ts   # Defines IDEContext and IRule
│   │   ├── index.ts           # Exports all common interfaces
│   │   └── registry.interface.ts # Defines registry-related interfaces
│   ├── tools/              # Tool implementations and related interfaces
│   │   ├── interfaces/     # Interfaces specific to tools/items
│   │   │   ├── mantra.interface.ts # Defines the base IMantra/IItem/ITool contract
│   │   │   └── item-config.interface.ts  # Defines Item/Tool configuration structure
│   │   └── code-formatter.tool.ts # Example Tool for code formatting
│   └── index.ts            # Main entry point and demo
├── package.json            # Project metadata and dependencies
├── README.md               # This file
└── tsconfig.json           # TypeScript compiler options
```

## Core Concepts

- **Item/Tool (`IMantra`)**: The fundamental building block representing a specific skill, capability, or tool that an Agent can learn and execute. The base interface `IMantra` is defined in `src/tools/interfaces/mantra.interface.ts`.
  - `id`: Unique identifier.
  - `name`: Human-readable name.
  - `description`: Description of the Item/Tool's purpose.
  - `execute(ideContext?: IDEContext, rules?: IRule[], params?: any)`: Method to perform the Item/Tool's function, potentially using IDE context, rules, and custom parameters.
  - `metadata` (optional): Additional information like version, tags (e.g., 'tool', 'formatter').

- **ItemConfig (`ItemConfig`)**: Defines the configuration for an Item/Tool, such as its ID, name, description, and potentially an execution path or other metadata. Defined in `src/tools/interfaces/item-config.interface.ts`.

- **Agent (`IAgent`)**: Represents an AI entity within the IDE, capable of learning and executing Items/Tools. Defined in `src/agents/interfaces/agent.interface.ts`.
  - `id`: Unique identifier.
  - `name`: Human-readable name.
  - `status`: Current status of the agent (e.g., 'active', 'idle').
  - `capabilities`: A list of capabilities or roles the agent can fulfill.
  - `learnedItems`: List of Items/Tools the Agent has learned (instances of `IMantra`).
  - `learnItem(item: IMantra)`: Method for the Agent to acquire a new Item/Tool.
  - `forgetItem(itemId: string)`: Method for the Agent to discard an Item/Tool.
  - `executeRegisteredItem(itemId: string, ideContext?: IDEContext, rules?: IRule[], params?: any)`: Method for the Agent to execute a learned Item/Tool. It can also access and execute items from the global `Registry`.

- **AgentConfig (`AgentConfig`)**: Specifies the configuration for an Agent, including its ID, name, status, capabilities, and a list of `ItemConfig` objects defining the tools it should be equipped with. Defined in `src/agents/interfaces/agent-config.interface.ts`.

- **AgentManager**: A core service responsible for discovering, loading, and managing Agents based on their configurations (e.g., from YAML files). It instantiates `IAgent` objects and makes them available for use. Implemented in `src/agents/core/agent-manager.ts`.

- **Registry**: A central repository for all available Items/Tools. Agents can query the registry to discover and potentially learn new Items/Tools. Defined in `src/core/registry.ts`.

- **IDEContext (`IDEContext`)**: An interface representing contextual information from the IDE, such as open files, selected text, cursor position, project details, etc. Defined in `src/interfaces/ide.interface.ts`.

- **Rule (`IRule`)**: An interface for defining specific rules, guidelines, or constraints that an Agent or Item/Tool should adhere to during execution. Defined in `src/interfaces/ide.interface.ts`.

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

- [ ] **Deepen `IDEContext` and `IRule` Integration**:
  - Enhance existing Tools (e.g., `CodeFormatterTool`) to make more sophisticated decisions based on `ideContext` (e.g., `currentFileLanguageId`, project settings) and apply configurations from `IRule` definitions.
  - Develop new Tools fundamentally driven by IDE context (e.g., `CurrentFileAnalyzerTool`, `ProjectRefactorAdvisorTool`) or rules (e.g., `LinterTool`, `StyleGuideEnforcerTool`).
- [ ] **Expand `Tool` Diversity and Complexity**:
  - `CodeGenerationTool`: Generates code snippets based on natural language descriptions or specifications, leveraging `IDEContext` for accurate placement and `IRule` for coding style adherence.
  - `AutomatedDocumentationTool`: Generates or updates documentation (e.g., JSDoc, TSDoc) for code elements, following standards defined in `IRule`.
  - `SmartRefactoringTool`: Performs context-aware refactoring operations (e.g., rename symbol across project, extract method) using detailed `IDEContext`.
- [ ] **Enhance `Agent` Intelligence and Autonomy**:
  - Implement more sophisticated mechanisms for Agents to dynamically select, combine, and sequence Items/Tools based on complex task goals, real-time `IDEContext`, and applicable `IRule`s.
  - Explore inter-Agent communication protocols for collaborative problem-solving.
  - Develop learning mechanisms for Agents to improve their tool selection and execution strategies over time.
- [ ] **Refine `AgentManager` and Configuration**:
  - Support more complex agent configuration scenarios, potentially including dynamic loading/unloading of agents or tools at runtime.
  - Implement robust error handling and recovery for agent initialization and execution.
- [ ] **Strengthen `Registry` Capabilities**:
  - Implement advanced searching, filtering, and tagging of Items/Tools by capabilities, supported context types, versions, or dependencies.
  - Introduce versioning and dependency management for Items/Tools to handle compatibility issues.
- [ ] **Full-fledged IDE Integration**: 
  - Integrate deeply with IDE APIs (e.g., VS Code Extension API, Language Server Protocol) to provide rich `IDEContext`, enable direct manipulation of the IDE (file operations, UI notifications, code insertions), and listen to IDE events.
- [ ] **Advanced Rule Management System**:
  - Design a flexible system for defining, storing, versioning, and retrieving `IRule` configurations at different scopes (global, project, user, agent-specific).
- [ ] **User Interface (UI) for Management and Interaction**:
  - Develop a UI within the IDE for users to manage Agents (configure, activate/deactivate), assign tasks, define or override rules, and monitor Item/Tool execution.
- [ ] **Persistence and State Management**:
  - Implement robust mechanisms to save and load Agent states, including learned Items/Tools, configurations, and operational history.
- [ ] **Comprehensive Testing Suite**:
  - Develop thorough unit, integration, and end-to-end tests, particularly focusing on Agent-Tool interactions under various `IDEContext` scenarios and `IRule` constraints.
