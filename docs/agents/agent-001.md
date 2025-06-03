# Agent: Sample Assistant Agent (ID: agent-001)

**Status:** idle
**Capabilities:**
  - code-generation
  - file-manipulation
  - information-retrieval

## Items

### Greeter Tool (ID: item-001-greet)
**Description:** A simple tool to greet the user.
**Execution Path:** `config/agents/tools/greeting-tool.ts`
**Metadata:**
```json
{
  "version": "1.0.0",
  "tags": [
    "greeting",
    "utility"
  ]
}
```

### File Reader Tool (ID: item-002-file-reader)
**Description:** Reads content from a specified file.
**Metadata:**
```json
{
  "version": "0.9.0",
  "supportedFileTypes": [
    "txt",
    "md",
    "js",
    "ts"
  ],
  "requiresPermission": "readFile"
}
```

### Code Formatter Tool (ID: item-003-code-formatter)
**Description:** Formats code according to predefined styles.
**Execution Path:** `src/tools/code-formatter.tool.ts`
**Metadata:**
```json
{
  "version": "1.2.0",
  "supportedLanguages": [
    "javascript",
    "typescript",
    "python"
  ],
  "styleGuides": [
    "prettier",
    "eslint"
  ]
}
```

