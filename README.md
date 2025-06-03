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
│   │   ├── base.agent.ts   # Base class for agents
│   │   └── .gitkeep
│   ├── core/               # Core framework components
│   │   └── mantra-registry.ts # Central registry for Mantras
│   ├── interfaces/         # TypeScript interfaces
│   │   ├── agent.interface.ts # Defines the IAgent contract
│   │   ├── ide.interface.ts   # Defines IDEContext and IRule
│   │   └── mantra.interface.ts# Defines the IMantra contract
│   ├── mantras/            # Mantra implementations
│   │   ├── code-formatter.mantra.ts # Example Mantra for code formatting
│   │   └── .gitkeep
│   └── index.ts            # Main entry point and demo
├── package.json            # Project metadata and dependencies
├── README.md               # This file
└── tsconfig.json           # TypeScript compiler options
```

## Core Concepts

- **Mantra (`IMantra`)**: Represents a specific skill or capability an Agent can learn. Defined in `src/interfaces/mantra.interface.ts`.
  - `id`: Unique identifier.
  - `name`: Human-readable name.
  - `description`: Description of the Mantra's purpose.
  - `execute(ideContext?: IDEContext, rules?: IRule[], params?: any)`: Method to execute the Mantra's skill. It can receive IDE context, a list of rules, and custom parameters.

- **Agent (`IAgent`)**: Represents an AI entity within the IDE. Defined in `src/interfaces/agent.interface.ts`.
  - `id`: Unique identifier.
  - `name`: Human-readable name.
  - `learnedMantras`: List of Mantras the Agent has learned.
  - `learnMantra(mantra: IMantra)`: Method for the Agent to learn a new Mantra.
  - `forgetMantra(mantraId: string)`: Method for the Agent to forget a Mantra.
  - `executeMantra(mantraId: string, ideContext?: IDEContext, rules?: IRule[], params?: any)`: Method for the Agent to execute a learned Mantra, passing along IDE context, rules, and parameters.

- **MantraRegistry**: A singleton class responsible for registering, retrieving, and managing all available Mantras. Defined in `src/core/mantra-registry.ts`.

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
    This executes the compiled `dist/index.js` file, which demonstrates registering a Mantra, an Agent learning and executing it with sample `IDEContext` and `IRule` objects.

    Alternatively, to run directly with `ts-node` during development:
    ```bash
    npm run dev
    ```

## Next Steps & Future Enhancements

- [ ] **Utilize `IDEContext` and `IRule` More Deeply**:
  - Enhance `CodeFormatterMantra` to make decisions based on `ideContext.currentFileLanguageId` or apply formatting options derived from `IRule` definitions.
  - Create new Mantras that are fundamentally driven by IDE context (e.g., `CurrentFileAnalyzerMantra`) or rules (e.g., `LinterMantra`).
- [ ] **Develop More Diverse `Mantra` Types**:
  - `CodeGenerationMantra`: Generates code snippets based on descriptions, leveraging `IDEContext` for placement and `IRule` for style.
  - `DocStringWriterMantra`: Automatically generates documentation for code elements, adhering to documentation standards defined in `IRule`.
  - `CodeRefactorMantra`: Performs specific refactoring operations using `IDEContext` (e.g., selected code).
- [ ] **Advance `Agent` Capabilities**:
  - Enable Agents to dynamically select and combine Mantras based on task goals, current `IDEContext`, and applicable `IRule`s.
  - Explore inter-Agent communication and collaborative task execution.
- [ ] **Expand `MantraRegistry` Features**:
  - Implement searching/filtering Mantras by capabilities, tags, or supported context types.
  - Add versioning and dependency management for Mantras.
- [ ] **Real IDE Integration**: 
  - Connect the framework with actual IDE APIs (e.g., VS Code Extension API) to populate `IDEContext` with live data and allow Mantras to perform real file operations, show UI notifications, etc.
- [ ] **Rule Management System**:
  - Design a system for defining, storing, and retrieving `IRule` configurations, perhaps at a project or user level.
- [ ] **User Interface (UI)**:
  - Develop a UI for users to manage Agents, assign tasks, configure rules, and view Mantra execution results.
- [ ] **Persistence**:
  - Implement mechanisms to save and load Agent states, including learned Mantras and configurations.
- [ ] **Comprehensive Testing**:
  - Write thorough unit and integration tests, especially focusing on how Mantras interact with various `IDEContext` scenarios and `IRule` sets.
