# ✅ Mantras MCP Usage Instructions

## 🚀 **Usage Methods** (All Working)

### **Method 1: Direct Node (Recommended for MCP)**
```bash
# Production:
node /Users/bytedance/Desktop/trae/mantras/dist/server.js

# With custom assets:
node /Users/bytedance/Desktop/trae/mantras/dist/server.js --personas ./my-assets.json
```

### **Method 2: NPX (From Project Directory)**
```bash
# From any directory:
npm start

# Or with development:
npm run dev
```

### **Method 3: Development Mode**
```bash
# Hot-reload development:
cd /Users/bytedance/Desktop/trae/mantras
npm run dev

# Debug mode:
npm run dev:debug
```

## 🔗 **MCP Configuration**

### **Claude Community Tools (Recommended)**
```json
{
  "mcpServers": {
    "persona-summoner": {
      "command": "node",
      "args": ["/Users/bytedance/Desktop/trae/mantras/dist/server.js"],
      "env": {}
    }
  }
}
```

### **Development MCP Config**
```json
{
  "mcpServers": {
    "persona-dev": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/bytedance/Desktop/trae/mantras"
    }
  }
}
```

## 🎯 **Available Tools**

### **Core Tools:**
- `list_assets` - List all available assets including personas, prompts, and tools
- `get_asset` - Get specific asset by ID (with proper error handling)

### **Persona-Summoner Enhanced Tools:**
- `list_personas` - List all available persona definitions
- `summon_persona` - Activate a persona by ID or intent
- `summon_by_intent` - Automatic persona selection based on intent description
- `synthesize_persona` - Create combined personas from multiple sources
- `list_active_sessions` - View active persona sessions with metadata
- `release_session` - End a persona session by ID
- `get_session` - Get detailed session information by ID

### **Usage Examples:**
```bash
# Get all assets
mantras__list_assets

# Get specific persona
mantras__get_asset {"assetId": "analyst"}

# Summon by explicit ID
mantras__summon_persona {"personaId": "analyst", "intent": "business analysis"}

# Smart selection based on intent
mantras__summon_by_intent {"intent": "help me write technical documentation"}

# Create custom combined persona
mantras__synthesize_persona {"basePersonaIds": ["creative", "tech-expert"], "customName": "Creative Developer"}

# Manage sessions
mantras__list_active_sessions
mantras__release_session {"sessionId": "session_123"}
mantras__get_session {"sessionId": "session_123"}
```

## 🔧 **Testing and Quality Assurance**

### **Code Coverage (97.41% covered):**
```bash
# Run all tests with coverage
npm run coverage

# Individual test suites
npm test test/asset-repository.test.ts
npm test test/persona-summoner.test.ts
npm test test/server.test.ts
```

### **Build and Development:**
```bash
# Build from source
npm run build

# Development with hot reload
npm run dev

# Debug mode with inspector
npm run dev:debug
```

### **Troubleshooting**

#### **Build Issues:**
```bash
# Ensure clean build
npm run build -- --clean

# Check build output
ls -la dist/
```

#### **Server Issues:**
```bash
# Verify server starts
npm start -- --help

# Test server manually
echo '{"type": "list_assets"}' | npm start
```

#### **Common Problems:**
- **Asset Loading Failures**: Check if remote URLs are accessible or use local override
- **Session Management**: Use `list_active_sessions` to see active sessions
- **Type Errors**: Ensure TypeScript build succeeds before running

## ✅ **Status Verification**
```bash
# Complete verification
npm run build && npm run coverage && npm start -- --help
```

**Remember**: MCP configuration must use **absolute paths** to the `dist/server.js` file and build must succeed before use.